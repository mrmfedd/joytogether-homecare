import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  async redirects() {
    return [
      { source: "/about-us", destination: "/about", permanent: true },
      { source: "/palmettofl", destination: "/palmetto-fl", permanent: true },
      { source: "/payment-informations", destination: "/payment-information", permanent: true },
      {
        source: "/courses-%26-trainings",
        destination: "/training",
        permanent: true,
      },
      {
        source: "/f/home-care-and-companion-care",
        destination: "/home-care-and-companion-care",
        permanent: true,
      },
      { source: "/resources", destination: "/training", permanent: false },
      { source: "/why-choose-us", destination: "/about", permanent: false },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img1.wsimg.com",
        pathname: "/**",
      },
    ],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
