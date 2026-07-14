# Stellar Wallet Dashboard

![GitHub issues](https://img.shields.io/github/issues/Dot-Voidz/Stellar-Wallet-Dashboard)
![GitHub pull requests](https://img.shields.io/github/issues-pr/Dot-Voidz/Stellar-Wallet-Dashboard)
![License](https://img.shields.io/github/license/Dot-Voidz/Stellar-Wallet-Dashboard)

A user-friendly, web-based dashboard for managing Stellar wallets. It lets you generate keypairs, view balances, and build payments without writing your own client code.

## Features

- Generate new Stellar keypairs
- Load existing wallets using secret keys
- View XLM and asset balances
- Send payment transactions
- Switch between testnet and public mainnet

## Developer Setup Guide

### Prerequisites

Before you start, make sure you have:

- A modern web browser such as Chrome, Firefox, or Edge
- A code editor such as VS Code
- Git installed on your machine
- Node.js 18+ if you want to run the unit tests

### Fork and Clone the Repository

1. Fork the repository on GitHub.
2. Clone your fork locally:
   ```bash
   git clone https://github.com/<your-username>/Stellar-Wallet-Dashboard.git
   cd Stellar-Wallet-Dashboard
   ```
3. Add the original repository as an upstream remote if you want to stay synced:
   ```bash
   git remote add upstream https://github.com/Dot-Voidz/Stellar-Wallet-Dashboard.git
   ```

### Run the App Locally

This project is a static web app, so you can run it in one of two simple ways:

1. Open [index.html](index.html) directly in your browser, or
2. Start a small local server from the project root:
   ```bash
   python3 -m http.server 8000
   ```
   Then visit http://localhost:8000 in your browser.

### Submit Your Changes

1. Create a branch for your work:
   ```bash
   git checkout -b docs/my-update
   ```
2. Make your changes and commit them:
   ```bash
   git add .
   git commit -m "Describe your changes"
   ```
3. Push the branch to your fork and open a pull request.

## Examples

Standalone demo pages live in [examples/README.md](examples/README.md) and cover wallet generation, balance lookups, and payment building with simple HTML and JavaScript.

## Testnet Faucet Guide

Testnet XLM is the test currency used to experiment safely on Stellar's test network. It is useful for trying wallet features without spending real funds.

1. Open the Stellar Laboratory faucet:
   https://laboratory.stellar.org/#account-creator?network=test
2. Follow the on-screen steps to create or fund a testnet account.
3. Copy the generated testnet public key and use it in the dashboard.
4. Return to the app and load the funded account to test payments and balances.

## Security Best Practices

Wallet security is critical on Stellar. Keep these practices in mind whenever you use the dashboard:

- Never share your secret key with anyone. Treat it like a password.
- Be cautious of phishing sites and fake wallet prompts.
- Use testnet first when trying new features or experimenting with transactions.
- Review Stellar's official security guidance: https://developers.stellar.org/docs/glossary/security

## Testing

The project includes a lightweight Vitest setup for utility validation tests.

### Install Dependencies

```bash
npm install
```

### Run the Test Suite

```bash
npm test
```

The current tests cover validation helpers for Stellar public keys and payment amounts.

## Contributing

Contributions are welcome. Please use the issue templates in `.github/ISSUE_TEMPLATE/` when opening new issues for bugs, feature requests, or questions.

If you're ready to contribute, fork the repo, create a branch, and open a pull request with a clear description and testing notes.

## License

GPL-3.0
