// next.config.js (Updated)
/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: {
        remotePatterns: [
            {
                protocol: 'https', // Assuming it's HTTPS
                hostname: 'csb10032001efbf644d.blob.core.windows.net',
                port: '', // Default port (443 for https )
                pathname: '/**', // Allows any path on this hostname
            },
        ],
    },
    async rewrites() {
        return [
        {
            source: '/api/:path*',
            // Note: The destination in rewrites might need adjustment depending on your exact needs,
            // but the original destination URL format looks potentially incorrect.
            // It might need to be a full URL like:
            // destination: 'https://csb10032001efbf644d.blob.core.windows.net/acesknust/images/:path*',
            // Please double-check how you intend to use this rewrite.
            destination: 'https://csb10032001efbf644d.blob.core.windows.net/acesknust/images/path*',        
        },
        ]
    },
}

module.exports = nextConfig
