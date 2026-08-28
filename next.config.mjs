/** @type {import('next').NextConfig} */
const nextConfig = {
  // ...your existing config
  experimental: {
    serverActions: {
      bodySizeLimit: "5mb",
    },
  },
};

export default nextConfig;
