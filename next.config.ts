import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Type checking done locally/CI; skip on resource-constrained VM
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
