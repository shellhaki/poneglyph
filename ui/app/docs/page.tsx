import type { Metadata } from "next";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { DocsShell } from "@/components/docs/docs-shell";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Docs — Poneglyph",
  description: "How to connect, browse and visualize your databases with Poneglyph.",
};

const sections = [
  { id: "introduction", title: "Introduction" },
  { id: "quick-start", title: "Quick start" },
  { id: "connecting", title: "Connecting a source" },
  { id: "sessions", title: "Sessions & privacy" },
  { id: "table-view", title: "Table view" },
  { id: "graph-view", title: "Graph view" },
  { id: "exporting", title: "Exporting" },
  { id: "api", title: "API" },
];

function H({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2
      id={id}
      className="mt-14 scroll-mt-24 font-display text-2xl font-bold tracking-tight text-foreground first:mt-0"
    >
      {children}
    </h2>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="mt-4 leading-7 text-muted">{children}</p>;
}

function Code({ children }: { children: React.ReactNode }) {
  return (
    <code className="rounded-md border border-border bg-surface-2 px-1.5 py-0.5 font-mono text-[0.85em] text-foreground">
      {children}
    </code>
  );
}

export default function DocsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <header className="border-b border-border px-6 pt-16 pb-10">
          <div className="mx-auto max-w-5xl">
            <Badge accent>Documentation</Badge>
            <h1 className="mt-4 font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Poneglyph docs
            </h1>
            <p className="mt-3 max-w-xl text-lg text-muted">
              Connect a database, browse your records, and explore them on an
              interactive canvas — all without leaving the browser.
            </p>
          </div>
        </header>

        <DocsShell sections={sections}>
          <H id="introduction">Introduction</H>
          <P>
            Poneglyph is a lightweight, open-source viewer for the databases you
            already run. It connects from your browser, keeps every session on
            your own device, and gives you two ways to read your data: a fast
            tabular grid and an interactive relationship graph.
          </P>
          <P>
            There is no account to create and nothing to install. Open the{" "}
            <Code>Canvas</Code>, add a source, and you are reading rows in
            seconds.
          </P>

          <H id="quick-start">Quick start</H>
          <P>
            From the landing page, click <Code>Canvas</Code>. You will land on an
            empty workspace with a single call to action: add your first source.
            Pick a database type, fill in the connection details, choose the
            tables you care about, and they appear in the sidebar.
          </P>

          <H id="connecting">Connecting a source</H>
          <P>
            Poneglyph speaks to five families of database: PostgreSQL, MySQL /
            MariaDB, MongoDB, SQLite and Redis. Each connection takes the usual
            details — host, port, database, credentials, and an optional schema
            and SSL toggle for engines that support them. SQLite simply takes a
            file path.
          </P>
          <P>
            When you click <Code>Connect</Code>, Poneglyph verifies the
            connection and lists the available tables or collections so you can
            choose which to sync into the session.
          </P>

          <H id="sessions">Sessions &amp; privacy</H>
          <P>
            A <em>session</em> is a saved connection. Sessions live in your
            browser&apos;s <Code>localStorage</Code> under the{" "}
            <Code>poneglyph.sessions</Code> key — they are never uploaded
            anywhere. Clear your browser storage and they are gone. This is what
            makes Poneglyph plug-and-play: your credentials are yours alone.
          </P>

          <H id="table-view">Table view</H>
          <P>
            The default view is a spreadsheet-grade grid. Click any column header
            to sort, type in the filter box to search across every column, and
            use the <Code>Columns</Code> menu to hide fields you don&apos;t need.
            Primary keys and foreign keys are marked inline so structure stays
            visible.
          </P>

          <H id="graph-view">Graph view</H>
          <P>
            Toggle to <Code>Graph</Code> and the same rows become nodes on a
            pannable canvas. When a table references another, Poneglyph draws the
            relationship as an animated edge so you can follow it visually —
            ideal for understanding how records connect at a glance.
          </P>

          <H id="exporting">Exporting</H>
          <P>
            Any result set — including whatever your current filter leaves on
            screen — can be exported as <Code>JSON</Code> or <Code>CSV</Code>{" "}
            from the <Code>Export</Code> menu in the toolbar.
          </P>

          <H id="api">API</H>
          <P>
            Poneglyph&apos;s frontend talks to a small backend that brokers the
            actual database connections. The endpoint surface — testing a
            connection, listing tables, reading a schema, paging through rows and
            resolving relationships — is documented alongside the source. Point
            the frontend at your backend&apos;s base URL and you are live.
          </P>
        </DocsShell>
      </main>
      <Footer />
    </div>
  );
}
