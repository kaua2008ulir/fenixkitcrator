import { useRef } from "react";
import type { JerseyDesign } from "@/lib/jersey-types";
import { VIEW_BOXES, SPONSOR_BOX, type KitView } from "@/lib/jersey-geometry";

interface Props {
  design: Partial<JerseyDesign>;
  view: KitView;
  /** Called continuously while dragging a sponsor to update its offset. */
  onMove: (id: string, dx: number, dy: number) => void;
}

interface DragState {
  id: string;
  startX: number;
  startY: number;
  startDx: number;
  startDy: number;
}

/**
 * Transparent interactive SVG layered exactly on top of <JerseyCanvas/> (same
 * viewBox + preserveAspectRatio). Renders a draggable handle for each image
 * sponsor visible in the current view so the user can reposition it directly
 * on the kit. It is NOT part of the exported SVG (export reads the first svg).
 */
export function SponsorDragLayer({ design, view, onMove }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const drag = useRef<DragState | null>(null);

  const sponsors = (design.sponsors ?? []).filter(
    (s) => s.imageDataUrl && SPONSOR_BOX[s.position].group === view,
  );
  if (sponsors.length === 0) return null;

  const toSvg = (clientX: number, clientY: number) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const pt = svg.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;
    const ctm = svg.getScreenCTM();
    if (!ctm) return { x: 0, y: 0 };
    const p = pt.matrixTransform(ctm.inverse());
    return { x: p.x, y: p.y };
  };

  const onPointerDown = (e: React.PointerEvent, id: string, dx: number, dy: number) => {
    e.preventDefault();
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
    const { x, y } = toSvg(e.clientX, e.clientY);
    drag.current = { id, startX: x, startY: y, startDx: dx, startDy: dy };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current) return;
    const { x, y } = toSvg(e.clientX, e.clientY);
    const d = drag.current;
    onMove(d.id, Math.round(d.startDx + (x - d.startX)), Math.round(d.startDy + (y - d.startY)));
  };

  const endDrag = () => {
    drag.current = null;
  };

  return (
    <svg
      ref={svgRef}
      viewBox={VIEW_BOXES[view]}
      preserveAspectRatio="xMidYMid meet"
      className="absolute inset-0 w-full h-full"
      style={{ pointerEvents: "none" }}
    >
      {sponsors.map((s) => {
        const b = SPONSOR_BOX[s.position];
        const scale = s.scale ?? 1;
        const dx = s.dx ?? 0;
        const dy = s.dy ?? 0;
        const w = b.w * scale;
        const h = b.h * scale;
        const x = b.cx + dx - w / 2;
        const y = b.cy + dy - h / 2;
        return (
          <rect
            key={s.id}
            x={x}
            y={y}
            width={w}
            height={h}
            rx={40}
            fill="transparent"
            stroke="#D000FF"
            strokeWidth={40}
            strokeDasharray="120 90"
            style={{ pointerEvents: "all", cursor: "move" }}
            onPointerDown={(e) => onPointerDown(e, s.id, dx, dy)}
            onPointerMove={onPointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
          />
        );
      })}
    </svg>
  );
}
