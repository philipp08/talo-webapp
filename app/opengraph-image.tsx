import { ImageResponse } from "next/og";

export const alt = "Talo - digitale Vereinsverwaltung";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#080808",
          color: "#ffffff",
          padding: "72px",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              width: 58,
              height: 58,
              borderRadius: 18,
              background: "#ffffff",
              color: "#080808",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 30,
              fontWeight: 900,
            }}
          >
            T
          </div>
          <div style={{ fontSize: 28, letterSpacing: 8, fontWeight: 800 }}>TALO</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          <div style={{ fontSize: 78, lineHeight: 0.95, letterSpacing: -4, fontWeight: 800, maxWidth: 930 }}>
            Vereinsengagement sichtbar machen.
          </div>
          <div style={{ fontSize: 29, lineHeight: 1.35, color: "#b6b6b6", maxWidth: 820 }}>
            Punkte, Genehmigungen und Mitgliederverwaltung in einer klaren Plattform.
          </div>
        </div>
        <div style={{ display: "flex", gap: 14, color: "#b6b6b6", fontSize: 22 }}>
          <span>Vorgestellt von Philipp Pauli</span>
          <span>/</span>
          <span>talo-club.de</span>
        </div>
      </div>
    ),
    size,
  );
}
