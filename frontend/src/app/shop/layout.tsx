import React from 'react';
import Header from "@/components/header";
import Footer from "@/components/footer";

interface ShopStatus {
    is_open: boolean;
    message: string;
}

async function getShopStatus(): Promise<ShopStatus> {
    const apiUrl =
        process.env.NEXT_PUBLIC_API_URL ||
        (process.env.NODE_ENV === 'development'
            ? 'http://127.0.0.1:8000'
            : 'https://aces-shop-backend-w8ro7.ondigitalocean.app');

    try {
        const res = await fetch(`${apiUrl}/api/shop/status/`, {
            cache: 'no-store', // Always fetch fresh — toggling in admin should be instant
        });
        if (!res.ok) {
            // If the status endpoint fails, default to OPEN so the shop still works
            return { is_open: true, message: '' };
        }
        return res.json();
    } catch {
        // Network error: default to OPEN so a backend hiccup doesn't break the site
        return { is_open: true, message: '' };
    }
}

export default async function ShopLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const shopStatus = await getShopStatus();

    return (
        <>
            <Header />
            <main>
                {shopStatus.is_open ? (
                    children
                ) : (
                    <ShopClosedBanner message={shopStatus.message} />
                )}
            </main>
            <Footer />
        </>
    );
}

// ---------------------------------------------------------------------------
// Shop Closed Banner — shown to all visitors when the kill switch is off
// ---------------------------------------------------------------------------
function ShopClosedBanner({ message }: { message: string }) {
    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50/50 to-white flex items-center justify-center pt-24 pb-16 px-4">
            <div className="text-center max-w-xl mx-auto">
                {/* Icon */}
                <div
                    className="mx-auto mb-8 flex items-center justify-center rounded-full bg-blue-100"
                    style={{ width: 96, height: 96 }}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={1.5}
                        className="text-blue-600"
                        style={{ width: 48, height: 48 }}
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M13.5 21v-7.5A.75.75 0 0 1 14.25 12h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016 2.993 2.993 0 0 0 2.25-1.016 3.001 3.001 0 0 0 3.75.614m-16.5 0a3.004 3.004 0 0 1-.621-4.72l1.189-1.19A1.5 1.5 0 0 1 5.378 3h13.243a1.5 1.5 0 0 1 1.06.44l1.19 1.189a3 3 0 0 1-.621 4.72M6.75 18h3.75a.75.75 0 0 0 .75-.75V13.5a.75.75 0 0 0-.75-.75H6.75a.75.75 0 0 0-.75.75v3.75c0 .414.336.75.75.75Z"
                        />
                    </svg>
                </div>

                {/* Heading */}
                <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl mb-4">
                    Shop{' '}
                    <span className="text-blue-600">Closed</span>
                </h1>

                {/* Dynamic message from admin */}
                <p className="text-lg text-gray-500 mb-8 leading-relaxed">
                    {message || 'The ACES Shop is currently closed. Please check back soon!'}
                </p>

                {/* Divider */}
                <div className="border-t border-gray-200 pt-8">
                    <p className="text-sm text-gray-400">
                        In the meantime, explore the rest of the ACES website.
                    </p>
                    <div className="mt-4 flex flex-col sm:flex-row gap-3 justify-center">
                        <a
                            href="/"
                            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700 transition-colors"
                        >
                            Go to Homepage
                        </a>
                        <a
                            href="/events"
                            className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
                        >
                            View Events
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
