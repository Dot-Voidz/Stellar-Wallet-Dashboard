# Stellar Wallet Dashboard

[![CI](https://github.com/Dot-Voidz/Stellar-Wallet-Dashboard/actions/workflows/ci.yml/badge.svg)](https://github.com/Dot-Voidz/Stellar-Wallet-Dashboard/actions/workflows/ci.yml)
[![License: GPL-3.0](https://img.shields.io/badge/License-GPLv3-blue.svg)](LICENSE)

A lightweight browser dashboard for Stellar accounts: generate or load a keypair, inspect balances on testnet or mainnet, and build/send simple payments — without standing up your own client scaffolding.

 **Security warning:** This is an educational / developer tool. Secret keys are handled in the browser. Never use funded mainnet keys on untrusted machines or shared demos.

## Features

- Generate new Stellar keypairs or load an existing secret key
- View native XLM and trustline balances via Horizon
- Send payment transactions, with destination/amount validation and double-submit protection
- Attach an optional memo to payments (text, ID, hash, or return)
- Switch between testnet and public network
- Small Vitest suite for validation helpers (the same helpers `app.js` uses in the browser)

## Quick start

### Prerequisites

- A modern browser (Chrome, Firefox, or Edge)
- Git
- Node.js 18+ (for tests)

### Run locally

```bash
git clone https://github.com/Dot-Voidz/Stellar-Wallet-Dashboard.git
cd Stellar-Wallet-Dashboard
```

Serve the folder over HTTP (`app.js` is an ES module, so browsers block it from `file://`):

```bash
python3 -m http.server 8000
# visit http://localhost:8000
```

### Tests

```bash
npm install
npm test
```

## Testnet faucet

1. Open the [Stellar Laboratory account creator](https://laboratory.stellar.org/#account-creator?network=test)
2. Create/fund a testnet account
3. Load that account in the dashboard to exercise payments safely

## Project layout

| Path | Purpose |
| --- | --- |
| `index.html` / `styles.css` / `app.js` | Dashboard UI and client logic |
| `src/utils.js` | Shared validation helpers |
| `src/utils.test.js` | Vitest unit tests |
| `examples/` | Standalone demo pages |
| `.github/` | Issue/PR templates and CI |

## Troubleshooting

Payment failures are mapped to plain-language messages in the UI, with the raw Horizon code
kept behind a collapsed **Technical details** disclosure. Common cases:

| UI message | Horizon code | Meaning |
| --- | --- | --- |
| Account not found | `tx_no_source_account` / HTTP 404 | The source account is not funded on the selected network. |
| The destination account does not exist… | `op_no_destination` | The destination account has not been funded yet. |
| Your balance is too low… | `op_underfunded` | Balance cannot cover the payment plus the network fee. |
| Network problem | — | The browser could not reach Horizon (offline or blocked). |

Error output never contains secret keys: anything shaped like one is redacted before display.

### Manual test notes (testnet)

1. **Network error** — go offline, then send a payment; expect the *Network problem* message.
2. **Account not found** — load an unfunded public key, then try to send; expect *Account not found*.
3. **Missing destination** — send to a valid but unfunded `G...` address; expect the destination message.
4. **Underfunded** — drain a testnet account, then send more than its balance; expect `op_underfunded`.

`npm test` covers the error-mapping helper (`describePaymentError`) without touching the network.

## License

[GPL-3.0](LICENSE)
