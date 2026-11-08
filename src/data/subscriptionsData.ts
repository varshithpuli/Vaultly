import { VaultSpend, VaultCard } from './cardCatalog';

export interface SubscriptionItem {
  id: string;
  merchant: string;
  brand: string;
  category: 'Entertainment' | 'Productivity' | 'Cloud & Storage' | 'Utilities' | 'Fitness' | 'Shopping' | 'Food';
  amount: number;
  cycle: 'Monthly' | 'Quarterly' | 'Yearly';
  cardId: string;
  lastChargeDate: string;
  nextRenewalDate: string;
  status: 'Active' | 'Expiring Soon' | 'Review' | 'Cancelled';
  autoRenew: boolean;
  notes: string;
  cancellationUrl?: string;
  reminderDaysBefore: number;
}

export const KNOWN_SUBSCRIPTION_MERCHANTS: {
  pattern: RegExp;
  brand: string;
  category: SubscriptionItem['category'];
  defaultCycle: SubscriptionItem['cycle'];
  cancellationUrl?: string;
}[] = [
  { pattern: /netflix/i, brand: 'Netflix', category: 'Entertainment', defaultCycle: 'Monthly', cancellationUrl: 'https://www.netflix.com/youraccount' },
  { pattern: /spotify/i, brand: 'Spotify Premium', category: 'Entertainment', defaultCycle: 'Monthly', cancellationUrl: 'https://www.spotify.com/account/subscription' },
  { pattern: /apple.*(icloud|one|music|services)/i, brand: 'Apple Services & iCloud', category: 'Cloud & Storage', defaultCycle: 'Monthly', cancellationUrl: 'https://support.apple.com/en-us/HT202039' },
  { pattern: /google.*(one|workspace|storage|youtube)/i, brand: 'Google One / YouTube', category: 'Cloud & Storage', defaultCycle: 'Monthly', cancellationUrl: 'https://one.google.com/settings' },
  { pattern: /youtube\s*(premium|music)/i, brand: 'YouTube Premium', category: 'Entertainment', defaultCycle: 'Monthly', cancellationUrl: 'https://www.youtube.com/paid_memberships' },
  { pattern: /amazon\s*prime/i, brand: 'Amazon Prime', category: 'Shopping', defaultCycle: 'Yearly', cancellationUrl: 'https://www.amazon.in/mc/manage' },
  { pattern: /(hotstar|disney)/i, brand: 'Disney+ Hotstar', category: 'Entertainment', defaultCycle: 'Yearly', cancellationUrl: 'https://www.hotstar.com/in/my-account' },
  { pattern: /(openai|chatgpt)/i, brand: 'OpenAI ChatGPT Plus', category: 'Productivity', defaultCycle: 'Monthly', cancellationUrl: 'https://chat.openai.com/#settings' },
  { pattern: /github/i, brand: 'GitHub Copilot / Pro', category: 'Productivity', defaultCycle: 'Monthly', cancellationUrl: 'https://github.com/settings/billing' },
  { pattern: /adobe/i, brand: 'Adobe Creative Cloud', category: 'Productivity', defaultCycle: 'Monthly', cancellationUrl: 'https://account.adobe.com/plans' },
  { pattern: /(cult\.fit|gym|fitness)/i, brand: 'Cult.fit Cultpass', category: 'Fitness', defaultCycle: 'Yearly', cancellationUrl: 'https://www.cult.fit' },
  { pattern: /(swiggy\s*one|zomato\s*gold)/i, brand: 'Swiggy One / Dining Gold', category: 'Food', defaultCycle: 'Quarterly', cancellationUrl: 'https://www.swiggy.com' },
  { pattern: /(airtel\s*black|broadband|fiber|jiofiber)/i, brand: 'Broadband & Fiber', category: 'Utilities', defaultCycle: 'Monthly' },
  { pattern: /(tata\s*power|adani\s*electricity|bses)/i, brand: 'Power & Electricity Auto-Debit', category: 'Utilities', defaultCycle: 'Monthly' },
  { pattern: /microsoft\s*(365|office)/i, brand: 'Microsoft 365 Family', category: 'Productivity', defaultCycle: 'Yearly', cancellationUrl: 'https://account.microsoft.com/services' },
];

export const INITIAL_SUBSCRIPTIONS: SubscriptionItem[] = [
  {
    id: 'sub-1',
    merchant: 'Netflix Ultra HD 4K Plan',
    brand: 'Netflix',
    category: 'Entertainment',
    amount: 649,
    cycle: 'Monthly',
    cardId: 'c-sbi-cb',
    lastChargeDate: '2026-11-01',
    nextRenewalDate: '2026-12-01',
    status: 'Active',
    autoRenew: true,
    notes: 'Paid via SBI Cashback (earns 5% online statement cashback).',
    cancellationUrl: 'https://www.netflix.com/youraccount',
    reminderDaysBefore: 3,
  },
  {
    id: 'sub-2',
    merchant: 'Apple iCloud+ 2TB Family',
    brand: 'Apple Services & iCloud',
    category: 'Cloud & Storage',
    amount: 749,
    cycle: 'Monthly',
    cardId: 'c-infinia',
    lastChargeDate: '2026-11-01',
    nextRenewalDate: '2026-12-01',
    status: 'Active',
    autoRenew: true,
    notes: 'Shared with 4 family profile members via Family Sharing.',
    cancellationUrl: 'https://support.apple.com/en-us/HT202039',
    reminderDaysBefore: 3,
  },
  {
    id: 'sub-3',
    merchant: 'OpenAI ChatGPT Plus Subscription',
    brand: 'OpenAI ChatGPT Plus',
    category: 'Productivity',
    amount: 1999,
    cycle: 'Monthly',
    cardId: 'c-infinia',
    lastChargeDate: '2026-10-18',
    nextRenewalDate: '2026-11-18',
    status: 'Expiring Soon',
    autoRenew: true,
    notes: 'Billed in USD ($20 + GST). Zero forex fee via Infinia Global Value program.',
    cancellationUrl: 'https://chat.openai.com/#settings',
    reminderDaysBefore: 3,
  },
  {
    id: 'sub-4',
    merchant: 'Amazon Prime Annual Membership',
    brand: 'Amazon Prime',
    category: 'Shopping',
    amount: 1499,
    cycle: 'Yearly',
    cardId: 'c-sbi-cb',
    lastChargeDate: '2026-07-15',
    nextRenewalDate: '2027-07-15',
    status: 'Active',
    autoRenew: true,
    notes: 'Free 1-day delivery + Prime Video + Prime Music.',
    cancellationUrl: 'https://www.amazon.in/mc/manage',
    reminderDaysBefore: 7,
  },
  {
    id: 'sub-5',
    merchant: 'Airtel Black Fiber 300 Mbps',
    brand: 'Broadband & Fiber',
    category: 'Utilities',
    amount: 2122,
    cycle: 'Monthly',
    cardId: 'c-amex-plat',
    lastChargeDate: '2026-10-25',
    nextRenewalDate: '2026-11-25',
    status: 'Active',
    autoRenew: true,
    notes: 'Standing instruction mandate registered on Amex card.',
    reminderDaysBefore: 5,
  },
  {
    id: 'sub-6',
    merchant: 'Spotify Duo Premium',
    brand: 'Spotify Premium',
    category: 'Entertainment',
    amount: 149,
    cycle: 'Monthly',
    cardId: 'c-sbi-cb',
    lastChargeDate: '2026-10-28',
    nextRenewalDate: '2026-11-28',
    status: 'Active',
    autoRenew: true,
    notes: 'High-bitrate music streaming for 2 accounts.',
    cancellationUrl: 'https://www.spotify.com/account/subscription',
    reminderDaysBefore: 2,
  },
];

export function detectSubscriptionsFromSpends(
  spends: VaultSpend[],
  existingSubs: SubscriptionItem[]
): { detectedCount: number; newSubscriptions: SubscriptionItem[] } {
  const existingNames = new Set(existingSubs.map((s) => s.merchant.toLowerCase()));
  const found: SubscriptionItem[] = [];

  for (const sp of spends) {
    if (sp.isRecurring || KNOWN_SUBSCRIPTION_MERCHANTS.some((m) => m.pattern.test(sp.merchant))) {
      const match = KNOWN_SUBSCRIPTION_MERCHANTS.find((m) => m.pattern.test(sp.merchant));
      const brand = match ? match.brand : sp.merchant;
      const cycle = match ? match.defaultCycle : 'Monthly';
      const cat = match ? match.category : 'Entertainment';

      if (!existingNames.has(sp.merchant.toLowerCase()) && !existingNames.has(brand.toLowerCase())) {
        const lastDate = new Date(sp.date);
        const nextDate = new Date(lastDate);
        if (cycle === 'Monthly') nextDate.setMonth(nextDate.getMonth() + 1);
        else if (cycle === 'Quarterly') nextDate.setMonth(nextDate.getMonth() + 3);
        else nextDate.setFullYear(nextDate.getFullYear() + 1);

        found.push({
          id: 'sub-det-' + Math.random().toString(36).slice(2, 8),
          merchant: sp.merchant,
          brand,
          category: cat,
          amount: sp.amount,
          cycle,
          cardId: sp.cardId,
          lastChargeDate: sp.date,
          nextRenewalDate: nextDate.toISOString().slice(0, 10),
          status: 'Active',
          autoRenew: true,
          notes: `Detected automatically from spend alert of ₹${sp.amount.toLocaleString('en-IN')}.`,
          cancellationUrl: match?.cancellationUrl,
          reminderDaysBefore: 3,
        });
        existingNames.add(brand.toLowerCase());
      }
    }
  }

  return { detectedCount: found.length, newSubscriptions: found };
}
