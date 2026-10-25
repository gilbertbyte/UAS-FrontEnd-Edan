"use client";

import { Button, Modal } from "react-bootstrap";

type Props = { message: string | null; confirmLabel?: string; onConfirm: () => void; onCancel: () => void };

export default function ConfirmModal({ message, confirmLabel = "Ya, Hapus", onConfirm, onCancel }: Props) {
  return (
    <Modal show={message !== null} onHide={onCancel} centered size="sm">
      <Modal.Header closeButton><Modal.Title as="h3" className="fs-5">Konfirmasi</Modal.Title></Modal.Header>
      <Modal.Body className="text-muted">{message}</Modal.Body>
      <Modal.Footer>
        <Button variant="outline-secondary" onClick={onCancel}>Batal</Button>
        <Button variant="danger" onClick={onConfirm}>{confirmLabel}</Button>
      </Modal.Footer>
    </Modal>
  );
}
