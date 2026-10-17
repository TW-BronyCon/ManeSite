export function getTrackForVenueZone(zoneId: string): string | undefined {
  switch (zoneId) {
    case "stage":
      return "main";
    case "vendors":
      return "vendor";
    case "workshop":
      return "workshop";
    case "social":
      return "social";
    default:
      return undefined;
  }
}

export function getVenueZoneForTrack(track: string): string | undefined {
  switch (track) {
    case "main":
      return "stage";
    case "vendor":
      return "vendors";
    case "workshop":
      return "workshop";
    case "social":
      return "social";
    default:
      return undefined;
  }
}
