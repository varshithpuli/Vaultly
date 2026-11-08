export interface DocumentAttachment {
  id: string;
  name: string;
  category: 'card_front' | 'card_back' | 'id_scan' | 'policy_doc' | 'rc_book' | 'puc_cert' | 'bill_receipt' | 'other';
  dataUrl: string;
  fileSizeKb: number;
  uploadedAt: string;
  notes?: string;
}

// Generate clean SVG data URLs for high-fidelity offline preview & testing
export function generateSampleCardFrontSvg(bank: string, name: string, last4: string, holder: string, color: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="300" viewBox="0 0 480 300">
    <defs>
      <linearGradient id="cardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${color}"/>
        <stop offset="60%" stop-color="#0f172a"/>
        <stop offset="100%" stop-color="#020617"/>
      </linearGradient>
      <pattern id="cardPattern" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M 0 20 L 20 0 L 40 20 L 20 40 Z" fill="none" stroke="rgba(255,255,255,0.04)" stroke-width="1"/>
      </pattern>
    </defs>
    <rect width="480" height="300" rx="20" fill="url(#cardGrad)"/>
    <rect width="480" height="300" rx="20" fill="url(#cardPattern)"/>
    
    <!-- Chip -->
    <rect x="42" y="86" width="56" height="42" rx="7" fill="#facc15" stroke="#ca8a04" stroke-width="1.5"/>
    <path d="M 42 107 H 98 M 70 86 V 128 M 56 86 C 56 100 56 114 56 128 M 84 86 C 84 100 84 114 84 128" stroke="#a16207" stroke-width="1" fill="none"/>
    
    <!-- Contactless Wi-Fi Icon -->
    <path d="M 120 100 A 10 10 0 0 1 120 114 M 126 95 A 16 16 0 0 1 126 119 M 132 90 A 22 22 0 0 1 132 124" stroke="rgba(255,255,255,0.7)" stroke-width="2" stroke-linecap="round" fill="none"/>
    
    <!-- Bank & Card Name -->
    <text x="42" y="52" fill="#ffffff" font-family="Plus Jakarta Sans, sans-serif" font-weight="800" font-size="20" letter-spacing="1">${bank.toUpperCase()} BANK</text>
    <text x="438" y="52" text-anchor="end" fill="rgba(255,255,255,0.8)" font-family="Plus Jakarta Sans, sans-serif" font-weight="600" font-size="14">${name.toUpperCase()}</text>
    
    <!-- Card Number -->
    <text x="42" y="190" fill="#ffffff" font-family="JetBrains Mono, monospace" font-size="22" letter-spacing="4">•••• •••• •••• ${last4}</text>
    
    <!-- Cardholder & Expiry -->
    <text x="42" y="235" fill="rgba(255,255,255,0.5)" font-family="Plus Jakarta Sans, sans-serif" font-size="9" letter-spacing="1">CARDHOLDER</text>
    <text x="42" y="254" fill="#ffffff" font-family="JetBrains Mono, monospace" font-weight="600" font-size="13">${holder}</text>
    
    <text x="280" y="235" fill="rgba(255,255,255,0.5)" font-family="Plus Jakarta Sans, sans-serif" font-size="9" letter-spacing="1">VALID THRU</text>
    <text x="280" y="254" fill="#ffffff" font-family="JetBrains Mono, monospace" font-weight="600" font-size="13">09/29</text>
    
    <!-- Network Hologram -->
    <circle cx="410" cy="245" r="18" fill="#ef4444" opacity="0.85"/>
    <circle cx="430" cy="245" r="18" fill="#f59e0b" opacity="0.85"/>
  </svg>`;
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

export function generateSampleCardBackSvg(bank: string, cvv: string, helpline: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="300" viewBox="0 0 480 300">
    <rect width="480" height="300" rx="20" fill="#1e293b"/>
    <!-- Magstripe -->
    <rect x="0" y="38" width="480" height="52" fill="#020617"/>
    
    <!-- Signature Panel & CVV -->
    <rect x="36" y="125" width="280" height="36" fill="#f8fafc"/>
    <path d="M 45 142 Q 70 130 95 142 T 145 142 T 195 142 T 245 142 T 295 142" stroke="#94a3b8" stroke-width="1.5" fill="none"/>
    <rect x="316" y="125" width="70" height="36" fill="#e2e8f0"/>
    <text x="351" y="148" text-anchor="middle" fill="#0f172a" font-family="JetBrains Mono, monospace" font-weight="700" font-size="15">${cvv}</text>
    
    <text x="36" y="180" fill="#94a3b8" font-family="Plus Jakarta Sans, sans-serif" font-size="9">AUTHORIZED SIGNATURE · NOT VALID UNLESS SIGNED · ISSUED BY ${bank.toUpperCase()}</text>
    <text x="36" y="230" fill="#cbd5e1" font-family="Plus Jakarta Sans, sans-serif" font-size="10">24x7 Customer Helpline: ${helpline || '1800-266-4332'}</text>
    <text x="36" y="248" fill="#64748b" font-family="Plus Jakarta Sans, sans-serif" font-size="9">This card is property of the issuing bank. If found, please return to any branch.</text>
    
    <!-- Hologram -->
    <rect x="390" y="210" width="54" height="42" rx="4" fill="#38bdf8" opacity="0.3" stroke="#38bdf8" stroke-width="1"/>
    <text x="417" y="235" text-anchor="middle" fill="#38bdf8" font-family="JetBrains Mono, monospace" font-size="9" font-weight="bold">SECURE</text>
  </svg>`;
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

export function generateSampleDocumentSvg(title: string, subtitle: string, regOrId: string, badgeText: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="340" viewBox="0 0 480 340">
    <rect width="480" height="340" rx="16" fill="#f8fafc" stroke="#cbd5e1" stroke-width="2"/>
    <!-- Header band -->
    <rect x="2" y="2" width="476" height="50" rx="14" fill="#0f172a"/>
    <text x="24" y="32" fill="#ffffff" font-family="Plus Jakarta Sans, sans-serif" font-weight="700" font-size="15">${title.toUpperCase()}</text>
    <text x="456" y="32" text-anchor="end" fill="#38bdf8" font-family="JetBrains Mono, monospace" font-size="12" font-weight="600">${badgeText}</text>
    
    <!-- Document Body simulation -->
    <rect x="24" y="70" width="80" height="96" rx="6" fill="#e2e8f0" stroke="#94a3b8" stroke-width="1"/>
    <circle cx="64" cy="106" r="22" fill="#94a3b8"/>
    <path d="M 40 148 C 40 130 52 128 64 128 C 76 128 88 130 88 148 Z" fill="#64748b"/>
    
    <text x="120" y="88" fill="#64748b" font-family="Plus Jakarta Sans, sans-serif" font-size="11">DOCUMENT RECORD / REGISTRATION</text>
    <text x="120" y="112" fill="#0f172a" font-family="JetBrains Mono, monospace" font-weight="700" font-size="18">${regOrId}</text>
    <text x="120" y="134" fill="#334155" font-family="Plus Jakarta Sans, sans-serif" font-size="13">${subtitle}</text>
    
    <line x1="24" y1="184" x2="456" y2="184" stroke="#e2e8f0" stroke-width="1.5"/>
    
    <!-- Mock Lines -->
    <rect x="24" y="202" width="200" height="10" rx="3" fill="#cbd5e1"/>
    <rect x="24" y="222" width="160" height="10" rx="3" fill="#e2e8f0"/>
    <rect x="24" y="242" width="220" height="10" rx="3" fill="#e2e8f0"/>
    
    <rect x="260" y="202" width="190" height="10" rx="3" fill="#cbd5e1"/>
    <rect x="260" y="222" width="140" height="10" rx="3" fill="#e2e8f0"/>
    <rect x="260" y="242" width="170" height="10" rx="3" fill="#e2e8f0"/>
    
    <!-- Stamp / Seal -->
    <circle cx="400" cy="285" r="30" fill="none" stroke="#2563eb" stroke-width="2" stroke-dasharray="4 2"/>
    <text x="400" y="288" text-anchor="middle" fill="#2563eb" font-family="Plus Jakarta Sans, sans-serif" font-weight="700" font-size="9">VERIFIED COPY</text>
    
    <text x="24" y="318" fill="#94a3b8" font-family="JetBrains Mono, monospace" font-size="9">AES-256-GCM LOCAL ENCRYPTED VAULT ATTACHMENT</text>
  </svg>`;
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}
