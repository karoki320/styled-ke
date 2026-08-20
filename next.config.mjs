/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  // Baseline security headers. Deliberately NOT including a Content-Security-
  // Policy here — a CSP strict enough to matter but wrong for even one of
  // Paystack's checkout redirect, Google Fonts, or the WhatsApp float button
  // would break real functionality on a live site, and that needs to be
  // built and tested against every third-party resource in use, not shipped
  // as part of an audit pass. These headers, by contrast, are safe defaults
  // that don't change how the site behaves for any legitimate use.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
        ],
      },
    ];
  },
};

export default nextConfig;
