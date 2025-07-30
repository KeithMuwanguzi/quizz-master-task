import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const uid = searchParams.get('uid');

    if (!uid) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    const user = await AuthService.getUserProfile(uid);

    if (user) {
      return NextResponse.json({
        success: true,
        user
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }
  } catch (error: any) {
    console.error('Profile API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}