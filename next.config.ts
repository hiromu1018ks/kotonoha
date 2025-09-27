import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  headers: async () =>
    isProd
      ? [
          {
            source: "/(.*)",
            headers: [
              {
                key: "Content-Security-Policy",
                value: "script-src 'self'; object-src 'none'",
              },
            ],
          },
        ]
      : [],
};

export default nextConfig;
