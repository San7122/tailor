import { getStatusMessage } from '@/lib/whatsapp'

describe('WhatsApp Integration', () => {
  describe('Message Generation', () => {
    it('should generate message for BOOKED status', () => {
      const message = getStatusMessage('BOOKED', 'Priya Singh', 'order-123')
      expect(message).toContain('Priya Singh')
      expect(message).toContain('30 minutes')
    })

    it('should generate message for RIDER_ASSIGNED', () => {
      const message = getStatusMessage('RIDER_ASSIGNED', 'Raj Kumar', 'order-456')
      expect(message).toContain('Raj Kumar')
      expect(message).toContain('20-30 minutes')
    })

    it('should generate message for INWARDED', () => {
      const message = getStatusMessage('INWARDED', 'Priya', 'order-789')
      expect(message).toContain('hub')
    })

    it('should generate message for STITCHING', () => {
      const message = getStatusMessage('STITCHING', 'John', 'order-999')
      expect(message).toContain('John')
    })

    it('should generate message for QA_CHECK', () => {
      const message = getStatusMessage('QA_CHECK', 'Sarah', 'order-111')
      expect(message).toContain('Quality check')
    })

    it('should generate message for DISPATCHED', () => {
      const message = getStatusMessage('DISPATCHED', 'Amit', 'order-222')
      expect(message).toContain('Amit')
    })

    it('should generate message for DELIVERED', () => {
      const message = getStatusMessage('DELIVERED', 'Preeti', 'order-333')
      expect(message).toContain('Preeti')
    })

    it('should include order ID in message', () => {
      const message = getStatusMessage('BOOKED', 'Test', 'abcdef123456')
      expect(message).toContain('123456')
    })

    it('should return fallback message for unknown status', () => {
      const message = getStatusMessage('UNKNOWN', 'Test', 'abcdef123456')
      expect(message).toContain('123456')
      expect(message).toContain('UNKNOWN')
    })
  })

  describe('Message Content Validation', () => {
    it('should include customer name in all messages', () => {
      const statuses = [
        'BOOKED',
        'RIDER_ASSIGNED',
        'INWARDED',
        'CUTTING',
        'STITCHING',
        'QA_CHECK',
        'DISPATCHED',
        'DELIVERED',
      ]

      statuses.forEach((status) => {
        const message = getStatusMessage(status, 'Priya Singh', 'order-123')
        expect(message).toContain('Priya Singh')
      })
    })

    it('should be under WhatsApp character limit (4096)', () => {
      const statuses = [
        'BOOKED',
        'RIDER_ASSIGNED',
        'INWARDED',
        'CUTTING',
        'STITCHING',
        'QA_CHECK',
        'DISPATCHED',
        'DELIVERED',
      ]

      statuses.forEach((status) => {
        const message = getStatusMessage(status, 'John Doe', 'order-123')
        expect(message.length).toBeLessThan(4096)
      })
    })
  })

  describe('Status Progression', () => {
    it('should generate messages for full order lifecycle', () => {
      const statuses = [
        'BOOKED',
        'RIDER_ASSIGNED',
        'INWARDED',
        'CUTTING',
        'STITCHING',
        'QA_CHECK',
        'DISPATCHED',
        'DELIVERED',
      ]

      statuses.forEach((status) => {
        const message = getStatusMessage(status, 'Customer', 'order-123')
        expect(message).toBeDefined()
        expect(message.length).toBeGreaterThan(0)
        expect(message).toContain('Customer')
      })
    })
  })
})
