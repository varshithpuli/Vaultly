# Privacy Policy

*Last updated: November 2026*

Vaultly is built with zero-knowledge, offline privacy as its core guarantee. Your data remains strictly on your local device.

---

## 1. Zero Data Collection & Zero Telemetry
* **No Accounts**: Vaultly requires no registration, email, phone number, or credentials.
* **No Cloud Server**: Vaultly does not operate backend servers or databases.
* **No Analytics / Telemetry**: No tracking SDKs, no advertising cookies, no crash reporting beacons.
* **No Network Communication**: The app functions completely without internet access.

---

## 2. On-Device Encryption
All vault data—including card numbers, bank accounts, government credentials, secure notes, passwords, and attached document scans—is encrypted directly on your local device using **AES-256-GCM** with keys derived via **PBKDF2-SHA256 (250,000 iterations)**.

The encryption key exists only in volatile memory while the vault is explicitly unlocked by you. Locking the vault or navigating away discards the key immediately.

---

## 3. Backups & Portability
* Exported `.cvault` backups are encrypted with your master password using the same AES-256-GCM cipher.
* CSV spend exports are created client-side only and saved directly to your local file system.
* You retain complete custody of your backups.
