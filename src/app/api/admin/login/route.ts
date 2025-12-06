import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Replace these with your actual admin credentials
// In production, these should be environment variables and hashed
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@gcftcamp.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin12345";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Validate credentials
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      // Set httpOnly cookie for security
      cookies().set({
        name: 'adminToken',
        value: 'authenticated_' + Date.now(),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24, // 24 hours
        path: '/',
      });

      return NextResponse.json({ 
        success: true,
        message: 'Login successful' 
      });
    }

    return NextResponse.json(
      { error: 'Invalid credentials' },
      { status: 401 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    );
  }
}