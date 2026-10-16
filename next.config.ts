import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Flappy BJ was renamed to Flappy Boji; keep old links working.
  async redirects() {
    return [{ source: "/games/flappy-bj", destination: "/games/flappy-boji", permanent: true }];
  },
};

export default nextConfig;
