/** @type {import('next').NextConfig} */

// In production the browser talks to /api on the OS's own domain and Vercel
// forwards it to the API project, so there's no CORS and no second domain.
// API_ORIGIN is the API deployment's URL, e.g. https://falah-api.vercel.app
const apiOrigin = process.env.API_ORIGIN?.replace(/\/$/, "");

const nextConfig = {
  poweredByHeader: false,
  async rewrites() {
    return [
      // Launch countdown pages (static files in public/launch)
      { source: "/launch", destination: "/launch/index.html" },
      { source: "/launch/ar", destination: "/launch/ar/index.html" },
      ...(apiOrigin ? [{ source: "/api/:path*", destination: `${apiOrigin}/api/:path*` }] : []),
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
