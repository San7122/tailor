import { NextRequest, NextResponse } from 'next/server'

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'quickstitch_webhook_2026'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('WhatsApp webhook verified')
    return new NextResponse(challenge, { status: 200 })
  }

  return new NextResponse('Forbidden', { status: 403 })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Log webhook event
    console.log('WhatsApp webhook received:', JSON.stringify(body, null, 2))

    // Handle incoming messages
    if (body.object === 'whatsapp_business_account') {
      const entry = body.entry?.[0]
      const changes = entry?.changes?.[0]
      const value = changes?.value

      if (value?.messages) {
        // Handle incoming customer messages
        const message = value.messages[0]
        const from = message.from
        const text = message.text?.body

        console.log(`Message from ${from}: ${text}`)

        // You can add logic here to handle customer replies
        // For now, just acknowledge receipt
      }

      if (value?.statuses) {
        // Handle message delivery status
        const status = value.statuses[0]
        console.log(`Message delivery status: ${status.status}`)
      }
    }

    return new NextResponse(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Webhook error:', error)
    return new NextResponse(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
