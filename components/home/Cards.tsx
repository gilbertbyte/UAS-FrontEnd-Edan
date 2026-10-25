"use client";

import { Button, Card } from "react-bootstrap";
import ImageCarousel, { isInnerControl } from "../ImageCarousel";
import { imageList } from "@/lib/images";
import { formatStoreHours, storeIsOpen } from "@/lib/time";
import type { MenuItem, Store } from "@/lib/types";

export function HeartButton({ saved, onClick }: { saved: boolean; onClick: () => void }) {
  return (
    <Button
      variant="light"
      className={`heart-btn${saved ? " saved" : ""}`}
      title={saved ? "Hapus dari List Aku" : "Simpan ke List Aku"}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
    >
      {saved ? "♥" : "♡"}
    </Button>
  );
}

function Media({ value, alt, placeholder }: { value: unknown; alt: string; placeholder: string }) {
  const has = imageList(value).length > 0;
  return (
    <div className={`card-media${has ? " has-img" : ""}`}>
      {has ? <ImageCarousel value={value} alt={alt} /> : placeholder}
    </div>
  );
}

type StoreCardProps = {
  store: Store;
  saved: boolean;
  onHeart: () => void;
  onOpen: () => void;
  variant?: "popular" | "result";
};

export function StoreCard({ store, saved, onHeart, onOpen, variant = "result" }: StoreCardProps) {
  const open = storeIsOpen(store);
  return (
    <Card className="item-card" onClick={(e) => !isInnerControl(e) && onOpen()}>
      <Media value={store.image_url} alt={store.nama} placeholder={variant === "popular" ? "Ceritanya gambar lokasi" : ""} />
      <Card.Body className="position-relative">
        <HeartButton saved={saved} onClick={onHeart} />
        <Card.Title as="h3" className="fs-6">{store.nama}</Card.Title>
        {variant === "result" && <p className="meta">{store.alamat}</p>}
        <p className="meta">Jam Buka: {formatStoreHours(store)}</p>
        <p className={`mb-1 ${open ? "status-open" : "status-closed"}`}>{open ? (variant === "popular" ? "Buka sekarang" : "Buka") : "Tutup"}</p>
        <span className="rating">★ {store.rating}</span>
        {variant === "result" && <div><span className="link-arrow d-inline-block mt-2">Lihat Detail</span></div>}
      </Card.Body>
    </Card>
  );
}

type MenuCardProps = {
  menu: MenuItem;
  saved: boolean;
  onHeart: () => void;
  onOpen?: () => void;
  onOpenStore?: (id: number) => void;
  /** tampilan list wishlist: tampilkan "Dari: toko" sebagai deskripsi */
  compact?: boolean;
};

export function MenuCard({ menu, saved, onHeart, onOpen, onOpenStore, compact }: MenuCardProps) {
  return (
    <Card className="item-card menu" onClick={(e) => !isInnerControl(e) && onOpen?.()}>
      <Media value={menu.image_url} alt={menu.nama} placeholder="Ceritanya gambar Menu" />
      <Card.Body className="position-relative">
        <HeartButton saved={saved} onClick={onHeart} />
        <Card.Title as="h3" className="fs-6">{menu.nama}</Card.Title>
        <p className="meta">{compact && menu.store_nama ? `Dari: ${menu.store_nama}` : menu.deskripsi}</p>
        <span className="price">{menu.harga}</span>
        {!compact &&
          (menu.store_nama ? (
            <>
              <p className="meta mt-2">Tersedia di: <strong>{menu.store_nama}</strong></p>
              <a href="#" className="link-arrow small" onClick={(e) => { e.preventDefault(); e.stopPropagation(); onOpenStore?.(menu.store_id as number); }}>
                Lihat Toko Ini
              </a>
            </>
          ) : (
            <p className="meta mt-2">Toko belum ditentukan</p>
          ))}
      </Card.Body>
    </Card>
  );
}
