"use client";

import { useEffect, useState } from "react";
import { Button, Col, Form, Row } from "react-bootstrap";
import ImageUploader from "../ImageUploader";
import { api } from "@/lib/client-api";
import { imageList } from "@/lib/images";

export type ContentField = { name: string; label: string; type?: "text" | "textarea" | "images"; rows?: number };
type Values = Record<string, string | string[]>;

const BODY_FIELDS = ["subheading", "description", "text", "note", "tagline"];

/** Form edit satu blok konten (hero, about, dst) + Live Preview teks di sebelah kanan. */
export default function ContentForm({ contentKey, fields }: { contentKey: string; fields: ContentField[] }) {
  const [values, setValues] = useState<Values | null>(null);
  const [status, setStatus] = useState("");

  useEffect(() => {
    api<Values>(`/api/admin/content/${contentKey}`)
      .then(setValues)
      .catch((e: { status?: number }) => { if (e.status === 401) window.location.href = "/admin/login"; });
  }, [contentKey]);

  if (!values) return <p className="text-muted">Memuat...</p>;

  const set = (name: string, v: string | string[]) => setValues({ ...values, [name]: v });

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setStatus("Menyimpan...");
    try {
      await api(`/api/admin/content/${contentKey}`, { method: "PUT", json: values });
      setStatus("Tersimpan ✓");
      setTimeout(() => setStatus(""), 2000);
    } catch {
      setStatus("Gagal menyimpan.");
    }
  }

  const text = (n: string) => (typeof values[n] === "string" ? (values[n] as string) : "");
  const small = fields.find((f) => ["badge", "eyebrow"].includes(f.name));
  const heading = fields.find((f) => f.name === "heading");

  return (
    <Row className="g-4 mb-4">
      <Col lg={7}>
        <Form onSubmit={save}>
          {fields.map((f) => (
            <Form.Group className="mb-3" key={f.name}>
              <Form.Label>{f.label}</Form.Label>
              {f.type === "images" ? (
                <ImageUploader images={imageList(values[f.name])} onChange={(v) => set(f.name, v)} uploadUrl="/api/admin/upload" max={10} />
              ) : (
                f.type === "textarea" ? (
                  <Form.Control as="textarea" rows={f.rows ?? 2} value={text(f.name)} onChange={(e) => set(f.name, e.target.value)} />
                ) : (
                  <Form.Control value={text(f.name)} onChange={(e) => set(f.name, e.target.value)} />
                )
              )}
            </Form.Group>
          ))}
          <div className="d-flex align-items-center gap-3">
            <Button type="submit" className="btn-green">Simpan Perubahan</Button>
            <span className="text-muted small">{status}</span>
          </div>
        </Form>
      </Col>
      <Col lg={5}>
        <div className="preview-pane">
          <div className="preview-label">Live Preview</div>
          {small && <span className="eyebrow">{text(small.name)}</span>}
          {heading && <h3 className="fs-5">{text("heading")}</h3>}
          {fields.filter((f) => f.name !== "heading" && f !== small && f.type !== "images").map((f) => (
            <p key={f.name} className={BODY_FIELDS.includes(f.name) ? "text-muted" : "small mb-1"}>{text(f.name)}</p>
          ))}
          {fields.some((f) => f.type === "images") && (
            <div className="d-flex gap-1 flex-wrap">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {imageList(values.images).map((u) => <img key={u} src={u} alt="" width={56} height={56} style={{ objectFit: "cover", borderRadius: 6 }} />)}
            </div>
          )}
        </div>
      </Col>
    </Row>
  );
}
