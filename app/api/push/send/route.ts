import { NextRequest, NextResponse } from 'next/server'
import webpush from 'web-push'

// VAPID keys should be generated and kept secret in production
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY

if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
  throw new Error('VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY must be set in environment variables.')
}

webpush.setVapidDetails(
  'mailto:your@email.com',
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
)

// Import the in-memory subscriptions from subscribe route
import { subscriptions } from '../subscribe/route'

export async function POST(req: NextRequest) {
  const { title, body } = await req.json()
  const results = []
  for (const sub of subscriptions) {
    try {
      await webpush.sendNotification(sub, JSON.stringify({ title, body }))
      results.push({ endpoint: sub.endpoint, success: true })
    } catch (err) {
      results.push({ endpoint: sub.endpoint, success: false, error: String(err) })
    }
  }
  return NextResponse.json({ results })
} 