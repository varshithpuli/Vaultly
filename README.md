# Vaultly v2.0

> **Zero-Knowledge, Offline Financial & Identity Vault with 3D Card Stack, Airport Lounge Spend Tracker, Subscription Detection, and Encrypted Document Attachments.**

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Security: AES-256-GCM](https://img.shields.io/badge/encryption-AES--256--GCM-emerald.svg)](SECURITY.md)
[![Key Derivation: PBKDF2 250k](https://img.shields.io/badge/KDF-PBKDF2--250k-indigo.svg)](SECURITY.md)
[![Network: 100% Offline](https://img.shields.io/badge/network-100%25%20offline-orange.svg)](PRIVACY.md)
[![TypeScript: Strict](https://img.shields.io/badge/typescript-strict-blue.svg)](tsconfig.json)

Vaultly is a privacy-first, zero-knowledge personal finance and credential vault. It runs completely offline on your device using the browser's native **WebCrypto API** (AES-256-GCM with PBKDF2 at 250,000 iterations). No accounts, no servers, no cloud sync, and zero trackers.

---

## Highlights in Vaultly v2.0

### 1. Expanded Bank & Card Catalog (18 Major Cards Offline)
* **Pre-configured Offline Catalog**: 18 popular Indian & global cards across Visa, Mastercard, RuPay, and American Express:
  * **HDFC**: Infinia Metal, Regalia Gold, Millennia, Tata Neu Infinity RuPay
  * **SBI Card**: Cashback Card, Elite
  * **Axis Bank**: Atlas, Magnus Burgundy, Airtel Axis
  * **ICICI Bank**: Amazon Pay, Sapphiro, Emeralde Private Metal
  * **American Express**: Platinum Travel, The Platinum Card
  * **Kotak Mahindra**: White Reserve
  * **IndusInd**: Legend
  * **HSBC**: Live+ Cashback
  * **IDFC FIRST**: Wealth
* **Benefit Auto-Fill**: Automatically pre-fills reward point multipliers, annual fee waiver thresholds, point-to-INR conversion rates, and 24/7 bank customer service helplines.

### 2. Airport Lounge Spend & Access Tracker
* **Quota Counters**: Domestic and International lounge access visit trackers with remaining visit indicators.
* **Minimum Spend Requirement Tracking**: Explicitly tracks cards requiring qualifying quarterly or monthly spends (e.g. ₹50,000/quarter on Regalia Gold, ₹10,000/month on ICICI Sapphiro, ₹50,000 in 3 months on Airtel Axis) vs. unconditional access (e.g. Infinia, Amex Platinum).
* **Live Progress Bar**: Visual `₹ achieved / ₹ required` progress bar with instant status indicators (**Unlocked & Ready** vs. **Spend Target Required**).
* **Interactive Spend Logging**: 1-tap "+ Log Qualifying Spend" action to increment your qualifying spend toward unlocking lounge access.
* **Reset Period Countdown**: Automatic reset tracking for Quarter (Q1–Q4) and Annual cycles.

### 3. Subscription & Recurring Payment Detection
* **Automatic Spend Scanner**: Built-in on-device scanner that detects recurring payments from bank alerts, SMS text, or spend logs (Netflix, Spotify, Apple, Google One, AWS, ChatGPT Plus, YouTube Premium, Swiggy One, Cult.fit, Microsoft 365, etc.).
* **Commitment Overview**: Computes monthly and annual recurring financial commitments at a glance.
* **Renewal Countdowns**: Days-to-renew alerts highlighting services renewing within 7 days.
* **Cancellation Hub**: Direct portal links to merchant cancellation dashboards and 1-tap active/paused toggle.

### 4. Tactile 3D Card Deck Physical Stack
* **Leather Wallet Pocket Physics**: Overlapping card deck arranged vertically with tactile depth and smooth animations.
* **Hover & Selection Slide-Out**: Cards physically lift and slide forward when hovered or selected.
* **3D Flip Interaction**: Inspect the card's front or flip 180° to review the magnetic stripe, signature panel, customer care number, and CVV.
* **Step-Up Authentication**: Sensitive digits (CVV, full card numbers) are protected by a 60-second step-up PIN/password challenge even when the master vault is open.

### 5. Encrypted Document & Photo Attachments
* **Local Secure Storage**: Attach high-resolution front/back scans of cards, government IDs (Passport, PAN, Aadhaar, Driving License), vehicle documents (RC, insurance, PUC), and insurance policy copies.
* **Document Viewer Modal**:
  * **Zoom**: Smooth scaling from 50% up to 250%.
  * **Rotation**: 90° clockwise rotation toggle.
  * **Privacy Mask**: Obfuscates sensitive account/card numbers with cryptographic blur while keeping identity photo and frame readable.
  * **Sample Document Generators**: Inline SVG generators to test verified copies locally.
  * **Export & Upload**: Download decrypted copies or upload images directly from your filesystem.

### 6. Decoy Vault (Duress / Plausible Deniability Mode)
* **Two Passwords**:
  * **Primary Password** (`vaultly2026`): Unlocks your complete primary financial vault.
  * **Decoy Password** (`decoy1234`): Unlocks an isolated decoy vault containing plausible dummy cards and accounts under duress, with zero mathematical trace or leakage of primary vault data.

### 7. Integrated 8-Tab Financial & Identity Suite
1. **Cards**: Credit and debit cards with reward optimization, bill due alerts, fee waiver progress, and limit utilization.
2. **Bank Accounts**: Savings and current accounts with account numbers, IFSC codes, customer IDs, and 1-tap NEFT/IMPS copy formatters.
3. **Government IDs**: Passports, PAN cards, Aadhaar, and Driving Licenses with expiry countdowns.
4. **Secure Notes**: Encrypted notes for backup codes, recovery phrases, and private notes.
5. **Logins & 2FA TOTP**: RFC 6238 compliant 6-digit TOTP codes refreshing every 30 seconds via WebCrypto HMAC-SHA1.
6. **Insurance Policies**: Health, term life, and motor policies with sum insured and renewal dates.
7. **Vehicles**: Registration numbers, FASTag issuing bank, motor insurance expiry, and PUC emission certificate dates.
8. **Utility Bills**: Invoices, due dates, and partial payment recording.

### 8. EMIs, Budgets & Spend Insights
* **Active Card EMI Tracker**: Track principal amounts, blocked credit limits, monthly installments, and payoff progress.
* **Category Budgets**: Set monthly spending caps across Shopping, Dining, Fuel, Travel, Groceries, and Utilities with live progress bars.
* **Smart Card Recommender**: Ranks your portfolio offline for any purchase amount and category based on effective reward yield and annual fee waiver targets.

### 9. Encrypted Backups & Verification
* **AES-256-GCM `.cvault` Files**: Encrypted with PBKDF2 (250,000 iterations). Backups contain all metadata and document attachments.
* **Non-Destructive Backup Verifier**: Verify and test backup integrity and password match without overwriting existing vault data.
* **CSV Export**: Export monthly spend logs and recurring subscriptions to standard CSV.

### 10. v1.10.0 Architecture Audit & Notification Parser Sandbox
* **Interactive Regex Sandbox**: Test raw bank SMS alerts against v1.10.0 and upgraded v2.0 regex patterns to eliminate false-positive spend detections (e.g., bill payments, refunds, and ATM withdrawals).
* **Drop-in Vanilla JS Patches**: Ready-to-copy patches for Capacitor/Android native bridges.

---

## Security Model & Cryptography

| Component | Specification |
| :--- | :--- |
| **Vault Cipher** | AES-256-GCM (Authenticated Encryption with Associated Data) |
| **Key Derivation (KDF)** | PBKDF2 with SHA-256, 250,000 iterations |
| **Salt** | 16-byte cryptographically random salt (`crypto.getRandomValues`) |
| **Initialization Vector (IV)** | 12-byte cryptographically random IV per save operation |
| **Key Storage** | Stored in volatile JavaScript memory only while unlocked; wiped on lock |
| **Step-Up Authentication** | CVVs, full card numbers, and passwords require PIN re-verification (60s session) |
| **Clipboard Safety** | Auto-clears copied clipboard values after 45 seconds |
| **Network Footprint** | **Zero**. No external APIs, CDNs, analytics, or background sync |

---

## Getting Started

### Prerequisites
* [Node.js](https://nodejs.org/) (v18.0.0 or higher) or [Bun](https://bun.sh/)
* npm or bun

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/vaultly.git
cd vaultly

# Install dependencies
npm install
# or
bun install
```

### Development

```bash
# Start the local development server (runs on port 3000)
npm run dev
# or
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Default Passwords for Demo Mode
* **Primary Master Password**: `vaultly2026` (or `1234`)
* **Decoy Vault Password**: `decoy1234`
* **Step-Up Verification PIN**: `1234` (or master password)

### Building for Production

```bash
# Type check and build optimized static assets
npm run build
```

---

## Project Structure

```text
├── src/
│   ├── components/
│   │   ├── CardDeckStack.tsx          # 3D interactive physical leather wallet card deck
│   │   ├── DocumentViewerModal.tsx     # Fullscreen viewer with zoom, rotate & privacy mask
│   │   ├── LoungeTrackerHub.tsx       # Airport lounge spend tracker & quota manager
│   │   └── SubscriptionsManager.tsx   # Subscription scanner, renewal dates & cancel portal
│   ├── data/
│   │   ├── attachmentSamples.ts       # Document attachment types and sample SVG generators
│   │   ├── cardCatalog.ts             # 18-card offline catalog, lounge criteria & reward boosts
│   │   ├── subscriptionsData.ts       # Known subscription merchants & auto-detection engine
│   │   └── vaultTabsData.ts           # 8-tab vault data models (accounts, IDs, notes, EMIs, etc.)
│   ├── utils/
│   │   └── cryptoAndTotp.ts           # WebCrypto AES-GCM, PBKDF2 250k, TOTP HMAC-SHA1
│   ├── App.tsx                        # Main application container & 5-section navigation
│   ├── index.css                      # Tailwind global styles
│   └── main.tsx                       # React application entry point
├── public/                            # Static assets and icons
├── metadata.json                      # AI Studio application metadata
├── package.json                       # Project scripts and dependencies
├── tsconfig.json                      # TypeScript configuration
└── vite.config.ts                     # Vite build configuration
```

---

## Anti-Slop Design Principles

Vaultly is built following strict frontend engineering principles:
* **Zero Decorative Pills**: Statuses and metadata are represented using typographic contrast, clear hierarchical spacing, and unboxed indicators rather than colorful pill tags.
* **Three-Zone Navigation Bar**: Brand identity on the left, clear single-line navigation links in the center, and a single lock/unlock action on the right.
* **60-30-10 Color Discipline**: Deep neutral background, crisp slate containers, and purposeful indigo and emerald accents.
* **WCAG AA Compliance**: High-contrast typography and keyboard navigation accessibility.

---

## Contributing

Contributions, bug reports, and suggestions are welcome!
1. Fork the repository.
2. Create your feature branch (`git checkout -b feature/amazing-feature`).
3. Commit your changes (`git commit -m 'Add amazing feature'`).
4. Push to the branch (`git push origin feature/amazing-feature`).
5. Open a Pull Request.

---

## License

Distributed under the **MIT License**. See `LICENSE` for more information.
