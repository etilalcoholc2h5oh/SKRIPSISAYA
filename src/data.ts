export interface Mufradat {
  word: string;
  meaning: string;
  pronunciation: string;
  imageUrl?: string;
  icon?: string;
  category?: string;
}

export interface TarkibPattern {
  name: string;
  patternArabic: string;
  example: string;
  explanation: string;
}

export interface ThemeTopic {
  id: string;
  titleArabic: string;
  titleIndo: string;
  grade: string;
  imageUrl?: string;
  prompt: string;
  mufradat: Mufradat[];
  tarkib: TarkibPattern[];
  contohInsya: string;
  kesalahanUmum: string[];
}

export const THEMES: ThemeTopic[] = [
  {
    id: 'tasawwuq',
    titleArabic: 'التَّسَوُّقُ (فِي السُّوقِ التَّقْلِيدِيِّ وَالْمَرْكَزِيِّ)',
    titleIndo: 'Berbelanja di Pasar Tradisional & Supermarket',
    grade: 'Kelas XI',
    prompt: 'Tuliskan karangan singkat tentang pengalamanmu berbelanja kebutuhan di pasar tradisional atau supermarket (سُوق مَرْكَزِيّ), barang yang kamu beli, dan bagaimana proses tawar-menawar atau pembayarannya.',
    mufradat: [
      { 
        word: 'سُوقٌ مَرْكَزِيٌّ', 
        meaning: 'Supermarket / Swalayan', 
        pronunciation: 'Suuqun markaziyyun', 
        icon: '', 
        category: 'Tempat' 
      },
      { 
        word: 'سُوقٌ تَقْلِيدِيٌّ', 
        meaning: 'Pasar Tradisional', 
        pronunciation: 'Suuqun taqliidiyyun', 
        icon: '', 
        category: 'Tempat' 
      },
      { 
        word: 'قِسْمُ الْمَلَابِسِ', 
        meaning: 'Bagian Pakaian', 
        pronunciation: 'Qismul malaabis', 
        icon: '', 
        category: 'Materi' 
      },
      { 
        word: 'قِسْمُ الْمَأْكُولَاتِ', 
        meaning: 'Bagian Makanan & Buah', 
        pronunciation: 'Qismul ma\'kuulaat', 
        icon: '', 
        category: 'Materi' 
      },
      { 
        word: 'بَائِعٌ', 
        meaning: 'Penjual', 
        pronunciation: 'Baa\'i\'un', 
        icon: '', 
        category: 'Tokoh' 
      },
      { 
        word: 'مُشْتَرٍ', 
        meaning: 'Pembeli / Pelanggan', 
        pronunciation: 'Musytarin', 
        icon: '', 
        category: 'Tokoh' 
      },
      { 
        word: 'كَاشِير / أَمِينُ الصُّنْدُوقِ', 
        meaning: 'Kasir Pembayaran', 
        pronunciation: 'Amiinush shunduuq', 
        icon: '', 
        category: 'Aktivitas' 
      },
      { 
        word: 'تَخْفِيضٌ / خَصْمٌ', 
        meaning: 'Diskon / Potongan Harga', 
        pronunciation: 'Takhfiidhun / Khasymun', 
        icon: '', 
        category: 'Materi' 
      },
      { 
        word: 'ثَمَنٌ / سِعْرٌ', 
        meaning: 'Harga Barang', 
        pronunciation: 'Tsamanun / Si\'run', 
        icon: '', 
        category: 'Materi' 
      },
      { 
        word: 'نَقْدًا', 
        meaning: 'Secara Tunai (Cash)', 
        pronunciation: 'Naqdan', 
        icon: '', 
        category: 'Materi' 
      },
      { 
        word: 'رَخِيصٌ', 
        meaning: 'Murah Terjangkau', 
        pronunciation: 'Rakhiishun', 
        icon: '', 
        category: 'Materi' 
      },
      { 
        word: 'غَالٍ', 
        meaning: 'Mahal / Premium', 
        pronunciation: 'Ghaalin', 
        icon: '', 
        category: 'Materi' 
      }
    ],
    tarkib: [
      {
        name: 'Asma\'ul \'Adad (Bilangan Ribuan & Jutaan: ألف - مليون)',
        patternArabic: 'الْعَدَدُ (أَلْفٌ / مِلْيُونٌ) + الْمَعْدُودُ (مُفْرَدٌ مَجْرُورٌ)',
        example: 'اشْتَرَيْتُ الْقَمِيصَ بِخَمْسِينَ أَلْفَ رُوبِيَّةٍ',
        explanation: 'Setelah kata \'alfun\' (أَلْف) atau \'milyuun\' (مِلْيُون), kata benda (ma\'dud) berbentuk tunggal berharakat kasrah (mufrad majrur).'
      },
      {
        name: 'Huruf Jar & Zharaf Tempat (حروف الجر والظرف)',
        patternArabic: 'حَرْفُ الْجَرِّ / ظَرْفُ الْمَكَانِ + اسْمٌ مَجْرُورٌ',
        example: 'أَذْهَبُ مَعَ أُمِّي إِلَى قِسْمِ الْمَأْكُولَاتِ فِي السُّوقِ الْمَرْكَزِيِّ',
        explanation: 'Menyusun keterangan arah dan tempat belanja yang runtut menggunakan huruf jar (إِلَى، فِي، مِنْ، مَعَ).'
      },
      {
        name: 'Jumlah Fi\'liyyah dengan Objek Berbilang (فعل + فاعل + مفعول به)',
        patternArabic: 'فِعْلٌ + فَاعِلٌ + مَفْعُولٌ بِهِ مَنْصُوبٌ',
        example: 'يَبِيعُ الْبَائِعُ الْفَوَاكِهَ الطَّازَجَةَ بِثَمَنٍ رَخِيصٍ',
        explanation: 'Objek (maf\'ul bih) dibaca nashab (fathah/kasrah untuk jamak muannats salim).'
      }
    ],
    contohInsya: 'فِي يَوْمِ الْأَحَدِ، ذَهَبْتُ مَعَ أُمِّي إِلَى السُّوقِ الْمَرْكَزِيِّ لِشِرَاءِ حَاجَاتِ الْبَيْتِ. دَخَلْنَا قِسْمَ الْمَأْكُولَاتِ وَاشْتَرَيْنَا الْفَوَاكِهَ وَالْخُضْرَاوَاتِ الطَّازَجَةَ. بَعْدَ ذَلِكَ، تَوَجَّهْنَا إِلَى قِسْمِ الْمَلَابِسِ لِشِرَاءِ قَمِيصٍ جَدِيدٍ، وَكَانَ عَلَيْهِ تَخْفِيضٌ كَبِيرٌ. دَفَعْتُ الثَّمَنَ لِلْكَاشِيرِ نَقْدًا وَرَجَعْنَا إِلَى الْبَيْتِ مَسْرُورَيْنِ.',
    kesalahanUmum: [
      'Menulis ma\'dud setelah bilangan ribuan dalam bentuk jamak (seharusnya mufrad majrur: أَلْفَ رُوبِيَّةٍ bukan أَلْفَ رُوبِيَّاتٍ).',
      'Lupa memberikan tanda fathah pada maf\'ul bih (kata objek setelah fi\'il dan fa\'il).'
    ]
  },
  {
    id: 'sihhah',
    titleArabic: 'الصِّحَّةُ وَالرِّعَايَةُ الصِّحِّيَّةُ',
    titleIndo: 'Kesehatan & Layanan Medis',
    grade: 'Kelas XI',
    prompt: 'Tuliskan karangan tentang pengalaman berobat atau memeriksakan kesehatan di klinik/rumah sakit, nasihat dokter untuk pola hidup sehat, serta peran apotek dalam menyediakan obat.',
    mufradat: [
      { 
        word: 'مُسْتَشْفَى', 
        meaning: 'Rumah Sakit', 
        pronunciation: 'Mustasyfaa', 
        icon: '', 
        category: 'Tempat' 
      },
      { 
        word: 'طَبِيبٌ', 
        meaning: 'Dokter', 
        pronunciation: 'Thabiibun', 
        icon: '', 
        category: 'Tokoh' 
      },
      { 
        word: 'مُمَرِّضَةٌ', 
        meaning: 'Perawat', 
        pronunciation: 'Mumarridhatun', 
        icon: '', 
        category: 'Tokoh' 
      },
      { 
        word: 'مَرِيضٌ', 
        meaning: 'Pasien / Orang Sakit', 
        pronunciation: 'Mariidhun', 
        icon: '', 
        category: 'Tokoh' 
      },
      { 
        word: 'صَيْدَلِيَّةٌ', 
        meaning: 'Apotek', 
        pronunciation: 'Shaidaliyyatun', 
        icon: '', 
        category: 'Tempat' 
      },
      { 
        word: 'دَوَاءٌ', 
        meaning: 'Obat / Resep', 
        pronunciation: 'Dawaa\'un', 
        icon: '', 
        category: 'Materi' 
      },
      { 
        word: 'سَمَّاعَةُ الطَّبِيبِ', 
        meaning: 'Stetoskop', 
        pronunciation: 'Sammaa\'atuth thabiib', 
        icon: '', 
        category: 'Materi' 
      },
      { 
        word: 'عِيَادَةٌ', 
        meaning: 'Klinik / Ruang Periksa', 
        pronunciation: '\'Iyaadatun', 
        icon: '', 
        category: 'Tempat' 
      },
      { 
        word: 'حُمَّى وَصُدَاعٌ', 
        meaning: 'Demam & Sakit Kepala', 
        pronunciation: 'Hummaa wa shudaa\'', 
        icon: '', 
        category: 'Perasaan' 
      },
      { 
        word: 'مِقْيَاسُ الْحَرَارَةِ', 
        meaning: 'Termometer Suhu', 
        pronunciation: 'Miqyaasul haraarah', 
        icon: '', 
        category: 'Materi' 
      },
      { 
        word: 'صِحَّةٌ وَعَافِيَةٌ', 
        meaning: 'Kesehatan & Kebugaran', 
        pronunciation: 'Shihhatun wa \'aafiyah', 
        icon: '', 
        category: 'Perasaan' 
      },
      { 
        word: 'وِقَايَةٌ', 
        meaning: 'Pencegahan Penyakit', 
        pronunciation: 'Wiqaayatun', 
        icon: '', 
        category: 'Aktivitas' 
      }
    ],
    tarkib: [
      {
        name: 'Huruf Athaf (حروف العطف: الواو، الفاء، ثم، أو)',
        patternArabic: 'مَعْطُوفٌ عَلَيْهِ + حَرْفُ الْعَطْفِ (ثُمَّ / فَـ / وَ) + مَعْطُوفٌ',
        example: 'فَحَصَ الطَّبِيبُ الْمَرِيضَ ثُمَّ كَتَبَ لَهُ الْوَصْفَةَ الطِّبِّيَّةَ',
        explanation: 'Kata sambung berurutan (athaf) seperti \'tsumma\' (kemudian) dan \'fa\' (lalu) menyelaraskan i\'rab kata setelahnya.'
      },
      {
        name: 'Tarkib Fi\'il Mudhari\' Manshub dengan \'An\' (أَنْ + الفعل المضارع)',
        patternArabic: 'يَجِبُ / يَنْبَغِي + أَنْ + فِعْلٌ مُضَارِعٌ مَنْصُوبٌ',
        example: 'يَنْبَغِي لِلْمَرِيضِ أَنْ يَتَنَاوَلَ الدَّوَاءَ فِي وَقْتِهِ',
        explanation: 'Setelah huruf nashab \'an\' (أَنْ), fi\'il mudhari\' dibaca fathah (manshub).'
      },
      {
        name: 'Kaidah Na\'at & Man\'ut dalam Istilah Medis',
        patternArabic: 'مَنْعُوتٌ + نَعْتٌ مُطَابِقٌ',
        example: 'الْوِقَايَةُ خَيْرٌ مِنَ الْعِلَاجِ فِي الرِّعَايَةِ الصِّحِّيَّةِ',
        explanation: 'Sifat (na\'at) mengikuti isim yang disifati (man\'ut) dalam segi harakat, jenis kelamin, dan ma\'rifah/nakirah.'
      }
    ],
    contohInsya: 'شَعَرْتُ بِحُمَّى شَدِيدَةٍ وَصُدَاعٍ فِي الصَّبَاحِ، فَذَهَبْتُ مَعَ أَبِي إِلَى الْمُسْتَشْفَى. قَابَلْنَا الطَّبِيبَ فِي الْعِيَادَةِ، فَفَحَصَنِي بِسَمَّاعَةِ الطَّبِيبِ وَقَاسَ حَرَارَتِي. قَالَ الطَّبِيبُ: "عَلَيْكَ أَنْ تَسْتَرِيحَ وَتَشْرَبَ الْمَاءَ الْكَثِيرَ". ثُمَّ كَتَبَ لِي وَصْفَةَ الدَّوَاءِ، فَاشْتَرَيْنَاهَا مِنَ الصَّيْدَلِيَّةِ. الْحَمْدُ لِلَّهِ، شَعَرْتُ بِتَحَسُّنٍ كَبِيرٍ.',
    kesalahanUmum: [
      'Menulis fi\'il mudhari\' setelah \'an\' (أَنْ) dengan harakat dhommah (seharusnya fathah: أَنْ يَتَنَاوَلَ).',
      'Ketidaksesuaian jenis kelamin antara fa\'il muannats dan fi\'ilnya (misal: فَحَصَ الْمُمَرِّضَةُ seharusnya فَحَصَتِ الْمُمَرِّضَةُ).'
    ]
  },
  {
    id: 'siyahah',
    titleArabic: 'السَّفَرُ وَالسِّيَاحَةُ',
    titleIndo: 'Bepergian & Pariwisata',
    grade: 'Kelas XI',
    prompt: 'Tuliskan karangan tentang rencana atau pengalaman wisatamu saat liburan ke destinasi alam atau kota bersejarah, pemesanan tiket, dan keindahan tempat yang dikunjungi.',
    mufradat: [
      { 
        word: 'مَطَارٌ', 
        meaning: 'Bandara Udara', 
        pronunciation: 'Mathaarun', 
        icon: '', 
        category: 'Tempat' 
      },
      { 
        word: 'طَائِرَةٌ', 
        meaning: 'Pesawat Terbang', 
        pronunciation: 'Thaa\'iratun', 
        icon: '', 
        category: 'Materi' 
      },
      { 
        word: 'قِطَارٌ', 
        meaning: 'Kereta Api', 
        pronunciation: 'Qithaarun', 
        icon: '', 
        category: 'Materi' 
      },
      { 
        word: 'جَوَازُ السَّفَرِ', 
        meaning: 'Paspor Perjalanan', 
        pronunciation: 'Jawaazus safar', 
        icon: '', 
        category: 'Materi' 
      },
      { 
        word: 'تَذْكِرَةٌ', 
        meaning: 'Tiket Perjalanan', 
        pronunciation: 'Tadzkiratun', 
        icon: '', 
        category: 'Materi' 
      },
      { 
        word: 'فُنْدُقٌ', 
        meaning: 'Hotel Penginapan', 
        pronunciation: 'Funduqun', 
        icon: '', 
        category: 'Tempat' 
      },
      { 
        word: 'حَقِيبَةُ السَّفَرِ', 
        meaning: 'Koper Wisata', 
        pronunciation: 'Haqiibatus safar', 
        icon: '', 
        category: 'Materi' 
      },
      { 
        word: 'شَاطِئُ الْبَحْرِ', 
        meaning: 'Pantai Laut', 
        pronunciation: 'Syaathi\'ul bahr', 
        icon: '', 
        category: 'Tempat' 
      },
      { 
        word: 'جَبَلٌ', 
        meaning: 'Gunung Alam', 
        pronunciation: 'Jabalun', 
        icon: '', 
        category: 'Tempat' 
      },
      { 
        word: 'مَتْحَفٌ', 
        meaning: 'Museum Bersejarah', 
        pronunciation: 'Mathafun', 
        icon: '', 
        category: 'Tempat' 
      },
      { 
        word: 'مَنْظَرٌ طَبِيعِيٌّ', 
        meaning: 'Pemandangan Alami', 
        pronunciation: 'Manzharun thabi\'iyyun', 
        icon: '', 
        category: 'Wisata' 
      },
      { 
        word: 'دَلِيلٌ سِيَاحِيٌّ', 
        meaning: 'Pemandu Wisata (Tour Guide)', 
        pronunciation: 'Daliilun siyaahiyyun', 
        icon: '', 
        category: 'Tokoh' 
      }
    ],
    tarkib: [
      {
        name: 'Isim Tafdhil Pola Komparatif (اسْمُ التَّفْضِيلِ: أَفْعَلُ مِنْ)',
        patternArabic: 'اسْمٌ + أَفْعَلُ + مِنْ + اسْمٌ',
        example: 'هَذَا الشَّاطِئُ أَجْمَلُ مِنْ ذَاكَ، وَالْقِطَارُ أَسْرَعُ مِنَ الْحَافِلَةِ',
        explanation: 'Pola \'af\'alu min\' (أَفْعَلُ مِنْ) digunakan untuk membandingkan dua tempat atau sarana transportasi (lebih indah, lebih cepat, lebih luas).'
      },
      {
        name: 'Huruf Nashab Li Ta\'lil (لِـ / لِكَيْ / حَتَّى)',
        patternArabic: 'لِـ / كَيْ + فِعْلٌ مُضَارِعٌ مَنْصُوبٌ',
        example: 'سَافَرْنَا إِلَى لُومْبُوك لِنُشَاهِدَ الْمَنَاظِرَ الطَّبِيعِيَّةَ الْخَلَّابَةَ',
        explanation: 'Huruf \'li\' (untuk/agar) menashabkan fi\'il mudhari\' untuk menyatakan tujuan perjalanan wisata.'
      },
      {
        name: 'Zharaf Zaman & Keterangan Waktu Lampau',
        patternArabic: 'فِي الْعُطْلَةِ الْمَاضِيَةِ / قَبْلَ يَوْمَيْنِ',
        example: 'فِي الْعُطْلَةِ الْمَدْرَسِيَّةِ، حَجَزْنَا غُرْفَةً فِي الْفُنْدُقِ',
        explanation: 'Penanda waktu awal paragraf untuk mengalirkan karangan naratif secara kronologis.'
      }
    ],
    contohInsya: 'فِي الْعُطْلَةِ الْمَاضِيَةِ، قَرَّرْتُ أَنَا وَأُسْرَتِي السَّفَرَ إِلَى جَزِيرَةِ بَالِي. حَجَزَ أَبِي التَّذَاكِرَ عَبْرَ الْإِنْتَرْنِت وَحَزَمْنَا حَقَائِبَ السَّفَرِ. رَكِبْنَا الطَّائِرَةَ مِنَ الْمَطَارِ صَبَاحًا. عِنْدَمَا وَصَلْنَا، أَقَمْنَا فِي فُنْدُقٍ قَرِيبٍ مِنَ الشَّاطِئِ. كَانَ مَنْظَرُ الْبَحْرِ أَجْمَلَ مِمَّا تَوَقَّعْتُ، وَشَاهَدْنَا غُرُوبَ الشَّمْسِ الرَّائِعَ.',
    kesalahanUmum: [
      'Menulis isim tafdhil dengan tanwin (misal: أَجْمَلٌ مِنْ seharusnya أَجْمَلُ مِنْ tanpa tanwin karena mamnu\' minash sharf).',
      'Salah menggunakan huruf perbandingan (menggunakan عَنْ bukannya مِنْ).'
    ]
  },
  {
    id: 'safar',
    titleArabic: 'السَّفَرُ: الِاسْتِعْدَادُ وَآدَابُ الرِّحْلَةِ',
    titleIndo: 'Safar (Bepergian): Persiapan & Adab Perjalanan',
    grade: 'Kelas XI',
    imageUrl: '',
    prompt: 'Tuliskan karangan tentang sebuah perjalanan jauh yang pernah atau akan kamu lakukan (misalnya mudik atau pulang ke kampung halaman): persiapan sebelum berangkat, bekal dan barang bawaan, doa safar, keadaan di perjalanan, hingga tiba di tujuan.',
    mufradat: [
      {
        word: 'سَفَرٌ',
        meaning: 'Perjalanan / Bepergian',
        pronunciation: 'Safarun',
        icon: '',
        category: 'Kegiatan'
      },
      {
        word: 'مُسَافِرٌ',
        meaning: 'Musafir (Orang yang Bepergian)',
        pronunciation: 'Musaafirun',
        icon: '',
        category: 'Tokoh'
      },
      {
        word: 'طَرِيقٌ',
        meaning: 'Jalan / Rute',
        pronunciation: 'Thariiqun',
        icon: '',
        category: 'Tempat'
      },
      {
        word: 'أَمْتِعَةٌ',
        meaning: 'Barang Bawaan',
        pronunciation: 'Amti\'atun',
        icon: '',
        category: 'Benda'
      },
      {
        word: 'زَادٌ',
        meaning: 'Bekal Perjalanan',
        pronunciation: 'Zaadun',
        icon: '',
        category: 'Benda'
      },
      {
        word: 'مَوْعِدُ الْمُغَادَرَةِ',
        meaning: 'Jadwal Keberangkatan',
        pronunciation: 'Maw\'idul mughaadarah',
        icon: '',
        category: 'Kegiatan'
      },
      {
        word: 'مَحَطَّةٌ',
        meaning: 'Terminal / Stasiun',
        pronunciation: 'Mahaththatun',
        icon: '',
        category: 'Tempat'
      },
      {
        word: 'ازْدِحَامٌ',
        meaning: 'Kemacetan / Keramaian',
        pronunciation: 'Izdihaamun',
        icon: '',
        category: 'Sifat'
      },
      {
        word: 'اسْتِرَاحَةٌ',
        meaning: 'Istirahat / Tempat Istirahat',
        pronunciation: 'Istiraahatun',
        icon: '',
        category: 'Tempat'
      },
      {
        word: 'دُعَاءُ السَّفَرِ',
        meaning: 'Doa Safar (Doa Bepergian)',
        pronunciation: 'Du\'aa\'us safar',
        icon: '',
        category: 'Kegiatan'
      },
      {
        word: 'رَفِيقُ السَّفَرِ',
        meaning: 'Teman Seperjalanan',
        pronunciation: 'Rafiiqus safar',
        icon: '',
        category: 'Tokoh'
      },
      {
        word: 'الْوُصُولُ',
        meaning: 'Kedatangan / Tiba',
        pronunciation: 'Al-wushuulu',
        icon: '',
        category: 'Kegiatan'
      }
    ],
    tarkib: [
      {
        name: 'Isim Maushul (اسْمُ الْمَوْصُولِ: الَّذِي / الَّتِي)',
        patternArabic: 'اسْمٌ مَعْرِفَةٌ + الَّذِي / الَّتِي + جُمْلَةُ الصِّلَةِ',
        example: 'رَكِبْنَا الْحَافِلَةَ الَّتِي تَنْطَلِقُ مِنَ الْمَحَطَّةِ الرَّئِيسِيَّةِ',
        explanation: 'Isim maushul menyambung kata sebelumnya dengan keterangan tambahan. Gunakan الَّذِي untuk mudzakkar dan الَّتِي untuk muannats, sesuai kata yang diterangkan.'
      },
      {
        name: 'Jumlah Syarat dengan إِذَا',
        patternArabic: 'إِذَا + فِعْلُ الشَّرْطِ + فَ + جَوَابُ الشَّرْطِ',
        example: 'إِذَا أَرَدْتَ السَّفَرَ فَاحْرِصْ عَلَى تَرْتِيبِ أَمْتِعَتِكَ',
        explanation: 'إِذَا berarti "jika/apabila". Dipakai untuk menyatakan nasihat atau urutan persiapan perjalanan: jika melakukan A maka lakukan B.'
      },
      {
        name: 'Hal (الْحَالُ): Menjelaskan Keadaan',
        patternArabic: 'فِعْلٌ + فَاعِلٌ + حَالٌ مَنْصُوبٌ',
        example: 'وَصَلْنَا إِلَى الْقَرْيَةِ مُتْعَبِينَ وَلَكِنَّنَا سُعَدَاءُ',
        explanation: 'Hal menjelaskan keadaan pelaku saat perbuatan terjadi (di sini: lelah). Hal berstatus manshub, jadi jamak mudzakkar salim memakai akhiran ـِينَ.'
      }
    ],
    contohInsya: 'فِي نِهَايَةِ الْعَامِ الدِّرَاسِيِّ، قَرَّرَتْ أُسْرَتِي السَّفَرَ إِلَى قَرْيَةِ جَدِّي. قَبْلَ الْمُغَادَرَةِ، رَتَّبْتُ أَمْتِعَتِي وَحَمَلْتُ زَادًا كَافِيًا. رَكِبْنَا الْحَافِلَةَ الَّتِي تَنْطَلِقُ مِنَ الْمَحَطَّةِ الرَّئِيسِيَّةِ، وَقَرَأْنَا دُعَاءَ السَّفَرِ. فِي الطَّرِيقِ، رَأَيْنَا ازْدِحَامًا شَدِيدًا، فَاسْتَرَحْنَا فِي مَحَطَّةِ الِاسْتِرَاحَةِ. وَصَلْنَا إِلَى الْقَرْيَةِ مُتْعَبِينَ وَلَكِنَّنَا سُعَدَاءُ بِلِقَاءِ الْأَهْلِ.',
    kesalahanUmum: [
      'Menggunakan الَّذِي untuk kata muannats (misal: الْحَافِلَةُ الَّذِي), padahal seharusnya الْحَافِلَةُ الَّتِي.',
      'Menulis hal dengan rafa\' (مُتْعَبُونَ) padahal hal harus manshub (مُتْعَبِينَ).',
      'Lupa fa\' (فَ) pada jawab syarat berbentuk perintah setelah إِذَا.'
    ]
  },
  {
    id: 'hajj',
    titleArabic: 'الْحَجُّ وَالْعُمْرَةُ',
    titleIndo: 'Ibadah Haji & Umrah',
    grade: 'Kelas XI',
    prompt: 'Tuliskan deskripsi mengenai rangkaian manasik ibadah haji dan umrah, mulai dari niat ihram di miqat, thawaf di Ka\'bah, sa\'i di Shafa-Marwah, hingga wukuf di padang Arafah.',
    mufradat: [
      { 
        word: 'الْكَعْبَةُ الْمُشَرَّفَةُ', 
        meaning: 'Ka\'bah Al-Musyarrafah', 
        pronunciation: 'Al-Ka\'batul musyarrafah', 
        icon: '', 
        category: 'Tempat' 
      },
      { 
        word: 'الْمَسْجِدُ الْحَرَامُ', 
        meaning: 'Masjidil Haram Makkah', 
        pronunciation: 'Al-Masjidul haraam', 
        icon: '', 
        category: 'Tempat' 
      },
      { 
        word: 'إِحْرَامٌ', 
        meaning: 'Kain & Niat Ihram', 
        pronunciation: 'Ihraamun', 
        icon: '', 
        category: 'Aktivitas' 
      },
      { 
        word: 'طَوَافٌ', 
        meaning: 'Thawaf Keliling Ka\'bah', 
        pronunciation: 'Thawaafun', 
        icon: '', 
        category: 'Aktivitas' 
      },
      { 
        word: 'سَعْيٌ', 
        meaning: 'Sa\'i Shafa & Marwah', 
        pronunciation: 'Sa\'yun', 
        icon: '', 
        category: 'Aktivitas' 
      },
      { 
        word: 'وُقُوفٌ بِعَرَفَاتٍ', 
        meaning: 'Wukuf di Padang Arafah', 
        pronunciation: 'Wuquufun bi \'arafaat', 
        icon: '', 
        category: 'Aktivitas' 
      },
      { 
        word: 'مَاءُ زَمْزَمَ', 
        meaning: 'Air Zamzam Berkah', 
        pronunciation: 'Maa\'u zamzam', 
        icon: '', 
        category: 'Materi' 
      },
      { 
        word: 'الْمَسْجِدُ النَّبَوِيُّ', 
        meaning: 'Masjid Nabawi Madinah', 
        pronunciation: 'Al-Masjidun nabawiyyu', 
        icon: '', 
        category: 'Tempat' 
      },
      { 
        word: 'حَاجٌّ / حُجَّاجٌ', 
        meaning: 'Jamaah Haji', 
        pronunciation: 'Haajjun / Hujjaaj', 
        icon: '', 
        category: 'Tokoh' 
      },
      { 
        word: 'تَلْبِيَةٌ', 
        meaning: 'Talbiyah (Labbaykallahumma)', 
        pronunciation: 'Talbiyatun', 
        icon: '', 
        category: 'Aktivitas' 
      },
      { 
        word: 'رَمْيُ الْجَمَرَاتِ', 
        meaning: 'Lempar Jumrah di Mina', 
        pronunciation: 'Ramyul jamaraat', 
        icon: '', 
        category: 'Aktivitas' 
      },
      { 
        word: 'مَقَامُ إِبْرَاهِيمَ', 
        meaning: 'Maqam Ibrahim', 
        pronunciation: 'Maqaamu Ibraahiim', 
        icon: '', 
        category: 'Tempat' 
      }
    ],
    tarkib: [
      {
        name: 'Fi\'il Mabni Majhul & Na\'ibul Fa\'il (الْفِعْلُ الْمَبْنِيُّ لِلْمَجْهُولِ وَنَائِبُ الْفَاعِلِ)',
        patternArabic: 'فُعِلَ / يُفْعَلُ + نَائِبُ الْفَاعِلِ (مَرْفُوعٌ)',
        example: 'تُؤَدَّى مَنَاسِكُ الْحَجِّ فِي شَهْرِ ذِي الْحِجَّةِ',
        explanation: 'Kalimat pasif (mabni majhul) diawali fi\'il berpola dhumma awwaluhu dan diikuti subjek pengganti (na\'ibul fa\'il) yang berharakat dhommah.'
      },
      {
        name: 'Zharaf Makan Khusus Tanah Suci (حَوْلَ / بَيْنَ)',
        patternArabic: 'ظَرْفٌ (حَوْلَ / بَيْنَ) + مُضَافٌ إِلَيْهِ مَجْرُورٌ',
        example: 'يَطُوفُ الْحُجَّاجُ سَبْعَةَ أَشْوَاطٍ حَوْلَ الْكَعْبَةِ الْمُشَرَّفَةِ',
        explanation: 'Penggunaan keterangan tempat spesifik seperti \'haula\' (mengelilingi) dan \'baina\' (antara Shafa dan Marwah).'
      },
      {
        name: 'Tarkib Masdar Sharih dalam Ibadah',
        patternArabic: 'فِعْلٌ + مَصْدَرٌ صَرِيحٌ',
        example: 'يَبْدَأُ الْإِحْرَامُ بِعَقْدِ النِّيَّةِ مِنَ الْمِيقَاتِ',
        explanation: 'Menggunakan kata benda verbal (masdar) seperti al-ihram, ath-thawaf, as-sa\'yu untuk menjabarkan rukun haji.'
      }
    ],
    contohInsya: 'الْحَجُّ هُوَ الرُّكْنُ الْخَامِسُ مِنْ أَرْكَانِ الْإِسْلَامِ. يَبْدَأُ الْحَاجُّ رِحْلَتَهُ بِالْإِحْرَامِ مِنَ الْمِيقَاتِ، وَيُرَدِّدُ التَّلْبِيَةَ قَائِلًا: "لَبَّيْكَ اللَّهُمَّ لَبَّيْكَ". عِنْدَ وُصُولِهِ إِلَى الْمَسْجِدِ الْحَرَامِ، يَطُوفُ حَوْلَ الْكَعْبَةِ سَبْعَةَ أَشْوَاطٍ، ثُمَّ يَسْعَى بَيْنَ الصَّفَا وَالْمَرْوَةِ. وَفِي يَوْمِ عَرَفَةَ، يَقِفُ جَمِيعُ الْحُجَّاجِ بِعَرَفَاتٍ مُتَضَرِّعِينَ إِلَى اللَّهِ بِالدُّعَاءِ.',
    kesalahanUmum: [
      'Memberikan harakat fathah pada na\'ibul fa\'il (seharusnya marfu\'/dhommah: تُؤَدَّى الْمَنَاسِكُ bukan الْمَنَاسِكَ).',
      'Salah menyusun struktur angka putaran thawaf (سَبْعَةَ أَشْوَاطٍ bukan سَبْعُ أَشْوَاطٍ karena syauthun adalah mudzakkar).'
    ]
  },
  {
    id: 'tiknulujiya',
    titleArabic: 'تِكْنُولُوجِيَا الْإِعْلَامِ وَالِاتِّصَالِ',
    titleIndo: 'Teknologi Informasi & Komunikasi',
    grade: 'Kelas XI',
    prompt: 'Jelaskan bagaimana kamu memanfaatkan teknologi informasi, internet, komputer, dan smartphone untuk menunjang kegiatan belajarmu sehari-hari secara positif.',
    mufradat: [
      { 
        word: 'هَاتِفٌ ذَكِيٌّ', 
        meaning: 'Smartphone / Ponsel Pintar', 
        pronunciation: 'Haatifun dzakiyyun', 
        icon: '', 
        category: 'Perangkat' 
      },
      { 
        word: 'حَاسُوبٌ مَحْمُولٌ', 
        meaning: 'Laptop / Komputer Jinjing', 
        pronunciation: 'Haasuubun mahmuul', 
        icon: '', 
        category: 'Perangkat' 
      },
      { 
        word: 'شَبَكَةُ الْإِنْتَرْنِت', 
        meaning: 'Jaringan Internet Global', 
        pronunciation: 'Syabakatul internet', 
        icon: '', 
        category: 'Teknologi' 
      },
      { 
        word: 'مَوْقِعٌ إِلِكْتُرُونِيٌّ', 
        meaning: 'Situs Web / Website', 
        pronunciation: 'Mauqi\'un iliktuuruuniyyun', 
        icon: '', 
        category: 'Teknologi' 
      },
      { 
        word: 'وَسَائِلُ التَّوَاصُلِ', 
        meaning: 'Media Sosial', 
        pronunciation: 'Wasaa\'ilut tawaashul', 
        icon: '', 
        category: 'Komunikasi' 
      },
      { 
        word: 'بَرِيدٌ إِلِكْتُرُونِيٌّ', 
        meaning: 'Surel / Email', 
        pronunciation: 'Bariidun iliktuuruuniyyun', 
        icon: '', 
        category: 'Komunikasi' 
      },
      { 
        word: 'تَطْبِيقٌ تَعْلِيمِيٌّ', 
        meaning: 'Aplikasi Pembelajaran', 
        pronunciation: 'Tathbliqun ta\'liimiyyun', 
        icon: '', 
        category: 'Teknologi' 
      },
      { 
        word: 'بَحْثٌ عَنِ الْمَعْلُومَاتِ', 
        meaning: 'Pencarian Informasi Digital', 
        pronunciation: 'Bahtsun \'anil ma\'luumaat', 
        icon: '', 
        category: 'Aktivitas' 
      },
      { 
        word: 'شَاشَةٌ', 
        meaning: 'Layar Monitor', 
        pronunciation: 'Syaasyatun', 
        icon: '', 
        category: 'Perangkat' 
      },
      { 
        word: 'رِسَالَةٌ قَصِيرَةٌ', 
        meaning: 'Pesan Singkat (Chat)', 
        pronunciation: 'Risaalatun qashiiratun', 
        icon: '', 
        category: 'Komunikasi' 
      },
      { 
        word: 'تَحْمِيلُ الْمَلَفَّاتِ', 
        meaning: 'Download / Unduh Berkas', 
        pronunciation: 'Tahmiilul malaffaat', 
        icon: '', 
        category: 'Aktivitas' 
      },
      { 
        word: 'مُفِيدٌ وَسَرِيعٌ', 
        meaning: 'Bermanfaat & Cepat', 
        pronunciation: 'Mufiidun wa sarii\'un', 
        icon: '', 
        category: 'Materi' 
      }
    ],
    tarkib: [
      {
        name: 'Tashrif Fi\'il Tsulatsi Mazid (تَصْرِيفُ الْفِعْلِ الْمَزِيدِ: اِسْتَخْدَمَ / يُسَهِّلُ / تَوَاصَلَ)',
        patternArabic: 'اِسْتَفْعَلَ (يَسْتَخْدِمُ) / فَعَّلَ (يُسَهِّلُ) / تَفَاعَلَ (يَتَوَاصَلُ)',
        example: 'يَسْتَخْدِمُ الطَّالِبُ الْحَاسُوبَ لِيُسَهِّلَ عَمَلِيَّةَ التَّعَلُّمِ',
        explanation: 'Menggunakan kata kerja berimbuhan wazan mazid yang sangat kaya dalam mendeskripsikan teknologi modern.'
      },
      {
        name: 'Tarkib Maf\'ul Liajlih (مفعول لأجله)',
        patternArabic: 'فِعْلٌ + مَفْعُولٌ لِأَجْلِهِ (مَنْصُوبٌ)',
        example: 'أَتَصَفَّحُ الْمَوَاقِعَ التَّعْلِيمِيَّةَ رَغْبَةً فِي زِيَادَةِ الْمَعْرِفَةِ',
        explanation: 'Kata keterangan alasan (raghbatan / thalaban) berharakat fathatain untuk menerangkan motif menggunakan internet.'
      },
      {
        name: 'Struktur Idhafah Istilah TIK',
        patternArabic: 'مُضَافٌ + مُضَافٌ إِلَيْهِ',
        example: 'وَسَائِلُ التَّوَاصُلِ الْحَدِيثَةُ سَيْفٌ ذُو حَدَّيْنِ',
        explanation: 'Penggabungan dua isim tanpa tanwin pada kata pertama (mudhaf) dan kasrah pada kata kedua (mudhaf ilaih).'
      }
    ],
    contohInsya: 'أَصْبَحَتْ تِكْنُولُوجِيَا الْإِعْلَامِ وَالِاتِّصَالِ جُزْءًا مُهِمًّا فِي حَيَاتِنَا الْيَوْمِيَّةِ. أَسْتَخْدِمُ حَاسُوبِي الْمَحْمُولَ وَهَاتِفِي الذَّكِيَّ لِلْبَحْثِ عَنِ الْمَعْلُومَاتِ الدِّرَاسِيَّةِ عَبْرَ شَبَكَةِ الْإِنْتَرْنِت. كَمَا أَتَوَاصَلُ مَعَ مُعَلِّمِي وَزُمَلَائِي عَبْرَ الْبَرِيدِ الْإِلِكْتُرُونِيِّ وَتَطْبِيقَاتِ الْمُحَادَثَةِ. إِنَّ التِّكْنُولُوجِيَا تُسَهِّلُ لَنَا التَّعَلُّمَ إِذَا اسْتَخْدَمْنَاهَا بِحِكْمَةٍ.',
    kesalahanUmum: [
      'Menambahkan alif lam pada kata mudhaf (misal: الْوَسَائِلُ التَّوَاصُلِ seharusnya وَسَائِلُ التَّوَاصُلِ).',
      'Kesalahan penulisan hamzah qatha\' dan washal pada fi\'il mazid (misal: إِسْتَخْدَمَ seharusnya اِسْتَخْدَمَ).'
    ]
  },
  {
    id: 'tasamuh',
    titleArabic: 'الْأَدْيَانُ وَالتَّسَامُحُ فِي إِنْدُونِيسِيَا',
    titleIndo: 'Keberagaman Agama & Toleransi di Indonesia',
    grade: 'Kelas XI',
    prompt: 'Tuliskan karangan tentang indahnya keberagaman suku dan agama di Indonesia, pentingnya sikap toleransi (تَسَامُح), gotong royong, dan saling menghormati antarumat beragama.',
    mufradat: [
      { 
        word: 'تَسَامُحٌ', 
        meaning: 'Toleransi & Kerukunan', 
        pronunciation: 'Tasaamuhun', 
        icon: '', 
        category: 'Nilai' 
      },
      { 
        word: 'مَسْجِدٌ', 
        meaning: 'Masjid Tempat Ibadah', 
        pronunciation: 'Masjidun', 
        icon: '', 
        category: 'Tempat' 
      },
      { 
        word: 'كَنِيسَةٌ', 
        meaning: 'Gereja', 
        pronunciation: 'Kaniisatun', 
        icon: '', 
        category: 'Tempat' 
      },
      { 
        word: 'مَعْبَدٌ / بَيْتُ الْعِبَادَةِ', 
        meaning: 'Candi / Rumah Ibadah', 
        pronunciation: 'Ma\'badun / Baitul \'ibaadah', 
        icon: '', 
        category: 'Tempat' 
      },
      { 
        word: 'وَحْدَةٌ وَطَنِيَّةٌ', 
        meaning: 'Persatuan Bangsa (Bhinneka)', 
        pronunciation: 'Wahdatun wathaniyyah', 
        icon: '', 
        category: 'Nilai' 
      },
      { 
        word: 'سَلَامٌ وَأَمْنٌ', 
        meaning: 'Kedamaian & Keamanan', 
        pronunciation: 'Salaamun wa amnun', 
        icon: '', 
        category: 'Nilai' 
      },
      { 
        word: 'مُجْتَمَعٌ', 
        meaning: 'Masyarakat Majemuk', 
        pronunciation: 'Mujtama\'un', 
        icon: '', 
        category: 'Tokoh' 
      },
      { 
        word: 'مُوَاطِنٌ', 
        meaning: 'Warga Negara', 
        pronunciation: 'Muwaathinun', 
        icon: '', 
        category: 'Tokoh' 
      },
      { 
        word: 'إِخَاءٌ إِنْسَانِيٌّ', 
        meaning: 'Persaudaraan Kemanusiaan', 
        pronunciation: 'Ikhaa\'un insaaniyyun', 
        icon: '', 
        category: 'Nilai' 
      },
      { 
        word: 'تَعَاوُنٌ / تَكَافُلٌ', 
        meaning: 'Gotong Royong & Saling Bantu', 
        pronunciation: 'Ta\'aawunun / Takaafulun', 
        icon: '', 
        category: 'Aktivitas' 
      },
      { 
        word: 'احْتِرَامٌ مُتَبَادَلٌ', 
        meaning: 'Saling Menghormati', 
        pronunciation: 'Ihtiraamun mutabaadal', 
        icon: '', 
        category: 'Nilai' 
      },
      { 
        word: 'دِينٌ / أَدْيَانٌ', 
        meaning: 'Agama-agama', 
        pronunciation: 'Diinun / Adyaan', 
        icon: '', 
        category: 'Nilai' 
      }
    ],
    tarkib: [
      {
        name: 'Kana wa Akhwatuha (كَانَ وَأَخَوَاتُهَا: كَانَ، صَارَ، لَيْسَ، أَصْبَحَ)',
        patternArabic: 'كَانَ / أَصْبَحَ + اسْمُ كَانَ (مَرْفُوعٌ) + خَبَرُ كَانَ (مَنْصُوبٌ)',
        example: 'كَانَ التَّسَامُحُ الدِّينِيُّ أَسَاسًا لِوَحْدَةِ الشَّعْبِ الْإِنْدُونِيسِيِّ',
        explanation: 'Isim Kana berharakat dhommah (marfu\') dan Khabar Kana berharakat fathah/fathatain (manshub).'
      },
      {
        name: 'Inna wa Akhwatuha (إِنَّ وَأَخَوَاتُهَا: إِنَّ، أَنَّ، لَكِنَّ، لَعَلَّ)',
        patternArabic: 'إِنَّ + اسْمُ إِنَّ (مَنْصُوبٌ) + خَبَرُ إِنَّ (مَرْفُوعٌ)',
        example: 'إِنَّ إِخْلَاصَ الْمُوَاطِنِينَ فِي التَّعَاوُنِ سَبَبٌ لِاسْتِقْرَارِ الْبِلَادِ',
        explanation: 'Isim Inna berharakat fathah (manshub) dan Khabar Inna berharakat dhommah (marfu\').'
      },
      {
        name: 'Jumlah Ismiyyah dengan Khabar Syibhul Jumlah',
        patternArabic: 'مُبْتَدَأٌ + فِي / عَلَى + اسْمٌ مَجْرُورٌ',
        example: 'فِي إِنْدُونِيسِيَا تَنَوُّعٌ دِينِيٌّ وَثَقَافِيٌّ رَائِعٌ',
        explanation: 'Mendahulukan keterangan tempat (khabar muqaddam) sebelum subjek (mubtada muakhkhar).'
      }
    ],
    contohInsya: 'إِنَّ إِنْدُونِيسِيَا بَلَدٌ عَظِيمٌ يَتَمَيَّزُ بِتَنَوُّعِ الْأَدْيَانِ وَالثَّقَافَاتِ. يَعِيشُ الْمُسْلِمُونَ وَالْمَسِيحِيُّونَ وَالْهُنْدُوسُ وَالْبُوذِيُّونَ فِي سَلَامٍ وَأَمْنٍ. يَتَعَاوَنُ جَمِيعُ الْمُوَاطِنِينَ فِي بِنَاءِ الْوَطَنِ عَلَى أَسَاسِ التَّسَامُحِ وَالِاحْتِرَامِ الْمُتَبَادَلِ. كَانَ هَذَا التَّسَامُحُ رَمْزًا لِوَحْدَةِ بِلَادِنَا "الْوَحْدَةُ فِي التَّنَوُّعِ" (Bhinneka Tunggal Ika).',
    kesalahanUmum: [
      'Membalik harakat antara Isim Inna dan Khabar Inna (seharusnya Isim Inna fathah, Khabar Inna dhommah).',
      'Lupa merubah khabar Kana menjadi fathatain/manshub.'
    ]
  },
  {
    id: 'biah',
    titleArabic: 'الْمُحَافَظَةُ عَلَى الْبِيئَةِ',
    titleIndo: 'Pelestarian Lingkungan Hidup',
    grade: 'Kelas XI',
    prompt: 'Tuliskan karangan tentang pentingnya menjaga kebersihan lingkungan sekolah dan tempat tinggal, gerakan menanam pohon (penghijauan), serta bahaya membuang sampah sembarangan.',
    mufradat: [
      { 
        word: 'بِيئَةٌ نَظِيفَةٌ', 
        meaning: 'Lingkungan Bersih Sehat', 
        pronunciation: 'Bii\'atun nazhiifatun', 
        icon: '', 
        category: 'Lingkungan' 
      },
      { 
        word: 'نَظَافَةٌ', 
        meaning: 'Kebersihan', 
        pronunciation: 'Nazhaafatun', 
        icon: '', 
        category: 'Nilai' 
      },
      { 
        word: 'شَجَرَةٌ / أَشْجَارٌ', 
        meaning: 'Pohon / Pepohonan Hijau', 
        pronunciation: 'Syajaratun / Asyjaar', 
        icon: '', 
        category: 'Lingkungan' 
      },
      { 
        word: 'غَابَةٌ', 
        meaning: 'Hutan Rindang', 
        pronunciation: 'Ghaabatun', 
        icon: '', 
        category: 'Tempat' 
      },
      { 
        word: 'تَدْوِيرُ النِّفَايَاتِ', 
        meaning: 'Daur Ulang Sampah', 
        pronunciation: 'Tadwiirun nifaayaat', 
        icon: '', 
        category: 'Aktivitas' 
      },
      { 
        word: 'زِرَاعَةُ الْأَشْجَارِ', 
        meaning: 'Menanam Pohon (Reboisasi)', 
        pronunciation: 'Ziraa\'atul asyjaar', 
        icon: '', 
        category: 'Aktivitas' 
      },
      { 
        word: 'هَوَاءٌ نَقِيٌّ', 
        meaning: 'Udara Segar & Murni', 
        pronunciation: 'Hawaa\'un naqiyyun', 
        icon: '', 
        category: 'Lingkungan' 
      },
      { 
        word: 'تَلَوُّثُ الْهَوَاءِ', 
        meaning: 'Polusi Udara / Asap', 
        pronunciation: 'Talawwutsul hawaa\'', 
        icon: '', 
        category: 'Lingkungan' 
      },
      { 
        word: 'صُنْدُوقُ الْقُمَامَةِ', 
        meaning: 'Tempat Sampah', 
        pronunciation: 'Shunduuqul qumaamah', 
        icon: '', 
        category: 'Materi' 
      },
      { 
        word: 'حِمَايَةُ الطَّبِيعَةِ', 
        meaning: 'Perlindungan Konservasi Alam', 
        pronunciation: 'Himaayatuth thabii\'ah', 
        icon: '', 
        category: 'Nilai' 
      },
      { 
        word: 'مَاءٌ صَافٍ', 
        meaning: 'Air Jernih Bersih', 
        pronunciation: 'Maa\'un shaafin', 
        icon: '', 
        category: 'Lingkungan' 
      },
      { 
        word: 'جَفَافٌ', 
        meaning: 'Kekeringan', 
        pronunciation: 'Jafaafun', 
        icon: '', 
        category: 'Lingkungan' 
      }
    ],
    tarkib: [
      {
        name: 'Al-Haal & Shahibul Haal (الْحَالُ وَصَاحِبُ الْحَالِ)',
        patternArabic: 'فِعْلٌ + فَاعِلٌ (مَعْرِفَةٌ) + حَالٌ (مُفْرَدٌ نَكِرَةٌ مَنْصُوبٌ)',
        example: 'يَزْرَعُ الطُّلَّابُ الْأَشْجَارَ مُتَعَاوِنِينَ فِي فِنَاءِ الْمَدْرَسَةِ',
        explanation: 'Keadaan subjek ketika melakukan aktivitas (Haal) berbentuk isim nakirah dan berharakat fathah / ya\' nūn untuk jamak mudzakkar salim.'
      },
      {
        name: 'An-Na\'at wal Man\'ut (النعت والمنعوت)',
        patternArabic: 'مَنْعُوتٌ + نَعْتٌ مُطَابِقٌ (فِي التَّذْكِيرِ وَالتَّأْنِيثِ وَالْإِعْرَابِ)',
        example: 'نَحْتَاجُ إِلَى هَوَاءٍ نَقِيٍّ وَبِيئَةٍ نَظِيفَةٍ لِحَيَاةٍ صِحِّيَّةٍ',
        explanation: 'Kata sifat (na\'at) menyelaraskan secara utuh harakat dan status nakirah/ma\'rifah dari kata yang disifati (man\'ut).'
      },
      {
        name: 'Tarkib Larangan & Perintah Lingkungan (لا الناهية + الأمر)',
        patternArabic: 'لَا + فِعْلٌ مُضَارِعٌ مَجْزُومٌ (لَا تَرْمِ الْقُمَامَةَ)',
        example: 'لَا تَرْمِ الْقُمَامَةَ فِي مَجْرَى الْمَاءِ، وَحَافِظْ عَلَى نَظَافَةِ بِيئَتِكَ',
        explanation: 'Huruf laa nahiyah (larangan) menjazamkan fi\'il mudhari\' (dengan sukun atau membuang huruf \'illah).'
      }
    ],
    contohInsya: 'الْبِيئَةُ نِعْمَةٌ كَبِيرَةٌ مِنَ اللَّهِ يَجِبُ عَلَيْنَا أَنْ نُحَافِظَ عَلَيْهَا. فِي مَدْرَسَتِنَا، نَقُومُ بِحَمْلَةِ نَظَافَةٍ كُلَّ أُسْبُوعٍ حَيْثُ يَجْمَعُ الطُّلَّابُ الْقُمَامَةَ وَيَضَعُونَهَا فِي الصُّنْدُوقِ الْمُخَصَّصِ. كَمَا قُمْنَا بِزِرَاعَةِ الْأَشْجَارِ الْمُتَنَوِّعَةِ لِتَنْقِيَةِ الْهَوَاءِ وَتَجْمِيلِ الْمَنْظَرِ. إِنَّ النَّظَافَةَ مِنَ الْإِيمَانِ، وَالْبِيئَةُ النَّظِيفَةُ تَجْلِبُ الصِّحَّةَ وَالسَّعَادَةَ.',
    kesalahanUmum: [
      'Menulis kata Haal dalam bentuk ma\'rifah dengan alif lam (seharusnya nakirah: مُتَعَاوِنِينَ bukan الْمُتَعَاوِنِينَ).',
      'Lupa menjazamkan fi\'il setelah laa nahiyah.'
    ]
  }
];
