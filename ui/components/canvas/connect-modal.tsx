"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ArrowRight, Check, Loader2, Plug } from "lucide-react";
import { toast } from "sonner";
import { Modal, ModalHeader } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Field, Input, Switch } from "@/components/ui/field";
import { DB_KINDS, DB_KIND_MAP } from "@/lib/db-kinds";
import { tablesFor } from "@/lib/mock-data";
import { addSession, newId } from "@/lib/sessions";
import type { ConnectionConfig, DbKindId, Session } from "@/lib/types";

const emptyConfig: ConnectionConfig = {
  host: "localhost",
  port: "",
  database: "",
  user: "",
  password: "",
  schema: "public",
  ssl: false,
};

export function ConnectModal({
  open,
  onClose,
  onConnected,
}: {
  open: boolean;
  onClose: () => void;
  onConnected: (session: Session) => void;
}) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [kind, setKind] = useState<DbKindId | null>(null);
  const [config, setConfig] = useState<ConnectionConfig>(emptyConfig);
  const [connecting, setConnecting] = useState(false);
  const [available, setAvailable] = useState<string[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const meta = kind ? DB_KIND_MAP[kind] : null;

  function reset() {
    setStep(1);
    setKind(null);
    setConfig(emptyConfig);
    setConnecting(false);
    setAvailable([]);
    setSelected(new Set());
  }

  function close() {
    onClose();
    setTimeout(reset, 200);
  }

  function pick(id: DbKindId) {
    const k = DB_KIND_MAP[id];
    setKind(id);
    setConfig({ ...emptyConfig, port: k.defaultPort, database: id === "sqlite" ? "./local.db" : "" });
    setStep(2);
  }

  function connect() {
    if (!kind) return;
    setConnecting(true);
    const tables = tablesFor(kind).map((t) => t.name);
    toast.promise(
      new Promise((res) => setTimeout(res, 950)),
      {
        loading: `Connecting to ${meta?.name}…`,
        success: "Connection established",
        error: "Could not connect",
      },
    );
    setTimeout(() => {
      setAvailable(tables);
      setSelected(new Set(tables));
      setConnecting(false);
      setStep(3);
    }, 1000);
  }

  function toggle(name: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
  }

  function finish() {
    if (!kind || !meta) return;
    const label =
      config.database && config.database.length > 0
        ? config.database
        : meta.name;
    const session: Session = {
      id: newId(),
      kind,
      label,
      config,
      tables: available.filter((t) => selected.has(t)),
      createdAt: Date.now(),
    };
    addSession(session);
    toast.success(`Added ${label}`, {
      description: `${session.tables.length} table${session.tables.length === 1 ? "" : "s"} synced`,
    });
    onConnected(session);
    close();
  }

  const allChecked = available.length > 0 && selected.size === available.length;

  return (
    <Modal open={open} onClose={close} className="max-w-xl">
      <ModalHeader
        title={
          step === 1
            ? "Add a data source"
            : step === 2
              ? `Connect to ${meta?.name}`
              : "Choose your tables"
        }
        subtitle={
          step === 1
            ? "Pick a database. Credentials stay on your device."
            : step === 2
              ? "Enter your connection details below."
              : "Select what you'd like to sync into this session."
        }
        onClose={close}
      />

      <div className="relative min-h-[280px]">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.18 }}
              className="grid grid-cols-1 gap-2.5 p-6 sm:grid-cols-2"
            >
              {DB_KINDS.map((k) => {
                const Icon = k.icon;
                return (
                  <button
                    key={k.id}
                    onClick={() => pick(k.id)}
                    className="group flex items-center gap-3 rounded-xl border border-border bg-surface-2 p-3.5 text-left transition-all hover:border-accent/40 hover:bg-surface"
                  >
                    <span
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                      style={{ backgroundColor: `${k.color}1a`, color: k.color }}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold text-foreground">
                        {k.name}
                      </span>
                      <span className="block text-xs text-muted">{k.blurb}</span>
                    </span>
                    <ArrowRight className="ml-auto h-4 w-4 shrink-0 text-faint opacity-0 transition-opacity group-hover:opacity-100" />
                  </button>
                );
              })}
            </motion.div>
          )}

          {step === 2 && meta && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.18 }}
              className="space-y-4 p-6"
            >
              <div className="grid grid-cols-2 gap-3">
                <Field label="Host">
                  <Input
                    value={config.host}
                    onChange={(e) => setConfig({ ...config, host: e.target.value })}
                    placeholder="localhost"
                  />
                </Field>
                <Field label="Port">
                  <Input
                    value={config.port}
                    onChange={(e) => setConfig({ ...config, port: e.target.value })}
                    placeholder={meta.defaultPort || "—"}
                  />
                </Field>
              </div>

              <Field label={meta.id === "sqlite" ? "File path" : "Database"}>
                <Input
                  value={config.database}
                  onChange={(e) => setConfig({ ...config, database: e.target.value })}
                  placeholder={meta.id === "sqlite" ? "./local.db" : "my_database"}
                />
              </Field>

              {meta.id !== "sqlite" && (
                <div className="grid grid-cols-2 gap-3">
                  <Field label="User">
                    <Input
                      value={config.user}
                      onChange={(e) => setConfig({ ...config, user: e.target.value })}
                      placeholder="postgres"
                    />
                  </Field>
                  <Field label="Password">
                    <Input
                      type="password"
                      value={config.password}
                      onChange={(e) => setConfig({ ...config, password: e.target.value })}
                      placeholder="••••••••"
                    />
                  </Field>
                </div>
              )}

              {meta.hasSchema && (
                <Field label="Schema" hint="optional">
                  <Input
                    value={config.schema}
                    onChange={(e) => setConfig({ ...config, schema: e.target.value })}
                    placeholder="public"
                  />
                </Field>
              )}

              <div className="flex items-center justify-between rounded-xl border border-border bg-surface-2 px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-foreground">SSL</p>
                  <p className="text-xs text-muted">Require an encrypted connection</p>
                </div>
                <Switch
                  checked={config.ssl}
                  onChange={(v) => setConfig({ ...config, ssl: v })}
                />
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.18 }}
              className="p-6"
            >
              <button
                onClick={() =>
                  setSelected(allChecked ? new Set() : new Set(available))
                }
                className="mb-2 flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-surface-2"
              >
                <CheckBox checked={allChecked} />
                <span className="text-sm font-medium text-foreground">Select all</span>
                <span className="ml-auto font-mono text-xs text-faint">
                  {selected.size}/{available.length}
                </span>
              </button>
              <div className="max-h-[260px] divide-y divide-border overflow-y-auto rounded-xl border border-border">
                {available.map((name) => {
                  const t = tablesFor(kind!).find((x) => x.name === name);
                  return (
                    <button
                      key={name}
                      onClick={() => toggle(name)}
                      className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-surface-2"
                    >
                      <CheckBox checked={selected.has(name)} />
                      <span className="font-mono text-sm text-foreground">{name}</span>
                      <span className="ml-auto text-xs text-faint">
                        {t?.rowCount ?? 0} rows
                      </span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-border bg-surface-2/40 px-6 py-4">
        {step > 1 ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setStep((s) => (s === 3 ? 2 : 1) as 1 | 2)}
            disabled={connecting}
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        ) : (
          <span />
        )}

        {step === 2 && (
          <Button size="sm" onClick={connect} disabled={connecting}>
            {connecting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Connecting…
              </>
            ) : (
              <>
                <Plug className="h-4 w-4" />
                Connect
              </>
            )}
          </Button>
        )}
        {step === 3 && (
          <Button size="sm" onClick={finish} disabled={selected.size === 0}>
            <Check className="h-4 w-4" />
            Add source
          </Button>
        )}
      </div>
    </Modal>
  );
}

function CheckBox({ checked }: { checked: boolean }) {
  return (
    <span
      className={
        "flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[5px] border transition-colors " +
        (checked
          ? "border-accent bg-accent text-accent-contrast"
          : "border-border-strong bg-surface")
      }
    >
      {checked && <Check className="h-3 w-3" strokeWidth={3} />}
    </span>
  );
}
