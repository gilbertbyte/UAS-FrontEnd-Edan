"use client";

import { Carousel } from "react-bootstrap";
import { imageList } from "@/lib/images";

/** Slideshow gambar memakai Bootstrap Carousel. Mengembalikan null kalau tidak ada gambar. */
export default function ImageCarousel({ value, alt }: { value: unknown; alt: string }) {
  const images = imageList(value);
  if (!images.length) return null;
  const many = images.length > 1;
  return (
    <Carousel className="media-carousel" interval={null} controls={many} indicators={false}>
      {images.map((url, i) => (
        <Carousel.Item key={url + i}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt={alt} />
          {many && <span className="media-counter">{i + 1} / {images.length}</span>}
        </Carousel.Item>
      ))}
    </Carousel>
  );
}

/** Klik pada tombol/panah di dalam kartu tidak boleh ikut membuka detail. */
export function isInnerControl(e: React.MouseEvent) {
  return !!(e.target as HTMLElement).closest(".carousel-control-prev, .carousel-control-next, button, a");
}
