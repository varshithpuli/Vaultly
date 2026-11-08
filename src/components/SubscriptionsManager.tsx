import React, { useState } from 'react';
import {
  RefreshCw,
  Plus,
  AlertTriangle,
  ExternalLink,
  Calendar,
  CreditCard,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  Trash2,
  Search,
} from 'lucide-react';
import {
  SubscriptionItem,
  detectSubscriptionsFromSpends,
} from '../data/subscriptionsData';
import { VaultSpend, VaultCard } from '../data/cardCatalog';

interface SubscriptionsManagerProps {
  subscriptions: SubscriptionItem[];
  spends: VaultSpend[];
  cards: VaultCard[];
  onAddSubscription?: (sub: SubscriptionItem) => void;
  onUpdateSubscriptionStatus?: (id: string, status: SubscriptionItem['status']) => void;
  onDeleteSubscription?: (id: string) => void;
  onUpdateSubscriptions?: React.Dispatch<React.SetStateAction<SubscriptionItem[]>>;
  onScanComplete?: (count: number) => void;
}

export const SubscriptionsManager: React.FC<SubscriptionsManagerProps> = ({
  subscriptions,
  spends,
  cards,
  onAddSubscription,
  onUpdateSubscriptionStatus,
  onDeleteSubscription,
  onUpdateSubscriptions,
  onScanComplete,
}) => {
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [scanMessage, setScanMessage] = useState<string | null>(null);

  const addSub = (sub: SubscriptionItem) => {
    if (onAddSubscription) {
      onAddSubscription(sub);
    } else if (onUpdateSubscriptions) {
      onUpdateSubscriptions((prev) => [sub, ...prev]);
    }
  };

  const updateStatus = (id: string, status: SubscriptionItem['status']) => {
    if (onUpdateSubscriptionStatus) {
      onUpdateSubscriptionStatus(id, status);
    } else if (onUpdateSubscriptions) {
      onUpdateSubscriptions((prev) =>
        prev.map((s) => (s.id === id ? { ...s, status } : s))
      );
    }
  };

  const deleteSub = (id: string) => {
    if (onDeleteSubscription) {
      onDeleteSubscription(id);
    } else if (onUpdateSubscriptions) {
      onUpdateSubscriptions((prev) => prev.filter((s) => s.id !== id));
    }
  };

  // New subscription draft
  const [draftMerchant, setDraftMerchant] = useState('');
  const [draftBrand, setDraftBrand] = useState('');
  const [draftAmount, setDraftAmount] = useState('499');
  const [draftCycle, setDraftCycle] = useState<SubscriptionItem['cycle']>('Monthly');
  const [draftCategory, setDraftCategory] = useState<SubscriptionItem['category']>('Entertainment');
  const [draftCardId, setDraftCardId] = useState<string>(cards[0]?.id || '');
  const [draftNextRenewal, setDraftNextRenewal] = useState('2026-12-01');

  // Metrics
  const activeSubs = subscriptions.filter((s) => s.status !== 'Cancelled');
  const monthlyTotal = activeSubs.reduce((sum, s) => {
    if (s.cycle === 'Monthly') return sum + s.amount;
    if (s.cycle === 'Quarterly') return sum + Math.round(s.amount / 3);
    if (s.cycle === 'Yearly') return sum + Math.round(s.amount / 12);
    return sum + s.amount;
  }, 0);
  const annualTotal = monthlyTotal * 12;

  const handleScanSpends = () => {
    const res = detectSubscriptionsFromSpends(spends, subscriptions);
    if (res.detectedCount > 0) {
      res.newSubscriptions.forEach((sub) => addSub(sub));
      setScanMessage(`Detected ${res.detectedCount} new recurring subscription(s) from spend logs!`);
      if (onScanComplete) onScanComplete(res.detectedCount);
    } else {
      setScanMessage('All recurring spends and known subscriptions are up to date.');
    }
    setTimeout(() => setScanMessage(null), 4000);
  };

  const handleSaveDraft = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draftMerchant.trim()) return;

    const newSub: SubscriptionItem = {
      id: 'sub-' + Math.random().toString(36).slice(2, 8),
      merchant: draftMerchant.trim(),
      brand: draftBrand.trim() || draftMerchant.trim(),
      category: draftCategory,
      amount: Number(draftAmount) || 0,
      cycle: draftCycle,
      cardId: draftCardId || cards[0]?.id || '',
      lastChargeDate: new Date().toISOString().slice(0, 10),
      nextRenewalDate: draftNextRenewal || '2026-12-01',
      status: 'Active',
      autoRenew: true,
      notes: 'Manually tracked subscription.',
      reminderDaysBefore: 3,
    };

    addSub(newSub);
    setShowAddModal(false);
    setDraftMerchant('');
    setDraftBrand('');
    setDraftAmount('499');
  };

  const filteredSubs = subscriptions.filter((s) => {
    if (filterCategory !== 'All' && s.category !== filterCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        s.merchant.toLowerCase().includes(q) ||
        s.brand.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner & Scanner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Monthly Auto-Debit Commitment
          </div>
          <div className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white mt-1 tabular-nums font-mono">
            ₹{monthlyTotal.toLocaleString('en-IN')}
            <span className="text-sm font-normal text-slate-500 ml-1">/mo</span>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-2 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>{activeSubs.length} active recurring plans</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Projected Annual Spend
          </div>
          <div className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white mt-1 tabular-nums font-mono">
            ₹{annualTotal.toLocaleString('en-IN')}
            <span className="text-sm font-normal text-slate-500 ml-1">/yr</span>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-2 flex items-center gap-1.5">
            <CreditCard className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Across {new Set(activeSubs.map((s) => s.cardId)).size} cards</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Recurring Spend Scanner
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              Analyze bank SMS & UPI spend logs to detect hidden subscriptions.
            </div>
          </div>
          <button
            onClick={handleScanSpends}
            className="mt-3 px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 transition-colors flex items-center justify-center gap-1.5 w-full"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Scan Spends for Subscriptions</span>
          </button>
        </div>
      </div>

      {scanMessage && (
        <div className="p-3.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-xs text-indigo-900 dark:text-indigo-200 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
          <span>{scanMessage}</span>
        </div>
      )}

      {/* Filter and Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
        <div className="flex items-center gap-1 overflow-x-auto">
          {['All', 'Entertainment', 'Cloud & Storage', 'Productivity', 'Utilities', 'Shopping'].map(
            (cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                  filterCategory === cat
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {cat}
              </button>
            )
          )}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-56">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search subscriptions..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
            />
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Subscription</span>
          </button>
        </div>
      </div>

      {/* Subscriptions List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredSubs.map((sub) => {
          const card = cards.find((c) => c.id === sub.cardId);
          const daysToRenew = Math.ceil(
            (new Date(sub.nextRenewalDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
          );
          const isRenewingSoon = daysToRenew <= 7 && daysToRenew >= 0;

          return (
            <div
              key={sub.id}
              className={`p-5 rounded-2xl bg-white dark:bg-slate-900 border transition-all ${
                sub.status === 'Cancelled'
                  ? 'opacity-60 border-slate-200 dark:border-slate-800'
                  : isRenewingSoon
                  ? 'border-amber-300 dark:border-amber-700/60 shadow-xs'
                  : 'border-slate-200 dark:border-slate-800 shadow-xs'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-bold text-sm text-slate-700 dark:text-slate-300">
                    {sub.brand.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {sub.merchant}
                    </h3>
                    <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                      <span>{sub.category}</span>
                      <span aria-hidden="true">·</span>
                      <span>{sub.cycle}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-base font-bold text-slate-900 dark:text-white font-mono tabular-nums">
                    ₹{sub.amount.toLocaleString('en-IN')}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    per {sub.cycle === 'Monthly' ? 'month' : sub.cycle === 'Yearly' ? 'year' : 'qtr'}
                  </div>
                </div>
              </div>

              {/* Renewal info & Linked Card */}
              <div className="mt-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Next Renewal:</span>
                  <span className="font-medium text-slate-900 dark:text-white font-mono">
                    {sub.nextRenewalDate} (
                    {daysToRenew > 0
                      ? `in ${daysToRenew} days`
                      : daysToRenew === 0
                      ? 'today'
                      : `${Math.abs(daysToRenew)} days ago`}
                    )
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Payment Card:</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    {card ? `${card.bank} ${card.name} (•••• ${card.number.slice(-4)})` : 'None specified'}
                  </span>
                </div>

                {isRenewingSoon && sub.status === 'Active' && (
                  <div className="pt-1.5 border-t border-amber-200/60 dark:border-amber-800/60 flex items-center gap-1.5 text-amber-700 dark:text-amber-300 font-semibold text-[11px]">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>Renewing in {daysToRenew} days · Cancel before charge if not needed</span>
                  </div>
                )}
              </div>

              {/* Actions & Status row */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      updateStatus(
                        sub.id,
                        sub.status === 'Active' ? 'Cancelled' : 'Active'
                      )
                    }
                    className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
                      sub.status === 'Active'
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-rose-50 hover:text-rose-600'
                        : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                    }`}
                  >
                    {sub.status === 'Active' ? 'Cancel Subscription' : 'Mark as Resumed'}
                  </button>

                  {sub.cancellationUrl && (
                    <a
                      href={sub.cancellationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 text-xs font-medium rounded-lg text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 flex items-center gap-1"
                    >
                      <span>Manage at {sub.brand}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>

                <button
                  onClick={() => {
                    deleteSub(sub.id);
                  }}
                  className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                  title="Delete from Vaultly"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Subscription Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveDraft}
            className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xl space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Add Subscription / Auto-Debit
              </h2>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white"
              >
                Close
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Subscription Name
                </label>
                <input
                  required
                  value={draftMerchant}
                  onChange={(e) => setDraftMerchant(e.target.value)}
                  placeholder="e.g. Netflix Ultra HD"
                  className="w-full px-3 py-2 text-sm rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Brand Name
                </label>
                <input
                  value={draftBrand}
                  onChange={(e) => setDraftBrand(e.target.value)}
                  placeholder="e.g. Netflix"
                  className="w-full px-3 py-2 text-sm rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  required
                  value={draftAmount}
                  onChange={(e) => setDraftAmount(e.target.value)}
                  className="w-full px-3 py-2 text-sm font-mono rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Billing Cycle
                </label>
                <select
                  value={draftCycle}
                  onChange={(e) => setDraftCycle(e.target.value as SubscriptionItem['cycle'])}
                  className="w-full px-3 py-2 text-sm rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                >
                  <option value="Monthly">Monthly</option>
                  <option value="Quarterly">Quarterly</option>
                  <option value="Yearly">Yearly</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Category
                </label>
                <select
                  value={draftCategory}
                  onChange={(e) =>
                    setDraftCategory(e.target.value as SubscriptionItem['category'])
                  }
                  className="w-full px-3 py-2 text-sm rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                >
                  <option value="Entertainment">Entertainment</option>
                  <option value="Cloud & Storage">Cloud & Storage</option>
                  <option value="Productivity">Productivity</option>
                  <option value="Utilities">Utilities</option>
                  <option value="Fitness">Fitness</option>
                  <option value="Shopping">Shopping</option>
                  <option value="Food">Food</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Linked Card
                </label>
                <select
                  value={draftCardId}
                  onChange={(e) => setDraftCardId(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                >
                  {cards.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.bank} {c.name} (•••• {c.number.slice(-4)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Next Renewal Date
                </label>
                <input
                  type="date"
                  value={draftNextRenewal}
                  onChange={(e) => setDraftNextRenewal(e.target.value)}
                  className="w-full px-3 py-2 text-sm font-mono rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-500"
              >
                Save Subscription
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
