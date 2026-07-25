# Stellar Wallet Dashboard

[![CI](https://github.com/Dot-Voidz/Stellar-Wallet-Dashboard/actions/workflows/ci.yml/badge.svg)](https://github.com/Dot-Voidz/Stellar-Wallet-Dashboard/actions/workflows/ci.yml)
[![License: GPL-3.0](https://img.shields.io/badge/License-GPLv3-blue.svg)](LICENSE)

A lightweight browser dashboard for Stellar accounts: generate or load a keypair, inspect balances on testnet or mainnet, and build/send simple payments — without standing up your own client scaffolding.

> **Security warning:** This is an educational / developer tool. Secret keys are handled in the browser. Never use funded mainnet keys on untrusted machines or shared demos.

## Features

- Generate new Stellar keypairs or load an existing secret key
- View native XLM and trustline balances via Horizon
- Send payment transactions
- Switch between testnet and public network
- Small Vitest suite for validation helpers

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

Either open `index.html` directly, or serve the folder:

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

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) and [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).

We want **impactful** contributions: payment reliability, safer secret-key UX, accessibility, transaction history, memo support, trustline management, and tests. Typo-only or copy-button farm issues are out of scope for Wave-style work.

## Security

See [SECURITY.md](SECURITY.md). Never paste real mainnet secret keys into issues or PRs.

## License

[GPL-3.0](LICENSE)
