/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // The service worker and manifest live in /public and are served as static
  // files, so no special config is needed for the PWA.
};

export default nextConfig;
