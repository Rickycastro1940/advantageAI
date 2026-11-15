import { test } from 'node:test';
import assert from 'node:assert/strict';
import { intake, rateLimit, readLimitedBody, recordDeliveryEvent } from '../src/lib/lead-intake';
const env = { VERCEL_ENV: 'preview', SUPABASE_URL: 'https://preview.supabase.co', SUPABASE_SECRET_KEY: 'secret', UPSTASH_REDIS_REST_URL: 'https://preview.upstash.io', UPSTASH_REDIS_REST_TOKEN: 'token', RATE_LIMIT_HMAC_SECRET: 'test-only-secret', RESEND_API_KEY: 'resend', CONTACT_TO_EMAIL: 'delivered@resend.dev', CONTACT_FROM_EMAIL: 'Test <test@example.com>' };
const lead = { name:'Synthetic', email:'test@example.com', message:'Integration test', phone:'', company:'', stack:'' };
test('preview intake fails closed before network use when credentials are absent', async()=> {
 let calls=0;
 await assert.rejects(()=>intake(lead,'127.0.0.1',{},async()=>{calls++; return new Response();}));
 assert.equal(calls,0);
});
test('distributed limit returns retry delay and never sends an email when denied', async()=> {
 const calls:string[]=[];
 const result=await intake(lead,'127.0.0.1',env,async(url)=>{calls.push(String(url));return Response.json({result:[6,42000]});});
 assert.equal(result.status,429); assert.equal(result.retryAfter,42); assert.equal(calls.length,1);
});
test('persistence failure prevents sending',async()=>{
 const calls:string[]=[];
 await assert.rejects(()=>intake(lead,'127.0.0.1',env,async(url)=>{calls.push(String(url)); return calls.length===1 ? Response.json({result:[1,600000]}):new Response('',{status:503});}));
 assert.equal(calls.length,2); assert.ok(calls[1].includes('/rest/v1/inquiries'));
});
test('success persists before send and stores provider ID as accepted, never delivered',async()=>{
 const calls:{url:string,body:any}[]=[];
 const result=await intake(lead,'127.0.0.1',env,async(url,init)=>{
 calls.push({url:String(url),body:JSON.parse(String(init?.body))});
 if(calls.length===1)return Response.json({result:[1,600000]});
 if(String(url).includes('resend.com'))return Response.json({id:'email_123'});
 return new Response(null,{status:204});
 });
 assert.equal(result.status,200); assert.ok(result.inquiryId);
 assert.equal(calls[1].body.status,'queued'); assert.ok(calls[2].url.includes('api.resend.com'));
 assert.equal(calls[3].body.status,'accepted'); assert.equal(calls[3].body.provider_email_id,'email_123');
});
test('send timeout is recorded as unknown, not falsely failed or delivered',async()=>{
 const updates:any[]=[];
 const result=await intake(lead,'127.0.0.1',env,async(url,init)=>{
 if(String(url).includes('upstash'))return Response.json({result:[1,600000]});
 if(String(url).includes('resend'))throw new Error('timeout');
 updates.push(JSON.parse(String(init?.body)));return new Response(null,{status:204});
 });
 assert.equal(result.status,502);assert.equal(updates.at(-1).status,'send_unknown');
});
test('limiter rejects corrupt backend responses',async()=>{
 await assert.rejects(()=>rateLimit('127.0.0.1',env,async()=>Response.json({result:null})));
});
test('stream body limit works without content-length',async()=>{
 const req=new Request('https://example.com',{method:'POST',body:'x'.repeat(17000)});
 await assert.rejects(()=>readLimitedBody(req,16384));
});
test('webhook persistence rejects forged signatures without touching database',async()=>{
 let calls=0;
 await assert.rejects(()=>recordDeliveryEvent('{}',new Headers(),{...env,RESEND_WEBHOOK_SECRET:'whsec_dGVzdA=='},async()=>{calls++;return new Response();}));
 assert.equal(calls,0);
});

test('signed delivery event persists minimum fields and uses replay-safe insert',async()=>{
 const { Webhook }=await import('svix');
 const secret='whsec_dGVzdA==';const now=new Date();const id='msg_delivery_test';
 const payload=JSON.stringify({type:'email.delivered',created_at:now.toISOString(),data:{email_id:'email_123',to:['private@example.com']}});
 const headers=new Headers({'svix-id':id,'svix-timestamp':String(Math.floor(now.getTime()/1000)),'svix-signature':new Webhook(secret).sign(id,now,payload)});
 const calls:any[]=[];
 await recordDeliveryEvent(payload,headers,{...env,RESEND_WEBHOOK_SECRET:secret},async(url,init)=>{calls.push({url:String(url),init});return new Response(null,{status:204});});
 assert.equal(calls.length,1);assert.ok(calls[0].url.includes('on_conflict=event_id'));
 assert.deepEqual(JSON.parse(calls[0].init.body),{event_id:id,provider_email_id:'email_123',event_type:'email.delivered',occurred_at:now.toISOString()});
});

test('provider rejection is persisted as send_failed',async()=>{
 const updates:any[]=[];
 const result=await intake(lead,'127.0.0.1',env,async(url,init)=>{
 if(String(url).includes('upstash'))return Response.json({result:[1,600000]});
 if(String(url).includes('resend'))return new Response(null,{status:422});
 updates.push(JSON.parse(String(init?.body)));return new Response(null,{status:204});
 });assert.equal(result.status,502);assert.equal(updates.at(-1).status,'send_failed');
});

test('production cannot use preview credentials',async()=>{
 let calls=0;
 await assert.rejects(()=>intake(lead,'127.0.0.1',{...env,VERCEL_ENV:'production'},async()=>{calls++;return new Response();}));
 assert.equal(calls,0);
});
