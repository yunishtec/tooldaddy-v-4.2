import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Security Headers Middleware
 * Applies important security headers to all responses
 * 
 * Headers implemented:
 * - Content-Security-Policy: Prevent XSS by restricting resource loading
 * - X-Content-Type-Options: Prevent MIME type sniffing
 * - X-Frame-Options: Prevent clickjacking
 * - X-XSS-Protection: Legacy XSS protection (for older browsers)
 * - Referrer-Policy: Control referrer information
 * - Permissions-Policy: Control browser features
 * - Strict-Transport-Security: Force HTTPS
 */

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Content-Security-Policy: Prevent inline scripts and restrict resource sources
  response.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'", // Only allow resources from same origin by default
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://www.google.com/recaptcha/ https://www.gstatic.com/recaptcha/ https://www.googletagmanager.com https://analytics.google.com", // Allow inline (needed for React/Next.js) + reCAPTCHA + Google Analytics
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com", // Allow inline styles (Tailwind) + Google Fonts
      "img-src 'self' data: https:", // Allow images from self, data URIs, and HTTPS
      "font-src 'self' https://fonts.gstatic.com", // Google Fonts
      "connect-src 'self' https://www.google.com/recaptcha/ https://www.gstatic.com/ https://firebaseapp.com https://*.googleapis.com https://www.googletagmanager.com https://analytics.google.com", // API calls + Firebase + Google Analytics
      "frame-src 'self' https://www.google.com/recaptcha/", // Allow iframes from same origin + reCAPTCHA
      "object-src 'none'", // No plugins
      "base-uri 'self'", // Restrict base URL
      "form-action 'self'", // Only allow form submissions to same origin
      "upgrade-insecure-requests", // Upgrade HTTP to HTTPS
    ].join('; ')
  );

  // Prevent browsers from MIME-sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff');

  // Prevent clickjacking
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');

  // Legacy XSS protection (most modern browsers ignore this, but good for older browsers)
  response.headers.set('X-XSS-Protection', '1; mode=block');

  // Control how much referrer info is shared
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Control browser features (Camera, Microphone, Geolocation, etc)
  response.headers.set(
    'Permissions-Policy',
    [
      'camera=()',
      'microphone=()',
      'geolocation=()',
      'payment=()',
      'usb=()',
      'magnetometer=()',
      'gyroscope=()',
      'accelerometer=()',
    ].join(', ')
  );

  // Force HTTPS in production (only set in production to avoid issues with http://localhost)
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload' // 1 year
    );
  }

  // Additional security headers
  response.headers.set('X-Permitted-Cross-Domain-Policies', 'none'); // Prevent Flash/Silverlight
  response.headers.set('Cross-Origin-Embedder-Policy', 'require-corp'); // Isolate page from cross-origin resources
  response.headers.set('Cross-Origin-Opener-Policy', 'same-origin'); // Isolate from popup opener
  response.headers.set('Cross-Origin-Resource-Policy', 'same-origin'); // Restrict cross-origin resource access

  return response;
}

// Apply middleware to all routes except static files and API routes that need special handling
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
