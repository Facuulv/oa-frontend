/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "files.oabebidas.com", pathname: "/**" },
      // Legacy: imágenes ya guardadas en Cloudinary antes de la migración
      { protocol: "https", hostname: "res.cloudinary.com", pathname: "/**" },
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
      { protocol: "http", hostname: "**", pathname: "/**" },
      { protocol: "https", hostname: "**", pathname: "/**" },
    ],
  },
};

export default nextConfig;
