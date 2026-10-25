"use client";

import Link from "next/link";
import { useState } from "react";
import { Alert, Button, Card, Container, Form, Navbar } from "react-bootstrap";
import { api } from "@/lib/client-api";

export default function RegisterTokoPage() {
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setMsg(null);
    setBusy(true);
    try {
      const payload = Object.fromEntries(new FormData(form).entries());
      const res = await api<{ message: string }>("/api/user/register-toko", { method: "POST", json: payload });
      setMsg({ ok: true, text: res.message });
      form.reset();
    } catch (err) {
      setMsg({ ok: false, text: (err as Error).message });
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Navbar variant="dark" className="site-navbar py-3">
        <Container><Navbar.Brand as={Link} href="/">Pisang Ijo</Navbar.Brand></Container>
      </Navbar>
      <Container style={{ maxWidth: 500 }} className="py-5">
        <Card className="p-4" style={{ borderRadius: 24 }}>
          <span className="eyebrow">Gabung Jadi Mitra</span>
          <h2>Daftarkan Toko Kamu</h2>
          <p className="section-sub mb-4">Isi data di bawah ini. Setelah dikirim, pendaftaran akan ditinjau admin sebelum toko kamu tampil di platform.</p>
          <Form onSubmit={submit}>
            <Form.Group className="mb-3"><Form.Label>Nama Kamu</Form.Label><Form.Control name="nama" required /></Form.Group>
            <Form.Group className="mb-3"><Form.Label>Email</Form.Label><Form.Control type="email" name="email" required /></Form.Group>
            <Form.Group className="mb-3"><Form.Label>Password (min. 8 karakter)</Form.Label><Form.Control type="password" name="password" minLength={8} required /></Form.Group>
            <Form.Group className="mb-3"><Form.Label>Nama Toko</Form.Label><Form.Control name="nama_toko" required /></Form.Group>
            <Form.Group className="mb-3"><Form.Label>Alamat Toko</Form.Label><Form.Control as="textarea" rows={3} name="alamat" /></Form.Group>
            <Button type="submit" className="btn-mustard w-100" disabled={busy}>Kirim Pendaftaran</Button>
            {msg && <Alert className="mt-3 mb-0" variant={msg.ok ? "success" : "danger"}>{msg.text}</Alert>}
          </Form>
        </Card>
      </Container>
    </>
  );
}
