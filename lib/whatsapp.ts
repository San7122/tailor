const WHATSAPP_API_URL = 'https://graph.instagram.com/v18.0'
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN

export async function sendWhatsAppMessage(
  phoneNumber: string,
  message: string,
  orderStatus?: string
) {
  if (!ACCESS_TOKEN || !PHONE_NUMBER_ID) {
    console.warn('WhatsApp credentials not configured')
    return { success: false, error: 'Missing credentials' }
  }

  try {
    const response = await fetch(
      `${WHATSAPP_API_URL}/${PHONE_NUMBER_ID}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: phoneNumber,
          type: 'text',
          text: {
            preview_url: true,
            body: message,
          },
        }),
      }
    )

    const data = await response.json()

    if (!response.ok) {
      console.error('WhatsApp API error:', data)
      return { success: false, error: data.error?.message }
    }

    return { success: true, messageId: data.messages?.[0]?.id }
  } catch (error) {
    console.error('Error sending WhatsApp message:', error)
    return { success: false, error: String(error) }
  }
}

export function getStatusMessage(
  status: string,
  customerName: string,
  orderId: string
): string {
  const messages: Record<string, string> = {
    BOOKED: `Hi ${customerName}! 🎉 Your QuickStitch order #${orderId.slice(-6)} is confirmed. Our rider will pick up your fabric within 30 minutes. Ready?`,
    RIDER_ASSIGNED: `🏍️ Your rider is on the way, ${customerName}! They'll arrive in 20-30 minutes. Please keep your fabric & reference garment ready.`,
    INWARDED: `📦 Your fabric has arrived at our Dwarka hub, ${customerName}! Our tailors are reviewing your measurements. Stitching starts soon.`,
    CUTTING: `✂️ ${customerName}, our master cutters are now working on your piece. Your custom fit is being created!`,
    STITCHING: `🪡 Stitching in progress, ${customerName}! Your outfit is taking shape. Expected delivery: 48 hours from pickup.`,
    QA_CHECK: `🔍 Quality check in progress, ${customerName}! We're ensuring perfect fit and finishing before dispatch.`,
    DISPATCHED: `🚀 Your order is on the way, ${customerName}! Our rider will deliver your beautifully stitched outfit within 2 hours.`,
    DELIVERED: `✅ ${customerName}, your order has been delivered! We hope you love your perfect-fit outfit. Thank you for choosing QuickStitch! 💎`,
  }

  return messages[status] || `Order #${orderId.slice(-6)} status: ${status}`
}

export const statusEmojis: Record<string, string> = {
  BOOKED: '📋',
  RIDER_ASSIGNED: '🏍️',
  INWARDED: '📦',
  CUTTING: '✂️',
  STITCHING: '🪡',
  QA_CHECK: '🔍',
  DISPATCHED: '🚀',
  DELIVERED: '✅',
}
