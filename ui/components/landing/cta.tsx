"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Cta() {
  return (
    <section className="px-6 py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl border border-border bg-surface px-8 py-16 text-center"
      >
        <div className="pointer-events-none absolute left-1/2 top-0 h-48 w-[36rem] -translate-x-1/2 rounded-full bg-accent/15 blur-[100px]" />
        <div className="relative">
          <h2 className="mx-auto max-w-2xl font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Your database is one tab away.
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-lg text-muted">
            No download. No account. Open the canvas and connect in seconds.
          </p>
          <Link href="/canvas" className="mt-8 inline-block">
            <Button size="lg">
              Open Canvas
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
