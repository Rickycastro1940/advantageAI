/**
 * Central business info. Update these values once and every page,
 * the footer, SEO metadata and structured data pick them up.
 */
export const site = {
  name: "Advantage AI Solutions",
  shortName: "Advantage AI",
  url: "https://advantageaisolutions.pro",
  tagline: "Production-ready AI automation for growing operations.",
  description:
    "Advantage AI Solutions builds production AI automations — document extraction, workflow pipelines and system integrations — for South Florida businesses and remote clients across the US.",

  email: "info@advantageaisolutions.pro",
  phone: "+1 (954) 931-3745" as string,

  location: {
    city: "Miramar",
    region: "FL",
    area: "South Florida",
    serviceNote: "Serving South Florida + remote clients across the US",
  },
  responseTime: "Within one business day",
  founder: "Ricardo Chong",
  linkedin: "https://www.linkedin.com/in/ricardo-chong-28279423",

  nav: [
    { href: "/", label: "Home" },
    { href: "/services", label: "Services" },
    { href: "/contact", label: "Contact" },
  ],
} as const;

export function telHref(phone: string) {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}
