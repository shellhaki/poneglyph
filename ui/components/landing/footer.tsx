import Link from "next/link";
import { GithubIcon } from "@/components/ui/icons";
import { Logo } from "@/components/ui/logo";
import { SITE } from "@/lib/site";

const cols = [
  {
    title: "Product",
    links: [
      { label: "Canvas", href: "/canvas" },
      { label: "Features", href: "/#features" },
      { label: "Docs", href: "/docs" },
    ],
  },
  {
    title: "Project",
    links: [
      { label: "About", href: "/#about" },
      { label: "GitHub", href: SITE.repo },
      { label: "License (MIT)", href: `${SITE.repo}/blob/main/LICENSE` },
    ],
  },
  {
    title: "Sources",
    links: [
      { label: "PostgreSQL", href: "/docs" },
      { label: "MongoDB", href: "/docs" },
      { label: "Redis", href: "/docs" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-border px-6 py-14">
      <div className="mx-auto grid max-w-5xl grid-cols-2 gap-10 md:grid-cols-5">
        <div className="col-span-2">
          <Logo />
          <p className="mt-4 max-w-xs text-sm leading-6 text-muted">
            An open-source, browser-only viewer for the databases you already
            run. Read your data — nothing leaves your machine.
          </p>
          <a
            href={SITE.repo}
            target="_blank"
            rel="noreferrer"
            className="mt-5 inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted transition-colors hover:bg-surface-2 hover:text-foreground"
          >
            <GithubIcon className="h-4 w-4" />
          </a>
        </div>

        {cols.map((c) => (
          <div key={c.title}>
            <h4 className="text-[0.8rem] font-semibold uppercase tracking-wider text-faint">
              {c.title}
            </h4>
            <ul className="mt-4 space-y-2.5">
              {c.links.map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="text-sm text-muted transition-colors hover:text-foreground"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mx-auto mt-12 flex max-w-5xl flex-col items-center justify-between gap-3 border-t border-border pt-6 text-sm text-faint sm:flex-row">
        <span>© {new Date().getFullYear()} Poneglyph. MIT Licensed.</span>
        <span className="font-mono text-[0.78rem]">read · browse · visualize</span>
      </div>
    </footer>
  );
}
