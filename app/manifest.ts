import type { MetadataRoute } from "next";
import { absoluteUrl } from "./seo";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Talo",
    short_name: "Talo",
    description: "Digitale Vereinsverwaltung für Engagement, Punkte und Genehmigungen.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#080808",
    icons: [
      {
        src: absoluteUrl("/talo-logo.png"),
        sizes: "1024x1024",
        type: "image/png",
      },
      {
        src: absoluteUrl("/favicon.ico"),
        sizes: "16x16 32x32 48x48 64x64 128x128 256x256",
        type: "image/x-icon",
      },
    ],
  };
}
