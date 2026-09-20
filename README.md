<div align="center">
  <h1>🚀 BelajarKuy</h1>
  <p><strong>Personal Learning Management System</strong></p>
  <p><em>Plan → Study → Record → Analyze → Improve</em></p>
</div>

---

## 📖 Project Description

**BelajarKuy** adalah aplikasi _Personal Learning Management System_ yang dirancang untuk membantu pelajar dan mahasiswa mengelola siklus belajar mereka secara efektif. Dengan pendekatan **Plan → Study → Record → Analyze → Improve**, aplikasi ini menyediakan alat komprehensif mulai dari manajemen tugas, timer fokus (Pomodoro), hingga analitik perkembangan belajar dan galeri inspirasi.

## ✨ Key Features

- 📝 **To-do List & Task Management**: Kelola tugas dan target belajar harian.
- ⏱️ **Study Timer (Pomodoro)**: Tingkatkan fokus dengan timer belajar yang terintegrasi.
- 📅 **Schedule Management**: Susun jadwal mata pelajaran dan rutinitas belajar.
- 📊 **Analytics Dashboard**: Pantau _streak_ belajar, durasi, dan perkembangan nilai secara visual.
- 🖼️ **Learning Results Gallery**: Unggah, bagikan, dan temukan inspirasi catatan/hasil belajar dari komunitas.
- 🛡️ **Role Management & Moderation**: Sistem admin untuk memantau statistik platform, mengelola pengguna, dan memoderasi laporan konten.

## 🛠️ Tech Stack

**Frontend:**

- React 19
- Vite
- Tailwind CSS v4
- React Router DOM
- Recharts (Data Visualization)
- Lucide React (Icons)
- Axios

**Backend:**

- PHP 8.2+
- Laravel 11
- MySQL / SQLite (Default configured for SQLite)
- Laravel Sanctum (Token-based Authentication)

## 📂 Project Architecture

Proyek ini menggunakan arsitektur _monorepo_ yang memisahkan _client-side_ dan _server-side_:

```text
BelajarKuy/
├── backend/                # Laravel API Server
│   ├── app/                # Controllers, Models, Middleware, Policies
│   ├── bootstrap/          # App configuration & routing setup
│   ├── config/             # Framework configuration
│   ├── database/           # Migrations, Seeders, Factories
│   ├── routes/             # API endpoints (api.php)
│   └── tests/              # Feature & Unit tests
├── frontend/               # React Client Application
│   ├── public/             # Static assets
│   └── src/
│       ├── api/            # Axios client configuration
│       ├── components/     # Reusable UI components
│       ├── contexts/       # React Context (Auth, dll)
│       ├── hooks/          # Custom React hooks
│       ├── layouts/        # Page layouts (Main, Admin, Auth)
│       ├── pages/          # Application views/pages
│       └── services/       # API service modules
└── docs/                   # System documentation
```

## 📋 Prerequisites

Sebelum menjalankan proyek ini di mesin lokal, pastikan Anda telah menginstal:

- **Node.js** (v18 atau lebih baru) & **npm**
- **PHP** (v8.2 atau lebih baru)
- **Composer**
- **MySQL** (Opsional, proyek ini menggunakan SQLite secara default untuk kemudahan setup)
- **Git**

## 🚀 Installation & Setup Guide

Ikuti langkah-langkah berikut untuk menjalankan proyek secara lokal.

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/belajarkuy.git
cd belajarkuy
```

### 2. Setup Backend (Laravel)

Buka terminal dan navigasi ke direktori `backend`:

```bash
cd backend

# Install dependensi PHP
composer install

# Setup environment variables
cp .env.example .env

# Generate application key
php artisan key:generate

# Setup Database (Menggunakan SQLite bawaan)
touch database/database.sqlite

# Jalankan migrasi dan seeder (Membuat tabel & akun default)
php artisan migrate:fresh --seed

# Buat symbolic link untuk storage (File upload)
php artisan storage:link

# Jalankan server backend (Berjalan di http://localhost:8000)
php artisan serve
```

### 3. Setup Frontend (React + Vite)

Buka terminal baru dan navigasi ke direktori `frontend`:

```bash
cd frontend

# Install dependensi Node.js
npm install

# Setup environment variables
cp .env.example .env
# Pastikan VITE_API_URL=http://localhost:8000/api di dalam file .env

# Jalankan development server (Berjalan di http://localhost:5173)
npm run dev
```

## 📚 API Documentation

Dokumentasi arsitektur dan skema database dapat ditemukan di direktori `docs/`.
Endpoint API utama meliputi:

- `POST /api/login` - Autentikasi pengguna
- `GET /api/me` - Profil pengguna saat ini
- `GET /api/analytics` - Data statistik belajar
- `GET /api/gallery` - Feed inspirasi publik
- `GET /api/admin/stats` - Statistik global platform (Admin only)

_Semua endpoint yang dilindungi memerlukan header `Authorization: Bearer <token>`._

## 🔐 Authentication & Default Users

Proses _seeding_ database (`php artisan db:seed`) secara otomatis membuat dua akun bawaan yang dapat digunakan untuk pengujian:

**1. Administrator Account**

- **Email:** `admin@belajarkuy.test`
- **Password:** `Admin123!`

**2. Demo User Account**

- **Email:** `user@belajarkuy.test`
- **Password:** `User123!`

## � Known Issues & Next Steps

Beberapa area yang masih dapat dioptimalkan untuk pengembangan selanjutnya:

- **AI Recommendation:** Rekomendasi belajar saat ini masih berbasis _rule_ sederhana. Integrasi dengan OpenAI/Gemini API dapat ditambahkan untuk memberikan _personalized study path_ berdasarkan nilai dan durasi belajar.
- **Pinterest API Integration:** Galeri inspirasi saat ini murni dari _User Generated Content_ (UGC). Dapat diintegrasikan dengan Pinterest API untuk menarik _pin_ edukasi secara otomatis.
- **Real-time Notifications:** Fitur _report_ dan _like_ saat ini belum memicu notifikasi _real-time_. Dapat dioptimalkan menggunakan Laravel Reverb atau Pusher (WebSockets).
- **Image Optimization:** Upload gambar hasil belajar belum dikompresi secara otomatis. Dapat menambahkan _library_ seperti Intervention Image di backend untuk me-_resize_ gambar sebelum disimpan agar menghemat _storage_.

## �📄 License & Maintainer

Proyek ini dilisensikan di bawah [MIT License](LICENSE).

Dibuat dan dikelola untuk tujuan pembelajaran dan pengembangan _Personal Learning Management System_.
