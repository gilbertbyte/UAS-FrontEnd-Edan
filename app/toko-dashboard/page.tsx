"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Alert, Button, Col, Container, Form, Navbar, Row } from "react-bootstrap";
import ConfirmModal from "@/components/ConfirmModal";
import ImageUploader from "@/components/ImageUploader";
import { useAuth } from "@/components/AuthProvider";
import { api } from "@/lib/client-api";
import { imageList } from "@/lib/images";
import type { MenuItem, Store, Testimonial } from "@/lib/types";

type Msg = { ok: boolean; text: string } | null;

const rupiah = (raw: string) => {
  const digits = raw.replace(/[^0-9]/g, "");
  return digits ? "Rp " + digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".") : "";
};

export default function TokoDashboardPage() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();

  const [store, setStore] = useState<Store | null>(null);
  const [storeImages, setStoreImages] = useState<string[]>([]);
  const [storeMsg, setStoreMsg] = useState<Msg>(null);

  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [editing, setEditing] = useState<number | null>(null);
  const [menuForm, setMenuForm] = useState({ nama: "", harga: "" });
  const [menuImages, setMenuImages] = useState<string[]>([]);
  const [menuMsg, setMenuMsg] = useState<Msg>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const [reviews, setReviews] = useState<Testimonial[] | null>(null);

  const loadStore = useCallback(async () => {
    const d = await api<{ store: Store }>("/api/toko/me");
    setStore(d.store);
    setStoreImages(imageList(d.store.image_url));
  }, []);
  const loadMenu = useCallback(async () => setMenus(await api<MenuItem[]>("/api/toko/menu")), []);
  const loadReviews = useCallback(async () => setReviews(await api<Testimonial[]>("/api/toko/testimonials")), []);

  const allowed = !!user && user.role === "toko" && user.status === "approved";

  useEffect(() => {
    if (loading) return;
    if (!allowed) { router.replace("/"); return; }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    Promise.all([loadStore(), loadMenu(), loadReviews()]).catch(() => router.replace("/"));
  }, [loading, allowed, router, loadStore, loadMenu, loadReviews]);

  async function saveStore(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStoreMsg(null);
    const f = new FormData(e.currentTarget);
    try {
      await api("/api/toko/me", {
        method: "PUT",
        json: { nama: String(f.get("nama")).trim(), alamat: String(f.get("alamat")).trim(), jam_buka: f.get("jam_buka"), jam_tutup: f.get("jam_tutup"), images: storeImages },
      });
      setStoreMsg({ ok: true, text: "Perubahan tersimpan." });
      await loadStore();
    } catch (err) {
      setStoreMsg({ ok: false, text: (err as Error).message });
    }
  }

  function resetMenuForm() {
    setEditing(null);
    setMenuForm({ nama: "", harga: "" });
    setMenuImages([]);
  }

  async function saveMenu(e: React.FormEvent) {
    e.preventDefault();
    setMenuMsg(null);
    const harga = menuForm.harga.trim() === "Rp" ? "" : menuForm.harga.trim();
    try {
      await api(editing !== null ? `/api/toko/menu/${editing}` : "/api/toko/menu", {
        method: editing !== null ? "PUT" : "POST",
        json: { nama: menuForm.nama.trim(), harga, images: menuImages },
      });
      setMenuMsg({ ok: true, text: editing !== null ? "Perubahan menu tersimpan." : "Menu ditambahkan." });
      resetMenuForm();
      await loadMenu();
    } catch (err) {
      setMenuMsg({ ok: false, text: (err as Error).message });
    }
  }

  async function removeMenu() {
    if (deleteId === null) return;
    await api(`/api/toko/menu/${deleteId}`, { method: "DELETE" });
    if (editing === deleteId) resetMenuForm();
    setDeleteId(null);
    await loadMenu();
  }

  if (!allowed || !store) return null;

  return (
    <>
      <Navbar variant="dark" className="site-navbar py-3">
        <Container>
          <Navbar.Brand as={Link} href="/">Pisang Ijo</Navbar.Brand>
          <div className="d-flex align-items-center gap-2">
            <span className="text-white-50 small d-none d-sm-inline">Halo, {user?.nama}</span>
            <Link href="/" className="btn btn-outline-light btn-sm">Lihat Website</Link>
            <Button variant="outline-light" size="sm" onClick={async () => { await logout(); router.push("/"); }}>Logout</Button>
          </div>
        </Container>
      </Navbar>

      <Container style={{ maxWidth: 680 }} className="py-5">
        <h2>Dashboard Toko</h2>
        <p className="section-sub mb-4">Kelola informasi toko kamu di sini.</p>

        <div className="dash-card">
          <h3 className="fs-5 mb-3">Informasi Toko</h3>
          <Form.Label>Gambar Toko</Form.Label>
          <ImageUploader images={storeImages} onChange={setStoreImages} uploadUrl="/api/toko/upload" max={10} onError={(t) => setStoreMsg({ ok: false, text: t })} />
          <Form.Text className="d-block mb-3">Bisa pilih beberapa gambar sekaligus. Gambar pertama jadi sampul. Maks 3MB per gambar (JPG/PNG/WEBP).</Form.Text>
          <Form onSubmit={saveStore} key={store.id + (store.nama ?? "")}>
            <Form.Group className="mb-3"><Form.Label>Nama Toko</Form.Label><Form.Control name="nama" defaultValue={store.nama} required /></Form.Group>
            <Form.Group className="mb-3"><Form.Label>Alamat</Form.Label><Form.Control as="textarea" rows={2} name="alamat" defaultValue={store.alamat ?? ""} /></Form.Group>
            <Row>
              <Col><Form.Group className="mb-3"><Form.Label>Jam Buka</Form.Label><Form.Control type="time" name="jam_buka" defaultValue={store.jam_buka ?? ""} /></Form.Group></Col>
              <Col><Form.Group className="mb-3"><Form.Label>Jam Tutup</Form.Label><Form.Control type="time" name="jam_tutup" defaultValue={store.jam_tutup ?? ""} /></Form.Group></Col>
            </Row>
            <Button type="submit" className="btn-mustard w-100">Simpan Perubahan</Button>
            {storeMsg && <Alert className="mt-3 mb-0" variant={storeMsg.ok ? "success" : "danger"}>{storeMsg.text}</Alert>}
          </Form>
        </div>

        <div className="dash-card">
          <h3 className="fs-5 mb-3">Menu Toko</h3>
          <div className="d-grid gap-2 mb-4">
            {menus.length === 0 && <p className="section-sub mb-0">Belum ada menu. Tambahkan menu pertama kamu di bawah.</p>}
            {menus.map((m) => {
              const pics = imageList(m.image_url);
              return (
                <div className="menu-row" key={m.id}>
                  {pics[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img className="pic" src={pics[0]} alt={m.nama} />
                  ) : (
                    <div className="pic d-flex align-items-center justify-content-center small text-muted text-center">Tanpa gambar</div>
                  )}
                  <div className="flex-grow-1 min-w-0">
                    <strong className="d-block text-truncate">{m.nama}</strong>
                    <span className="small text-muted">{m.harga || "Harga belum diisi"}{pics.length > 1 ? ` · ${pics.length} foto` : ""}</span>
                  </div>
                  <div className="d-flex flex-column gap-1">
                    <Button size="sm" variant="outline-secondary" onClick={() => {
                      setEditing(m.id);
                      setMenuForm({ nama: m.nama, harga: rupiah(m.harga ?? "") });
                      setMenuImages(pics);
                      document.getElementById("menu-form")?.scrollIntoView({ behavior: "smooth" });
                    }}>Edit</Button>
                    <Button size="sm" variant="outline-danger" onClick={() => setDeleteId(m.id)}>Hapus</Button>
                  </div>
                </div>
              );
            })}
          </div>

          <div id="menu-form" className="border-top pt-3" style={{ borderStyle: "dashed" }}>
            <h4 className="fs-6">{editing !== null ? "Edit Menu" : "Tambah Menu Baru"}</h4>
            <Form.Label>Gambar Menu</Form.Label>
            <ImageUploader images={menuImages} onChange={setMenuImages} uploadUrl="/api/toko/upload" max={10} onError={(t) => setMenuMsg({ ok: false, text: t })} />
            <Form onSubmit={saveMenu}>
              <Form.Group className="mb-3">
                <Form.Label>Nama Menu</Form.Label>
                <Form.Control value={menuForm.nama} maxLength={100} required onChange={(e) => setMenuForm({ ...menuForm, nama: e.target.value })} />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Harga</Form.Label>
                <Form.Control value={menuForm.harga} placeholder="Rp 15.000" inputMode="numeric" onChange={(e) => setMenuForm({ ...menuForm, harga: rupiah(e.target.value) })} />
              </Form.Group>
              <div className="d-flex gap-2">
                <Button type="submit" className="btn-mustard flex-fill">{editing !== null ? "Simpan Perubahan" : "Tambah Menu"}</Button>
                {editing !== null && <Button variant="outline-secondary" onClick={resetMenuForm}>Batal</Button>}
              </div>
              {menuMsg && <Alert className="mt-3 mb-0" variant={menuMsg.ok ? "success" : "danger"}>{menuMsg.text}</Alert>}
            </Form>
          </div>
        </div>

        <div className="dash-card">
          <h3 className="fs-5 mb-3">Ulasan Masuk</h3>
          {reviews === null ? <p className="section-sub">Memuat ulasan...</p> : reviews.length === 0 ? <p className="section-sub mb-0">Belum ada ulasan masuk.</p> : reviews.map((r) => {
            const n = Number(r.stars) || 5;
            return (
              <div className="border-bottom py-3" key={r.id}>
                <div style={{ color: "var(--mustard-dark)" }}>{"★".repeat(n) + "☆".repeat(5 - n)}</div>
                <strong>{r.nama}</strong>{Number(r.approved) !== 1 && <span style={{ color: "var(--mustard-dark)" }}> (menunggu approval admin)</span>}
                <p className="mb-1 mt-1">{r.ulasan}</p>
                <small className="text-muted">{r.waktu}</small>
              </div>
            );
          })}
        </div>
      </Container>

      <ConfirmModal message={deleteId !== null ? "Hapus menu ini? Ulasan untuk menu ini juga ikut terhapus." : null} onConfirm={removeMenu} onCancel={() => setDeleteId(null)} />
    </>
  );
}
