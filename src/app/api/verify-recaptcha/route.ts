import { NextResponse } from 'next/server';
import { checkRateLimit, getClientIp } from '@/lib/rate-limiter';
import { z } from 'zod';

const RECAPTCHA_SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY;

// Input validation schema
const VerifyRecaptchaSchema = z.object({
  token: z.string()
    .min(10, 'Invalid reCAPTCHA token')
    .max(5000, 'Token too long')
    .trim(),
}).strict();

if (!RECAPTCHA_SECRET_KEY) {
  console.warn('⚠️  reCAPTCHA secret key not configured. Set RECAPTCHA_SECRET_KEY environment variable.');
}

export async function POST(request: Request) {
  try {
    // Rate limit verification requests (prevent abuse)
    const ip = await getClientIp();
    if (!checkRateLimit(ip, 30, 60 * 1000)) { // 30 requests per minute per IP
      const response = NextResponse.json(
        { success: false, error: 'Too many verification requests' },
        { status: 429 }
      );
      response.headers.set('Retry-After', '60');
      return response;
    }

    // Parse and validate request body
    let body: unknown;
    try {
      body = await request.json();
    } catch (e) {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    // Validate input against schema
    const validationResult = VerifyRecaptchaSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid request data' },
        { status: 400 }
      );
    }

    const { token } = validationResult.data;

    if (!RECAPTCHA_SECRET_KEY) {
      console.error('reCAPTCHA secret key not configured');
      return NextResponse.json(
        { success: false, error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Verify token with Google
    const verificationUrl = 'https://www.google.com/recaptcha/api/siteverify';
    const response = await fetch(verificationUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `secret=${encodeURIComponent(RECAPTCHA_SECRET_KEY)}&response=${encodeURIComponent(token)}`,
    });

    if (!response.ok) {
      console.error('reCAPTCHA API error:', response.status);
      return NextResponse.json(
        { success: false, error: 'Verification service temporarily unavailable' },
        { status: 503 }
      );
    }

    const data = await response.json() as {
      success: boolean;
      score?: number;
      action?: string;
      challenge_ts?: string;
      hostname?: string;
      error_codes?: string[];
    };

    if (!data.success) {
      console.warn('reCAPTCHA verification failed:', data.error_codes);
      return NextResponse.json(
        { success: false, error: 'reCAPTCHA verification failed' },
        { status: 403 }
      );
    }

    // For reCAPTCHA v3, check score (0.0 = bot, 1.0 = human)
    // Adjust threshold based on your needs
    const SCORE_THRESHOLD = 0.5;
    if (data.score && data.score < SCORE_THRESHOLD) {
      console.warn('reCAPTCHA score too low:', data.score);
      return NextResponse.json(
        { success: false, error: 'Verification failed (suspected bot)' },
        { status: 403 }
      );
    }

    return NextResponse.json({ success: true, score: data.score });
  } catch (error) {
    console.error('reCAPTCHA verification error:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
