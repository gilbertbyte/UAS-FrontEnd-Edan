"use client";

import { Modal } from "react-bootstrap";
import ImageCarousel from "../ImageCarousel";
import { imageList } from "@/lib/images";
import { formatStoreHours, storeIsOpen } from "@/lib/time";
import type { MenuItem, Store } from "@/lib/types";

function Hero({ value, alt, placeholder }: { value: unknown; alt: string; placeholder: string }) {
  return (
    <div className="detail-hero">
      {imageList(value).length ? <ImageCarousel value={value} alt={alt} /> : <span className="fw-semibold">{placeholder}</span>}
    </div>
  );
}

export function StoreDetailModal({ store, menu, onClose, onOpenMenu }: {
  store: Store | null; menu: MenuItem[]; onClose: () => void; onOpenMenu: (id: number) => void;
}) {
  const open = store ? storeIsOpen(store) : false;
  const items = store ? menu.filter((m) => m.store_id === store.id) : [];
  return (
    <Modal show={!!store} onHide={onClose} size="lg" centered scrollable>
      {store && (
        <>
          <Modal.Header closeButton className="border-0 pb-0 position-absolute end-0 top-0 z-3" />
          <Hero value={store.image_url} alt={store.nama} placeholder="Ceritanya Gambar Toko" />
          <Modal.Body className="p-4">
            <div className="d-flex justify-content-between flex-wrap gap-3">
              <div>
                <span className={`badge rounded-pill mb-2 ${open ? "text-bg-success" : "text-bg-danger"}`}>{open ? "Buka sekarang" : "Tutup"}</span>
                <h3 className="mb-1">{store.nama}</h3>
                <p className="meta">{store.alamat || "-"}</p>
              </div>
              <div className="text-end">
                <span className="rating fs-5 d-block">★ {store.rating || 0}</span>
                <span className="meta">{store.ulasan_count} ulasan</span>
              </div>
            </div>
            <div className="mt-3 p-3 rounded" style={{ background: "var(--green-tint)" }}>
              <strong className="d-block small">Jam Buka</strong>{formatStoreHours(store)}
            </div>
            <h4 className="mt-4 fs-5">Menu Tersedia</h4>
            <div className="d-grid gap-2">
              {items.length === 0 && <p className="meta">Belum ada menu untuk toko ini.</p>}
              {items.map((m) => (
                <div className="mini-menu" key={m.id} onClick={() => onOpenMenu(m.id)}>
                  <div className="thumb">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {imageList(m.image_url)[0] && <img src={imageList(m.image_url)[0]} alt={m.nama} />}
                  </div>
                  <div><h5 className="fs-6 mb-0">{m.nama}</h5><span className="price small">{m.harga}</span></div>
                </div>
              ))}
            </div>
          </Modal.Body>
        </>
      )}
    </Modal>
  );
}

export function MenuDetailModal({ menu, onClose, onOpenStore }: {
  menu: MenuItem | null; onClose: () => void; onOpenStore: (id: number) => void;
}) {
  return (
    <Modal show={!!menu} onHide={onClose} size="lg" centered scrollable>
      {menu && (
        <>
          <Modal.Header closeButton className="border-0 pb-0 position-absolute end-0 top-0 z-3" />
          <Hero value={menu.image_url} alt={menu.nama} placeholder="Ceritanya Gambar Menu" />
          <Modal.Body className="p-4">
            <h3>{menu.nama}</h3>
            <p className="price fs-5">{menu.harga}</p>
            <p>{menu.deskripsi || "Tidak ada deskripsi untuk menu ini."}</p>
            <div className="mt-3">
              {menu.store_id ? (
                <div className="d-flex justify-content-between align-items-center p-3 rounded" role="button" style={{ background: "var(--green-tint)" }} onClick={() => onOpenStore(menu.store_id as number)}>
                  <div><strong>{menu.store_nama}</strong><p className="meta mb-0">{menu.store_alamat}</p></div>
                  <span className="link-arrow">Lihat Toko</span>
                </div>
              ) : (
                <p className="meta">Toko belum ditentukan.</p>
              )}
            </div>
          </Modal.Body>
        </>
      )}
    </Modal>
  );
}
