export interface LocalizedText {
  zh: string;
  en: string;
}

export interface MarkdownImage {
  src: string;
  alt: string;
}

export interface VenueZoneEvent {
  id?: string;
  title: string;
  start: string;
  end: string;
  detail: string;
  bg: string;
}
