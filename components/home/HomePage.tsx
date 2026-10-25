"use client";

import { useEffect, useMemo, useState } from "react";
import { Accordion, Button, Col, Container, Form, InputGroup, Row } from "react-bootstrap";
import ImageCarousel from "../ImageCarousel";
import SiteHeader from "../SiteHeader";
import SiteFooter from "../SiteFooter";
import { useAuth } from "../AuthProvider";
import { useSiteData } from "../useSiteData";
import { useWishlist } from "../useWishlist";
import { MenuCard, StoreCard } from "./Cards";
import { MenuDetailModal, StoreDetailModal } from "./Details";
import ReviewModal from "./ReviewModal";
import { imageList } from "@/lib/images";
import { storeIsOpen } from "@/lib/time";
import type { ContentBlock } from "@/lib/types";

const MENU_PAGE_SIZE = 8;
const TESTI_PAGE_SIZE = 6;

const t = (b: ContentBlock | undefined, k: string, d: string) => (b && typeof b[k] === "string" && b[k] ? (b[k] as string) : d);

function Pager({ page, total, onChange }: { page: number; total: number; onChange: (p: number) => void }) {
  if (total <= 1) return null;
  return (
    <div className="pager">
      <Button className="btn-green rounded-circle" disabled={page === 1} onClick={() => onChange(page - 1)} aria-label="Halaman sebelumnya">‹</Button>
      <span className="info">{page} / {total}</span>
      <Button className="btn-green rounded-circle" disabled={page === total} onClick={() => onChange(page + 1)} aria-label="Halaman berikutnya">›</Button>
    </div>
  );
}

export default function HomePage() {
  const { data, error } = useSiteData();
  const { user, openAuth } = useAuth();
  const { ids, toggle } = useWishlist();

  const [filter, setFilter] = useState({ nama: "", status: "all", sort: "rating" });
  const [heroQuery, setHeroQuery] = useState("");
  const [menuPage, setMenuPage] = useState(1);
  const [testiPage, setTestiPage] = useState(1);
  const [storeId, setStoreId] = useState<number | null>(null);
  const [menuId, setMenuId] = useState<number | null>(null);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [, setTick] = useState(0);

  // status Buka/Tutup diperbarui tiap menit
  useEffect(() => {
    const id = window.setInterval(() => setTick((n) => n + 1), 60000);
    return () => window.clearInterval(id);
  }, []);

  const stores = data?.stores;
  const filtered = useMemo(() => {
    const q = filter.nama.trim().toLowerCase();
    const list = (stores ?? []).filter((s) => {
      const okName = !q || s.nama.toLowerCase().includes(q);
      const open = storeIsOpen(s);
      return okName && (filter.status === "all" || (filter.status === "open" ? open : !open));
    });
    return list.sort((a, b) => (filter.sort === "rating" ? b.rating - a.rating : a.nama.localeCompare(b.nama)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stores, filter, setTick]);

  if (error) return <Container className="py-5"><p className="text-danger">Gagal memuat data dari server.</p></Container>;
  if (!data) return <><SiteHeader /><Container className="py-5 text-center text-muted">Memuat...</Container></>;

  const { content: c, menu, testimonials, faqs } = data;
  const heroC = c.hero, about = c.about;
  const menuTotal = Math.max(1, Math.ceil(menu.length / MENU_PAGE_SIZE));
  const testiTotal = Math.max(1, Math.ceil(testimonials.length / TESTI_PAGE_SIZE));
  const menuSlice = menu.slice((Math.min(menuPage, menuTotal) - 1) * MENU_PAGE_SIZE, Math.min(menuPage, menuTotal) * MENU_PAGE_SIZE);
  const testiSlice = testimonials.slice((Math.min(testiPage, testiTotal) - 1) * TESTI_PAGE_SIZE, Math.min(testiPage, testiTotal) * TESTI_PAGE_SIZE);
  const aboutImages = imageList(about?.images ?? about?.image_url);
  const store = storeId ? stores?.find((s) => s.id === storeId) ?? null : null;
  const menuDetail = menuId ? menu.find((m) => m.id === menuId) ?? null : null;

  const goTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <>
      <SiteHeader logoText={t(c.site, "logo_text", "Pisang Ijo")} />

      {/* HERO */}
      <section className="hero" id="beranda">
        <Container className="hero-inner">
          <span className="hero-badge">{t(heroC, "badge", "Platform Kuliner Makassar")}</span>
          <h1>{t(heroC, "heading", "Temukan Es Pisang Ijo Favorit Kamu")}</h1>
          <p className="hero-sub">{t(heroC, "subheading", "")}</p>
          <Form
            className="hero-search"
            onSubmit={(e) => { e.preventDefault(); setFilter((f) => ({ ...f, nama: heroQuery.trim() })); goTo("cari-toko"); }}
          >
            <InputGroup>
              <Form.Control value={heroQuery} onChange={(e) => setHeroQuery(e.target.value)} placeholder={t(heroC, "search_placeholder", "Cari toko atau menu es pisang ijo")} />
              <Button type="submit" className="btn-mustard">Cari</Button>
            </InputGroup>
          </Form>
          <div className="d-flex justify-content-center gap-3 flex-wrap">
            <Button className="btn-mustard" onClick={() => goTo("cari-toko")}>{t(heroC, "cta_primary", "Cari Toko")}</Button>
            <Button variant="outline-light" onClick={() => goTo("menu")}>{t(heroC, "cta_secondary", "Lihat Menu")}</Button>
          </div>
        </Container>
        <div className="bowl bowl-left" aria-hidden="true" />
        <div className="bowl bowl-right" aria-hidden="true" />
      </section>

      {/* TOKO POPULER */}
      <section className="section" id="toko-populer">
        <Container>
          <div className="d-flex justify-content-between align-items-end flex-wrap gap-3 mb-4">
            <div>
              <h2>{t(c.toko_populer, "heading", "Toko Populer & Rating")}</h2>
              <p className="section-sub mb-0">{t(c.toko_populer, "subheading", "")}</p>
            </div>
            <a href="#cari-toko" className="link-arrow">{t(c.toko_populer, "link_text", "Lihat semua toko")}</a>
          </div>
          <Row className="g-4">
            {data.stores.slice(0, 3).map((s) => (
              <Col key={s.id} md={6} lg={4}>
                <StoreCard variant="popular" store={s} saved={ids.store.has(s.id)} onHeart={() => toggle("store", s.id)} onOpen={() => setStoreId(s.id)} />
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* MENU */}
      <section className="section section-tinted" id="menu">
        <Container>
          <div className="text-center mb-4">
            <h2>{t(c.menu_section, "heading", "Menu Unggulan")}</h2>
            <p className="section-sub mx-auto">{t(c.menu_section, "subheading", "")}</p>
          </div>
          <Row className="g-4">
            {menuSlice.map((m) => (
              <Col key={m.id} sm={6} lg={3}>
                <MenuCard menu={m} saved={ids.menu.has(m.id)} onHeart={() => toggle("menu", m.id)} onOpen={() => setMenuId(m.id)} onOpenStore={setStoreId} />
              </Col>
            ))}
          </Row>
          <Pager page={Math.min(menuPage, menuTotal)} total={menuTotal} onChange={(p) => { setMenuPage(p); goTo("menu"); }} />
        </Container>
      </section>

      {/* TENTANG */}
      <section className="section" id="tentang">
        <Container>
          <Row className="align-items-center g-5 mb-5">
            <Col md={6}>
              <div className={`media-frame${aboutImages.length ? " has-img" : ""}`}>
                {aboutImages.length ? <ImageCarousel value={aboutImages} alt={t(about, "heading", "Tentang platform")} /> : t(about, "media_text", "")}
              </div>
            </Col>
            <Col md={6}>
              <span className="eyebrow eyebrow-pink">{t(about, "eyebrow", "Tentang Platform")}</span>
              <h2>{t(about, "heading", "")}</h2>
              <p className="text-muted">{t(about, "description", "")}</p>
              <div className="d-flex flex-wrap gap-2">
                <span className="pill pill-green">{t(about, "pill_1", "")}</span>
                <span className="pill pill-mustard">{t(about, "pill_2", "")}</span>
                <span className="pill pill-pink">{t(about, "pill_3", "")}</span>
              </div>
            </Col>
          </Row>
          <div className="history-box">
            <h3>{t(c.history, "heading", "Sejarah Pisang Ijo")}</h3>
            <p>{t(c.history, "text", "")}</p>
          </div>
        </Container>
      </section>

      {/* TESTIMONI */}
      <section className="section section-dark" id="testimoni">
        <Container>
          <div className="d-flex justify-content-between align-items-end flex-wrap gap-3 mb-4">
            <div>
              <span className="eyebrow">{t(c.testimonial_section, "eyebrow", "")}</span>
              <h2>{t(c.testimonial_section, "heading", "Testimoni Pelanggan")}</h2>
            </div>
            <Button className="btn-mustard" onClick={() => (user ? setReviewOpen(true) : openAuth("login"))}>{t(c.testimonial_section, "cta", "Tulis Ulasan")}</Button>
          </div>
          <Row className="g-4">
            {testiSlice.map((x) => {
              const n = Number(x.stars) || 5;
              return (
                <Col key={x.id} md={6} lg={4}>
                  <div className="testi-card">
                    <div className="stars">{"★".repeat(n) + "☆".repeat(5 - n)}</div>
                    <div className="fw-bold mb-2">{x.nama}</div>
                    {x.target_nama && <span className="pill pill-mustard d-inline-block mb-2 py-1">{(x.target_type === "menu" ? "Menu: " : "Toko: ") + x.target_nama}</span>}
                    <p>{x.ulasan}</p>
                    <div className="when">{x.waktu}</div>
                  </div>
                </Col>
              );
            })}
          </Row>
          <Pager page={Math.min(testiPage, testiTotal)} total={testiTotal} onChange={(p) => { setTestiPage(p); goTo("testimoni"); }} />
        </Container>
      </section>

      {/* CARI TOKO */}
      <section className="section" id="cari-toko">
        <Container>
          <span className="eyebrow">{t(c.cari_toko, "eyebrow", "")}</span>
          <h2>{t(c.cari_toko, "heading", "Cari Toko Es Pisang Ijo")}</h2>
          <p className="section-sub mb-4">{t(c.cari_toko, "subheading", "")}</p>
          <Form className="filter-bar mb-3" onSubmit={(e) => e.preventDefault()}>
            <Row className="g-3 align-items-end">
              <Col md={6} lg={5}>
                <Form.Label>Nama Toko atau Menu</Form.Label>
                <Form.Control value={filter.nama} onChange={(e) => setFilter({ ...filter, nama: e.target.value })} placeholder="Nama Toko atau Menu" />
              </Col>
              <Col sm={6} lg={3}>
                <Form.Label>Status Toko</Form.Label>
                <Form.Select value={filter.status} onChange={(e) => setFilter({ ...filter, status: e.target.value })}>
                  <option value="all">Semua Status</option>
                  <option value="open">Buka</option>
                  <option value="closed">Tutup</option>
                </Form.Select>
              </Col>
              <Col sm={6} lg={4}>
                <Form.Label>Urutkan</Form.Label>
                <Form.Select value={filter.sort} onChange={(e) => setFilter({ ...filter, sort: e.target.value })}>
                  <option value="rating">Rating Tertinggi</option>
                  <option value="nama">Nama A-Z</option>
                </Form.Select>
              </Col>
            </Row>
          </Form>
          <p className="fw-semibold text-muted"><span style={{ color: "var(--green-dark)" }}>{filtered.length}</span> Toko Ditemukan</p>
          <Row className="g-4">
            {filtered.map((s) => (
              <Col key={s.id} md={6} lg={4}>
                <StoreCard store={s} saved={ids.store.has(s.id)} onHeart={() => toggle("store", s.id)} onOpen={() => setStoreId(s.id)} />
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* FAQ */}
      <section className="section section-tinted" id="faq">
        <Container style={{ maxWidth: 760 }}>
          <div className="text-center mb-4">
            <span className="eyebrow">{t(c.faq_section, "eyebrow", "")}</span>
            <h2>{t(c.faq_section, "heading", "")}</h2>
          </div>
          <Accordion flush>
            {faqs.map((f) => (
              <Accordion.Item eventKey={String(f.id)} key={f.id}>
                <Accordion.Header>{f.question}</Accordion.Header>
                <Accordion.Body className="text-muted">{f.answer}</Accordion.Body>
              </Accordion.Item>
            ))}
          </Accordion>
        </Container>
      </section>

      {/* KONTAK */}
      <section className="section" id="kontak">
        <Container>
          <Row className="kontak-box align-items-center g-4 mx-0">
            <Col md={7}>
              <span className="eyebrow">{t(c.contact, "eyebrow", "Kontak")}</span>
              <h2>{t(c.contact, "heading", "")}</h2>
              <p className="mb-0">Email support demo : {t(c.contact, "email", "")}<br />WhatsApp CS demo : {t(c.contact, "whatsapp", "")}</p>
            </Col>
            <Col md={5}>
              <div className="kontak-note">
                <p>{t(c.contact, "note", "")}</p>
                <p className="mb-0"><strong>Jam layanan umum:</strong> {t(c.contact, "hours", "")}</p>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      <SiteFooter footer={c.footer} site={c.site} />

      <StoreDetailModal store={store} menu={menu} onClose={() => setStoreId(null)} onOpenMenu={(id) => { setStoreId(null); setMenuId(id); }} />
      <MenuDetailModal menu={menuDetail} onClose={() => setMenuId(null)} onOpenStore={(id) => { setMenuId(null); setStoreId(id); }} />
      <ReviewModal show={reviewOpen} onClose={() => setReviewOpen(false)} stores={data.stores} menu={menu} />
    </>
  );
}
