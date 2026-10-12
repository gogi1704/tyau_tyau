import L from "leaflet";
import type { WalkPoint } from "../lib/types";

export function dogDivIcon(point: WalkPoint) {
  const ring = point.isSelf ? "#ff6b3d" : point.dog.goal === "MATE" ? "#0ea5e9" : "#10b981";
  const inner = point.dog.photoUrl
    ? `<img src="${point.dog.photoUrl}" style="width:100%;height:100%;object-fit:cover;border-radius:50%" />`
    : `<div style="width:100%;height:100%;border-radius:50%;background:linear-gradient(135deg,#ffc7ab,#ff7f4d);display:flex;align-items:center;justify-content:center;font-size:18px;">🐾</div>`;

  return L.divIcon({
    className: "",
    html: `<div style="width:46px;height:46px;border-radius:50%;border:3px solid ${ring};box-shadow:0 6px 14px -4px rgba(0,0,0,0.35);overflow:hidden;background:#fff;">${inner}</div>`,
    iconSize: [46, 46],
    iconAnchor: [23, 23],
    popupAnchor: [0, -20],
  });
}
