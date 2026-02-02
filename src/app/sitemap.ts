import type { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://tool-daddy.com';

// Tool pages that should be in sitemap
const TOOLS = [
  'image-compressor',
  'image-converter',
  'video-to-audio-converter',
  'video-compressor',
  'qr-code-generator',
  'todo-list',
  'metadata-extractor',
  'ai-text-humanizer',
  'ai-playlist-maker',
  'ai-image-enhancer',
  'drawing-canvas',
  'timer-stopwatch',
  'color-palette-extractor',
  'color-palette-generator',
  'simple-notepad',
  'youtube-downloader',
  'youtube-to-audio',
  'password-generator',
];

export default function sitemap(): MetadataRoute.Sitemap {
  // Home page
  const routes: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
  ];

  // Add all tool pages
  TOOLS.forEach((tool) => {
    routes.push({
      url: `${BASE_URL}/${tool}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    });
  });

  return routes;
}
