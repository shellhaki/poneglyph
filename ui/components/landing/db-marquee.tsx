import { DB_KINDS } from "@/lib/db-kinds";

export function DbMarquee() {
  const row = [...DB_KINDS, ...DB_KINDS, ...DB_KINDS];
  return (
    <section className="border-y border-border bg-surface/40 py-7">
      <div className="mx-auto mb-5 max-w-5xl px-6">
        <p className="text-center text-[0.78rem] font-medium uppercase tracking-[0.16em] text-faint">
          One viewer for every store
        </p>
      </div>
      <div className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,#000_12%,#000_88%,transparent)]">
        <div className="flex w-max animate-marquee items-center gap-3">
          {row.map((k, i) => {
            const Icon = k.icon;
            return (
              <div
                key={`${k.id}-${i}`}
                className="flex items-center gap-2.5 rounded-xl border border-border bg-surface px-4 py-2.5"
              >
                <span
                  className="flex h-7 w-7 items-center justify-center rounded-lg"
                  style={{ backgroundColor: `${k.color}1a`, color: k.color }}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <span className="text-sm font-medium text-foreground">{k.name}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
