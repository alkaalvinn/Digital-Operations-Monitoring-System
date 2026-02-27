# Sistem Monitoring Operasional Digital

## Deskripsi Singkat

Sistem Monitoring Operasional Digital adalah aplikasi web enterprise yang dirancang untuk membantu manajemen memantau dan mengelola operasional perusahaan secara terpusat. Sistem ini menyediakan visibilitas real-time terhadap eksepsi operasional, performa KPI, manajemen insiden, dan alur kerja eskalasi yang terstruktur.

---

## Latar Belakang Masalah

### Masalah yang Diselesaikan

1. **Data Terpencar (Scattered Data)**
   - Data operasional tersebar di berbagai sumber (email, spreadsheet, chat, sistem terpisah)
   - Sulit untuk mendapatkan gambaran menyeluruh tentang status operasional

2. **Kurangnya Wawasan Real-Time**
   - Manajemen tidak dapat melihat status operasional secara langsung
   - Keputusan seringkali berdasarkan data yang sudah kedaluwarsa

3. **Tidak Ada Follow-Up Terstruktur**
   - Eksepsi operasional tidak ditindaklanjuti secara konsisten
   - Tidak ada jejak audit yang jelas untuk setiap insiden

4. **Tidak Ada Model Manajemen Eskalasi**
   - Tidak ada prosedur jelas untuk eskalasi insiden
   - SLA (Service Level Agreement) sering dilanggar tanpa notifikasi

---

## Fitur Utama

### 1. Dashboard Berbasis Peran (Role-Based Dashboard)

Sistem menyediakan tiga tampilan dashboard yang berbeda sesuai dengan peran pengguna:

#### Dashboard Manajemen
**Tujuan:** Memberikan ringkasan eksekutif tentang kinerja operasional

**Fitur:**
- **Kartu KPI Utama:**
  - Jumlah Eksepsi Terbuka
  - Tingkat Kepatuhan SLA (%)
  - Tingkat Eskalasi (%)
  - Waktu Resolusi Rata-rata (jam)

- **Grafik Tren:**
  - Grafik garus/area yang menunjukkan tren eksepsi dari waktu ke waktu
  - Visualisasi distribusi severity

- **Widget Eksepsi Kritis:**
  - Daftar eksepsi dengan severity Critical yang memerlukan perhatian segera
  - Highlight dengan warna merah untuk prioritas

- **Panel Ringkasan Eskalasi:**
  - Overview dari item yang sedang di-eskalasi
  - Status eskalasi per level

#### Dashboard Tim Operasional
**Tujuan:** Membantu operator mengelola tugas-tugas yang ditugaskan

**Fitur:**
- **Daftar Eksepsi yang Ditugaskan:**
  - Hanya menampilkan eksepsi yang ditugaskan kepada operator yang login
  - Filter berdasarkan status (Open, In Progress, Escalated, Closed)

- **Hitung Mundur SLA:**
  - Timer real-time yang menunjukkan sisa waktu hingga deadline SLA
  - Peringatan visual ketika deadline mendekat (kuning) atau terlewati (merah)

- **Filter Status:**
  - Open - Eksepsi baru yang belum diproses
  - In Progress - Sedang dikerjakan
  - Waiting - Menunggu respons dari pihak lain
  - Escalated - Telah di-eskalasi ke level atas
  - Resolved - Telah diselesaikan
  - Closed - Ditutup permanen

#### Dashboard Supervisor
**Tujuan:** Memantau eskalasi dan beban kerja tim

**Fitur:**
- **Daftar Insiden yang Di-eskalasi:**
  - Semua eksepsi yang mencapai Level 2 atau Level 3
  - Prioritas berdasarkan severity dan lama eskalasi

- **Alert Pelanggaran SLA:**
  - Notifikasi untuk eksepsi yang melewati deadline
  - Highlight dengan warna peringatan

- **Grafik Beban Kerja Tim:**
  - Visualisasi jumlah eksepsi per operator
  - Membantu distribusi tugas yang merata

- **Metrik Performa:**
  - Statistik waktu resolusi
  - Tingkat kepatuhan SLA tim

---

### 2. Modul Manajemen Eksepsi

#### Field Data Eksepsi
| Field | Deskripsi |
|-------|-----------|
| Exception ID | Identifikasi unik otomatis |
| Title | Judul singkat eksepsi |
| Description | Deskripsi detail masalah |
| Category | Kategori (Infrastructure, Payment, Performance, dll) |
| Severity | tingkat severity (Low, Medium, High, Critical) |
| Impact Level | Skala dampak 1-5 |
| Assigned To | Operator yang bertanggung jawab |
| Status | Status saat ini |
| SLA Deadline | Batas waktu penyelesaian |
| Created At | Waktu pembuatan |
| Escalation Level | Level eskalasi saat ini |

#### Status Flow
```
Detected → Open → In Progress → Waiting → Resolved → Closed
                    ↓
                 Escalated
```

---

### 3. Logika Eskalasi Otomatis

Sistem secara otomatis menaikkan level eskalasi berdasarkan aturan:

#### Aturan Eskalasi
1. **Pelanggaran SLA**
   - Jika deadline terlewati → Otomatis eskalasi ke Level 2 (Supervisor)
   - Notifikasi dibuat otomatis

2. **Severity Critical**
   - Eksepsi dengan severity Critical → Otomatis Level 2 sejak awal

3. **Unresolved 24 Jam**
   - Jika belum terselesaikan setelah 24 jam → Eskalasi ke Level 3 (Department Head)

#### Level Eskalasi
| Level | Pihak yang Bertanggung Jawab |
|-------|---------------------------|
| Level 1 | Tim Operasional |
| Level 2 | Supervisor |
| Level 3 | Kepala Departemen |

#### Visualisasi Eskalasi
- **Badge Eskalasi:** Menampilkan level saat ini dengan kode warna
  - Biru = Level 1
  - Oranye = Level 2
  - Merah = Level 3

- **Timeline Eskalasi:** Riwayat lengkap kapan dan kenapa eksepsi di-eskalasi

---

### 4. Log Aktivitas Insiden

Setiap eksepsi memiliki jejak audit lengkap:

#### Jenis Aktivitas yang Dicatat
- **CREATED** - Eksepsi dibuat
- **STATUS_UPDATE** - Perubahan status
- **ASSIGNED** - Penugasan ke operator
- **ESCALATED** - Eskalasi naik level
- **COMMENT** - Komentar/update manual
- **RESOLVED** - Eksepsi diselesaikan
- **CLOSED** - Eksepsi ditutup

#### Sistem Komentar
- Pengguna dapat menambahkan komentar pada setiap eksepsi
- Thread komentar terurut secara kronologis
- Notifikasi aktivitas terbaru

---

## Use Case (Kasus Penggunaan)

### Use Case 1: Melaporkan Masalah Baru

**Aktor:** Manajemen atau Supervisor

**Alur:**
1. User mengakses menu "Create Exception" (jika tersedia)
2. Mengisi form:
   - Judul masalah
   - Deskripsi detail
   - Kategori
   - Severity level
   - Impact level (1-5)
   - Menugaskan ke operator tertentu (opsional)
3. Sistem menghitung SLA deadline otomatis
4. Sistem menentukan initial escalation level berdasarkan severity
5. Eksepsi disimpan dan notifikasi dikirim ke operator yang ditugasi
6. Activity log dibuat otomatis

### Use Case 2: Operator Mengerjakan Eksepsi

**Aktor:** Tim Operasional

**Alur:**
1. Operator login dan melihat dashboard
2. Melihat daftar eksepsi yang ditugaskan
3. Memilih eksepsi untuk dikerjakan
4. Mengubah status dari "Open" ke "In Progress"
5. Menambahkan komentar/update progres
6. Setelah selesai, klik "Resolve" dan isi resolution notes
7. Sistem mencatat waktu resolusi
8. Activity log diperbarui

### Use Case 3: Supervisor Memantau Eskalasi

**Aktor:** Supervisor

**Alur:**
1. Supervisor login melihat dashboard Supervisor
2. Melihat daftar insiden yang di-eskalasi
3. Memprioritaskan berdasarkan severity dan overdue
4. Meninjau timeline eskalasi
5. Mengassign ulang ke operator lain jika diperlukan
6. Menutup eksepsi yang sudah terselesaikan

### Use Case 4: Manajemen Melihat Laporan

**Aktor:** Manajemen

**Alur:**
1. Manajemen login melihat dashboard eksekutif
2. Melihat KPI cards untuk quick overview
3. Melihat grafik tren untuk analisis performa
4. Memeriksa eksepsi kritis yang butuh perhatian
5. Review SLA breaches
6. Mengambil keputusan berdasarkan data terkini

### Use Case 5: Eskalasi Otomatis karena SLA Breach

**Trigger:** System (Otomatis)

**Alur:**
1. Operator menyetujui eksepsi dengan deadline SLA tertentu
2. Deadline terlewati tanpa resolusi
3. Sistem mendeteksi pelanggaran SLA
4. Sistem otomatis:
   - Mengubah escalation level ke Level 2
   - Mengubah status menjadi "Escalated"
   - Membuat record eskalasi dengan alasan "SLA deadline exceeded"
   - Mencatat di activity log
5. Supervisor menerima notifikasi

### Use Case 6: Menambahkan Komentar pada Eksepsi

**Aktor:** Semua User

**Alur:**
1. User membuka detail eksepsi
2. Scroll ke section "Activity & Comments"
3. Ketik komentar di text area
4. Klik tombol "Save"
5. Sistem menyimpan komentar sebagai activity baru
6. Activity timeline terupdate

---

## Alur Kerja Lengkap (End-to-End)

### Siklus Hidup Eksepsi

```
┌─────────────────────────────────────────────────────────────────┐
│                        DETEKSI MASALAH                           │
│  - Sistem otomatis mendeteksi                                   │
│  - User melaporkan manual                                       │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                      CREATE EXCEPTION                           │
│  - Judul, deskripsi, severity, impact                           │
│  - Hitung SLA deadline                                          │
│  - Tentukan escalation level awal                               │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                      ASSIGN TO OPERATOR                         │
│  - Manual assignment oleh supervisor                           │
│  - Otomatis berdasarkan kategori/beban kerja                    │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                   IN PROGRESS (Operator)                        │
│  - Operator mengerjakan                                         │
│  - Update status, tambah komentar                              │
└──────────────────────┬──────────────────────────────────────────┘
                       │
              ┌────────┴────────┐
              │                 │
         ┌────▼────┐      ┌────▼─────┐
         │ SELESAI │      │  SLA     │
         │         │      │ BREACH   │
         └────┬────┘      └────┬─────┘
              │                 │
              │         ┌───────▼────────┐
              │         │  AUTO ESCALATE │
              │         │  Level 2 → 3   │
              │         └───────┬────────┘
              │                 │
              └────────┬────────┘
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                       RESOLVED                                  │
│  - Operator menyelesaikan                                      │
│  - Isi resolution notes                                        │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                        CLOSED                                   │
│  - Supervisor/Management menutup                               │
│  - Eksepsi diarsipkan                                          │
└─────────────────────────────────────────────────────────────────┘
```

---

## Kode Warna & Visual

### Severity Colors
| Severity | Warna | Hex |
|----------|-------|-----|
| Critical | Merah | #ef4444 |
| High | Oranye | #f97316 |
| Medium | Kuning | #eab308 |
| Low | Biru | #3b82f6 |

### Status Colors
| Status | Warna |
|--------|-------|
| Open | Abu-abu |
| In Progress | Biru |
| Waiting | Kuning |
| Escalated | Merah |
| Resolved | Hijau |
| Closed | Slate |

### SLA Status Indicators
| Status | Warna | Arti |
|--------|-------|------|
| Safe | Hijau | Masih aman, deadline > 2 jam |
| Warning | Kuning | Deadline < 2 jam |
| Breached | Merah | Deadline terlewati |

---

## Teknologi yang Digunakan

- **Frontend:** Next.js 15, React 19, TypeScript
- **Styling:** Tailwind CSS, Shadcn UI
- **Charts:** Recharts
- **Backend:** Next.js API Routes
- **Database:** PostgreSQL dengan Prisma ORM

---

## Akun Demo

| Peran | Email | Password | Akses |
|-------|-------|----------|-------|
| Manajemen | management@example.com | password123 | Akses penuh, semua KPI |
| Supervisor | supervisor@example.com | password123 | Eskalasi & beban kerja tim |
| Operator 1 | op1@example.com | password123 | Eksepsi yang ditugaskan |
| Operator 2 | op2@example.com | password123 | Eksepsi yang ditugaskan |
