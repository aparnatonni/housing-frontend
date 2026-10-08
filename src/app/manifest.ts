import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "NestMate — Housing & Roommate Platform",
    short_name: "NestMate",
    description:
      "Find rooms, roommates and whole homes in one place. Search verified listings, book viewings and pay rent securely.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#0d9488",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
