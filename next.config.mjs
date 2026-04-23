/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Catálogo OA!: `imagen_url` suele ser `https://res.cloudinary.com/.../image/upload/...`
    // (transformaciones en `getOptimizedImageUrl` / `buildImageUrl` en src/lib/imageUtils.js).
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com", pathname: "/**" },
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
      { protocol: "http", hostname: "**", pathname: "/**" },
      { protocol: "https", hostname: "**", pathname: "/**" },
    ],
  },
};

export default nextConfig;
