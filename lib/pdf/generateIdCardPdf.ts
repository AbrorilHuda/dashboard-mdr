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

export interface SuratConfig {
  nomorSurat?: string; // Format: tangal/tahun/seri
  namaPenandatangan: string;
  jabatanPenandatangan: string;
  organisasi?: string;
  logoUrl?: string;
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

function formatTanggal(dateString: string): string {
  const date = new Date(dateString);
  const bulan = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];
  return `${date.getDate()} ${bulan[date.getMonth()]} ${date.getFullYear()}`;
}

export async function generateSuratKeteranganPdf(
  data: UserExport,
  config: SuratConfig
): Promise<void> {
  const p = data.profile;
  const displayName = p.full_name ?? p.email ?? "User";
  const email = p.email;
  const location = p.location ?? "-";
  const organisasi = config.organisasi ?? "maduradev";

  // Ukuran A4
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 25;
  const contentWidth = pageWidth - 2 * margin;

  let y = 20;

  // Logo (opsional)
  if (config.logoUrl) {
    try {
      const logo = await toDataUrl(config.logoUrl);
      doc.addImage(logo, "PNG", margin, y, 25, 25, undefined, "FAST");
      y += 30;
    } catch {
      y += 10;
    }
  } else {
    y += 10;
  }

  // Header: SURAT KETERANGAN ANGGOTA AKTIF
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("SURAT KETERANGAN ANGGOTA AKTIF", pageWidth / 2, y, {
    align: "center",
  });
  y += 10;

  // Nomor Surat dengan SKA random
  const generateNomorSurat = () => {
    const date = new Date(data.exported_at);
    const tanggal = date.getDate();
    const tahun = date.getFullYear();
    const skaNumber = Math.floor(Math.random() * 9000) + 1000; // Random 1000-9999
    return `${tanggal}/${tahun}/SKA-${skaNumber}`;
  };

  const nomorSurat = config.nomorSurat ?? generateNomorSurat();
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text(`Nomor: ${nomorSurat}`, pageWidth / 2, y, { align: "center" });
  y += 15;

  // Pembuka
  doc.setFontSize(11);
  doc.text("Yang bertandatangan di bawah ini:", margin, y);
  y += 10;

  // Data Penandatangan (Tabel)
  const tableStartY = y;
  const col1Width = 40;
  const col2Width = 5;

  // Baris 1: Nama Penandatangan
  doc.setFont("helvetica", "normal");
  doc.text("Nama", margin + 5, y);
  doc.text(":", margin + col1Width, y);
  doc.text(config.namaPenandatangan, margin + col1Width + col2Width, y);
  y += 7;

  // Baris 2: Jabatan
  doc.text("Jabatan", margin + 5, y);
  doc.text(":", margin + col1Width, y);
  doc.text(config.jabatanPenandatangan, margin + col1Width + col2Width, y);
  y += 10;

  // Draw table border untuk section penandatangan
  doc.setDrawColor(0);
  doc.setLineWidth(0.3);
  doc.rect(margin, tableStartY - 5, contentWidth, y - tableStartY);
  doc.line(margin, tableStartY + 2, margin + contentWidth, tableStartY + 2);

  y += 5;

  // Menerangkan bahwa
  doc.setFont("helvetica", "bold");
  doc.text("Menerangkan bahwa:", margin, y);
  y += 10;

  // Data Anggota (Tabel)
  const table2StartY = y;

  // Baris 1: Nama
  doc.setFont("helvetica", "normal");
  doc.text("Nama", margin + 5, y);
  doc.text(":", margin + col1Width, y);
  doc.text(displayName, margin + col1Width + col2Width, y);
  y += 7;

  // Baris 2: Email
  doc.text("Email", margin + 5, y);
  doc.text(":", margin + col1Width, y);
  doc.text(email, margin + col1Width + col2Width, y);
  y += 7;

  // Baris 3: Alamat
  doc.text("Alamat", margin + 5, y);
  doc.text(":", margin + col1Width, y);
  const alamatLines = doc.splitTextToSize(
    location,
    contentWidth - col1Width - col2Width - 10
  );
  doc.text(alamatLines, margin + col1Width + col2Width, y);
  y += alamatLines.length * 5 + 2;

  // Draw table border untuk section anggota
  doc.setDrawColor(0);
  doc.setLineWidth(0.3);
  doc.rect(margin, table2StartY - 5, contentWidth, y - table2StartY);
  doc.line(margin, table2StartY + 2, margin + contentWidth, table2StartY + 2);
  doc.line(margin, table2StartY + 9, margin + contentWidth, table2StartY + 9);

  y += 12;

  // Penutup
  doc.setFont("helvetica", "normal");
  const penutupText = `Demikian surat ini dibuat untuk dipergunakan sebagai persyaratan sah dalam berkontribusi di komunitas ${organisasi}`;
  const penutupLines = doc.splitTextToSize(penutupText, contentWidth);
  doc.text(penutupLines, margin, y);
  y += penutupLines.length * 5 + 15;

  // Tanggal
  const tanggalSurat = formatTanggal(data.exported_at);
  doc.text(tanggalSurat, pageWidth - margin, y, { align: "right" });
  y += 8;

  // Jabatan penandatangan
  doc.text(config.jabatanPenandatangan, pageWidth - margin, y, {
    align: "right",
  });
  y += 25; // Ruang untuk tanda tangan

  // Nama penandatangan (di bawah TTD)
  doc.setFont("helvetica", "bold");
  doc.text(config.namaPenandatangan, pageWidth - margin, y, { align: "right" });

  // QR Code untuk verifikasi (opsional, di pojok kiri bawah)
  try {
    const qrContent = JSON.stringify({
      type: "surat_keterangan",
      nomor: nomorSurat,
      nama: displayName,
      email: email,
      tanggal: data.exported_at,
      organisasi: organisasi,
      keaslian: "surat ini di generate oleh sistem MaduraDev",
    });
    const qrData = await QRCode.toDataURL(qrContent, { margin: 1, scale: 4 });
    const qrSize = 25;
    doc.addImage(
      qrData,
      "PNG",
      margin,
      doc.internal.pageSize.getHeight() - margin - qrSize,
      qrSize,
      qrSize
    );
    doc.setFontSize(7);
    doc.setFont("helvetica", "italic");
    doc.text(
      "Scan untuk verifikasi",
      margin + qrSize / 2,
      doc.internal.pageSize.getHeight() - margin + 2,
      { align: "center" }
    );
  } catch {
    /* ignore */
  }

  // Simpan
  const fname = `surat-keterangan-${displayName}-${nomorSurat.replace(
    /\//g,
    "-"
  )}.pdf`;
  doc.save(fname);
}
