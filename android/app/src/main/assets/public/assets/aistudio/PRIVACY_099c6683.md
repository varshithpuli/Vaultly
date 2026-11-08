# Privacy

*Last updated: November 2026*

Vaultly is built so that your information stays on your phone.

## What Vaultly stores
Everything you enter: cards, accounts, IDs, notes, logins, photos, bills, spends and settings. It is saved on your phone in an encrypted vault, protected by your master password.

## What Vaultly sends
Nothing. The app declares no internet permission, has no account system, no analytics, no advertising and no crash reporting. There is no server and no one at the project can see your data.

Two things can involve other software on your phone:
- **Google Play services** may download the document scanner module the first time you scan. That is Google's component, not Vaultly sending data.
- **Sharing and backups** go where you send them. When you export a backup or share a card, the file or text goes to the app you pick. Backups are encrypted; shared card text is plain text.

## Permissions
| Permission | Used for |
| --- | --- |
| Camera | Scanning cards and documents |
| NFC | Reading a contactless card's number and expiry |
| Biometrics | Fingerprint or face unlock |
| Vibrate | Keypad and button feedback |
| Notifications | Local reminders |
| Notification access (optional) | Reading bank and UPI alert notifications to suggest spends and detect new cards |
| A folder you choose (optional) | Automatic encrypted backups |

### Notification access
If you turn it on, Vaultly keeps a short queue of notifications that look like bank or UPI alerts. It ignores anything that mentions an OTP, a verification code or a CVV, ignores its own notifications, and discards queued items after 7 days. Alerts are read only when you unlock the app and are listed for you to accept or dismiss. You can revoke access at any time in Android settings.

## Your choices
- Delete any item (it stays in the recycle bin for 30 days, then it is gone).
- Uninstalling the app deletes the vault from the phone. Keep an encrypted backup if you want a copy.
- Backups you export or write to a folder are yours to keep or delete.

## Contact
Open an issue on the project's GitHub page for privacy questions.
