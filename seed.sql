-- Create tables for QuickStitch

-- Hubs table
CREATE TABLE IF NOT EXISTS hubs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  sector TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  lat FLOAT,
  lng FLOAT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Service Types table
CREATE TABLE IF NOT EXISTS service_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('stitching', 'alteration', 'express')),
  base_price INTEGER NOT NULL,
  stitching_cost INTEGER NOT NULL DEFAULT 0,
  estimated_hours INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  phone_number TEXT NOT NULL UNIQUE,
  whatsapp_number TEXT NOT NULL,
  delivery_address TEXT NOT NULL,
  sector TEXT NOT NULL,
  total_orders INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Riders table
CREATE TABLE IF NOT EXISTS riders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  phone_number TEXT NOT NULL UNIQUE,
  vehicle_type TEXT NOT NULL,
  current_sector TEXT NOT NULL,
  is_available BOOLEAN DEFAULT true,
  total_deliveries INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Tailors table
CREATE TABLE IF NOT EXISTS tailors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hub_id UUID NOT NULL REFERENCES hubs(id),
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('master_cutter', 'stitcher', 'finisher')),
  skill_level TEXT NOT NULL,
  monthly_base INTEGER NOT NULL,
  piece_rate INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id),
  hub_id UUID NOT NULL REFERENCES hubs(id),
  tailor_id UUID REFERENCES tailors(id),
  rider_id UUID REFERENCES riders(id),
  service_type_id UUID NOT NULL REFERENCES service_types(id),
  order_status TEXT NOT NULL DEFAULT 'BOOKED' CHECK (order_status IN ('BOOKED', 'RIDER_ASSIGNED', 'PICKED_UP', 'INWARDED', 'CUTTING', 'STITCHING', 'QA_CHECK', 'DISPATCHED', 'DELIVERED')),
  price INTEGER NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('UPI', 'COD', 'CARD')),
  payment_status TEXT NOT NULL DEFAULT 'PENDING' CHECK (payment_status IN ('PENDING', 'PAID', 'REFUNDED')),
  reference_garment_notes TEXT NOT NULL,
  special_instructions TEXT,
  pickup_address TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Insert sample hub
INSERT INTO hubs (name, address, sector, is_active, lat, lng) VALUES
('QuickStitch Dwarka Hub', 'Plot 123, Sector 7, Dwarka, Delhi', 'Sector 7', true, 28.5921, 77.0460)
ON CONFLICT DO NOTHING;

-- Insert service types
INSERT INTO service_types (name, category, base_price, stitching_cost, estimated_hours, is_active) VALUES
-- Stitching
('Ladies Kurta', 'stitching', 899, 400, 48, true),
('Salwar Suit (Full Set)', 'stitching', 1299, 600, 48, true),
('Lehenga Blouse', 'stitching', 1499, 700, 48, true),
('Gents Shirt', 'stitching', 699, 350, 48, true),
-- Alterations
('Hemming / Tapering', 'alteration', 199, 100, 12, true),
('Waist Adjustment', 'alteration', 249, 120, 12, true),
('Zipper Replacement', 'alteration', 299, 150, 12, true),
-- Express & Bridal
('Premium Express', 'express', 1799, 900, 24, true),
('Bridal Blouse (Designer)', 'express', 2499, 1200, 36, true)
ON CONFLICT DO NOTHING;

-- Set up Row Level Security (RLS) policies
ALTER TABLE hubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE riders ENABLE ROW LEVEL SECURITY;
ALTER TABLE tailors ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Allow public read access to hubs and service_types
CREATE POLICY "Allow public read access to hubs" ON hubs
  FOR SELECT USING (true);

CREATE POLICY "Allow public read access to service_types" ON service_types
  FOR SELECT USING (true);

-- Allow authenticated users to insert and read customers
CREATE POLICY "Allow users to insert customers" ON customers
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow users to read customers" ON customers
  FOR SELECT USING (true);

-- Allow authenticated users to insert and read orders
CREATE POLICY "Allow users to insert orders" ON orders
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow users to read orders" ON orders
  FOR SELECT USING (true);

CREATE POLICY "Allow users to update orders" ON orders
  FOR UPDATE USING (true);

-- Allow public read access to riders (for location tracking)
CREATE POLICY "Allow public read access to riders" ON riders
  FOR SELECT USING (true);

-- Allow public read access to tailors
CREATE POLICY "Allow public read access to tailors" ON tailors
  FOR SELECT USING (true);

-- Set up indexes for performance
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(order_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone_number);
CREATE INDEX IF NOT EXISTS idx_service_types_category ON service_types(category);
CREATE INDEX IF NOT EXISTS idx_riders_sector ON riders(current_sector);
