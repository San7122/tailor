# WhatsApp Cloud API Setup Guide

## Overview
The QuickStitch app now sends automatic WhatsApp notifications when order status changes:
- 📋 Order Booked
- 🏍️ Rider Assigned
- 📦 At Hub
- ✂️ Cutting
- 🪡 Stitching
- 🔍 QA Check
- 🚀 Dispatched
- ✅ Delivered

## Step 1: Create WhatsApp Business Account

1. Go to [Facebook Business Suite](https://business.facebook.com)
2. Create a new app or use existing one
3. Go to **Apps → Your App → Settings → Basic**
4. Note your **App ID** and **App Secret**

## Step 2: Set Up WhatsApp Business Phone Number

1. In Business Suite, go to **WhatsApp → Phone Numbers**
2. Click **Add Phone Number**
3. Use your business phone number (must be verified)
4. Get your **Phone Number ID** (format: `1234567890`)

## Step 3: Generate Access Token

1. Go to **Settings → User Access Tokens**
2. Create a new token with these permissions:
   - `whatsapp_business_messaging`
   - `whatsapp_business_account_management`
3. Copy the **Access Token**

## Step 4: Update Environment Variables

Add these to `.env.local`:

```env
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_ACCESS_TOKEN=your_access_token
WHATSAPP_VERIFY_TOKEN=quickstitch_webhook_2026
```

Example:
```env
WHATSAPP_PHONE_NUMBER_ID=1234567890
WHATSAPP_ACCESS_TOKEN=EAABs8Zb7z8xQBAL5aBZBLz5xQBAL5a...
WHATSAPP_VERIFY_TOKEN=quickstitch_webhook_2026
```

## Step 5: Configure Webhook in Facebook App

1. Go to your app in **Facebook App Dashboard**
2. Navigate to **WhatsApp → Configuration**
3. Under **Webhook URL**, enter:
   ```
   https://yourdomain.com/api/webhooks/whatsapp
   ```
   (For local dev: you'll need a public URL using ngrok or similar)

4. **Verify Token**: `quickstitch_webhook_2026`

5. Subscribe to these webhook events:
   - `messages` (incoming customer messages)
   - `message_status` (delivery confirmations)

## Step 6: Test Webhook Locally (Optional)

For local testing without ngrok:

```bash
# Install ngrok
brew install ngrok

# Start ngrok
ngrok http 3000

# Use the https URL provided (e.g., https://xyz.ngrok.io) 
# in Facebook webhook settings as:
# https://xyz.ngrok.io/api/webhooks/whatsapp
```

## Step 7: How It Works

### When an order status changes:

1. **Hub Dashboard** → User clicks "→ NEXT_STATUS" button
2. **Order Updated** → Supabase updates order status
3. **Notification Sent** → API calls `/api/orders/notify`
4. **WhatsApp Message** → Customer receives SMS on WhatsApp with:
   - Order confirmation/status update
   - Rider info
   - Expected timeline
   - Next steps

### Example Messages:

```
📋 "Hi Sanjana! Your QuickStitch order #226E55 is confirmed. Our rider will pick up your fabric within 30 minutes. Ready?"

🏍️ "Your rider is on the way, Sanjana! They'll arrive in 20-30 minutes. Please keep your fabric & reference garment ready."

✅ "Sanjana, your order has been delivered! We hope you love your perfect-fit outfit. Thank you for choosing QuickStitch! 💎"
```

## Step 8: Handle Test Numbers (Sandbox)

For testing with sandbox numbers:

1. In **WhatsApp App Dashboard**, go to **API Setup**
2. Your test phone number is provided (e.g., 1234:56789012345678)
3. Add test numbers to whitelist
4. Test messages sent to these numbers don't count against quota

## Troubleshooting

### "WhatsApp credentials not configured"
- Check `.env.local` has `WHATSAPP_ACCESS_TOKEN` and `WHATSAPP_PHONE_NUMBER_ID`
- Restart dev server: `npm run dev`

### "Webhook verification failed"
- Verify token must match: `quickstitch_webhook_2026`
- Check webhook URL is publicly accessible (use ngrok for local testing)

### Messages not sending
- Verify access token has required permissions
- Check phone number is verified and active
- Confirm customer phone number includes country code (e.g., +91...)
- Check WhatsApp API rate limits (standard: 1000 messages/day)

### Customer not receiving messages
- Ensure phone number includes country code
- Customer must have WhatsApp installed
- Check Facebook app is in development/production mode
- Verify phone number is in whitelist (if in sandbox)

## API Reference

### Send Notification Endpoint

```typescript
POST /api/orders/notify
Content-Type: application/json

{
  "orderId": "order-uuid",
  "newStatus": "RIDER_ASSIGNED"
}

Response: 
{
  "success": true,
  "message": "Notification sent",
  "messageId": "wamid.xxx"
}
```

### WhatsApp Helper Functions

```typescript
import { sendWhatsAppMessage, getStatusMessage } from '@/lib/whatsapp'

// Send custom message
await sendWhatsAppMessage('9876543210', 'Your order is ready!')

// Get templated status message
const message = getStatusMessage('DELIVERED', 'John', 'order-123')
// Returns: "John, your order has been delivered!..."
```

## Production Checklist

- [ ] WhatsApp Business Account verified
- [ ] Phone number verified and active
- [ ] Access token generated with correct permissions
- [ ] Environment variables set in production
- [ ] Webhook URL configured and verified
- [ ] Test message sent successfully
- [ ] Rate limits understood (1000/day for standard)
- [ ] Error handling implemented for failed sends
- [ ] Phone numbers include country codes

## Next Steps

1. Complete setup above
2. Test with hub dashboard order status changes
3. Verify messages are received on WhatsApp
4. Monitor delivery status in webhook logs
5. (Optional) Set up message templates for better formatting

## Cost & Limits

- **Free tier**: 1000 messages/day
- **Standard tier**: Unlimited (requires payment method)
- **Rate limits**: 1 message/second per phone number
- **Template messages**: Cheaper than free-form messages (recommended for production)
