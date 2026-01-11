import { NextResponse } from 'next/server';
import { getQuotaManager } from '@/lib/youtube/quota';

export async function GET() {
  try {
    const quotaManager = getQuotaManager();
    const status = await quotaManager.getQuotaStatus();

    return NextResponse.json({
      quota: status,
    });
  } catch (error) {
    console.error('Error fetching quota status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quota status' },
      { status: 500 }
    );
  }
}
