// ===================================
// SUPABASE AUTH - USERNAME/PASSWORD ONLY
// ===================================

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!

// Client for frontend (user operations)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    flowType: 'implicit'
  }
})

// Admin client for backend operations (bypasses RLS)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// ===================================
// TYPES
// ===================================

export interface HotelProfile {
  id: string
  username: string
  display_name: string | null
  guest_type: 'standard' | 'vip' | 'platinum' | 'suite'
  room_number: string | null
  check_in_date: string | null
  check_out_date: string | null
  total_stays: number
  loyalty_points: number
  created_at: string
  updated_at: string
}

export interface AuthResult {
  success: boolean
  user?: Record<string, unknown>
  profile?: HotelProfile
  error?: string
}

// ===================================
// AUTH FUNCTIONS
// ===================================

/**
 * Sign up with username and password (no email verification)
 */
export async function signUpWithUsername(
  username: string, 
  password: string,
  guestType: 'standard' | 'vip' | 'platinum' | 'suite' = 'standard'
): Promise<AuthResult> {
  try {
    // Create fake email for Supabase (required field)
    const email = `${username}@limi.hotel`
    
    // Sign up user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          display_name: username,
          guest_type: guestType
        }
      }
    })
    
    if (authError) {
      return { success: false, error: authError.message }
    }
    
    if (!authData.user) {
      return { success: false, error: 'Failed to create user' }
    }
    
    // Create profile (using admin client to bypass RLS during creation)
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: authData.user.id,
        username,
        display_name: username,
        guest_type: guestType,
        total_stays: 1,
        loyalty_points: 100 // Welcome bonus
      })
      .select()
      .single()
    
    if (profileError) {
      // Clean up auth user if profile creation fails
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      return { success: false, error: `Profile creation failed: ${profileError.message}` }
    }
    
    return { 
      success: true, 
      user: authData.user, 
      profile: profileData as HotelProfile 
    }
    
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

/**
 * Sign in with username and password
 */
export async function signInWithUsername(
  username: string, 
  password: string
): Promise<AuthResult> {
  try {
    const email = `${username}@limi.hotel`
    
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    if (authError) {
      return { success: false, error: authError.message }
    }
    
    if (!authData.user) {
      return { success: false, error: 'Login failed' }
    }
    
    // Fetch profile
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single()
    
    if (profileError) {
      return { success: false, error: `Profile fetch failed: ${profileError.message}` }
    }
    
    return { 
      success: true, 
      user: authData.user, 
      profile: profileData as HotelProfile 
    }
    
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

/**
 * Sign out current user
 */
export async function signOut(): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      return { success: false, error: error.message }
    }
    
    return { success: true }
    
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

/**
 * Get current user session and profile
 */
export async function getCurrentUser(): Promise<AuthResult> {
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      return { success: false, error: sessionError.message }
    }
    
    if (!session?.user) {
      return { success: false, error: 'No active session' }
    }
    
    // Fetch profile
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single()
    
    if (profileError) {
      return { success: false, error: `Profile fetch failed: ${profileError.message}` }
    }
    
    return { 
      success: true, 
      user: session.user, 
      profile: profileData as HotelProfile 
    }
    
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

/**
 * Update user profile
 */
export async function updateProfile(
  updates: Partial<Omit<HotelProfile, 'id' | 'created_at' | 'updated_at'>>
): Promise<{ success: boolean; profile?: HotelProfile; error?: string }> {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return { success: false, error: 'Not authenticated' }
    }
    
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)
      .select()
      .single()
    
    if (profileError) {
      return { success: false, error: profileError.message }
    }
    
    return { success: true, profile: profileData as HotelProfile }
    
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

// ===================================
// UTILITY FUNCTIONS
// ===================================

/**
 * Check if username is available
 */
export async function isUsernameAvailable(username: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('username')
      .eq('username', username)
      .single()
    
    // If error and no data, username is available
    return error !== null && !data
    
  } catch {
    return false
  }
}

/**
 * Generate loyalty points based on guest type and stay duration
 */
export function calculateLoyaltyPoints(
  guestType: HotelProfile['guest_type'],
  stayDuration: number = 1
): number {
  const basePoints = stayDuration * 10
  const multipliers = {
    standard: 1,
    vip: 1.5,
    platinum: 2,
    suite: 2.5
  }
  
  return Math.floor(basePoints * multipliers[guestType])
}

/**
 * Determine guest type based on loyalty points
 */
export function determineGuestType(loyaltyPoints: number): HotelProfile['guest_type'] {
  if (loyaltyPoints >= 5000) return 'suite'
  if (loyaltyPoints >= 2500) return 'platinum'
  if (loyaltyPoints >= 1000) return 'vip'
  return 'standard'
}
