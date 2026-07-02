let currentKeypair = null;
let currentNetwork = 'testnet';

// DOM Elements
const secretKeyInput = document.getElementById('secret-key');
const toggleSecretBtn = document.getElementById('toggle-secret');
const loadWalletBtn = document.getElementById('load-wallet');
const generateWalletBtn = document.getElementById('generate-wallet');
const walletInfo = document.getElementById('wallet-info');
const publicKeyDisplay = document.getElementById('public-key');
const secretKeyDisplay = document.getElementById('secret-key-display');
const balancesContainer = document.getElementById('balances');
const destinationInput = document.getElementById('destination');
const amountInput = document.getElementById('amount');
const sendPaymentBtn = document.getElementById('send-payment');
const transactionResult = document.getElementById('transaction-result');
const networkSelect = document.getElementById('network-select');

// Toggle secret key visibility
toggleSecretBtn.addEventListener('click', () => {
    if (secretKeyInput.type === 'password') {
        secretKeyInput.type = 'text';
        toggleSecretBtn.textContent = 'Hide';
    } else {
        secretKeyInput.type = 'password';
        toggleSecretBtn.textContent = 'Show';
    }
});

// Network change
networkSelect.addEventListener('change', (e) => {
    currentNetwork = e.target.value;
    if (currentKeypair) {
        loadBalances();
    }
});

// Load wallet
loadWalletBtn.addEventListener('click', () => {
    const secret = secretKeyInput.value.trim();
    if (!secret) {
        alert('Please enter a secret key');
        return;
    }

    try {
        currentKeypair = StellarSdk.Keypair.fromSecret(secret);
        showWalletInfo();
        loadBalances();
    } catch (e) {
        alert('Invalid secret key');
    }
});

// Generate new wallet
generateWalletBtn.addEventListener('click', () => {
    currentKeypair = StellarSdk.Keypair.random();
    secretKeyInput.value = currentKeypair.secret();
    showWalletInfo();
    alert(`New wallet generated!\nPublic Key: ${currentKeypair.publicKey()}\n\nIMPORTANT: Save your secret key somewhere safe!`);
    loadBalances();
});

// Show wallet info
function showWalletInfo() {
    walletInfo.classList.remove('hidden');
    publicKeyDisplay.textContent = currentKeypair.publicKey();
    secretKeyDisplay.textContent = currentKeypair.secret();
}

// Get server based on network
function getServer() {
    return currentNetwork === 'public'
        ? new StellarSdk.Server('https://horizon.stellar.org')
        : new StellarSdk.Server('https://horizon-testnet.stellar.org');
}

// Get network passphrase
function getNetworkPassphrase() {
    return currentNetwork === 'public'
        ? StellarSdk.Networks.PUBLIC
        : StellarSdk.Networks.TESTNET;
}

// Load balances
async function loadBalances() {
    if (!currentKeypair) return;

    balancesContainer.innerHTML = '<p class="loading">Loading...</p>';

    try {
        const server = getServer();
        const account = await server.loadAccount(currentKeypair.publicKey());

        balancesContainer.innerHTML = '';
        account.balances.forEach(balance => {
            const div = document.createElement('div');
            div.className = 'balance-item';
            const asset = balance.asset_type === 'native' ? 'XLM' : balance.asset_code;
            div.innerHTML = `<span>${asset}</span><span>${balance.balance}</span>`;
            balancesContainer.appendChild(div);
        });
    } catch (e) {
        balancesContainer.innerHTML = `<p class="error">Error loading balances: ${e.message}</p>`;
    }
}

// Send payment
sendPaymentBtn.addEventListener('click', async () => {
    if (!currentKeypair) {
        alert('Please load a wallet first');
        return;
    }

    const destination = destinationInput.value.trim();
    const amount = amountInput.value.trim();

    if (!destination || !amount) {
        alert('Please enter destination and amount');
        return;
    }

    transactionResult.classList.remove('hidden');
    transactionResult.innerHTML = '<p class="loading">Sending...</p>';

    try {
        const server = getServer();
        const sourceAccount = await server.loadAccount(currentKeypair.publicKey());

        const transaction = new StellarSdk.TransactionBuilder(sourceAccount, {
            fee: StellarSdk.BASE_FEE,
            networkPassphrase: getNetworkPassphrase()
        })
            .addOperation(StellarSdk.Operation.payment({
                destination: destination,
                asset: StellarSdk.Asset.native(),
                amount: amount
            }))
            .setTimeout(30)
            .build();

        transaction.sign(currentKeypair);
        const result = await server.submitTransaction(transaction);

        transactionResult.innerHTML = `<p class="success">Payment sent successfully! Transaction hash: ${result.hash}</p>`;
        loadBalances();
    } catch (e) {
        transactionResult.innerHTML = `<p class="error">Error sending payment: ${e.message}</p>`;
    }
});