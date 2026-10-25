"use client";

import { useCallback, useEffect, useState } from "react";
import { Button, Table } from "react-bootstrap";
import ConfirmModal from "../ConfirmModal";
import { api } from "@/lib/client-api";

type Pending = { user_id: number; nama: string; email: string; created_at: string; store_nama: string; store_alamat: string | null };

export default function StoreApprovals({ onCount, onApproved }: { onCount: (n: number) => void; onApproved?: () => void }) {
  const [items, setItems] = useState<Pending[]>([]);
  const [action, setAction] = useState<{ item: Pending; type: "approve" | "reject" } | null>(null);

  const load = useCallback(async () => {
    try {
      const rows = await api<Pending[]>("/api/admin/toko-pending");
      setItems(rows);
      onCount(rows.length);
    } catch { /* sesi habis: halaman induk yang redirect */ }
  }, [onCount]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
    const id = window.setInterval(load, 60000);
    return () => window.clearInterval(id);
  }, [load]);

  async function run() {
    if (!action) return;
    try {
      await api(`/api/admin/toko-pending/${action.item.user_id}/${action.type}`, { method: "POST" });
      await load();
      if (action.type === "approve") onApproved?.();
    } catch (e) {
      alert((e as Error).message);
    }
    setAction(null);
  }

  return (
    <>
      <div className="table-responsive bg-white border rounded-3">
        <Table hover className="mb-0 small">
          <thead><tr><th>Nama Toko</th><th>Alamat</th><th>Didaftarkan Oleh</th><th>Email</th><th>Diajukan</th><th /></tr></thead>
          <tbody>
            {items.length === 0 && <tr><td colSpan={6} className="text-muted">Tidak ada pendaftaran yang menunggu.</td></tr>}
            {items.map((i) => (
              <tr key={i.user_id}>
                <td>{i.store_nama}</td><td>{i.store_alamat || "-"}</td><td>{i.nama}</td><td>{i.email}</td><td>{i.created_at}</td>
                <td className="text-nowrap">
                  <Button size="sm" variant="link" className="text-success fw-semibold" onClick={() => setAction({ item: i, type: "approve" })}>Approve</Button>
                  <Button size="sm" variant="link" className="text-danger fw-semibold" onClick={() => setAction({ item: i, type: "reject" })}>Reject</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
      <ConfirmModal
        message={action ? (action.type === "approve" ? "Setujui pendaftaran toko ini? Toko akan langsung tampil ke publik." : "Tolak pendaftaran toko ini?") : null}
        confirmLabel={action?.type === "approve" ? "Ya, Setujui" : "Ya, Tolak"}
        onConfirm={run}
        onCancel={() => setAction(null)}
      />
    </>
  );
}
