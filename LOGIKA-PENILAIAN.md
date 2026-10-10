# Logika Penilaian Otomatis Kitabah Insya'

Penilaian, koreksi, dan saran di aplikasi ini **tidak memakai AI**. Semuanya dihitung dari aturan yang bisa dijelaskan, di `src/lib/analyzer.ts`. Berjalan di browser siswa, tanpa internet, tanpa kunci API, tanpa biaya.

Mengapa aturan, bukan AI:

- **Bisa dipertanggungjawabkan.** Setiap skor punya rumus dan setiap koreksi punya alasan. Input yang sama selalu menghasilkan hasil yang sama.
- **Berjalan di mana saja.** Tidak ada server, kuota, atau kunci yang bisa habis atau bocor.
- **Privat.** Tulisan siswa tidak dikirim ke pihak ketiga.

Hasilnya adalah **estimasi awal**. Guru tetap penilai akhir dan bisa mengubah skor di dashboard.

## 1. Pra-pemrosesan

1. Teks dipecah menjadi kata (huruf Arab) dan kalimat (batas `. ! ? ؟` dan baris baru).
2. Tiap kata **dinormalkan** untuk pencocokan: harakat dan tatwil dibuang; `أ إ آ ٱ` → `ا`; `ى` → `ي`; `ة` → `ه`.
3. Awalan (`و ف ب ل ك س ال`) dan akhiran kata ganti (`ي ك ه ها هم نا …`) dilepas untuk mencari batang kata.
4. Kosakata tema dicocokkan dengan batang kata itu. Kosakata dua kata baru dihitung terpakai bila kedua katanya muncul.

## 2. Rubrik (4 aspek × 25 = 100)

N = jumlah kata, S = jumlah kalimat, T = kosakata tema, V = kosakata tema yang dipakai.

| Aspek | Komponen dan bobot |
|---|---|
| **Fikrah** (isi) | Panjang **9** = 0,6·min(1, N/45) + 0,4·min(1, S/5) · Kesesuaian tema **9** = min(1, V / min(5,T)) · Alur **7** = kata penghubung (1→2, 2→3,5, ≥3→5) + penutup (+2). Batas: tak ada kosakata tema → maks 12; N<8 → maks 10 |
| **Tarkib** (struktur) | Kalimat lengkap (≥3 kata) **8** · Variasi jenis kalimat **7** (1→2, 2→4, 3→5,5, ≥4→7) · Partikel gramatikal **5** (min(1, jumlah/6)) · Pola kalimat tema yang terpakai **5** · **dikurangi** 1,5 per kesalahan nahwu (maks 8). N<5 → maks 8 |
| **Mufradat** (kosakata) | Cakupan kosakata tema **12** = min(1, V / min(8,T)) · Kosakata pilihan siswa yang masuk karangan **5** · Variasi (type-token ratio) **5** · Kata isi di luar tema **3**. N<5 → maks 8 |
| **Imla'** (ejaan) | Kelengkapan harakat **9** = min(9, 2 + 7·cakupan) · Tanda baca **4** · Ejaan **12** − 2,5 per salah eja − 1 per huruf Latin − 1,5 per harakat tengah salah. N<5 → maks 12 |

Total = jumlah keempatnya, dibulatkan per aspek.

| Total | Predikat |
|---|---|
| ≥ 85 | Mumtaz |
| 75–84 | Jayyid Jiddan |
| 65–74 | Jayyid |
| 55–64 | Maqbul |
| < 55 | Perlu ditingkatkan |

## 3. Aturan pendeteksi kesalahan

Hanya aturan yang **pasti** yang dipakai. Lebih baik melewatkan kesalahan daripada menandai yang benar.

| Kode | Aturan | Contoh |
|---|---|---|
| N1 | `الَّذِي` setelah kata muannats (berakhiran ة) | الْحَافِلَةُ الَّذِي → الَّتِي |
| N2 | Sifat tidak mengikuti kata benda muannats | الْمَحَطَّةُ الْكَبِيرُ → الْكَبِيرَةُ |
| N3 | Kata berawalan `ال` bertanwin | الْكِتَابٌ → الْكِتَابُ |
| N4 | `هَذَا` / `ذَلِكَ` + kata muannats ber-`ال` | هَذَا الْمَدْرَسَةُ → هَذِهِ |
| N5 | Kata terulang berurutan | (salah ketik) |
| N6 | Setelah huruf jar, kata benda ber-`ال` berharakat dhammah | إِلَى الْمَحَطَّةُ → الْمَحَطَّةِ |
| I1 | Ejaan berbeda dari materi tema (hamzah, ة, ى) | قريه → قرية |
| I1b | Sifat umum berakhiran ه padahal seharusnya ة | كبيره → كبيرة |
| I2 | Salah ketik yang sangat umum | الي / الى → إِلَى · فى → فِي |
| I3 | Huruf Latin atau tanda baca Latin di karangan Arab | `,` `;` `?` → `، ؛ ؟` |
| H | Harakat tengah kata berbeda dari kamus tema (harakat akhir/i'rab milik siswa tidak diubah) | |

Penjagaan agar tidak salah tandai: `مَنِ الْمُعَلِّمُ` ("siapa gurunya?") bukan huruf jar `مِنْ`; aturan yang butuh harakat tidak aktif pada teks tanpa harakat; nama "Allah" dikecualikan dari N3 dan N6.

## 4. Fitur lain

- **Bantuan Ide**: mencocokkan gagasan siswa dengan kosakata tema, lalu menyarankan kata penghubung, pola kalimat tema (dengan contoh dan penjelasannya), dan kosakata yang belum dipakai.
- **Cek Harakat**: menampilkan bentuk berharakat dari kamus tema untuk kata yang belum berharakat. Draf siswa **tidak diubah otomatis**, karena harakat akhir tergantung konteks kalimat.
- **Peta Tulisan**: menampilkan karangan per kalimat dengan penanda kosakata tema (hijau), kata penghubung (biru), dan kata yang perlu diperiksa (garis merah bergelombang beserta alasannya). Dihitung dari mesin yang sama (`annotateText`), tanpa gambar.
- **Tema sendiri**: guru atau siswa mengisi judul, arahan, dan kosakata (`كِتَابٌ = buku`). Tema tersimpan di sesi dan dinilai dengan mesin yang sama.

## 5. Batasan (jujur)

- Mesin **tidak memahami makna**. Kesesuaian dengan tema hanya diukur dari kosakata tema yang dipakai.
- Hanya aturan di tabel bagian 3 yang diperiksa. Banyak kesalahan nahwu lain tidak terdeteksi.
- Pada tema sendiri tanpa pola kalimat dan contoh, komponen "pola tema" memakai ukuran partikel gramatikal sebagai gantinya.
- Skor adalah estimasi. Karangan yang tidak bermutu tetapi memakai banyak kosakata tema bisa mendapat skor lebih tinggi daripada seharusnya, karena itu penilaian guru tetap diperlukan.

## 6. Menjalankan pengujian

```
npm test
```

Butuh Node 22.18+ (memuat berkas `.ts` langsung). Pengujian mencakup: peta tulisan, contoh karangan semua tema tidak memicu temuan palsu, tiap aturan di atas, penjagaan kasus benar, input kosong atau non-Arab, determinisme, dan 300 teks acak.
