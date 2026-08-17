import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",

  async rewrites() {
    const backend =
      process.env.BACKEND_INTERNAL_URL ||
      "http://backend:8000";

    return [
      {
        source: "/api/backend/:path*",
        destination: `${backend}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
