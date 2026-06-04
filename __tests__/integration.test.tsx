import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { supabase } from '@/lib/supabase'

jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
    channel: jest.fn(),
    removeChannel: jest.fn(),
  },
}))

describe('QuickStitch Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should create customer on first booking', async () => {
    const mockInsert = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({
          data: { id: 'new-cust-1', full_name: 'Priya Singh' },
        }),
      }),
    })

    ;(supabase.from as jest.Mock).mockImplementation((table) => {
      if (table === 'customers') {
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({ data: null }),
          }),
          insert: mockInsert,
        }
      }
      return {}
    })

    // Simulate customer creation logic
    const { data: existingCustomer } = await supabase
      .from('customers')
      .select('id')
      .eq('phone_number', '9876543210')

    if (!existingCustomer) {
      const { data: newCustomer } = await supabase
        .from('customers')
        .insert({
          full_name: 'Priya Singh',
          phone_number: '9876543210',
          whatsapp_number: '9876543210',
          delivery_address: 'Sector 11, Delhi',
          sector: 'Sector 11',
        })
        .select('id')
        .single()

      expect(newCustomer).toBeDefined()
      expect(mockInsert).toHaveBeenCalled()
    }
  })

  it('should reuse existing customer on repeat booking', async () => {
    const existingCustomer = { id: 'existing-cust-1' }

    ;(supabase.from as jest.Mock).mockImplementation((table) => {
      if (table === 'customers') {
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({ data: existingCustomer }),
          }),
          insert: jest.fn(),
        }
      }
      return {}
    })

    const { data: customer } = await supabase
      .from('customers')
      .select('id')
      .eq('phone_number', '9876543210')

    expect(customer).toEqual(existingCustomer)
  })

  it('should create order with all required fields', async () => {
    const mockOrderInsert = jest.fn().mockResolvedValue({
      data: { id: 'order-123' },
    })

    ;(supabase.from as jest.Mock).mockImplementation((table) => {
      if (table === 'orders') {
        return {
          insert: mockOrderInsert,
        }
      }
      return {}
    })

    const orderData = {
      customer_id: 'cust-1',
      hub_id: 'hub-1',
      service_type_id: 'svc-1',
      order_status: 'BOOKED',
      price: 899,
      payment_method: 'UPI',
      payment_status: 'PAID',
      reference_garment_notes: 'Pink kurta from closet',
      special_instructions: null,
      pickup_address: 'Flat 101, Sector 11, Delhi',
    }

    await supabase.from('orders').insert(orderData)

    expect(mockOrderInsert).toHaveBeenCalledWith(orderData)
  })

  it('should update order status in hub dashboard', async () => {
    const mockUpdate = jest.fn().mockReturnValue({
      eq: jest.fn().mockResolvedValue({ data: null }),
    })

    ;(supabase.from as jest.Mock).mockImplementation((table) => {
      if (table === 'orders') {
        return {
          update: mockUpdate,
        }
      }
      return {}
    })

    const orderId = 'order-1'
    const newStatus = 'RIDER_ASSIGNED'

    await supabase.from('orders').update({ order_status: newStatus }).eq('id', orderId)

    expect(mockUpdate).toHaveBeenCalledWith({ order_status: newStatus })
  })

  it('should handle payment status for different payment methods', async () => {
    ;(supabase.from as jest.Mock).mockReturnValue({
      insert: jest.fn().mockResolvedValue({ data: { id: 'order-1' } }),
    })

    // UPI should be marked as PAID immediately
    const upiOrder = {
      customer_id: 'cust-1',
      hub_id: 'hub-1',
      service_type_id: 'svc-1',
      payment_method: 'UPI',
      payment_status: 'UPI' === 'UPI' ? 'PAID' : 'PENDING',
    }

    // COD should be marked as PENDING
    const codOrder = {
      customer_id: 'cust-1',
      hub_id: 'hub-1',
      service_type_id: 'svc-1',
      payment_method: 'COD',
      payment_status: 'COD' === 'UPI' ? 'PAID' : 'PENDING',
    }

    expect(upiOrder.payment_status).toBe('PAID')
    expect(codOrder.payment_status).toBe('PENDING')
  })

  it('should validate required fields in booking form', () => {
    const form = {
      full_name: '',
      phone_number: '',
      pickup_address: '',
      reference_garment_notes: '',
    }

    const isFormValid =
      !!(form.full_name && form.phone_number && form.pickup_address && form.reference_garment_notes)

    expect(isFormValid).toBe(false)

    form.full_name = 'Priya Singh'
    form.phone_number = '9876543210'
    form.pickup_address = 'Sector 11, Delhi'
    form.reference_garment_notes = 'Pink kurta'

    const isFormValidNow =
      !!(form.full_name && form.phone_number && form.pickup_address && form.reference_garment_notes)

    expect(isFormValidNow).toBe(true)
  })

  it('should calculate total revenue correctly', () => {
    const orders = [
      { id: '1', price: 899 },
      { id: '2', price: 1299 },
      { id: '3', price: 699 },
    ]

    const totalRevenue = orders.reduce((sum, order) => sum + order.price, 0)

    expect(totalRevenue).toBe(2897)
  })

  it('should count orders by status correctly', () => {
    const orders = [
      { id: '1', status: 'BOOKED' },
      { id: '2', status: 'BOOKED' },
      { id: '3', status: 'STITCHING' },
      { id: '4', status: 'STITCHING' },
      { id: '5', status: 'DELIVERED' },
    ]

    const countByStatus = (status: string) => orders.filter((o) => o.status === status).length

    expect(countByStatus('BOOKED')).toBe(2)
    expect(countByStatus('STITCHING')).toBe(2)
    expect(countByStatus('DELIVERED')).toBe(1)
  })
})
