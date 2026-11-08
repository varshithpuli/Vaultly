const enc = new TextEncoder();
const dec = new TextDecoder();

export function toBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i += 32768) {
    binary += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, i + 32768)));
  }
  return btoa(binary);
}

export function fromBase64(b64: string): Uint8Array {
  return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
}

export async function deriveAesKey(password: string, salt: Uint8Array, iterations = 250000): Promise<CryptoKey> {
  const baseKey = await crypto.subtle.importKey(
    'raw',
    enc.encode(password) as BufferSource,
    'PBKDF2',
    false,
    ['deriveKey']
  );
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: salt as BufferSource, iterations, hash: 'SHA-256' },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export async function encryptVaultPayload(payload: unknown, password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveAesKey(password, salt, 250000);
  const ciphertext = new Uint8Array(
    await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: iv as BufferSource },
      key,
      enc.encode(JSON.stringify(payload)) as BufferSource
    )
  );
  return JSON.stringify({
    v: 2,
    kdf: 'PBKDF2-SHA256',
    iter: 250000,
    salt: toBase64(salt),
    iv: toBase64(iv),
    ct: toBase64(ciphertext),
  });
}

export async function decryptVaultPayload(rawJson: string, password: string): Promise<Record<string, unknown>> {
  const parsed = JSON.parse(rawJson);
  const envelope = parsed.vault && parsed.vault.salt ? parsed.vault : parsed;
  if (!envelope || !envelope.salt || !envelope.iv || !envelope.ct) {
    throw new Error('Not a valid encrypted Vaultly (.cvault) file.');
  }
  const salt = fromBase64(envelope.salt);
  const iv = fromBase64(envelope.iv);
  const ct = fromBase64(envelope.ct);
  const iter = typeof envelope.iter === 'number' ? envelope.iter : 250000;
  const key = await deriveAesKey(password, salt, iter);
  const plaintext = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: iv as BufferSource },
    key,
    ct as BufferSource
  );
  return JSON.parse(dec.decode(plaintext));
}

// Base32 decoder for RFC 6238 TOTP
function base32ToBytes(base32: string): Uint8Array {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  const cleaned = base32.toUpperCase().replace(/[^A-Z2-7]/g, '');
  let bits = '';
  for (const ch of cleaned) {
    const val = alphabet.indexOf(ch);
    if (val >= 0) bits += val.toString(2).padStart(5, '0');
  }
  const out = new Uint8Array(Math.floor(bits.length / 8));
  for (let i = 0; i < out.length; i++) {
    out[i] = parseInt(bits.slice(i * 8, i * 8 + 8), 2);
  }
  return out;
}

export async function generateTotpCode(secret: string, timestampMs = Date.now()): Promise<{ code: string; remainingSec: number }> {
  const period = 30;
  const counter = Math.floor(timestampMs / 1000 / period);
  const remainingSec = period - (Math.floor(timestampMs / 1000) % period);

  const keyBytes = base32ToBytes(secret || 'JBSWY3DPEHPK3PXP');
  const counterBytes = new Uint8Array(8);
  let temp = counter;
  for (let i = 7; i >= 0; i--) {
    counterBytes[i] = temp & 0xff;
    temp = Math.floor(temp / 256);
  }

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyBytes as BufferSource,
    { name: 'HMAC', hash: 'SHA-1' },
    false,
    ['sign']
  );
  const hmac = new Uint8Array(
    await crypto.subtle.sign('HMAC', cryptoKey, counterBytes as BufferSource)
  );
  const offset = hmac[hmac.length - 1] & 0x0f;
  const binary =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);
  const otp = (binary % 1000000).toString().padStart(6, '0');
  return { code: `${otp.slice(0, 3)} ${otp.slice(3)}`, remainingSec };
}

export interface PasswordGenOptions {
  length: number;
  uppercase: boolean;
  lowercase: boolean;
  digits: boolean;
  symbols: boolean;
  mode: 'random' | 'passphrase';
}

const EFF_WORDS = [
  'amber', 'anchor', 'apollo', 'arctic', 'atlas', 'aurora', 'bamboo', 'banyan',
  'beacon', 'breeze', 'canyon', 'cedar', 'cipher', 'cobalt', 'comet', 'coral',
  'cosmos', 'crystal', 'cypress', 'delta', 'dynamo', 'eclipse', 'ember', 'emerald',
  'falcon', 'fjord', 'forged', 'galaxy', 'garnet', 'glacier', 'granite', 'harbor',
  'helium', 'horizon', 'indigo', 'island', 'jasper', 'jungle', 'karma', 'krypton',
  'lagoon', 'lantern', 'legacy', 'lotus', 'lunar', 'magnet', 'mantra', 'marble',
  'matrix', 'meadow', 'meteor', 'mirage', 'monsoon', 'nebula', 'nectar', 'nickel',
  'nimbus', 'obsidian', 'odyssey', 'onyx', 'Aarav', 'orbit', 'orchid', 'osprey',
  'oxygen', 'palace', 'panther', 'paradox', 'pebble', 'phoenix', 'photon', 'pioneer',
  'planet', 'plasma', 'platinum', 'polaris', 'prism', 'pulsar', 'quartz', 'quasar',
  'radium', 'raptor', 'redwood', 'zenith', 'zephyr', 'zircon',
];

export function generateSecureSecret(opts: PasswordGenOptions): { value: string; entropyBits: number } {
  if (opts.mode === 'passphrase') {
    const wordCount = Math.max(4, Math.min(8, Math.round(opts.length / 4)));
    const rand = new Uint32Array(wordCount + 1);
    crypto.getRandomValues(rand);
    const words = Array.from({ length: wordCount }, (_, i) => EFF_WORDS[rand[i] % EFF_WORDS.length]);
    const num = (rand[wordCount] % 900) + 100;
    const sep = opts.symbols ? '-' : ' ';
    return {
      value: `${words.join(sep)}${sep}${num}`,
      entropyBits: Math.round(wordCount * Math.log2(EFF_WORDS.length) + Math.log2(900)),
    };
  }

  let pool = '';
  if (opts.lowercase) pool += 'abcdefghijkmnopqrstuvwxyz';
  if (opts.uppercase) pool += 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  if (opts.digits) pool += '23456789';
  if (opts.symbols) pool += '!@#$%^&*()-_=+[]{}?';
  if (!pool) pool = 'abcdefghijkmnopqrstuvwxyz23456789';

  const rand = new Uint32Array(opts.length);
  crypto.getRandomValues(rand);
  let out = '';
  for (let i = 0; i < opts.length; i++) {
    out += pool[rand[i] % pool.length];
  }
  const entropyBits = Math.round(opts.length * Math.log2(pool.length));
  return { value: out, entropyBits };
}

export function formatCardNumber(num: string): string {
  const digits = (num || '').replace(/\D/g, '');
  if (/^3[47]/.test(digits)) {
    return digits.replace(/^(.{4})(.{0,6})(.{0,5}).*/, '$1 $2 $3').trim();
  }
  return digits.replace(/(.{4})/g, '$1 ').trim();
}

export function maskCardNumber(num: string): string {
  const last4 = (num || '').replace(/\D/g, '').slice(-4);
  return `•••• ${last4 || '0000'}`;
}

export interface ParsedAlertResult {
  v1Status: 'Imported as Spend' | 'Ignored' | 'False Positive Spend!';
  v2Status: 'Valid Spend Queued' | 'Blocked (Refund / Bill Credit / OTP)' | 'New Card Stub Detected';
  amount?: number;
  merchant?: string;
  last4?: string;
  category?: string;
  explanation: string;
}

export function testAlertRegexComparison(rawText: string): ParsedAlertResult {
  const clean = rawText.replace(/\s+/g, ' ').trim();

  // Check if new card dispatch
  if (
    /card/i.test(clean) &&
    /(dispatch|despatch|activat|deliver|issued|approved|welcome|credit limit|new card)/i.test(clean)
  ) {
    const m4 = clean.match(/(?:ending(?: with| in)?|xx+|x{2,}|\*{2,}|•{2,})\s*(\d{4})\b/i);
    return {
      v1Status: 'Ignored',
      v2Status: 'New Card Stub Detected',
      last4: m4 ? m4[1] : '8892',
      explanation: 'Detected card dispatch/approval notification and created an onboarding card stub.',
    };
  }

  const amtMatch = clean.match(/(?:rs\.?|₹|inr)\s*([\d,]+(?:\.\d{1,2})?)/i);
  const amount = amtMatch ? Math.round(parseFloat(amtMatch[1].replace(/,/g, ''))) : undefined;
  const cardMatch =
    clean.match(/\b(?:x{1,4}|\*{1,4}|•{1,4})\s*(\d{4})\b/i) ||
    clean.match(/\b(?:ending|card|a\/c)\s*(?:with\s*)?(?:no\.?\s*)?(\d{4})\b/i);
  const last4 = cardMatch ? cardMatch[1] : undefined;

  // Check false-positive triggers in v1.10.0
  const isNonSpend =
    /\b(otp|verification|credited|refund|reversed|payment received|thank you for paying|total due|min(?:imum)? due|statement is ready)\b/i.test(
      clean
    );

  if (isNonSpend && amount) {
    return {
      v1Status: 'False Positive Spend!',
      v2Status: 'Blocked (Refund / Bill Credit / OTP)',
      amount,
      last4,
      explanation:
        'v1.10.0 matched "Rs./₹" without checking for bill payment credits, refunds, or statement-due alerts—inflating card balance. v2.0 blocks non-debit alerts.',
    };
  }

  if (amount) {
    const mm = clean.match(
      /\b(?:at|to|towards|on|for|@)\s+([A-Za-z0-9&.'@_ -]{3,28}?)(?=\s+(?:on|using|via|ref|upi|txn|trxn|with|from|for|card|avl|bal|if)\b|[.,;]|$)/i
    );
    const merchant = (mm ? mm[1].replace(/^VPA\s+/i, '') : 'Merchant').trim().slice(0, 28);
    return {
      v1Status: 'Imported as Spend',
      v2Status: 'Valid Spend Queued',
      amount,
      merchant,
      last4,
      explanation: 'Both parsers extracted amount, last 4 digits, and merchant cleanly.',
    };
  }

  return {
    v1Status: 'Ignored',
    v2Status: 'Blocked (Refund / Bill Credit / OTP)',
    explanation: 'No valid INR transaction pattern detected.',
  };
}
