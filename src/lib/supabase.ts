import { createClient } from '@supabase/supabase-js'

// Supabase configuration with proper error handling
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// Check if we have valid Supabase credentials
export const hasValidSupabaseConfig = supabaseUrl && supabaseAnonKey && 
  supabaseUrl !== 'your-supabase-project-url' && 
  supabaseAnonKey !== 'your-supabase-anon-key' &&
  supabaseUrl.includes('supabase.co')

export const supabase = hasValidSupabaseConfig 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

// Check if we're in demo mode (no real Supabase connection)
export const isDemoMode = !hasValidSupabaseConfig

console.log('🔗 Supabase Configuration:', { 
  hasValidConfig: hasValidSupabaseConfig, 
  isDemoMode, 
  url: supabaseUrl ? `${supabaseUrl.substring(0, 20)}...` : 'Missing',
  key: supabaseAnonKey ? 'Set' : 'Missing'
})

// Enhanced authentication helpers with proper error handling
export const auth = {
  async signUp(email: string, password: string, userData: any) {
    if (isDemoMode || !supabase) {
      console.log('📱 Demo mode: Simulating signup')
      const user = {
        id: `demo-${Date.now()}`,
        email,
        ...userData,
        tier: 'free',
        created_at: new Date().toISOString()
      }
      localStorage.setItem('demoUser', JSON.stringify(user))
      return { data: { user }, error: null }
    }

    try {
      console.log('🔐 Attempting Supabase signup for:', email)
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
      })

      console.log('✅ Signup result:', { success: !!data.user, error: error?.message })

      if (data.user && !error) {
        // Create user profile in our users table
        console.log('👤 Creating user profile in database')
        const { data: profile, error: profileError } = await supabase.from('users').insert({
          id: data.user.id,
          email: data.user.email,
          name: userData.name,
          tier: 'free',
          created_at: new Date().toISOString()
        }).select().single()
        
        if (profileError) {
          console.error('❌ Profile creation error:', profileError)
        } else {
          console.log('✅ User profile created successfully:', profile)
        }
      }

      return { data, error }
    } catch (error) {
      console.error('❌ Signup error:', error)
      return { data: null, error: error as any }
    }
  },

  async signIn(email: string, password: string) {
    if (isDemoMode || !supabase) {
      console.log('📱 Demo mode: Simulating signin')
      const demoUser = localStorage.getItem('demoUser')
      if (demoUser) {
        return { data: { user: JSON.parse(demoUser) }, error: null }
      }
      // Create demo user if doesn't exist
      const user = {
        id: `demo-${Date.now()}`,
        email,
        name: email.split('@')[0],
        tier: 'free',
        created_at: new Date().toISOString()
      }
      localStorage.setItem('demoUser', JSON.stringify(user))
      return { data: { user }, error: null }
    }

    try {
      console.log('🔐 Attempting Supabase signin for:', email)
      const result = await supabase.auth.signInWithPassword({ email, password })
      console.log('✅ Signin result:', { success: !!result.data.user, error: result.error?.message })
      
      // If signin successful, ensure user profile exists
      if (result.data.user && !result.error) {
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', result.data.user.id)
          .single()
        
        if (!profile) {
          console.log('👤 Creating missing user profile...')
          await supabase.from('users').insert({
            id: result.data.user.id,
            email: result.data.user.email,
            name: result.data.user.user_metadata?.name || result.data.user.email?.split('@')[0] || 'User',
            tier: 'free',
            created_at: new Date().toISOString()
          })
        }
      }
      
      return result
    } catch (error) {
      console.error('❌ Signin error:', error)
      return { data: null, error: error as any }
    }
  },

  async signOut() {
    if (isDemoMode || !supabase) {
      localStorage.removeItem('demoUser')
      return { error: null }
    }
    return await supabase.auth.signOut()
  },

  async getUser() {
    if (isDemoMode || !supabase) {
      const demoUser = localStorage.getItem('demoUser')
      return demoUser ? { data: { user: JSON.parse(demoUser) }, error: null } : { data: { user: null }, error: null }
    }
    return await supabase.auth.getUser()
  },

  async getCurrentSession() {
    if (isDemoMode || !supabase) {
      const demoUser = localStorage.getItem('demoUser')
      return demoUser ? { data: { session: { user: JSON.parse(demoUser) } }, error: null } : { data: { session: null }, error: null }
    }
    return await supabase.auth.getSession()
  }
}

// Email service
export const emailService = {
  async sendWelcomeEmail(userEmail: string, userName: string) {
    console.log(`📧 Welcome email would be sent to ${userEmail}`)
    return { success: true }
  },

  async sendPaymentConfirmation(userEmail: string, paymentData: any) {
    console.log(`💳 Payment confirmation would be sent to ${userEmail}`)
    return { success: true }
  }
}

// Real-time subscriptions
export const subscriptions = {
  subscribeToUserUpdates(userId: string, callback: (payload: any) => void) {
    if (isDemoMode || !supabase) return () => {}
    
    const subscription = supabase
      .channel('user-updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'users', filter: `id=eq.${userId}` },
        callback
      )
      .subscribe()
    
    return () => subscription.unsubscribe()
  },

  subscribeToPayments(userId: string, callback: (payload: any) => void) {
    if (isDemoMode || !supabase) return () => {}
    
    const subscription = supabase
      .channel('payment-updates')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'payments', filter: `user_id=eq.${userId}` },
        callback
      )
      .subscribe()
    
    return () => subscription.unsubscribe()
  }
}

// Database functions
export const dbFunctions = {
  async updateUserTier(userId: string, newTier: string) {
    if (isDemoMode || !supabase) {
      localStorage.setItem('userTier', newTier)
      const demoUser = JSON.parse(localStorage.getItem('demoUser') || '{}')
      demoUser.tier = newTier
      localStorage.setItem('demoUser', JSON.stringify(demoUser))
      return { data: { tier: newTier }, error: null }
    }
    
    try {
      console.log('🔄 Updating user tier:', { userId, newTier })
      return await supabase
        .from('users')
        .update({ tier: newTier, updated_at: new Date().toISOString() })
        .eq('id', userId)
        .select()
        .single()
    } catch (error) {
      console.error('❌ Update tier error:', error)
      return { data: null, error: error as any }
    }
  },

  async getUserProfile(userId: string) {
    if (isDemoMode || !supabase) {
      const demoUser = localStorage.getItem('demoUser')
      return demoUser ? { data: JSON.parse(demoUser), error: null } : { data: null, error: 'User not found' }
    }
    
    try {
      return await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()
    } catch (error) {
      console.error('❌ Get profile error:', error)
      return { data: null, error: error as any }
    }
  },

  async updateUserProfile(userId: string, updates: any) {
    if (isDemoMode || !supabase) {
      const demoUser = JSON.parse(localStorage.getItem('demoUser') || '{}')
      const updatedUser = { ...demoUser, ...updates, updated_at: new Date().toISOString() }
      localStorage.setItem('demoUser', JSON.stringify(updatedUser))
      return { data: updatedUser, error: null }
    }
    
    try {
      return await supabase
        .from('users')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', userId)
        .select()
        .single()
    } catch (error) {
      console.error('❌ Update profile error:', error)
      return { data: null, error: error as any }
    }
  }
}