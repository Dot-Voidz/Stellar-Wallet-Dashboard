import { isValidPublicKey, isValidSecretKey, isValidAmount, isValidMemo } from './src/utils.js';

let currentKeypair = null;
let currentNetwork = 'testnet';
let isSubmittingPayment = false;

// DOM Elements
const secretKeyInput = document.getElementById('secret-key');
const toggleSecretBtn = document.getElementById('toggle-secret');
const loadWalletBtn = document.getElementById('load-wallet');
const generateWalletBtn = document.getElementById('generate-wallet');
const walletInfo = document.getElementById('wallet-info');
const walletFeedback = document.getElementById('wallet-feedback');
const publicKeyDisplay = document.getElementById('public-key');
const secretKeyDisplay = document.getElementById('secret-key-display');
const balancesContainer = document.getElementById('balances');
const balanceChart = document.getElementById('balance-chart');
const refreshBalancesBtn = document.getElementById('refresh-balances');
const destinationInput = document.getElementById('destination');
const amountInput = document.getElementById('amount');
const memoInput = document.getElementById('memo');
const memoTypeSelect = document.getElementById('memo-type');
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
        renderMessage(walletFeedback, 'error', 'Missing secret key', 'Please enter a secret key or generate a new wallet.');
        return;
    }

    if (!isValidSecretKey(secret)) {
        renderMessage(walletFeedback, 'error', 'Invalid secret key', 'Secret keys are 56 characters and start with "S". Check for missing or extra characters.');
        return;
    }

    try {
        currentKeypair = StellarSdk.Keypair.fromSecret(secret);
        showWalletInfo();
        renderMessage(walletFeedback, 'success', 'Wallet loaded', 'Balances will refresh shortly.');
        loadBalances();
    } catch (e) {
        renderMessage(walletFeedback, 'error', 'Invalid secret key', e.message || 'The secret key could not be parsed.');
    }
});

// Generate new wallet
generateWalletBtn.addEventListener('click', () => {
    currentKeypair = StellarSdk.Keypair.random();
    secretKeyInput.value = currentKeypair.secret();
    showWalletInfo();
    renderMessage(walletFeedback, 'success', 'Wallet generated', 'Save the secret key somewhere safe.');
    loadBalances();
});

refreshBalancesBtn.addEventListener('click', () => {
    if (!currentKeypair) {
        renderMessage(walletFeedback, 'error', 'No wallet loaded', 'Load or generate a wallet before refreshing balances.');
        return;
    }

    loadBalances({ manualRefresh: true });
});

function setRefreshButtonState(isLoading) {
    if (!refreshBalancesBtn) return;

    refreshBalancesBtn.disabled = isLoading;
    refreshBalancesBtn.classList.toggle('is-loading', isLoading);
    refreshBalancesBtn.innerHTML = isLoading
        ? '<span class="refresh-icon" aria-hidden="true">⟳</span><span class="refresh-label">Refreshing…</span>'
        : '<span class="refresh-icon" aria-hidden="true">↻</span><span class="refresh-label">Refresh</span>';
}

function renderMessage(container, type, title, message) {
    if (!container) return;

    container.innerHTML = '';
    container.classList.remove('hidden');

    const messageBox = document.createElement('div');
    messageBox.className = `message message-${type}`;

    const icon = document.createElement('span');
    icon.className = 'message-icon';
    icon.textContent = type === 'error' ? '⚠' : type === 'success' ? '✓' : 'ℹ';

    const body = document.createElement('div');
    body.className = 'message-body';
    const titleEl = document.createElement('strong');
    titleEl.textContent = title;
    const messageEl = document.createElement('p');
    messageEl.textContent = message;
    body.appendChild(titleEl);
    body.appendChild(messageEl);

    const dismissButton = document.createElement('button');
    dismissButton.type = 'button';
    dismissButton.className = 'message-dismiss';
    dismissButton.setAttribute('aria-label', 'Dismiss message');
    dismissButton.textContent = '×';
    dismissButton.addEventListener('click', () => {
        messageBox.remove();
        if (!container.hasChildNodes()) {
            container.classList.add('hidden');
        }
    });

    messageBox.appendChild(icon);
    messageBox.appendChild(body);
    messageBox.appendChild(dismissButton);
    container.appendChild(messageBox);
}

function formatAssetLabel(balance) {
    return balance.asset_type === 'native' ? 'XLM' : balance.asset_code;
}

function renderBalanceChart(balances = []) {
    if (!balanceChart) return;

    balanceChart.innerHTML = '';
    const chartBalances = balances
        .map((balance) => ({
            asset: formatAssetLabel(balance),
            amount: Number.parseFloat(balance.balance)
        }))
        .filter((balance) => Number.isFinite(balance.amount) && balance.amount > 0);

    if (!chartBalances.length) {
        balanceChart.setAttribute('aria-label', 'No positive balances available to chart');
        balanceChart.innerHTML = '<p class="empty-state">No positive balances to chart.</p>';
        return;
    }

    const total = chartBalances.reduce((sum, balance) => sum + balance.amount, 0);
    const max = Math.max(...chartBalances.map((balance) => balance.amount));
    const chartSummary = chartBalances
        .map((balance) => `${balance.asset} ${((balance.amount / total) * 100).toFixed(1)}%`)
        .join(', ');

    balanceChart.setAttribute('aria-label', `Balance allocation: ${chartSummary}`);

    chartBalances.forEach((balance) => {
        const percent = (balance.amount / total) * 100;
        const width = Math.max((balance.amount / max) * 100, 4);

        const row = document.createElement('div');
        row.className = 'chart-row';

        const label = document.createElement('span');
        label.className = 'chart-label';
        label.textContent = balance.asset;

        const track = document.createElement('div');
        track.className = 'chart-track';

        const bar = document.createElement('div');
        bar.className = 'chart-bar';
        bar.style.width = `${width}%`;
        bar.setAttribute('aria-hidden', 'true');

        const value = document.createElement('span');
        value.className = 'chart-value';
        value.textContent = `${balance.amount.toLocaleString(undefined, { maximumFractionDigits: 7 })} (${percent.toFixed(1)}%)`;

        track.appendChild(bar);
        row.appendChild(label);
        row.appendChild(track);
        row.appendChild(value);
        balanceChart.appendChild(row);
    });
}

// Show wallet info
function showWalletInfo() {
    walletInfo.classList.remove('hidden');
    publicKeyDisplay.textContent = currentKeypair.publicKey();
    secretKeyDisplay.textContent = currentKeypair.secret();
    renderBalanceChart([]);
}

// Get server based on network
function getServer() {
    const horizonUrl = currentNetwork === 'public'
        ? 'https://horizon.stellar.org'
        : 'https://horizon-testnet.stellar.org';

    // stellar-sdk v11 moved the Horizon client under `Horizon`.
    return new StellarSdk.Horizon.Server(horizonUrl);
}

// Get network passphrase
function getNetworkPassphrase() {
    return currentNetwork === 'public'
        ? StellarSdk.Networks.PUBLIC
        : StellarSdk.Networks.TESTNET;
}

// Load balances
async function loadBalances(options = {}) {
    if (!currentKeypair) return;

    const { manualRefresh = false } = options;
    if (manualRefresh) {
        setRefreshButtonState(true);
    }

    balancesContainer.innerHTML = '<p class="loading">Loading balances...</p>';

    try {
        const server = getServer();
        const account = await server.loadAccount(currentKeypair.publicKey());

        balancesContainer.innerHTML = '';
        if (!account.balances.length) {
            balancesContainer.innerHTML = '<p class="empty-state">This account does not have any balances yet.</p>';
            renderBalanceChart([]);
            return;
        }

        renderBalanceChart(account.balances);

        account.balances.forEach(balance => {
            const div = document.createElement('div');
            div.className = 'balance-item';
            const assetCode = document.createElement('span');
            assetCode.textContent = formatAssetLabel(balance);
            const amount = document.createElement('span');
            amount.textContent = balance.balance;
            div.appendChild(assetCode);
            div.appendChild(amount);
            balancesContainer.appendChild(div);
        });
    } catch (e) {
        renderBalanceChart([]);
        renderMessage(balancesContainer, 'error', 'Unable to load balances', e.message || 'The account could not be reached.');
    } finally {
        if (manualRefresh) {
            setRefreshButtonState(false);
        }
    }
}

function buildMemo(type, value) {
    switch (type) {
        case 'id':
            return StellarSdk.Memo.id(value);
        case 'hash':
            return StellarSdk.Memo.hash(value);
        case 'return':
            return StellarSdk.Memo.return(value);
        default:
            return StellarSdk.Memo.text(value);
    }
}

function memoHint(type) {
    switch (type) {
        case 'id':
            return 'ID memos must be a whole number between 0 and 18446744073709551615.';
        case 'hash':
        case 'return':
            return 'Hash and return memos must be exactly 64 hexadecimal characters (32 bytes).';
        default:
            return 'Text memos can be up to 28 bytes (UTF-8), for example 28 characters of plain text.';
    }
}

// Send payment
sendPaymentBtn.addEventListener('click', async () => {
    if (isSubmittingPayment) return;

    if (!currentKeypair) {
        renderMessage(transactionResult, 'error', 'Wallet required', 'Please load or generate a wallet first.');
        return;
    }

    const destination = destinationInput.value.trim();
    const amount = amountInput.value.trim();

    if (!destination || !amount) {
        renderMessage(transactionResult, 'error', 'Missing details', 'Please enter both a destination address and amount.');
        return;
    }

    if (!isValidPublicKey(destination)) {
        renderMessage(transactionResult, 'error', 'Invalid destination', 'Destination must be a 56-character Stellar public key starting with "G".');
        destinationInput.focus();
        return;
    }

    if (destination === currentKeypair.publicKey()) {
        renderMessage(transactionResult, 'error', 'Same account', 'The destination is the account you are sending from.');
        return;
    }

    if (!isValidAmount(amount)) {
        renderMessage(transactionResult, 'error', 'Invalid amount', 'Amount must be a positive number, for example 1.5.');
        amountInput.focus();
        return;
    }

    const memoType = memoTypeSelect.value;
    const memoValue = memoInput.value.trim();

    if (!isValidMemo(memoType, memoValue)) {
        renderMessage(transactionResult, 'error', 'Invalid memo', memoHint(memoType));
        memoInput.focus();
        return;
    }

    isSubmittingPayment = true;
    sendPaymentBtn.disabled = true;

    renderMessage(transactionResult, 'info', 'Sending payment', 'The transaction is being submitted.');

    try {
        const server = getServer();
        const sourceAccount = await server.loadAccount(currentKeypair.publicKey());

        const builder = new StellarSdk.TransactionBuilder(sourceAccount, {
            fee: StellarSdk.BASE_FEE,
            networkPassphrase: getNetworkPassphrase()
        })
            .addOperation(StellarSdk.Operation.payment({
                destination: destination,
                asset: StellarSdk.Asset.native(),
                amount: amount
            }))
            .setTimeout(30);

        if (memoValue) {
            builder.addMemo(buildMemo(memoType, memoValue));
        }

        const transaction = builder.build();

        transaction.sign(currentKeypair);
        const result = await server.submitTransaction(transaction);

        renderMessage(transactionResult, 'success', 'Payment sent', `Transaction hash: ${result.hash}`);
        amountInput.value = '';
        memoInput.value = '';
        loadBalances();
    } catch (e) {
        const detail = e?.response?.data?.extras?.result_codes?.transaction || e.message || 'The payment could not be submitted.';
        renderMessage(transactionResult, 'error', 'Payment failed', detail);
    } finally {
        isSubmittingPayment = false;
        sendPaymentBtn.disabled = false;
    }
});
