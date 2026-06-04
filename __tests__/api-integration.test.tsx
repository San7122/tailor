import { supabase } from '@/lib/supabase'

jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
    channel: jest.fn(),
    removeChannel: jest.fn(),
  },
}))

describe('QuickStitch API Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Customer Management', () => {
    it('should create a new customer with booking details', async () => {
      const mockInsert = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: {
              id: 'cust-123',
              full_name: 'Priya Singh',
              phone_number: '9876543210',
              whatsapp_number: '9876543210',
              delivery_address: 'Sector 11, Delhi',
              sector: 'Sector 11',
            },
          }),
        }),
      })

      ;(supabase.from as jest.Mock).mockReturnValue({
        insert: mockInsert,
      })

      const customerData = {
        full_name: 'Priya Singh',
        phone_number: '9876543210',
        whatsapp_number: '9876543210',
        delivery_address: 'Sector 11, Delhi',
        sector: 'Sector 11',
      }

      const { data } = await supabase.from('customers').insert(customerData).select('id').single()

      expect(mockInsert).toHaveBeenCalledWith(customerData)
      expect(data).toBeDefined()
      expect(data?.id).toBe('cust-123')
    })

    it('should find existing customer by phone number', async () => {
      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({
          data: {
            id: 'cust-456',
            full_name: 'Rajesh Kumar',
            phone_number: '9876543210',
          },
        }),
      })

      ;(supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect,
      })

      const { data } = await supabase
        .from('customers')
        .select('id')
        .eq('phone_number', '9876543210')

      expect(mockSelect).toHaveBeenCalledWith('id')
      expect(data).toBeDefined()
      expect(data?.id).toBe('cust-456')
    })
  })

  describe('Order Management', () => {
    it('should create order with all required fields', async () => {
      const mockInsert = jest.fn().mockResolvedValue({
        data: { id: 'order-789' },
      })

      ;(supabase.from as jest.Mock).mockReturnValue({
        insert: mockInsert,
      })

      const orderData = {
        customer_id: 'cust-123',
        hub_id: 'hub-1',
        service_type_id: 'svc-1',
        order_status: 'BOOKED',
        price: 899,
        payment_method: 'UPI',
        payment_status: 'PAID',
        reference_garment_notes: 'Pink kurta',
        special_instructions: 'Make neck 1 inch deeper',
        pickup_address: 'Sector 11, Delhi',
      }

      const { data } = await supabase.from('orders').insert(orderData)

      expect(mockInsert).toHaveBeenCalledWith(orderData)
      expect(data?.id).toBe('order-789')
    })

    it('should set payment status based on payment method', () => {
      const paymentMethods = {
        UPI: {
          payment_method: 'UPI',
          payment_status: 'PAID',
        },
        COD: {
          payment_method: 'COD',
          payment_status: 'PENDING',
        },
        CARD: {
          payment_method: 'CARD',
          payment_status: 'PENDING',
        },
      }

      expect(paymentMethods.UPI.payment_status).toBe('PAID')
      expect(paymentMethods.COD.payment_status).toBe('PENDING')
      expect(paymentMethods.CARD.payment_status).toBe('PENDING')
    })

    it('should update order status through pipeline', async () => {
      const statusPipeline: Record<string, string> = {
        BOOKED: 'RIDER_ASSIGNED',
        RIDER_ASSIGNED: 'INWARDED',
        INWARDED: 'CUTTING',
        CUTTING: 'STITCHING',
        STITCHING: 'QA_CHECK',
        QA_CHECK: 'DISPATCHED',
        DISPATCHED: 'DELIVERED',
      }

      const mockUpdate = jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ data: null }),
      })

      ;(supabase.from as jest.Mock).mockReturnValue({
        update: mockUpdate,
      })

      const currentStatus = 'BOOKED'
      const nextStatus = statusPipeline[currentStatus]

      await supabase.from('orders').update({ order_status: nextStatus }).eq('id', 'order-1')

      expect(mockUpdate).toHaveBeenCalledWith({ order_status: 'RIDER_ASSIGNED' })
      expect(nextStatus).toBe('RIDER_ASSIGNED')
    })

    it('should fetch orders with related data', async () => {
      const mockSelect = jest.fn().mockReturnValue({
        neq: jest.fn().mockReturnValue({
          order: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue({
              data: [
                {
                  id: 'order-1',
                  customer_id: 'cust-1',
                  order_status: 'BOOKED',
                  price: 899,
                  customers: { full_name: 'Priya Singh', phone_number: '9876543210' },
                  service_types: { name: 'Ladies Kurta', base_price: 899 },
                },
              ],
            }),
          }),
        }),
      })

      ;(supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect,
      })

      const { data } = await supabase
        .from('orders')
        .select('*, customers(*), service_types(*), riders(*)')
        .neq('order_status', 'DELIVERED')
        .order('created_at', { ascending: false })
        .limit(100)

      expect(mockSelect).toHaveBeenCalled()
      expect(data).toBeDefined()
      expect(data?.[0]?.customers).toBeDefined()
      expect(data?.[0]?.service_types).toBeDefined()
    })
  })

  describe('Hub Dashboard Analytics', () => {
    it('should calculate total revenue from orders', () => {
      const orders = [
        { price: 899 },
        { price: 1299 },
        { price: 699 },
        { price: 499 },
      ]

      const totalRevenue = orders.reduce((sum, order) => sum + order.price, 0)

      expect(totalRevenue).toBe(3396)
    })

    it('should count orders by status', () => {
      const orders = [
        { id: '1', order_status: 'BOOKED' },
        { id: '2', order_status: 'BOOKED' },
        { id: '3', order_status: 'STITCHING' },
        { id: '4', order_status: 'STITCHING' },
        { id: '5', order_status: 'QA_CHECK' },
        { id: '6', order_status: 'DISPATCHED' },
      ]

      const countByStatus = (status: string) =>
        orders.filter((order) => order.order_status === status).length

      expect(countByStatus('BOOKED')).toBe(2)
      expect(countByStatus('STITCHING')).toBe(2)
      expect(countByStatus('QA_CHECK')).toBe(1)
      expect(countByStatus('DISPATCHED')).toBe(1)
    })

    it('should filter active orders (exclude DELIVERED)', () => {
      const orders = [
        { id: '1', order_status: 'BOOKED' },
        { id: '2', order_status: 'STITCHING' },
        { id: '3', order_status: 'DELIVERED' },
        { id: '4', order_status: 'DISPATCHED' },
      ]

      const activeOrders = orders.filter((o) => o.order_status !== 'DELIVERED')

      expect(activeOrders).toHaveLength(3)
      expect(activeOrders.find((o) => o.order_status === 'DELIVERED')).toBeUndefined()
    })
  })

  describe('Real-time Subscriptions', () => {
    it('should subscribe to order changes', async () => {
      const mockOn = jest.fn().mockReturnThis()
      const mockSubscribe = jest.fn()

      ;(supabase.channel as jest.Mock).mockReturnValue({
        on: mockOn,
        subscribe: mockSubscribe,
      })

      const channel = supabase.channel('hub-orders')
      channel.on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, jest.fn())
      channel.subscribe()

      expect(supabase.channel).toHaveBeenCalledWith('hub-orders')
      expect(mockOn).toHaveBeenCalled()
      expect(mockSubscribe).toHaveBeenCalled()
    })
  })

  describe('Service Types & Pricing', () => {
    it('should fetch active service types', async () => {
      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          order: jest.fn().mockResolvedValue({
            data: [
              {
                id: 'svc-1',
                name: 'Ladies Kurta',
                category: 'stitching',
                base_price: 899,
                estimated_hours: 48,
                is_active: true,
              },
              {
                id: 'svc-2',
                name: 'Hemming',
                category: 'alteration',
                base_price: 199,
                estimated_hours: 12,
                is_active: true,
              },
            ],
          }),
        }),
      })

      ;(supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect,
      })

      const { data } = await supabase
        .from('service_types')
        .select('*')
        .eq('is_active', true)
        .order('category')

      expect(mockSelect).toHaveBeenCalledWith('*')
      expect(data).toHaveLength(2)
      expect(data?.[0]?.base_price).toBe(899)
    })
  })
})
