-- Insert admin user profile (you'll need to replace the UUID with actual user ID after Google OAuth)
-- This is just an example structure
INSERT INTO public.profiles (id, email, full_name, role, bio, location) VALUES
  ('00000000-0000-0000-0000-000000000001', 'admin@maduradev.org', 'Admin MaduraDev', 'admin', 'Administrator komunitas MaduraDev', 'Madura, Indonesia')
ON CONFLICT (id) DO NOTHING;

-- Insert sample events
INSERT INTO public.events (title, description, content, status, author_id) VALUES
  (
    'Workshop React.js untuk Pemula',
    'Belajar dasar-dasar React.js dari nol hingga bisa membuat aplikasi sederhana',
    '# Workshop React.js untuk Pemula

## Deskripsi
Workshop ini dirancang khusus untuk developer pemula yang ingin mempelajari React.js dari dasar.

## Materi yang akan dipelajari:
- Pengenalan React.js
- JSX dan Components
- State dan Props
- Event Handling
- Hooks dasar (useState, useEffect)

## Persyaratan:
- Menguasai HTML, CSS, dan JavaScript dasar
- Laptop dengan Node.js terinstall

## Waktu dan Tempat:
- Tanggal: 15 Januari 2025
- Waktu: 09:00 - 17:00 WIB
- Tempat: Coworking Space Madura Tech Hub',
    'published',
    '00000000-0000-0000-0000-000000000001'
  ),
  (
    'Meetup JavaScript Modern',
    'Diskusi tentang perkembangan terbaru JavaScript dan best practices',
    '# Meetup JavaScript Modern

## Agenda
- ES2024 Features
- TypeScript Tips & Tricks
- Performance Optimization
- Q&A Session

## Speaker
- Budi Santoso (Senior Frontend Developer)
- Sari Wijaya (JavaScript Enthusiast)

## Registrasi
Gratis untuk semua member komunitas MaduraDev',
    'published',
    '00000000-0000-0000-0000-000000000001'
  ),
  (
    'Hackathon MaduraDev 2025',
    'Kompetisi coding 48 jam untuk mengembangkan solusi teknologi lokal',
    '# Hackathon MaduraDev 2025

## Tema: "Teknologi untuk Madura"

Kembangkan solusi teknologi yang dapat membantu masyarakat Madura dalam berbagai bidang seperti:
- Pertanian
- Perikanan  
- Pariwisata
- Pendidikan
- UMKM

## Hadiah:
- Juara 1: Rp 10.000.000
- Juara 2: Rp 5.000.000
- Juara 3: Rp 2.500.000

## Timeline:
- Registrasi: 1-20 Februari 2025
- Technical Meeting: 25 Februari 2025
- Hackathon: 1-2 Maret 2025
- Presentasi: 3 Maret 2025',
    'draft',
    '00000000-0000-0000-0000-000000000001'
  );
