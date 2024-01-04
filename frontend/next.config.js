/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: {
        domains: ['csb10032001efbf644d.blob.core.windows.net'],
    },
    async rewrites() {
        return [
        {
            source: '/api/:path*',
            destination: 'https://csb10032001efbf644d.blob.core.windows.net/acesknust/images/path*',        
        },
        ]
    },
}

module.exports = nextConfig
