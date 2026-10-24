/**
 * Cover photographs for the known subjects, bundled under public/covers.
 * All come from Wikimedia Commons under free licenses; the credits below are
 * shown on the catalog page as those licenses require.
 */

export type CoverPhoto = {
  src: string;
  /** CSS object-position keeping the subject in frame when cropped. */
  position: string;
  title: string;
  author: string;
  license: string;
  licenseUrl: string | null;
  page: string;
};

const COMMONS = "https://commons.wikimedia.org/wiki/File:";
const BY_2 = "https://creativecommons.org/licenses/by/2.0";
const BY_4 = "https://creativecommons.org/licenses/by/4.0";
const BY_SA_3 = "https://creativecommons.org/licenses/by-sa/3.0";
const BY_SA_4 = "https://creativecommons.org/licenses/by-sa/4.0";

export const COVER_PHOTOS = {
  "tka-geografi": {
    src: "/covers/tka-geografi.webp",
    position: "50% 55%",
    title: "Landscape of Raja Ampat; April 2014",
    author: "Max Mossler",
    license: "CC BY 2.0",
    licenseUrl: BY_2,
    page: `${COMMONS}Landscape_of_Raja_Ampat;_April_2014.jpg`,
  },
  geografi: {
    src: "/covers/geografi.webp",
    position: "55% 60%",
    title: "Bromo and Semeru volcanoes, Java, Indonesia",
    author: "Jakub Hałun",
    license: "CC BY-SA 4.0",
    licenseUrl: BY_SA_4,
    page: `${COMMONS}Bromo_and_Semeru_volcanoes,_Java,_Indonesia,_20220820_0717_9517.jpg`,
  },
  "matematika-dasar": {
    src: "/covers/matematika-dasar.webp",
    position: "50% 50%",
    title: "Lübeck, Wissenschaftspfad, Abakus",
    author: "Dietmar Rabich",
    license: "CC BY-SA 4.0",
    licenseUrl: BY_SA_4,
    page: `${COMMONS}L%C3%BCbeck,_Wissenschaftspfad,_Abakus_--_2017_--_0372.jpg`,
  },
  matematika: {
    src: "/covers/matematika.webp",
    position: "30% 40%",
    title: "Pure mathematics formulæ on a blackboard",
    author: "Wallpoper",
    license: "Domain publik",
    licenseUrl: null,
    page: `${COMMONS}Pure-mathematics-formul%C3%A6-blackboard.jpg`,
  },
  fisika: {
    src: "/covers/fisika.webp",
    position: "50% 55%",
    title: "Newton's Cradle",
    author: "Sheila Sund",
    license: "CC BY 2.0",
    licenseUrl: BY_2,
    page: `${COMMONS}Newton%27s_Cradle_(15221366308).jpg`,
  },
  kimia: {
    src: "/covers/kimia.webp",
    position: "50% 50%",
    title: "Equipment and glassware",
    author: "Belikov Maxim",
    license: "CC BY 4.0",
    licenseUrl: BY_4,
    page: `${COMMONS}Equipment_and_glassware.jpg`,
  },
  biologi: {
    src: "/covers/biologi.webp",
    position: "50% 60%",
    title: "Rafflesia arnoldii, Bengkulu",
    author: "SofianRafflesia",
    license: "CC BY-SA 4.0",
    licenseUrl: BY_SA_4,
    page: `${COMMONS}Rafflesia_arnoldii_Bengkulu_03.jpg`,
  },
  "bahasa-indonesia": {
    src: "/covers/bahasa-indonesia.webp",
    position: "50% 50%",
    title: "Bookshelf, Prunksaal, Vienna",
    author: "Matl",
    license: "CC BY-SA 3.0",
    licenseUrl: BY_SA_3,
    page: `${COMMONS}Bookshelf_Prunksaal_OeNB_Vienna_AT_matl00786ch.jpg`,
  },
  "bahasa-inggris": {
    src: "/covers/bahasa-inggris.webp",
    position: "50% 45%",
    title: "Tower Bridge at Dawn",
    author: "Fuzzypiggy",
    license: "CC BY-SA 3.0",
    licenseUrl: BY_SA_3,
    page: `${COMMONS}Tower_Bridge_at_Dawn.jpg`,
  },
  sejarah: {
    src: "/covers/sejarah.webp",
    position: "45% 55%",
    title: "Stupas of Borobudur",
    author: "CEphoto, Uwe Aranas",
    license: "CC BY-SA 3.0",
    licenseUrl: BY_SA_3,
    page: `${COMMONS}Borobudur-Temple-Park_Indonesia_Stupas-of-Borobudur-01.jpg`,
  },
  ekonomi: {
    src: "/covers/ekonomi.webp",
    position: "50% 50%",
    title: "Traditional floating fruits market",
    author: "Azimronnie",
    license: "CC BY-SA 4.0",
    licenseUrl: BY_SA_4,
    page: `${COMMONS}Traditional_floating_fruits_market_01.jpg`,
  },
  sosiologi: {
    src: "/covers/sosiologi.webp",
    position: "50% 60%",
    title: "Rickshaws waiting at a level crossing, Yogyakarta",
    author: "CEphoto, Uwe Aranas",
    license: "CC BY-SA 3.0",
    licenseUrl: BY_SA_3,
    page: `${COMMONS}Yogyakarta_Indonesia_Rickshaws-waiting-at-level-crossing-for_customers-01.jpg`,
  },
  pancasila: {
    src: "/covers/pancasila.webp",
    position: "45% 50%",
    title: "Gedung Pancasila",
    author: "Rochelimit",
    license: "CC BY-SA 3.0",
    licenseUrl: BY_SA_3,
    page: `${COMMONS}Gedpancasila.jpg`,
  },
  informatika: {
    src: "/covers/informatika.webp",
    position: "50% 50%",
    title: "Green circuit board II",
    author: "Peter Shanks",
    license: "CC BY 2.0",
    licenseUrl: BY_2,
    page: `${COMMONS}Green_circuit_board_II_(2389301870).jpg`,
  },
} satisfies Record<string, CoverPhoto>;

export type CoverPhotoKey = keyof typeof COVER_PHOTOS;

export const COVER_PHOTO_LIST: CoverPhoto[] = Object.values(COVER_PHOTOS);
