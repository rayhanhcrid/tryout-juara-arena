-- "TKA Geografi 2025" in the forms of the original paper (needs 0004): pilihan
-- ganda with five options, pilihan ganda kompleks (more than one answer) and
-- kategori (Benar/Salah, Sesuai/Tidak Sesuai, Fakta/Opini). Updates the
-- questions seeded by 0002 in place, by position. Idempotent.

update public.questions q
set kind = v.kind,
    text = v.text,
    options = v.options::jsonb,
    categories = v.categories::jsonb,
    answer = v.answer::jsonb
from (values
    (1, 'category', $q$Perhatikan peta biogeografi Indonesia berikut. Garis Wallace dan Garis Weber menunjukkan batas persebaran flora dan fauna di Indonesia yang dipengaruhi oleh sejarah geologi kawasan. Kedua garis itu memisahkan wilayah dengan karakteristik flora dan fauna Asia, kawasan peralihan, dan Australia. Pengelolaan flora lokal yang tepat sesuai karakter wilayah dapat meningkatkan kesejahteraan masyarakat setempat.
---
Tentukan pernyataan Benar atau Salah mengenai pengelolaan flora lokal berikut!$q$,
      $q$["Pengembangan perkebunan matoa secara besar-besaran di Pulau Bangka sesuai potensi flora lokal di wilayah tersebut.","Pohon sagu sebaiknya dibudidayakan di Kepulauan Aru untuk ketahanan pangan masyarakat setempat.","Budi daya tanaman rotan di Jambi sesuai dengan karakteristik flora lokalnya."]$q$,
      $q$["Benar","Salah"]$q$,
      $q$[1,0,0]$q$),
    (2, 'single', $q$Pembangkit Listrik Tenaga Surya (PLTS) Terapung Cirata yang dibangun di atas Waduk Cirata, Jawa Barat, merupakan proyek energi terbarukan strategis nasional dan terbesar di Asia Tenggara. PLTS ini dibangun di atas area seluas sekitar 200 hektare dari total permukaan waduk 6.200 hektare atau sekitar 3,2% dari luas waduk. Dengan kapasitas daya mencapai 192 megawatt peak (MWp), PLTS ini mampu menghasilkan listrik sekitar 300 GWh per tahun, cukup untuk memenuhi kebutuhan energi lebih dari 50.000 rumah tangga.

Selain menghasilkan listrik bersih, PLTS terapung memberikan manfaat tambahan berupa pengurangan penguapan air waduk hingga 30% di area yang tertutup panel surya. Suhu air di bawah modul terapung cenderung lebih stabil, yang terbukti menurunkan risiko blooming alga dan meningkatkan kualitas oksigen terlarut (DO) pada pagi hari. Hal ini menguntungkan bagi biota perairan, khususnya ikan nila dan patin yang menjadi komoditas utama budi daya masyarakat sekitar.

Namun demikian, pembangunan sistem terapung ini menimbulkan tantangan teknis seperti biaya pemasangan yang lebih tinggi dibanding PLTS darat, potensi pelapukan material karena kelembapan tinggi, serta kekhawatiran akan terganggunya jalur perahu nelayan. Oleh karena itu, keterlibatan masyarakat lokal dan evaluasi berkala terhadap dampak lingkungan menjadi bagian penting dalam manajemen proyek ini.
---
Berdasarkan data dan informasi pada stimulus tentang PLTS Terapung Cirata, manakah dari pernyataan berikut yang merupakan manfaat atau implikasi langsung dari pembangunan pembangkit tersebut?$q$,
      $q$["PLTS Cirata dapat mengurangi emisi karbon dari sektor transportasi sebesar 300 ribu ton CO₂ per tahun.","Rendahnya fluktuasi suhu air di bawah panel surya berpotensi mengurangi laju pertumbuhan alga.","Selain menghasilkan energi terbarukan, panel surya menahan panas yang diterima permukaan air.","Nelayan lokal berpeluang berkolaborasi untuk pemeliharaan PLTS yang bermanfaat membangun kesadaran bersama.","Instalasi PLTS terapung memungkinkan peningkatan debit air masuk ke waduk saat musim hujan."]$q$,
      null,
      $q$"b"$q$),
    (3, 'single', $q$Berikut disajikan citra satelit Wilayah Ceper, Kabupaten Klaten, dan sekitarnya pada tahun 2007 (atas) dan 2024 (bawah). Pada citra tersebut terlihat perubahan penggunaan lahan.
---
Berdasarkan perbandingan citra satelit tahun 2007 dan 2024 wilayah Ceper, Kabupaten Klaten, perubahan penggunaan lahan yang paling dominan adalah …$q$,
      $q$["Hutan lindung menjadi lahan perkebunan","Sawah menjadi bangunan","Lahan tandus menjadi kawasan resapan air","Sawah menjadi kawasan konservasi alam","Permukiman menjadi kawasan pertanian organik"]$q$,
      null,
      $q$"b"$q$),
    (4, 'single', $q$Berikut disajikan citra satelit Kota Banjarmasin dan sekitarnya pada tahun 2002 dan 2024. Pada citra terlihat perbedaan penggunaan lahan di area alih fungsi lahan.
---
Berdasarkan perubahan penggunaan lahan yang tampak pada citra satelit Banjarmasin tahun 2002 dan 2024, konsep alih fungsi lahan dapat diterapkan untuk menjelaskan bahwa …$q$,
      $q$["Perubahan dari kawasan terbuka menjadi kawasan terbangun merupakan bentuk dari alih fungsi lahan yang alami","Alih fungsi lahan hanya terjadi pada daerah pegunungan dan lereng curam","Peningkatan jumlah bangunan pada kawasan vegetatif mencerminkan tekanan penduduk terhadap lingkungan","Semua kawasan kota seharusnya dialihfungsikan agar memenuhi kebutuhan ekonomi","Perubahan tersebut tidak berdampak pada lingkungan karena berada di wilayah datar"]$q$,
      null,
      $q$"c"$q$),
    (5, 'single', $q$Indonesia secara geografis terletak di antara dua benua dan dua samudra, serta memiliki wilayah yang membentang dari barat ke timur sepanjang sekitar 5.200 km. Kondisi ini menyebabkan adanya perbedaan pola curah hujan dan iklim antardaerah. Salah satu bentuk analisis iklim adalah melalui peta Standardized Precipitation Index (SPI) yang digunakan untuk mengetahui kondisi kekeringan atau kebasahan suatu wilayah dalam jangka waktu tertentu.

Perhatikan peta SPI 1 bulanan (Februari 2025) berdasarkan data BMKG berikut. (Sumber: bmkg.go.id)
---
Berdasarkan peta SPI dan pemahaman tentang variasi iklim di Indonesia, manakah wilayah berikut yang kemungkinan besar mengalami risiko gagal panen akibat kekeringan ekstrem pada Februari 2025?$q$,
      $q$["Kalimantan Utara","Papua Selatan","Jawa Barat","Sulawesi Tengah","Sumatera Selatan"]$q$,
      null,
      $q$"b"$q$),
    (6, 'single', $q$Indonesia memiliki lima Destinasi Super Prioritas (DSP) yang tersebar di berbagai wilayah, yakni Danau Toba di Sumatera Utara, Borobudur di Jawa Tengah–DIY, Mandalika di Nusa Tenggara Barat, Labuan Bajo di Nusa Tenggara Timur, dan Likupang di Sulawesi Utara. Masing-masing destinasi memiliki karakter geografis yang berbeda, baik dari sisi kedekatannya dengan jalur pelayaran internasional, keberadaan bandara internasional, maupun potensi alam dan budaya yang dimiliki. Pemerintah mengembangkan kawasan ini sebagai bagian dari upaya meningkatkan peran sektor pariwisata dan memperkuat keterhubungan Indonesia dengan kawasan regional maupun internasional.

Perhatikan tabel berikut. (Sumber: paltv.disway.id)
---
Berdasarkan data dalam tabel, mengapa pengembangan destinasi wisata super prioritas di wilayah seperti Labuan Bajo dan Likupang berpotensi menarik wisatawan internasional?$q$,
      $q$["Karena berada di tengah-tengah pulau utama Indonesia yang mudah dijangkau dengan jalur darat","Karena letaknya di dataran tinggi yang bebas dari bencana alam dan polusi udara","Karena memiliki karakter geografis khas dan dekat dengan jalur internasional laut atau udara","Karena letaknya terpencil sehingga menawarkan eksklusivitas penuh bagi wisatawan asing","Karena menjadi pusat administrasi dan pemerintahan di wilayah timur Indonesia"]$q$,
      null,
      $q$"c"$q$),
    (7, 'category', $q$Perhatikan peta Rencana Pola Ruang Kota Binjai berikut. (Sumber: Pemerintah Kota Binjai)
---
Manakah pernyataan berikut yang menunjukkan arah perkembangan kota di Kota Binjai berdasarkan Peta Tata Ruang Wilayah tersebut?$q$,
      $q$["Perkembangan kota ke arah selatan secara signifikan yang didukung adanya kawasan botani dan pertanian, serta kawasan wisata.","Perkembangan kota ke arah barat secara signifikan yang didukung selaras dengan kawasan perdagangan/jasa, pusat pemerintahan, dan jalur transportasi.","Perkembangan kota ke arah utara secara signifikan karena adanya dukungan kawasan industri serta kawasan perdagangan/jasa."]$q$,
      $q$["Sesuai","Tidak Sesuai"]$q$,
      $q$[1,0,0]$q$),
    (8, 'category', $q$Perhatikan peta Rencana Pola Ruang Kota Binjai berikut. (Sumber: Pemerintah Kota Binjai)
---
Seorang pengusaha akan membangun sebuah bisnis properti komersial pada lokasi X. Jenis usaha yang sesuai untuk pengusaha tersebut adalah …$q$,
      $q$["Pembangunan apartemen","Budi daya peternakan","Pusat bisnis dan perekonomian (mal)"]$q$,
      $q$["Sesuai","Tidak Sesuai"]$q$,
      $q$[0,1,1]$q$),
    (9, 'multiple', $q$Perhatikan tabel proyeksi penduduk ex Provinsi Papua (Provinsi Papua, Papua Tengah, Papua Pegunungan, dan Papua Selatan) menurut kelompok umur berikut (dalam ribu jiwa).
---
Berdasarkan proyeksi penduduk tahun 2025, strategi pembangunan yang PALING TEPAT untuk 10 tahun mendatang adalah …$q$,
      $q$["Mengembangkan pusat-pusat vokasi serta program magang industri yang relevan bagi lulusan SMA/sederajat.","Memperluas akses pendidikan tinggi dan beasiswa untuk jenjang sarjana dan pascasarjana.","Mendorong program transmigrasi ke wilayah luar Papua untuk mengurangi tekanan demografi di kota besar.","Menambah anggaran subsidi energi dan pangan untuk semua kelompok usia sebagai bentuk pemerataan pembangunan.","Menganalisis potensi investasi dan membuka lapangan kerja baru di sektor unggulan lokal seperti pertanian, perikanan, dan ekonomi digital."]$q$,
      null,
      $q$["a","e"]$q$),
    (10, 'multiple', $q$Perhatikan piramida penduduk Kota Banjar, Provinsi Jawa Barat, berikut.

Jumlah penduduk Kota Banjar tercatat sebanyak 210.000 jiwa. Dari jumlah tersebut, sebanyak 105.300 jiwa merupakan penduduk laki-laki dan 104.600 jiwa merupakan penduduk perempuan. Rasio jenis kelaminnya sekitar 99,34 perempuan untuk setiap 100 laki-laki, artinya jumlah laki-laki dan perempuan hampir seimbang dengan selisih yang sangat kecil.
---
Berdasarkan struktur penduduk tersebut, simpulan yang tepat untuk menggambarkan kondisi demografi wilayah tersebut adalah …$q$,
      $q$["Kota Banjar sedang menikmati bonus demografi karena dominasi penduduk usia produktif.","Rasio ketergantungan tinggi karena sebagian besar penduduk berada pada usia tua.","Perencanaan pembangunan perlu fokus pada peningkatan kualitas tenaga kerja dan pendidikan.","Rasio ketergantungan tinggi karena sebagian besar penduduk masih remaja nonproduktif.","Mobilitas antarwilayah yang menyumbang pertumbuhan penduduk masih rendah."]$q$,
      null,
      $q$["a","c"]$q$),
    (11, 'multiple', $q$Perhatikan infografik penuaan penduduk di Indonesia berikut.

Indonesia dan negara-negara ASEAN sedang menghadapi tantangan penuaan penduduk, yaitu bertambahnya jumlah lansia dan berkurangnya penduduk usia produktif. Akibatnya, beban ekonomi negara meningkat karena pengeluaran untuk pensiun dan kesehatan bertambah, sementara tenaga kerja menurun. Jika tidak dipersiapkan sejak sekarang, kondisi ini bisa menghambat pertumbuhan ekonomi. Untuk itu, pemerintah perlu menyiapkan strategi agar lansia tetap sehat, mandiri, dan produktif, seperti melalui program perlindungan sosial dan lingkungan yang ramah lansia.
---
Apa saja upaya yang dapat dilakukan pemerintah untuk mengurangi dampak negatif dari penuaan penduduk di masa depan?$q$,
      $q$["Menyediakan program perlindungan sosial bagi penduduk tua agar tetap sejahtera","Meningkatkan belanja negara untuk peningkatan kualitas hidup masyarakat","Menciptakan lingkungan yang ramah lansia agar mereka tetap mandiri dan produktif","Mengampanyekan budaya hidup sehat di lingkungan masyarakat","Kebijakan penambahan usia pensiun untuk aparatur sipil negara"]$q$,
      null,
      $q$["a","c","d"]$q$),
    (12, 'category', $q$Perhatikan citra dan garis kontur (elevasi) kawasan hutan di Gunung Arjuno, Kota Batu, berikut. (Skala 1 : 7.500; sumber: citra Google Earth)
---
Manakah pernyataan berikut yang menunjukkan perencanaan infrastruktur yang sesuai dengan karakteristik wilayah pada citra dan elevasi tersebut?$q$,
      $q$["Pembangunan peternakan sapi, mendekatkan dengan sumber pakan di lokasi C","Pembangunan sistem irigasi tetes di lokasi A, guna penghematan energi","Pembuatan terasering pada semua wilayah sebagai upaya pencegahan laju erosi di lokasi A"]$q$,
      $q$["Sesuai","Tidak Sesuai"]$q$,
      $q$[1,1,0]$q$),
    (13, 'category', $q$Perhatikan informasi tentang penambangan nikel di Halmahera Timur berikut.

Sejak 2019, Halmahera Timur, Maluku Utara, menjadi lokasi ekspansi besar-besaran industri pertambangan nikel untuk mendukung kebutuhan baterai kendaraan listrik global. Aktivitas ini membuka lapangan kerja dan meningkatkan pendapatan daerah, namun juga menimbulkan masalah lingkungan serius seperti kerusakan hutan mangrove, pencemaran sungai akibat limbah tailing, dan gangguan ekosistem pesisir.

Sebuah laporan (2023) menyebutkan bahwa hanya sebagian kecil perusahaan tambang yang menjalankan reklamasi dan revegetasi pascatambang. Pemerintah daerah menghadapi dilema antara mendorong investasi atau melindungi keberlanjutan ekologi. Sementara itu, masyarakat adat mulai kehilangan akses terhadap hutan dan sumber daya alam yang sebelumnya menjadi tumpuan hidup. Upaya konservasi seperti audit lingkungan, zonasi wilayah adat, dan restorasi mangrove telah diusulkan, namun implementasinya berjalan lambat. (Sumber: Mongabay Indonesia, 2023)
---
Berdasarkan informasi di atas, bagaimana keberlanjutan pengelolaan sumber daya alam berdasarkan prinsip konservasi dan restorasi lingkungan?$q$,
      $q$["Revegetasi yang dilakukan sebagian kecil perusahaan merupakan bentuk pengelolaan SDA berbasis restorasi.","Audit lingkungan tidak berkaitan dengan konservasi karena hanya berupa kegiatan administratif yang tidak berdampak pada ekosistem.","Zonasi wilayah adat merupakan bentuk konservasi karena menjaga wilayah hidup masyarakat sekaligus melindungi lingkungan."]$q$,
      $q$["Benar","Salah"]$q$,
      $q$[0,1,0]$q$),
    (14, 'single', $q$Perhatikan informasi tentang kebakaran hutan dan lahan gambut di Kalimantan Tengah berikut. (Sumber gambar: desyyusnita.com)

Setiap musim kemarau, wilayah Kabupaten Pulang Pisau dan Kabupaten Kapuas, Kalimantan Tengah, mengalami kebakaran hutan dan lahan gambut yang meluas. Data kejadian karhutla mulai Januari hingga September 2023 mencatat 358 kejadian di Pulang Pisau dan 352 kejadian di Kapuas. Pembukaan lahan dengan cara dibakar oleh oknum yang tidak bertanggung jawab menjadi salah satu penyebab kebakaran.

Kebakaran ini tidak hanya menyebabkan kerusakan ekosistem, tetapi juga mengganggu kesehatan masyarakat akibat kabut asap, serta menurunkan produktivitas pertanian dan perikanan lokal. Sejak 2020, pemerintah dan organisasi masyarakat sipil bekerja sama melalui program restorasi gambut dengan pendekatan 3R: rewetting (pembasahan), revegetation (penanaman ulang), dan revitalization (pemberdayaan ekonomi lokal). Sebelum musim kemarau tiba, sebuah kelompok juga sudah melakukan perawatan sumur bor yang sebelumnya dibangun oleh BRGM (Badan Restorasi Gambut dan Mangrove), agar sumur tetap berfungsi optimal saat dibutuhkan. (Sumber: MMC Kalteng, 2023; Antara Kalteng, 2023)
---
Berdasarkan narasi tersebut, bagaimana langkah yang tepat untuk menjaga keseimbangan antara pemanfaatan ekonomi dan pelestarian lahan gambut di Kalimantan Tengah?$q$,
      $q$["Meningkatkan produktivitas lahan gambut dengan memperluas pembukaan lahan secara efisien.","Menetapkan larangan total aktivitas masyarakat di seluruh kawasan gambut untuk mencegah kerusakan.","Melanjutkan pembukaan lahan gambut dengan sistem tebang pilih agar tetap lestari dan menjaga rotasi tanaman.","Mendorong program pertanian ramah gambut dan mengembangkan produk hasil hutan bukan kayu.","Mengganti lahan gambut dengan tambak agar menghasilkan keuntungan ekonomi yang lebih tinggi."]$q$,
      null,
      $q$"d"$q$),
    (15, 'single', $q$Saat musim kemarau, wilayah Kalimantan Selatan sering mengalami kebakaran lahan gambut, seperti di Kota Banjarbaru pada Juli 2024. Sementara itu, saat musim hujan wilayah ini sering dilanda banjir karena daya serap air yang rendah, seperti di Kabupaten Banjar dan Kabupaten Barito Kuala pada Desember 2024.

Wilayah Nusa Tenggara Timur (NTT) rentan mengalami bencana kekeringan saat musim kemarau. Kabupaten Kupang menjadi salah satu daerah yang mengalami kekeringan ekstrem pada November 2023 dan menyebabkan kelangkaan air bersih. Sementara itu, NTT juga rentan dilanda banjir saat musim hujan. Pada Maret 2023, desa di Kabupaten Kupang mengalami banjir akibat curah hujan sedang hingga lebat yang terjadi selama beberapa hari.
---
Fenomena bencana di Kalimantan Selatan maupun NTT cenderung berulang setiap tahunnya. Konsep geografi yang tepat untuk menjelaskan keteraturan terjadinya bencana tersebut adalah …$q$,
      $q$["diferensiasi area","keterjangkauan","interaksi","pola","aglomerasi"]$q$,
      null,
      $q$"d"$q$),
    (16, 'category', $q$Perhatikan foto pertanian di sekitar Gunung Marapi, Sumatera Barat, berikut.
---
Tentukan Fakta atau Opini dari pernyataan yang berhubungan dengan aktivitas Gunung Marapi dan kondisi lahan pertanian subur di sekitarnya!$q$,
      $q$["Keberadaan lahan subur di sekitar Gunung Marapi sepenuhnya bergantung pada intensitas letusan yang terjadi setiap tahun.","Material hasil letusan gunung api dapat memperbaiki struktur tanah dan memperkaya unsur hara setelah mengalami pelapukan.","Tanah vulkanik dari Gunung Marapi cenderung memiliki kandungan mineral yang tinggi sehingga cocok untuk pertanian sayur dan buah."]$q$,
      $q$["Fakta","Opini"]$q$,
      $q$[1,0,0]$q$),
    (17, 'single', $q$Perhatikan peta guncangan (ShakeMap) BMKG dan skala intensitasnya berikut. (Sumber: BMKG)

Gempa bumi bermagnitudo 4,1 mengguncang Bogor, Jawa Barat, pada Kamis malam, 10 April 2025. Akibatnya, 35 unit rumah rusak. Gempa tersebut dipicu oleh aktivitas Sesar Citarik, yang merupakan salah satu sesar aktif di bagian barat Pulau Jawa.
---
Berdasarkan informasi tersebut, salah satu bentuk adaptasi struktural yang paling tepat dilakukan untuk mengurangi risiko korban jiwa dan kerusakan adalah …$q$,
      $q$["membangun rumah berpondasi beton berat agar tidak mudah roboh saat gempa","melakukan simulasi evakuasi gempa secara rutin kepada seluruh masyarakat","merancang permukiman baru dengan peta mikrozonasi gempa sebagai acuan","membangun permukiman padat di dataran rendah agar jauh dari pusat gempa","menunda pembangunan infrastruktur hingga sesar dinyatakan tidak aktif"]$q$,
      null,
      $q$"c"$q$),
    (18, 'single', $q$Indikator pembangunan sosial Kota Makassar dan Kota Medan tahun 2023 (Sumber: Badan Pusat Statistik, 2023):
• Rata-rata lama sekolah: Makassar 11,47 tahun; Medan 10,69 tahun.
• Angka melek huruf: Makassar 99,23%; Medan 98,94%.
• Akses air minum layak: Makassar 99,92%; Medan 87,39%.
• Angka pengangguran terbuka: Makassar 9,53%; Medan 8,86%.
• Rasio tenaga kesehatan per 100.000 penduduk: Makassar 989; Medan 732.

Perbedaan capaian ini menunjukkan adanya dinamika dalam pembangunan sosial antara dua kota besar di Indonesia yang memiliki kondisi geografis dan karakter penduduk yang berbeda.
---
Berdasarkan Tabel Indikator Pembangunan Sosial Kota Makassar dan Kota Medan Tahun 2023, tentukan simpulan yang paling tepat dan logis dari pernyataan berikut!$q$,
      $q$["Kota Medan secara umum menunjukkan kualitas sosial lebih tinggi karena angka penganggurannya lebih rendah.","Kota Makassar menunjukkan keunggulan pelayanan dasar dan kualitas pendidikan, meskipun menghadapi tantangan lapangan kerja.","Kota Medan memiliki rasio tenaga kesehatan yang lebih baik, tetapi tertinggal dalam pendidikan dasar.","Kota Makassar memiliki tantangan serius dalam akses air minum dan layanan kesehatan dibandingkan Kota Medan.","Kedua kota menunjukkan capaian pembangunan yang seimbang, karena perbedaan data masing-masing hanya terjadi dalam selisih kecil."]$q$,
      null,
      $q$"b"$q$),
    (19, 'single', $q$Perhatikan peta isoseismal gempa bumi Tapanuli Utara, 1 Oktober 2022, berikut. (Sumber: BMKG)

Pada 1 Oktober 2022 pukul 02.28.41 WIB, wilayah Kabupaten Pasaman Barat diguncang gempa bumi berkekuatan magnitudo 5,8 dengan kedalaman 10 km. Episenter gempa berada di darat pada koordinat 2,11° LU dan 98,83° BT. Getaran kuat dirasakan di beberapa kecamatan seperti Talamau, Kinali, dan Pasaman, menyebabkan kerusakan pada rumah tidak tahan gempa serta memicu longsor di kawasan perbukitan. Peta isoseismal menunjukkan bahwa wilayah dengan intensitas getaran tertinggi berada di sekitar zona patahan aktif Sumatra. Aktivitas manusia seperti pembangunan permukiman di kaki bukit tanpa perkuatan struktur turut memperbesar kerusakan akibat getaran tanah dan pergerakan lereng.
---
Berdasarkan peta dan narasi di atas, bagaimana dampak yang kemungkinan terjadi akibat gempa Tapanuli Utara di lokasi titik episenter?$q$,
      $q$["Lokasi titik episenter dapat mengalami beberapa kerusakan struktur ringan pada bangunan permukiman","Lokasi titik episenter tidak mengalami kerusakan bangunan dan hanya dapat menjatuhkan benda kecil di atas meja","Lokasi titik episenter mengalami kerusakan besar seperti robohnya seluruh bangunan","Lokasi titik episenter mengalami kerusakan sedang seperti robohnya sebagian bangunan","Lokasi titik episenter tidak mengalami kerusakan apa pun"]$q$,
      null,
      $q$"a"$q$),
    (20, 'category', $q$Perhatikan peta isoseismal gempa bumi Sigi, Sulawesi Tengah, berikut. (Sumber: BMKG)

Pada 27 Februari 2023 pukul 08.26.02 WIB, wilayah Kabupaten Sigi, Sulawesi Tengah, diguncang gempa tektonik berkekuatan magnitudo 5,5 dengan kedalaman 10 km. Episenter gempa terletak di darat pada koordinat 1,59° LS dan 120,21° BT. Berdasarkan peta isoseismal, intensitas getaran tertinggi tercatat di wilayah Kulawi dan Dolo Selatan, yang terletak dekat dengan Sesar Palu-Koro, salah satu sesar aktif utama di Sulawesi. Getaran dirasakan cukup kuat di permukiman padat yang berada di lereng dan bantaran sungai, menyebabkan beberapa kerusakan ringan pada bangunan tidak tahan gempa. Aktivitas manusia yang membangun tanpa mempertimbangkan aspek geologi semakin meningkatkan risiko kerusakan saat terjadi gempa bumi.
---
Merujuk pada narasi dan data Gempa Sigi, tentukan Fakta atau Opini dari pernyataan berikut!$q$,
      $q$["Pusat gempa Sigi 2023 berada di darat dengan kedalaman 10 km.","Guncangan gempa lebih terasa di wilayah dengan batuan sedimen dan lembek.","Gempa bumi hanya berdampak jika terjadi dengan magnitudo di atas 6,0."]$q$,
      $q$["Fakta","Opini"]$q$,
      $q$[0,0,1]$q$),
    (21, 'category', $q$Perhatikan gambar pertemuan lempeng tektonik di Indonesia berikut. (Sumber: Eric Gaba, Wikimedia Commons, CC BY 2.5)
---
Berdasarkan gambar di atas, manakah pernyataan yang benar dan salah berdasarkan analisis subduksi lempeng yang terjadi di Indonesia?$q$,
      $q$["Gempa tektonik di wilayah Aceh, Sumatera Barat, dan selatan Jawa terjadi akibat tumbukan Lempeng Indo-Australia dan Eurasia.","Zona subduksi di selatan Pulau Jawa dan Nusa Tenggara menunjukkan potensi tsunami tinggi.","Wilayah Kalimantan relatif tidak aman dari aktivitas tektonik karena dekat dari batas lempeng aktif."]$q$,
      $q$["Benar","Salah"]$q$,
      $q$[0,0,1]$q$),
    (22, 'single', $q$Perhatikan tampilan aplikasi Windy berikut.

Windy.com adalah sebuah aplikasi berbasis peta yang sangat populer, dirancang untuk memvisualisasikan data cuaca dan angin secara global. Pengguna dapat melihat pola angin, suhu, curah hujan, tekanan atmosfer, gelombang laut, dan berbagai parameter meteorologi lainnya dalam bentuk animasi yang menarik. Data untuk Windy dikumpulkan dari berbagai model prakiraan cuaca global (seperti GFS dan ECMWF) dan observasi satelit cuaca. Dengan Windy, pengguna dapat memprediksi kondisi cuaca di lokasi tertentu, merencanakan aktivitas yang bergantung pada cuaca (misalnya pelayaran, penerbangan, atau pendakian), serta memahami fenomena atmosfer secara visual dan intuitif.
---
Aplikasi tersebut dapat berperan untuk …$q$,
      $q$["Mengelola basis data historis tentang peristiwa bencana alam dan dampaknya.","Menyediakan informasi spasial dan temporal tentang kondisi atmosfer secara visual.","Mengembangkan instrumen pengukuran cuaca baru yang lebih akurat dan canggih.","Menganalisis perilaku sosial manusia dalam menghadapi perubahan iklim global.","Memfasilitasi komunikasi langsung antara ahli meteorologi dan masyarakat umum."]$q$,
      null,
      $q$"b"$q$),
    (23, 'single', $q$Perhatikan dengan saksama citra satelit wilayah pesisir Semarang dan sekitarnya berikut. Citra ini diambil oleh satelit Copernicus Sentinel-2B dan menampilkan interaksi kompleks antara daratan dan lautan, menunjukkan area perkotaan, lahan pertanian, serta berbagai bentuk pemanfaatan wilayah pesisir. Amati perbedaan warna dan pola yang mengindikasikan jenis tutupan lahan, kondisi perairan, dan aktivitas manusia di sepanjang garis pantai.
---
Untuk tujuan perencanaan tata ruang dan pengelolaan lingkungan wilayah pesisir Semarang, informasi spasial esensial apa yang dapat diekstraksi dan divisualisasikan menjadi peta tematik yang paling tepat dari pengolahan citra satelit tersebut?$q$,
      $q$["Peta kepadatan penduduk serta persebaran fasilitas umum perkotaan.","Peta jalur migrasi hewan laut dan identifikasi vegetasi alami ekosistem pesisir.","Peta tutupan lahan, indeks kekeruhan perairan, serta perubahan garis pantai.","Peta persebaran jenis batuan dan potensi kandungan mineral di bawah permukaan laut.","Peta jaringan transportasi darat dan laut serta analisis aksesibilitas pusat-pusat ekonomi."]$q$,
      null,
      $q$"c"$q$),
    (24, 'category', $q$Perhatikan citra satelit tingkat polusi udara di wilayah Jakarta dan sekitarnya pada periode April 2018 hingga April 2021 berikut. Warna pada peta menunjukkan konsentrasi nitrogen dioksida (NO₂): merah berarti konsentrasi NO₂ tinggi, kuning sedang, dan hijau rendah. Peta ini dapat digunakan untuk menganalisis dampak pencemaran udara terhadap lingkungan dan kesehatan masyarakat, serta mengidentifikasi sumber-sumber polusi berdasarkan ciri visual pada citra satelit. (Sumber gambar: Greenpeace Indonesia)
---
Berdasarkan pola distribusi konsentrasi NO₂ dalam citra satelit, tentukan benar atau salah pernyataan dampak lingkungan dan sosial yang dapat terjadi di wilayah dengan konsentrasi tinggi!$q$,
      $q$["Penurunan kualitas vegetasi akibat paparan polusi udara jangka panjang","Terjadinya hujan asam yang berdampak pada kualitas tanah dan air","Polusi udara menurunkan curah hujan dan mengakibatkan kekeringan total"]$q$,
      $q$["Benar","Salah"]$q$,
      $q$[0,0,1]$q$),
    (25, 'multiple', $q$Gambar berikut menunjukkan citra satelit yang menampilkan kondisi pencemaran air sungai di Pekalongan, Jawa Tengah. Warna gelap pada aliran sungai menunjukkan tingkat pencemaran yang tinggi akibat limbah industri dan domestik. (Sumber gambar: Google Earth)
---
Berdasarkan citra satelit, pernyataan manakah yang benar mengenai interpretasi visual dari citra tersebut?$q$,
      $q$["Warna gelap pada aliran sungai menunjukkan tingkat pencemaran yang tinggi.","Pola aliran sungai yang berkelok-kelok menunjukkan wilayah cenderung landai.","Tekstur kasar pada citra menunjukkan area dengan vegetasi lebat.","Bentuk persegi dengan rona gelap menunjukkan area persawahan.","Bayangan pada citra satelit tidak memberikan informasi penting dalam interpretasi pencemaran air."]$q$,
      null,
      $q$["a","b"]$q$),
    (26, 'category', $q$Perhatikan infografik pembangunan PLTS terapung berikut. (Sumber gambar: antaranews.com)

Gambar menunjukkan informasi geospasial tentang potensi pemanfaatan pembangkit listrik tenaga surya (PLTS) terapung di berbagai wilayah perairan Indonesia, baik di danau, waduk, hingga area pengelolaan air buangan. Menurut data BRIN (2023), wilayah Maluku dan Papua memiliki potensi terbesar dengan pemanfaatan mencapai 99,7%, sementara PLTS terapung aktif saat ini baru terdapat di Waduk Cirata, Jawa Barat, seluas 200 ha dengan kapasitas 192 MWp dan investasi Rp1,7 triliun.
---
Manakah dampak dari pembangunan PLTS terapung berikut yang benar?$q$,
      $q$["PLTS terapung mengoptimalkan ruang perairan buatan tanpa mengurangi lahan pertanian atau permukiman.","PLTS terapung secara langsung mengendalikan banjir dan berfungsi sebagai tanggul air.","PLTS terapung berkontribusi pada pengurangan emisi karbon dan mendukung transisi energi bersih."]$q$,
      $q$["Benar","Salah"]$q$,
      $q$[0,1,0]$q$),
    (27, 'multiple', $q$Perhatikan peta jaringan jalan nasional di Pulau Kalimantan berikut. (Sumber: Satker PJN Provinsi Kalimantan Barat, 2018)
---
Pilih pernyataan yang paling tepat menunjukkan kelayakan pembangunan jalan nasional berdasarkan pertimbangan spasial dan keberlanjutan!$q$,
      $q$["Pembangunan jalan nasional baru di wilayah pedalaman Kalimantan Tengah yang saat ini minim akses layak dilakukan karena dapat membuka isolasi daerah dan mendukung pemerataan wilayah, meskipun menghadapi tantangan morfologis dan pembiayaan.","Pengembangan jaringan jalan di sekitar wilayah konsentrasi penduduk dan pusat-pusat kegiatan ekonomi seperti Balikpapan dan Samarinda memiliki kelayakan tinggi karena dapat langsung meningkatkan efisiensi logistik dan mendukung pertumbuhan ekonomi.","Pembangunan jalan nasional di pesisir utara Kalimantan Timur menuju perbatasan Serawak belum dapat dinilai sepenuhnya layak karena masih memerlukan kajian potensi wilayah dan fungsi strategis lintas batas.","Perpanjangan jalan nasional menuju daerah terpencil di Kalimantan Utara menunjukkan tantangan kelayakan, terutama dari aspek biaya pembangunan dan aksesibilitas, namun tetap memerlukan studi potensi sumber daya wilayah.","Peningkatan kapasitas jalan nasional yang sudah menghubungkan pelabuhan utama di Kalimantan dianggap lebih layak daripada membuka jalur baru, karena memaksimalkan infrastruktur yang telah ada dan menurunkan biaya distribusi."]$q$,
      null,
      $q$["b","e"]$q$),
    (28, 'category', $q$Perhatikan peta kawasan hutan dan kontur KPH Ropang, Kabupaten Sumbawa, Nusa Tenggara Barat, berikut. Kawasan hutan tersebut diklasifikasikan menjadi hutan lindung, hutan produksi, dan hutan produksi terbatas. Informasi ini penting untuk perencanaan infrastruktur, konservasi lingkungan, dan pengelolaan sumber daya alam di wilayah tersebut. (Sumber gambar: kphropang.wordpress.com)
---
Berdasarkan distribusi kawasan hutan dan kontur wilayah pada peta, tentukan benar atau salah infrastruktur pendukung yang paling tepat direncanakan untuk menunjang keberlanjutan wilayah tersebut!$q$,
      $q$["Pembangunan jalan konservasi yang mengikuti kontur untuk meminimalkan erosi tanah","Pembukaan jalur tambang terbuka di dalam kawasan hutan lindung","Pembangunan menara pemantau kebakaran hutan di wilayah hutan produksi terbatas"]$q$,
      $q$["Benar","Salah"]$q$,
      $q$[0,1,0]$q$),
    (29, 'category', $q$Perhatikan citra dan garis kontur (elevasi) kawasan hutan Kota Bogor berikut. (Skala 1 : 5.500; sumber: Google Earth dan DEMNAS)
---
Manakah pernyataan berikut yang menunjukkan interpretasi citra yang sesuai dengan karakteristik wilayah pada citra dan elevasi tersebut?$q$,
      $q$["Lokasi A menunjukkan kawasan hutan kota","Lokasi C menunjukkan kawasan hutan","Lokasi B menunjukkan kawasan permukiman"]$q$,
      $q$["Sesuai","Tidak Sesuai"]$q$,
      $q$[0,1,0]$q$),
    (30, 'single', $q$Perhatikan citra satelit kawasan Taman Nasional Tesso Nilo pada Oktober 2020 (kiri) dan Oktober 2024 (kanan) berikut. (Sumber: Mongabay, 2024)

Citra tersebut memperlihatkan adanya deforestasi yang signifikan. Data menunjukkan bahwa antara tahun 2009 hingga 2023, Taman Nasional Tesso Nilo telah kehilangan sekitar 78% tutupan hutan primer akibat aktivitas pembukaan lahan. Pada tahun 2024, deforestasi masih terus berlangsung di sisa hutan yang ada, dengan penyebab utama ekspansi perkebunan kelapa sawit. Selain itu, pembangunan jalan di kawasan ini juga meningkatkan aktivitas perburuan liar terhadap satwa di wilayah tersebut.
---
Bagaimana dampak fenomena tersebut terhadap lingkungannya?$q$,
      $q$["Hilangnya tutupan hutan primer di kawasan taman nasional akibat deforestasi membuat hutan ini tidak memiliki umur yang panjang.","Deforestasi hutan primer berakibat penurunan suhu lokal di kawasan karena perkebunan kelapa sawit lebih efektif menaungi tanah.","Proses penyerapan karbon dioksida pada hutan primer di kawasan Taman Nasional Tesso Nilo kini tidak terjadi lagi secara signifikan.","Deforestasi di hutan primer menyebabkan percepatan peningkatan emisi karbon, sehingga berkontribusi pada pemanasan global.","Kawasan hutan primer Taman Nasional Tesso Nilo yang dialihfungsikan tidak dapat dipulihkan dalam jangka waktu yang cepat."]$q$,
      null,
      $q$"d"$q$)
) as v(n, kind, text, options, categories, answer)
where q.order_index = v.n
  and q.exam_id = (
    select e.id from public.exams e
    where e.title = $q$TKA Geografi 2025$q$
    order by e.created_at
    limit 1
  );
