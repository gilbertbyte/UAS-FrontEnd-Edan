"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Badge, Button, Col, Container, Nav, Row, Tab } from "react-bootstrap";
import ContentForm, { type ContentField } from "@/components/admin/ContentForm";
import ListCrud, { type ListConfig } from "@/components/admin/ListCrud";
import StoreApprovals from "@/components/admin/StoreApprovals";
import { api } from "@/lib/client-api";

const opt = (pairs: [string, string][]) => pairs.map(([value, label]) => ({ value, label }));

const LISTS: Record<string, ListConfig> = {
  stores: {
    title: "Toko", endpoint: "stores", addLabel: "+ Tambah Toko",
    columns: ["image_url", "nama", "alamat", "jam_buka", "status", "approval_status", "rating", "ulasan_count"],
    headers: ["Gambar", "Nama", "Alamat", "Jam", "Status", "Approval", "Rating", "Ulasan"],
    fields: [
      { name: "nama", label: "Nama Toko", type: "text", required: true },
      { name: "alamat", label: "Alamat", type: "text" },
      { name: "jam_buka", label: "Jam Buka", type: "time", required: true },
      { name: "jam_tutup", label: "Jam Tutup", type: "time", required: true },
      { name: "rating", label: "Rating", type: "number", step: "0.1", min: "0", max: "5" },
      { name: "image_url", label: "Gambar Toko (pilih satu atau lebih)", type: "image" },
      { name: "approval_status", label: "Status Approval", type: "select", options: opt([["pending", "Menunggu"], ["approved", "Disetujui"], ["rejected", "Ditolak"]]) },
    ],
  },
  menu: {
    title: "Menu", endpoint: "menu", addLabel: "+ Tambah Menu",
    columns: ["image_url", "nama", "deskripsi", "harga", "store_id"],
    headers: ["Gambar", "Nama", "Deskripsi", "Harga", "Toko"],
    fields: [
      { name: "nama", label: "Nama Menu", type: "text", required: true },
      { name: "deskripsi", label: "Deskripsi", type: "text" },
      { name: "harga", label: "Harga (contoh: Rp 15.000)", type: "text" },
      { name: "image_url", label: "Gambar Menu (pilih satu atau lebih)", type: "image" },
      { name: "store_id", label: "Toko", type: "store-select" },
    ],
  },
  testimonials: {
    title: "Testimoni", endpoint: "testimonials", addLabel: "+ Tambah Ulasan",
    columns: ["nama", "ulasan", "waktu", "stars", "approved"],
    headers: ["Nama", "Ulasan", "Waktu", "Bintang", "Status"],
    fields: [
      { name: "nama", label: "Nama", type: "text", required: true },
      { name: "ulasan", label: "Ulasan", type: "textarea" },
      { name: "waktu", label: "Keterangan Waktu (contoh: 2 hari yang lalu)", type: "text" },
      { name: "stars", label: "Jumlah Bintang (1-5)", type: "number", min: "1", max: "5" },
      { name: "approved", label: "Status Approval", type: "select", options: opt([["0", "Menunggu Approval"], ["1", "Disetujui"]]) },
    ],
  },
  faqs: {
    title: "Pertanyaan", endpoint: "faqs", addLabel: "+ Tambah Pertanyaan",
    columns: ["question", "answer"], headers: ["Pertanyaan", "Jawaban"],
    fields: [
      { name: "question", label: "Pertanyaan", type: "text", required: true },
      { name: "answer", label: "Jawaban", type: "textarea" },
    ],
  },
};

const T = (name: string, label: string, type: ContentField["type"] = "text", rows?: number): ContentField => ({ name, label, type, rows });

const FORMS: Record<string, { title: string; fields: ContentField[] }> = {
  hero: { title: "Homepage Content", fields: [T("badge", "Badge"), T("heading", "Heading"), T("subheading", "Subheading", "textarea"), T("search_placeholder", "Search Placeholder"), T("cta_primary", "Primary Button Label"), T("cta_secondary", "Secondary Button Label")] },
  toko_populer: { title: "Featured Stores Section", fields: [T("heading", "Heading"), T("subheading", "Subheading", "textarea"), T("link_text", "View All Link Label")] },
  menu_section: { title: "Featured Menu Section", fields: [T("heading", "Heading"), T("subheading", "Subheading", "textarea")] },
  about: { title: "About the Platform", fields: [T("eyebrow", "Eyebrow Label"), T("heading", "Heading"), T("description", "Description", "textarea", 3), T("media_text", "Image Placeholder Text"), T("images", "About Images (beberapa gambar = slideshow)", "images"), T("pill_1", "Highlight 1"), T("pill_2", "Highlight 2"), T("pill_3", "Highlight 3")] },
  history: { title: "Brand History", fields: [T("heading", "Heading"), T("text", "Body Copy", "textarea", 5)] },
  testimonial_section: { title: "Reviews Section", fields: [T("eyebrow", "Eyebrow Label"), T("heading", "Heading"), T("cta", "Review Button Label")] },
  cari_toko: { title: "Store Search Content", fields: [T("eyebrow", "Eyebrow Label"), T("heading", "Heading"), T("subheading", "Subheading", "textarea")] },
  faq_section: { title: "FAQ Section", fields: [T("eyebrow", "Eyebrow Label"), T("heading", "Heading")] },
  contact: { title: "Contact Information", fields: [T("eyebrow", "Eyebrow Label"), T("heading", "Heading"), T("email", "Email"), T("whatsapp", "WhatsApp"), T("note", "Support Note", "textarea"), T("hours", "Service Hours")] },
  footer: { title: "Footer", fields: [T("tagline", "Tagline", "textarea"), T("social_text", "Social Media Copy"), T("help_email", "Support Email"), T("help_whatsapp", "Support WhatsApp"), T("legal_terms_label", "Terms Link Label"), T("legal_privacy_label", "Privacy Link Label"), T("copyright", "Copyright Text")] },
  site: { title: "Site Settings", fields: [T("site_title", "Site Title (Browser Tab)"), T("logo_text", "Logo Text (Header & Footer)")] },
};

const Form_ = ({ k }: { k: string }) => (
  <>
    <h2 className="fs-4 mt-3">{FORMS[k].title}</h2>
    <ContentForm contentKey={k} fields={FORMS[k].fields} />
  </>
);

const TABS: { key: string; icon: string; label: string; sub: string }[] = [
  { key: "hero", icon: "🏠", label: "Homepage Content", sub: "Kelola konten pertama yang dilihat pengunjung." },
  { key: "toko", icon: "🏪", label: "Store Directory", sub: "Kelola toko yang tampil di homepage dan pencarian." },
  { key: "approval", icon: "✅", label: "Store Approvals", sub: "Tinjau pendaftaran toko sebelum tayang." },
  { key: "menu", icon: "🍽️", label: "Menu Catalog", sub: "Kelola menu unggulan di homepage." },
  { key: "tentang", icon: "📖", label: "About & History", sub: "Kelola cerita platform dan sejarah brand." },
  { key: "testimoni", icon: "💬", label: "Customer Reviews", sub: "Kelola ulasan pelanggan di homepage." },
  { key: "cari", icon: "🔍", label: "Store Search Content", sub: "Data toko dikelola di Store Directory." },
  { key: "faq", icon: "❓", label: "FAQ Management", sub: "Kelola jawaban pertanyaan umum." },
  { key: "kontak", icon: "✉️", label: "Contact Information", sub: "Kelola detail kontak website." },
  { key: "footer", icon: "📎", label: "Footer Content", sub: "Kelola konten bagian bawah website." },
  { key: "situs", icon: "⚙️", label: "Site Settings", sub: "Judul tab browser dan teks logo." },
];

export default function AdminPage() {
  const router = useRouter();
  const [username, setUsername] = useState<string | null>(null);
  const [pending, setPending] = useState(0);
  const [storesVersion, setStoresVersion] = useState(0);

  useEffect(() => {
    api<{ loggedIn: boolean; username?: string }>("/api/admin/auth/me")
      .then((r) => (r.loggedIn ? setUsername(r.username ?? "") : router.replace("/admin/login")))
      .catch(() => router.replace("/admin/login"));
    api<unknown[]>("/api/admin/toko-pending").then((r) => setPending(r.length)).catch(() => {});
  }, [router]);

  if (username === null) return null;

  return (
    <>
      <header className="admin-header py-3">
        <Container fluid className="px-4 d-flex justify-content-between align-items-center">
          <span className="fw-bold fs-5" style={{ fontFamily: "var(--font-display)" }}>Administration</span>
          <div className="d-flex align-items-center gap-3">
            <span className="small">Halo, {username}</span>
            <Button size="sm" variant="outline-light" onClick={async () => { await api("/api/admin/auth/logout", { method: "POST" }); router.push("/admin/login"); }}>Sign out</Button>
          </div>
        </Container>
      </header>

      <Container fluid className="admin-shell px-4 py-4">
        <Tab.Container defaultActiveKey="hero">
          <Row className="g-4">
            <Col lg={3} xl={2}>
              <Nav variant="pills" className="admin-sidebar flex-column">
                {TABS.map((t) => (
                  <Nav.Item key={t.key}>
                    <Nav.Link eventKey={t.key}>
                      <span className="me-2">{t.icon}</span>{t.label}
                      {t.key === "approval" && pending > 0 && <Badge bg="danger" pill className="ms-2">{pending}</Badge>}
                    </Nav.Link>
                  </Nav.Item>
                ))}
              </Nav>
            </Col>
            <Col lg={9} xl={10}>
              <Tab.Content>
                {TABS.map((t) => (
                  <Tab.Pane eventKey={t.key} key={t.key} mountOnEnter>
                    <h1 className="fs-2" style={{ color: "var(--green-deep)" }}>{t.label}</h1>
                    <p className="text-muted">{t.sub}</p>
                    {t.key === "hero" && <Form_ k="hero" />}
                    {t.key === "toko" && (<><Form_ k="toko_populer" /><h2 className="fs-4">Store Records</h2><ListCrud key={storesVersion} config={LISTS.stores} /></>)}
                    {t.key === "approval" && <StoreApprovals onCount={setPending} onApproved={() => setStoresVersion((n) => n + 1)} />}
                    {t.key === "menu" && (<><Form_ k="menu_section" /><h2 className="fs-4">Menu Records</h2><ListCrud config={LISTS.menu} /></>)}
                    {t.key === "tentang" && (<><Form_ k="about" /><Form_ k="history" /></>)}
                    {t.key === "testimoni" && (<><Form_ k="testimonial_section" /><h2 className="fs-4">Review Records</h2><ListCrud config={LISTS.testimonials} /></>)}
                    {t.key === "cari" && <Form_ k="cari_toko" />}
                    {t.key === "faq" && (<><Form_ k="faq_section" /><h2 className="fs-4">FAQ Records</h2><ListCrud config={LISTS.faqs} /></>)}
                    {t.key === "kontak" && <Form_ k="contact" />}
                    {t.key === "footer" && <Form_ k="footer" />}
                    {t.key === "situs" && <Form_ k="site" />}
                  </Tab.Pane>
                ))}
              </Tab.Content>
            </Col>
          </Row>
        </Tab.Container>
      </Container>
    </>
  );
}
