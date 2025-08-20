import "./globals.css";
import { Toaster } from "sonner";
import Script from "next/script";

export const metadata = {
    title: `KarmaPurge | Advanced Web Security & Bot Protection`,
    icons: {
        icon: "/favicon.ico",
    },
    description: `KarmaPurge is a powerful, developer-friendly antibot security platform designed to detect, block, and filter malicious traffic including bots, proxies, VPNs, and suspicious IPs.`,
    keywords: [
        'antibot', 'security', 'ip filtering', 'bot protection', 'proxy detection',
        'vpn detection', 'web security', 'KarmaPurge', 'traffic filtering', 'threat mitigation'
    ],
    verification: {
        google: "rfQf_mmYNUbYylSGa9v7iD9h4zcXYXUhbcew-4i05Z4",
    },
    openGraph: {
        siteName: 'KarmaPurge',
        title: `KarmaPurge | Advanced Web Security & Bot Protection`,
        description: `KarmaPurge helps secure your web applications with intelligent bot detection, IP analysis, and advanced traffic filtering. Protect your platform from abuse and unauthorized access.`,
        url: 'https://karmapurge.vercel.app',
        type: 'website',
        images: [
            {
                url: 'https://karmapurge.vercel.app/rog.png',
                width: 320,
                height: 180,
                alt: 'KarmaPurge Security (XS)',
            },
            {
                url: 'https://karmapurge.vercel.app/rog.png',
                width: 640,
                height: 360,
                alt: 'KarmaPurge Security (SM)',
            },
            {
                url: 'https://karmapurge.vercel.app/rog.png',
                width: 800,
                height: 418,
                alt: 'KarmaPurge Security (MD)',
            },
            {
                url: 'https://karmapurge.vercel.app/rog.png',
                width: 1200,
                height: 630,
                alt: 'KarmaPurge Security (LG)',
            },
            {
                url: 'https://karmapurge.vercel.app/rog.png',
                width: 1600,
                height: 840,
                alt: 'KarmaPurge Security (XL)',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: `KarmaPurge | Advanced Web Security & Bot Protection`,
        description: `Fortify your website with KarmaPurge — the next-gen solution for detecting bots, filtering proxies/VPNs, and managing traffic security with precision.`,
        images: ['https://karmapurge.vercel.app/rog.png'],
    },
};

export default function RootLayout({ children }) {
    return (
        <html lang="en" data-scroll-behavior="smooth">
            <body className="antialiased" style={{ fontFamily: "var(--font-karmapurge)" }}>
                <Toaster richColors position="top-right" />
                {children}
                <Script
                    src="https://app.midtrans.com/snap/snap.js"
                    data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
                    strategy="afterInteractive"
                />
            </body>
        </html>
    );
}
