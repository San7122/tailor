import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type OrderStatus =
  | 'BOOKED'
  | 'RIDER_ASSIGNED'
  | 'PICKED_UP'
  | 'INWARDED'
  | 'CUTTING'
  | 'STITCHING'
  | 'QA_CHECK'
  | 'DISPATCHED'
  | 'DELIVERED'

export type PaymentStatus = 'PENDING' | 'PAID' | 'REFUNDED'

export interface Hub {
  id: string; name: string; address: string; sector: string; is_active: boolean; lat: number; lng: number;
}

export interface Customer {
  id: string; full_name: string; phone_number: string; whatsapp_number: string;
  delivery_address: string; sector: string; total_orders: number; created_at: string;
}

export interface Tailor {
  id: string; hub_id: string; full_name: string;
  role: 'master_cutter' | 'stitcher' | 'finisher';
  skill_level: string; monthly_base: number; piece_rate: number; is_active: boolean;
}

export interface Rider {
  id: string; full_name: string; phone_number: string; vehicle_type: string;
  current_sector: string; is_available: boolean; total_deliveries: number;
}

export interface ServiceType {
  id: string; name: string; category: 'stitching' | 'alteration' | 'express';
  base_price: number; stitching_cost: number; estimated_hours: number; is_active: boolean;
}

export interface Order {
  id: string; customer_id: string; hub_id: string; tailor_id: string | null;
  rider_id: string | null; service_type_id: string; order_status: OrderStatus;
  price: number; payment_method: string; payment_status: PaymentStatus;
  reference_garment_notes: string; special_instructions: string | null;
  pickup_address: string; created_at: string; updated_at: string;
  customers?: Customer; service_types?: ServiceType; riders?: Rider;
}
