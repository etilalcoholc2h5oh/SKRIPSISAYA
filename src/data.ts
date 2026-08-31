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
  imageUrl: string;
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
    imageUrl: '/images/theme_tasawwuq_1785595437548.jpg',
    prompt: 'Tuliskan karangan singkat tentang pengalamanmu berbelanja kebutuhan di pasar tradisional atau supermarket (سُوق مَرْكَزِيّ), barang yang kamu beli, dan bagaimana proses tawar-menawar atau pembayarannya.',
    mufradat: [
      { 
        word: 'سُوقٌ مَرْكَزِيٌّ', 
        meaning: 'Supermarket / Swalayan', 
        pronunciation: 'Suuqun markaziyyun', 
        imageUrl: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=300&auto=format&fit=crop&q=80',
        icon: '🛒', 
        category: 'Tempat' 
      },
      { 
        word: 'سُوقٌ تَقْلِيدِيٌّ', 
        meaning: 'Pasar Tradisional', 
        pronunciation: 'Suuqun taqliidiyyun', 
        imageUrl: 'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?w=300&auto=format&fit=crop&q=80',
        icon: '🏪', 
        category: 'Tempat' 
      },
      { 
        word: 'قِسْمُ الْمَلَابِسِ', 
        meaning: 'Bagian Pakaian', 
        pronunciation: 'Qismul malaabis', 
        imageUrl: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=300&auto=format&fit=crop&q=80',
        icon: '👕', 
        category: 'Materi' 
      },
      { 
        word: 'قِسْمُ الْمَأْكُولَاتِ', 
        meaning: 'Bagian Makanan & Buah', 
        pronunciation: 'Qismul ma\'kuulaat', 
        imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=300&auto=format&fit=crop&q=80',
        icon: '🍎', 
        category: 'Materi' 
      },
      { 
        word: 'بَائِعٌ', 
        meaning: 'Penjual', 
        pronunciation: 'Baa\'i\'un', 
        imageUrl: 'https://images.unsplash.com/photo-1556740758-90de374c12ad?w=300&auto=format&fit=crop&q=80',
        icon: '👨‍💼', 
        category: 'Tokoh' 
      },
      { 
        word: 'مُشْتَرٍ', 
        meaning: 'Pembeli / Pelanggan', 
        pronunciation: 'Musytarin', 
        imageUrl: 'https://images.unsplash.com/photo-1534452203293-494d7ddbf7e0?w=300&auto=format&fit=crop&q=80',
        icon: '🛍️', 
        category: 'Tokoh' 
      },
      { 
        word: 'كَاشِير / أَمِينُ الصُّنْدُوقِ', 
        meaning: 'Kasir Pembayaran', 
        pronunciation: 'Amiinush shunduuq', 
        imageUrl: 'https://images.unsplash.com/photo-1556742049-0a67e5572293?w=300&auto=format&fit=crop&q=80',
        icon: '💳', 
        category: 'Aktivitas' 
      },
      { 
        word: 'تَخْفِيضٌ / خَصْمٌ', 
        meaning: 'Diskon / Potongan Harga', 
        pronunciation: 'Takhfiidhun / Khasymun', 
        imageUrl: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=300&auto=format&fit=crop&q=80',
        icon: '🏷️', 
        category: 'Materi' 
      },
      { 
        word: 'ثَمَنٌ / سِعْرٌ', 
        meaning: 'Harga Barang', 
        pronunciation: 'Tsamanun / Si\'run', 
        imageUrl: 'https://images.unsplash.com/photo-1580519542036-c47de6196ba5?w=300&auto=format&fit=crop&q=80',
        icon: '💵', 
        category: 'Materi' 
      },
      { 
        word: 'نَقْدًا', 
        meaning: 'Secara Tunai (Cash)', 
        pronunciation: 'Naqdan', 
        imageUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=300&auto=format&fit=crop&q=80',
        icon: '💰', 
        category: 'Materi' 
      },
      { 
        word: 'رَخِيصٌ', 
        meaning: 'Murah Terjangkau', 
        pronunciation: 'Rakhiishun', 
        imageUrl: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=300&auto=format&fit=crop&q=80',
        icon: '🟢', 
        category: 'Materi' 
      },
      { 
        word: 'غَالٍ', 
        meaning: 'Mahal / Premium', 
        pronunciation: 'Ghaalin', 
        imageUrl: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=300&auto=format&fit=crop&q=80',
        icon: '💎', 
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
    imageUrl: '/images/theme_sihhah_1785595448086.jpg',
    prompt: 'Tuliskan karangan tentang pengalaman berobat atau memeriksakan kesehatan di klinik/rumah sakit, nasihat dokter untuk pola hidup sehat, serta peran apotek dalam menyediakan obat.',
    mufradat: [
      { 
        word: 'مُسْتَشْفَى', 
        meaning: 'Rumah Sakit', 
        pronunciation: 'Mustasyfaa', 
        imageUrl: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=300&auto=format&fit=crop&q=80',
        icon: '🏥', 
        category: 'Tempat' 
      },
      { 
        word: 'طَبِيبٌ', 
        meaning: 'Dokter', 
        pronunciation: 'Thabiibun', 
        imageUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&auto=format&fit=crop&q=80',
        icon: '👨‍⚕️', 
        category: 'Tokoh' 
      },
      { 
        word: 'مُمَرِّضَةٌ', 
        meaning: 'Perawat', 
        pronunciation: 'Mumarridhatun', 
        imageUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=300&auto=format&fit=crop&q=80',
        icon: '👩‍⚕️', 
        category: 'Tokoh' 
      },
      { 
        word: 'مَرِيضٌ', 
        meaning: 'Pasien / Orang Sakit', 
        pronunciation: 'Mariidhun', 
        imageUrl: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=300&auto=format&fit=crop&q=80',
        icon: '🤒', 
        category: 'Tokoh' 
      },
      { 
        word: 'صَيْدَلِيَّةٌ', 
        meaning: 'Apotek', 
        pronunciation: 'Shaidaliyyatun', 
        imageUrl: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=300&auto=format&fit=crop&q=80',
        icon: '⚕️', 
        category: 'Tempat' 
      },
      { 
        word: 'دَوَاءٌ', 
        meaning: 'Obat / Resep', 
        pronunciation: 'Dawaa\'un', 
        imageUrl: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=300&auto=format&fit=crop&q=80',
        icon: '💊', 
        category: 'Materi' 
      },
      { 
        word: 'سَمَّاعَةُ الطَّبِيبِ', 
        meaning: 'Stetoskop', 
        pronunciation: 'Sammaa\'atuth thabiib', 
        imageUrl: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=300&auto=format&fit=crop&q=80',
        icon: '🩺', 
        category: 'Materi' 
      },
      { 
        word: 'عِيَادَةٌ', 
        meaning: 'Klinik / Ruang Periksa', 
        pronunciation: '\'Iyaadatun', 
        imageUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=300&auto=format&fit=crop&q=80',
        icon: '🚪', 
        category: 'Tempat' 
      },
      { 
        word: 'حُمَّى وَصُدَاعٌ', 
        meaning: 'Demam & Sakit Kepala', 
        pronunciation: 'Hummaa wa shudaa\'', 
        imageUrl: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=300&auto=format&fit=crop&q=80',
        icon: '🤕', 
        category: 'Perasaan' 
      },
      { 
        word: 'مِقْيَاسُ الْحَرَارَةِ', 
        meaning: 'Termometer Suhu', 
        pronunciation: 'Miqyaasul haraarah', 
        imageUrl: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=300&auto=format&fit=crop&q=80',
        icon: '🌡️', 
        category: 'Materi' 
      },
      { 
        word: 'صِحَّةٌ وَعَافِيَةٌ', 
        meaning: 'Kesehatan & Kebugaran', 
        pronunciation: 'Shihhatun wa \'aafiyah', 
        imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&auto=format&fit=crop&q=80',
        icon: '❤️', 
        category: 'Perasaan' 
      },
      { 
        word: 'وِقَايَةٌ', 
        meaning: 'Pencegahan Penyakit', 
        pronunciation: 'Wiqaayatun', 
        imageUrl: 'https://images.unsplash.com/photo-1584744982491-665216d95f8b?w=300&auto=format&fit=crop&q=80',
        icon: '🛡️', 
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
    imageUrl: '/images/theme_siyahah_1785595459670.jpg',
    prompt: 'Tuliskan karangan tentang rencana atau pengalaman wisatamu saat liburan ke destinasi alam atau kota bersejarah, pemesanan tiket, dan keindahan tempat yang dikunjungi.',
    mufradat: [
      { 
        word: 'مَطَارٌ', 
        meaning: 'Bandara Udara', 
        pronunciation: 'Mathaarun', 
        imageUrl: 'https://images.unsplash.com/photo-1530521954074-e64f6810b32d?w=300&auto=format&fit=crop&q=80',
        icon: '🛫', 
        category: 'Tempat' 
      },
      { 
        word: 'طَائِرَةٌ', 
        meaning: 'Pesawat Terbang', 
        pronunciation: 'Thaa\'iratun', 
        imageUrl: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=300&auto=format&fit=crop&q=80',
        icon: '✈️', 
        category: 'Materi' 
      },
      { 
        word: 'قِطَارٌ', 
        meaning: 'Kereta Api', 
        pronunciation: 'Qithaarun', 
        imageUrl: 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=300&auto=format&fit=crop&q=80',
        icon: '🚆', 
        category: 'Materi' 
      },
      { 
        word: 'جَوَازُ السَّفَرِ', 
        meaning: 'Paspor Perjalanan', 
        pronunciation: 'Jawaazus safar', 
        imageUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=300&auto=format&fit=crop&q=80',
        icon: '🛂', 
        category: 'Materi' 
      },
      { 
        word: 'تَذْكِرَةٌ', 
        meaning: 'Tiket Perjalanan', 
        pronunciation: 'Tadzkiratun', 
        imageUrl: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=300&auto=format&fit=crop&q=80',
        icon: '🎟️', 
        category: 'Materi' 
      },
      { 
        word: 'فُنْدُقٌ', 
        meaning: 'Hotel Penginapan', 
        pronunciation: 'Funduqun', 
        imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=300&auto=format&fit=crop&q=80',
        icon: '🏨', 
        category: 'Tempat' 
      },
      { 
        word: 'حَقِيبَةُ السَّفَرِ', 
        meaning: 'Koper Wisata', 
        pronunciation: 'Haqiibatus safar', 
        imageUrl: 'https://images.unsplash.com/photo-1581553680321-4fffae59fccd?w=300&auto=format&fit=crop&q=80',
        icon: '🧳', 
        category: 'Materi' 
      },
      { 
        word: 'شَاطِئُ الْبَحْرِ', 
        meaning: 'Pantai Laut', 
        pronunciation: 'Syaathi\'ul bahr', 
        imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=300&auto=format&fit=crop&q=80',
        icon: '🏖️', 
        category: 'Tempat' 
      },
      { 
        word: 'جَبَلٌ', 
        meaning: 'Gunung Alam', 
        pronunciation: 'Jabalun', 
        imageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=300&auto=format&fit=crop&q=80',
        icon: '⛰️', 
        category: 'Tempat' 
      },
      { 
        word: 'مَتْحَفٌ', 
        meaning: 'Museum Bersejarah', 
        pronunciation: 'Mathafun', 
        imageUrl: 'https://images.unsplash.com/photo-1565008447742-97f6f38c985c?w=300&auto=format&fit=crop&q=80',
        icon: '🏛️', 
        category: 'Tempat' 
      },
      { 
        word: 'مَنْظَرٌ طَبِيعِيٌّ', 
        meaning: 'Pemandangan Alami', 
        pronunciation: 'Manzharun thabi\'iyyun', 
        imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=300&auto=format&fit=crop&q=80',
        icon: '🌄', 
        category: 'Wisata' 
      },
      { 
        word: 'دَلِيلٌ سِيَاحِيٌّ', 
        meaning: 'Pemandu Wisata (Tour Guide)', 
        pronunciation: 'Daliilun siyaahiyyun', 
        imageUrl: 'https://images.unsplash.com/photo-1527631746610-bca00a040d60?w=300&auto=format&fit=crop&q=80',
        icon: '🧭', 
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
    id: 'hajj',
    titleArabic: 'الْحَجُّ وَالْعُمْرَةُ',
    titleIndo: 'Ibadah Haji & Umrah',
    grade: 'Kelas XI',
    imageUrl: 'https://images.unsplash.com/photo-1565552684305-7e930504df90?w=800&auto=format&fit=crop&q=80',
    prompt: 'Tuliskan deskripsi mengenai rangkaian manasik ibadah haji dan umrah, mulai dari niat ihram di miqat, thawaf di Ka\'bah, sa\'i di Shafa-Marwah, hingga wukuf di padang Arafah.',
    mufradat: [
      { 
        word: 'الْكَعْبَةُ الْمُشَرَّفَةُ', 
        meaning: 'Ka\'bah Al-Musyarrafah', 
        pronunciation: 'Al-Ka\'batul musyarrafah', 
        imageUrl: 'https://images.unsplash.com/photo-1565552684305-7e930504df90?w=300&auto=format&fit=crop&q=80',
        icon: '🕋', 
        category: 'Tempat' 
      },
      { 
        word: 'الْمَسْجِدُ الْحَرَامُ', 
        meaning: 'Masjidil Haram Makkah', 
        pronunciation: 'Al-Masjidul haraam', 
        imageUrl: 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=300&auto=format&fit=crop&q=80',
        icon: '🕌', 
        category: 'Tempat' 
      },
      { 
        word: 'إِحْرَامٌ', 
        meaning: 'Kain & Niat Ihram', 
        pronunciation: 'Ihraamun', 
        imageUrl: 'https://images.unsplash.com/photo-1564769625905-50e93615e769?w=300&auto=format&fit=crop&q=80',
        icon: '🕊️', 
        category: 'Aktivitas' 
      },
      { 
        word: 'طَوَافٌ', 
        meaning: 'Thawaf Keliling Ka\'bah', 
        pronunciation: 'Thawaafun', 
        imageUrl: 'https://images.unsplash.com/photo-1565552684305-7e930504df90?w=300&auto=format&fit=crop&q=80',
        icon: '🔄', 
        category: 'Aktivitas' 
      },
      { 
        word: 'سَعْيٌ', 
        meaning: 'Sa\'i Shafa & Marwah', 
        pronunciation: 'Sa\'yun', 
        imageUrl: 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?w=300&auto=format&fit=crop&q=80',
        icon: '🚶', 
        category: 'Aktivitas' 
      },
      { 
        word: 'وُقُوفٌ بِعَرَفَاتٍ', 
        meaning: 'Wukuf di Padang Arafah', 
        pronunciation: 'Wuquufun bi \'arafaat', 
        imageUrl: 'https://images.unsplash.com/photo-1564769625624-9b51b7536968?w=300&auto=format&fit=crop&q=80',
        icon: '⛺', 
        category: 'Aktivitas' 
      },
      { 
        word: 'مَاءُ زَمْزَمَ', 
        meaning: 'Air Zamzam Berkah', 
        pronunciation: 'Maa\'u zamzam', 
        imageUrl: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=300&auto=format&fit=crop&q=80',
        icon: '💧', 
        category: 'Materi' 
      },
      { 
        word: 'الْمَسْجِدُ النَّبَوِيُّ', 
        meaning: 'Masjid Nabawi Madinah', 
        pronunciation: 'Al-Masjidun nabawiyyu', 
        imageUrl: 'https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=300&auto=format&fit=crop&q=80',
        icon: '🕌', 
        category: 'Tempat' 
      },
      { 
        word: 'حَاجٌّ / حُجَّاجٌ', 
        meaning: 'Jamaah Haji', 
        pronunciation: 'Haajjun / Hujjaaj', 
        imageUrl: 'https://images.unsplash.com/photo-1564769625905-50e93615e769?w=300&auto=format&fit=crop&q=80',
        icon: '👥', 
        category: 'Tokoh' 
      },
      { 
        word: 'تَلْبِيَةٌ', 
        meaning: 'Talbiyah (Labbaykallahumma)', 
        pronunciation: 'Talbiyatun', 
        imageUrl: 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=300&auto=format&fit=crop&q=80',
        icon: '✨', 
        category: 'Aktivitas' 
      },
      { 
        word: 'رَمْيُ الْجَمَرَاتِ', 
        meaning: 'Lempar Jumrah di Mina', 
        pronunciation: 'Ramyul jamaraat', 
        imageUrl: 'https://images.unsplash.com/photo-1564769625624-9b51b7536968?w=300&auto=format&fit=crop&q=80',
        icon: '🪨', 
        category: 'Aktivitas' 
      },
      { 
        word: 'مَقَامُ إِبْرَاهِيمَ', 
        meaning: 'Maqam Ibrahim', 
        pronunciation: 'Maqaamu Ibraahiim', 
        imageUrl: 'https://images.unsplash.com/photo-1565552684305-7e930504df90?w=300&auto=format&fit=crop&q=80',
        icon: '✨', 
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
    imageUrl: '/images/theme_tiknulujiya_1785595472733.jpg',
    prompt: 'Jelaskan bagaimana kamu memanfaatkan teknologi informasi, internet, komputer, dan smartphone untuk menunjang kegiatan belajarmu sehari-hari secara positif.',
    mufradat: [
      { 
        word: 'هَاتِفٌ ذَكِيٌّ', 
        meaning: 'Smartphone / Ponsel Pintar', 
        pronunciation: 'Haatifun dzakiyyun', 
        imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&auto=format&fit=crop&q=80',
        icon: '📱', 
        category: 'Perangkat' 
      },
      { 
        word: 'حَاسُوبٌ مَحْمُولٌ', 
        meaning: 'Laptop / Komputer Jinjing', 
        pronunciation: 'Haasuubun mahmuul', 
        imageUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=300&auto=format&fit=crop&q=80',
        icon: '💻', 
        category: 'Perangkat' 
      },
      { 
        word: 'شَبَكَةُ الْإِنْتَرْنِت', 
        meaning: 'Jaringan Internet Global', 
        pronunciation: 'Syabakatul internet', 
        imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=300&auto=format&fit=crop&q=80',
        icon: '🌐', 
        category: 'Teknologi' 
      },
      { 
        word: 'مَوْقِعٌ إِلِكْتُرُونِيٌّ', 
        meaning: 'Situs Web / Website', 
        pronunciation: 'Mauqi\'un iliktuuruuniyyun', 
        imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=300&auto=format&fit=crop&q=80',
        icon: '🖥️', 
        category: 'Teknologi' 
      },
      { 
        word: 'وَسَائِلُ التَّوَاصُلِ', 
        meaning: 'Media Sosial', 
        pronunciation: 'Wasaa\'ilut tawaashul', 
        imageUrl: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=300&auto=format&fit=crop&q=80',
        icon: '💬', 
        category: 'Komunikasi' 
      },
      { 
        word: 'بَرِيدٌ إِلِكْتُرُونِيٌّ', 
        meaning: 'Surel / Email', 
        pronunciation: 'Bariidun iliktuuruuniyyun', 
        imageUrl: 'https://images.unsplash.com/photo-1596526131083-e8c633c948d2?w=300&auto=format&fit=crop&q=80',
        icon: '📧', 
        category: 'Komunikasi' 
      },
      { 
        word: 'تَطْبِيقٌ تَعْلِيمِيٌّ', 
        meaning: 'Aplikasi Pembelajaran', 
        pronunciation: 'Tathbliqun ta\'liimiyyun', 
        imageUrl: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=300&auto=format&fit=crop&q=80',
        icon: '📲', 
        category: 'Teknologi' 
      },
      { 
        word: 'بَحْثٌ عَنِ الْمَعْلُومَاتِ', 
        meaning: 'Pencarian Informasi Digital', 
        pronunciation: 'Bahtsun \'anil ma\'luumaat', 
        imageUrl: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=300&auto=format&fit=crop&q=80',
        icon: '🔍', 
        category: 'Aktivitas' 
      },
      { 
        word: 'شَاشَةٌ', 
        meaning: 'Layar Monitor', 
        pronunciation: 'Syaasyatun', 
        imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=300&auto=format&fit=crop&q=80',
        icon: '📺', 
        category: 'Perangkat' 
      },
      { 
        word: 'رِسَالَةٌ قَصِيرَةٌ', 
        meaning: 'Pesan Singkat (Chat)', 
        pronunciation: 'Risaalatun qashiiratun', 
        imageUrl: 'https://images.unsplash.com/photo-1577563908411-5077b6dc7624?w=300&auto=format&fit=crop&q=80',
        icon: '📨', 
        category: 'Komunikasi' 
      },
      { 
        word: 'تَحْمِيلُ الْمَلَفَّاتِ', 
        meaning: 'Download / Unduh Berkas', 
        pronunciation: 'Tahmiilul malaffaat', 
        imageUrl: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=300&auto=format&fit=crop&q=80',
        icon: '📥', 
        category: 'Aktivitas' 
      },
      { 
        word: 'مُفِيدٌ وَسَرِيعٌ', 
        meaning: 'Bermanfaat & Cepat', 
        pronunciation: 'Mufiidun wa sarii\'un', 
        imageUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=300&auto=format&fit=crop&q=80',
        icon: '⚡', 
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
    imageUrl: 'https://images.unsplash.com/photo-1590076215667-875d4ef2d7ee?w=800&auto=format&fit=crop&q=80',
    prompt: 'Tuliskan karangan tentang indahnya keberagaman suku dan agama di Indonesia, pentingnya sikap toleransi (تَسَامُح), gotong royong, dan saling menghormati antarumat beragama.',
    mufradat: [
      { 
        word: 'تَسَامُحٌ', 
        meaning: 'Toleransi & Kerukunan', 
        pronunciation: 'Tasaamuhun', 
        imageUrl: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=300&auto=format&fit=crop&q=80',
        icon: '🤝', 
        category: 'Nilai' 
      },
      { 
        word: 'مَسْجِدٌ', 
        meaning: 'Masjid Tempat Ibadah', 
        pronunciation: 'Masjidun', 
        imageUrl: 'https://images.unsplash.com/photo-1590076215667-875d4ef2d7ee?w=300&auto=format&fit=crop&q=80',
        icon: '🕌', 
        category: 'Tempat' 
      },
      { 
        word: 'كَنِيسَةٌ', 
        meaning: 'Gereja', 
        pronunciation: 'Kaniisatun', 
        imageUrl: 'https://images.unsplash.com/photo-1548625361-195679540b61?w=300&auto=format&fit=crop&q=80',
        icon: '⛪', 
        category: 'Tempat' 
      },
      { 
        word: 'مَعْبَدٌ / بَيْتُ الْعِبَادَةِ', 
        meaning: 'Candi / Rumah Ibadah', 
        pronunciation: 'Ma\'badun / Baitul \'ibaadah', 
        imageUrl: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=300&auto=format&fit=crop&q=80',
        icon: '🛕', 
        category: 'Tempat' 
      },
      { 
        word: 'وَحْدَةٌ وَطَنِيَّةٌ', 
        meaning: 'Persatuan Bangsa (Bhinneka)', 
        pronunciation: 'Wahdatun wathaniyyah', 
        imageUrl: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=300&auto=format&fit=crop&q=80',
        icon: '🇮🇩', 
        category: 'Nilai' 
      },
      { 
        word: 'سَلَامٌ وَأَمْنٌ', 
        meaning: 'Kedamaian & Keamanan', 
        pronunciation: 'Salaamun wa amnun', 
        imageUrl: 'https://images.unsplash.com/photo-1532375810709-75b1da00537c?w=300&auto=format&fit=crop&q=80',
        icon: '🕊️', 
        category: 'Nilai' 
      },
      { 
        word: 'مُجْتَمَعٌ', 
        meaning: 'Masyarakat Majemuk', 
        pronunciation: 'Mujtama\'un', 
        imageUrl: 'https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?w=300&auto=format&fit=crop&q=80',
        icon: '👥', 
        category: 'Tokoh' 
      },
      { 
        word: 'مُوَاطِنٌ', 
        meaning: 'Warga Negara', 
        pronunciation: 'Muwaathinun', 
        imageUrl: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=300&auto=format&fit=crop&q=80',
        icon: '👤', 
        category: 'Tokoh' 
      },
      { 
        word: 'إِخَاءٌ إِنْسَانِيٌّ', 
        meaning: 'Persaudaraan Kemanusiaan', 
        pronunciation: 'Ikhaa\'un insaaniyyun', 
        imageUrl: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=300&auto=format&fit=crop&q=80',
        icon: '❤️', 
        category: 'Nilai' 
      },
      { 
        word: 'تَعَاوُنٌ / تَكَافُلٌ', 
        meaning: 'Gotong Royong & Saling Bantu', 
        pronunciation: 'Ta\'aawunun / Takaafulun', 
        imageUrl: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=300&auto=format&fit=crop&q=80',
        icon: '🤲', 
        category: 'Aktivitas' 
      },
      { 
        word: 'احْتِرَامٌ مُتَبَادَلٌ', 
        meaning: 'Saling Menghormati', 
        pronunciation: 'Ihtiraamun mutabaadal', 
        imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80',
        icon: '🌟', 
        category: 'Nilai' 
      },
      { 
        word: 'دِينٌ / أَدْيَانٌ', 
        meaning: 'Agama-agama', 
        pronunciation: 'Diinun / Adyaan', 
        imageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=300&auto=format&fit=crop&q=80',
        icon: '📖', 
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
    imageUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop&q=80',
    prompt: 'Tuliskan karangan tentang pentingnya menjaga kebersihan lingkungan sekolah dan tempat tinggal, gerakan menanam pohon (penghijauan), serta bahaya membuang sampah sembarangan.',
    mufradat: [
      { 
        word: 'بِيئَةٌ نَظِيفَةٌ', 
        meaning: 'Lingkungan Bersih Sehat', 
        pronunciation: 'Bii\'atun nazhiifatun', 
        imageUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=300&auto=format&fit=crop&q=80',
        icon: '🌱', 
        category: 'Lingkungan' 
      },
      { 
        word: 'نَظَافَةٌ', 
        meaning: 'Kebersihan', 
        pronunciation: 'Nazhaafatun', 
        imageUrl: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=300&auto=format&fit=crop&q=80',
        icon: '✨', 
        category: 'Nilai' 
      },
      { 
        word: 'شَجَرَةٌ / أَشْجَارٌ', 
        meaning: 'Pohon / Pepohonan Hijau', 
        pronunciation: 'Syajaratun / Asyjaar', 
        imageUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=300&auto=format&fit=crop&q=80',
        icon: '🌳', 
        category: 'Lingkungan' 
      },
      { 
        word: 'غَابَةٌ', 
        meaning: 'Hutan Rindang', 
        pronunciation: 'Ghaabatun', 
        imageUrl: 'https://images.unsplash.com/photo-1511497584788-87676104235f?w=300&auto=format&fit=crop&q=80',
        icon: '🌲', 
        category: 'Tempat' 
      },
      { 
        word: 'تَدْوِيرُ النِّفَايَاتِ', 
        meaning: 'Daur Ulang Sampah', 
        pronunciation: 'Tadwiirun nifaayaat', 
        imageUrl: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=300&auto=format&fit=crop&q=80',
        icon: '♻️', 
        category: 'Aktivitas' 
      },
      { 
        word: 'زِرَاعَةُ الْأَشْجَارِ', 
        meaning: 'Menanam Pohon (Reboisasi)', 
        pronunciation: 'Ziraa\'atul asyjaar', 
        imageUrl: 'https://images.unsplash.com/photo-1576085898323-218337e3e43c?w=300&auto=format&fit=crop&q=80',
        icon: '🪴', 
        category: 'Aktivitas' 
      },
      { 
        word: 'هَوَاءٌ نَقِيٌّ', 
        meaning: 'Udara Segar & Murni', 
        pronunciation: 'Hawaa\'un naqiyyun', 
        imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=300&auto=format&fit=crop&q=80',
        icon: '🍃', 
        category: 'Lingkungan' 
      },
      { 
        word: 'تَلَوُّثُ الْهَوَاءِ', 
        meaning: 'Polusi Udara / Asap', 
        pronunciation: 'Talawwutsul hawaa\'', 
        imageUrl: 'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=300&auto=format&fit=crop&q=80',
        icon: '🏭', 
        category: 'Lingkungan' 
      },
      { 
        word: 'صُنْدُوقُ الْقُمَامَةِ', 
        meaning: 'Tempat Sampah', 
        pronunciation: 'Shunduuqul qumaamah', 
        imageUrl: 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?w=300&auto=format&fit=crop&q=80',
        icon: '🗑️', 
        category: 'Materi' 
      },
      { 
        word: 'حِمَايَةُ الطَّبِيعَةِ', 
        meaning: 'Perlindungan Konservasi Alam', 
        pronunciation: 'Himaayatuth thabii\'ah', 
        imageUrl: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=300&auto=format&fit=crop&q=80',
        icon: '🛡️', 
        category: 'Nilai' 
      },
      { 
        word: 'مَاءٌ صَافٍ', 
        meaning: 'Air Jernih Bersih', 
        pronunciation: 'Maa\'un shaafin', 
        imageUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=300&auto=format&fit=crop&q=80',
        icon: '🌊', 
        category: 'Lingkungan' 
      },
      { 
        word: 'جَفَافٌ', 
        meaning: 'Kekeringan', 
        pronunciation: 'Jafaafun', 
        imageUrl: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=300&auto=format&fit=crop&q=80',
        icon: '🏜️', 
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
