"use client";

import { motion } from "motion/react";
import { PlugZap, TableProperties, Share2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const img = (id: string) =>
  `https://images.unsplash.com/photo-${id}?w=900&q=80&auto=format&fit=crop`;

const steps = [
  {
    icon: PlugZap,
    step: "01",
    title: "Connect",
    body: "Pick a database type and drop in your connection details. We test it and remember the session — locally.",
    image: img("1558494949-ef010cbdcc31"),
  },
  {
    icon: TableProperties,
    step: "02",
    title: "Browse",
    body: "Walk through tables and collections in a fast data grid. Sort, filter and hide columns as you go.",
    image: img("1555949963-aa79dcee981c"),
  },
  {
    icon: Share2,
    step: "03",
    title: "Visualize",
    body: "Flip any table onto the canvas to see records and their relationships as an interactive graph.",
    image: img("1620712943543-bcc4688e7485"),
  },
];

export function HowItWorks() {
  return (
    <section id="about" className="border-t border-border px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <div className="mx-auto max-w-2xl text-center">
          <Badge>How it works</Badge>
          <h2 className="mt-4 font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            From connection string to clarity
          </h2>
          <p className="mt-4 text-lg text-muted">
            Three steps. No accounts, no installs, no waiting.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-3">
          {steps.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={s.step}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden rounded-2xl border border-border bg-surface"
              >
                <div className="relative h-40 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={s.image}
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-cover grayscale-[0.4]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/20 to-transparent" />
                  <span className="absolute right-4 top-3 font-display text-5xl font-bold text-surface/85 mix-blend-overlay select-none">
                    {s.step}
                  </span>
                  <span className="absolute bottom-3 left-4 flex h-11 w-11 items-center justify-center rounded-xl bg-accent text-accent-contrast shadow-lg">
                    <Icon className="h-5 w-5" />
                  </span>
                </div>
                <div className="p-6">
                  <h3 className="font-display text-xl font-semibold text-foreground">
                    {s.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-muted">{s.body}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
