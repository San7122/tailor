import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { sendWhatsAppMessage, getStatusMessage } from '@/lib/whatsapp'

export async function POST(request: NextRequest) {
  try {
    const { orderId, newStatus } = await request.json()

    if (!orderId || !newStatus) {
      return new NextResponse(
        JSON.stringify({ error: 'Missing orderId or newStatus' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Fetch order with customer details
    const { data: order } = await supabase
      .from('orders')
      .select('*, customers(full_name, phone_number, whatsapp_number)')
      .eq('id', orderId)
      .single()

    if (!order) {
      return new NextResponse(
        JSON.stringify({ error: 'Order not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const customerName = order.customers?.full_name || 'Valued Customer'
    const phoneNumber = order.customers?.whatsapp_number || order.customers?.phone_number

    if (!phoneNumber) {
      return new NextResponse(
        JSON.stringify({ error: 'No phone number available' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Generate and send message
    const message = getStatusMessage(newStatus, customerName, orderId)
    const result = await sendWhatsAppMessage(phoneNumber, message, newStatus)

    if (result.success) {
      // Log notification sent
      console.log(`WhatsApp notification sent to ${phoneNumber}`)

      return new NextResponse(
        JSON.stringify({
          success: true,
          message: 'Notification sent',
          messageId: result.messageId,
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    } else {
      console.error('Failed to send WhatsApp message:', result.error)

      return new NextResponse(
        JSON.stringify({
          success: false,
          error: result.error,
          warning: 'Order status updated but notification failed',
        }),
        { status: 207, headers: { 'Content-Type': 'application/json' } }
      )
    }
  } catch (error) {
    console.error('Notification error:', error)
    return new NextResponse(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
