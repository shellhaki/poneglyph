"use client";

import { motion } from "motion/react";
import {
  Globe,
  ShieldCheck,
  Table2,
  Workflow,
  Download,
  Layers3,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Feature {
  icon: LucideIcon;
  title: string;
  body: string;
  image: string;
}

const img = (id: string) =>
  `https://images.unsplash.com/photo-${id}?w=900&q=80&auto=format&fit=crop`;

const features: Feature[] = [
  {
    icon: Globe,
    title: "Lives in the browser",
    body: "No desktop install, no agent. Open a tab and you're connected. Works anywhere a browser does.",
    image: img("1633356122544-f134324a6cee"),
  },
  {
    icon: ShieldCheck,
    title: "No signup, no servers",
    body: "Sessions are stored locally on your device. Your credentials and data never touch a third party.",
    image: img("1666875753105-c63a6f3bdc86"),
  },
  {
    icon: Layers3,
    title: "Truly multi-database",
    body: "Postgres, MySQL/MariaDB, MongoDB, SQLite and Redis behind one consistent, calm interface.",
    image: img("1605379399642-870262d3d051"),
  },
  {
    icon: Table2,
    title: "A real data grid",
    body: "Sort, filter, hide columns and page through records in a fast, spreadsheet-grade table.",
    image: img("1460925895917-afdab827c52f"),
  },
  {
    icon: Workflow,
    title: "Interactive canvas",
    body: "Don't like tables? Explore records and their relationships as a pannable node graph.",
    image: img("1593720213428-28a5b9e94613"),
  },
  {
    icon: Download,
    title: "Export anywhere",
    body: "Pull any result set out as JSON or CSV in a click — perfect for quick reports and sharing.",
    image: img("1639322537228-f710d846310a"),
  },
];

export function FeatureGrid() {
  return (
    <section id="features" className="px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <div className="mx-auto max-w-2xl text-center">
          <Badge accent>Features</Badge>
          <h2 className="mt-4 font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Everything you need to read your data
          </h2>
          <p className="mt-4 text-lg text-muted">
            Built for the moments you just need to look — without spinning up a
            heavyweight admin tool.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.45, delay: (i % 3) * 0.06, ease: [0.22, 1, 0.36, 1] }}
                className="group overflow-hidden rounded-2xl border border-border bg-surface transition-colors hover:border-border-strong"
              >
                <div className="relative h-44 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={f.image}
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-cover grayscale-[0.35] transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/30 to-transparent" />
                  <span className="absolute bottom-3 left-3 flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface/90 text-accent backdrop-blur">
                    <Icon className="h-5 w-5" />
                  </span>
                </div>
                <div className="p-5">
                  <h3 className="font-display text-base font-semibold text-foreground">
                    {f.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-muted">{f.body}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
