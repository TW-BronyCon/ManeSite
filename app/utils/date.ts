export function formatNewsDate(value: string, locale: string): string {
  if (!value) return "";
  try {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleDateString(locale, {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        timeZone: "Asia/Taipei",
      });
    }
  } catch (err) {
    console.error("Failed to format date:", err);
  }
  return value;
}
