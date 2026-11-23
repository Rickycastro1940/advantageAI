import { test } from 'node:test';
import assert from 'node:assert/strict';
import { POST } from '../src/app/api/contact/route';
import { POST as webhook } from '../src/app/api/resend/webhook/route';
process.env.VERCEL_ENV='preview';
test('contact rejects JSON lookalike content types',async()=>{
 const res=await POST(new Request('https://preview.example/api/contact',{method:'POST',headers:{'content-type':'application/json-evil'},body:'{}'}));
 assert.equal(res.status,415);
});
test('oversized streamed request returns 413',async()=>{
 const res=await POST(new Request('https://preview.example/api/contact',{method:'POST',headers:{'content-type':'application/json'},body:'x'.repeat(17000)}));assert.equal(res.status,413);
});
test('missing preview configuration returns 503, never success',async()=>{
 const res=await POST(new Request('https://preview.example/api/contact',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({name:'Synthetic',email:'test@example.com',message:'Configuration test'})}));assert.equal(res.status,503);
});
test('webhook disabled in production',async()=>{
 process.env.VERCEL_ENV='production';
 try { assert.equal((await webhook(new Request('https://example.com',{method:'POST',body:'{}'}))).status,404); }
 finally {process.env.VERCEL_ENV='preview';}
});
