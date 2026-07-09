# Stellar-Wallet-Dashboard

A user-friendly, web-based dashboard that provides an intuitive Graphical User Interface (GUI) for seamless Stellar account management. Designed for non-technical users and developers alike, this application enables wallet generation, real-time balance tracking, and secure payment processing without writing a single line of code.

Beyond its utility as a wallet, this project serves as a clean reference implementation, demonstrating architecture patterns and security best practices for building modern applications on the Stellar network.

---
## Features

- Generate new Stellar keypairs
- Load existing wallets using secret keys
- View XLM and asset balances
-  Send payment transactions
-  Switch between testnet and mainnet
-  
## Getting Started

## Examples

Standalone demo pages live in [examples/README.md](examples/README.md) and cover wallet generation, balance lookups, and payment building with simple HTML and JavaScript.

### Prerequisites

You just need a web browser! No installation required.

### Usage

1. Clone or download this repository
2. Open `index.html` in your web browser
3. Generate a new wallet or load an existing one
4. Start managing your Stellar account!

   
### Clone the Repository
```bash
git clone https://github.com/Dot-Voidz/Stellar-Wallet-Dashboard.git
cd Stellar-Wallet-Dashboard
```

### Testnet Faucet

To get testnet XLM for testing, visit the [Stellar Laboratory Faucet](https://laboratory.stellar.org/#account-creator?network=test).
Stellar-Wallet-Dashboard/
├── public/              # Static assets and index.html
├── src/
│   ├── components/      # UI components (Navbar, BalanceCard, PaymentForm)
│   ├── services/        # Stellar SDK abstractions & Horizon API calls
│   ├── hooks/           # Custom state and wallet lifecycle hooks
│   ├── App.js           # Main application entry point & router
│   └── index.js         # React DOM initialization
├── .env.example         # Template for environment configurations
└── README.md


## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

GPL-3.0
