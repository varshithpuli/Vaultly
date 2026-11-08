# Security Policy

## Reporting a Vulnerability

Please **do not** open a public issue for a security vulnerability. Use GitHub's private security advisories:
Go to **Security > Report a vulnerability** on this repository.

Please include:
* Detailed steps to reproduce
* Environment (Browser, OS, Node/runtime version)
* Expected vs actual cryptographic or access control behavior

You will receive an acknowledgment and remediation plan within 48 hours.

---

## Cryptographic Architecture

* **Vault Cipher**: AES-256-GCM authenticated encryption with 128-bit authentication tags.
* **Key Derivation (KDF)**: PBKDF2 with HMAC-SHA256, 250,000 iterations, and a 16-byte cryptographically secure random salt generated via `crypto.getRandomValues()`.
* **Initialization Vector (IV)**: A unique 12-byte random IV is generated for every write operation to prevent nonce reuse.
* **Ephemeral Key Storage**: Derived cryptographic keys exist only in volatile JavaScript memory while the vault is explicitly unlocked, and are completely dropped from memory upon locking.
* **Step-Up Authentication**: High-risk secrets (CVV, full card numbers, passwords) require step-up authentication even when the vault is already in an unlocked state.
* **Zero Network Calls**: Vaultly operates strictly offline. It requests no network permissions, communicates with no analytics backends, and makes zero telemetry requests.

---

## Supported Versions

| Version | Supported |
| :--- | :--- |
| 2.x (Web / Hybrid) | :white_check_mark: |
| 1.10.x | :white_check_mark: |
| < 1.10 | :x: |
