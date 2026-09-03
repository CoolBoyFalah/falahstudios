"use client";

import { motion } from "framer-motion";

const navItems = ["Capabilities", "Work", "Approach", "Contact"];

const stats = [
  { value: "150+", label: "launches" },
  { value: "8y", label: "building brands" },
  { value: "98%", label: "retention" },
];

const services = [
  {
    title: "Brand Systems",
    text: "Identity, messaging, and positioning that make your business feel premium from the first click.",
    accent: "from-amber-400/20 to-amber-600/20",
    icon: "✦",
  },
  {
    title: "Web Experiences",
    text: "Conversion-focused websites and product experiences engineered for clarity, trust, and growth.",
    accent: "from-orange-400/20 to-yellow-500/20",
    icon: "◈",
  },
  {
    title: "Automation",
    text: "Field-tested workflows that eliminate operational drag and help your team move faster.",
    accent: "from-amber-300/20 to-orange-500/20",
    icon: "▣",
  },
  {
    title: "Content Engine",
    text: "Creative direction, storytelling, and campaign systems built to keep the brand visible and alive.",
    accent: "from-yellow-400/20 to-amber-500/20",
    icon: "◎",
  },
];

const projects = [
  {
    name: "Atlas Growth",
    category: "Brand + Web",
    metric: "+320% ROAS",
    tone: "from-amber-500/25 via-amber-400/10 to-transparent",
    badge: "Launch ready",
  },
  {
    name: "Vanta Studio",
    category: "Identity + Marketing",
    metric: "3x lead quality",
    tone: "from-slate-700/60 via-slate-800/20 to-transparent",
    badge: "Rebrand",
  },
  {
    name: "Nexa Loop",
    category: "Automation",
    metric: "4.5h saved weekly",
    tone: "from-amber-600/25 via-orange-500/10 to-transparent",
    badge: "System build",
  },
];

const process = [
  "Discover the actual problem",
  "Map the story and funnel",
  "Design the experience",
  "Ship, measure, refine",
];

const testimonials = [
  {
    quote:
      "They built a clearer brand and a sharper sales system. We looked premium and converted better within weeks.",
    author: "Sarah M.",
    role: "Founder, Vanta Studio",
  },
  {
    quote:
      "Falah Studios became the strategic partner we needed—not just a vendor. The work felt mature and commercial.",
    author: "Ali R.",
    role: "Marketing Lead, Atlas Growth",
  },
];

export default function ConceptLanding() {
  return (
    <main className="bg-[#080808] text-[#f2ede6]">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#080808]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-lg font-black text-slate-950">
              ◆
            </div>
            <div>
              <div className="text-xs uppercase tracking-[0.28em] text-amber-400">Falah</div>
              <div className="text-sm font-semibold tracking-[0.15em] text-slate-200">STUDIOS</div>
            </div>
          </div>

          <nav className="hidden items-center gap-8 md:flex">
            {navItems.map((item) => (
              <a
                key={item}
                href={item === "Contact" ? "#contact" : `#${item.toLowerCase()}`}
                className="text-sm text-slate-300 transition hover:text-amber-400"
              >
                {item}
              </a>
            ))}
          </nav>

          <a
            href="#contact"
            className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-amber-400 to-amber-600 px-5 py-2.5 text-sm font-bold text-slate-950 shadow-[0_0_35px_rgba(245,185,66,0.45)] transition hover:scale-[1.02]"
          >
            Book a call
          </a>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(245,185,66,0.18),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(245,185,66,0.12),transparent_28%)]" />

        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 pb-20 pt-16 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:px-8 lg:pb-28 lg:pt-24">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col justify-center"
          >
            <div className="mb-6 inline-flex w-fit items-center gap-3 rounded-full border border-amber-500/30 bg-amber-500/5 px-4 py-2 text-[10px] font-medium uppercase tracking-[0.24em] text-amber-300">
              <span className="h-2 w-2 rounded-full bg-amber-400" />
              Creative systems for ambitious brands
            </div>

            <h1 className="max-w-xl text-5xl font-black leading-[0.9] tracking-[-0.06em] text-white md:text-6xl lg:text-8xl">
              We build
              <span className="block bg-gradient-to-r from-amber-300 via-amber-500 to-amber-600 bg-clip-text text-transparent">
                momentum.
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300 md:text-xl">
              Strategy, branding, websites, systems, and growth infrastructure that help businesses look sharper and sell stronger.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <a
                href="#contact"
                className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-amber-400 to-amber-600 px-7 py-4 text-base font-bold text-slate-950 transition hover:scale-[1.02]"
              >
                Let’s build your next chapter
              </a>
              <a
                href="#work"
                className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-7 py-4 text-base font-semibold text-white transition hover:border-amber-400/60 hover:text-amber-300"
              >
                See our work
              </a>
            </div>

            <div className="mt-10 grid max-w-lg grid-cols-3 gap-5">
              {stats.map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                  <div className="text-2xl font-black text-amber-400">{stat.value}</div>
                  <div className="mt-1 text-[10px] uppercase tracking-[0.2em] text-slate-400">{stat.label}</div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="relative"
          >
            <div className="absolute -left-10 top-10 h-40 w-40 rounded-full bg-amber-500/15 blur-3xl" />
            <div className="absolute -right-10 bottom-8 h-48 w-48 rounded-full bg-amber-600/15 blur-3xl" />

            <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-b from-slate-900 to-slate-950 p-5 shadow-[0_0_80px_rgba(0,0,0,0.6)]">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                  <span className="h-2.5 w-2.5 rounded-full bg-white/50" />
                  <span className="h-2.5 w-2.5 rounded-full bg-white/30" />
                </div>
                <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.22em] text-amber-300">
                  live studio
                </span>
              </div>

              <div className="rounded-[22px] border border-white/10 bg-[linear-gradient(135deg,rgba(245,185,66,0.15),rgba(15,23,42,0.9))] p-5">
                <div className="mb-6 flex items-center justify-between text-sm text-slate-300">
                  <span>Campaign sprint</span>
                  <span className="text-amber-300">Q3 2026</span>
                </div>

                <div className="space-y-4">
                  <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                    <div className="mb-2 text-[10px] uppercase tracking-[0.24em] text-slate-400">Brand system</div>
                    <div className="text-2xl font-black text-white">Positioning</div>
                    <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-800">
                      <div className="h-full w-[82%] rounded-full bg-gradient-to-r from-amber-400 to-amber-600" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                      <div className="mb-2 text-[10px] uppercase tracking-[0.22em] text-slate-400">Lead flow</div>
                      <div className="text-3xl font-black text-amber-400">+47%</div>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                      <div className="mb-2 text-[10px] uppercase tracking-[0.22em] text-slate-400">Clarity</div>
                      <div className="text-3xl font-black text-white">A+</div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4">
                    <div className="flex items-center justify-between text-sm text-slate-200">
                      <span>Strategy sprint</span>
                      <span className="text-amber-300">14 days</span>
                    </div>
                    <div className="mt-3 flex gap-2">
                      {["Strategy", "Design", "Launch"].map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-amber-500/30 bg-slate-950/40 px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-amber-200"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-[#0c0c0c]">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-6 px-4 py-7 sm:px-6 lg:px-8">
          {['AER', 'NEXA', 'VANTA', 'SUMMIT', 'LUMA', 'ATLAS'].map((brand) => (
            <div key={brand} className="text-center text-xs uppercase tracking-[0.35em] text-slate-500">
              {brand}
            </div>
          ))}
        </div>
      </section>

      <section id="capabilities" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mb-12 max-w-2xl">
          <div className="mb-4 text-[10px] uppercase tracking-[0.28em] text-amber-400">Capabilities</div>
          <h2 className="text-4xl font-black leading-tight text-white md:text-5xl">
            Built for founders who want their business to feel like a premium product.
          </h2>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: index * 0.08 }}
              className={`rounded-[26px] border border-white/10 bg-gradient-to-br ${service.accent} p-[1px]`}
            >
              <div className="h-full rounded-[25px] bg-[#0a0a0a] p-6">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-xl text-amber-400">
                  {service.icon}
                </div>
                <h3 className="mb-3 text-2xl font-bold text-white">{service.title}</h3>
                <p className="text-base leading-7 text-slate-300">{service.text}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section id="approach" className="bg-[#0b0b0b] py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 max-w-2xl">
            <div className="mb-4 text-[10px] uppercase tracking-[0.28em] text-amber-400">Approach</div>
            <h2 className="text-4xl font-black text-white md:text-5xl">A system that turns chaos into clarity.</h2>
          </div>

          <div className="grid gap-5 md:grid-cols-4">
            {process.map((step, index) => (
              <div key={step} className="rounded-[24px] border border-white/10 bg-white/[0.02] p-6">
                <div className="mb-4 text-4xl font-black text-amber-400">0{index + 1}</div>
                <p className="text-lg font-medium text-slate-200">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="work" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mb-12 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-4 text-[10px] uppercase tracking-[0.28em] text-amber-400">Selected work</div>
            <h2 className="text-4xl font-black text-white md:text-5xl">Recent wins with real business impact.</h2>
          </div>
          <a href="#contact" className="text-sm uppercase tracking-[0.24em] text-amber-400 transition hover:text-amber-300">
            Start a project
          </a>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {projects.map((project, index) => (
            <motion.article
              key={project.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: index * 0.08 }}
              className="group overflow-hidden rounded-[28px] border border-white/10 bg-slate-950"
            >
              <div className={`relative h-72 overflow-hidden bg-gradient-to-br ${project.tone} p-5`}>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(245,185,66,0.2),transparent_25%)]" />
                <div className="relative flex h-full items-end justify-between">
                  <div>
                    <div className="mb-2 text-[10px] uppercase tracking-[0.24em] text-slate-300">{project.category}</div>
                    <div className="text-3xl font-black text-white">{project.name}</div>
                  </div>
                  <div className="rounded-full border border-white/15 bg-slate-950/50 px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] text-amber-300">
                    {project.badge}
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="mb-5 text-3xl font-black text-amber-400">{project.metric}</div>
                <button className="inline-flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.22em] text-white transition group-hover:text-amber-300">
                  View case study <span aria-hidden>→</span>
                </button>
              </div>
            </motion.article>
          ))}
        </div>
      </section>

      <section className="bg-[#0a0a0a] py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 max-w-2xl">
            <div className="mb-4 text-[10px] uppercase tracking-[0.28em] text-amber-400">Testimonials</div>
            <h2 className="text-4xl font-black text-white md:text-5xl">Clients come for the design. They stay for the clarity.</h2>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            {testimonials.map((item, index) => (
              <motion.blockquote
                key={item.author}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: index * 0.1 }}
                className="rounded-[26px] border border-white/10 bg-white/[0.02] p-7"
              >
                <div className="mb-5 text-3xl text-amber-400">“</div>
                <p className="text-lg leading-8 text-slate-200">{item.quote}</p>
                <footer className="mt-6 border-t border-white/10 pt-5">
                  <div className="font-bold text-white">{item.author}</div>
                  <div className="text-sm text-slate-400">{item.role}</div>
                </footer>
              </motion.blockquote>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="rounded-[32px] border border-amber-500/20 bg-gradient-to-br from-amber-500/10 via-slate-900 to-slate-950 p-8 md:p-12">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <div className="mb-4 text-[10px] uppercase tracking-[0.28em] text-amber-400">Ready when you are</div>
              <h2 className="text-4xl font-black text-white md:text-5xl">Build the kind of company people remember.</h2>
            </div>

            <div className="space-y-5">
              <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5">
                <div className="text-sm uppercase tracking-[0.22em] text-slate-400">Email</div>
                <a href="mailto:hello@falahstudios.com" className="mt-2 block text-xl font-bold text-white hover:text-amber-300">
                  hello@falahstudios.com
                </a>
              </div>

              <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5">
                <div className="text-sm uppercase tracking-[0.22em] text-slate-400">Booking</div>
                <div className="mt-2 text-xl font-bold text-white">Strategy call • 30 minutes</div>
              </div>

              <a
                href="mailto:hello@falahstudios.com"
                className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-amber-400 to-amber-600 px-7 py-4 text-base font-bold text-slate-950 transition hover:scale-[1.02]"
              >
                Start the conversation
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
