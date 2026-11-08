import React, { useState } from 'react';
import {
  Plane,
  CheckCircle2,
  AlertCircle,
  Plus,
  Minus,
  TrendingUp,
  Clock,
  ShieldCheck,
  CreditCard,
  Users,
  Search,
} from 'lucide-react';
import { VaultCard, LoungeEntitlement } from '../data/cardCatalog';

interface LoungeTrackerHubProps {
  cards: VaultCard[];
  onUpdateLoungeVisit?: (cardId: string, loungeId: string, delta: number) => void;
  onLogVisit?: (cardId: string, loungeId: string, delta: number) => void;
  onUpdateLoungeSpend?: (cardId: string, loungeId: string, additionalSpend: number) => void;
  onUpdateSpend?: (cardId: string, loungeId: string, additionalSpend: number) => void;
}

export const LoungeTrackerHub: React.FC<LoungeTrackerHubProps> = ({
  cards,
  onUpdateLoungeVisit,
  onLogVisit,
  onUpdateLoungeSpend,
  onUpdateSpend,
}) => {
  const triggerLogVisit = onLogVisit ?? onUpdateLoungeVisit ?? (() => {});
  const triggerUpdateSpend = onUpdateSpend ?? onUpdateLoungeSpend ?? (() => {});
  const [filterScope, setFilterScope] = useState<'All' | 'Domestic' | 'International'>('All');
  const [spendInputLoungeId, setSpendInputLoungeId] = useState<string | null>(null);
  const [spendAddAmount, setSpendAddAmount] = useState<string>('15000');
  const [searchFilter, setSearchFilter] = useState<string>('');

  // Extract all lounge entitlements flattened with their parent card info
  const allLoungeItems = cards
    .flatMap((c) =>
      c.lounges.map((l) => ({
        card: c,
        lounge: l,
      }))
    )
    .filter((item) => {
      if (filterScope !== 'All' && item.lounge.scope !== filterScope) return false;
      if (searchFilter.trim()) {
        const q = searchFilter.toLowerCase();
        return (
          item.card.bank.toLowerCase().includes(q) ||
          item.card.name.toLowerCase().includes(q) ||
          (item.lounge.program || '').toLowerCase().includes(q)
        );
      }
      return true;
    });

  const totalDomesticVisitsLeft = cards.reduce((acc, c) => {
    return (
      acc +
      c.lounges
        .filter((l) => l.scope === 'Domestic')
        .reduce((sum, l) => sum + Math.max(0, l.entitled - l.used), 0)
    );
  }, 0);

  const totalIntVisitsLeft = cards.reduce((acc, c) => {
    return (
      acc +
      c.lounges
        .filter((l) => l.scope === 'International')
        .reduce((sum, l) => sum + Math.max(0, l.entitled - l.used), 0)
    );
  }, 0);

  const handleApplySpend = (cardId: string, loungeId: string) => {
    const val = Number(spendAddAmount);
    if (!val || val <= 0) return;
    triggerUpdateSpend(cardId, loungeId, val);
    setSpendInputLoungeId(null);
    setSpendAddAmount('15000');
  };

  return (
    <div className="space-y-6">
      {/* Overview Metric Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Domestic Visits Available
          </div>
          <div className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white mt-1 tabular-nums">
            {totalDomesticVisitsLeft}
            <span className="text-sm font-normal text-slate-500 ml-1.5">passes</span>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-2 flex items-center gap-1.5">
            <Plane className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Across {cards.filter((c) => c.lounges.some((l) => l.scope === 'Domestic')).length} airport-eligible cards</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            International Priority Visits
          </div>
          <div className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white mt-1 tabular-nums">
            {totalIntVisitsLeft}
            <span className="text-sm font-normal text-slate-500 ml-1.5">passes</span>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-2 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Priority Pass / Dreamfolks global network</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Upcoming Period Reset
          </div>
          <div className="text-xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
            Q4 2026 Reset
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-2 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            <span>Quarterly quotas refresh on Jan 1, 2027</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
        <div className="flex items-center gap-1.5">
          {(['All', 'Domestic', 'International'] as const).map((sc) => (
            <button
              key={sc}
              onClick={() => setFilterScope(sc)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                filterScope === sc
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {sc} Lounges
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Search bank, card, or program..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Cards & Lounges Detailed Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {allLoungeItems.map(({ card, lounge }) => {
          const minSpend = lounge.minSpend || 0;
          const currentSpend = lounge.qualifyingSpendAchieved || 0;
          const isSpendRequired = minSpend > 0;
          const isUnlocked = !isSpendRequired || currentSpend >= minSpend;
          const spendProgressPct = isSpendRequired
            ? Math.min(100, Math.round((currentSpend / minSpend) * 100))
            : 100;
          const remainingVisits = Math.max(0, lounge.entitled - lounge.used);

          return (
            <div
              key={`${card.id}-${lounge.id}`}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between"
            >
              <div>
                {/* Header Row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-3 h-9 rounded-full shrink-0"
                      style={{ backgroundColor: card.color || '#4f46e5' }}
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900 dark:text-white">
                          {card.bank} {card.name}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                          •••• {card.number.slice(-4)}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-2">
                        <span>{lounge.scope} Lounge</span>
                        <span aria-hidden="true">·</span>
                        <span>{lounge.program || 'Airport Lounge'}</span>
                        <span aria-hidden="true">·</span>
                        <span>{lounge.period}ly Quota</span>
                      </div>
                    </div>
                  </div>

                  {/* Status Indicator (Plain text unboxed with dot per Anti-Slop discipline) */}
                  <div className="flex items-center gap-1.5 text-xs font-semibold">
                    {isUnlocked ? (
                      <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" />
                        Unlocked & Ready
                      </span>
                    ) : (
                      <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        Spend Target Required
                      </span>
                    )}
                  </div>
                </div>

                {/* Spend Requirement & Tracking Bar */}
                <div className="mt-4 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                      {isSpendRequired
                        ? `Spend Requirement (${lounge.spendWindow || 'Previous Quarter'})`
                        : 'Unconditional Benefit (No Spend Barrier)'}
                    </span>
                    <span className="font-mono tabular-nums text-slate-600 dark:text-slate-400">
                      {isSpendRequired
                        ? `₹${currentSpend.toLocaleString('en-IN')} / ₹${minSpend.toLocaleString('en-IN')}`
                        : 'Free for Cardholder'}
                    </span>
                  </div>

                  {isSpendRequired && (
                    <div className="space-y-1.5">
                      <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            isUnlocked ? 'bg-emerald-500' : 'bg-amber-500'
                          }`}
                          style={{ width: `${spendProgressPct}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span>{spendProgressPct}% qualifying spend completed</span>
                        {!isUnlocked && (
                          <span className="text-amber-600 dark:text-amber-400 font-medium">
                            ₹{(minSpend - currentSpend).toLocaleString('en-IN')} more needed
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Log spend toggle button */}
                  {isSpendRequired && (
                    <div className="mt-2.5 pt-2 border-t border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
                      {spendInputLoungeId === lounge.id ? (
                        <div className="flex items-center gap-2 w-full">
                          <input
                            type="number"
                            value={spendAddAmount}
                            onChange={(e) => setSpendAddAmount(e.target.value)}
                            placeholder="Add spend ₹"
                            className="w-28 px-2 py-1 text-xs font-mono rounded bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white"
                          />
                          <button
                            onClick={() => handleApplySpend(card.id, lounge.id)}
                            className="px-2.5 py-1 text-xs font-semibold rounded bg-indigo-600 text-white hover:bg-indigo-500"
                          >
                            Add
                          </button>
                          <button
                            onClick={() => setSpendInputLoungeId(null)}
                            className="px-2 py-1 text-xs rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setSpendInputLoungeId(lounge.id)}
                          className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>+ Log Qualifying Spend towards this Lounge</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Guest access & Notes */}
                {lounge.guestAccess && (
                  <div className="mt-3 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{lounge.guestAccess}</span>
                  </div>
                )}
              </div>

              {/* Bottom Visits Counter Bar */}
              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Visits Remaining</div>
                  <div className="text-lg font-bold text-slate-900 dark:text-white tabular-nums">
                    {remainingVisits}{' '}
                    <span className="text-xs font-normal text-slate-500">
                      of {lounge.entitled} visits ({lounge.used} used)
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => triggerLogVisit(card.id, lounge.id, -1)}
                    disabled={lounge.used <= 0}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Undo Visit"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => triggerLogVisit(card.id, lounge.id, 1)}
                    disabled={remainingVisits <= 0}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 text-xs font-semibold flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
                  >
                    <Plane className="w-3.5 h-3.5" />
                    <span>Log Visit</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
