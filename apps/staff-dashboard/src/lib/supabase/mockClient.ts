import { createClient } from '@supabase/supabase-js';

import type { Database } from '@/lib/types/supabase';

const mockUrl = 'https://example.supabase.mock';
const mockKey = 'mock-key';

export const createMockSupabaseClient = () => createClient<Database>(mockUrl, mockKey);
