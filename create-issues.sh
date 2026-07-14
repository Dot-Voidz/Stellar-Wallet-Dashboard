#!/bin/bash
REPO="susanyusuf/Stellar-Wallet-Dashboard"

# Function to create an issue
create_issue() {
  local title="$1"
  local labels="$2"
  local body="$3"
  echo "Creating issue: $title"
  gh issue create --repo "$REPO" --title "$title" --label "$labels" --body "$body"
}

# 1. Add Copy-to-Clipboard Button for Public Key
create_issue "Add Copy-to-Clipboard Button for Public Key" \
"Stellar Wave,trivial,enhancement,ui/ux" \
"### Description
Add a copy-to-clipboard button next to the displayed public key in the wallet info section. The button should:
1. Have a clear icon (like 📋 or \"Copy\")
2. Show a temporary success message when copied
3. Be accessible via keyboard

### Acceptance Criteria
- User can click button to copy public key
- Success feedback is shown for ~2 seconds
- Works on both light and dark themes"

# 2. Add Copy-to-Clipboard Button for Secret Key
create_issue "Add Copy-to-Clipboard Button for Secret Key" \
"Stellar Wave,trivial,enhancement,ui/ux" \
"### Description
Add a copy-to-clipboard button for the secret key, with prominent security warnings.
**Important:** Include a clear warning that secret keys give full access to funds!

### Acceptance Criteria
- Same functionality as public key copy button
- Warning modal/confirmation appears before allowing secret key copy
- Warning text is bold and clear"

# 3. Add Dark/Light Theme Toggle
create_issue "Add Dark/Light Theme Toggle" \
"Stellar Wave,trivial,enhancement,ui/ux" \
"### Description
Add a theme switcher to let users toggle between light and dark modes. Save the preference using localStorage.

### Acceptance Criteria
- Toggle button in header (like 🌙/☀️)
- Theme preference persists across page reloads
- All UI elements look good in both themes"

# 4. Fix Mobile Responsiveness
create_issue "Fix Mobile Responsiveness" \
"Stellar Wave,trivial,bug,ui/ux" \
"### Description
Current layout breaks on small screens (< 480px). Fix responsive design.

### Acceptance Criteria
- All buttons and inputs are tappable
- Text is readable without zooming
- Layout adapts smoothly from mobile to desktop"

# 5. Add Security Best Practices Section to README
create_issue "Add Security Best Practices Section to README" \
"Stellar Wave,trivial,documentation" \
"### Description
Add a prominent section to README about Stellar wallet security.

### Acceptance Criteria
- Include warning about secret key safety
- Explain phishing risks
- Recommend using testnet first
- Link to Stellar's official security docs"

# 6. Add Testnet Faucet Guide to README
create_issue "Add Testnet Faucet Guide to README" \
"Stellar Wave,trivial,documentation" \
"### Description
Add step-by-step instructions for getting testnet XLM from the Stellar Laboratory faucet.

### Acceptance Criteria
- Clear, numbered steps
- Link directly to https://laboratory.stellar.org/#account-creator?network=test
- Explain what testnet XLM is for"

# 7. Fix Loading State Reset on Network Error
create_issue "Fix Loading State Reset on Network Error" \
"Stellar Wave,medium,bug" \
"### Description
When a network request fails (like loading balances), the loading state doesn't reset, leaving the UI stuck.

### Acceptance Criteria
- All async operations show loading state
- Loading state clears on both success and failure
- Error message is displayed to user on failure"

# 8. Add QR Code Display for Public Key
create_issue "Add QR Code Display for Public Key" \
"Stellar Wave,medium,enhancement,ui/ux" \
"### Description
Generate and display a QR code for the wallet's public key to make receiving payments easier.

### Acceptance Criteria
- QR code is displayed below public key
- QR code is scannable with common Stellar apps
- QR code updates if wallet is switched"

# 9. Add Memo Field to Payment Form
create_issue "Add Memo Field to Payment Form" \
"Stellar Wave,medium,enhancement" \
"### Description
Add a memo field to the send payment form to support memo types (text, hash, id, return, none).

### Acceptance Criteria
- Dropdown to select memo type
- Input field for memo value
- Memo is properly included in signed transaction
- Validation for memo length/format"

# 10. Add Transaction History View
create_issue "Add Transaction History View" \
"Stellar Wave,medium,enhancement" \
"### Description
Fetch and display the wallet's transaction history from Horizon.

### Acceptance Criteria
- Shows recent transactions (last 20 by default)
- Includes transaction type, amount, asset, date, and memo (if any)
- Has basic pagination or \"Load More\" button
- Works on both testnet and public network"

# 11. Add Custom Asset Payment Support
create_issue "Add Custom Asset Payment Support" \
"Stellar Wave,medium,enhancement" \
"### Description
Allow users to send custom assets (non-XLM) in addition to native XLM payments.

### Acceptance Criteria
- Dropdown to select asset (from wallet's balances)
- Input for amount
- Validates trustline exists before sending
- Works for all asset types in wallet"

# 12. Add Basic Unit Tests for Utils
create_issue "Add Basic Unit Tests for Utils" \
"Stellar Wave,medium,testing" \
"### Description
Add a simple testing setup and unit tests for any utility functions in the codebase.

### Acceptance Criteria
- Set up Jest or Vitest
- Write tests for validation functions
- Tests run with npm test
- Test suite is documented in README"

# 13. Add Developer Setup Guide
create_issue "Add Developer Setup Guide" \
"Stellar Wave,medium,documentation" \
"### Description
Add a step-by-step developer setup guide to README for new contributors.

### Acceptance Criteria
- List prerequisites (browser, code editor)
- Explain how to fork and clone repo
- How to run locally
- How to submit changes"

# 14. Improve Error Message Styling
create_issue "Improve Error Message Styling" \
"Stellar Wave,trivial,enhancement,ui/ux" \
"### Description
Current error messages are plain text. Style them better for readability.

### Acceptance Criteria
- Error messages have red background/border
- Clear icon to indicate error
- Text is easy to read
- Errors are dismissible"

# 15. Add Transaction Confirmation Modal
create_issue "Add Transaction Confirmation Modal" \
"Stellar Wave,high,enhancement,ui/ux" \
"### Description
Add a modal that shows transaction details before sending, so users can confirm everything is correct.

### Acceptance Criteria
- Modal pops up when \"Send Payment\" is clicked
- Shows destination, amount, asset, memo, and fee
- User can confirm or cancel
- Modal is accessible"

# 16. Add Trustline Management UI
create_issue "Add Trustline Management UI" \
"Stellar Wave,high,enhancement" \
"### Description
Add a section to view existing trustlines and add new ones.

### Acceptance Criteria
- List all current trustlines with asset info
- Form to add new trustline (asset code + issuer)
- Button to remove trustlines
- Feedback on success/failure"

# 17. Add Multi-Signature Support
create_issue "Add Multi-Signature Support" \
"Stellar Wave,high,enhancement" \
"### Description
Add basic multi-signature wallet support (view multisig account info, sign transactions).

### Acceptance Criteria
- Display signers and thresholds for loaded multisig account
- Allow adding a second signer
- Basic multisig transaction signing flow"

# 18. Add Balance Chart Visualization
create_issue "Add Balance Chart Visualization" \
"Stellar Wave,high,enhancement,ui/ux" \
"### Description
Add a simple pie chart or bar chart to visualize wallet balances by asset.

### Acceptance Criteria
- Chart updates when balances change
- Works for multiple assets
- Responsive chart size
- Uses a lightweight charting library (like Chart.js or D3 Lite)"

# 19. Add Manual Refresh Button for Balances
create_issue "Add Manual Refresh Button for Balances" \
"Stellar Wave,trivial,enhancement,ui/ux" \
"### Description
Add a refresh button next to the balances section so users don't have to reload the whole page.

### Acceptance Criteria
- Button with refresh icon
- Shows loading state when refreshing
- Disables button during refresh to prevent duplicate clicks
- Updates balances on success"

# 20. Add Examples/ Directory with Demo Scripts
create_issue "Add Examples/ Directory with Demo Scripts" \
"Stellar Wave,medium,documentation,enhancement" \
"### Description
Add an examples/ folder with simple HTML/JS demos showing how to use core Stellar features used in the dashboard.

### Acceptance Criteria
- 3+ small, working examples
- Each example has a README explaining what it does
- Examples are simple and focused on single features"

echo "✅ All 20 issues created!"
