"use client";

import Link from "next/link";
import { Button, Container, Dropdown, Nav, Navbar } from "react-bootstrap";
import { useAuth } from "./AuthProvider";

export default function SiteHeader({ logoText = "Pisang Ijo" }: { logoText?: string }) {
  const { user, openAuth, logout } = useAuth();

  return (
    <Navbar expand="lg" variant="dark" className="site-navbar py-3">
      <Container>
        <Navbar.Brand as={Link} href="/">{logoText}</Navbar.Brand>
        <Navbar.Toggle aria-controls="main-nav" />
        <Navbar.Collapse id="main-nav">
          <Nav className="mx-auto">
            <Nav.Link as={Link} href="/#beranda">Home</Nav.Link>
            <Nav.Link as={Link} href="/#cari-toko">Cari Toko</Nav.Link>
            <Nav.Link as={Link} href="/#menu">Menu</Nav.Link>
            <Nav.Link as={Link} href="/#tentang">About</Nav.Link>
            <Nav.Link as={Link} href="/#faq">FAQ</Nav.Link>
            {user && <Nav.Link as={Link} href="/wishlist">List Aku</Nav.Link>}
            <Nav.Link as={Link} href="/#kontak">Contact</Nav.Link>
          </Nav>
          {user ? (
            <Dropdown align="end">
              <Dropdown.Toggle variant="outline-light" size="sm" className="d-flex align-items-center gap-2">
                <span className="user-avatar">{(user.nama ?? "?").charAt(0).toUpperCase()}</span>
                <span>Hai, {user.nama}</span>
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.ItemText className="small text-muted">{user.email}</Dropdown.ItemText>
                {user.role === "toko" && <Dropdown.Item as={Link} href="/toko-dashboard">Dashboard Toko</Dropdown.Item>}
                <Dropdown.Item as={Link} href="/wishlist">List Aku</Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item onClick={async () => { await logout(); openAuth("login"); }}>Ganti Akun</Dropdown.Item>
                <Dropdown.Item onClick={logout}>Logout</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          ) : (
            <Button variant="outline-light" onClick={() => openAuth("login")}>Login / Sign In</Button>
          )}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
