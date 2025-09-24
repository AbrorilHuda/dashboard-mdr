// lib/generateIdCardPdfV2.ts
import { jsPDF } from "jspdf";
import QRCode from "qrcode";

export interface UserExport {
  profile: {
    id: string;
    email: string;
    full_name: string | null;
    avatar_url: string | null;
    role: string | null;
    bio: string | null;
    location: string | null;
    website: string | null;
    created_at: string;
    updated_at: string;
  };
  auth: {
    id: string;
    email: string;
    created_at: string;
    last_sign_in_at: string | null;
  };
  exported_at: string;
}

export interface CardTheme {
  primary: [number, number, number]; // RGB
  secondary: [number, number, number]; // RGB
  textDark?: [number, number, number];
  textLight?: [number, number, number];
  logoUrl?: string; // optional logo
}

async function toDataUrl(url: string): Promise<string> {
  const res = await fetch(url, { mode: "cors" });
  const blob = await res.blob();
  return await new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.readAsDataURL(blob);
  });
}

function drawGradientHeader(
  doc: jsPDF,
  x: number,
  y: number,
  w: number,
  h: number,
  from: [number, number, number],
  to: [number, number, number]
) {
  const steps = 24;
  for (let i = 0; i < steps; i++) {
    const t = i / (steps - 1);
    const r = Math.round(from[0] * (1 - t) + to[0] * t);
    const g = Math.round(from[1] * (1 - t) + to[1] * t);
    const b = Math.round(from[2] * (1 - t) + to[2] * t);
    doc.setFillColor(r, g, b);
    doc.rect(x, y + (h / steps) * i, w, h / steps + 0.2, "F");
  }
}

function initials(nameOrEmail: string): string {
  const raw = nameOrEmail.includes("@")
    ? nameOrEmail.split("@")[0]
    : nameOrEmail;
  const parts = raw.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase()).join("") || "U";
}

function vCard(p: UserExport["profile"]): string {
  const fn = (p.full_name || p.email || "User").replace(/\n/g, " ");
  const org = "Member";
  const email = p.email;
  const url = p.website || "";
  const adr = p.location || "";
  return [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${fn}`,
    `ORG:${org}`,
    `EMAIL:${email}`,
    url ? `URL:${url}` : "",
    adr ? `ADR:${adr}` : "",
    "END:VCARD",
  ]
    .filter(Boolean)
    .join("\n");
}

export async function generateIdCardPdf(
  data: UserExport,
  theme: CardTheme = {
    primary: [35, 99, 255],
    secondary: [72, 53, 189],
  }
): Promise<void> {
  const p = data.profile;
  const displayName = p.full_name ?? p.email ?? "User";
  const role = p.role ?? "Member";
  const email = p.email;
  const location = p.location ?? "";
  const website = p.website ?? "";

  // ukuran kartu
  const W = 85.6;
  const H = 54;
  const doc = new jsPDF({ unit: "mm", format: [W, H] });

  const textDark = theme.textDark ?? [25, 31, 40];
  const textLight = theme.textLight ?? [255, 255, 255];

  // ---------- PAGE 1 (DEPAN) ----------
  // latar + border
  doc.setFillColor(246, 248, 251);
  doc.roundedRect(1, 1, W - 2, H - 2, 3, 3, "F");

  // header gradient
  drawGradientHeader(doc, 1, 1, W - 2, 16, theme.primary, theme.secondary);

  // logo (opsional)
  if (theme.logoUrl) {
    try {
      const logo = await toDataUrl(theme.logoUrl);
      doc.addImage(logo, "PNG", 5, 3.5, 12, 8, undefined, "FAST");
    } catch {
      /* ignore */
    }
  }

  // title
  doc.setTextColor(...textLight);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("ID CARD", W - 7, 8, { align: "right" });

  // chip dekoratif
  doc.setFillColor(210, 200, 150);
  doc.roundedRect(5, 19, 9, 7, 1.2, 1.2, "F");
  doc.setFillColor(235, 230, 190);
  doc.rect(6, 20, 7, 1.6, "F");
  doc.rect(6, 22.2, 7, 1.6, "F");
  doc.rect(6, 24.4, 7, 1.6, "F");

  // avatar / inisial
  const avatarSize = 16;
  const avatarX = 17;
  const avatarY = 18;
  let drewAvatar = false;
  if (p.avatar_url) {
    try {
      const avatarDataUrl = await toDataUrl(p.avatar_url);
      // lingkaran soft
      doc.setDrawColor(230);
      doc.setFillColor(235, 238, 244);
      doc.circle(
        avatarX + avatarSize / 2,
        avatarY + avatarSize / 2,
        avatarSize / 2 + 1.4,
        "F"
      );
      doc.addImage(
        avatarDataUrl,
        "PNG",
        avatarX,
        avatarY,
        avatarSize,
        avatarSize,
        undefined,
        "FAST"
      );
      drewAvatar = true;
    } catch {
      /* fallback */
    }
  }
  if (!drewAvatar) {
    doc.setDrawColor(230);
    doc.setFillColor(235, 238, 244);
    doc.circle(
      avatarX + avatarSize / 2,
      avatarY + avatarSize / 2,
      avatarSize / 2 + 1.4,
      "F"
    );
    doc.setTextColor(60, 72, 88);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.text(
      initials(displayName),
      avatarX + avatarSize / 2,
      avatarY + avatarSize / 2 + 3,
      { align: "center" }
    );
  }

  // nama & role
  const infoX = avatarX + avatarSize + 4;
  let y = avatarY + 3;
  doc.setTextColor(...textDark);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text(displayName, infoX, y);
  y += 5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(90);
  doc.text(role, infoX, y);

  // nomor (pakai potongan UUID)
  y += 5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.2);
  doc.setTextColor(120);
  const shortId =
    p.id
      .replace(/-/g, "")
      .slice(0, 16)
      .match(/.{1,4}/g)
      ?.join(" ") ?? p.id.slice(0, 16);
  doc.text(`ID: ${shortId}`, infoX, y);

  // footer garis
  doc.setDrawColor(230);
  doc.line(4, H - 9, W - 4, H - 9);

  // tanggal
  doc.setFontSize(6.8);
  doc.setTextColor(110);
  const issued = new Date(data.auth.created_at).toISOString().split("T")[0];
  const exported = new Date(data.exported_at).toISOString().split("T")[0];
  doc.text(`Issued: ${issued}`, 4, H - 5.8);
  doc.text(`Exported: ${exported}`, W - 4, H - 5.8, { align: "right" });

  // ---------- PAGE 2 (BELAKANG) ----------
  doc.addPage([W, H], "portrait");

  // latar pola halus
  doc.setFillColor(248, 249, 252);
  doc.roundedRect(1, 1, W - 2, H - 2, 3, 3, "F");
  // strip tanda tangan
  doc.setFillColor(230, 233, 238);
  doc.rect(6, 8, W - 12, 8, "F");
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100);
  doc.setFontSize(7);
  doc.text("Signature", W - 8, 16, { align: "right" });

  // QR (vCard)
  try {
    const qrData = await QRCode.toDataURL(vCard(p), { margin: 0, scale: 5 });
    const qrSize = 22;
    const qrX = 6;
    const qrY = 22;
    doc.addImage(qrData, "PNG", qrX, qrY, qrSize, qrSize, undefined, "FAST");
    doc.setFontSize(6.8);
    doc.setTextColor(110);
    doc.text("Scan to save contact", qrX + qrSize / 2, qrY + qrSize + 3.5, {
      align: "center",
    });
  } catch {
    /* ignore */
  }

  // Detail kontak
  const dx = 31.5;
  let dy = 22.5;
  doc.setTextColor(...textDark);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("Contact", dx, dy);
  dy += 5;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.2);
  doc.setTextColor(70);
  const line = (label: string, value: string) => {
    if (!value) return;
    doc.text(`${label}:`, dx, dy);
    const wrap = doc.splitTextToSize(value, W - dx - 6);
    doc.text(wrap, dx + 16, dy);
    dy += Math.max(4, (wrap.length - 1) * 3 + 4);
  };

  line("Email", email);
  if (website) line("Website", website);
  if (location) line("Address", location);

  // Notes kecil
  dy += 2;
  doc.setFontSize(6.6);
  doc.setTextColor(120);
  doc.text(
    "This card is personal. If found, please contact the owner via the email above.",
    dx,
    dy
  );

  // Simpan
  const fname = `idcard-${email}-${exported}.pdf`;
  doc.save(fname);
}
