/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: ["192.168.56.1"],
  turbopack: {
    root: process.cwd()
  }
};

export default nextConfig;
