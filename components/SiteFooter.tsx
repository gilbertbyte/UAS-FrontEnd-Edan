import Link from "next/link";
import { Col, Container, Row } from "react-bootstrap";
import type { ContentBlock } from "@/lib/types";

const s = (b: ContentBlock | undefined, k: string, d: string) => (b && typeof b[k] === "string" && b[k] ? (b[k] as string) : d);

export default function SiteFooter({ footer, site }: { footer?: ContentBlock; site?: ContentBlock }) {
  return (
    <footer className="site-footer">
      <Container>
        <Row className="g-4 mb-4">
          <Col lg={5} md={12}>
            <span className="navbar-brand text-white fw-bold fs-5" style={{ fontFamily: "var(--font-display)" }}>{s(site, "logo_text", "Pisang Ijo")}</span>
            <p className="mt-2 mb-1" style={{ color: "#9fb6a8" }}>{s(footer, "tagline", "Platform demo untuk menjelajahi menu dan toko es pisang ijo")}</p>
            <p className="small" style={{ color: "#9fb6a8" }}>{s(footer, "social_text", "Sosial demo : Instagram - TikTok - Facebook")}</p>
          </Col>
          <Col lg={2} sm={6}>
            <h4>Tautan Cepat</h4>
            <ul className="list-unstyled small">
              <li><Link href="/#menu">Menu</Link></li>
              <li><Link href="/#cari-toko">Cari Toko</Link></li>
              <li><Link href="/#tentang">Tentang Kami</Link></li>
              <li><Link href="/#faq">FAQ</Link></li>
            </ul>
          </Col>
          <Col lg={3} sm={6}>
            <h4>Bantuan &amp; Kontak</h4>
            <ul className="list-unstyled small">
              <li>{s(footer, "help_email", "halo@pisangijokita.com")}</li>
              <li>WhatsApp CS demo: {s(footer, "help_whatsapp", "+62 800 0000 0000")}</li>
            </ul>
          </Col>
          <Col lg={2} sm={6}>
            <h4>Legal</h4>
            <ul className="list-unstyled small">
              <li><a href="#">{s(footer, "legal_terms_label", "Syarat & Ketentuan")}</a></li>
              <li><a href="#">{s(footer, "legal_privacy_label", "Kebijakan Privasi")}</a></li>
            </ul>
          </Col>
        </Row>
        <div className="footer-bottom">&copy; {s(footer, "copyright", "2026 Pisang Ijo")}</div>
      </Container>
    </footer>
  );
}
