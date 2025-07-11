import { NextRequest, NextResponse } from 'next/server'
import webpush from 'web-push'

// VAPID keys should be generated and kept secret in production
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || 'REPLACE_WITH_YOUR_PUBLIC_KEY'
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || 'REPLACE_WITH_YOUR_PRIVATE_KEY'

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