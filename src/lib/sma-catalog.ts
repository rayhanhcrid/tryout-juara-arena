/**
 * Demo catalogs: one short try out per SMA subject. Inserted from the admin
 * panel ("Isi katalog contoh SMA"); titles already present are skipped.
 */
export type SeedQuestion = {
  text: string;
  options: [string, string, string, string];
  key: "a" | "b" | "c" | "d";
};

export type SeedCatalog = {
  title: string;
  description: string;
  duration_minutes: number;
  questions: SeedQuestion[];
};

export const SMA_CATALOGS: SeedCatalog[] = [
  {
    title: "Matematika",
    description:
      "Logaritma, persamaan kuadrat, fungsi, trigonometri, dan turunan. Soal contoh tingkat SMA.",
    duration_minutes: 20,
    questions: [
      { text: "Nilai dari ²log 8 + ²log 4 adalah …", options: ["3", "4", "5", "6"], key: "c" },
      {
        text: "Akar-akar persamaan x² − 5x + 6 = 0 adalah …",
        options: ["1 dan 6", "2 dan 3", "−2 dan −3", "−1 dan 6"],
        key: "b",
      },
      {
        text: "Jika f(x) = 2x + 3, maka nilai f(4) adalah …",
        options: ["8", "10", "11", "14"],
        key: "c",
      },
      { text: "Nilai sin 30° adalah …", options: ["½", "½√2", "½√3", "1"], key: "a" },
      {
        text: "Turunan pertama dari f(x) = 3x² adalah …",
        options: ["3x", "6x", "6x²", "x³"],
        key: "b",
      },
    ],
  },
  {
    title: "Fisika",
    description: "Kinematika, hukum Newton, energi, dan listrik dinamis. Soal contoh tingkat SMA.",
    duration_minutes: 20,
    questions: [
      {
        text: "Satuan gaya dalam Sistem Internasional (SI) adalah …",
        options: ["Joule", "Watt", "Newton", "Pascal"],
        key: "c",
      },
      {
        text: "Sebuah mobil menempuh 120 km dalam 2 jam. Kecepatan rata-ratanya adalah …",
        options: ["40 km/jam", "60 km/jam", "80 km/jam", "240 km/jam"],
        key: "b",
      },
      {
        text: "Benda bermassa 5 kg diberi gaya 20 N. Percepatan benda tersebut adalah …",
        options: ["2 m/s²", "4 m/s²", "15 m/s²", "100 m/s²"],
        key: "b",
      },
      {
        text: "Energi kinetik benda bermassa 2 kg yang bergerak dengan kecepatan 3 m/s adalah …",
        options: ["3 J", "6 J", "9 J", "18 J"],
        key: "c",
      },
      {
        text: "Hambatan 6 Ω dialiri arus 2 A. Beda potensial pada hambatan itu adalah …",
        options: ["3 V", "8 V", "12 V", "24 V"],
        key: "c",
      },
    ],
  },
  {
    title: "Kimia",
    description:
      "Struktur atom, ikatan kimia, asam basa, dan stoikiometri. Soal contoh tingkat SMA.",
    duration_minutes: 15,
    questions: [
      {
        text: "Nomor atom suatu unsur menyatakan jumlah …",
        options: ["neutron", "proton", "nukleon", "kulit elektron"],
        key: "b",
      },
      { text: "Rumus kimia air adalah …", options: ["H₂O", "CO₂", "NaCl", "O₂"], key: "a" },
      {
        text: "Larutan dengan pH 3 bersifat …",
        options: ["basa kuat", "netral", "asam", "basa lemah"],
        key: "c",
      },
      {
        text: "Ikatan antara atom Na dan Cl pada senyawa NaCl adalah ikatan …",
        options: ["kovalen", "ion", "logam", "hidrogen"],
        key: "b",
      },
      {
        text: "Jumlah mol dari 36 gram air (Mr = 18) adalah …",
        options: ["0,5 mol", "1 mol", "2 mol", "18 mol"],
        key: "c",
      },
    ],
  },
  {
    title: "Biologi",
    description:
      "Sel, fotosintesis, sistem peredaran darah, dan pembelahan sel. Soal contoh tingkat SMA.",
    duration_minutes: 15,
    questions: [
      {
        text: "Organel sel yang berfungsi sebagai tempat respirasi sel adalah …",
        options: ["ribosom", "mitokondria", "badan Golgi", "lisosom"],
        key: "b",
      },
      {
        text: "Pada tumbuhan, fotosintesis berlangsung di …",
        options: ["kloroplas", "vakuola", "dinding sel", "nukleus"],
        key: "a",
      },
      {
        text: "Golongan darah yang disebut resipien universal adalah …",
        options: ["A", "B", "AB", "O"],
        key: "c",
      },
      {
        text: "Pembelahan sel yang menghasilkan sel kelamin (gamet) adalah …",
        options: ["mitosis", "meiosis", "amitosis", "fragmentasi"],
        key: "b",
      },
      {
        text: "Satuan struktural dan fungsional terkecil makhluk hidup adalah …",
        options: ["jaringan", "organ", "sel", "sistem organ"],
        key: "c",
      },
    ],
  },
  {
    title: "Bahasa Indonesia",
    description:
      "Kata baku, tanda baca, sinonim dan antonim, serta gagasan utama. Soal contoh tingkat SMA.",
    duration_minutes: 15,
    questions: [
      {
        text: "Penulisan kata baku yang benar adalah …",
        options: ["apotik", "apotek", "apothek", "apoteik"],
        key: "b",
      },
      {
        text: "Kalimat yang penggunaan tanda bacanya tepat adalah …",
        options: [
          "Ibu membeli: sayur, buah, dan ikan.",
          "Ibu membeli sayur, buah, dan ikan.",
          "Ibu membeli sayur buah, dan ikan.",
          "Ibu, membeli sayur, buah dan ikan.",
        ],
        key: "b",
      },
      {
        text: "Sinonim kata “cermat” adalah …",
        options: ["teliti", "cepat", "ceroboh", "ramah"],
        key: "a",
      },
      {
        text: "Antonim kata “optimis” adalah …",
        options: ["yakin", "pesimis", "realistis", "gembira"],
        key: "b",
      },
      {
        text: "Gagasan utama sebuah paragraf biasanya terdapat dalam …",
        options: ["kalimat penjelas", "kalimat utama", "kalimat tanya", "kalimat seru"],
        key: "b",
      },
    ],
  },
  {
    title: "Bahasa Inggris",
    description: "Tenses, kosakata, dan conditional sentences. Soal contoh tingkat SMA.",
    duration_minutes: 15,
    questions: [
      { text: "She ___ to school every day.", options: ["go", "goes", "going", "gone"], key: "b" },
      {
        text: "The past tense of “write” is …",
        options: ["writed", "wrote", "written", "writing"],
        key: "b",
      },
      {
        text: "I have lived in this town ___ 2015.",
        options: ["for", "since", "at", "on"],
        key: "b",
      },
      {
        text: "The opposite of “expensive” is …",
        options: ["cheap", "costly", "rich", "valuable"],
        key: "a",
      },
      {
        text: "If it rains tomorrow, we ___ at home.",
        options: ["stay", "will stay", "stayed", "would stayed"],
        key: "b",
      },
    ],
  },
  {
    title: "Sejarah Indonesia",
    description:
      "Kerajaan Hindu-Buddha, pergerakan nasional, dan proklamasi. Soal contoh tingkat SMA.",
    duration_minutes: 10,
    questions: [
      {
        text: "Proklamasi kemerdekaan Indonesia dibacakan pada tanggal …",
        options: ["17 Agustus 1945", "20 Mei 1908", "28 Oktober 1928", "10 November 1945"],
        key: "a",
      },
      {
        text: "Sumpah Pemuda diikrarkan pada tahun …",
        options: ["1908", "1928", "1945", "1966"],
        key: "b",
      },
      {
        text: "Kerajaan Hindu tertua di Indonesia adalah …",
        options: ["Majapahit", "Sriwijaya", "Kutai", "Mataram Kuno"],
        key: "c",
      },
      {
        text: "Budi Utomo didirikan pada tanggal …",
        options: ["20 Mei 1908", "16 Oktober 1905", "25 Desember 1912", "28 Oktober 1928"],
        key: "a",
      },
      {
        text: "Bersama Soekarno, tokoh yang memproklamasikan kemerdekaan Indonesia adalah …",
        options: ["Sutan Sjahrir", "Mohammad Hatta", "Ki Hajar Dewantara", "Tan Malaka"],
        key: "b",
      },
    ],
  },
  {
    title: "Geografi",
    description: "Peta, atmosfer, letak Indonesia, dan batuan. Soal contoh tingkat SMA.",
    duration_minutes: 10,
    questions: [
      {
        text: "Garis khayal yang membagi bumi menjadi belahan utara dan selatan adalah …",
        options: ["garis bujur", "khatulistiwa", "garis balik utara", "meridian utama"],
        key: "b",
      },
      {
        text: "Lapisan atmosfer tempat terjadinya peristiwa cuaca adalah …",
        options: ["stratosfer", "mesosfer", "troposfer", "termosfer"],
        key: "c",
      },
      {
        text: "Peta berskala 1 : 100.000 berarti 1 cm di peta sama dengan … di lapangan.",
        options: ["100 m", "1 km", "10 km", "100 km"],
        key: "b",
      },
      {
        text: "Secara geografis, Indonesia terletak di antara benua …",
        options: [
          "Asia dan Afrika",
          "Asia dan Australia",
          "Australia dan Amerika",
          "Eropa dan Asia",
        ],
        key: "b",
      },
      {
        text: "Batuan yang terbentuk dari pembekuan magma disebut batuan …",
        options: ["sedimen", "metamorf", "beku", "organik"],
        key: "c",
      },
    ],
  },
  {
    title: "Ekonomi",
    description: "Kebutuhan, permintaan, kegiatan ekonomi, dan inflasi. Soal contoh tingkat SMA.",
    duration_minutes: 10,
    questions: [
      {
        text: "Kebutuhan yang harus dipenuhi untuk mempertahankan hidup disebut kebutuhan …",
        options: ["tersier", "sekunder", "primer", "rohani"],
        key: "c",
      },
      {
        text: "Menurut hukum permintaan, jika harga naik maka jumlah barang yang diminta akan …",
        options: ["naik", "turun", "tetap", "tidak menentu"],
        key: "b",
      },
      {
        text: "Bank sentral di Indonesia adalah …",
        options: [
          "Bank Mandiri",
          "Bank Indonesia",
          "Bank Rakyat Indonesia",
          "Otoritas Jasa Keuangan",
        ],
        key: "b",
      },
      {
        text: "Kegiatan menghasilkan atau menambah nilai guna barang dan jasa disebut …",
        options: ["konsumsi", "produksi", "distribusi", "investasi"],
        key: "b",
      },
      {
        text: "Inflasi adalah …",
        options: [
          "penurunan harga barang secara umum",
          "kenaikan harga barang secara umum dan terus-menerus",
          "kenaikan nilai mata uang",
          "bertambahnya jumlah barang di pasar",
        ],
        key: "b",
      },
    ],
  },
  {
    title: "Sosiologi",
    description:
      "Sosialisasi, akulturasi, mobilitas, kelompok, dan norma sosial. Soal contoh tingkat SMA.",
    duration_minutes: 10,
    questions: [
      {
        text: "Proses belajar individu untuk menyesuaikan diri dengan nilai dan norma masyarakat disebut …",
        options: ["sosialisasi", "akulturasi", "asimilasi", "mobilitas"],
        key: "a",
      },
      {
        text: "Perpaduan dua kebudayaan tanpa menghilangkan unsur kebudayaan aslinya disebut …",
        options: ["asimilasi", "akulturasi", "amalgamasi", "akomodasi"],
        key: "b",
      },
      {
        text: "Perpindahan status seseorang dari lapisan sosial bawah ke lapisan atas disebut mobilitas …",
        options: ["horizontal", "vertikal naik", "vertikal turun", "geografis"],
        key: "b",
      },
      {
        text: "Kelompok yang anggotanya memiliki hubungan erat dan personal, seperti keluarga, disebut kelompok …",
        options: ["sekunder", "primer", "formal", "semu"],
        key: "b",
      },
      {
        text: "Norma yang bersumber dari Tuhan disebut norma …",
        options: ["kesusilaan", "kesopanan", "agama", "hukum"],
        key: "c",
      },
    ],
  },
  {
    title: "Pendidikan Pancasila",
    description:
      "Lambang Pancasila, UUD NRI 1945, Bhinneka Tunggal Ika, dan lembaga negara. Soal contoh tingkat SMA.",
    duration_minutes: 10,
    questions: [
      {
        text: "Sila keempat Pancasila dilambangkan dengan …",
        options: ["bintang", "rantai", "pohon beringin", "kepala banteng"],
        key: "d",
      },
      {
        text: "UUD NRI Tahun 1945 disahkan oleh PPKI pada tanggal …",
        options: ["17 Agustus 1945", "18 Agustus 1945", "1 Juni 1945", "22 Juni 1945"],
        key: "b",
      },
      {
        text: "Semboyan “Bhinneka Tunggal Ika” berarti …",
        options: [
          "bersatu kita teguh",
          "berbeda-beda tetapi tetap satu",
          "satu nusa satu bangsa",
          "merdeka atau mati",
        ],
        key: "b",
      },
      {
        text: "Lembaga negara yang berwenang menguji undang-undang terhadap UUD 1945 adalah …",
        options: [
          "Mahkamah Agung",
          "Mahkamah Konstitusi",
          "Komisi Yudisial",
          "Dewan Perwakilan Rakyat",
        ],
        key: "b",
      },
      {
        text: "Hari Lahir Pancasila diperingati setiap tanggal …",
        options: ["1 Juni", "17 Agustus", "1 Oktober", "28 Oktober"],
        key: "a",
      },
    ],
  },
  {
    title: "Informatika",
    description:
      "Bit dan byte, bilangan biner, sistem operasi, dan algoritma. Soal contoh tingkat SMA.",
    duration_minutes: 10,
    questions: [
      {
        text: "Satuan data terkecil dalam komputer adalah …",
        options: ["byte", "bit", "kilobyte", "nibble"],
        key: "b",
      },
      {
        text: "1 byte terdiri atas …",
        options: ["4 bit", "8 bit", "16 bit", "1024 bit"],
        key: "b",
      },
      {
        text: "Bilangan biner 1010 sama dengan bilangan desimal …",
        options: ["8", "10", "12", "5"],
        key: "b",
      },
      {
        text: "Perangkat lunak yang mengelola perangkat keras dan menjalankan aplikasi disebut …",
        options: ["sistem operasi", "browser", "compiler", "driver"],
        key: "a",
      },
      {
        text: "Struktur perulangan dalam algoritma digunakan untuk …",
        options: [
          "memilih salah satu dari dua kondisi",
          "menjalankan instruksi berulang kali",
          "menyimpan data secara permanen",
          "menghentikan program",
        ],
        key: "b",
      },
    ],
  },
];
