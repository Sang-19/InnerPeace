import { NextResponse } from 'next/server';
import { correctBookName } from '@/ai/flows/ai-chatbot-assistance';

export async function POST(request: Request) {
  const { bookQuery } = await request.json();
  try {
    const result = await correctBookName({ bookQuery });
    return NextResponse.json(result);
  } catch (error: any) {
    // Return a friendly error message
    return NextResponse.json(
      { error: 'AI service is temporarily unavailable. Please try again later.' },
      { status: 503 }
    );
  }
}