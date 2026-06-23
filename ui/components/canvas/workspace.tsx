"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Sidebar, type Selection } from "./sidebar";
import { EmptyState } from "./empty-state";
import { ConnectModal } from "./connect-modal";
import { RecordsView } from "./records-view";
import { useSessions, removeSession } from "@/lib/sessions";
import { tableMeta } from "@/lib/mock-data";
import type { Session } from "@/lib/types";

export function Workspace() {
  const sessions = useSessions();
  const [mounted, setMounted] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selection, setSelection] = useState<Selection | null>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!selection && sessions.length > 0) {
      const first = sessions.find((s) => s.tables.length > 0);
      if (first) setSelection({ sessionId: first.id, table: first.tables[0] });
    }
    if (selection && !sessions.some((s) => s.id === selection.sessionId)) {
      const first = sessions.find((s) => s.tables.length > 0);
      setSelection(first ? { sessionId: first.id, table: first.tables[0] } : null);
    }
  }, [sessions, selection]);

  const active = useMemo(() => {
    if (!selection) return null;
    const session = sessions.find((s) => s.id === selection.sessionId);
    if (!session) return null;
    const meta = tableMeta(session.kind, selection.table);
    return meta ? { session, meta } : null;
  }, [selection, sessions]);

  function onConnected(session: Session) {
    if (session.tables.length > 0) {
      setSelection({ sessionId: session.id, table: session.tables[0] });
    }
  }

  function onRemove(id: string) {
    removeSession(id);
  }

  const hasSessions = mounted && sessions.length > 0;

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {hasSessions && (
        <Sidebar
          sessions={sessions}
          selected={selection}
          onSelect={setSelection}
          onAdd={() => setModalOpen(true)}
          onRemove={onRemove}
        />
      )}

      <main className="relative flex flex-1 flex-col overflow-hidden">
        {mounted && !hasSessions && (
          <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-5 py-4">
            <Link href="/" className="transition-opacity hover:opacity-80">
              <Logo />
            </Link>
            <ThemeToggle />
          </div>
        )}
        {!mounted ? null : !hasSessions ? (
          <EmptyState onAdd={() => setModalOpen(true)} />
        ) : active ? (
          <RecordsView
            kind={active.session.kind}
            meta={active.meta}
            label={active.session.label}
          />
        ) : (
          <EmptyState onAdd={() => setModalOpen(true)} />
        )}
      </main>

      <ConnectModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onConnected={onConnected}
      />
    </div>
  );
}
