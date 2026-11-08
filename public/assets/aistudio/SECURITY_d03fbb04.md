# Security

## Reporting a vulnerability
Please **do not** open a public issue for a security problem. Use GitHub's private reporting: **Security > Report a vulnerability** on the repository. Include the steps to reproduce, the Android version and the app version. You will get an answer as soon as possible.

## Design in short
- AES-256-GCM vault encryption; key from the master password using PBKDF2-SHA256 (250,000 iterations, random salt, new IV on every save).
- Biometric unlock uses an Android Keystore key that requires a strong biometric match for each use and is invalidated by new fingerprint enrolment.
- PIN unlock stores the master password encrypted under a PIN-derived key and turns itself off after five wrong tries.
- Android cloud backup is disabled. Screenshots and the recent-apps preview are blocked by default.
- No internet permission.

## Known limits
- Security depends on a strong master password.
- A rooted or malware-infected phone can capture data while the vault is unlocked.
- PIN unlock is weaker than the master password; use a long master password and treat the PIN as a convenience.
- The project has not been independently audited. Do not rely on it as the only copy of important data.

## Supported versions
Only the latest release receives fixes.
