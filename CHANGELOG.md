# Changelog

All notable changes to this project will be documented in this file.

## [v6.1.0] - 2026-02-08

### Added
- **Daily Transactions Popup**: Clicking on a day in the Dashboard table now opens a detailed list of transactions for that day.
- **Daily Transactions Table**: Replaced the chart with a table showing Income, Expense, Difference, and Avg Value.

### Changed
- **Default Theme**: Application now defaults to **Light Mode**.
- **Comparison Logic**:
  - Daily Table: "Chênh lệch" now compares **Expense vs Expense** (Today vs Yesterday).
  - Top 10 Expenses: Comparison now shows text "Tăng"/"Giảm" instead of icons for clarity.
- **Linting**: Fixed strict `any` type issues and unused variables in codebase.

## [v6.0.0] - 2026-02-08

### Added
- **UI Version Display**: Added version number display in Desktop Sidebar and Mobile Menu.
- **Category Sorting**: Categories in "Add Transaction" are now sorted alphabetically (Vietnamese support).

### Changed
- **Version Bump**: Updated project version to v6.0.0.

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
