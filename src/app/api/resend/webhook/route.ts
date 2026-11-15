import { readLimitedBody, recordDeliveryEvent } from '@/lib/lead-intake';
export async function POST(req: Request) {
  if(process.env.VERCEL_ENV !== 'preview')return new Response(null,{status:404});
  if(!process.env.RESEND_WEBHOOK_SECRET)return new Response(null,{status:503});
  let raw: string;
  try { raw=await readLimitedBody(req,65536); } catch { return new Response(null,{status:413}); }
  try { await recordDeliveryEvent(raw,req.headers,process.env);return new Response(null,{status:204}); }
  catch(error) {
    // Bad signatures are rejected; storage errors remain retryable by Resend.
    const invalid=error instanceof Error && /signature|timestamp|headers|base64/i.test(error.message);
    return new Response(null,{status:invalid?400:503});
  }
}
