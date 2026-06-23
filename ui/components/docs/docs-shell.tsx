"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

interface Section {
  id: string;
  title: string;
}

export function DocsShell({
  sections,
  children,
}: {
  sections: Section[];
  children: React.ReactNode;
}) {
  const [active, setActive] = useState(sections[0]?.id);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: "-20% 0px -70% 0px" },
    );
    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [sections]);

  return (
    <div className="mx-auto flex max-w-5xl gap-12 px-6 py-12">
      <aside className="hidden w-48 shrink-0 lg:block">
        <div className="sticky top-24">
          <p className="mb-3 text-[0.72rem] font-semibold uppercase tracking-wider text-faint">
            On this page
          </p>
          <nav className="flex flex-col gap-0.5 border-l border-border">
            {sections.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className={cn(
                  "-ml-px border-l-2 py-1.5 pl-3 text-sm transition-colors",
                  active === s.id
                    ? "border-accent font-medium text-accent"
                    : "border-transparent text-muted hover:text-foreground",
                )}
              >
                {s.title}
              </a>
            ))}
          </nav>
        </div>
      </aside>
      <article className="min-w-0 flex-1">{children}</article>
    </div>
  );
}
