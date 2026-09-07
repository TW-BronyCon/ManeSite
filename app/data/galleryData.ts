import galleryJson from "../content/gallery.json";

export interface LocalizedText {
  zh: string;
  en: string;
}

export interface GalleryPhoto {
  id: string;
  url: string;
  title: LocalizedText;
  description: LocalizedText;
}

export const galleryPhotos = galleryJson as GalleryPhoto[];
