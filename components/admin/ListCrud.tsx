"use client";

import { useCallback, useEffect, useState } from "react";
import { Badge, Button, Card, Col, Form, Modal, Row, Table } from "react-bootstrap";
import ConfirmModal from "../ConfirmModal";
import ImageUploader from "../ImageUploader";
import { api } from "@/lib/client-api";
import { imageList } from "@/lib/images";
import { formatTime, storeIsOpen } from "@/lib/time";
import type { Store } from "@/lib/types";

type Item = Record<string, unknown> & { id: number };
type Field = {
  name: string; label: string;
  type: "text" | "textarea" | "number" | "time" | "select" | "image" | "store-select";
  required?: boolean; step?: string; min?: string; max?: string;
  options?: { value: string; label: string }[];
};

export type ListConfig = { title: string; endpoint: string; columns: string[]; headers: string[]; fields: Field[]; addLabel: string };

const APPROVAL_BADGE: Record<string, { bg: string; label: string }> = {
  approved: { bg: "success", label: "Disetujui" },
  pending: { bg: "warning", label: "Menunggu" },
  rejected: { bg: "danger", label: "Ditolak" },
};

const trunc = (v: unknown) => (v == null || v === "" ? "-" : String(v).length > 60 ? String(v).slice(0, 60) + "…" : String(v));

export default function ListCrud({ config, onChanged }: { config: ListConfig; onChanged?: () => void }) {
  const [items, setItems] = useState<Item[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [editing, setEditing] = useState<Item | "new" | null>(null);
  const [draft, setDraft] = useState<Record<string, unknown>>({});
  const [deleteItem, setDeleteItem] = useState<Item | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setItems(await api<Item[]>(`/api/admin/${config.endpoint}`));
      if (config.fields.some((f) => f.type === "store-select") || config.columns.includes("store_id")) {
        setStores(await api<Store[]>("/api/admin/stores"));
      }
    } catch (e) {
      if ((e as { status?: number }).status === 401) window.location.href = "/admin/login";
    }
  }, [config]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
    if (config.endpoint !== "stores") return;
    const id = window.setInterval(load, 60000); // status Buka/Tutup
    return () => window.clearInterval(id);
  }, [load, config.endpoint]);

  function openEditor(item: Item | "new") {
    setError("");
    setEditing(item);
    if (item === "new") {
      const d: Record<string, unknown> = {};
      config.fields.forEach((f) => { d[f.name] = f.type === "select" ? f.options?.[0].value : f.type === "image" ? [] : ""; });
      if (config.endpoint === "testimonials") d.stars = 5;
      setDraft(d);
    } else {
      const d: Record<string, unknown> = {};
      config.fields.forEach((f) => { d[f.name] = f.type === "image" ? imageList(item[f.name]) : item[f.name] ?? ""; });
      setDraft(d);
    }
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await api(editing === "new" ? `/api/admin/${config.endpoint}` : `/api/admin/${config.endpoint}/${(editing as Item).id}`, {
        method: editing === "new" ? "POST" : "PUT",
        json: draft,
      });
      setEditing(null);
      await load();
      onChanged?.();
    } catch (err) {
      setError((err as Error).message || "Gagal menyimpan.");
    }
  }

  async function remove() {
    if (!deleteItem) return;
    try {
      await api(`/api/admin/${config.endpoint}/${deleteItem.id}`, { method: "DELETE" });
      await load();
      onChanged?.();
    } catch (err) {
      alert((err as Error).message);
    }
    setDeleteItem(null);
  }

  function cell(col: string, item: Item) {
    const val = item[col];
    if (col === "status") {
      const open = storeIsOpen(item as Partial<Store>);
      return <Badge bg={open ? "success" : "secondary"}>{open ? "Buka" : "Tutup"}</Badge>;
    }
    if (col === "jam_buka") return `${formatTime(item.jam_buka)} - ${formatTime(item.jam_tutup)}`;
    if (col === "approved") return Number(val) === 1 ? <Badge bg="success">Disetujui</Badge> : <Badge bg="warning" text="dark">Menunggu</Badge>;
    if (col === "approval_status") {
      const b = APPROVAL_BADGE[String(val)] ?? APPROVAL_BADGE.pending;
      return <Badge bg={b.bg} text={b.bg === "warning" ? "dark" : undefined}>{b.label}</Badge>;
    }
    if (col === "store_id") {
      const s = stores.find((x) => x.id === val);
      return s ? s.nama : <em>Belum dipilih</em>;
    }
    if (col === "image_url") {
      const imgs = imageList(val);
      return imgs.length ? (
        <span className="position-relative d-inline-block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imgs[0]} alt="" width={48} height={48} style={{ objectFit: "cover", borderRadius: 6 }} />
          {imgs.length > 1 && <Badge bg="dark" pill className="position-absolute top-0 end-0">{imgs.length}</Badge>}
        </span>
      ) : <small className="text-muted">Belum ada</small>;
    }
    return trunc(val);
  }

  const set = (n: string, v: unknown) => setDraft({ ...draft, [n]: v });

  return (
    <>
      <Button className="btn-green mb-3" onClick={() => openEditor("new")}>{config.addLabel}</Button>
      <div className="table-responsive bg-white border rounded-3 mb-4">
        <Table hover className="mb-0 small">
          <thead><tr>{config.headers.map((h) => <th key={h}>{h}</th>)}<th /></tr></thead>
          <tbody>
            {items.length === 0 && <tr><td colSpan={config.columns.length + 1} className="text-muted">Belum ada data.</td></tr>}
            {items.map((item) => (
              <tr key={item.id}>
                {config.columns.map((c) => <td key={c}>{cell(c, item)}</td>)}
                <td className="text-nowrap">
                  <Button size="sm" variant="link" onClick={() => openEditor(item)}>Edit</Button>
                  <Button size="sm" variant="link" className="text-danger" onClick={() => setDeleteItem(item)}>Hapus</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      <Modal show={editing !== null} onHide={() => setEditing(null)} size="lg" centered scrollable>
        <Form onSubmit={save}>
          <Modal.Header closeButton>
            <Modal.Title as="h3" className="fs-4">{editing === "new" ? "Tambah" : "Edit"} {config.title}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Row className="g-4">
              <Col md={7}>
                {config.fields.map((f) => (
                  <Form.Group className="mb-3" key={f.name}>
                    <Form.Label>{f.label}</Form.Label>
                    {f.type === "image" ? (
                      <ImageUploader images={(draft[f.name] as string[]) ?? []} onChange={(v) => set(f.name, v)} uploadUrl="/api/admin/upload" max={10} onError={setError} />
                    ) : f.type === "textarea" ? (
                      <Form.Control as="textarea" rows={3} value={String(draft[f.name] ?? "")} onChange={(e) => set(f.name, e.target.value)} />
                    ) : f.type === "store-select" ? (
                      <Form.Select value={String(draft[f.name] ?? "")} onChange={(e) => set(f.name, e.target.value)}>
                        <option value="">— Pilih Toko —</option>
                        {stores.map((s) => <option key={s.id} value={s.id}>{s.nama}</option>)}
                      </Form.Select>
                    ) : f.type === "select" ? (
                      <Form.Select value={String(draft[f.name] ?? "")} onChange={(e) => set(f.name, e.target.value)}>
                        {f.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </Form.Select>
                    ) : (
                      <Form.Control type={f.type} step={f.step} min={f.min} max={f.max} required={f.required} value={String(draft[f.name] ?? "")} onChange={(e) => set(f.name, e.target.value)} />
                    )}
                  </Form.Group>
                ))}
              </Col>
              <Col md={5}>
                <div className="preview-pane">
                  <div className="preview-label">Live Preview</div>
                  <ItemPreview endpoint={config.endpoint} draft={draft} stores={stores} />
                </div>
              </Col>
            </Row>
            {error && <div className="alert alert-danger mt-3 mb-0 py-2">{error}</div>}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="outline-secondary" onClick={() => setEditing(null)}>Batal</Button>
            <Button type="submit" className="btn-green">Simpan</Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <ConfirmModal message={deleteItem ? "Hapus item ini?" : null} onConfirm={remove} onCancel={() => setDeleteItem(null)} />
    </>
  );
}

function ItemPreview({ endpoint, draft, stores }: { endpoint: string; draft: Record<string, unknown>; stores: Store[] }) {
  const v = (k: string, d: string) => (draft[k] ? String(draft[k]) : d);
  const first = imageList(draft.image_url)[0];
  const img = first ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={first} alt="" className="w-100 rounded mb-2" style={{ height: 110, objectFit: "cover" }} />
  ) : (
    <div className="rounded mb-2 d-flex align-items-center justify-content-center small" style={{ height: 110, background: "#fcebd1", color: "var(--mustard-dark)" }}>Gambar</div>
  );

  if (endpoint === "faqs") return <Card body><strong>{v("question", "Pertanyaan baru")}</strong><p className="text-muted small mb-0">{v("answer", "Jawaban akan tampil di sini.")}</p></Card>;
  if (endpoint === "testimonials") {
    const n = Math.max(1, Math.min(5, Number(draft.stars) || 5));
    return <Card body><div style={{ color: "var(--mustard-dark)" }}>{"★".repeat(n) + "☆".repeat(5 - n)}</div><strong>{v("nama", "Nama pelanggan")}</strong><p className="small mb-1">{v("ulasan", "Ulasan pelanggan akan tampil di sini.")}</p><small className="text-muted">{v("waktu", "Keterangan waktu")}</small></Card>;
  }
  if (endpoint === "stores") {
    const open = storeIsOpen({ jam_buka: String(draft.jam_buka ?? ""), jam_tutup: String(draft.jam_tutup ?? "") });
    return <Card body>{img}<strong>{v("nama", "Nama toko")}</strong><p className="text-muted small mb-1">{v("alamat", "Alamat toko")}</p><div className="d-flex justify-content-between small"><span>{formatTime(draft.jam_buka)} - {formatTime(draft.jam_tutup)}</span><span className={open ? "status-open" : "status-closed"}>{open ? "Buka" : "Tutup"}</span></div></Card>;
  }
  const store = stores.find((s) => String(s.id) === String(draft.store_id));
  return <Card body>{img}<strong>{v("nama", "Nama menu")}</strong><p className="text-muted small mb-1">{v("deskripsi", "Deskripsi menu")}</p><div className="d-flex justify-content-between small"><span className="price">{v("harga", "Harga")}</span><span>{store?.nama}</span></div></Card>;
}
