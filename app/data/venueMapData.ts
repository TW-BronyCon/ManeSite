export interface VenueBoothPosition {
  mapId: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Physical booth positions on the inline venue SVG, in map order. */
export const boothPositions: readonly VenueBoothPosition[] = [
  { mapId: "1", x: 107.56, y: 260.74, width: 18.68, height: 15.44 },
  { mapId: "2", x: 125.97, y: 285.52, width: 18.68, height: 15.44 },
  { mapId: "3", x: 152.03, y: 320.59, width: 18.68, height: 15.44 },
  { mapId: "4", x: 170.44, y: 345.37, width: 18.68, height: 15.44 },
  { mapId: "5", x: 196.5, y: 380.44, width: 18.68, height: 15.44 },
  { mapId: "6", x: 165.16, y: 233.38, width: 18.68, height: 15.44 },
  { mapId: "7", x: 183.57, y: 258.17, width: 18.68, height: 15.44 },
  { mapId: "8", x: 196.95, y: 209.75, width: 18.68, height: 15.44 },
  { mapId: "9", x: 215.37, y: 234.53, width: 18.68, height: 15.44 },
  { mapId: "10", x: 212.86, y: 264.25, width: 15.44, height: 18.68 },
];
