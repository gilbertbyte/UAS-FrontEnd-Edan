"use client";

import { useState } from "react";
import { Alert, Button, Form, Modal } from "react-bootstrap";
import { api } from "@/lib/client-api";
import type { MenuItem, Store } from "@/lib/types";

export default function ReviewModal({ show, onClose, stores, menu }: { show: boolean; onClose: () => void; stores: Store[]; menu: MenuItem[] }) {
  return (
    <Modal show={show} onHide={onClose} centered>
      {show && <ReviewBody onClose={onClose} stores={stores} menu={menu} />}
    </Modal>
  );
}

function ReviewBody({ onClose, stores, menu }: { onClose: () => void; stores: Store[]; menu: MenuItem[] }) {
  const [type, setType] = useState<"store" | "menu">("store");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busy, setBusy] = useState(false);
  const options = type === "menu"
    ? menu.map((m) => ({ id: m.id, label: m.nama + (m.store_nama ? ` (${m.store_nama})` : "") }))
    : stores.map((s) => ({ id: s.id, label: s.nama }));

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const f = new FormData(e.currentTarget);
    if (!f.get("target_id")) return setError("Pilih dulu toko atau menu yang mau kamu ulas.");
    setBusy(true);
    try {
      const res = await api<{ message: string }>("/api/testimonials", {
        method: "POST",
        json: { ulasan: String(f.get("ulasan")).trim(), stars: f.get("stars"), target_type: type, target_id: f.get("target_id") },
      });
      setSuccess(res.message);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Modal.Header closeButton><Modal.Title as="h3" className="fs-4">Tulis Ulasan</Modal.Title></Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger" className="py-2">{error}</Alert>}
        {success ? (
          <>
            <Alert variant="success">{success}</Alert>
            <Button variant="outline-secondary" onClick={onClose}>Tutup</Button>
          </>
        ) : (
          <Form onSubmit={submit}>
            <Form.Group className="mb-3">
              <Form.Label>Ulasan untuk</Form.Label>
              <Form.Select value={type} onChange={(e) => setType(e.target.value as "store" | "menu")}>
                <option value="store">Toko</option>
                <option value="menu">Menu</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Pilih Toko/Menu</Form.Label>
              <Form.Select name="target_id" key={type} required defaultValue="">
                <option value="">-- Pilih --</option>
                {options.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Rating</Form.Label>
              <Form.Select name="stars" defaultValue="5">
                {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{"★".repeat(n)} ({n})</option>)}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Ulasan Kamu</Form.Label>
              <Form.Control as="textarea" rows={4} name="ulasan" required placeholder="Ceritakan pengalamanmu..." />
            </Form.Group>
            <Button type="submit" className="btn-mustard w-100" disabled={busy}>Kirim Ulasan</Button>
          </Form>
        )}
      </Modal.Body>
    </>
  );
}
