# Contributing

Thanks for helping. This is a personal project, so keep changes focused.

## Ground rules
- Keep the app **offline**. Do not add the internet permission or any tracking.
- Never commit signing keys, backups or real card data. Use sample data in screenshots and tests.
- Small pull requests with a clear description are easiest to review.

## Workflow
1. Fork the repository and create a branch.
2. Make your change. The app is `www/index.html` and `src/native.js`; Android code is under `android/`.
3. Run `npx cap sync android`, build in Android Studio and test on a phone.
4. Update `CHANGELOG.md` under an "Unreleased" heading.
5. Open a pull request.

## Reporting bugs and ideas
Use the issue templates. For security problems use [SECURITY.md](SECURITY.md) instead.
