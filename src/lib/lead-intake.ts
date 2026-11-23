import { createHmac } from 'node:crypto';
import { Webhook } from 'svix';

type Env = Record<string, string | undefined>;
type Http = typeof fetch;
type Lead = Record<'name'|'email'|'phone'|'company'|'stack'|'message', string>;
const WINDOW_MS = 600_000;
const LIMIT = 5;
const RATE_SCRIPT = `local n = redis.call('INCR', KEYS[1])
if n == 1 then redis.call('PEXPIRE', KEYS[1], ARGV[1]) end
return {n, redis.call('PTTL', KEYS[1])}`;

function required(env: Env, key: string) {
  const value = env[key];
  if (!value) throw new Error('Missing preview intake configuration');
  return value;
}
function databaseConfig(env: Env) {
  if (env.VERCEL_ENV !== 'preview') throw new Error('Preview integration unavailable');
  const url = new URL(required(env, 'SUPABASE_URL'));
  if (url.protocol !== 'https:' || !url.hostname.endsWith('.supabase.co')) throw new Error('Invalid database URL');
  return { url: url.origin, key: required(env, 'SUPABASE_SECRET_KEY') };
}
async function db(path: string, method: string, body: unknown, env: Env, http: Http) {
  const {url,key} = databaseConfig(env);
  const headers: Record<string,string> = {apikey:key,'Content-Type':'application/json',Prefer:'return=minimal'};
  // New secret keys use apikey; legacy service-role JWTs also need Authorization.
  if (!key.startsWith('sb_secret_')) headers.Authorization = `Bearer ${key}`;
  const response = await http(`${url}/rest/v1/${path}`, {method,headers,body:JSON.stringify(body),cache:'no-store',signal:AbortSignal.timeout(8000)});
  if (!response.ok) throw new Error('Inquiry persistence unavailable');
}

export async function readLimitedBody(req: Request, max: number) {
  const reader = req.body?.getReader();
  if (!reader) return '';
  const chunks: Uint8Array[]=[]; let size=0;
  try {
    while (true) {
      const {done,value}=await reader.read(); if(done)break;
      size+=value.byteLength;
      if(size>max){await reader.cancel();throw new Error('Request too large');}
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const all=new Uint8Array(size);let offset=0;
  for(const chunk of chunks){all.set(chunk,offset);offset+=chunk.length;}
  return new TextDecoder().decode(all);
}

export async function rateLimit(ip: string, env: Env, http: Http = fetch) {
  if(env.VERCEL_ENV !== 'preview')throw new Error('Preview integration unavailable');
  const url = new URL(required(env,'UPSTASH_REDIS_REST_URL'));
  if(url.protocol!=='https:' || !url.hostname.endsWith('.upstash.io'))throw new Error('Invalid Redis URL');
  const token=required(env,'UPSTASH_REDIS_REST_TOKEN');
  const hash=createHmac('sha256',required(env,'RATE_LIMIT_HMAC_SECRET')).update(ip).digest('hex');
  const response=await http(url.origin,{method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:JSON.stringify(['EVAL',RATE_SCRIPT,'1',`advantage:preview:contact:${hash}`,String(WINDOW_MS)]),cache:'no-store',signal:AbortSignal.timeout(5000)});
  if(!response.ok)throw new Error('Rate limiting unavailable');
  const data=await response.json();
  if(data.error || !Array.isArray(data.result) || data.result.length!==2 || !data.result.every((v:unknown)=>typeof v==='number' && Number.isFinite(v)) || data.result[0]<1 || data.result[1]<0)throw new Error('Invalid rate limit response');
  return {allowed:data.result[0]<=LIMIT,retryAfter:Math.max(1,Math.ceil(data.result[1]/1000))};
}

export async function intake(lead: Lead, ip: string, env: Env, http: Http = fetch) {
  databaseConfig(env);
  const resend=required(env,'RESEND_API_KEY');
  const from=required(env,'CONTACT_FROM_EMAIL');
  const to=required(env,'CONTACT_TO_EMAIL');
  const limited=await rateLimit(ip,env,http);
  if(!limited.allowed)return {status:429,retryAfter:limited.retryAfter};
  const inquiryId=crypto.randomUUID();
  await db('inquiries','POST',{id:inquiryId,...lead,status:'queued'},env,http);
  const update=(body:unknown)=>db(`inquiries?id=eq.${inquiryId}`,'PATCH',body,env,http);
  let response: Response;
  try {
    response=await http('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${resend}`,'Content-Type':'application/json','Idempotency-Key':`inquiry/${inquiryId}`},body:JSON.stringify({from,to:to.split(',').map(x=>x.trim()).filter(Boolean),reply_to:lead.email,subject:`New operations review request [${inquiryId}]`,text:Object.entries(lead).map(([k,v])=>`${k}: ${v}`).join('\n')}),signal:AbortSignal.timeout(10000)});
  } catch {
    await update({status:'send_unknown'});
    return {status:502,inquiryId};
  }
  if(!response.ok){await update({status:'send_failed'});return {status:502,inquiryId};}
  let emailId:unknown;
  try {emailId=(await response.json()).id;}catch { /* ambiguous provider response */ }
  if(typeof emailId!=='string'||!emailId){await update({status:'send_unknown'});return {status:502,inquiryId};}
  // Provider acceptance is not delivery. Signed webhook events establish delivery.
  await update({status:'accepted',provider_email_id:emailId});
  return {status:200,inquiryId};
}

export async function recordDeliveryEvent(payload: string, headers: Headers, env: Env, http: Http=fetch) {
  databaseConfig(env);
  const secret=required(env,'RESEND_WEBHOOK_SECRET');
  const svixId=headers.get('svix-id')||'';
  new Webhook(secret).verify(payload,{'svix-id':svixId,'svix-timestamp':headers.get('svix-timestamp')||'','svix-signature':headers.get('svix-signature')||''});
  const event=JSON.parse(payload) as {type?:string;created_at?:string;data?:{email_id?:string}};
  const allowed=['email.sent','email.delivered','email.delivery_delayed','email.bounced','email.complained','email.failed','email.suppressed'];
  if(!event.type || !allowed.includes(event.type))return;
  if(!event.data?.email_id || !event.created_at || !Number.isFinite(Date.parse(event.created_at)))throw new Error('Invalid delivery event');
  const {url,key}=databaseConfig(env);
  const auth:Record<string,string>={apikey:key,'Content-Type':'application/json',Prefer:'resolution=ignore-duplicates,return=minimal'};
  if(!key.startsWith('sb_secret_'))auth.Authorization=`Bearer ${key}`;
  const response=await http(`${url}/rest/v1/inquiry_delivery_events?on_conflict=event_id`,{method:'POST',headers:auth,body:JSON.stringify({event_id:svixId,provider_email_id:event.data.email_id,event_type:event.type,occurred_at:event.created_at}),cache:'no-store',signal:AbortSignal.timeout(8000)});
  if(!response.ok)throw new Error('Delivery event persistence unavailable');
}
