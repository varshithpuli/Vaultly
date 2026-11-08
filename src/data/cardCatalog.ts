import { DocumentAttachment, generateSampleCardFrontSvg, generateSampleCardBackSvg } from './attachmentSamples';

export interface LoungeEntitlement {
  id: string;
  scope: 'Domestic' | 'International';
  period: 'Quarter' | 'Year';
  entitled: number;
  used: number;
  minSpend?: number;
  spendWindow?: 'None (Free)' | 'Previous Quarter' | 'Previous Calendar Month' | 'Previous 3 Months';
  qualifyingSpendAchieved?: number;
  program?: 'Priority Pass' | 'Dreamfolks' | 'LoungeKey' | 'Visa Airport Companion' | 'Mastercard Lounge' | 'RuPay Lounge' | 'Centurion' | 'Airport Lounge';
  guestAccess?: string;
  nextResetDate?: string;
}

export interface CardCatalogEntry {
  id: string;
  bank: string;
  name: string;
  network: 'Visa' | 'Mastercard' | 'RuPay' | 'Amex' | 'Diners';
  variant: string;
  color: string;
  annualFee: number;
  feeWaiverSpend: number;
  baseRewardPct: number;
  categoryBoosts: Partial<Record<SpendCategory, { ratePct: number; note: string }>>;
  lounges: Omit<LoungeEntitlement, 'id' | 'used'>[];
  helpline: string;
  rewardCurrency: string;
  pointValueInr: number;
}

export type SpendCategory =
  | 'Shopping'
  | 'Food & dining'
  | 'Fuel'
  | 'Travel'
  | 'Groceries'
  | 'Bills & utilities'
  | 'Health'
  | 'Entertainment'
  | 'Other';

export const SPEND_CATEGORIES: SpendCategory[] = [
  'Shopping',
  'Food & dining',
  'Fuel',
  'Travel',
  'Groceries',
  'Bills & utilities',
  'Health',
  'Entertainment',
  'Other',
];

export const BANK_COLORS: Record<string, string> = {
  HDFC: '#1d4f91',
  ICICI: '#b94a12',
  Axis: '#8a1643',
  SBI: '#1864ab',
  Kotak: '#b91c1c',
  IndusInd: '#7f1d1d',
  'IDFC First': '#6b1d2f',
  Amex: '#1e6091',
  RBL: '#1e3a8a',
  Federal: '#0f4c81',
  HSBC: '#db0011',
  AU: '#e11d48',
};

export const OFFLINE_CARD_CATALOG: CardCatalogEntry[] = [
  {
    id: 'hdfc-infinia',
    bank: 'HDFC',
    name: 'Infinia Metal',
    network: 'Visa',
    variant: 'Infinite',
    color: '#172554',
    annualFee: 12500,
    feeWaiverSpend: 1000000,
    baseRewardPct: 3.3,
    categoryBoosts: {
      Travel: { ratePct: 16.5, note: '5X SmartBuy flights & hotels (1 RP = ₹1)' },
      Shopping: { ratePct: 9.9, note: '3X SmartBuy vouchers (Amazon, Myntra)' },
      'Food & dining': { ratePct: 6.6, note: '2X weekend dining + Swiggy Dineout' },
    },
    lounges: [
      {
        scope: 'Domestic',
        period: 'Quarter',
        entitled: 12,
        minSpend: 0,
        spendWindow: 'None (Free)',
        qualifyingSpendAchieved: 0,
        program: 'Priority Pass',
        guestAccess: 'Unlimited guest visits complimentary with Priority Pass',
        nextResetDate: '2026-12-31',
      },
      {
        scope: 'International',
        period: 'Year',
        entitled: 12,
        minSpend: 0,
        spendWindow: 'None (Free)',
        qualifyingSpendAchieved: 0,
        program: 'Priority Pass',
        guestAccess: 'Unlimited international lounge visits with guest',
        nextResetDate: '2026-12-31',
      },
    ],
    helpline: '18002663310',
    rewardCurrency: 'Reward Points',
    pointValueInr: 1.0,
  },
  {
    id: 'hdfc-regalia-gold',
    bank: 'HDFC',
    name: 'Regalia Gold',
    network: 'Mastercard',
    variant: 'World',
    color: '#1d4f91',
    annualFee: 2500,
    feeWaiverSpend: 400000,
    baseRewardPct: 1.33,
    categoryBoosts: {
      Shopping: { ratePct: 6.65, note: '5X at Myntra, Nykaa, Marks & Spencer, Reliance Digital' },
      Travel: { ratePct: 6.65, note: '5X via SmartBuy portal' },
    },
    lounges: [
      {
        scope: 'Domestic',
        period: 'Quarter',
        entitled: 3,
        minSpend: 0,
        spendWindow: 'None (Free)',
        qualifyingSpendAchieved: 0,
        program: 'Mastercard Lounge',
        guestAccess: 'Cardholder only',
        nextResetDate: '2026-12-31',
      },
      {
        scope: 'International',
        period: 'Year',
        entitled: 6,
        minSpend: 0,
        spendWindow: 'None (Free)',
        qualifyingSpendAchieved: 0,
        program: 'Priority Pass',
        guestAccess: 'Complimentary via Priority Pass for primary holder',
        nextResetDate: '2027-03-31',
      },
    ],
    helpline: '18002664332',
    rewardCurrency: 'Reward Points',
    pointValueInr: 0.5,
  },
  {
    id: 'hdfc-millennia',
    bank: 'HDFC',
    name: 'Millennia',
    network: 'Visa',
    variant: 'Signature',
    color: '#1e3a8a',
    annualFee: 1000,
    feeWaiverSpend: 100000,
    baseRewardPct: 1.0,
    categoryBoosts: {
      Shopping: { ratePct: 5.0, note: '5% CashPoints on Amazon, Flipkart, Myntra' },
      'Food & dining': { ratePct: 5.0, note: '5% CashPoints on Swiggy & Zomato' },
      Entertainment: { ratePct: 5.0, note: '5% CashPoints on BookMyShow & SonyLIV' },
    },
    lounges: [
      {
        scope: 'Domestic',
        period: 'Quarter',
        entitled: 1,
        minSpend: 100000,
        spendWindow: 'Previous Quarter',
        qualifyingSpendAchieved: 68500,
        program: 'Visa Airport Companion',
        guestAccess: 'Paid per companion',
        nextResetDate: '2026-12-31',
      },
    ],
    helpline: '18002664332',
    rewardCurrency: 'CashPoints',
    pointValueInr: 1.0,
  },
  {
    id: 'hdfc-tata-neu-inf',
    bank: 'HDFC',
    name: 'Tata Neu Infinity',
    network: 'RuPay',
    variant: 'Select',
    color: '#3b0764',
    annualFee: 1499,
    feeWaiverSpend: 300000,
    baseRewardPct: 1.5,
    categoryBoosts: {
      Shopping: { ratePct: 10.0, note: '10% NeuCoins on Tata Neu, BigBasket, Croma, Tata CliQ' },
      'Bills & utilities': { ratePct: 5.0, note: '5% NeuCoins on Tata Pay utility bill payments' },
      Travel: { ratePct: 10.0, note: '10% on Air India & IHCL Taj bookings via Neu' },
    },
    lounges: [
      {
        scope: 'Domestic',
        period: 'Quarter',
        entitled: 2,
        minSpend: 50000,
        spendWindow: 'Previous Quarter',
        qualifyingSpendAchieved: 48000,
        program: 'RuPay Lounge',
        guestAccess: 'Primary cardholder',
        nextResetDate: '2026-12-31',
      },
      {
        scope: 'International',
        period: 'Year',
        entitled: 4,
        minSpend: 0,
        spendWindow: 'None (Free)',
        qualifyingSpendAchieved: 0,
        program: 'Priority Pass',
        guestAccess: 'Cardholder only',
        nextResetDate: '2027-03-31',
      },
    ],
    helpline: '18002664332',
    rewardCurrency: 'NeuCoins',
    pointValueInr: 1.0,
  },
  {
    id: 'sbi-cashback',
    bank: 'SBI',
    name: 'Cashback',
    network: 'Visa',
    variant: 'Signature',
    color: '#1864ab',
    annualFee: 999,
    feeWaiverSpend: 200000,
    baseRewardPct: 1.0,
    categoryBoosts: {
      Shopping: { ratePct: 5.0, note: '5% flat cashback on all online merchants (up to ₹5,000/mo)' },
      'Food & dining': { ratePct: 5.0, note: '5% online food delivery cashback' },
      Groceries: { ratePct: 5.0, note: '5% online grocery orders (Blinkit, Zepto, BigBasket)' },
      Entertainment: { ratePct: 5.0, note: '5% on online ticket & streaming merchants' },
    },
    lounges: [],
    helpline: '18601801290',
    rewardCurrency: 'Statement Cashback',
    pointValueInr: 1.0,
  },
  {
    id: 'sbi-elite',
    bank: 'SBI',
    name: 'Card Elite',
    network: 'Visa',
    variant: 'Signature',
    color: '#0c4a6e',
    annualFee: 4999,
    feeWaiverSpend: 1000000,
    baseRewardPct: 2.0,
    categoryBoosts: {
      Entertainment: { ratePct: 8.0, note: 'Free movie tickets worth ₹6,000 every year on BookMyShow' },
      'Food & dining': { ratePct: 5.0, note: '5X reward points on grocery and dining spends' },
    },
    lounges: [
      {
        scope: 'Domestic',
        period: 'Quarter',
        entitled: 2,
        minSpend: 0,
        spendWindow: 'None (Free)',
        qualifyingSpendAchieved: 0,
        program: 'Visa Airport Companion',
        guestAccess: 'Primary cardholder',
        nextResetDate: '2026-12-31',
      },
      {
        scope: 'International',
        period: 'Year',
        entitled: 6,
        minSpend: 0,
        spendWindow: 'None (Free)',
        qualifyingSpendAchieved: 0,
        program: 'Priority Pass',
        guestAccess: 'Free 6 visits via Priority Pass',
        nextResetDate: '2027-03-31',
      },
    ],
    helpline: '18601801290',
    rewardCurrency: 'SBI Reward Points',
    pointValueInr: 0.25,
  },
  {
    id: 'axis-atlas',
    bank: 'Axis',
    name: 'Atlas',
    network: 'Visa',
    variant: 'Infinite',
    color: '#8a1643',
    annualFee: 5000,
    feeWaiverSpend: 1500000,
    baseRewardPct: 4.0,
    categoryBoosts: {
      Travel: { ratePct: 10.0, note: '5 EDGE Miles per ₹100 on direct airlines & hotels (1 EM = 2 Partner Miles)' },
    },
    lounges: [
      {
        scope: 'Domestic',
        period: 'Year',
        entitled: 8,
        minSpend: 0,
        spendWindow: 'None (Free)',
        qualifyingSpendAchieved: 0,
        program: 'Visa Airport Companion',
        guestAccess: 'Tier Silver: 8 visits, Tier Gold: 12 visits, Tier Platinum: 18 visits',
        nextResetDate: '2026-12-31',
      },
      {
        scope: 'International',
        period: 'Year',
        entitled: 4,
        minSpend: 0,
        spendWindow: 'None (Free)',
        qualifyingSpendAchieved: 0,
        program: 'Dreamfolks',
        guestAccess: '4 visits with Dreamfolks card/QR',
        nextResetDate: '2026-12-31',
      },
    ],
    helpline: '18604195555',
    rewardCurrency: 'EDGE Miles',
    pointValueInr: 2.0,
  },
  {
    id: 'axis-magnus',
    bank: 'Axis',
    name: 'Magnus Burgundy',
    network: 'Mastercard',
    variant: 'World Elite',
    color: '#701a75',
    annualFee: 12500,
    feeWaiverSpend: 2500000,
    baseRewardPct: 4.8,
    categoryBoosts: {
      Travel: { ratePct: 24.0, note: '5X on Travel EDGE portal + 1:1 points-to-partner transfer ratio' },
    },
    lounges: [
      {
        scope: 'Domestic',
        period: 'Quarter',
        entitled: 12,
        minSpend: 150000,
        spendWindow: 'Previous 3 Months',
        qualifyingSpendAchieved: 165000,
        program: 'Mastercard Lounge',
        guestAccess: 'Includes 8 complimentary guest visits/year for Burgundy',
        nextResetDate: '2026-12-31',
      },
      {
        scope: 'International',
        period: 'Year',
        entitled: 12,
        minSpend: 0,
        spendWindow: 'None (Free)',
        qualifyingSpendAchieved: 0,
        program: 'Priority Pass',
        guestAccess: 'Unlimited visits for cardholder + 8 guest visits',
        nextResetDate: '2027-03-31',
      },
    ],
    helpline: '18604195555',
    rewardCurrency: 'EDGE Rewards',
    pointValueInr: 0.4,
  },
  {
    id: 'axis-airtel',
    bank: 'Axis',
    name: 'Airtel Axis',
    network: 'Mastercard',
    variant: 'World',
    color: '#991b1b',
    annualFee: 500,
    feeWaiverSpend: 200000,
    baseRewardPct: 1.0,
    categoryBoosts: {
      'Bills & utilities': { ratePct: 25.0, note: '25% cashback on Airtel mobile, broadband & DTH (up to ₹250/mo)' },
      'Food & dining': { ratePct: 10.0, note: '10% cashback on Swiggy, Zomato, and BigBasket (up to ₹500/mo)' },
    },
    lounges: [
      {
        scope: 'Domestic',
        period: 'Quarter',
        entitled: 1,
        minSpend: 50000,
        spendWindow: 'Previous 3 Months',
        qualifyingSpendAchieved: 34000,
        program: 'Mastercard Lounge',
        guestAccess: 'Cardholder only',
        nextResetDate: '2026-12-31',
      },
    ],
    helpline: '18604195555',
    rewardCurrency: 'Statement Cashback',
    pointValueInr: 1.0,
  },
  {
    id: 'icici-amazon-pay',
    bank: 'ICICI',
    name: 'Amazon Pay',
    network: 'Visa',
    variant: 'Platinum',
    color: '#334155',
    annualFee: 0,
    feeWaiverSpend: 0,
    baseRewardPct: 1.0,
    categoryBoosts: {
      Shopping: { ratePct: 5.0, note: '5% Prime cashback on Amazon India' },
      'Bills & utilities': { ratePct: 2.0, note: '2% on recharges & utility bills via Amazon Pay' },
      Travel: { ratePct: 5.0, note: '5% on flights & hotels booked on Amazon' },
    },
    lounges: [],
    helpline: '18001020123',
    rewardCurrency: 'Amazon Pay Balance',
    pointValueInr: 1.0,
  },
  {
    id: 'icici-sapphiro',
    bank: 'ICICI',
    name: 'Sapphiro',
    network: 'Mastercard',
    variant: 'World',
    color: '#9a3412',
    annualFee: 3500,
    feeWaiverSpend: 600000,
    baseRewardPct: 0.75,
    categoryBoosts: {
      Entertainment: { ratePct: 8.5, note: 'Buy 1 Get 1 up to ₹500 twice a month on BookMyShow' },
      Travel: { ratePct: 1.5, note: '2X reward points on international spends' },
    },
    lounges: [
      {
        scope: 'Domestic',
        period: 'Quarter',
        entitled: 4,
        minSpend: 75000,
        spendWindow: 'Previous Quarter',
        qualifyingSpendAchieved: 79200,
        program: 'Dreamfolks',
        guestAccess: 'Dreamfolks dragonpass QR for primary holder',
        nextResetDate: '2026-12-31',
      },
      {
        scope: 'International',
        period: 'Year',
        entitled: 2,
        minSpend: 0,
        spendWindow: 'None (Free)',
        qualifyingSpendAchieved: 0,
        program: 'Dreamfolks',
        guestAccess: 'Free 2 international visits per year',
        nextResetDate: '2027-03-31',
      },
    ],
    helpline: '18001080',
    rewardCurrency: 'ICICI Reward Points',
    pointValueInr: 0.25,
  },
  {
    id: 'icici-emeralde-metal',
    bank: 'ICICI',
    name: 'Emeralde Private Metal',
    network: 'Visa',
    variant: 'Infinite',
    color: '#064e3b',
    annualFee: 12500,
    feeWaiverSpend: 1000000,
    baseRewardPct: 3.0,
    categoryBoosts: {
      Travel: { ratePct: 9.0, note: '3X reward points on air travel & international bookings' },
      Entertainment: { ratePct: 12.0, note: 'Unlimited Buy 1 Get 1 movie tickets up to ₹750 on BMS' },
    },
    lounges: [
      {
        scope: 'Domestic',
        period: 'Quarter',
        entitled: 12,
        minSpend: 0,
        spendWindow: 'None (Free)',
        qualifyingSpendAchieved: 0,
        program: 'Dreamfolks',
        guestAccess: 'Unlimited visits for primary cardholder + unlimited guests',
        nextResetDate: '2026-12-31',
      },
      {
        scope: 'International',
        period: 'Year',
        entitled: 12,
        minSpend: 0,
        spendWindow: 'None (Free)',
        qualifyingSpendAchieved: 0,
        program: 'Priority Pass',
        guestAccess: 'Unlimited international lounge visits + free guest access',
        nextResetDate: '2026-12-31',
      },
    ],
    helpline: '18001080',
    rewardCurrency: 'ICICI Reward Points',
    pointValueInr: 1.0,
  },
  {
    id: 'amex-plat-travel',
    bank: 'Amex',
    name: 'Platinum Travel',
    network: 'Amex',
    variant: 'Platinum',
    color: '#0f4c81',
    annualFee: 5000,
    feeWaiverSpend: 400000,
    baseRewardPct: 2.0,
    categoryBoosts: {
      Travel: { ratePct: 8.5, note: '48,000 bonus MR points + ₹10,000 Taj voucher on ₹4L annual spend' },
      'Bills & utilities': { ratePct: 6.5, note: 'Counts toward ₹1.9L & ₹4L milestone tiers via Amex GyFTR' },
    },
    lounges: [
      {
        scope: 'Domestic',
        period: 'Quarter',
        entitled: 2,
        minSpend: 0,
        spendWindow: 'None (Free)',
        qualifyingSpendAchieved: 0,
        program: 'Airport Lounge',
        guestAccess: 'Cardholder only',
        nextResetDate: '2026-12-31',
      },
    ],
    helpline: '18004191414',
    rewardCurrency: 'Membership Rewards',
    pointValueInr: 0.6,
  },
  {
    id: 'amex-platinum',
    bank: 'Amex',
    name: 'The Platinum Card',
    network: 'Amex',
    variant: 'Charge Metal',
    color: '#475569',
    annualFee: 66000,
    feeWaiverSpend: 0,
    baseRewardPct: 2.5,
    categoryBoosts: {
      Travel: { ratePct: 7.5, note: '3X Membership Rewards on overseas spends & Fine Hotels & Resorts' },
      Shopping: { ratePct: 5.0, note: '10X on Amex Reward Multiplier partner brands' },
    },
    lounges: [
      {
        scope: 'Domestic',
        period: 'Quarter',
        entitled: 12,
        minSpend: 0,
        spendWindow: 'None (Free)',
        qualifyingSpendAchieved: 0,
        program: 'Centurion',
        guestAccess: 'Unlimited Centurion, Delta SkyClub, Priority Pass + 2 guests free',
        nextResetDate: '2026-12-31',
      },
      {
        scope: 'International',
        period: 'Year',
        entitled: 12,
        minSpend: 0,
        spendWindow: 'None (Free)',
        qualifyingSpendAchieved: 0,
        program: 'Centurion',
        guestAccess: 'Global Lounge Collection: 1,400+ lounges across 140 countries',
        nextResetDate: '2026-12-31',
      },
    ],
    helpline: '18004191414',
    rewardCurrency: 'Membership Rewards',
    pointValueInr: 0.75,
  },
  {
    id: 'kotak-white',
    bank: 'Kotak',
    name: 'White Reserve',
    network: 'Visa',
    variant: 'Infinite',
    color: '#7f1d1d',
    annualFee: 12500,
    feeWaiverSpend: 1000000,
    baseRewardPct: 2.5,
    categoryBoosts: {
      Shopping: { ratePct: 6.0, note: 'White Pass vouchers worth up to ₹2.5L on milestone spends' },
    },
    lounges: [
      {
        scope: 'Domestic',
        period: 'Quarter',
        entitled: 2,
        minSpend: 50000,
        spendWindow: 'Previous Quarter',
        qualifyingSpendAchieved: 54000,
        program: 'Visa Airport Companion',
        guestAccess: 'Primary cardholder',
        nextResetDate: '2026-12-31',
      },
      {
        scope: 'International',
        period: 'Year',
        entitled: 4,
        minSpend: 0,
        spendWindow: 'None (Free)',
        qualifyingSpendAchieved: 0,
        program: 'Priority Pass',
        guestAccess: '4 visits with Priority Pass',
        nextResetDate: '2027-03-31',
      },
    ],
    helpline: '18602662666',
    rewardCurrency: 'White Pass Value',
    pointValueInr: 1.0,
  },
  {
    id: 'indusind-legend',
    bank: 'IndusInd',
    name: 'Legend',
    network: 'Visa',
    variant: 'Signature',
    color: '#831843',
    annualFee: 0,
    feeWaiverSpend: 0,
    baseRewardPct: 1.0,
    categoryBoosts: {
      Shopping: { ratePct: 2.0, note: '2X reward points on weekend purchases' },
      Entertainment: { ratePct: 6.0, note: 'Buy 1 Get 1 free movie tickets on BookMyShow' },
    },
    lounges: [
      {
        scope: 'Domestic',
        period: 'Quarter',
        entitled: 3,
        minSpend: 35000,
        spendWindow: 'Previous Quarter',
        qualifyingSpendAchieved: 38200,
        program: 'Airport Lounge',
        guestAccess: 'Cardholder only',
        nextResetDate: '2026-12-31',
      },
    ],
    helpline: '18605005004',
    rewardCurrency: 'Indus Rewards',
    pointValueInr: 0.75,
  },
  {
    id: 'hsbc-live-plus',
    bank: 'HSBC',
    name: 'Live+ Cashback',
    network: 'Visa',
    variant: 'Signature',
    color: '#db0011',
    annualFee: 999,
    feeWaiverSpend: 200000,
    baseRewardPct: 1.5,
    categoryBoosts: {
      'Food & dining': { ratePct: 10.0, note: '10% accelerated cashback on dining and food delivery (up to ₹1,000/mo)' },
      Groceries: { ratePct: 10.0, note: '10% cashback on grocery supermarket & delivery orders' },
    },
    lounges: [
      {
        scope: 'Domestic',
        period: 'Quarter',
        entitled: 1,
        minSpend: 50000,
        spendWindow: 'Previous Quarter',
        qualifyingSpendAchieved: 51200,
        program: 'Visa Airport Companion',
        guestAccess: 'Primary cardholder',
        nextResetDate: '2026-12-31',
      },
    ],
    helpline: '18002663456',
    rewardCurrency: 'Statement Cashback',
    pointValueInr: 1.0,
  },
  {
    id: 'idfc-wealth',
    bank: 'IDFC First',
    name: 'First Wealth',
    network: 'Mastercard',
    variant: 'World',
    color: '#6b1d2f',
    annualFee: 0,
    feeWaiverSpend: 0,
    baseRewardPct: 1.5,
    categoryBoosts: {
      Shopping: { ratePct: 2.5, note: '10X reward points above ₹20,000 monthly spend' },
      Entertainment: { ratePct: 6.0, note: 'Buy 1 Get 1 movie tickets up to ₹250 twice a month' },
    },
    lounges: [
      {
        scope: 'Domestic',
        period: 'Quarter',
        entitled: 2,
        minSpend: 20000,
        spendWindow: 'Previous Calendar Month',
        qualifyingSpendAchieved: 24500,
        program: 'Dreamfolks',
        guestAccess: '2 visits per quarter on ₹20k monthly spend',
        nextResetDate: '2026-12-31',
      },
      {
        scope: 'International',
        period: 'Quarter',
        entitled: 2,
        minSpend: 20000,
        spendWindow: 'Previous Calendar Month',
        qualifyingSpendAchieved: 24500,
        program: 'Dreamfolks',
        guestAccess: '2 international visits per quarter with Dreamfolks card',
        nextResetDate: '2026-12-31',
      },
    ],
    helpline: '180010888',
    rewardCurrency: 'IDFC Reward Points',
    pointValueInr: 0.25,
  },
];

export interface VaultCard {
  id: string;
  bank: string;
  name: string;
  holder: string;
  number: string;
  expiry: string;
  cvv: string;
  kind: 'Credit' | 'Debit';
  network: 'Visa' | 'Mastercard' | 'RuPay' | 'Amex' | 'Diners';
  variant: string;
  limit: number;
  owed: number;
  fee: number;
  feeSpend: number;
  rewardPts: number;
  pointValueInr: number;
  baseRewardPct: number;
  categoryBoosts?: Partial<Record<SpendCategory, { ratePct: number; note: string }>>;
  billDay?: number;
  stmtDay?: number;
  feeDate?: string;
  fav: boolean;
  virtual: boolean;
  blocked?: boolean;
  color: string;
  helpline: string;
  lounges: LoungeEntitlement[];
  notes: string;
  attachments?: DocumentAttachment[];
}

export interface EmiPlan {
  id: string;
  cardId: string;
  merchant: string;
  principal: number;
  monthlyEmi: number;
  interestRatePct: number;
  totalMonths: number;
  paidMonths: number;
  startDate: string;
}

export interface VaultLoginItem {
  id: string;
  site: string;
  username: string;
  password: string;
  totpSecret?: string;
  url: string;
  category: 'Banking' | 'Government' | 'Tax & Investments' | 'Email';
  notes: string;
}

export interface VaultSpend {
  id: string;
  cardId: string;
  merchant: string;
  amount: number;
  category: SpendCategory;
  date: string;
  isRecurring?: boolean;
}

export interface CategoryBudget {
  category: SpendCategory;
  monthlyLimit: number;
}

export const INITIAL_DEMO_CARDS: VaultCard[] = [
  {
    id: 'c-infinia',
    bank: 'HDFC',
    name: 'Infinia Metal',
    holder: 'AARAV SHARMA',
    number: '4375889104218892',
    expiry: '09/29',
    cvv: '842',
    kind: 'Credit',
    network: 'Visa',
    variant: 'Infinite',
    limit: 1200000,
    owed: 148500,
    fee: 12500,
    feeSpend: 1000000,
    rewardPts: 64280,
    pointValueInr: 1.0,
    baseRewardPct: 3.3,
    categoryBoosts: OFFLINE_CARD_CATALOG[0].categoryBoosts,
    billDay: 18,
    stmtDay: 28,
    feeDate: '2027-03-15',
    fav: true,
    virtual: false,
    color: '#172554',
    helpline: '18002663310',
    lounges: [
      {
        id: 'l-1',
        scope: 'Domestic',
        period: 'Quarter',
        entitled: 12,
        used: 3,
        minSpend: 0,
        spendWindow: 'None (Free)',
        qualifyingSpendAchieved: 0,
        program: 'Priority Pass',
        guestAccess: 'Unlimited guest visits complimentary with Priority Pass',
        nextResetDate: '2026-12-31',
      },
      {
        id: 'l-2',
        scope: 'International',
        period: 'Year',
        entitled: 12,
        used: 2,
        minSpend: 0,
        spendWindow: 'None (Free)',
        qualifyingSpendAchieved: 0,
        program: 'Priority Pass',
        guestAccess: 'Unlimited international lounge visits with guest',
        nextResetDate: '2026-12-31',
      },
    ],
    notes: 'Primary SmartBuy & international travel card. Zero forex markup via Global Value Program.',
    attachments: [
      {
        id: 'att-inf-front',
        name: 'Infinia Metal Front Scan.svg',
        category: 'card_front',
        dataUrl: generateSampleCardFrontSvg('HDFC', 'Infinia Metal', '8892', 'AARAV SHARMA', '#172554'),
        fileSizeKb: 4.8,
        uploadedAt: '2026-10-15',
        notes: 'Front high-res scan with embedded EMV chip and NFC marker.',
      },
      {
        id: 'att-inf-back',
        name: 'Infinia Metal Back Scan.svg',
        category: 'card_back',
        dataUrl: generateSampleCardBackSvg('HDFC', '842', '1800-266-3310'),
        fileSizeKb: 3.9,
        uploadedAt: '2026-10-15',
        notes: 'Magnetic stripe and authorized signature panel.',
      },
    ],
  },
  {
    id: 'c-sbi-cb',
    bank: 'SBI',
    name: 'Cashback',
    holder: 'AARAV SHARMA',
    number: '4591220491823310',
    expiry: '11/28',
    cvv: '519',
    kind: 'Credit',
    network: 'Visa',
    variant: 'Signature',
    limit: 350000,
    owed: 42300,
    fee: 999,
    feeSpend: 200000,
    rewardPts: 2115,
    pointValueInr: 1.0,
    baseRewardPct: 1.0,
    categoryBoosts: OFFLINE_CARD_CATALOG[4].categoryBoosts,
    billDay: 12,
    stmtDay: 22,
    feeDate: '2027-01-10',
    fav: true,
    virtual: false,
    color: '#1864ab',
    helpline: '18601801290',
    lounges: [],
    notes: 'Default 5% online merchant card. Statement credit posts within 2 days of billing.',
    attachments: [
      {
        id: 'att-sbi-front',
        name: 'SBI Cashback Front Scan.svg',
        category: 'card_front',
        dataUrl: generateSampleCardFrontSvg('SBI', 'Cashback', '3310', 'AARAV SHARMA', '#1864ab'),
        fileSizeKb: 4.6,
        uploadedAt: '2026-10-18',
        notes: 'Verified copy of SBI Cashback Visa Signature.',
      },
    ],
  },
  {
    id: 'c-atlas',
    bank: 'Axis',
    name: 'Atlas',
    holder: 'AARAV SHARMA',
    number: '4111773920194481',
    expiry: '06/30',
    cvv: '904',
    kind: 'Credit',
    network: 'Visa',
    variant: 'Infinite',
    limit: 750000,
    owed: 86000,
    fee: 5000,
    feeSpend: 1500000,
    rewardPts: 19400,
    pointValueInr: 2.0,
    baseRewardPct: 4.0,
    categoryBoosts: OFFLINE_CARD_CATALOG[6].categoryBoosts,
    billDay: 5,
    stmtDay: 15,
    feeDate: '2027-06-01',
    fav: false,
    virtual: false,
    color: '#8a1643',
    helpline: '18604195555',
    lounges: [
      {
        id: 'l-3',
        scope: 'Domestic',
        period: 'Year',
        entitled: 8,
        used: 2,
        minSpend: 0,
        spendWindow: 'None (Free)',
        qualifyingSpendAchieved: 0,
        program: 'Visa Airport Companion',
        guestAccess: 'Tier Silver: 8 visits, Tier Gold: 12 visits',
        nextResetDate: '2026-12-31',
      },
      {
        id: 'l-4',
        scope: 'International',
        period: 'Year',
        entitled: 4,
        used: 1,
        minSpend: 0,
        spendWindow: 'None (Free)',
        qualifyingSpendAchieved: 0,
        program: 'Dreamfolks',
        guestAccess: '4 visits with Dreamfolks card/QR',
        nextResetDate: '2026-12-31',
      },
    ],
    notes: 'Direct airline & hotel bookings only for 5 EDGE Miles / ₹100.',
    attachments: [
      {
        id: 'att-atlas-front',
        name: 'Axis Atlas Front Scan.svg',
        category: 'card_front',
        dataUrl: generateSampleCardFrontSvg('Axis', 'Atlas', '4481', 'AARAV SHARMA', '#8a1643'),
        fileSizeKb: 4.7,
        uploadedAt: '2026-09-22',
        notes: 'Axis Atlas Burgundy Infinite card scan.',
      },
    ],
  },
  {
    id: 'c-icici-sapph',
    bank: 'ICICI',
    name: 'Sapphiro',
    holder: 'AARAV SHARMA',
    number: '5421990412847741',
    expiry: '04/30',
    cvv: '711',
    kind: 'Credit',
    network: 'Mastercard',
    variant: 'World',
    limit: 650000,
    owed: 38000,
    fee: 3500,
    feeSpend: 600000,
    rewardPts: 14200,
    pointValueInr: 0.25,
    baseRewardPct: 0.75,
    categoryBoosts: OFFLINE_CARD_CATALOG[10].categoryBoosts,
    billDay: 8,
    stmtDay: 18,
    feeDate: '2027-04-12',
    fav: false,
    virtual: false,
    color: '#9a3412',
    helpline: '18001080',
    lounges: [
      {
        id: 'l-sp-dom',
        scope: 'Domestic',
        period: 'Quarter',
        entitled: 4,
        used: 1,
        minSpend: 75000,
        spendWindow: 'Previous Quarter',
        qualifyingSpendAchieved: 79200,
        program: 'Dreamfolks',
        guestAccess: 'Dreamfolks DragonPass QR for primary holder',
        nextResetDate: '2026-12-31',
      },
      {
        id: 'l-sp-int',
        scope: 'International',
        period: 'Year',
        entitled: 2,
        used: 0,
        minSpend: 0,
        spendWindow: 'None (Free)',
        qualifyingSpendAchieved: 0,
        program: 'Dreamfolks',
        guestAccess: 'Free 2 international visits per year',
        nextResetDate: '2027-03-31',
      },
    ],
    notes: 'BOGO movie tickets on BookMyShow + Dreamfolks lounge.',
    attachments: [
      {
        id: 'att-sapph-front',
        name: 'ICICI Sapphiro World Scan.svg',
        category: 'card_front',
        dataUrl: generateSampleCardFrontSvg('ICICI', 'Sapphiro World', '7741', 'AARAV SHARMA', '#9a3412'),
        fileSizeKb: 4.8,
        uploadedAt: '2026-10-05',
        notes: 'Front scan of ICICI Sapphiro Mastercard.',
      },
    ],
  },
  {
    id: 'c-amex-plat',
    bank: 'Amex',
    name: 'Platinum Travel',
    holder: 'AARAV SHARMA',
    number: '376912849201984',
    expiry: '04/29',
    cvv: '4912',
    kind: 'Credit',
    network: 'Amex',
    variant: 'Platinum',
    limit: 550000,
    owed: 64000,
    fee: 5000,
    feeSpend: 400000,
    rewardPts: 48200,
    pointValueInr: 0.6,
    baseRewardPct: 2.0,
    categoryBoosts: OFFLINE_CARD_CATALOG[12].categoryBoosts,
    billDay: 25,
    stmtDay: 7,
    feeDate: '2027-04-20',
    fav: false,
    virtual: false,
    color: '#0f4c81',
    helpline: '18004191414',
    lounges: [
      {
        id: 'l-5',
        scope: 'Domestic',
        period: 'Quarter',
        entitled: 2,
        used: 1,
        minSpend: 0,
        spendWindow: 'None (Free)',
        qualifyingSpendAchieved: 0,
        program: 'Airport Lounge',
        guestAccess: 'Cardholder only',
        nextResetDate: '2026-12-31',
      },
    ],
    notes: 'Target ₹4,00,000 annual spend for 40,000 MR + ₹10,000 Taj stay voucher.',
    attachments: [
      {
        id: 'att-amex-front',
        name: 'Amex Platinum Travel Front Scan.svg',
        category: 'card_front',
        dataUrl: generateSampleCardFrontSvg('Amex', 'Platinum Travel', '1984', 'AARAV SHARMA', '#0f4c81'),
        fileSizeKb: 4.6,
        uploadedAt: '2026-08-14',
        notes: 'American Express frosted blue platinum scan.',
      },
    ],
  },
];

export const DECOY_CARDS: VaultCard[] = [
  {
    id: 'decoy-1',
    bank: 'SBI',
    name: 'Classic Debit',
    holder: 'AARAV SHARMA',
    number: '6070941128395012',
    expiry: '03/28',
    cvv: '311',
    kind: 'Debit',
    network: 'RuPay',
    variant: 'Classic',
    limit: 50000,
    owed: 0,
    fee: 150,
    feeSpend: 0,
    rewardPts: 120,
    pointValueInr: 0.25,
    baseRewardPct: 0.25,
    fav: true,
    virtual: false,
    color: '#1864ab',
    helpline: '1800112211',
    lounges: [],
    notes: 'Everyday ATM & UPI Lite card.',
  },
];

export const INITIAL_DEMO_EMIS: EmiPlan[] = [
  {
    id: 'emi-1',
    cardId: 'c-infinia',
    merchant: 'Apple India — MacBook Pro 16" M4',
    principal: 249900,
    monthlyEmi: 20825,
    interestRatePct: 0,
    totalMonths: 12,
    paidMonths: 5,
    startDate: '2026-06-15',
  },
  {
    id: 'emi-2',
    cardId: 'c-sbi-cb',
    merchant: 'LG OLED C5 65" Television',
    principal: 144000,
    monthlyEmi: 16000,
    interestRatePct: 0,
    totalMonths: 9,
    paidMonths: 6,
    startDate: '2026-05-10',
  },
];

export const INITIAL_DEMO_LOGINS: VaultLoginItem[] = [
  {
    id: 'log-1',
    site: 'HDFC NetBanking & SmartBuy',
    username: 'cust_88412091',
    password: 'vL9#mQ2$kP8!xR4@zN',
    totpSecret: 'JBSWY3DPEHPK3PXP',
    url: 'https://netbanking.hdfcbank.com',
    category: 'Banking',
    notes: 'Primary salary & credit card portal.',
  },
  {
    id: 'log-2',
    site: 'Zerodha Kite & Console',
    username: 'ZA4918',
    password: 'Tr7&wB5*pL9@dM3#qX',
    totpSecret: 'GEZDGNBVGY3TQOJQ',
    url: 'https://kite.zerodha.com',
    category: 'Tax & Investments',
    notes: 'Equity & mutual fund demat account.',
  },
  {
    id: 'log-3',
    site: 'Income Tax e-Filing Portal',
    username: 'ABCDE1234F',
    password: 'It9$kM4!nQ7#pV2^wL',
    totpSecret: 'MFRGGZDFMZTWQ2LK',
    url: 'https://eportal.incometax.gov.in',
    category: 'Government',
    notes: 'PAN-linked tax portal.',
  },
];

export const INITIAL_DEMO_SPENDS: VaultSpend[] = [
  { id: 'sp-1', cardId: 'c-infinia', merchant: 'IndiGo Airlines (SmartBuy)', amount: 34500, category: 'Travel', date: '2026-11-05', isRecurring: false },
  { id: 'sp-2', cardId: 'c-sbi-cb', merchant: 'Amazon India', amount: 18400, category: 'Shopping', date: '2026-11-04', isRecurring: false },
  { id: 'sp-3', cardId: 'c-atlas', merchant: 'Taj Lands End Mumbai', amount: 42000, category: 'Travel', date: '2026-11-03', isRecurring: false },
  { id: 'sp-4', cardId: 'c-infinia', merchant: 'Swiggy Dineout & Instamart', amount: 6850, category: 'Food & dining', date: '2026-11-02', isRecurring: false },
  { id: 'sp-5', cardId: 'c-amex-plat', merchant: 'Tata Power Electricity Bill', amount: 7420, category: 'Bills & utilities', date: '2026-11-02', isRecurring: true },
  { id: 'sp-6', cardId: 'c-sbi-cb', merchant: 'Blinkit Groceries', amount: 4920, category: 'Groceries', date: '2026-11-01', isRecurring: false },
  { id: 'sp-7', cardId: 'c-sbi-cb', merchant: 'Netflix Ultra HD Plan', amount: 649, category: 'Entertainment', date: '2026-11-01', isRecurring: true },
  { id: 'sp-8', cardId: 'c-infinia', merchant: 'Apple iCloud+ 2TB Family', amount: 749, category: 'Bills & utilities', date: '2026-11-01', isRecurring: true },
  { id: 'sp-9', cardId: 'c-amex-plat', merchant: 'HPCL Fuel Station', amount: 4500, category: 'Fuel', date: '2026-10-29', isRecurring: false },
];

export const INITIAL_BUDGETS: CategoryBudget[] = [
  { category: 'Travel', monthlyLimit: 85000 },
  { category: 'Shopping', monthlyLimit: 30000 },
  { category: 'Food & dining', monthlyLimit: 15000 },
  { category: 'Groceries', monthlyLimit: 12000 },
  { category: 'Bills & utilities', monthlyLimit: 15000 },
  { category: 'Fuel', monthlyLimit: 8000 },
  { category: 'Entertainment', monthlyLimit: 5000 },
];

export interface CodeAuditFinding {
  id: string;
  category: 'Architecture & Storage' | 'Security & Cryptography' | 'UX & DOM Performance' | 'Feature & Parsing';
  severity: 'High Impact' | 'Medium Impact' | 'Quick Win';
  title: string;
  fileLocation: string;
  problem: string;
  whyItMatters: string;
  solutionSummary: string;
  codePatch: string;
}

export const CODE_AUDIT_FINDINGS: CodeAuditFinding[] = [
  {
    id: 'audit-1',
    category: 'Architecture & Storage',
    severity: 'High Impact',
    title: 'Separate Encrypted Photo Blobs from Core Vault JSON',
    fileLocation: 'www/index.html — lines 94–96 (persist & unlock)',
    problem:
      'Every card front/back photo (`data:image/jpeg;base64,...`) is stored directly inside `S.vault.cards[i].photos` and re-serialized + AES-GCM encrypted on EVERY keystroke save (`persist()`), lounge tap, or bill payment.',
    whyItMatters:
      'Once a user attaches 15–20 card/ID photos (~8–12 MB of base64 strings), `JSON.stringify(S.vault)` and AES-GCM encryption spike memory and block the main UI thread for 300–800ms on every edit, and increase OOM crash risk during backup share.',
    solutionSummary:
      'Store encrypted photo blobs in a dedicated IndexedDB objectStore (`photos`) keyed by photo ID (`ph_<id>`), keeping `S.vault` lightweight (<50 KB) so unlock and `persist()` stay under 5ms.',
    codePatch: `// Upgrade idb() to version 2 with a separate 'photos' object store
function idb() {
  return new Promise((res, rej) => {
    const r = indexedDB.open('cardvault', 2);
    r.onupgradeneeded = (e) => {
      const db = r.result;
      if (!db.objectStoreNames.contains('kv')) db.createObjectStore('kv');
      if (!db.objectStoreNames.contains('photos')) db.createObjectStore('photos');
    };
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
}

// Encrypt & store each photo independently only when added
async function saveEncryptedPhoto(photoId, dataUrl) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, S.key, enc.encode(dataUrl)));
  const d = await idb();
  return new Promise((res, rej) => {
    const tx = d.transaction('photos', 'readwrite');
    tx.objectStore('photos').put({ iv: b64(iv), ct: b64(ct) }, photoId);
    tx.oncomplete = () => res();
    tx.onerror = () => rej(tx.error);
  });
}`,
  },
  {
    id: 'audit-2',
    category: 'Security & Cryptography',
    severity: 'High Impact',
    title: 'Bind PIN Unlock to Android Keystore Hardware Counter + Step-Up Auth for CVV',
    fileLocation: 'www/index.html — lines 134–144 (pinGo & togglePin) & line 188 (row)',
    problem:
      '1) `pin_fail` is stored as a plain string in `@aparajita/capacitor-secure-storage` (`SharedPreferences` backed). On a rooted phone or backup extraction, resetting `pin_fail` allows offline brute-forcing of a 4-digit PIN (only 10,000 combinations) despite PBKDF2. 2) Once unlocked, tapping "Show" on CVV or passwords requires zero re-verification.',
    whyItMatters:
      'If a user hands their unlocked phone to someone for 10 seconds, any CVV or netbanking password can be viewed and copied in one tap.',
    solutionSummary:
      'Add a 60-second Step-Up Authentication session (`verifyStepUp()`) before revealing CVV/password fields, and mix a random 128-bit device pepper stored in `BioVaultPlugin` hardware Keystore into the PIN PBKDF2 derivation.',
    codePatch: `// Step-Up Auth guard before revealing CVV or Login Passwords (valid for 60s)
let stepUpUntil = 0;
async function revealSecret(key) {
  if (S.rev[key]) { S.rev[key] = false; return render(); }
  if (CFG.extraLock && Date.now() > stepUpUntil) {
    if (CFG.bio && S.bioOK) {
      try {
        const pw = await CV.bioUnlock();
        if (!pw) return toast('Verification required');
      } catch (e) { return toast('Biometric verification cancelled'); }
    } else {
      const v = await sheet('Verify master password', [{ id: 'pw', l: 'Master password' }], 'Verify');
      if (!v) return;
      try { await checkPw(v.pw); } catch (e) { return toast('Incorrect password'); }
    }
    stepUpUntil = Date.now() + 60000;
  }
  S.rev[key] = true;
  render();
}`,
  },
  {
    id: 'audit-3',
    category: 'UX & DOM Performance',
    severity: 'Medium Impact',
    title: 'Eliminate Full-DOM `innerHTML` Re-Renders on Form Inputs & Toggles',
    fileLocation: 'www/index.html — lines 253–271 (editV) & line 149 (render)',
    problem:
      'Every time `render()` is called inside `editV()` (for example, changing Credit/Debit `<select onchange="D(\'kind\',this.value);render()">`, picking a card color, or adding a lounge benefit), `#app.innerHTML` is completely blown away and rebuilt, resetting scroll position and losing input cursor state.',
    whyItMatters:
      'Causes jarring visual jumps on mobile when editing a card with many fields, and triggers the `.vt` slide transition even on in-place state updates.',
    solutionSummary:
      'Pass a `{ preserveScroll: true, animate: false }` flag to `render()` for in-view mutations, and only run the `.vt` slide animation when `S.view` actually changes.',
    codePatch: `let prevView = 'lock';
function render(opts = {}) {
  const a = $('#app');
  const viewChanged = S.view !== prevView;
  const scrollY = window.scrollY;
  prevView = S.view;

  if (S.view === 'lock') a.innerHTML = lockV();
  else if (S.view === 'list') a.innerHTML = listV();
  else if (S.view === 'set') a.innerHTML = S.setSub === 'bin' ? binV() : S.setSub === 'appear' ? appearV() : setV();
  else if (S.view === 'detail') a.innerHTML = detailV();
  else if (S.view === 'in') a.innerHTML = insV();
  else if (S.view === 'gs') a.innerHTML = gsV();
  else a.innerHTML = editV();

  if (viewChanged && !opts.noAnim) {
    a.classList.add('vt');
    requestAnimationFrame(() => requestAnimationFrame(() => a.classList.remove('vt')));
    const f = a.querySelector('[autofocus]');
    if (f) f.focus();
  } else {
    window.scrollTo(0, scrollY);
  }
}`,
  },
  {
    id: 'audit-4',
    category: 'Feature & Parsing',
    severity: 'Quick Win',
    title: 'Smarter Indian Bank & UPI Notification Regex + Refund/Reversal Handling',
    fileLocation: 'www/index.html — lines 398–403 (parseNotif)',
    problem:
      '`parseNotif()` matches any notification containing `Rs.` or `₹`, which means credit card bill payment confirmations ("Rs. 42,000 received towards your credit card"), refunds/reversals, and minimum-amount-due reminders are mistakenly imported as new spends!',
    whyItMatters:
      'Inflates the user’s `c.owed` credit utilization and monthly spend insights whenever a bill payment confirmation or refund notification arrives.',
    solutionSummary:
      'Filter out credit/refund/statement-due notifications before queuing spends, and support multi-line UPI VPA extraction (`to VPA merchant@okaxis`).',
    codePatch: `function parseNotif(n) {
  const t = ((n.title || '') + ' ' + (n.text || '')).replace(/\\s+/g, ' ').trim();
  // Ignore refunds, bill payment credits, OTPs, and statement due reminders
  if (/\\b(otp|verification|credited|refund|reversed|payment received|thank you for paying|total due|min(?:imum)? due|statement is ready)\\b/i.test(t)) {
    return null;
  }
  // Require an explicit debit/spend indicator
  if (!/\\b(spent|debited|paid|used|purchase|txn|transaction|charged|sent)\\b/i.test(t)) {
    return null;
  }
  const m = t.match(/(?:rs\\.?|₹|inr)\\s*([\\d,]+(?:\\.\\d{1,2})?)/i);
  if (!m) return null;
  const amount = Math.round(parseFloat(m[1].replace(/,/g, '')));
  if (!amount) return null;
  const card = t.match(/\\b(?:x{1,4}|\\*{1,4}|•{1,4})\\s*(\\d{4})\\b/i) || t.match(/\\b(?:ending|card|a\\/c)\\s*(?:with\\s*)?(?:no\\.?\\s*)?(\\d{4})\\b/i);
  const mm = t.match(/\\b(?:at|to|towards|on|for|@)\\s+([A-Za-z0-9&.'@_ -]{3,28}?)(?=\\s+(?:on|using|via|ref|upi|txn|trxn|with|from|for|card|avl|bal|if)\\b|[.,;]|$)/i);
  const merchant = (mm ? mm[1].replace(/^VPA\\s+/i, '') : String(n.title || '')).trim().slice(0, 28);
  return { amount, merchant, last4: card ? card[1] : '', when: n.at ? new Date(n.at).toLocaleDateString('en-IN') : '', at: n.at || 0, k: amount + '|' + merchant + '|' + (n.at || '') };
}`,
  },
  {
    id: 'audit-5',
    category: 'Security & Cryptography',
    severity: 'Medium Impact',
    title: 'Versioned Backup Schema & Authenticated Metadata Header',
    fileLocation: 'www/index.html — lines 94–96 (persist) & lines 224–236 (doImport)',
    problem:
      '`.cvault` backup files store raw `{ salt, iv, ct }` without a schema version (`v: 2`), KDF iteration count, or PBKDF2 algorithm identifier.',
    whyItMatters:
      'If you ever raise PBKDF2 iterations (e.g., from 250,000 to 600,000 per OWASP 2026 recommendations) or migrate to Argon2id, older `.cvault` backups will permanently fail to decrypt unless the KDF parameters are stored in the backup envelope.',
    solutionSummary:
      'Include `{ v: 2, kdf: "PBKDF2-SHA256", iter: 250000, salt, iv, ct }` in the encrypted envelope and pass `iter` dynamically to `derive(pw, salt, iter)`.',
    codePatch: `async function derive(pw, salt, iter = 250000) {
  const m = await crypto.subtle.importKey('raw', enc.encode(pw), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: iter, hash: 'SHA-256' },
    m,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}`,
  },
];
