# Advantage AI Solutions — website

Next.js 16 + Tailwind CSS 4 rebuild of advantageaisolutions.pro (migrated off Hostinger AI Builder).

## Run locally

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build
```

## Where to edit

| What | File |
|---|---|
| Email, phone, location, nav | `src/lib/site.ts` |
| Home page | `src/app/page.tsx` |
| Services page | `src/app/services/page.tsx` |
| Contact page / form | `src/app/contact/` |
| Form email delivery | `src/app/api/contact/route.ts` |
| Colors & fonts | `src/app/globals.css` |
| Logo | `src/components/Logo.tsx`, `src/app/icon.svg` |

## Contact form email (Vercel → Settings → Environment Variables)

| Variable | Example |
|---|---|
| `RESEND_API_KEY` | `re_...` from resend.com |
| `CONTACT_TO_EMAIL` | `you@yourdomain.com` (comma-separate for several) |
| `CONTACT_FROM_EMAIL` | `Website <leads@advantageaisolutions.pro>` (domain verified in Resend) |

Without these, the form shows a friendly error with the email address as a fallback.

## Moving the domain from Hostinger to Vercel

1. Vercel → project → Settings → Domains → add `advantageaisolutions.pro` and `www.advantageaisolutions.pro`.
2. Hostinger → Domains → DNS zone: point the apex `A` record to the IP Vercel shows (currently `76.76.21.21`) and `www` `CNAME` to `cname.vercel-dns.com` — use exactly the values Vercel displays.
3. Remove Hostinger's website-builder records for the domain. Leave MX/email records alone.
4. Wait for Vercel to show "Valid Configuration" (minutes to a few hours), then cancel the Hostinger builder plan if no longer needed.
