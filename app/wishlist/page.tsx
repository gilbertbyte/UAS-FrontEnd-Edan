"use client";

import { useCallback, useEffect, useState } from "react";
import { Button, Col, Container, Row } from "react-bootstrap";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { useAuth } from "@/components/AuthProvider";
import { useSiteData } from "@/components/useSiteData";
import { MenuCard, StoreCard } from "@/components/home/Cards";
import { api } from "@/lib/client-api";
import type { MenuItem, Store } from "@/lib/types";

export default function WishlistPage() {
  const { user, loading, openAuth } = useAuth();
  const { data } = useSiteData();
  const [list, setList] = useState<{ menu: MenuItem[]; stores: Store[] }>({ menu: [], stores: [] });

  const load = useCallback(async () => {
    try {
      setList(await api("/api/wishlist"));
    } catch {
      setList({ menu: [], stores: [] });
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (user) load();
  }, [user, load]);

  async function remove(type: "menu" | "store", id: number) {
    await api(`/api/wishlist/${type}/${id}`, { method: "DELETE" });
    await load();
  }

  const empty = list.menu.length === 0 && list.stores.length === 0;

  return (
    <>
      <SiteHeader logoText={String(data?.content.site?.logo_text ?? "Pisang Ijo")} />
      <section className="section section-tinted" style={{ paddingTop: 56 }}>
        <Container>
          <div className="text-center mb-4">
            <span className="eyebrow">List Aku</span>
            <h2>List yang Pengen Kamu Coba</h2>
            <p className="section-sub mx-auto">Menu dan toko yang sudah kamu simpan untuk dicoba nanti</p>
          </div>

          {loading ? null : !user ? (
            <div className="text-center">
              <p className="text-muted mb-3">Kamu perlu login dulu untuk melihat list ini.</p>
              <Button className="btn-mustard" onClick={() => openAuth("login")}>Login / Sign In</Button>
            </div>
          ) : (
            <>
              <h3 className="mt-4">Menu</h3>
              <Row className="g-4">
                {list.menu.map((m) => (
                  <Col key={m.id} sm={6} lg={3}><MenuCard compact menu={m} saved onHeart={() => remove("menu", m.id)} /></Col>
                ))}
              </Row>
              <h3 className="mt-5">Toko</h3>
              <Row className="g-4">
                {list.stores.map((s) => (
                  <Col key={s.id} md={6} lg={4}><StoreCard variant="popular" store={s} saved onHeart={() => remove("store", s.id)} onOpen={() => {}} /></Col>
                ))}
              </Row>
              {empty && <p className="text-center text-muted mt-4">Belum ada yang kamu simpan. Klik ikon hati di menu atau toko favoritmu!</p>}
            </>
          )}
        </Container>
      </section>
      <SiteFooter footer={data?.content.footer} site={data?.content.site} />
    </>
  );
}
