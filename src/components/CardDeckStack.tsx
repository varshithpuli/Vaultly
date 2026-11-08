import React, { useState } from 'react';
import {
  CreditCard,
  Copy,
  Check,
  Eye,
  EyeOff,
  RotateCw,
  Star,
  FileText,
  Plane,
  Sparkles,
  PhoneCall,
  ShieldCheck,
  Layers,
} from 'lucide-react';
import { VaultCard } from '../data/cardCatalog';
import { DocumentAttachment } from '../data/attachmentSamples';

interface CardDeckStackProps {
  cards: VaultCard[];
  selectedCardId?: string;
  onSelectCard?: (id: string) => void;
  onToggleReveal: (key: string) => void;
  revealedKeys: Record<string, boolean>;
  onCopy: (text: string, label: string) => void;
  onViewAttachment: (att: DocumentAttachment, cardName: string) => void;
}

export const CardDeckStack: React.FC<CardDeckStackProps> = ({
  cards,
  selectedCardId,
  onSelectCard,
  onToggleReveal,
  revealedKeys,
  onCopy,
  onViewAttachment,
}) => {
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);
  const [internalSelectedId, setInternalSelectedId] = useState<string>(cards[0]?.id || '');

  const activeSelectedId = selectedCardId ?? internalSelectedId;
  const handleSelect = (id: string) => {
    setInternalSelectedId(id);
    onSelectCard?.(id);
  };

  const toggleFlip = (cardId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setFlippedCards((prev) => ({
      ...prev,
      [cardId]: !prev[cardId],
    }));
  };

  const selectedCard = cards.find((c) => c.id === activeSelectedId) || cards[0];

  return (
    <div className="space-y-8">
      {/* Deck Controls & Instruction */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>Tactile Wallet Stack</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Hover or tap any card to slide it out of the leather stack. Tap 3D Flip to inspect the
            magnetic strip and CVV.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span>{cards.length} Physical Cards Layered</span>
        </div>
      </div>

      {/* Main Two-Column View: Physical Stack on Left, Active Card Workspace on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Overlapping Wallet Pocket Stack */}
        <div className="lg:col-span-6 relative">
          {/* Leather Wallet Container */}
          <div className="p-6 rounded-3xl bg-slate-900 dark:bg-slate-950 border border-slate-800 shadow-2xl relative overflow-hidden min-h-[580px] flex flex-col justify-between">
            {/* Wallet Stitching Effect */}
            <div className="absolute inset-2 border border-dashed border-slate-700/60 rounded-2xl pointer-events-none" />

            {/* Stack Header */}
            <div className="relative z-10 flex items-center justify-between text-xs text-slate-400 px-2 pb-2">
              <span className="font-semibold tracking-wider uppercase text-[11px] text-slate-400">
                Wallet Card Holder
              </span>
              <span className="font-mono text-[11px] text-slate-400">AES-256 ENCRYPTED</span>
            </div>

            {/* Fanned / Stacked Cards Container */}
            <div className="relative flex-1 mt-4 h-[440px] px-2">
              {cards.map((card, idx) => {
                const isSelected = card.id === activeSelectedId;
                const isHovered = card.id === hoveredCardId;
                const isFlipped = flippedCards[card.id] || false;
                const verticalOffset = idx * 64; // Cascading vertical overlap
                const slideUp = isSelected ? -38 : isHovered ? -18 : 0;
                const zIndex = isSelected ? 40 : 10 + idx;

                return (
                  <div
                    key={card.id}
                    onMouseEnter={() => setHoveredCardId(card.id)}
                    onMouseLeave={() => setHoveredCardId(null)}
                    onClick={() => handleSelect(card.id)}
                    style={{
                      top: `${verticalOffset}px`,
                      transform: `translateY(${slideUp}px) scale(${isSelected ? 1.02 : 1})`,
                      zIndex,
                    }}
                    className={`absolute inset-x-2 h-56 rounded-2xl cursor-pointer transition-all duration-300 ease-out shadow-lg select-none perspective-1000 ${
                      isSelected
                        ? 'ring-2 ring-indigo-500/80 shadow-2xl'
                        : 'hover:shadow-xl opacity-95 hover:opacity-100'
                    }`}
                  >
                    {/* 3D Flippable Card Frame */}
                    <div
                      className={`relative w-full h-full rounded-2xl transition-transform duration-500 preserve-3d ${
                        isFlipped ? 'rotate-y-180' : ''
                      }`}
                    >
                      {/* CARD FRONT */}
                      <div
                        className="absolute inset-0 rounded-2xl p-5 text-white flex flex-col justify-between backface-hidden shadow-inner overflow-hidden"
                        style={{
                          background: `linear-gradient(135deg, ${card.color || '#1e293b'} 0%, #0f172a 100%)`,
                        }}
                      >
                        {/* Metallic Hologram Sheen Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-white/5 pointer-events-none rounded-2xl" />

                        {/* Top Bank & Variant Row */}
                        <div className="relative z-10 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold tracking-wider text-base drop-shadow-sm">
                              {card.bank.toUpperCase()}
                            </span>
                            <span className="text-xs text-white/70 font-medium">
                              {card.name}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            {card.fav && <Star className="w-4 h-4 fill-amber-400 text-amber-400" />}
                            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-white/10 backdrop-blur-xs font-mono">
                              {card.variant || card.network}
                            </span>
                          </div>
                        </div>

                        {/* Chip & Contactless Row */}
                        <div className="relative z-10 flex items-center justify-between my-auto">
                          <div className="w-11 h-8 rounded-md bg-amber-300 border border-amber-400 shadow-inner flex flex-col justify-around p-1">
                            <div className="w-full h-0.5 bg-amber-600/50" />
                            <div className="w-full h-0.5 bg-amber-600/50" />
                          </div>

                          <span className="text-xs text-white/80 font-mono tracking-widest">
                            {card.network}
                          </span>
                        </div>

                        {/* Card Number & Holder Row */}
                        <div className="relative z-10">
                          <div className="font-mono text-base tracking-widest drop-shadow-md">
                            •••• •••• •••• {card.number.slice(-4)}
                          </div>

                          <div className="flex items-center justify-between text-xs text-white/70 mt-2 font-mono">
                            <span className="uppercase truncate max-w-[180px]">{card.holder}</span>
                            <span>EXP: {card.expiry}</span>
                          </div>
                        </div>
                      </div>

                      {/* CARD BACK */}
                      <div
                        className="absolute inset-0 rounded-2xl p-4 text-white flex flex-col justify-between backface-hidden rotate-y-180 bg-slate-900 border border-slate-700 shadow-inner overflow-hidden"
                      >
                        {/* Magnetic Strip */}
                        <div className="w-full h-10 bg-black mt-2 -mx-4 rounded" />

                        {/* Signature panel & CVV */}
                        <div className="my-auto">
                          <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">
                            Authorized Signature / Security Code
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex-1 h-9 bg-slate-200 rounded flex items-center px-3 text-slate-800 font-serif italic text-xs">
                              {card.holder}
                            </div>
                            <div className="w-16 h-9 bg-slate-100 rounded flex items-center justify-center font-mono font-bold text-slate-900 text-sm">
                              {revealedKeys[`cvv-${card.id}`] ? card.cvv : '•••'}
                            </div>
                          </div>
                        </div>

                        {/* Back footer info */}
                        <div className="text-[10px] text-slate-400 flex items-center justify-between">
                          <span>Helpline: {card.helpline || '18002664332'}</span>
                          <span>{card.bank} Bank</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Stack Hint */}
            <div className="relative z-10 text-center text-xs text-slate-400 pt-2 border-t border-slate-800">
              Selected: <strong className="text-slate-200">{selectedCard.bank} {selectedCard.name}</strong> · Tap to pull forward
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Card Command & Benefit Detail */}
        <div className="lg:col-span-6 space-y-6">
          {/* Active Card Command Center */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                  <span>{selectedCard.bank} Bank</span>
                  <span aria-hidden="true">·</span>
                  <span>{selectedCard.kind} Card</span>
                  <span aria-hidden="true">·</span>
                  <span>{selectedCard.variant}</span>
                </div>
                <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
                  {selectedCard.bank} {selectedCard.name}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => toggleFlip(selectedCard.id, e)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>{flippedCards[selectedCard.id] ? 'View Front' : '3D Flip to Back'}</span>
                </button>
              </div>
            </div>

            {/* Quick Numbers Bar */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[11px] text-slate-500 uppercase tracking-wider">Card Number</div>
                  <div className="font-mono text-base font-bold text-slate-900 dark:text-white tracking-wider mt-0.5">
                    {revealedKeys[`num-${selectedCard.id}`]
                      ? selectedCard.number.replace(/(\d{4})/g, '$1 ').trim()
                      : `•••• •••• •••• ${selectedCard.number.slice(-4)}`}
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onToggleReveal(`num-${selectedCard.id}`)}
                    className="p-2 rounded-lg bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100"
                    title="Reveal/Hide full number"
                  >
                    {revealedKeys[`num-${selectedCard.id}`] ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() => onCopy(selectedCard.number, 'Card number')}
                    className="p-2 rounded-lg bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100"
                    title="Copy Card Number"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-200 dark:border-slate-700 text-xs">
                <div>
                  <span className="text-slate-500">Expiry Date:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white ml-2">
                    {selectedCard.expiry}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-slate-500">CVV:</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white ml-2">
                      {revealedKeys[`cvv-${selectedCard.id}`] ? selectedCard.cvv : '•••'}
                    </span>
                  </div>
                  <button
                    onClick={() => onToggleReveal(`cvv-${selectedCard.id}`)}
                    className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                  >
                    {revealedKeys[`cvv-${selectedCard.id}`] ? 'Hide' : 'Reveal (PIN)'}
                  </button>
                </div>
              </div>
            </div>

            {/* Credit Limit & Utilization */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 dark:text-slate-400 font-medium">
                  Credit Utilization
                </span>
                <span className="font-mono tabular-nums text-slate-900 dark:text-white">
                  ₹{selectedCard.owed.toLocaleString('en-IN')} / ₹
                  {selectedCard.limit.toLocaleString('en-IN')} (
                  {Math.round((selectedCard.owed / selectedCard.limit) * 100)}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-600 h-full rounded-full transition-all"
                  style={{
                    width: `${Math.min(
                      100,
                      Math.round((selectedCard.owed / selectedCard.limit) * 100)
                    )}%`,
                  }}
                />
              </div>
            </div>

            {/* Lounge Quota Summary on this Card */}
            {selectedCard.lounges && selectedCard.lounges.length > 0 && (
              <div className="p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-800/60 text-xs space-y-2">
                <div className="flex items-center justify-between font-semibold text-indigo-900 dark:text-indigo-200">
                  <span className="flex items-center gap-1.5">
                    <Plane className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    Lounge Benefits on this Card
                  </span>
                  <span>{selectedCard.lounges.length} Quota Entitlements</span>
                </div>
                <div className="space-y-1">
                  {selectedCard.lounges.map((l) => (
                    <div key={l.id} className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                      <span>
                        {l.scope} ({l.program || 'Airport'}) · {l.period}ly
                      </span>
                      <span className="font-mono tabular-nums font-semibold">
                        {l.entitled - l.used} passes remaining (of {l.entitled})
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Document Attachments on this Card */}
            <div>
              <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center justify-between">
                <span>Card Front & Back Scans</span>
                <span className="text-slate-500 font-normal">
                  {selectedCard.attachments?.length || 0} attached
                </span>
              </div>

              {selectedCard.attachments && selectedCard.attachments.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {selectedCard.attachments.map((att) => (
                    <button
                      key={att.id}
                      onClick={() =>
                        onViewAttachment(att, `${selectedCard.bank} ${selectedCard.name}`)
                      }
                      className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 hover:border-indigo-500 text-left transition-colors flex items-center gap-2.5 group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center shrink-0 text-indigo-600 dark:text-indigo-400 group-hover:scale-105 transition-transform">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="truncate text-xs">
                        <div className="font-semibold text-slate-900 dark:text-white truncate">
                          {att.name}
                        </div>
                        <div className="text-[11px] text-slate-500">{att.fileSizeKb} KB · Tap to View</div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-slate-500 dark:text-slate-400 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-center">
                  No document scans attached yet. Use the attachments button in the Card tab to attach scans.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
