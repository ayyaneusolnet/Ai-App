// Updated tier management system with new pricing
export interface TierLimits {
  contentGenerations: number;
  invoices: number;
  campaigns: number;
  tasks: number;
  aiQueries: number;
  pdfExports: number;
}

export interface UserTier {
  name: string;
  price: number;
  limits: TierLimits;
  features: string[];
}

export const TIERS: Record<string, UserTier> = {
  free: {
    name: 'Free',
    price: 0,
    limits: {
      contentGenerations: 5,
      invoices: 2,
      campaigns: 1,
      tasks: 10,
      aiQueries: 20,
      pdfExports: 2
    },
    features: [
      'Basic AI content generation',
      'Simple invoice creation',
      'Task management',
      'Email support'
    ]
  },
  starter: {
    name: 'Starter',
    price: 2, // $2 USD
    limits: {
      contentGenerations: 50,
      invoices: 25,
      campaigns: 10,
      tasks: 100,
      aiQueries: 200,
      pdfExports: 25
    },
    features: [
      'Enhanced AI content generation',
      'Professional invoice templates',
      'Campaign analytics',
      'Priority support',
      'Basic team features'
    ]
  },
  professional: {
    name: 'Professional',
    price: 5, // $5 USD
    limits: {
      contentGenerations: -1, // Unlimited
      invoices: -1,
      campaigns: -1,
      tasks: -1,
      aiQueries: -1,
      pdfExports: -1
    },
    features: [
      'Unlimited everything',
      'Advanced analytics',
      'Team collaboration',
      'Custom branding',
      'Portfolio builder',
      'CRM & Lead management',
      '24/7 support'
    ]
  }
};

export class TierManager {
  private static STORAGE_KEY = 'userTierUsage';

  static getCurrentTier(): string {
    return localStorage.getItem('userTier') || 'free';
  }

  static setTier(tier: string) {
    localStorage.setItem('userTier', tier);
    console.log('🎯 Tier updated to:', tier);
  }

  static getUsage(): Record<string, number> {
    const usage = localStorage.getItem(this.STORAGE_KEY);
    return usage ? JSON.parse(usage) : {
      contentGenerations: 0,
      invoices: 0,
      campaigns: 0,
      tasks: 0,
      aiQueries: 0,
      pdfExports: 0
    };
  }

  static updateUsage(type: keyof TierLimits, increment: number = 1) {
    const usage = this.getUsage();
    usage[type] = (usage[type] || 0) + increment;
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(usage));
    console.log(`📊 Usage updated: ${type} = ${usage[type]}`);
  }

  static canUseFeature(type: keyof TierLimits): boolean {
    const currentTier = this.getCurrentTier();
    const tierLimits = TIERS[currentTier].limits;
    const usage = this.getUsage();

    // -1 means unlimited
    if (tierLimits[type] === -1) return true;
    
    const canUse = (usage[type] || 0) < tierLimits[type];
    console.log(`🔒 Feature check: ${type} - ${canUse ? 'ALLOWED' : 'BLOCKED'} (${usage[type] || 0}/${tierLimits[type]})`);
    return canUse;
  }

  static getRemainingUsage(type: keyof TierLimits): number {
    const currentTier = this.getCurrentTier();
    const tierLimits = TIERS[currentTier].limits;
    const usage = this.getUsage();

    if (tierLimits[type] === -1) return -1; // Unlimited
    
    return Math.max(0, tierLimits[type] - (usage[type] || 0));
  }

  static resetMonthlyUsage() {
    // This would typically be called by a cron job or when a new month starts
    localStorage.removeItem(this.STORAGE_KEY);
    console.log('🔄 Monthly usage reset');
  }
}