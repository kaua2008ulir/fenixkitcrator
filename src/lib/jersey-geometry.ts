import type { SponsorPosition } from "@/lib/jersey-types";

/**
 * Shared SVG geometry for the kit. All five source SVGs share the same
 * coordinate space (viewBox 0 0 21000 29700). Front pieces live on the LEFT
 * half, back pieces on the RIGHT half.
 */
export type KitView = "front" | "back" | "full";

export const VIEW_BOXES: Record<KitView, string> = {
  front: "200 2300 9400 10900",
  back: "10600 2300 9400 10900",
  full: "200 2300 19600 19200",
};

export const STROKE_W = 28;

/** Geometric bounding boxes (computed from the source paths). */
export const FRONT_BODY = { x: 1969, y: 2874, w: 6108, h: 9849, cx: 5023 };
export const BACK_BODY = { x: 12393, y: 2891, w: 6073, h: 9959, cx: 15430 };
export const FRONT_SHORT = { cx: 5355, cy: 14917 };
export const BACK_SHORT = { cx: 15461, cy: 14767 };
export const SLEEVE_CX = 8340;
export const BACK_SLEEVE_CX = 18700;

/** Placement boxes for image sponsors (cx, cy, w, h) + which view group renders it. */
export const SPONSOR_BOX: Record<
  SponsorPosition,
  { cx: number; cy: number; w: number; h: number; group: KitView }
> = {
  belly: { cx: FRONT_BODY.cx, cy: 9000, w: 3800, h: 1700, group: "front" },
  sleeve: { cx: SLEEVE_CX, cy: 5000, w: 1600, h: 1100, group: "front" },
  "back-top": { cx: BACK_BODY.cx, cy: 3700, w: 3400, h: 1500, group: "back" },
  "back-bottom": { cx: BACK_BODY.cx, cy: 10800, w: 2900, h: 1500, group: "back" },
  "shorts-back": { cx: BACK_SHORT.cx, cy: 15400, w: 1700, h: 1700, group: "full" },
};
