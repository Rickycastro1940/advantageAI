import { unmatchedStatus } from "./retry-policy.js";
import { Webhook } from "npm:svix@2.10.0";
Deno.serve(async (req) => {
 if(req.method!=="POST")return new Response(null,{status:405});
 const secret=Deno.env.get("RESEND_WEBHOOK_SECRET");
 if(!secret)return new Response(null,{status:503});
 const reader=req.body?.getReader(); if(!reader)return new Response(null,{status:400});
 let raw="";let size=0;const decoder=new TextDecoder();
 try {while(true){const {value,done}=await reader.read();if(done)break;size+=value.byteLength;if(size>65536){await reader.cancel();return new Response(null,{status:413});}raw+=decoder.decode(value,{stream:true});}raw+=decoder.decode();}catch{return new Response(null,{status:400});}
 let event;
 try {new Webhook(secret).verify(raw,{"svix-id":req.headers.get("svix-id")||"","svix-timestamp":req.headers.get("svix-timestamp")||"","svix-signature":req.headers.get("svix-signature")||""});event=JSON.parse(raw);}catch{return new Response(null,{status:400});}
 const allowed=["email.sent","email.delivered","email.delivery_delayed","email.bounced","email.complained","email.failed","email.suppressed"];
 if(!allowed.includes(event.type))return new Response(null,{status:204});
 if(typeof event.data?.email_id!=="string"||!event.created_at||!Number.isFinite(Date.parse(event.created_at)))return new Response(null,{status:400});
 const url=Deno.env.get("SUPABASE_URL");const key=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
 try {
 // Ignore unrelated account email events. Resend can emit production events to
 // every webhook; only preview inquiries in this isolated database qualify.
 const match=await fetch(url+"/rest/v1/inquiries?select=id&provider_email_id=eq."+encodeURIComponent(event.data.email_id),{headers:{apikey:key,Authorization:"Bearer "+key},signal:AbortSignal.timeout(8000)});
 if(!match.ok)return new Response(null,{status:503});
 if(!(await match.json()).length)return new Response(null,{status:unmatchedStatus(event.created_at)}); // Bounded race retry; unrelated events are never persisted.
 const saved=await fetch(url+"/rest/v1/inquiry_delivery_events?on_conflict=event_id",{method:"POST",headers:{apikey:key,Authorization:"Bearer "+key,"Content-Type":"application/json",Prefer:"resolution=ignore-duplicates,return=minimal"},body:JSON.stringify({event_id:req.headers.get("svix-id"),provider_email_id:event.data.email_id,event_type:event.type,occurred_at:event.created_at}),signal:AbortSignal.timeout(8000)});
 return new Response(null,{status:saved.ok?204:503});
 }catch{return new Response(null,{status:503});}
});
