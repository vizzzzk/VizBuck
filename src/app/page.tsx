
"use client"

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, LineChart, Globe2, Sparkles, Users2, Building2, PhoneCall, Mail, MapPin } from "lucide-react";

// Fortune 500–style one-page corporate landing
// Tailwind CSS required. Drop this into a Next.js/React project.
// Palette: Deep Navy (#0B1220), Slate (#111827/#1F2937), Accents (Warm Gold #C5A46D), Soft Gray (#9CA3AF)

export default function FortuneLanding() {
  return (
    <div className="min-h-screen bg-[#0B1220] text-white selection:bg-[#C5A46D]/40 selection:text-white">
      {/* Top bar */}
      <header className="sticky top-0 z-40 w-full backdrop-blur supports-[backdrop-filter]:bg-[#0B1220]/70">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#C5A46D] to-amber-700" />
              <span className="text-lg font-semibold tracking-wide">VizBuck</span>
            </div>
            <nav className="hidden items-center gap-8 text-sm md:flex">
              <a className="text-gray-300 hover:text-white" href="#solutions">Solutions</a>
              <a className="text-gray-300 hover:text-white" href="#industries">Industries</a>
              <a className="text-gray-300 hover:text-white" href="#resources">Resources</a>
              <a className="text-gray-300 hover:text-white" href="#about">About</a>
            </nav>
            <div className="flex items-center gap-3">
              <a href="#contact" className="hidden rounded-xl border border-white/10 px-4 py-2 text-sm text-gray-200 hover:bg-white/5 md:block">Contact Sales</a>
              <Link href="/login" className="inline-flex items-center gap-2 rounded-xl bg-[#C5A46D] px-4 py-2 text-sm font-semibold text-[#0B1220] hover:brightness-110">
                Request Demo <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-24 left-1/2 h-96 w-[1200px] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(197,164,109,0.25),transparent_60%)] blur-3xl" />
        </div>
        <div className="mx-auto max-w-7xl px-6 pt-20 pb-14 md:pt-28 md:pb-20">
          <div className="grid items-center gap-10 md:grid-cols-2">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <h1 className="text-4xl font-semibold leading-tight md:text-5xl">
                Enterprise AI that <span className="bg-gradient-to-r from-white to-[#C5A46D] bg-clip-text text-transparent">moves markets</span>
              </h1>
              <p className="mt-5 max-w-xl text-gray-300">
                VizBuck delivers secure, compliant AI automation built for global scale. Accelerate decision-making, reduce risk, and unlock operational excellence across your portfolio.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link href="/login" className="inline-flex items-center gap-2 rounded-2xl bg-[#C5A46D] px-5 py-3 font-medium text-[#0B1220] hover:brightness-110">
                  Book a Live Demo <ArrowRight className="h-4 w-4" />
                </Link>
                <a href="#security" className="rounded-2xl border border-white/10 px-5 py-3 font-medium text-gray-200 hover:bg-white/5">
                  Read Security Brief
                </a>
              </div>
              <div className="mt-8 flex items-center gap-6 text-sm text-gray-400">
                <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-[#C5A46D]"/> SOC 2 / ISO 27001</div>
                <div className="flex items-center gap-2"><Globe2 className="h-4 w-4 text-[#C5A46D]"/> Global data residency</div>
                <div className="flex items-center gap-2"><Users2 className="h-4 w-4 text-[#C5A46D]"/> SSO & SCIM</div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="relative">
              <div className="relative rounded-3xl border border-white/10 bg-gradient-to-b from-[#0F1628] to-[#0B1220] p-6 shadow-2xl">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-sm text-gray-400">Financial Planning & Analysis</span>
                  <Sparkles className="h-4 w-4 text-[#C5A46D]" />
                </div>
                <div className="space-y-4">
                  <p className="text-gray-300">Visualize your financial future. Track liquidity, manage reserves, and forecast net worth with our enterprise-grade AI platform.</p>
                   <div className="mt-5 flex items-center gap-2 text-sm text-gray-400">
                     <LineChart className="h-4 w-4 text-[#C5A46D]"/> Real-time dashboards & alerts
                   </div>
                </div>

              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <section className="border-y border-white/10 bg-[#0F1628]">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <div className="mb-6 text-center text-xs uppercase tracking-widest text-gray-400">Trusted by leaders across finance, healthcare, and technology</div>
          <div className="grid grid-cols-2 gap-6 opacity-80 sm:grid-cols-3 md:grid-cols-6">
            {["Novacore","HelixLabs","Aurelius","NorthPeak","Veridian","Omnia"].map((brand) => (
              <div key={brand} className="flex items-center justify-center rounded-xl border border-white/5 bg-white/5 px-4 py-3 text-sm text-gray-300">
                {brand}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solutions */}
      <section id="solutions" className="mx-auto max-w-7xl px-6 py-16 md:py-20">
        <div className="mb-10 flex items-end justify-between gap-6">
          <div>
            <h2 className="text-3xl font-semibold">Solutions built for scale</h2>
            <p className="mt-2 max-w-2xl text-gray-300">From strategy to execution, deploy AI safely across mission-critical workflows—governed, auditable, and enterprise-ready.</p>
          </div>
          <a href="#demo" className="hidden rounded-xl border border-white/10 px-4 py-2 text-sm text-gray-200 hover:bg-white/5 md:block">See a guided tour</a>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              icon: <ShieldCheck className="h-5 w-5 text-[#C5A46D]"/>,
              title: "Compliance & Security",
              desc: "Policy enforcement, PII redaction, role-based guardrails, full audit trails.",
            },
            {
              icon: <LineChart className="h-5 w-5 text-[#C5A46D]"/>,
              title: "Analytics & Forecasting",
              desc: "Stream real-time signals, enrich with context, and forecast with confidence.",
            },
            {
              icon: <Globe2 className="h-5 w-5 text-[#C5A46D]"/>,
              title: "Global Orchestration",
              desc: "Multi-region deployments, data residency controls, and enterprise SSO/SCIM.",
            },
          ].map((card, i) => (
            <div key={i} className="group rounded-3xl border border-white/10 bg-gradient-to-b from-white/5 to-white/0 p-6 transition hover:border-[#C5A46D]/50">
              <div className="mb-3 flex items-center gap-2 text-sm text-gray-300">{card.icon}<span>{card.title}</span></div>
              <p className="text-gray-300">{card.desc}</p>
              <div className="mt-4 h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent"/>
              <a href="#" className="mt-4 inline-flex items-center gap-2 text-sm text-[#C5A46D] opacity-90 hover:opacity-100">Learn more <ArrowRight className="h-4 w-4"/></a>
            </div>
          ))}
        </div>
      </section>

      {/* Case study / Stats */}
      <section className="border-t border-white/10 bg-[#0F1628]">
        <div className="mx-auto max-w-7xl px-6 py-16 md:py-20">
          <div className="grid items-center gap-10 md:grid-cols-2">
            <div>
              <h3 className="text-2xl font-semibold">Outcomes that scale</h3>
              <p className="mt-3 max-w-xl text-gray-300">Global conglomerate reduced operational risk while accelerating insight velocity across 28 markets. A unified governance layer enabled safe, compliant AI adoption.</p>
              <ul className="mt-6 space-y-3 text-gray-300">
                <li className="flex items-start gap-3"><span className="mt-1 inline-block h-2 w-2 rounded-full bg-[#C5A46D]"/> 95% policy adherence across business units</li>
                <li className="flex items-start gap-3"><span className="mt-1 inline-block h-2 w-2 rounded-full bg-[#C5A46D]"/> 42% faster time-to-insight for executive reports</li>
                <li className="flex items-start gap-3"><span className="mt-1 inline-block h-2 w-2 rounded-full bg-[#C5A46D]"/> 3.1× improvement in analyst productivity</li>
              </ul>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {[
                { label: "Markets", value: "28" },
                { label: "Teams onboarded", value: "120+" },
                { label: "Model providers", value: "8" },
                { label: "Data connectors", value: "40+" },
              ].map((s, i) => (
                <div key={i} className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
                  <div className="text-3xl font-semibold text-white">{s.value}</div>
                  <div className="mt-1 text-xs uppercase tracking-widest text-gray-400">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Industries */}
      <section id="industries" className="mx-auto max-w-7xl px-6 py-16 md:py-20">
        <h3 className="text-2xl font-semibold">Built for regulated industries</h3>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {[
            { icon: <Building2 className="h-5 w-5"/>, title: "Financial Services", desc: "Trader copilots, KYC/AML, portfolio insights." },
            { icon: <Users2 className="h-5 w-5"/>, title: "Healthcare", desc: "Clinical summarization, RCM automation, PHI guardrails." },
            { icon: <Globe2 className="h-5 w-5"/>, title: "Public Sector", desc: "Citizen services, secure knowledge access, auditability." },
          ].map((x, i) => (
            <div key={i} className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/5 to-white/0 p-6">
              <div className="mb-2 inline-flex items-center gap-2 text-[#C5A46D]">{x.icon}<span className="text-sm text-gray-300">{x.title}</span></div>
              <p className="text-gray-300">{x.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative border-t border-white/10 bg-[#0F1628]">
        <div className="mx-auto max-w-7xl px-6 py-16 md:py-20">
          <div className="grid items-center gap-8 md:grid-cols-2">
            <div>
              <h3 className="text-2xl font-semibold">See VizBuck in action</h3>
              <p className="mt-2 max-w-xl text-gray-300">Schedule a 30‑minute session with our solution architects. We’ll tailor a live demo to your security and compliance requirements.</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/login" className="inline-flex items-center gap-2 rounded-2xl bg-[#C5A46D] px-5 py-3 font-medium text-[#0B1220] hover:brightness-110">Request Demo <ArrowRight className="h-4 w-4"/>
                </Link>
                <a href="#contact" className="rounded-2xl border border-white/10 px-5 py-3 font-medium text-gray-200 hover:bg-white/5">Talk to Sales</a>
              </div>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <div className="mb-4 text-sm text-gray-300">Contact</div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center gap-3 text-gray-300"><PhoneCall className="h-4 w-4 text-[#C5A46D]"/> +1 (415) 555‑0199</div>
                <div className="flex items-center gap-3 text-gray-300"><Mail className="h-4 w-4 text-[#C5A46D]"/> sales@vizbuck.com</div>
                <div className="flex items-center gap-3 text-gray-300 md:col-span-2"><MapPin className="h-4 w-4 text-[#C5A46D]"/> 123 Market Street, San Francisco, CA</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="about" className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <div className="mb-3 flex items-center gap-3">
                <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-[#C5A46D] to-amber-700" />
                <span className="font-semibold">VizBuck</span>
              </div>
              <p className="text-sm text-gray-400">Secure, compliant AI for global enterprises.</p>
            </div>
            <div>
              <div className="mb-3 text-sm font-semibold text-gray-200">Company</div>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a className="hover:text-white" href="#about">About</a></li>
                <li><a className="hover:text-white" href="#careers">Careers</a></li>
                <li><a className="hover:text-white" href="#press">Press</a></li>
              </ul>
            </div>
            <div>
              <div className="mb-3 text-sm font-semibold text-gray-200">Resources</div>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a className="hover:text-white" href="#resources">Docs</a></li>
                <li><a className="hover:text-white" href="#security">Security</a></li>
                <li><a className="hover:text-white" href="#legal">Legal</a></li>
              </ul>
            </div>
            <div>
              <div className="mb-3 text-sm font-semibold text-gray-200">Subscribe</div>
              <form className="flex gap-2">
                <input placeholder="Work email" className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#C5A46D]/40" />
                <button className="rounded-xl bg-[#C5A46D] px-4 text-sm font-semibold text-[#0B1220] hover:brightness-110">Join</button>
              </form>
            </div>
          </div>
          <div className="mt-10 flex items-center justify-between border-t border-white/10 pt-6 text-xs text-gray-500">
            <span>© {new Date().getFullYear()} VizBuck, Inc. All rights reserved.</span>
            <div className="flex items-center gap-4">
              <a className="hover:text-gray-300" href="#privacy">Privacy</a>
              <a className="hover:text-gray-300" href="#terms">Terms</a>
              <a className="hover:text-gray-300" href="#cookies">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
