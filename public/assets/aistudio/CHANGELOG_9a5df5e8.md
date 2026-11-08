# Changelog

All notable changes to Vaultly. Format based on [Keep a Changelog](https://keepachangelog.com/); versions follow [Semantic Versioning](https://semver.org/).

## [1.10.0] - 2026-11
### Added
- Long-press a card for a menu: quick preview, open, share, copy number, favourite, lost or stolen, edit, recycle bin.
- Quick preview overlay with show and copy.
- Lost or stolen helper: call the bank (helpline saved per card), mark a card as blocked (hides it from reminders), and a short checklist.
- Search everything from the home screen (cards, accounts, IDs, notes, logins and more). Secret fields are never searched.
- Test a backup file: checks a backup opens with its password and shows what it contains, without restoring it.
- New-card detection from "dispatched" or "approved" alerts, and a **Share to Vaultly** target for SMS and email text. Creates a card stub (last 4, bank, limit, network) to complete.
### Changed
- Version moved to 1.10.0.

## [1.9.3] - 2026-11
### Added
- Part payments on bills. The balance falls by what you pay; the reminder switches off only when paid in full.
- New alerts are checked when you unlock and listed for review, with duplicate protection.
- Automatic backups to a folder you choose, on a schedule, keeping the latest N encrypted files.
### Changed
- Merchant names are read from the alert text, improving spend categories.

## [1.9.2] - 2026-11
### Fixed
- Notification-based spend import was not connected to the phone bridge.
- Lounge visits can be logged from the card page.
- Backup share sends a file instead of text (large vaults failed).
- Profile counts on the home header follow the selected profile.
- A paid bill now switches off the correct month's reminder.
- Version shown in Settings matches the Android app info.
### Added
- On-screen PIN keypad with dots and vibration, Z to A sort for Accounts and other item tabs, vibration permission.
### Security
- The alert reader ignores OTP and verification-code messages and Vaultly's own notifications, and drops queued alerts older than 7 days.

## [1.9.1] - 2026-11
### Added
- Profiles with photos, secure notes, logins, insurance, vehicle documents and bills.
- Spend tracking from alert notifications, monthly insights and categories.
- Card flip, patterns and own-picture backgrounds, annual-fee waiver tracker, lounge access tracker, recycle bin, feature switches, IFSC capitals, backup nudges.
### Fixed
- Importing a Vaultly backup file (file picker now accepts any file type).

## [1.6.0] - 2026-11
### Added
- Settings in collapsible sections, bill tracker and limit usage, sort A to Z or Z to A for banks and networks, card flip, PIN keypad, recycle bin, slide transitions.

## [1.5.0] - 2026-11
### Added
- Vaultly name, new app ID, hero artwork as icon, splash and lock screen, eight switchable app icons.
- Hardware-bound biometric unlock (Android Keystore).
- Credit limits, redesigned Accounts and IDs, one-tap share, sorting, status bar that follows the theme.
### Security
- Growing wait after repeated wrong master passwords.

## [1.4.0] - 2026-11
### Added
- Themes (black, gradients, colourful) and accent colours.
- Bank and variant pick-lists.

## [1.3.0] - 2026-11
### Added
- Change master password, reminders for fees, bills, statements and ID expiry, custom card colours, extra item types, NFC tap-to-read.

## [1.2.0] - 2026-11
### Added
- Document scanner with auto crop, wallet-style stacks on the home screen, expiry notices.

## [1.1.0] - 2026-11
### Added
- Biometric unlock, PIN, auto-lock, screenshot blocking, Bitwarden import and export, encrypted backups, card scanning with text recognition.

## [1.0.0] - 2026-11
### Added
- Android app (Capacitor) with photo attachments and encrypted storage.

## [0.1.0] - 2026-10
### Added
- Web prototype of the encrypted card vault.
