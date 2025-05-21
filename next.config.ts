
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    // remotePatterns are for external images. 
    // Local images in /public are handled by default and don't need a pattern here.
    // If you decide to host your actual images on a CDN later, you'll add its hostname here.
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co', // Kept in case some placeholders remain or are used elsewhere
        port: '',
        pathname: '/**',
      },
      // Example for a CDN:
      // {
      //   protocol: 'https',
      //   hostname: 'your-cdn-hostname.com',
      //   port: '',
      //   pathname: '/images/**',
      // },
    ],
  },
};

export default nextConfig;
