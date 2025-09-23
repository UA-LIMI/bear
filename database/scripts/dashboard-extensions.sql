-- ===================================
-- DASHBOARD EXTENSIONS FOR HOTEL MANAGEMENT
-- ===================================
-- Additional tables needed for the luxury hotel dashboard
-- These extend the existing AI context system

-- ===================================
-- 1. STAFF MANAGEMENT
-- ===================================

CREATE TABLE public.staff_profiles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    hotel_id UUID REFERENCES public.hotels(id),
    name VARCHAR(100) NOT NULL,
    position VARCHAR(100) NOT NULL,
    department VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20),
    photo TEXT, -- URL to profile photo
    join_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'on duty' CHECK (status IN ('on duty', 'on break', 'off duty')),
    shift VARCHAR(50), -- e.g., "9:00 AM - 5:00 PM"
    performance_rating DECIMAL(3,2) DEFAULT 0.0, -- 0.0 to 5.0
    notes TEXT,
    skills JSONB DEFAULT '[]'::jsonb, -- Array of {name, level} objects
    schedule JSONB DEFAULT '[]'::jsonb, -- Array of {day, working, hours} objects
    metrics JSONB DEFAULT '{}'::jsonb, -- Performance metrics
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===================================
-- 2. GUEST SERVICE REQUESTS
-- ===================================

CREATE TABLE public.guest_requests (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    room_number VARCHAR(10),
    guest_name VARCHAR(100) NOT NULL,
    request_type VARCHAR(50) NOT NULL, -- 'room-service', 'housekeeping', 'concierge', etc.
    message TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'completed', 'cancelled')),
    priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
    assigned_staff_id UUID REFERENCES public.staff_profiles(id),
    scheduled_for TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    ai_suggestion TEXT, -- AI-generated response suggestion
    conversation JSONB DEFAULT '[]'::jsonb, -- Array of conversation messages
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===================================
-- 3. MENU MANAGEMENT
-- ===================================

CREATE TABLE public.menu_categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    hotel_id UUID REFERENCES public.hotels(id),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    display_order INTEGER DEFAULT 1,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.menu_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    hotel_id UUID REFERENCES public.hotels(id),
    category_id UUID REFERENCES public.menu_categories(id),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    preparation_time INTEGER, -- minutes
    allergens JSONB DEFAULT '[]'::jsonb, -- Array of allergen strings
    dietary_info VARCHAR(100), -- 'vegetarian', 'vegan', 'gluten-free', etc.
    available BOOLEAN DEFAULT true,
    ingredients JSONB DEFAULT '[]'::jsonb,
    nutritional_info JSONB DEFAULT '{}'::jsonb,
    photo TEXT, -- URL to item photo
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===================================
-- 4. KNOWLEDGE BASE (Enhanced)
-- ===================================

CREATE TABLE public.knowledge_base (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    hotel_id UUID REFERENCES public.hotels(id),
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(50) NOT NULL, -- 'Hotel Facilities', 'Local Attractions', 'Services', etc.
    tags JSONB DEFAULT '[]'::jsonb,
    search_keywords TEXT, -- For better search functionality
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_by UUID REFERENCES public.staff_profiles(id),
    version INTEGER DEFAULT 1,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===================================
-- 5. NOTIFICATIONS SYSTEM
-- ===================================

CREATE TABLE public.notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    staff_id UUID REFERENCES public.staff_profiles(id),
    type VARCHAR(20) NOT NULL CHECK (type IN ('request', 'alert', 'info', 'system')),
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT false,
    action_url TEXT, -- Optional URL for action button
    metadata JSONB DEFAULT '{}'::jsonb,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===================================
-- 6. ROOM STATUS ENHANCEMENTS
-- ===================================

CREATE TABLE public.room_status (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    room_id UUID REFERENCES public.rooms(id),
    current_guest_id UUID REFERENCES auth.users(id),
    status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('occupied', 'available', 'maintenance', 'cleaning')),
    temperature DECIMAL(4,1) DEFAULT 22.0,
    lights_on BOOLEAN DEFAULT false,
    do_not_disturb BOOLEAN DEFAULT false,
    ac_on BOOLEAN DEFAULT false,
    curtains_open BOOLEAN DEFAULT true,
    housekeeping_status VARCHAR(20) DEFAULT 'cleaned' CHECK (housekeeping_status IN ('cleaned', 'pending', 'in progress')),
    minibar_restocked BOOLEAN DEFAULT true,
    maintenance_needed BOOLEAN DEFAULT false,
    last_cleaned TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===================================
-- 7. INDEXES FOR PERFORMANCE
-- ===================================

-- Staff indexes
CREATE INDEX idx_staff_profiles_hotel ON public.staff_profiles(hotel_id);
CREATE INDEX idx_staff_profiles_department ON public.staff_profiles(department);
CREATE INDEX idx_staff_profiles_status ON public.staff_profiles(status);

-- Request indexes
CREATE INDEX idx_guest_requests_user ON public.guest_requests(user_id);
CREATE INDEX idx_guest_requests_status ON public.guest_requests(status);
CREATE INDEX idx_guest_requests_priority ON public.guest_requests(priority);
CREATE INDEX idx_guest_requests_room ON public.guest_requests(room_number);
CREATE INDEX idx_guest_requests_staff ON public.guest_requests(assigned_staff_id);

-- Menu indexes
CREATE INDEX idx_menu_items_hotel ON public.menu_items(hotel_id);
CREATE INDEX idx_menu_items_category ON public.menu_items(category_id);
CREATE INDEX idx_menu_items_available ON public.menu_items(available);

-- Knowledge base indexes
CREATE INDEX idx_knowledge_base_hotel ON public.knowledge_base(hotel_id);
CREATE INDEX idx_knowledge_base_category ON public.knowledge_base(category);
CREATE INDEX idx_knowledge_base_active ON public.knowledge_base(active);

-- Notification indexes
CREATE INDEX idx_notifications_user ON public.notifications(user_id);
CREATE INDEX idx_notifications_staff ON public.notifications(staff_id);
CREATE INDEX idx_notifications_read ON public.notifications(read);
CREATE INDEX idx_notifications_type ON public.notifications(type);

-- Room status indexes
CREATE INDEX idx_room_status_room ON public.room_status(room_id);
CREATE INDEX idx_room_status_guest ON public.room_status(current_guest_id);
CREATE INDEX idx_room_status_status ON public.room_status(status);

-- ===================================
-- 8. ROW LEVEL SECURITY POLICIES
-- ===================================

-- Staff profiles (admin access only)
ALTER TABLE public.staff_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff profiles viewable by authenticated users" ON public.staff_profiles
    FOR SELECT USING (auth.role() = 'authenticated');

-- Guest requests (users can see their own, staff can see all)
ALTER TABLE public.guest_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own requests" ON public.guest_requests
    USING (auth.uid() = user_id);
CREATE POLICY "Staff can view all requests" ON public.guest_requests
    FOR SELECT USING (auth.role() = 'authenticated');

-- Menu items (public read, staff write)
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Menu items readable by all" ON public.menu_items
    FOR SELECT USING (true);
CREATE POLICY "Menu items manageable by authenticated users" ON public.menu_items
    USING (auth.role() = 'authenticated');

-- Knowledge base (public read, staff write)
ALTER TABLE public.knowledge_base ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Knowledge base readable by all" ON public.knowledge_base
    FOR SELECT USING (active = true);
CREATE POLICY "Knowledge base manageable by authenticated users" ON public.knowledge_base
    USING (auth.role() = 'authenticated');

-- Notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can see own notifications" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Staff can see staff notifications" ON public.notifications
    FOR SELECT USING (auth.role() = 'authenticated');

-- Room status (authenticated users only)
ALTER TABLE public.room_status ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Room status viewable by authenticated users" ON public.room_status
    FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Room status manageable by authenticated users" ON public.room_status
    USING (auth.role() = 'authenticated');
