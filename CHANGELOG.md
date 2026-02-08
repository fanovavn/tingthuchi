# Changelog

All notable changes to this project will be documented in this file.

## [v5] - 2026-02-08

### Added
- **Transaction Add Page**: Created a dedicated page at `/transactions/add` with return URL support.
- **Telegram Notification**: Integrated automated Telegram notifications when a transaction is added.
- **Success Popup**: Added a success modal after transaction submission with options to "Add Another" or "Go to List".
- **Telegram API**: Created `/api/telegram` and `src/lib/telegram.ts` for handling messaging.

### Changed
- **Transaction Form**: Refactored `TransactionForm` to support both modal and page modes.
- **Navigation**: Updated Dashboard and Transactions pages to link to the new add page.
- **Telegram Format**: Updated message format to `Icon Amount : Description (Date - Category)` with expense icon as 😕.

### Configuration
- Added `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` to `.env.local`.
