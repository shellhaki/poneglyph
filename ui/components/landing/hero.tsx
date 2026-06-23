"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeroGraph } from "./hero-graph";

const fade = {
  hidden: { opacity: 0, y: 16 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.06 * i, duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

export function Hero() {
  return (
    <section className="relative overflow-hidden px-4 pt-16 pb-16 sm:pt-20">
      <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-80 w-[48rem] -translate-x-1/2 rounded-full bg-accent/10 blur-[130px]" />

      <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
        <motion.h1
          custom={0}
          variants={fade}
          initial="hidden"
          animate="show"
          className="font-display text-6xl font-bold leading-[1.0] tracking-tight text-foreground sm:text-[5.25rem]"
        >
          Read any database,
          <br />
          <span className="text-accent text-glow">right in your browser.</span>
        </motion.h1>

        <motion.p
          custom={1}
          variants={fade}
          initial="hidden"
          animate="show"
          className="mt-7 max-w-xl text-lg leading-8 text-muted"
        >
          Poneglyph is a lightweight, multi-database admin viewer. Plug in
          Postgres, MySQL, Mongo, SQLite or Redis — browse records as tables or
          explore them on an interactive canvas. Nothing leaves your machine.
        </motion.p>

        <motion.div
          custom={2}
          variants={fade}
          initial="hidden"
          animate="show"
          className="mt-8 flex flex-col items-center gap-3 sm:flex-row"
        >
          <Link href="/canvas">
            <Button size="lg" className="w-full sm:w-auto">
              Open Canvas
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/docs">
            <Button variant="secondary" size="lg" className="w-full sm:w-auto">
              <BookOpen className="h-4 w-4" />
              Read the docs
            </Button>
          </Link>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto mt-16 w-full max-w-4xl"
      >
        <div className="relative rounded-2xl border border-border bg-surface/60 p-2 shadow-2xl shadow-black/10 backdrop-blur">
          <div className="flex items-center gap-1.5 px-3 py-2">
            <span className="h-2.5 w-2.5 rounded-full bg-border-strong" />
            <span className="h-2.5 w-2.5 rounded-full bg-border-strong" />
            <span className="h-2.5 w-2.5 rounded-full bg-border-strong" />
            <span className="ml-3 font-mono text-[0.7rem] text-faint">
              poneglyph · canvas · public.owners → pets → appointments
            </span>
          </div>
          <div className="h-[300px] overflow-hidden rounded-xl border border-border bg-background">
            <HeroGraph />
          </div>
        </div>
      </motion.div>
    </section>
  );
}
