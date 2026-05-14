import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["remotion", "@remotion/player"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "i.ibb.co" },
      { protocol: "https", hostname: "firebasestorage.googleapis.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },
};

export default nextConfig;
