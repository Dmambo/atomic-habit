import { NextRequest, NextResponse } from 'next/server'

// In-memory store for demo; replace with a database in production
export const subscriptions: any[] = []

export async function POST(req: NextRequest) {
  const subscription = await req.json()
  // Avoid duplicates
  if (!subscriptions.find((sub) => sub.endpoint === subscription.endpoint)) {
    subscriptions.push(subscription)
  }
  return NextResponse.json({ success: true })
}

export async function GET() {
  // Return all subscriptions (for testing/demo)
  return NextResponse.json(subscriptions)
} 