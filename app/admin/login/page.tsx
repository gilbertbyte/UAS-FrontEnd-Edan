"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Alert, Button, Card, Form } from "react-bootstrap";
import { api } from "@/lib/client-api";

export default function AdminLoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setBusy(true);
    const f = new FormData(e.currentTarget);
    try {
      await api("/api/admin/auth/login", { method: "POST", json: { username: String(f.get("username")).trim(), password: String(f.get("password")) } });
      router.push("/admin");
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }

  return (
    <div className="login-body">
      <Card className="p-4 shadow" style={{ width: 380, maxWidth: "92vw", borderRadius: 24 }}>
        <h1 className="fs-3" style={{ color: "var(--green-deep)" }}>Content Studio</h1>
        <p className="text-muted">Masuk untuk mengelola website</p>
        <Form onSubmit={submit}>
          <Form.Group className="mb-3"><Form.Label>Username</Form.Label><Form.Control name="username" autoComplete="username" required /></Form.Group>
          <Form.Group className="mb-3"><Form.Label>Password</Form.Label><Form.Control type="password" name="password" autoComplete="current-password" required /></Form.Group>
          <Button type="submit" className="btn-green w-100" disabled={busy}>Login</Button>
          {error && <Alert variant="danger" className="mt-3 mb-0 py-2">{error}</Alert>}
        </Form>
      </Card>
    </div>
  );
}
