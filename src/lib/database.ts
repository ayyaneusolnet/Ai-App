import { supabase, isDemoMode, auth } from './supabase'

// Demo data storage for when database is not connected
let demoData = {
  invoices: [
    { 
      id: '1', 
      invoice_number: 'INV-001', 
      client_name: 'Acme Corp', 
      client_email: 'contact@acme.com',
      amount: 2500, 
      tax_amount: 250,
      tax_rate: 10,
      status: 'paid', 
      created_at: '2024-01-15', 
      due_date: '2024-02-15', 
      items: [
        { description: 'Web Development', quantity: 1, rate: 2000, amount: 2000 },
        { description: 'SEO Optimization', quantity: 1, rate: 500, amount: 500 }
      ],
      company_info: {
        name: 'Your Business',
        address: '123 Business St',
        email: 'hello@yourbusiness.com',
        phone: '+1 300 1234567'
      },
      notes: 'Thank you for your business!',
      terms: 'Payment due within 30 days'
    }
  ],
  campaigns: [],
  tasks: [],
  portfolios: [],
  leads: [],
  payments: [],
  posts: []
}

export const database = {
  // Users
  async getCurrentUser() {
    if (isDemoMode) {
      const demoUser = localStorage.getItem('demoUser')
      return demoUser ? { data: JSON.parse(demoUser), error: null } : { data: null, error: null }
    }
    
    try {
      console.log('🔍 Getting current user...')
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error) {
        console.error('❌ Auth error:', error)
        return { data: null, error }
      }
      
      if (!user) {
        console.log('⚠️ No authenticated user found')
        return { data: null, error: 'No user found' }
      }
      
      console.log('✅ User authenticated:', user.id)
      
      // Get user profile from database
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()
      
      if (profileError && profileError.code !== 'PGRST116') {
        console.error('❌ Profile fetch error:', profileError)
        return { data: null, error: profileError }
      }
      
      if (!profile) {
        console.log('📝 Creating new user profile...')
        // Create user profile if it doesn't exist
        const newProfile = {
          id: user.id,
          email: user.email,
          name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
          tier: 'free',
          created_at: new Date().toISOString()
        }
        
        const { data: createdProfile, error: createError } = await supabase
          .from('users')
          .insert(newProfile)
          .select()
          .single()
        
        if (createError) {
          console.error('❌ Profile creation error:', createError)
          return { data: null, error: createError }
        }
        
        console.log('✅ User profile created:', createdProfile)
        return { data: createdProfile, error: null }
      }
      
      console.log('✅ User profile found:', profile)
      return { data: profile, error: null }
    } catch (error) {
      console.error('❌ Get current user error:', error)
      return { data: null, error }
    }
  },

  async updateUserProfile(userId: string, updates: any) {
    if (isDemoMode) {
      const demoUser = JSON.parse(localStorage.getItem('demoUser') || '{}')
      const updatedUser = { ...demoUser, ...updates, updated_at: new Date().toISOString() }
      localStorage.setItem('demoUser', JSON.stringify(updatedUser))
      return { data: updatedUser, error: null }
    }
    
    try {
      console.log('🔄 Updating user profile:', { userId, updates })
      const { data, error } = await supabase
        .from('users')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', userId)
        .select()
        .single()
      
      if (error) {
        console.error('❌ Update profile error:', error)
        return { data: null, error }
      }
      
      console.log('✅ Profile updated successfully:', data)
      return { data, error: null }
    } catch (error) {
      console.error('❌ Update user profile error:', error)
      return { data: null, error }
    }
  },

  // Invoices
  async getInvoices(userId?: string) {
    if (isDemoMode) {
      return { data: demoData.invoices, error: null }
    }
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        console.error('❌ No authenticated user for invoices')
        return { data: [], error: 'Not authenticated' }
      }
      
      console.log('📄 Fetching invoices for user:', user.id)
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('❌ Fetch invoices error:', error)
        return { data: [], error }
      }
      
      console.log('✅ Invoices fetched:', data?.length || 0)
      return { data: data || [], error: null }
    } catch (error) {
      console.error('❌ Get invoices error:', error)
      return { data: [], error }
    }
  },

  async createInvoice(invoice: any) {
    if (isDemoMode) {
      const newInvoice = { 
        ...invoice, 
        id: Date.now().toString(), 
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      demoData.invoices.unshift(newInvoice)
      return { data: newInvoice, error: null }
    }
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        console.error('❌ No authenticated user for invoice creation')
        return { data: null, error: 'User not authenticated' }
      }
      
      const invoiceData = {
        ...invoice,
        user_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      console.log('💾 Creating invoice:', invoiceData)
      const { data, error } = await supabase
        .from('invoices')
        .insert(invoiceData)
        .select()
        .single()
      
      if (error) {
        console.error('❌ Create invoice error:', error)
        return { data: null, error }
      }
      
      console.log('✅ Invoice created successfully:', data)
      return { data, error: null }
    } catch (error) {
      console.error('❌ Create invoice error:', error)
      return { data: null, error }
    }
  },

  // Campaigns
  async getCampaigns(userId?: string) {
    if (isDemoMode) {
      return { data: demoData.campaigns, error: null }
    }
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        console.error('❌ No authenticated user for campaigns')
        return { data: [], error: 'Not authenticated' }
      }
      
      console.log('📢 Fetching campaigns for user:', user.id)
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('❌ Fetch campaigns error:', error)
        return { data: [], error }
      }
      
      console.log('✅ Campaigns fetched:', data?.length || 0)
      return { data: data || [], error: null }
    } catch (error) {
      console.error('❌ Get campaigns error:', error)
      return { data: [], error }
    }
  },

  async createCampaign(campaign: any) {
    if (isDemoMode) {
      const newCampaign = { 
        ...campaign, 
        id: Date.now().toString(), 
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        status: campaign.status || 'draft'
      }
      demoData.campaigns.unshift(newCampaign)
      return { data: newCampaign, error: null }
    }
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        console.error('❌ No authenticated user for campaign creation')
        return { data: null, error: 'User not authenticated' }
      }
      
      const campaignData = {
        ...campaign,
        user_id: user.id,
        status: campaign.status || 'draft',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      console.log('💾 Creating campaign:', campaignData)
      const { data, error } = await supabase
        .from('campaigns')
        .insert(campaignData)
        .select()
        .single()
      
      if (error) {
        console.error('❌ Create campaign error:', error)
        return { data: null, error }
      }
      
      console.log('✅ Campaign created successfully:', data)
      return { data, error: null }
    } catch (error) {
      console.error('❌ Create campaign error:', error)
      return { data: null, error }
    }
  },

  // Tasks
  async getTasks(userId?: string) {
    if (isDemoMode) {
      return { data: demoData.tasks, error: null }
    }
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        console.error('❌ No authenticated user for tasks')
        return { data: [], error: 'Not authenticated' }
      }
      
      console.log('📋 Fetching tasks for user:', user.id)
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('❌ Fetch tasks error:', error)
        return { data: [], error }
      }
      
      console.log('✅ Tasks fetched:', data?.length || 0)
      return { data: data || [], error: null }
    } catch (error) {
      console.error('❌ Get tasks error:', error)
      return { data: [], error }
    }
  },

  async createTask(task: any) {
    if (isDemoMode) {
      const newTask = { 
        ...task, 
        id: Date.now().toString(), 
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      demoData.tasks.unshift(newTask)
      return { data: newTask, error: null }
    }
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        console.error('❌ No authenticated user for task creation')
        return { data: null, error: 'User not authenticated' }
      }
      
      const taskData = {
        ...task,
        user_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      console.log('💾 Creating task:', taskData)
      const { data, error } = await supabase
        .from('tasks')
        .insert(taskData)
        .select()
        .single()
      
      if (error) {
        console.error('❌ Create task error:', error)
        return { data: null, error }
      }
      
      console.log('✅ Task created successfully:', data)
      return { data, error: null }
    } catch (error) {
      console.error('❌ Create task error:', error)
      return { data: null, error }
    }
  },

  async updateTask(id: string, updates: any) {
    if (isDemoMode) {
      const index = demoData.tasks.findIndex(task => task.id === id)
      if (index !== -1) {
        demoData.tasks[index] = { 
          ...demoData.tasks[index], 
          ...updates, 
          updated_at: new Date().toISOString() 
        }
        return { data: demoData.tasks[index], error: null }
      }
      return { data: null, error: 'Task not found' }
    }
    
    try {
      console.log('🔄 Updating task:', { id, updates })
      const { data, error } = await supabase
        .from('tasks')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()
      
      if (error) {
        console.error('❌ Update task error:', error)
        return { data: null, error }
      }
      
      console.log('✅ Task updated successfully:', data)
      return { data, error: null }
    } catch (error) {
      console.error('❌ Update task error:', error)
      return { data: null, error }
    }
  },

  // Business Portfolios
  async getPortfolio(userId: string) {
    if (isDemoMode) {
      const portfolio = demoData.portfolios.find(p => p.user_id === userId)
      return { data: portfolio, error: null }
    }
    
    try {
      console.log('🌐 Fetching portfolio for user:', userId)
      const { data, error } = await supabase
        .from('portfolios')
        .select('*')
        .eq('user_id', userId)
        .single()
      
      if (error && error.code !== 'PGRST116') {
        console.error('❌ Get portfolio error:', error)
        return { data: null, error }
      }
      
      console.log('✅ Portfolio fetched:', data ? 'Found' : 'Not found')
      return { data, error: null }
    } catch (error) {
      console.error('❌ Get portfolio error:', error)
      return { data: null, error }
    }
  },

  async createOrUpdatePortfolio(portfolioData: any) {
    if (isDemoMode) {
      const existingIndex = demoData.portfolios.findIndex(p => p.user_id === portfolioData.user_id)
      const portfolio = {
        ...portfolioData,
        id: existingIndex >= 0 ? demoData.portfolios[existingIndex].id : Date.now().toString(),
        updated_at: new Date().toISOString()
      }
      
      if (existingIndex >= 0) {
        demoData.portfolios[existingIndex] = portfolio
      } else {
        portfolio.created_at = new Date().toISOString()
        demoData.portfolios.push(portfolio)
      }
      
      return { data: portfolio, error: null }
    }
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        console.error('❌ No authenticated user for portfolio')
        return { data: null, error: 'User not authenticated' }
      }
      
      const portfolio = {
        ...portfolioData,
        user_id: user.id,
        updated_at: new Date().toISOString()
      }
      
      console.log('💾 Creating/updating portfolio:', portfolio)
      const { data, error } = await supabase
        .from('portfolios')
        .upsert(portfolio, { onConflict: 'user_id' })
        .select()
        .single()
      
      if (error) {
        console.error('❌ Portfolio upsert error:', error)
        return { data: null, error }
      }
      
      console.log('✅ Portfolio saved successfully:', data)
      return { data, error: null }
    } catch (error) {
      console.error('❌ Create/update portfolio error:', error)
      return { data: null, error }
    }
  },

  // CRM & Leads
  async getLeads(userId?: string) {
    if (isDemoMode) {
      return { data: demoData.leads, error: null }
    }
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        console.error('❌ No authenticated user for leads')
        return { data: [], error: 'Not authenticated' }
      }
      
      console.log('👥 Fetching leads for user:', user.id)
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('❌ Fetch leads error:', error)
        return { data: [], error }
      }
      
      console.log('✅ Leads fetched:', data?.length || 0)
      return { data: data || [], error: null }
    } catch (error) {
      console.error('❌ Get leads error:', error)
      return { data: [], error }
    }
  },

  async createLead(lead: any) {
    if (isDemoMode) {
      const newLead = { 
        ...lead, 
        id: Date.now().toString(), 
        created_at: new Date().toISOString(),
        status: lead.status || 'new'
      }
      demoData.leads.unshift(newLead)
      return { data: newLead, error: null }
    }
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        console.error('❌ No authenticated user for lead creation')
        return { data: null, error: 'User not authenticated' }
      }
      
      const leadData = {
        ...lead,
        user_id: user.id,
        status: lead.status || 'new',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      console.log('💾 Creating lead:', leadData)
      const { data, error } = await supabase
        .from('leads')
        .insert(leadData)
        .select()
        .single()
      
      if (error) {
        console.error('❌ Create lead error:', error)
        return { data: null, error }
      }
      
      console.log('✅ Lead created successfully:', data)
      return { data, error: null }
    } catch (error) {
      console.error('❌ Create lead error:', error)
      return { data: null, error }
    }
  },

  async updateLead(id: string, updates: any) {
    if (isDemoMode) {
      const index = demoData.leads.findIndex(lead => lead.id === id)
      if (index !== -1) {
        demoData.leads[index] = { 
          ...demoData.leads[index], 
          ...updates, 
          updated_at: new Date().toISOString() 
        }
        return { data: demoData.leads[index], error: null }
      }
      return { data: null, error: 'Lead not found' }
    }
    
    try {
      console.log('🔄 Updating lead:', { id, updates })
      const { data, error } = await supabase
        .from('leads')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()
      
      if (error) {
        console.error('❌ Update lead error:', error)
        return { data: null, error }
      }
      
      console.log('✅ Lead updated successfully:', data)
      return { data, error: null }
    } catch (error) {
      console.error('❌ Update lead error:', error)
      return { data: null, error }
    }
  },

  // Posts
  async getPosts(userId?: string) {
    if (isDemoMode) {
      return { data: demoData.posts, error: null }
    }
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        console.error('❌ No authenticated user for posts')
        return { data: [], error: 'Not authenticated' }
      }
      
      console.log('📝 Fetching posts for user:', user.id)
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('❌ Fetch posts error:', error)
        return { data: [], error }
      }
      
      console.log('✅ Posts fetched:', data?.length || 0)
      return { data: data || [], error: null }
    } catch (error) {
      console.error('❌ Get posts error:', error)
      return { data: [], error }
    }
  },

  async createPost(post: any) {
    if (isDemoMode) {
      const newPost = { 
        ...post, 
        id: Date.now().toString(), 
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      demoData.posts.push(newPost)
      return { data: newPost, error: null }
    }
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        console.error('❌ No authenticated user for post creation')
        return { data: null, error: 'User not authenticated' }
      }
      
      const postData = {
        ...post,
        user_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      console.log('💾 Creating post:', postData)
      const { data, error } = await supabase
        .from('posts')
        .insert(postData)
        .select()
        .single()
      
      if (error) {
        console.error('❌ Create post error:', error)
        return { data: null, error }
      }
      
      console.log('✅ Post created successfully:', data)
      return { data, error: null }
    } catch (error) {
      console.error('❌ Create post error:', error)
      return { data: null, error }
    }
  },

  // Payments
  async getPayments(userId?: string) {
    if (isDemoMode) {
      return { data: demoData.payments, error: null }
    }
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        console.error('❌ No authenticated user for payments')
        return { data: [], error: 'Not authenticated' }
      }
      
      console.log('💳 Fetching payments for user:', user.id)
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('❌ Fetch payments error:', error)
        return { data: [], error }
      }
      
      console.log('✅ Payments fetched:', data?.length || 0)
      return { data: data || [], error: null }
    } catch (error) {
      console.error('❌ Get payments error:', error)
      return { data: [], error }
    }
  },

  async createPayment(payment: any) {
    if (isDemoMode) {
      const newPayment = { 
        ...payment, 
        id: Date.now().toString(), 
        created_at: new Date().toISOString()
      }
      demoData.payments.unshift(newPayment)
      return { data: newPayment, error: null }
    }
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        console.error('❌ No authenticated user for payment creation')
        return { data: null, error: 'User not authenticated' }
      }
      
      const paymentData = {
        ...payment,
        user_id: user.id,
        created_at: new Date().toISOString()
      }
      
      console.log('💾 Creating payment:', paymentData)
      const { data, error } = await supabase
        .from('payments')
        .insert(paymentData)
        .select()
        .single()
      
      if (error) {
        console.error('❌ Create payment error:', error)
        return { data: null, error }
      }
      
      console.log('✅ Payment created successfully:', data)
      return { data, error: null }
    } catch (error) {
      console.error('❌ Create payment error:', error)
      return { data: null, error }
    }
  },

  // Stats
  async getStats(userId?: string) {
    if (isDemoMode) {
      const totalRevenue = demoData.invoices
        .filter(inv => inv.status === 'paid')
        .reduce((sum, inv) => sum + inv.amount, 0)
      
      const completedTasks = demoData.tasks.filter(task => task.status === 'completed').length
      const activeCampaigns = demoData.campaigns.filter(camp => camp.status === 'active').length
      const totalLeads = demoData.leads.length
      
      return { 
        data: {
          revenue: totalRevenue,
          campaigns: activeCampaigns,
          tasks: completedTasks,
          leads: totalLeads,
          team_members: demoData.team_members.length
        }, 
        error: null 
      }
    }
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        console.error('❌ No authenticated user for stats')
        return { data: null, error: 'Not authenticated' }
      }
      
      console.log('📊 Calculating stats for user:', user.id)
      
      // Get all data for stats calculation
      const [invoicesResult, campaignsResult, tasksResult, leadsResult, teamResult] = await Promise.all([
        this.getInvoices(user.id),
        this.getCampaigns(user.id),
        this.getTasks(user.id),
        this.getLeads(user.id),
        this.getTeamMembers(user.id)
      ])
      
      const totalRevenue = invoicesResult.data?.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + (inv.amount || 0), 0) || 0
      const completedTasks = tasksResult.data?.filter(task => task.status === 'completed').length || 0
      const activeCampaigns = campaignsResult.data?.filter(camp => camp.status === 'active').length || 0
      
      const stats = {
        revenue: totalRevenue,
        campaigns: activeCampaigns,
        tasks: completedTasks,
        leads: leadsResult.data?.length || 0,
        team_members: teamResult.data?.length || 0
      }
      
      console.log('✅ Stats calculated:', stats)
      return { data: stats, error: null }
    } catch (error) {
      console.error('❌ Get stats error:', error)
      return { data: null, error }
    }
  },

  // Admin functions
  async getAllUsers() {
    if (isDemoMode) {
      return { data: [JSON.parse(localStorage.getItem('demoUser') || '{}')], error: null }
    }
    
    try {
      console.log('👥 Fetching all users (admin)')
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('❌ Get all users error:', error)
        return { data: [], error }
      }
      
      console.log('✅ All users fetched:', data?.length || 0)
      return { data: data || [], error: null }
    } catch (error) {
      console.error('❌ Get all users error:', error)
      return { data: [], error }
    }
  },

  async getAllPayments() {
    if (isDemoMode) {
      return { data: demoData.payments, error: null }
    }
    
    try {
      console.log('💳 Fetching all payments (admin)')
      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          users (
            name,
            email
          )
        `)
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('❌ Get all payments error:', error)
        return { data: [], error }
      }
      
      console.log('✅ All payments fetched:', data?.length || 0)
      return { data: data || [], error: null }
    } catch (error) {
      console.error('❌ Get all payments error:', error)
      return { data: [], error }
    }
  },

  async updatePaymentStatus(paymentId: string, status: string) {
    if (isDemoMode) {
      const index = demoData.payments.findIndex(p => p.id === paymentId)
      if (index !== -1) {
        demoData.payments[index].status = status
        return { data: demoData.payments[index], error: null }
      }
      return { data: null, error: 'Payment not found' }
    }
    
    try {
      console.log('🔄 Updating payment status:', { paymentId, status })
      const { data, error } = await supabase
        .from('payments')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', paymentId)
        .select()
        .single()
      
      if (error) {
        console.error('❌ Update payment status error:', error)
        return { data: null, error }
      }
      
      console.log('✅ Payment status updated:', data)
      return { data, error: null }
    } catch (error) {
      console.error('❌ Update payment status error:', error)
      return { data: null, error }
    }
  }
}