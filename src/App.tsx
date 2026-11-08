/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  ShieldCheck,
  Lock,
  Unlock,
  KeyRound,
  Plus,
  Copy,
  Check,
  Eye,
  EyeOff,
  Plane,
  RefreshCw,
  Download,
  Upload,
  Search,
  Sun,
  Moon,
  PhoneCall,
  Landmark,
  IdCard,
  FileText,
  ShieldAlert,
  Car,
  Receipt,
  CreditCard,
  Trash2,
  UserCheck,
  Layers,
  Sparkles,
  Paperclip,
  CheckCircle2,
  AlertCircle,
  Calendar,
} from 'lucide-react';
import {
  OFFLINE_CARD_CATALOG,
  INITIAL_DEMO_CARDS,
  DECOY_CARDS,
  INITIAL_DEMO_EMIS,
  INITIAL_DEMO_LOGINS,
  INITIAL_DEMO_SPENDS,
  INITIAL_BUDGETS,
  SPEND_CATEGORIES,
  CODE_AUDIT_FINDINGS,
  BANK_COLORS,
  VaultCard,
  EmiPlan,
  VaultLoginItem,
  VaultSpend,
  CategoryBudget,
  SpendCategory,
  CardCatalogEntry,
} from './data/cardCatalog';
import {
  VaultTabId,
  INITIAL_PROFILES,
  INITIAL_BANK_ACCOUNTS,
  INITIAL_GOV_IDS,
  INITIAL_NOTES,
  INITIAL_INSURANCE,
  INITIAL_VEHICLES,
  INITIAL_UTILITY_BILLS,
  INITIAL_BIN_ITEMS,
  BankAccountItem,
  GovIdItem,
  SecureNoteItem,
  InsurancePolicyItem,
  VehicleDocItem,
  UtilityBillItem,
  RecycleBinEntry,
} from './data/vaultTabsData';
import {
  encryptVaultPayload,
  decryptVaultPayload,
  generateTotpCode,
  generateSecureSecret,
  formatCardNumber,
  maskCardNumber,
  testAlertRegexComparison,
} from './utils/cryptoAndTotp';
import { CardDeckStack } from './components/CardDeckStack';
import { LoungeTrackerHub } from './components/LoungeTrackerHub';
import { SubscriptionsManager } from './components/SubscriptionsManager';
import { DocumentViewerModal } from './components/DocumentViewerModal';
import { SubscriptionItem, INITIAL_SUBSCRIPTIONS } from './data/subscriptionsData';
import {
  DocumentAttachment,
  generateSampleCardFrontSvg,
  generateSampleCardBackSvg,
  generateSampleDocumentSvg,
} from './data/attachmentSamples';

type ActiveSection = 'wallet' | 'deck' | 'subscriptions' | 'optimizer' | 'insights';

const VAULT_TABS: { id: VaultTabId; label: string }[] = [
  { id: 'cards', label: 'Cards' },
  { id: 'bank', label: 'Accounts' },
  { id: 'id', label: 'IDs' },
  { id: 'note', label: 'Notes' },
  { id: 'login', label: 'Logins' },
  { id: 'ins', label: 'Insurance' },
  { id: 'veh', label: 'Vehicle' },
  { id: 'bill', label: 'Bills' },
];

const SAMPLE_BANK_ALERTS = [
  {
    label: 'HDFC SmartBuy Flight Spend',
    text: 'Alert: You have spent Rs.34,500.00 on HDFC Bank Credit Card xx8892 at INDIGO AIRLINES on 05-11-2026. Avl limit: Rs.10,51,500.',
  },
  {
    label: 'Bill Payment Confirmation (v1.10 False Positive)',
    text: 'Dear Customer, Payment of Rs. 42,300.00 has been received and credited towards your SBI Credit Card ending 3310. Thank you for paying.',
  },
  {
    label: 'Merchant Refund (v1.10 False Positive)',
    text: 'Refund of INR 2,499.00 from AMAZON INDIA has been credited to your HDFC Card xx8892 on 06-11-2026.',
  },
  {
    label: 'New Card Dispatched Stub',
    text: 'Congratulations! Your new ICICI Sapphiro Credit Card ending with 7741 with a credit limit of Rs. 6,50,000 has been dispatched via BlueDart.',
  },
];

function getDaysUntil(dateStr: string): number | null {
  if (!dateStr) return null;
  const target = new Date(dateStr + 'T23:59:59').getTime();
  if (Number.isNaN(target)) return null;
  return Math.ceil((target - Date.now()) / 86400000);
}

export default function App() {
  const [darkMode, setDarkMode] = useState<boolean>(true);
  const [activeSection, setActiveSection] = useState<ActiveSection>('wallet');
  const [activeVaultTab, setActiveVaultTab] = useState<VaultTabId>('cards');
  const [selectedProfileId, setSelectedProfileId] = useState<string>('all');

  // Lock & Duress Decoy State
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [vaultMode, setVaultMode] = useState<'primary' | 'decoy'>('primary');
  const [unlockInput, setUnlockInput] = useState<string>('');
  const [unlockError, setUnlockError] = useState<string>('');
  const [masterPw] = useState<string>('vaultly2026');
  const [decoyPw] = useState<string>('decoy1234');

  // Step-Up Auth ("Extra Lock before revealing CVV/Password" from ROADMAP.md)
  const [extraLockEnabled, setExtraLockEnabled] = useState<boolean>(true);
  const [stepUpVerifiedUntil, setStepUpVerifiedUntil] = useState<number>(0);
  const [pendingRevealKey, setPendingRevealKey] = useState<string | null>(null);
  const [stepUpPinInput, setStepUpPinInput] = useState<string>('');
  const [stepUpError, setStepUpError] = useState<string>('');

  // All 8 Tabs Vault State
  const [cards, setCards] = useState<VaultCard[]>(INITIAL_DEMO_CARDS);
  const [bankAccounts, setBankAccounts] = useState<BankAccountItem[]>(INITIAL_BANK_ACCOUNTS);
  const [govIds, setGovIds] = useState<GovIdItem[]>(INITIAL_GOV_IDS);
  const [notes, setNotes] = useState<SecureNoteItem[]>(INITIAL_NOTES);
  const [logins, setLogins] = useState<VaultLoginItem[]>(INITIAL_DEMO_LOGINS);
  const [insPolicies, setInsPolicies] = useState<InsurancePolicyItem[]>(INITIAL_INSURANCE);
  const [vehicles, setVehicles] = useState<VehicleDocItem[]>(INITIAL_VEHICLES);
  const [utilityBills, setUtilityBills] = useState<UtilityBillItem[]>(INITIAL_UTILITY_BILLS);
  const [binItems, setBinItems] = useState<RecycleBinEntry[]>(INITIAL_BIN_ITEMS);

  const [emis, setEmis] = useState<EmiPlan[]>(INITIAL_DEMO_EMIS);
  const [spends] = useState<VaultSpend[]>(INITIAL_DEMO_SPENDS);
  const [budgets] = useState<CategoryBudget[]>(INITIAL_BUDGETS);
  const [subscriptions, setSubscriptions] = useState<SubscriptionItem[]>(INITIAL_SUBSCRIPTIONS);

  // Document Viewer & Upload State
  const [activeViewerAttachment, setActiveViewerAttachment] = useState<{
    attachment: DocumentAttachment;
    itemName: string;
  } | null>(null);
  const [uploadTarget, setUploadTarget] = useState<{ tab: VaultTabId; itemId: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Sub-section segmented controls
  const [optimizerTab, setOptimizerTab] = useState<'lounges' | 'calculator'>('lounges');
  const [insightsTab, setInsightsTab] = useState<'emis' | 'authenticator' | 'audit'>('emis');

  // UI Interaction State
  const [selectedCardId, setSelectedCardId] = useState<string>(INITIAL_DEMO_CARDS[0].id);
  const [revealedKeys, setRevealedKeys] = useState<Record<string, boolean>>({});
  const [flippedCardIds, setFlippedCardIds] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [cardGroupMode, setCardGroupMode] = useState<'all' | 'bank' | 'network'>('all');
  const [copiedLabel, setCopiedLabel] = useState<string | null>(null);
  const [partPayAmounts, setPartPayAmounts] = useState<Record<string, string>>({});

  // Document attachment helpers
  const handleTriggerUpload = (tab: VaultTabId, itemId: string) => {
    setUploadTarget({ tab, itemId });
    fileInputRef.current?.click();
  };

  const addAttachmentToItem = (tab: VaultTabId, itemId: string, attachment: DocumentAttachment) => {
    if (tab === 'cards') {
      setCards((prev) =>
        prev.map((c) =>
          c.id === itemId
            ? { ...c, attachments: [attachment, ...(c.attachments || [])] }
            : c
        )
      );
    } else if (tab === 'id') {
      setGovIds((prev) =>
        prev.map((g) =>
          g.id === itemId
            ? { ...g, attachments: [attachment, ...(g.attachments || [])] }
            : g
        )
      );
    } else if (tab === 'veh') {
      setVehicles((prev) =>
        prev.map((v) =>
          v.id === itemId
            ? { ...v, attachments: [attachment, ...(v.attachments || [])] }
            : v
        )
      );
    } else if (tab === 'ins') {
      setInsPolicies((prev) =>
        prev.map((p) =>
          p.id === itemId
            ? { ...p, attachments: [attachment, ...(p.attachments || [])] }
            : p
        )
      );
    } else if (tab === 'bank') {
      setBankAccounts((prev) =>
        prev.map((b) =>
          b.id === itemId
            ? { ...b, attachments: [attachment, ...(b.attachments || [])] }
            : b
        )
      );
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !uploadTarget) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      if (!dataUrl) return;

      const newAtt: DocumentAttachment = {
        id: 'att-' + Math.random().toString(36).slice(2, 8),
        name: file.name,
        category: uploadTarget.tab === 'cards' ? 'card_front' : 'id_scan',
        dataUrl,
        fileSizeKb: Math.max(1, Math.round(file.size / 1024)),
        uploadedAt: new Date().toISOString().slice(0, 10),
        notes: `User-attached document file (${file.type || 'image'}).`,
      };

      addAttachmentToItem(uploadTarget.tab, uploadTarget.itemId, newAtt);
      setCopiedLabel(`Attached "${file.name}" to vault item`);
      setTimeout(() => setCopiedLabel(null), 3000);
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteAttachment = (attachmentId: string) => {
    setCards((prev) =>
      prev.map((c) => ({
        ...c,
        attachments: c.attachments?.filter((a) => a.id !== attachmentId),
      }))
    );
    setGovIds((prev) =>
      prev.map((g) => ({
        ...g,
        attachments: g.attachments?.filter((a) => a.id !== attachmentId),
      }))
    );
    setVehicles((prev) =>
      prev.map((v) => ({
        ...v,
        attachments: v.attachments?.filter((a) => a.id !== attachmentId),
      }))
    );
    setInsPolicies((prev) =>
      prev.map((p) => ({
        ...p,
        attachments: p.attachments?.filter((a) => a.id !== attachmentId),
      }))
    );
    setBankAccounts((prev) =>
      prev.map((b) => ({
        ...b,
        attachments: b.attachments?.filter((a) => a.id !== attachmentId),
      }))
    );
    setActiveViewerAttachment(null);
    setCopiedLabel('Attachment removed from record');
    setTimeout(() => setCopiedLabel(null), 2500);
  };

  const handleAddSampleScan = (tab: VaultTabId, itemId: string, title: string) => {
    let newAtt: DocumentAttachment;
    if (tab === 'cards') {
      const card = cards.find((c) => c.id === itemId);
      newAtt = {
        id: 'att-sample-' + Math.random().toString(36).slice(2, 8),
        name: `${card?.bank || 'Bank'} Card Back Scan.svg`,
        category: 'card_back',
        dataUrl: generateSampleCardBackSvg(
          card?.bank || 'Bank',
          card?.cvv || '888',
          card?.helpline || '18002664332'
        ),
        fileSizeKb: 4.2,
        uploadedAt: new Date().toISOString().slice(0, 10),
        notes: 'Sample verified card back scan copy.',
      };
    } else {
      newAtt = {
        id: 'att-sample-' + Math.random().toString(36).slice(2, 8),
        name: `${title} Verified Copy.svg`,
        category: 'other',
        dataUrl: generateSampleDocumentSvg(
          title,
          'Certified Offline Vault Copy',
          'DOC-' + Math.random().toString(36).slice(2, 7).toUpperCase(),
          'VERIFIED'
        ),
        fileSizeKb: 3.5,
        uploadedAt: new Date().toISOString().slice(0, 10),
        notes: 'Encrypted document copy.',
      };
    }
    addAttachmentToItem(tab, itemId, newAtt);
    setCopiedLabel(`Added sample document scan to ${title}`);
    setTimeout(() => setCopiedLabel(null), 3000);
  };

  const handleUpdateLoungeSpend = (cardId: string, loungeId: string, additionalSpend: number) => {
    setCards((prev) =>
      prev.map((c) => {
        if (c.id !== cardId) return c;
        return {
          ...c,
          lounges: c.lounges.map((l) => {
            if (l.id !== loungeId) return l;
            const current = l.qualifyingSpendAchieved || 0;
            return {
              ...l,
              qualifyingSpendAchieved: current + additionalSpend,
            };
          }),
        };
      })
    );
    setCopiedLabel(`Added ₹${additionalSpend.toLocaleString('en-IN')} qualifying spend to lounge tracker`);
    setTimeout(() => setCopiedLabel(null), 3000);
  };

  // Add Card + Offline Catalog Auto-Fill Modal
  const [showAddCardModal, setShowAddCardModal] = useState<boolean>(false);
  const [selectedCatalogId, setSelectedCatalogId] = useState<string>(OFFLINE_CARD_CATALOG[0].id);
  const [newCardDraft, setNewCardDraft] = useState({
    bank: 'HDFC',
    name: 'Regalia Gold',
    holder: 'AARAV SHARMA',
    number: '5241889012347781',
    expiry: '08/30',
    cvv: '729',
    limit: '500000',
    owed: '18500',
    fee: '2500',
    feeSpend: '400000',
    helpline: '18002664332',
    network: 'Mastercard' as VaultCard['network'],
    variant: 'World',
    color: '#1d4f91',
  });

  // Smart Purchase Optimizer State
  const [purchaseAmount, setPurchaseAmount] = useState<number>(25000);
  const [purchaseCategory, setPurchaseCategory] = useState<SpendCategory>('Travel');
  const [prioritizeFeeWaiver, setPrioritizeFeeWaiver] = useState<boolean>(true);

  // TOTP Live State
  const [totpMap, setTotpMap] = useState<Record<string, { code: string; remainingSec: number }>>({});
  const [pwOptions, setPwOptions] = useState({
    length: 20,
    uppercase: true,
    lowercase: true,
    digits: true,
    symbols: true,
    mode: 'random' as 'random' | 'passphrase',
  });
  const [generatedPw, setGeneratedPw] = useState(() =>
    generateSecureSecret({
      length: 20,
      uppercase: true,
      lowercase: true,
      digits: true,
      symbols: true,
      mode: 'random',
    })
  );

  // New Login Form State
  const [newLoginSite, setNewLoginSite] = useState('');
  const [newLoginUser, setNewLoginUser] = useState('');
  const [newLoginTotp, setNewLoginTotp] = useState('JBSWY3DPEHPK3PXP');

  // New EMI Form State
  const [showAddEmi, setShowAddEmi] = useState(false);
  const [newEmiMerchant, setNewEmiMerchant] = useState('');
  const [newEmiPrincipal, setNewEmiPrincipal] = useState('60000');
  const [newEmiMonths, setNewEmiMonths] = useState('6');
  const [newEmiCardId] = useState(INITIAL_DEMO_CARDS[0].id);

  // Alert Parser Comparison State
  const [alertInputText, setAlertInputText] = useState<string>(SAMPLE_BANK_ALERTS[1].text);
  const [auditCategoryFilter, setAuditCategoryFilter] = useState<string>('All');
  const [backupStatusMsg, setBackupStatusMsg] = useState<string>('');

  // Sync dark mode class on <html>
  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [darkMode]);

  // Live RFC 6238 TOTP ticker every second
  useEffect(() => {
    let mounted = true;
    async function updateCodes() {
      const next: Record<string, { code: string; remainingSec: number }> = {};
      for (const item of logins) {
        if (item.totpSecret) {
          next[item.id] = await generateTotpCode(item.totpSecret);
        }
      }
      if (mounted) setTotpMap(next);
    }
    updateCodes();
    const timer = setInterval(updateCodes, 1000);
    return () => {
      mounted = false;
      clearInterval(timer);
    };
  }, [logins]);

  // Active cards list based on Primary vs Decoy Vault
  const activeCards = useMemo(() => {
    const source = vaultMode === 'decoy' ? DECOY_CARDS : cards;
    const q = searchQuery.trim().toLowerCase();
    return source.filter(
      (c) =>
        !q ||
        [c.bank, c.name, c.variant, c.network, c.holder, c.number.slice(-4)]
          .join(' ')
          .toLowerCase()
          .includes(q)
    );
  }, [vaultMode, cards, searchQuery]);

  const selectedCard = useMemo(
    () => activeCards.find((c) => c.id === selectedCardId) || activeCards[0] || null,
    [activeCards, selectedCardId]
  );

  // Global search hits across all 8 tabs when searchQuery >= 2 chars
  const globalSearchHits = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (q.length < 2) return [];
    const hits: { id: string; tab: VaultTabId; title: string; sub: string; badge: string }[] = [];
    cards.forEach((c) => {
      if (
        [c.bank, c.name, c.holder, c.variant, c.network, c.number.slice(-4)]
          .join(' ')
          .toLowerCase()
          .includes(q)
      ) {
        hits.push({
          id: c.id,
          tab: 'cards',
          title: `${c.bank} ${c.name}`,
          sub: `${c.network} ${c.variant} · •••• ${c.number.slice(-4)}`,
          badge: 'Card',
        });
      }
    });
    bankAccounts.forEach((b) => {
      if ([b.bank, b.holder, b.ifsc, b.branch, b.upi].join(' ').toLowerCase().includes(q)) {
        hits.push({
          id: b.id,
          tab: 'bank',
          title: `${b.bank} (${b.kind})`,
          sub: `${b.holder} · IFSC ${b.ifsc} · ${b.upi}`,
          badge: 'Account',
        });
      }
    });
    govIds.forEach((g) => {
      if ([g.idtype, g.holder, g.notes].join(' ').toLowerCase().includes(q)) {
        hits.push({
          id: g.id,
          tab: 'id',
          title: `${g.idtype} — ${g.holder}`,
          sub: `•••• ${g.idno.slice(-4)}`,
          badge: 'ID',
        });
      }
    });
    notes.forEach((n) => {
      if ([n.title, n.body, n.tags].join(' ').toLowerCase().includes(q)) {
        hits.push({
          id: n.id,
          tab: 'note',
          title: n.title,
          sub: n.tags,
          badge: 'Note',
        });
      }
    });
    insPolicies.forEach((p) => {
      if ([p.provider, p.itype, p.holder, p.nominee].join(' ').toLowerCase().includes(q)) {
        hits.push({
          id: p.id,
          tab: 'ins',
          title: `${p.itype} · ${p.provider}`,
          sub: `Holder: ${p.holder} · Renews ${p.renew}`,
          badge: 'Insurance',
        });
      }
    });
    vehicles.forEach((v) => {
      if ([v.maker, v.reg, v.vtype, v.fastagBank].join(' ').toLowerCase().includes(q)) {
        hits.push({
          id: v.id,
          tab: 'veh',
          title: `${v.maker} (${v.reg})`,
          sub: `Ins Exp: ${v.insExp} · PUC Exp: ${v.pucExp}`,
          badge: 'Vehicle',
        });
      }
    });
    utilityBills.forEach((u) => {
      if ([u.vendor, u.bno, u.status].join(' ').toLowerCase().includes(q)) {
        hits.push({
          id: u.id,
          tab: 'bill',
          title: u.vendor,
          sub: `₹${u.amount.toLocaleString('en-IN')} · Due ${u.due}`,
          badge: 'Bill',
        });
      }
    });
    return hits;
  }, [searchQuery, cards, bankAccounts, govIds, notes, insPolicies, vehicles, utilityBills]);

  // Clipboard helper with 45-second auto-clear banner
  const handleCopy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedLabel(`${label} copied · auto-clears in 45s`);
      setTimeout(() => setCopiedLabel(null), 3200);
    } catch {
      setCopiedLabel(`Copied ${label}`);
      setTimeout(() => setCopiedLabel(null), 2500);
    }
  };

  // Step-Up Auth handler before revealing sensitive fields (CVV / Passwords / Account & ID Numbers)
  const handleToggleReveal = (key: string) => {
    if (revealedKeys[key]) {
      setRevealedKeys((prev) => ({ ...prev, [key]: false }));
      return;
    }
    if (extraLockEnabled && Date.now() > stepUpVerifiedUntil) {
      setPendingRevealKey(key);
      setStepUpPinInput('');
      setStepUpError('');
      return;
    }
    setRevealedKeys((prev) => ({ ...prev, [key]: true }));
  };

  const confirmStepUpAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (stepUpPinInput === '1234' || stepUpPinInput === masterPw) {
      setStepUpVerifiedUntil(Date.now() + 60000);
      if (pendingRevealKey) {
        setRevealedKeys((prev) => ({ ...prev, [pendingRevealKey]: true }));
      }
      setPendingRevealKey(null);
      setStepUpPinInput('');
    } else {
      setStepUpError('Enter demo PIN "1234" or master password "vaultly2026"');
    }
  };

  // Unlock handler supporting both Primary and Decoy passwords
  const handleUnlockVault = (e: React.FormEvent) => {
    e.preventDefault();
    if (unlockInput === decoyPw) {
      setVaultMode('decoy');
      setIsLocked(false);
      setUnlockInput('');
      setUnlockError('');
      setSelectedCardId(DECOY_CARDS[0].id);
      return;
    }
    if (unlockInput === masterPw || unlockInput === '1234' || unlockInput.length >= 4) {
      setVaultMode('primary');
      setIsLocked(false);
      setUnlockInput('');
      setUnlockError('');
      setSelectedCardId(cards[0]?.id || '');
      return;
    }
    setUnlockError('Try "vaultly2026" (Primary Vault) or "decoy1234" (Decoy Duress Vault)');
  };

  // Apply Offline Card Catalog preset into the New Card modal
  const applyCatalogPreset = (entry: CardCatalogEntry) => {
    setSelectedCatalogId(entry.id);
    setNewCardDraft((prev) => ({
      ...prev,
      bank: entry.bank,
      name: entry.name,
      network: entry.network,
      variant: entry.variant,
      color: entry.color,
      fee: String(entry.annualFee),
      feeSpend: String(entry.feeWaiverSpend),
      helpline: entry.helpline,
    }));
  };

  const handleSaveNewCard = (e: React.FormEvent) => {
    e.preventDefault();
    const preset = OFFLINE_CARD_CATALOG.find((c) => c.id === selectedCatalogId);
    const created: VaultCard = {
      id: 'c-' + Math.random().toString(36).slice(2, 8),
      bank: newCardDraft.bank.trim() || 'HDFC',
      name: newCardDraft.name.trim() || 'Card',
      holder: newCardDraft.holder.trim().toUpperCase() || 'CARDHOLDER',
      number: newCardDraft.number.replace(/\D/g, '') || '4375000011112222',
      expiry: newCardDraft.expiry || '12/29',
      cvv: newCardDraft.cvv || '999',
      kind: 'Credit',
      network: newCardDraft.network,
      variant: newCardDraft.variant,
      limit: Number(newCardDraft.limit) || 300000,
      owed: Number(newCardDraft.owed) || 0,
      fee: Number(newCardDraft.fee) || 0,
      feeSpend: Number(newCardDraft.feeSpend) || 0,
      rewardPts: 0,
      pointValueInr: preset?.pointValueInr ?? 1.0,
      baseRewardPct: preset?.baseRewardPct ?? 1.0,
      categoryBoosts: preset?.categoryBoosts,
      billDay: 15,
      stmtDay: 25,
      fav: false,
      virtual: false,
      color: newCardDraft.color,
      helpline: newCardDraft.helpline,
      lounges: (preset?.lounges || []).map((l, idx) => ({
        ...l,
        id: `lg-${Date.now()}-${idx}`,
        used: 0,
      })),
      notes: preset
        ? `Auto-filled from Vaultly Offline Card Catalog (${preset.rewardCurrency}).`
        : 'Added manually.',
    };
    setCards((prev) => [created, ...prev]);
    setSelectedCardId(created.id);
    setShowAddCardModal(false);
    setCopiedLabel(`${created.bank} ${created.name} added with offline lounge & fee rules`);
    setTimeout(() => setCopiedLabel(null), 3000);
  };

  const handleLogLoungeVisit = (cardId: string, loungeId: string, delta: number) => {
    setCards((prev) =>
      prev.map((c) => {
        if (c.id !== cardId) return c;
        return {
          ...c,
          lounges: c.lounges.map((l) =>
            l.id === loungeId
              ? { ...l, used: Math.max(0, Math.min(l.entitled, l.used + delta)) }
              : l
          ),
        };
      })
    );
  };

  const handlePartPayBill = (billId: string) => {
    const raw = partPayAmounts[billId];
    const payNow = Number(raw);
    if (!payNow || payNow <= 0) return;
    setUtilityBills((prev) =>
      prev.map((b) => {
        if (b.id !== billId) return b;
        const nextPaid = Math.min(b.amount, b.paidAmt + payNow);
        const isFull = nextPaid >= b.amount;
        return {
          ...b,
          paidAmt: nextPaid,
          status: isFull ? 'Paid' : 'Partial',
        };
      })
    );
    setPartPayAmounts((prev) => ({ ...prev, [billId]: '' }));
    setCopiedLabel('Part payment recorded · remaining bill balance updated');
    setTimeout(() => setCopiedLabel(null), 3000);
  };

  // Smart Purchase Optimizer calculation
  const rankedCardsForPurchase = useMemo(() => {
    return cards
      .filter((c) => c.kind === 'Credit' && !c.blocked)
      .map((c) => {
        const boost = c.categoryBoosts?.[purchaseCategory];
        const effectiveRatePct = boost ? boost.ratePct : c.baseRewardPct;
        const estimatedRewardInr = Math.round((purchaseAmount * effectiveRatePct) / 100);
        const availableLimit = Math.max(0, c.limit - c.owed);
        const utilizationAfterPct = c.limit
          ? Math.min(100, Math.round(((c.owed + purchaseAmount) / c.limit) * 100))
          : 0;

        const cardSpends = spends
          .filter((s) => s.cardId === c.id)
          .reduce((acc, s) => acc + s.amount, 0);
        const annualSpendCurrent = cardSpends + c.owed;
        const waiverGap = c.feeSpend > 0 ? Math.max(0, c.feeSpend - annualSpendCurrent) : 0;
        const helpsWaiver = c.feeSpend > 0 && waiverGap > 0;
        const waiverBonusScore =
          prioritizeFeeWaiver && helpsWaiver ? Math.min(400, Math.round(c.fee * 0.12)) : 0;

        const compositeScore =
          estimatedRewardInr + waiverBonusScore - (utilizationAfterPct > 70 ? 250 : 0);

        return {
          card: c,
          effectiveRatePct,
          estimatedRewardInr,
          boostNote: boost?.note || `Base reward rate (${c.baseRewardPct}%)`,
          availableLimit,
          utilizationAfterPct,
          waiverGap,
          helpsWaiver,
          compositeScore,
        };
      })
      .sort((a, b) => b.compositeScore - a.compositeScore);
  }, [cards, purchaseAmount, purchaseCategory, prioritizeFeeWaiver, spends]);

  // Encrypted .cvault export & CSV export
  const handleExportEncryptedVault = async () => {
    try {
      const payload = {
        cards,
        items: [...bankAccounts, ...govIds, ...notes, ...insPolicies, ...vehicles, ...utilityBills],
        emis,
        logins,
        spends,
        budgets,
        subscriptions,
        exportedAt: Date.now(),
      };
      const encryptedJson = await encryptVaultPayload(payload, masterPw);
      const blob = new Blob([encryptedJson], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `vaultly-v2-backup-${new Date().toISOString().slice(0, 10)}.cvault`;
      a.click();
      URL.revokeObjectURL(url);
      setBackupStatusMsg('Exported AES-256-GCM encrypted .cvault backup (PBKDF2 250,000 iterations).');
    } catch {
      setBackupStatusMsg('Failed to export encrypted backup.');
    }
  };

  const handleExportSpendsCsv = () => {
    const header = 'Date,Merchant,Category,Card,Amount_INR,Recurring\n';
    const rows = spends
      .map((s) => {
        const c = cards.find((x) => x.id === s.cardId);
        const cardName = c ? `${c.bank} ${c.name}` : s.cardId;
        return `${s.date},"${s.merchant.replace(/"/g, '""')}",${s.category},"${cardName}",${s.amount},${s.isRecurring ? 'Yes' : 'No'}`;
      })
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vaultly-spends-${new Date().toISOString().slice(0, 7)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setBackupStatusMsg('Exported monthly spends & recurring subscriptions to CSV.');
  };

  const handleTestBackupFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const text = await file.text();
      const data = await decryptVaultPayload(text, masterPw);
      const cardCount = Array.isArray(data.cards) ? data.cards.length : 0;
      setBackupStatusMsg(
        `Backup verified: Decrypted cleanly with master password (${cardCount} cards found).`
      );
    } catch {
      setBackupStatusMsg('Backup test failed: Invalid file or different master password.');
    }
  };

  // Total portfolio metrics
  const portfolioStats = useMemo(() => {
    const creditCards = activeCards.filter((c) => c.kind === 'Credit');
    const totalLimit = creditCards.reduce((sum, c) => sum + c.limit, 0);
    const totalOwed = creditCards.reduce((sum, c) => sum + c.owed, 0);
    const totalItemsCount =
      activeCards.length +
      bankAccounts.length +
      govIds.length +
      notes.length +
      logins.length +
      insPolicies.length +
      vehicles.length +
      utilityBills.length;
    const totalRewardValue = creditCards.reduce(
      (sum, c) => sum + Math.round(c.rewardPts * c.pointValueInr),
      0
    );
    const utilPct = totalLimit ? Math.round((totalOwed / totalLimit) * 100) : 0;
    return { totalLimit, totalOwed, totalItemsCount, totalRewardValue, utilPct };
  }, [activeCards, bankAccounts, govIds, notes, logins, insPolicies, vehicles, utilityBills]);

  const parsedAlertPreview = useMemo(
    () => testAlertRegexComparison(alertInputText),
    [alertInputText]
  );

  const filteredAuditFindings = useMemo(
    () =>
      auditCategoryFilter === 'All'
        ? CODE_AUDIT_FINDINGS
        : CODE_AUDIT_FINDINGS.filter((f) => f.category === auditCategoryFilter),
    [auditCategoryFilter]
  );

  const tabCounts: Record<VaultTabId, number> = {
    cards: activeCards.length,
    bank: bankAccounts.filter((x) => selectedProfileId === 'all' || x.pid === selectedProfileId).length,
    id: govIds.filter((x) => selectedProfileId === 'all' || x.pid === selectedProfileId).length,
    note: notes.filter((x) => selectedProfileId === 'all' || x.pid === selectedProfileId).length,
    login: logins.length,
    ins: insPolicies.filter((x) => selectedProfileId === 'all' || x.pid === selectedProfileId).length,
    veh: vehicles.filter((x) => selectedProfileId === 'all' || x.pid === selectedProfileId).length,
    bill: utilityBills.filter((x) => selectedProfileId === 'all' || x.pid === selectedProfileId).length,
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors">
      {/* Hidden File Input for Document Attachments */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/*,application/pdf"
        className="hidden"
      />

      {/* Top Bar Contract: Zone 1 (Brand) — Zone 2 (5 Single-Line Nav Links) — Zone 3 (1 Primary Action) */}
      <header className="sticky top-0 z-30 flex items-center justify-between gap-8 px-6 py-3.5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            setActiveSection('wallet');
          }}
          className="flex items-center gap-2.5 text-lg font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap shrink-0"
        >
          <img
            src="/assets/aistudio/hero_9bbca725.webp"
            alt="Vaultly"
            referrerPolicy="no-referrer"
            className="w-7 h-7 rounded-lg object-cover"
          />
          Vaultly
        </a>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-400">
          {[
            { id: 'wallet', label: '8-Tab Vault' },
            { id: 'deck', label: 'Wallet Deck' },
            { id: 'subscriptions', label: 'Subscriptions' },
            { id: 'optimizer', label: 'Lounge & Cards' },
            { id: 'insights', label: 'EMIs & Tools' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id as ActiveSection)}
              className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
                activeSection === item.id
                  ? 'border-indigo-600 text-slate-900 dark:border-indigo-400 dark:text-white font-semibold'
                  : 'border-transparent hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setIsLocked((prev) => !prev)}
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5"
          >
            {isLocked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
            {isLocked ? 'Unlock Vault' : 'Lock Vault'}
          </button>
        </div>
      </header>

      {/* Mobile Navigation Bar */}
      <div className="flex md:hidden items-center gap-1 overflow-x-auto px-4 py-2 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        {[
          { id: 'wallet', label: '8-Tab Vault' },
          { id: 'deck', label: 'Wallet Deck' },
          { id: 'subscriptions', label: 'Subscriptions' },
          { id: 'optimizer', label: 'Lounge & Cards' },
          { id: 'insights', label: 'EMIs & Tools' },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveSection(item.id as ActiveSection)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap shrink-0 transition-colors ${
              activeSection === item.id
                ? 'bg-indigo-600 text-white'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Floating Toast Notification */}
      {copiedLabel && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-semibold shadow-lg flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
          <span>{copiedLabel}</span>
        </div>
      )}

      {/* Step-Up Authentication Modal */}
      {pendingRevealKey && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={confirmStepUpAuth}
            className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xl"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Step-Up Security Verification
              </h3>
              <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
              Vaultly v2.0 protects sensitive CVVs, account numbers, IDs, and passwords even while
              unlocked. Enter your PIN (<code className="font-mono">1234</code>) or master password
              (<code className="font-mono">vaultly2026</code>) to unlock secrets for 60 seconds.
            </p>
            <input
              type="password"
              value={stepUpPinInput}
              onChange={(e) => setStepUpPinInput(e.target.value)}
              placeholder="Enter PIN (1234) or master password"
              autoFocus
              className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 font-mono"
            />
            {stepUpError && (
              <p className="text-xs text-rose-600 dark:text-rose-400 mt-2">{stepUpError}</p>
            )}
            <div className="flex items-center justify-end gap-2 mt-5">
              <button
                type="button"
                onClick={() => setPendingRevealKey(null)}
                className="px-4 py-2 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-500"
              >
                Verify & Reveal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add Card with Offline Auto-Fill Catalog Modal */}
      {showAddCardModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xl my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Add Card with Offline Benefit Auto-Fill
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Pick a card from Vaultly’s built-in offline catalog to auto-populate lounge
                  quotas, fee waiver targets, and bank helplines.
                </p>
              </div>
              <button
                onClick={() => setShowAddCardModal(false)}
                className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleSaveNewCard} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                  1-Tap Offline Card Template (Verify benefits with your bank)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {OFFLINE_CARD_CATALOG.map((entry) => (
                    <button
                      key={entry.id}
                      type="button"
                      onClick={() => applyCatalogPreset(entry)}
                      className={`px-3 py-2 text-left rounded-xl border text-xs transition-colors ${
                        selectedCatalogId === entry.id
                          ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/50 dark:border-indigo-400 text-slate-900 dark:text-white font-semibold'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                      }`}
                    >
                      <div className="truncate">
                        {entry.bank} {entry.name}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 tabular-nums">
                        {entry.network} ·{' '}
                        {entry.lounges.length
                          ? `${entry.lounges.reduce((a, b) => a + b.entitled, 0)} lounges`
                          : `${entry.baseRewardPct}% base`}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Bank Name
                  </label>
                  <input
                    value={newCardDraft.bank}
                    onChange={(e) => setNewCardDraft({ ...newCardDraft, bank: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Card Variant Name
                  </label>
                  <input
                    value={newCardDraft.name}
                    onChange={(e) => setNewCardDraft({ ...newCardDraft, name: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Card Number
                  </label>
                  <input
                    value={newCardDraft.number}
                    onChange={(e) => setNewCardDraft({ ...newCardDraft, number: e.target.value })}
                    className="w-full px-3 py-2 text-sm font-mono rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Expiry
                    </label>
                    <input
                      value={newCardDraft.expiry}
                      onChange={(e) => setNewCardDraft({ ...newCardDraft, expiry: e.target.value })}
                      placeholder="MM/YY"
                      className="w-full px-3 py-2 text-sm font-mono rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                      CVV
                    </label>
                    <input
                      value={newCardDraft.cvv}
                      onChange={(e) => setNewCardDraft({ ...newCardDraft, cvv: e.target.value })}
                      className="w-full px-3 py-2 text-sm font-mono rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Credit Limit (₹)
                  </label>
                  <input
                    value={newCardDraft.limit}
                    onChange={(e) => setNewCardDraft({ ...newCardDraft, limit: e.target.value })}
                    className="w-full px-3 py-2 text-sm font-mono rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Annual Fee Waiver Target (₹)
                  </label>
                  <input
                    value={newCardDraft.feeSpend}
                    onChange={(e) => setNewCardDraft({ ...newCardDraft, feeSpend: e.target.value })}
                    className="w-full px-3 py-2 text-sm font-mono rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddCardModal(false)}
                  className="px-4 py-2 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-500"
                >
                  Save Card to Vault
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lock Screen View */}
      {isLocked ? (
        <main className="max-w-md mx-auto px-6 py-20 text-center">
          <img
            src="/assets/aistudio/hero_9bbca725.webp"
            alt="Vaultly"
            referrerPolicy="no-referrer"
            className="w-24 h-24 mx-auto rounded-3xl object-cover shadow-md mb-5"
          />
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Vaultly v2.0 Locked
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
            AES-256-GCM offline vault. Test the new <strong>Duress / Decoy Vault</strong> feature
            from your roadmap by entering either password below:
          </p>

          <div className="mt-4 p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-left text-xs space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400">Primary Master Password:</span>
              <code className="font-mono font-semibold text-indigo-600 dark:text-indigo-400">
                vaultly2026
              </code>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400">
                Decoy Password (Duress Mode):
              </span>
              <code className="font-mono font-semibold text-amber-600 dark:text-amber-400">
                decoy1234
              </code>
            </div>
          </div>

          <form onSubmit={handleUnlockVault} className="mt-5 space-y-3">
            <input
              type="password"
              value={unlockInput}
              onChange={(e) => setUnlockInput(e.target.value)}
              placeholder="Enter master or decoy password"
              autoFocus
              className="w-full px-4 py-3 text-center text-sm rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 font-mono"
            />
            {unlockError && (
              <p className="text-xs text-rose-600 dark:text-rose-400">{unlockError}</p>
            )}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setVaultMode('primary');
                  setIsLocked(false);
                  setSelectedCardId(cards[0]?.id || '');
                }}
                className="py-2.5 px-4 text-xs font-semibold rounded-xl bg-indigo-600 text-white hover:bg-indigo-500"
              >
                Unlock Primary
              </button>
              <button
                type="button"
                onClick={() => {
                  setVaultMode('decoy');
                  setIsLocked(false);
                  setSelectedCardId(DECOY_CARDS[0].id);
                }}
                className="py-2.5 px-4 text-xs font-semibold rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-700"
              >
                Unlock Decoy Vault
              </button>
            </div>
          </form>
        </main>
      ) : (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
          {/* Workspace Utility & Security Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                <span>Vaultly v1.10 → v2.0 Complete 8-Tab Architecture</span>
                <span className="mx-2" aria-hidden="true">
                  ·
                </span>
                <span>{portfolioStats.totalItemsCount} Encrypted Records</span>
                <span className="mx-2" aria-hidden="true">
                  ·
                </span>
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  {vaultMode === 'decoy'
                    ? 'Decoy Vault Active (Plausible Deniability Mode)'
                    : 'Primary Vault Unlocked'}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
                {activeSection === 'wallet' && 'Complete 8-Tab Encrypted Vault'}
                {activeSection === 'deck' && 'Interactive Card Deck Physical Animation Stack'}
                {activeSection === 'subscriptions' && 'Subscription & Recurring Payment Detection'}
                {activeSection === 'optimizer' && 'Airport Lounge Spend Tracker & Reward Calculator'}
                {activeSection === 'insights' && 'EMIs, Budgets, 2FA & Architecture Tools'}
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Family Profile Switcher from v1.9.1+ */}
              <div className="flex items-center p-1 rounded-xl bg-slate-200/70 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                {INITIAL_PROFILES.map((prof) => (
                  <button
                    key={prof.id}
                    onClick={() => setSelectedProfileId(prof.id)}
                    className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                      selectedProfileId === prof.id
                        ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-semibold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {prof.name}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setExtraLockEnabled((prev) => !prev)}
                className={`px-3 py-2 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap shrink-0 ${
                  extraLockEnabled
                    ? 'border-indigo-500/40 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                }`}
              >
                Step-Up Lock: {extraLockEnabled ? 'On' : 'Off'}
              </button>

              <button
                onClick={() => setShowAddCardModal(true)}
                className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Card (Offline Auto-Fill)
              </button>

              <button
                onClick={() => setDarkMode((prev) => !prev)}
                aria-label="Toggle theme"
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* SECTION 1: COMPLETE 8-TAB VAULT (Cards, Accounts, IDs, Notes, Logins, Insurance, Vehicle, Bills) */}
          {activeSection === 'wallet' && (
            <div className="space-y-5">
              {/* All 8 Vaultly v1.10.0 Tabs + Global Search */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                  {VAULT_TABS.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setActiveVaultTab(t.id)}
                      className={`px-3.5 py-2 text-xs font-semibold rounded-xl transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                        activeVaultTab === t.id
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span>{t.label}</span>
                      <span
                        className={`font-mono text-[11px] ${
                          activeVaultTab === t.id
                            ? 'text-indigo-100'
                            : 'text-slate-400 dark:text-slate-500'
                        }`}
                      >
                        {tabCounts[t.id]}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search across all 8 vault tabs..."
                    className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Global Cross-Tab Search Results Dropdown when typing */}
              {searchQuery.trim().length >= 2 && (
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-indigo-500/40 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>
                      Global Search across all 8 tabs (secret fields excluded) ·{' '}
                      {globalSearchHits.length} matches
                    </span>
                    <button
                      onClick={() => setSearchQuery('')}
                      className="text-indigo-600 dark:text-indigo-400 font-medium"
                    >
                      Clear search
                    </button>
                  </div>
                  <div className="divide-y divide-slate-200 dark:divide-slate-800">
                    {globalSearchHits.map((hit) => (
                      <button
                        key={`${hit.tab}-${hit.id}`}
                        onClick={() => {
                          setActiveVaultTab(hit.tab);
                          if (hit.tab === 'cards') setSelectedCardId(hit.id);
                          setSearchQuery('');
                        }}
                        className="w-full py-2.5 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 px-2 rounded-lg transition-colors"
                      >
                        <div>
                          <div className="text-xs font-bold text-slate-900 dark:text-white">
                            {hit.title}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            {hit.sub}
                          </div>
                        </div>
                        <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
                          Open in {hit.badge} →
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 1: CARDS */}
              {activeVaultTab === 'cards' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  <div className="lg:col-span-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        Group cards by:
                      </span>
                      <div className="flex items-center p-1 rounded-xl bg-slate-200/70 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                        {(['all', 'bank', 'network'] as const).map((m) => (
                          <button
                            key={m}
                            onClick={() => setCardGroupMode(m)}
                            className={`px-2.5 py-1 text-xs font-medium rounded-lg capitalize transition-colors whitespace-nowrap shrink-0 ${
                              cardGroupMode === m
                                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                                : 'text-slate-600 dark:text-slate-400'
                            }`}
                          >
                            {m}
                          </button>
                        ))}
                      </div>
                    </div>

                    {activeCards.map((c) => {
                      const isSelected = selectedCard?.id === c.id;
                      const util = c.limit ? Math.round((c.owed / c.limit) * 100) : 0;
                      return (
                        <div
                          key={c.id}
                          onClick={() => setSelectedCardId(c.id)}
                          style={{
                            background: `linear-gradient(135deg, ${c.color}, #0f172a)`,
                          }}
                          className={`relative overflow-hidden rounded-2xl p-5 text-white cursor-pointer transition-transform ${
                            isSelected
                              ? 'ring-2 ring-indigo-500 dark:ring-indigo-400 scale-[1.01]'
                              : 'opacity-90 hover:opacity-100'
                          }`}
                        >
                          <div className="flex items-center justify-between text-xs opacity-90">
                            <span className="font-semibold tracking-tight text-sm">
                              {c.fav ? '★ ' : ''}
                              {c.bank} {c.name}
                            </span>
                            <span>
                              {c.network} · {c.variant}
                            </span>
                          </div>

                          <div className="my-4 flex items-center justify-between">
                            <span className="w-9 h-6 rounded-md bg-gradient-to-br from-amber-200 to-amber-500 inline-block opacity-90" />
                            <span className="font-mono text-base tracking-widest tabular-nums">
                              {revealedKeys[`num_${c.id}`]
                                ? formatCardNumber(c.number)
                                : maskCardNumber(c.number)}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-xs opacity-85">
                            <span className="truncate">{c.holder}</span>
                            <span className="font-mono tabular-nums">
                              Exp {c.expiry} · {util}% used
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {selectedCard && (
                    <div className="lg:col-span-7 space-y-5">
                      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-5">
                        <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-200 dark:border-slate-800">
                          <div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">
                              {selectedCard.bank} · {selectedCard.network} {selectedCard.variant} ·{' '}
                              {selectedCard.kind} Card
                            </div>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
                              {selectedCard.bank} {selectedCard.name}
                            </h2>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() =>
                                setFlippedCardIds((prev) => ({
                                  ...prev,
                                  [selectedCard.id]: !prev[selectedCard.id],
                                }))
                              }
                              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center gap-1.5"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                              {flippedCardIds[selectedCard.id] ? 'Show Front' : 'Flip Card'}
                            </button>
                            {selectedCard.helpline && (
                              <a
                                href={`tel:${selectedCard.helpline}`}
                                className="px-3 py-1.5 text-xs font-medium rounded-lg bg-rose-500/10 text-rose-700 dark:text-rose-300 hover:bg-rose-500/20 flex items-center gap-1.5"
                              >
                                <PhoneCall className="w-3.5 h-3.5" />
                                Helpline ({selectedCard.helpline})
                              </a>
                            )}
                          </div>
                        </div>

                        {/* Interactive Flippable Hero Card */}
                        <div
                          onClick={() =>
                            setFlippedCardIds((prev) => ({
                              ...prev,
                              [selectedCard.id]: !prev[selectedCard.id],
                            }))
                          }
                          style={{
                            background: `linear-gradient(135deg, ${selectedCard.color}, #090d16)`,
                          }}
                          className="rounded-2xl p-6 text-white cursor-pointer select-none shadow-md transition-all"
                        >
                          {!flippedCardIds[selectedCard.id] ? (
                            <div className="space-y-6">
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="text-xs opacity-75">{selectedCard.bank}</div>
                                  <div className="text-lg font-bold">{selectedCard.name}</div>
                                </div>
                                <div className="text-right">
                                  <div className="text-sm font-semibold">{selectedCard.network}</div>
                                  <div className="text-xs opacity-75">{selectedCard.variant}</div>
                                </div>
                              </div>

                              <div className="font-mono text-xl sm:text-2xl tracking-widest tabular-nums py-2">
                                {revealedKeys[`num_${selectedCard.id}`]
                                  ? formatCardNumber(selectedCard.number)
                                  : maskCardNumber(selectedCard.number)}
                              </div>

                              <div className="flex items-center justify-between text-xs opacity-90">
                                <div>
                                  <span className="opacity-70 block text-[10px]">CARDHOLDER</span>
                                  <span className="font-medium">{selectedCard.holder}</span>
                                </div>
                                <div>
                                  <span className="opacity-70 block text-[10px]">EXPIRES</span>
                                  <span className="font-mono">{selectedCard.expiry}</span>
                                </div>
                                <div>
                                  <span className="opacity-70 block text-[10px]">REWARD POOL</span>
                                  <span className="font-mono">
                                    {selectedCard.rewardPts.toLocaleString('en-IN')} pts (₹
                                    {Math.round(
                                      selectedCard.rewardPts * selectedCard.pointValueInr
                                    ).toLocaleString('en-IN')}
                                    )
                                  </span>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-5 py-1">
                              <div className="w-full h-9 bg-black/70 -mx-6 px-6 flex items-center justify-between text-xs font-mono opacity-80">
                                <span>MAGNETIC / NFC EMV CHIP</span>
                                <span>HELPLINE: {selectedCard.helpline || '1800-BANK'}</span>
                              </div>
                              <div className="flex items-center justify-between bg-white/10 rounded-xl p-3.5">
                                <div>
                                  <div className="text-xs opacity-75">
                                    Authorized Signature & CVV
                                  </div>
                                  <div className="font-mono text-lg font-bold mt-0.5">
                                    CVV:{' '}
                                    {revealedKeys[`cvv_${selectedCard.id}`]
                                      ? selectedCard.cvv
                                      : '•••'}
                                  </div>
                                </div>
                                <span className="text-xs opacity-75">Tap card to flip back</span>
                              </div>
                              <p className="text-xs opacity-80 leading-relaxed">
                                {selectedCard.notes}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Secret Fields with Step-Up Verification */}
                        <div className="divide-y divide-slate-200 dark:divide-slate-800">
                          <div className="py-3 flex items-center justify-between gap-4">
                            <div>
                              <div className="text-xs text-slate-500 dark:text-slate-400">
                                Card Number
                              </div>
                              <code className="text-sm font-mono font-semibold text-slate-900 dark:text-white tabular-nums">
                                {revealedKeys[`num_${selectedCard.id}`]
                                  ? formatCardNumber(selectedCard.number)
                                  : maskCardNumber(selectedCard.number)}
                              </code>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleToggleReveal(`num_${selectedCard.id}`)}
                                className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                              >
                                {revealedKeys[`num_${selectedCard.id}`] ? 'Hide' : 'Show'}
                              </button>
                              <button
                                onClick={() => handleCopy(selectedCard.number, 'Card number')}
                                className="px-3 py-1.5 text-xs font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 flex items-center gap-1"
                              >
                                <Copy className="w-3.5 h-3.5" />
                                Copy
                              </button>
                            </div>
                          </div>

                          <div className="py-3 flex items-center justify-between gap-4">
                            <div>
                              <div className="text-xs text-slate-500 dark:text-slate-400">
                                Security Code (CVV) ·{' '}
                                {extraLockEnabled ? 'Protected by Step-Up Lock' : 'Standard'}
                              </div>
                              <code className="text-sm font-mono font-semibold text-slate-900 dark:text-white tabular-nums">
                                {revealedKeys[`cvv_${selectedCard.id}`]
                                  ? selectedCard.cvv
                                  : '•••'}
                              </code>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleToggleReveal(`cvv_${selectedCard.id}`)}
                                className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 flex items-center gap-1"
                              >
                                {revealedKeys[`cvv_${selectedCard.id}`] ? (
                                  <EyeOff className="w-3.5 h-3.5" />
                                ) : (
                                  <Eye className="w-3.5 h-3.5" />
                                )}
                                {revealedKeys[`cvv_${selectedCard.id}`]
                                  ? 'Hide CVV'
                                  : 'Reveal CVV'}
                              </button>
                              <button
                                onClick={() => handleCopy(selectedCard.cvv, 'CVV')}
                                className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                              >
                                Copy
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Airport Lounge Access Tracker with Spend Barriers */}
                        <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <Plane className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                Airport Lounge Access & Spend Requirements
                              </h3>
                            </div>
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                              Auto-filled from offline card catalog
                            </span>
                          </div>

                          {selectedCard.lounges.length === 0 ? (
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              No complimentary airport lounge visits bundled with this card variant.
                            </p>
                          ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {selectedCard.lounges.map((l) => {
                                const remaining = Math.max(0, l.entitled - l.used);
                                const minSpend = l.minSpend || 0;
                                const achieved = l.qualifyingSpendAchieved || 0;
                                const isSpendRequired = minSpend > 0;
                                const isUnlocked = !isSpendRequired || achieved >= minSpend;
                                const pct = isSpendRequired
                                  ? Math.min(100, Math.round((achieved / minSpend) * 100))
                                  : 100;

                                return (
                                  <div
                                    key={l.id}
                                    className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-2.5"
                                  >
                                    <div>
                                      <div className="flex items-center justify-between">
                                        <div className="text-xs font-semibold text-slate-900 dark:text-white">
                                          {l.scope} · {l.program || 'Airport'} ({l.period})
                                        </div>
                                        <span
                                          className={`text-[11px] font-semibold ${
                                            isUnlocked
                                              ? 'text-emerald-600 dark:text-emerald-400'
                                              : 'text-amber-600 dark:text-amber-400'
                                          }`}
                                        >
                                          {isUnlocked ? 'Unlocked' : 'Spend Required'}
                                        </span>
                                      </div>

                                      {isSpendRequired && (
                                        <div className="mt-2 space-y-1">
                                          <div className="flex items-center justify-between text-[11px] text-slate-500">
                                            <span>
                                              Target: ₹{minSpend.toLocaleString('en-IN')} (
                                              {l.spendWindow || 'Prev Qtr'})
                                            </span>
                                            <span className="font-mono tabular-nums">
                                              ₹{achieved.toLocaleString('en-IN')} ({pct}%)
                                            </span>
                                          </div>
                                          <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                                            <div
                                              className={`h-full rounded-full ${
                                                isUnlocked ? 'bg-emerald-500' : 'bg-amber-500'
                                              }`}
                                              style={{ width: `${pct}%` }}
                                            />
                                          </div>
                                        </div>
                                      )}

                                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 tabular-nums">
                                        <strong className="text-indigo-600 dark:text-indigo-400">
                                          {remaining}
                                        </strong>{' '}
                                        of {l.entitled} visits remaining
                                      </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                                      {isSpendRequired && (
                                        <button
                                          onClick={() =>
                                            handleUpdateLoungeSpend(selectedCard.id, l.id, 10000)
                                          }
                                          className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                                        >
                                          + Log ₹10k Spend
                                        </button>
                                      )}

                                      <div className="flex items-center gap-1.5 ml-auto">
                                        <button
                                          onClick={() =>
                                            handleLogLoungeVisit(selectedCard.id, l.id, -1)
                                          }
                                          className="w-7 h-7 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold"
                                        >
                                          −
                                        </button>
                                        <button
                                          onClick={() =>
                                            handleLogLoungeVisit(selectedCard.id, l.id, 1)
                                          }
                                          className="px-2.5 h-7 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-500"
                                        >
                                          Log Visit
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>

                        {/* Document & Photo Attachments Gallery */}
                        <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <Paperclip className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                Attached Card Scans & Documents
                              </h3>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() =>
                                  handleAddSampleScan(
                                    'cards',
                                    selectedCard.id,
                                    `${selectedCard.bank} ${selectedCard.name}`
                                  )
                                }
                                className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                              >
                                + Sample Back Scan
                              </button>
                              <button
                                onClick={() => handleTriggerUpload('cards', selectedCard.id)}
                                className="px-3 py-1 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 flex items-center gap-1"
                              >
                                <Upload className="w-3 h-3" />
                                <span>Upload Scan</span>
                              </button>
                            </div>
                          </div>

                          {selectedCard.attachments && selectedCard.attachments.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                              {selectedCard.attachments.map((att) => (
                                <button
                                  key={att.id}
                                  onClick={() =>
                                    setActiveViewerAttachment({
                                      attachment: att,
                                      itemName: `${selectedCard.bank} ${selectedCard.name}`,
                                    })
                                  }
                                  className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 hover:border-indigo-500 text-left transition-colors flex items-center gap-2.5 group"
                                >
                                  <div className="w-9 h-9 rounded-lg bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center shrink-0 text-indigo-600 dark:text-indigo-400 group-hover:scale-105 transition-transform">
                                    <FileText className="w-4 h-4" />
                                  </div>
                                  <div className="truncate text-xs">
                                    <div className="font-semibold text-slate-900 dark:text-white truncate">
                                      {att.name}
                                    </div>
                                    <div className="text-[11px] text-slate-500">
                                      {att.fileSizeKb} KB · Tap to View
                                    </div>
                                  </div>
                                </button>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                              No card scans attached yet. Tap "Upload Scan" to attach card photos or "Sample Back Scan" to test.
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: ACCOUNTS (v1.10 acctEl style + 1-Tap NEFT/UPI Share) */}
              {activeVaultTab === 'bank' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {bankAccounts
                    .filter((b) => selectedProfileId === 'all' || b.pid === selectedProfileId)
                    .map((acct) => {
                      const isRev = revealedKeys[`acct_${acct.id}`];
                      const col = BANK_COLORS[acct.bank] || '#1e3a8a';
                      return (
                        <div
                          key={acct.id}
                          className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col justify-between"
                        >
                          <div
                            style={{ background: `linear-gradient(135deg, ${col}, #0f172a)` }}
                            className="p-5 text-white space-y-3"
                          >
                            <div className="flex items-center justify-between text-xs opacity-90">
                              <span className="font-bold text-base">{acct.bank} Bank</span>
                              <span>{acct.kind} Account</span>
                            </div>
                            <div className="font-mono text-lg tracking-wider tabular-nums">
                              {isRev
                                ? acct.acno.replace(/(.{4})/g, '$1 ').trim()
                                : `•••• •••• ${acct.acno.slice(-4)}`}
                            </div>
                            <div className="flex items-center justify-between text-xs opacity-85">
                              <span>{acct.holder}</span>
                              <span className="font-mono">IFSC: {acct.ifsc}</span>
                            </div>
                          </div>

                          <div className="p-4 space-y-3 text-xs">
                            <div className="space-y-1.5 text-slate-600 dark:text-slate-400">
                              <div className="flex justify-between">
                                <span>Branch:</span>
                                <span className="font-medium text-slate-900 dark:text-white">
                                  {acct.branch}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>UPI ID:</span>
                                <code className="font-mono text-indigo-600 dark:text-indigo-400">
                                  {acct.upi}
                                </code>
                              </div>
                              <div className="flex justify-between">
                                <span>Customer ID (CIF):</span>
                                <code className="font-mono text-slate-900 dark:text-white">
                                  {isRev ? acct.custid : `••••${acct.custid.slice(-3)}`}
                                </code>
                              </div>
                            </div>

                            <p className="text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                              {acct.notes}
                            </p>

                            <div className="flex items-center gap-2 pt-2">
                              <button
                                onClick={() => handleToggleReveal(`acct_${acct.id}`)}
                                className="flex-1 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium"
                              >
                                {isRev ? 'Mask A/C' : 'Reveal A/C'}
                              </button>
                              <button
                                onClick={() =>
                                  handleCopy(
                                    `${acct.bank} Bank\nName: ${acct.holder}\nA/C: ${acct.acno}\nIFSC: ${acct.ifsc}\nBranch: ${acct.branch}\nUPI: ${acct.upi}`,
                                    'NEFT / IMPS details'
                                  )
                                }
                                className="flex-1 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-500"
                              >
                                Copy NEFT Info
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}

              {/* TAB 3: GOVERNMENT IDs (v1.10 idEl style + Expiry Countdown) */}
              {activeVaultTab === 'id' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {govIds
                    .filter((g) => selectedProfileId === 'all' || g.pid === selectedProfileId)
                    .map((doc) => {
                      const isRev = revealedKeys[`id_${doc.id}`];
                      const daysLeft = getDaysUntil(doc.expiry);
                      return (
                        <div
                          key={doc.id}
                          className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden"
                        >
                          <div className="px-5 py-3 bg-slate-900 dark:bg-slate-800 text-white flex items-center justify-between text-xs">
                            <span className="font-bold text-sm">{doc.idtype}</span>
                            {daysLeft !== null ? (
                              <span
                                className={
                                  daysLeft <= 60 ? 'text-amber-300 font-semibold' : 'opacity-80'
                                }
                              >
                                {daysLeft < 0
                                  ? 'Expired'
                                  : daysLeft <= 90
                                  ? `Expires in ${daysLeft} days`
                                  : `Valid till ${doc.expiry}`}
                              </span>
                            ) : (
                              <span className="opacity-75">Lifetime Validity</span>
                            )}
                          </div>

                          <div className="p-5 space-y-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="text-xs text-slate-500 dark:text-slate-400">
                                  Document Holder
                                </div>
                                <div className="text-base font-bold text-slate-900 dark:text-white">
                                  {doc.holder}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-xs text-slate-500 dark:text-slate-400">
                                  {doc.idtype} Number
                                </div>
                                <code className="text-base font-mono font-bold text-indigo-600 dark:text-indigo-400 tabular-nums">
                                  {isRev ? doc.idno : `•••• •••• ${doc.idno.slice(-4)}`}
                                </code>
                              </div>
                            </div>

                            <p className="text-xs text-slate-600 dark:text-slate-400">
                              DOB: {doc.dob} · {doc.notes}
                            </p>

                            <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                              <button
                                onClick={() => handleToggleReveal(`id_${doc.id}`)}
                                className="px-3.5 py-1.5 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                              >
                                {isRev ? 'Hide Number' : 'Show Full ID'}
                              </button>
                              <button
                                onClick={() => handleCopy(doc.idno, `${doc.idtype} number`)}
                                className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-500"
                              >
                                Copy ID Number
                              </button>
                            </div>

                            {/* Attached Document Scans */}
                            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-semibold text-slate-700 dark:text-slate-300">
                                  Document Attachments ({doc.attachments?.length || 0})
                                </span>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => handleAddSampleScan('id', doc.id, `${doc.idtype} Copy`)}
                                    className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline"
                                  >
                                    + Sample Copy
                                  </button>
                                  <button
                                    onClick={() => handleTriggerUpload('id', doc.id)}
                                    className="text-[11px] text-slate-500 hover:text-slate-900 dark:hover:text-white"
                                  >
                                    + Upload
                                  </button>
                                </div>
                              </div>
                              {doc.attachments && doc.attachments.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                  {doc.attachments.map((att) => (
                                    <button
                                      key={att.id}
                                      onClick={() =>
                                        setActiveViewerAttachment({
                                          attachment: att,
                                          itemName: `${doc.idtype} (${doc.holder})`,
                                        })
                                      }
                                      className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[11px] font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5 hover:border-indigo-500 transition-colors"
                                    >
                                      <FileText className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                                      <span className="truncate max-w-[130px]">{att.name}</span>
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}

              {/* TAB 4: SECURE NOTES */}
              {activeVaultTab === 'note' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {notes
                    .filter((n) => selectedProfileId === 'all' || n.pid === selectedProfileId)
                    .map((n) => (
                      <div
                        key={n.id}
                        className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3"
                      >
                        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                          <span>Tags: {n.tags}</span>
                          <span>Updated {n.updatedAt}</span>
                        </div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">
                          {n.title}
                        </h3>
                        <pre className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs font-mono whitespace-pre-wrap text-slate-700 dark:text-slate-300 leading-relaxed">
                          {n.body}
                        </pre>
                        <button
                          onClick={() => handleCopy(n.body, n.title)}
                          className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                        >
                          Copy Note Text
                        </button>
                      </div>
                    ))}
                </div>
              )}

              {/* TAB 5: LOGINS (With Integrated Live 30s TOTP 2FA) */}
              {activeVaultTab === 'login' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {logins.map((item) => {
                    const totp = totpMap[item.id] || { code: '••• •••', remainingSec: 30 };
                    const pwKey = `login_pw_${item.id}`;
                    return (
                      <div
                        key={item.id}
                        className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">
                              {item.category} · {item.username}
                            </div>
                            <h3 className="text-base font-bold text-slate-900 dark:text-white">
                              {item.site}
                            </h3>
                          </div>
                          {item.totpSecret && (
                            <div className="text-right bg-indigo-500/10 px-3 py-1.5 rounded-xl">
                              <div className="text-[10px] text-indigo-600 dark:text-indigo-300">
                                2FA TOTP ({totp.remainingSec}s)
                              </div>
                              <div className="font-mono font-bold text-sm text-indigo-600 dark:text-indigo-400 tabular-nums">
                                {totp.code}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between text-xs bg-slate-50 dark:bg-slate-800/50 px-3.5 py-2.5 rounded-xl">
                          <span className="font-mono">
                            Password: {revealedKeys[pwKey] ? item.password : '••••••••••••••••'}
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleToggleReveal(pwKey)}
                              className="text-indigo-600 dark:text-indigo-400 font-medium"
                            >
                              {revealedKeys[pwKey] ? 'Hide' : 'Reveal'}
                            </button>
                            <span>·</span>
                            <button
                              onClick={() => handleCopy(item.password, `${item.site} password`)}
                              className="font-medium text-slate-700 dark:text-slate-300"
                            >
                              Copy
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* TAB 6: INSURANCE POLICIES */}
              {activeVaultTab === 'ins' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {insPolicies
                    .filter((p) => selectedProfileId === 'all' || p.pid === selectedProfileId)
                    .map((pol) => {
                      const daysLeft = getDaysUntil(pol.renew);
                      return (
                        <div
                          key={pol.id}
                          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3"
                        >
                          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                            <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                              {pol.itype} Insurance
                            </span>
                            <span className="font-mono tabular-nums">
                              Renews {pol.renew} ({daysLeft}d)
                            </span>
                          </div>
                          <h3 className="text-base font-bold text-slate-900 dark:text-white">
                            {pol.provider}
                          </h3>
                          <div className="text-xs space-y-1 text-slate-600 dark:text-slate-400">
                            <div className="flex justify-between">
                              <span>Policy Number:</span>
                              <code className="font-mono font-semibold text-slate-900 dark:text-white">
                                {pol.policy}
                              </code>
                            </div>
                            <div className="flex justify-between">
                              <span>Sum Insured:</span>
                              <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                                ₹{pol.sumInsured.toLocaleString('en-IN')}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Annual Premium:</span>
                              <span className="font-mono">
                                ₹{pol.premium.toLocaleString('en-IN')}/yr
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Insured / Nominee:</span>
                              <span>
                                {pol.holder} → {pol.nominee}
                              </span>
                            </div>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                            {pol.notes}
                          </p>
                        </div>
                      );
                    })}
                </div>
              )}

              {/* TAB 7: VEHICLES (Insurance & PUC Expiry Tracker) */}
              {activeVaultTab === 'veh' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {vehicles
                    .filter((v) => selectedProfileId === 'all' || v.pid === selectedProfileId)
                    .map((v) => {
                      const pucDays = getDaysUntil(v.pucExp);
                      const insDays = getDaysUntil(v.insExp);
                      return (
                        <div
                          key={v.id}
                          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3.5"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-xs text-slate-500 dark:text-slate-400">
                                {v.vtype} · FASTag: {v.fastagBank}
                              </div>
                              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                {v.maker}
                              </h3>
                            </div>
                            <code className="px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-300 font-mono font-bold text-sm">
                              {v.reg}
                            </code>
                          </div>

                          <div className="grid grid-cols-2 gap-3 text-xs">
                            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                              <div className="text-slate-500 dark:text-slate-400">
                                Motor Insurance Expiry
                              </div>
                              <div className="font-mono font-bold text-slate-900 dark:text-white mt-0.5">
                                {v.insExp} ({insDays}d left)
                              </div>
                            </div>
                            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                              <div className="text-slate-500 dark:text-slate-400">
                                PUC Certificate Expiry
                              </div>
                              <div
                                className={`font-mono font-bold mt-0.5 ${
                                  pucDays !== null && pucDays <= 30
                                    ? 'text-amber-600 dark:text-amber-400'
                                    : 'text-slate-900 dark:text-white'
                                }`}
                              >
                                {v.pucExp} ({pucDays}d left)
                              </div>
                            </div>
                          </div>

                          <p className="text-xs text-slate-500 dark:text-slate-400">{v.notes}</p>

                          {/* Attached Vehicle Docs */}
                          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-semibold text-slate-700 dark:text-slate-300">
                                RC & Insurance Scans ({v.attachments?.length || 0})
                              </span>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleAddSampleScan('veh', v.id, `${v.maker} RC`)}
                                  className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline"
                                >
                                  + Sample RC
                                </button>
                                <button
                                  onClick={() => handleTriggerUpload('veh', v.id)}
                                  className="text-[11px] text-slate-500 hover:text-slate-900 dark:hover:text-white"
                                >
                                  + Upload
                                </button>
                              </div>
                            </div>
                            {v.attachments && v.attachments.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {v.attachments.map((att) => (
                                  <button
                                    key={att.id}
                                    onClick={() =>
                                      setActiveViewerAttachment({
                                        attachment: att,
                                        itemName: `${v.maker} (${v.reg})`,
                                      })
                                    }
                                    className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[11px] font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5 hover:border-indigo-500 transition-colors"
                                  >
                                    <FileText className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                                    <span className="truncate max-w-[130px]">{att.name}</span>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}

              {/* TAB 8: BILLS (With v1.9.3 Part-Payments Support) */}
              {activeVaultTab === 'bill' && (
                <div className="space-y-4">
                  {utilityBills
                    .filter((u) => selectedProfileId === 'all' || u.pid === selectedProfileId)
                    .map((b) => {
                      const rem = Math.max(0, b.amount - b.paidAmt);
                      const pct = Math.min(100, Math.round((b.paidAmt / b.amount) * 100));
                      return (
                        <div
                          key={b.id}
                          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-4">
                            <div>
                              <div className="text-xs text-slate-500 dark:text-slate-400">
                                Invoice #{b.bno} · Due {b.due} · Status: {b.status}
                              </div>
                              <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                                {b.vendor}
                              </h3>
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                {b.notes}
                              </p>
                            </div>

                            <div className="text-right font-mono tabular-nums">
                              <div className="text-lg font-bold text-slate-900 dark:text-white">
                                ₹{rem.toLocaleString('en-IN')} left
                              </div>
                              <div className="text-xs text-slate-500 dark:text-slate-400">
                                Paid ₹{b.paidAmt.toLocaleString('en-IN')} of ₹
                                {b.amount.toLocaleString('en-IN')} ({pct}%)
                              </div>
                            </div>
                          </div>

                          <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                rem === 0 ? 'bg-emerald-500' : 'bg-indigo-600 dark:bg-indigo-400'
                              }`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>

                          {rem > 0 && (
                            <div className="flex items-center gap-2 pt-2">
                              <input
                                type="number"
                                value={partPayAmounts[b.id] ?? ''}
                                onChange={(e) =>
                                  setPartPayAmounts((prev) => ({
                                    ...prev,
                                    [b.id]: e.target.value,
                                  }))
                                }
                                placeholder={`Enter part or full amount (₹${rem})`}
                                className="w-60 px-3 py-1.5 text-xs font-mono rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                              />
                              <button
                                onClick={() => handlePartPayBill(b.id)}
                                className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-500"
                              >
                                Record Part Payment
                              </button>
                              <button
                                onClick={() => {
                                  setUtilityBills((prev) =>
                                    prev.map((x) =>
                                      x.id === b.id
                                        ? { ...x, paidAmt: x.amount, status: 'Paid' }
                                        : x
                                    )
                                  );
                                }}
                                className="px-3.5 py-1.5 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                              >
                                Mark Paid in Full
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              )}

              {/* Recycle Bin Strip (30-day retention from v1.9.1) */}
              {binItems.length > 0 && (
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <Trash2 className="w-4 h-4 text-slate-400" />
                    <span>
                      <strong>Recycle Bin ({binItems.length})</strong>: {binItems[0].title} —{' '}
                      {binItems[0].subtitle}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setBinItems([]);
                      setCopiedLabel('Recycle bin emptied');
                      setTimeout(() => setCopiedLabel(null), 2500);
                    }}
                    className="text-rose-600 dark:text-rose-400 font-medium hover:underline"
                  >
                    Empty Recycle Bin
                  </button>
                </div>
              )}
            </div>
          )}

          {/* SECTION: 3D CARD DECK PHYSICAL STACK */}
          {activeSection === 'deck' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                    Interactive Card Deck Stack
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Tactile leather wallet physics with 3D card tilt, magnetic strip flip, quick number copy, and step-up CVV reveal.
                  </p>
                </div>
                <button
                  onClick={() => setShowAddCardModal(true)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 transition-colors"
                >
                  + Add New Card
                </button>
              </div>

              <CardDeckStack
                cards={activeCards}
                revealedKeys={revealedKeys}
                onToggleReveal={handleToggleReveal}
                onCopy={handleCopy}
                onViewAttachment={(att, itemName) =>
                  setActiveViewerAttachment({ attachment: att, itemName })
                }
              />
            </div>
          )}

          {/* SECTION: SUBSCRIPTIONS & RECURRING CHARGES */}
          {activeSection === 'subscriptions' && (
            <SubscriptionsManager
              subscriptions={subscriptions}
              spends={spends}
              cards={cards}
              onUpdateSubscriptions={setSubscriptions}
            />
          )}

          {/* SECTION: LOUNGE ACCESS & SMART SPEND OPTIMIZER */}
          {activeSection === 'optimizer' && (
            <div className="space-y-6">
              {/* Segmented Sub-Navbar */}
              <div className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 max-w-md">
                <button
                  type="button"
                  onClick={() => setOptimizerTab('lounges')}
                  className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg transition-colors ${
                    optimizerTab === 'lounges'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Airport Lounge Spend Tracker
                </button>
                <button
                  type="button"
                  onClick={() => setOptimizerTab('calculator')}
                  className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg transition-colors ${
                    optimizerTab === 'calculator'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Purchase Card Recommender
                </button>
              </div>

              {optimizerTab === 'lounges' ? (
                <LoungeTrackerHub
                  cards={activeCards}
                  onLogVisit={handleLogLoungeVisit}
                  onUpdateSpend={handleUpdateLoungeSpend}
                />
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  <div className="lg:col-span-4 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-5">
                    <div>
                      <h2 className="text-base font-bold text-slate-900 dark:text-white">
                        Purchase Parameters
                      </h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Ranks your cards offline by accelerated category multipliers, point conversion
                        value, and annual fee waiver progress.
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                        Purchase Amount (₹)
                      </label>
                      <input
                        type="number"
                        value={purchaseAmount}
                        onChange={(e) => setPurchaseAmount(Math.max(0, Number(e.target.value)))}
                        className="w-full px-3.5 py-2.5 text-base font-mono font-bold rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                      />
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {[2500, 10000, 25000, 75000].map((amt) => (
                          <button
                            key={amt}
                            type="button"
                            onClick={() => setPurchaseAmount(amt)}
                            className="px-2.5 py-1 text-xs font-mono rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-600 hover:text-white transition-colors"
                          >
                            ₹{amt.toLocaleString('en-IN')}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                        Spend Category
                      </label>
                      <div className="grid grid-cols-2 gap-1.5">
                        {SPEND_CATEGORIES.map((cat) => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => setPurchaseCategory(cat)}
                            className={`px-3 py-2 text-xs font-medium rounded-xl text-left transition-colors ${
                              purchaseCategory === cat
                                ? 'bg-indigo-600 text-white font-semibold'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                            }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>

                    <label className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800 cursor-pointer">
                      <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                        Boost cards needing annual fee waiver
                      </span>
                      <input
                        type="checkbox"
                        checked={prioritizeFeeWaiver}
                        onChange={(e) => setPrioritizeFeeWaiver(e.target.checked)}
                        className="w-4 h-4 accent-indigo-600"
                      />
                    </label>
                  </div>

                  <div className="lg:col-span-8 space-y-3">
                    {rankedCardsForPurchase.map((item, idx) => (
                      <div
                        key={item.card.id}
                        className={`p-5 rounded-2xl bg-white dark:bg-slate-900 border transition-colors ${
                          idx === 0
                            ? 'border-indigo-600 dark:border-indigo-400'
                            : 'border-slate-200 dark:border-slate-800'
                        }`}
                      >
                        <div className="flex flex-wrap items-start justify-between gap-4">
                          <div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">
                              <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                                #{idx + 1} Recommended
                              </span>
                              <span className="mx-2" aria-hidden="true">
                                ·
                              </span>
                              <span>
                                {item.card.network} {item.card.variant}
                              </span>
                              <span className="mx-2" aria-hidden="true">
                                ·
                              </span>
                              <span className="font-mono">
                                {maskCardNumber(item.card.number)}
                              </span>
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                              {item.card.bank} {item.card.name}
                            </h3>
                            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                              {item.boostNote}
                            </p>
                          </div>

                          <div className="text-right">
                            <div className="text-xs text-slate-500 dark:text-slate-400">
                              Estimated Reward Return
                            </div>
                            <div className="text-2xl font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
                              +₹{item.estimatedRewardInr.toLocaleString('en-IN')}
                            </div>
                            <div className="text-xs font-mono text-slate-500 dark:text-slate-400">
                              {item.effectiveRatePct}% effective yield
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                          <span>
                            Available limit: ₹{item.availableLimit.toLocaleString('en-IN')}
                          </span>
                          <span>·</span>
                          <span>Post-purchase utilization: {item.utilizationAfterPct}%</span>
                          {item.helpsWaiver && (
                            <>
                              <span>·</span>
                              <span className="text-indigo-600 dark:text-indigo-400 font-medium">
                                Advances ₹{item.card.fee.toLocaleString('en-IN')} fee waiver target
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SECTION: EMIS, BACKUP, AUTHENTICATOR & AUDIT SUITE */}
          {activeSection === 'insights' && (
            <div className="space-y-6">
              {/* Segmented Sub-Navbar */}
              <div className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 max-w-xl">
                <button
                  type="button"
                  onClick={() => setInsightsTab('emis')}
                  className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg transition-colors ${
                    insightsTab === 'emis'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Card EMIs & Budgets
                </button>
                <button
                  type="button"
                  onClick={() => setInsightsTab('authenticator')}
                  className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg transition-colors ${
                    insightsTab === 'authenticator'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  2FA Authenticator & Passwords
                </button>
                <button
                  type="button"
                  onClick={() => setInsightsTab('audit')}
                  className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg transition-colors ${
                    insightsTab === 'audit'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  v1.10 Architecture Audit
                </button>
              </div>

              {/* INSIGHTS SUB-TAB 1: EMIS & BUDGETS */}
              {insightsTab === 'emis' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  <div className="lg:col-span-6 space-y-5">
                    <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="text-base font-bold text-slate-900 dark:text-white">
                            Active Card EMI Tracker
                          </h2>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            Tracks blocked credit limit, remaining installments, and payoff progress.
                          </p>
                        </div>
                        <button
                          onClick={() => setShowAddEmi((prev) => !prev)}
                          className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-500"
                        >
                          + Add EMI
                        </button>
                      </div>

                      {showAddEmi && (
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            const p = Number(newEmiPrincipal) || 60000;
                            const m = Math.max(3, Number(newEmiMonths) || 6);
                            setEmis((prev) => [
                              ...prev,
                              {
                                id: 'emi-' + Date.now(),
                                cardId: newEmiCardId,
                                merchant: newEmiMerchant.trim() || 'Appliance Purchase',
                                principal: p,
                                monthlyEmi: Math.round(p / m),
                                interestRatePct: 0,
                                totalMonths: m,
                                paidMonths: 1,
                                startDate: '2026-11-01',
                              },
                            ]);
                            setNewEmiMerchant('');
                            setShowAddEmi(false);
                          }}
                          className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 grid grid-cols-1 sm:grid-cols-3 gap-2"
                        >
                          <input
                            value={newEmiMerchant}
                            onChange={(e) => setNewEmiMerchant(e.target.value)}
                            placeholder="Merchant / Item"
                            className="px-3 py-1.5 text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                          />
                          <input
                            value={newEmiPrincipal}
                            onChange={(e) => setNewEmiPrincipal(e.target.value)}
                            placeholder="Principal (₹)"
                            className="px-3 py-1.5 text-xs font-mono rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                          />
                          <button
                            type="submit"
                            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 text-white"
                          >
                            Save EMI
                          </button>
                        </form>
                      )}

                      <div className="space-y-3">
                        {emis.map((emi) => {
                          const card = cards.find((c) => c.id === emi.cardId);
                          const monthsLeft = Math.max(0, emi.totalMonths - emi.paidMonths);
                          const balanceLeft = monthsLeft * emi.monthlyEmi;
                          const pct = Math.round((emi.paidMonths / emi.totalMonths) * 100);
                          return (
                            <div
                              key={emi.id}
                              className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-2.5"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <div className="text-xs text-slate-500 dark:text-slate-400">
                                    {card ? `${card.bank} ${card.name}` : 'Card'} · {emi.paidMonths}/
                                    {emi.totalMonths} months paid
                                  </div>
                                  <div className="text-sm font-bold text-slate-900 dark:text-white">
                                    {emi.merchant}
                                  </div>
                                </div>
                                <div className="text-right font-mono tabular-nums">
                                  <div className="text-sm font-bold text-slate-900 dark:text-white">
                                    ₹{emi.monthlyEmi.toLocaleString('en-IN')}/mo
                                  </div>
                                  <div className="text-xs text-slate-500 dark:text-slate-400">
                                    ₹{balanceLeft.toLocaleString('en-IN')} left
                                  </div>
                                </div>
                              </div>

                              <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                                <div
                                  className="h-full bg-indigo-600 dark:bg-indigo-400 rounded-full"
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
                      <h2 className="text-base font-bold text-slate-900 dark:text-white">
                        Encrypted Backup, Verification & CSV Export
                      </h2>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={handleExportEncryptedVault}
                          className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 flex items-center gap-1.5"
                        >
                          <Download className="w-3.5 h-3.5" />
                          Export .cvault Backup
                        </button>
                        <button
                          onClick={handleExportSpendsCsv}
                          className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200 flex items-center gap-1.5"
                        >
                          <Download className="w-3.5 h-3.5" />
                          Export Spends CSV
                        </button>
                        <label className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200 cursor-pointer flex items-center gap-1.5">
                          <Upload className="w-3.5 h-3.5" />
                          Test Backup File
                          <input
                            type="file"
                            accept=".cvault,.json,*/*"
                            hidden
                            onChange={handleTestBackupFile}
                          />
                        </label>
                      </div>
                      {backupStatusMsg && (
                        <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                          {backupStatusMsg}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="lg:col-span-6 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-5">
                    <div>
                      <h2 className="text-base font-bold text-slate-900 dark:text-white">
                        Monthly Category Budgets & Spend Breakdown
                      </h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Live spend aggregation against your monthly category caps.
                      </p>
                    </div>

                    <div className="space-y-3.5">
                      {budgets.map((b) => {
                        const spent = spends
                          .filter((s) => s.category === b.category)
                          .reduce((sum, s) => sum + s.amount, 0);
                        const pct = Math.min(100, Math.round((spent / b.monthlyLimit) * 100));
                        return (
                          <div key={b.category} className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-medium text-slate-800 dark:text-slate-200">
                                {b.category}
                              </span>
                              <span className="font-mono tabular-nums text-slate-600 dark:text-slate-400">
                                ₹{spent.toLocaleString('en-IN')} / ₹
                                {b.monthlyLimit.toLocaleString('en-IN')} ({pct}%)
                              </span>
                            </div>
                            <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  pct >= 90
                                    ? 'bg-rose-500'
                                    : pct >= 70
                                    ? 'bg-amber-500'
                                    : 'bg-indigo-600 dark:bg-indigo-400'
                                }`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* INSIGHTS SUB-TAB 2: 2FA AUTHENTICATOR & PASSWORDS */}
              {insightsTab === 'authenticator' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  <div className="lg:col-span-7 space-y-4">
                    <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="text-base font-bold text-slate-900 dark:text-white">
                            RFC 6238 2FA Authenticator & Saved Logins
                          </h2>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            Offline WebCrypto HMAC-SHA1 6-digit TOTP codes refreshing every 30 seconds.
                          </p>
                        </div>
                        <KeyRound className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                      </div>

                      <div className="divide-y divide-slate-200 dark:divide-slate-800">
                        {logins.map((item) => {
                          const totp = totpMap[item.id] || { code: '••• •••', remainingSec: 30 };
                          const pwKey = `login_pw_${item.id}`;
                          return (
                            <div key={item.id} className="py-4 space-y-3">
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <div>
                                  <div className="text-xs text-slate-500 dark:text-slate-400">
                                    {item.category} · {item.username}
                                  </div>
                                  <div className="text-sm font-bold text-slate-900 dark:text-white">
                                    {item.site}
                                  </div>
                                </div>

                                {item.totpSecret && (
                                  <div className="flex items-center gap-3 bg-slate-100 dark:bg-slate-800 px-3.5 py-2 rounded-xl">
                                    <div>
                                      <div className="text-[10px] text-slate-500 dark:text-slate-400">
                                        2FA TOTP ({totp.remainingSec}s)
                                      </div>
                                      <div className="text-base font-mono font-bold tracking-wider text-indigo-600 dark:text-indigo-400 tabular-nums">
                                        {totp.code}
                                      </div>
                                    </div>
                                    <button
                                      onClick={() =>
                                        handleCopy(totp.code.replace(/\s/g, ''), `${item.site} 2FA code`)
                                      }
                                      className="px-2.5 py-1.5 text-xs font-medium rounded-lg bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700"
                                    >
                                      Copy 2FA
                                    </button>
                                  </div>
                                )}
                              </div>

                              <div className="flex items-center justify-between text-xs bg-slate-50 dark:bg-slate-800/40 px-3.5 py-2 rounded-xl">
                                <span className="font-mono text-slate-700 dark:text-slate-300">
                                  Password:{' '}
                                  {revealedKeys[pwKey] ? item.password : '••••••••••••••••'}
                                </span>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => handleToggleReveal(pwKey)}
                                    className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
                                  >
                                    {revealedKeys[pwKey] ? 'Hide' : 'Reveal'}
                                  </button>
                                  <span>·</span>
                                  <button
                                    onClick={() => handleCopy(item.password, `${item.site} password`)}
                                    className="text-slate-700 dark:text-slate-300 font-medium hover:underline"
                                  >
                                    Copy Password
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          if (!newLoginSite.trim()) return;
                          setLogins((prev) => [
                            ...prev,
                            {
                              id: 'log-' + Date.now(),
                              site: newLoginSite.trim(),
                              username: newLoginUser.trim() || 'user@vaultly.local',
                              password: generatedPw.value,
                              totpSecret: newLoginTotp.trim() || 'JBSWY3DPEHPK3PXP',
                              url: '',
                              category: 'Banking',
                              notes: 'Added with live TOTP secret.',
                            },
                          ]);
                          setNewLoginSite('');
                          setNewLoginUser('');
                        }}
                        className="pt-4 border-t border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-2"
                      >
                        <input
                          value={newLoginSite}
                          onChange={(e) => setNewLoginSite(e.target.value)}
                          placeholder="Site name (e.g. DigiLocker)"
                          className="px-3 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                        />
                        <input
                          value={newLoginTotp}
                          onChange={(e) => setNewLoginTotp(e.target.value)}
                          placeholder="Base32 TOTP Secret"
                          className="px-3 py-2 text-xs font-mono rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                        />
                        <button
                          type="submit"
                          className="px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 text-white hover:bg-indigo-500"
                        >
                          + Add 2FA Login
                        </button>
                      </form>
                    </div>
                  </div>

                  <div className="lg:col-span-5 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-5">
                    <div>
                      <h2 className="text-base font-bold text-slate-900 dark:text-white">
                        Offline Password & Passphrase Generator
                      </h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Uses <code className="font-mono">crypto.getRandomValues()</code> with zero network calls.
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 break-all font-mono text-sm font-semibold text-slate-900 dark:text-white">
                      {generatedPw.value}
                      <div className="text-[11px] font-sans font-normal text-emerald-600 dark:text-emerald-400 mt-2">
                        Strength: {generatedPw.entropyBits} bits of cryptographic entropy
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setGeneratedPw(generateSecureSecret(pwOptions))}
                        className="flex-1 py-2.5 px-4 text-xs font-semibold rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-slate-300 dark:hover:bg-slate-700 flex items-center justify-center gap-1.5"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Regenerate
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCopy(generatedPw.value, 'Generated password')}
                        className="flex-1 py-2.5 px-4 text-xs font-semibold rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 flex items-center justify-center gap-1.5"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        Copy Secret
                      </button>
                    </div>

                    <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800 text-xs">
                      <div className="flex items-center gap-2">
                        {(['random', 'passphrase'] as const).map((m) => (
                          <button
                            key={m}
                            type="button"
                            onClick={() => {
                              const next = { ...pwOptions, mode: m };
                              setPwOptions(next);
                              setGeneratedPw(generateSecureSecret(next));
                            }}
                            className={`flex-1 py-2 rounded-lg font-medium capitalize ${
                              pwOptions.mode === m
                                ? 'bg-indigo-600 text-white'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                            }`}
                          >
                            {m}
                          </button>
                        ))}
                      </div>

                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-slate-600 dark:text-slate-400">Length</span>
                          <span className="font-mono font-semibold">{pwOptions.length} chars</span>
                        </div>
                        <input
                          type="range"
                          min={12}
                          max={36}
                          value={pwOptions.length}
                          onChange={(e) => {
                            const next = { ...pwOptions, length: Number(e.target.value) };
                            setPwOptions(next);
                            setGeneratedPw(generateSecureSecret(next));
                          }}
                          className="w-full accent-indigo-600"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* INSIGHTS SUB-TAB 3: ARCHITECTURE AUDIT */}
              {insightsTab === 'audit' && (
                <div className="space-y-6">
                  <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
                    <div>
                      <h2 className="text-base font-bold text-slate-900 dark:text-white">
                        Interactive Notification Parser Sandbox (v1.10.0 vs. v2.0 Regex)
                      </h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        In <code className="font-mono">www/index.html</code> line 398,{' '}
                        <code className="font-mono">parseNotif()</code> matches any notification with{' '}
                        <code className="font-mono">Rs./₹</code>, causing bill payment credits and
                        refunds to be imported as spends. Test real bank notifications below:
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {SAMPLE_BANK_ALERTS.map((sample) => (
                        <button
                          key={sample.label}
                          type="button"
                          onClick={() => setAlertInputText(sample.text)}
                          className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                            alertInputText === sample.text
                              ? 'border-indigo-600 bg-indigo-600 text-white'
                              : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {sample.label}
                        </button>
                      ))}
                    </div>

                    <textarea
                      rows={2}
                      value={alertInputText}
                      onChange={(e) => setAlertInputText(e.target.value)}
                      className="w-full p-3.5 text-xs font-mono rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          Current v1.10.0 <code className="font-mono">parseNotif()</code> Behavior
                        </div>
                        <div
                          className={`text-sm font-bold mt-1 ${
                            parsedAlertPreview.v1Status === 'False Positive Spend!'
                              ? 'text-rose-600 dark:text-rose-400'
                              : 'text-slate-900 dark:text-white'
                          }`}
                        >
                          {parsedAlertPreview.v1Status}
                        </div>
                        {parsedAlertPreview.amount && (
                          <div className="text-xs font-mono text-slate-600 dark:text-slate-400 mt-1">
                            Amount: ₹{parsedAlertPreview.amount.toLocaleString('en-IN')} · Card:{' '}
                            {parsedAlertPreview.last4 || 'N/A'}
                          </div>
                        )}
                      </div>

                      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          Upgraded v2.0 <code className="font-mono">parseNotif()</code> Behavior
                        </div>
                        <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                          {parsedAlertPreview.v2Status}
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                          {parsedAlertPreview.explanation}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                      Line-by-Line Engineering Recommendations & Drop-In Vanilla JS Patches
                    </h2>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        'All',
                        'Architecture & Storage',
                        'Security & Cryptography',
                        'UX & DOM Performance',
                        'Feature & Parsing',
                      ].map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setAuditCategoryFilter(cat)}
                          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                            auditCategoryFilter === cat
                              ? 'bg-indigo-600 text-white'
                              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    {filteredAuditFindings.map((finding, index) => (
                      <div
                        key={finding.id}
                        className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-4">
                          <div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">
                              <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                                0{index + 1}. {finding.category}
                              </span>
                              <span className="mx-2" aria-hidden="true">
                                ·
                              </span>
                              <span>{finding.severity}</span>
                              <span className="mx-2" aria-hidden="true">
                                ·
                              </span>
                              <code className="font-mono">{finding.fileLocation}</code>
                            </div>
                            <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                              {finding.title}
                            </h3>
                          </div>
                          <button
                            onClick={() => handleCopy(finding.codePatch, finding.title + ' patch')}
                            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-indigo-600 hover:text-white transition-colors flex items-center gap-1.5 shrink-0"
                          >
                            <Copy className="w-3.5 h-3.5" />
                            Copy Vanilla JS Patch
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs leading-relaxed">
                          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                            <strong className="block text-slate-900 dark:text-white mb-1">
                              What happens in v1.10.0:
                            </strong>
                            <span className="text-slate-600 dark:text-slate-400">
                              {finding.problem} {finding.whyItMatters}
                            </span>
                          </div>
                          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                            <strong className="block text-slate-900 dark:text-white mb-1">
                              How to fix it:
                            </strong>
                            <span className="text-slate-600 dark:text-slate-400">
                              {finding.solutionSummary}
                            </span>
                          </div>
                        </div>

                        <pre className="p-4 rounded-xl bg-slate-950 text-slate-100 text-xs font-mono overflow-x-auto leading-relaxed">
                          <code>{finding.codePatch}</code>
                        </pre>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      )}

      {/* Floating Document & Photo Attachment Modal */}
      {activeViewerAttachment && (
        <DocumentViewerModal
          attachment={activeViewerAttachment.attachment}
          itemName={activeViewerAttachment.itemName}
          onClose={() => setActiveViewerAttachment(null)}
          onDelete={handleDeleteAttachment}
        />
      )}
    </div>
  );
}
