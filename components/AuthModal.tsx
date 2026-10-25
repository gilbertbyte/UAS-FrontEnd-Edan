"use client";

import { useState } from "react";
import { Alert, Button, Form, Modal, Nav, ToggleButton, ToggleButtonGroup } from "react-bootstrap";
import { api } from "@/lib/client-api";

type Props = { show: boolean; initialTab: "login" | "register"; onClose: () => void; onSuccess: () => Promise<void> };

export default function AuthModal({ show, initialTab, onClose, onSuccess }: Props) {
  // key = initialTab+show supaya form ter-reset tiap kali modal dibuka
  return (
    <Modal show={show} onHide={onClose} centered>
      {show && <AuthBody key={initialTab} initialTab={initialTab} onClose={onClose} onSuccess={onSuccess} />}
    </Modal>
  );
}

function AuthBody({ initialTab, onClose, onSuccess }: Omit<Props, "show">) {
  const [tab, setTab] = useState<"login" | "register">(initialTab);
  const [type, setType] = useState<"user" | "toko">("user");
  const [error, setError] = useState("");
  const [done, setDone] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const f = new FormData(e.currentTarget);
    const v = (k: string) => String(f.get(k) ?? "").trim();
    setBusy(true);
    try {
      if (tab === "login") {
        const res = await api<{ role: string }>("/api/user/login", { method: "POST", json: { email: v("email"), password: String(f.get("password")) } });
        await onSuccess();
        onClose();
        if (res.role === "toko") window.location.href = "/toko-dashboard";
      } else if (type === "toko") {
        const res = await api<{ message: string }>("/api/user/register-toko", {
          method: "POST",
          json: { nama: v("nama"), email: v("email"), password: String(f.get("password")), nama_toko: v("nama_toko"), alamat: v("alamat") },
        });
        setDone(res.message);
      } else {
        await api("/api/user/register", { method: "POST", json: { nama: v("nama"), email: v("email"), password: String(f.get("password")) } });
        await onSuccess();
        onClose();
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Modal.Header closeButton>
        <Modal.Title as="h3" className="fs-4">{tab === "login" ? "Login" : "Daftar Akun"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Nav variant="pills" fill className="mb-3" activeKey={tab} onSelect={(k) => { setTab(k as "login" | "register"); setError(""); setDone(""); }}>
          <Nav.Item><Nav.Link eventKey="login">Login</Nav.Link></Nav.Item>
          <Nav.Item><Nav.Link eventKey="register">Daftar Akun</Nav.Link></Nav.Item>
        </Nav>

        {error && <Alert variant="danger" className="py-2">{error}</Alert>}
        {done ? (
          <Alert variant="success">{done}</Alert>
        ) : (
          <Form onSubmit={submit}>
            {tab === "register" && (
              <>
                <Form.Label>Daftar sebagai</Form.Label>
                <ToggleButtonGroup type="radio" name="reg-type" value={type} onChange={(v) => setType(v)} className="w-100 mb-3">
                  <ToggleButton id="rt-user" value="user" variant="outline-success">Pengguna Biasa</ToggleButton>
                  <ToggleButton id="rt-toko" value="toko" variant="outline-success">Pemilik Toko</ToggleButton>
                </ToggleButtonGroup>
                <Form.Group className="mb-3">
                  <Form.Label>Nama</Form.Label>
                  <Form.Control name="nama" required autoComplete="name" />
                </Form.Group>
              </>
            )}
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control type="email" name="email" required autoComplete="email" />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control type="password" name="password" required minLength={tab === "register" ? 8 : undefined} autoComplete={tab === "login" ? "current-password" : "new-password"} />
              {tab === "register" && <Form.Text>Minimal 8 karakter</Form.Text>}
            </Form.Group>
            {tab === "register" && type === "toko" && (
              <>
                <Form.Group className="mb-3">
                  <Form.Label>Nama Toko</Form.Label>
                  <Form.Control name="nama_toko" required />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Alamat Toko</Form.Label>
                  <Form.Control as="textarea" rows={2} name="alamat" />
                  <Form.Text>Pendaftaran toko akan ditinjau admin sebelum bisa login dan tampil ke publik.</Form.Text>
                </Form.Group>
              </>
            )}
            <Button type="submit" variant="warning" className="btn-mustard w-100" disabled={busy}>
              {busy ? "Memproses..." : tab === "login" ? "Login" : "Daftar"}
            </Button>
          </Form>
        )}
      </Modal.Body>
    </>
  );
}
