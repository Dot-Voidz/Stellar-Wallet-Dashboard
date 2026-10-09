import { isValidPublicKey, isValidSecretKey, isValidAmount, isValidMemo, describePaymentError, summarizeOperation, assetsFromBalances, hasTrustline } from './src/utils.js';

let currentKeypair = null;
let currentNetwork = 'testnet';
let currentBalances = [];
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
const operationsContainer = document.getElementById('operations');
const refreshOperationsBtn = document.getElementById('refresh-operations');
const destinationInput = document.getElementById('destination');
const assetSelect = document.getElementById('asset-select');
const amountInput = document.getElementById('amount');
const memoInput = document.getElementById('memo');
const memoTypeSelect = document.getElementById('memo-type');
const sendPaymentBtn = document.getElementById('send-payment');
const transactionResult = document.getElementById('transaction-result');
const networkSelect = document.getElementById('network-select');

// Confirmation modal elements
const confirmModal = document.getElementById('confirm-modal');
const confirmDestination = document.getElementById('confirm-destination');
const confirmAmount = document.getElementById('confirm-amount');
const confirmAsset = document.getElementById('confirm-asset');
const confirmMemo = document.getElementById('confirm-memo');
const confirmFee = document.getElementById('confirm-fee');
const confirmCancelBtn = document.getElementById('confirm-cancel');
const confirmSendBtn = document.getElementById('confirm-send');

let confirmAction = null;
let lastFocusedElement = null;

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
        loadOperations();
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
        loadOperations();
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
    loadOperations();
});

refreshBalancesBtn.addEventListener('click', () => {
    if (!currentKeypair) {
        renderMessage(walletFeedback, 'error', 'No wallet loaded', 'Load or generate a wallet before refreshing balances.');
        return;
    }

    loadBalances({ manualRefresh: true });
});

refreshOperationsBtn.addEventListener('click', () => {
    if (!currentKeypair) {
        renderMessage(walletFeedback, 'error', 'No wallet loaded', 'Load or generate a wallet before refreshing activity.');
        return;
    }

    loadOperations();
});

function setRefreshButtonState(isLoading) {
    if (!refreshBalancesBtn) return;

    refreshBalancesBtn.disabled = isLoading;
    refreshBalancesBtn.classList.toggle('is-loading', isLoading);
    refreshBalancesBtn.innerHTML = isLoading
        ? '<span class="refresh-icon" aria-hidden="true">⟳</span><span class="refresh-label">Refreshing…</span>'
        : '<span class="refresh-icon" aria-hidden="true">↻</span><span class="refresh-label">Refresh</span>';
}

function renderMessage(container, type, title, message, detail) {
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

    if (detail) {
        const detailsEl = document.createElement('details');
        detailsEl.className = 'message-details';
        const summaryEl = document.createElement('summary');
        summaryEl.textContent = 'Technical details';
        const preEl = document.createElement('pre');
        preEl.textContent = detail;
        detailsEl.appendChild(summaryEl);
        detailsEl.appendChild(preEl);
        body.appendChild(detailsEl);
    }

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

function networkFeeInXlm() {
    return (Number(StellarSdk.BASE_FEE) / 10000000).toFixed(7);
}

function handleModalKeydown(event) {
    if (event.key === 'Escape') {
        closeConfirmModal();
        return;
    }

    if (event.key === 'Tab') {
        const focusable = confirmModal.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusable.length) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
        }
    }
}

function openConfirmModal({ destination, amount, assetLabel, memoType, memoValue, onConfirm }) {
    confirmDestination.textContent = destination;
    confirmAmount.textContent = `${amount} ${assetLabel}`;
    confirmAsset.textContent = assetLabel;
    confirmMemo.textContent = memoValue ? `${memoType}: ${memoValue}` : 'None';
    confirmFee.textContent = `${networkFeeInXlm()} XLM (${StellarSdk.BASE_FEE} stroops)`;

    confirmAction = onConfirm;
    lastFocusedElement = document.activeElement;
    confirmModal.classList.remove('hidden');
    document.addEventListener('keydown', handleModalKeydown);
    confirmSendBtn.focus();
}

function closeConfirmModal() {
    confirmModal.classList.add('hidden');
    confirmAction = null;
    document.removeEventListener('keydown', handleModalKeydown);
    if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
        lastFocusedElement.focus();
    }
}

confirmCancelBtn.addEventListener('click', closeConfirmModal);
confirmSendBtn.addEventListener('click', () => {
    const action = confirmAction;
    closeConfirmModal();
    if (action) {
        action();
    }
});

document.querySelectorAll('[data-close-modal]').forEach((element) => {
    element.addEventListener('click', closeConfirmModal);
});

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
    currentBalances = [];
    renderBalanceChart([]);
    populateAssetOptions([]);
}

function populateAssetOptions(balances) {
    if (!assetSelect) return;

    const previous = assetSelect.value;
    assetSelect.innerHTML = '';

    assetsFromBalances(balances).forEach((asset) => {
        const option = document.createElement('option');
        option.value = asset.isNative ? 'native' : `${asset.code}:${asset.issuer}`;
        option.textContent = asset.label;
        assetSelect.appendChild(option);
    });

    if (!assetSelect.options.length) {
        const fallback = document.createElement('option');
        fallback.value = 'native';
        fallback.textContent = 'XLM (native)';
        assetSelect.appendChild(fallback);
    }

    if (Array.from(assetSelect.options).some((option) => option.value === previous)) {
        assetSelect.value = previous;
    }
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

        currentBalances = account.balances;
        populateAssetOptions(account.balances);

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

function formatOperationTime(value) {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleString();
}

function renderOperation(operation) {
    const summary = summarizeOperation(operation, currentKeypair.publicKey());

    const row = document.createElement('div');
    row.className = `operation-item${summary.successful ? '' : ' operation-failed'}`;

    const main = document.createElement('div');
    main.className = 'operation-main';

    const label = document.createElement('span');
    label.className = 'operation-label';
    label.textContent = summary.direction === 'in'
        ? `${summary.label} received`
        : summary.direction === 'out'
            ? `${summary.label} sent`
            : summary.label;

    const time = document.createElement('span');
    time.className = 'operation-time';
    time.textContent = formatOperationTime(operation.created_at);

    main.appendChild(label);
    main.appendChild(time);

    const meta = document.createElement('div');
    meta.className = 'operation-meta';

    if (summary.amount) {
        const amount = document.createElement('span');
        amount.className = `operation-amount operation-amount-${summary.direction}`;
        amount.textContent = summary.amount;
        meta.appendChild(amount);
    }

    if (!summary.successful) {
        const badge = document.createElement('span');
        badge.className = 'operation-badge';
        badge.textContent = 'failed';
        meta.appendChild(badge);
    }

    row.appendChild(main);
    row.appendChild(meta);
    return row;
}

async function loadOperations() {
    if (!currentKeypair || !operationsContainer) return;

    operationsContainer.innerHTML = '<p class="loading">Loading recent activity...</p>';

    try {
        const server = getServer();
        const page = await server.operations()
            .forAccount(currentKeypair.publicKey())
            .order('desc')
            .limit(10)
            .call();

        const records = page.records || [];
        if (!records.length) {
            operationsContainer.innerHTML = '<p class="empty-state">No recent operations for this account yet.</p>';
            return;
        }

        operationsContainer.innerHTML = '';
        records.forEach((operation) => {
            operationsContainer.appendChild(renderOperation(operation));
        });
    } catch (e) {
        if (e?.response?.status === 404) {
            operationsContainer.innerHTML = '<p class="empty-state">This account has no activity yet.</p>';
            return;
        }
        renderMessage(operationsContainer, 'error', 'Unable to load activity', e.message || 'Recent operations could not be retrieved.');
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
sendPaymentBtn.addEventListener('click', () => {
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

    const assetChoice = assetSelect ? assetSelect.value : 'native';
    let paymentAsset = StellarSdk.Asset.native();
    let assetLabel = 'XLM (native)';

    if (assetChoice !== 'native') {
        const [code, issuer] = assetChoice.split(':');
        if (!hasTrustline(currentBalances, code, issuer)) {
            renderMessage(transactionResult, 'error', 'Unknown asset', 'Select an asset your wallet holds a trustline for.');
            return;
        }
        paymentAsset = new StellarSdk.Asset(code, issuer);
        assetLabel = assetSelect.options[assetSelect.selectedIndex]?.textContent
            || `${code} (${issuer.slice(0, 6)}…${issuer.slice(-4)})`;
    }

    openConfirmModal({
        destination,
        amount,
        assetLabel,
        memoType,
        memoValue,
        onConfirm: () => submitPayment({ destination, amount, asset: paymentAsset, memoType, memoValue })
    });
});

async function submitPayment({ destination, amount, asset = StellarSdk.Asset.native(), memoType, memoValue }) {
    if (isSubmittingPayment) return;

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
                asset: asset,
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
        loadOperations();
    } catch (e) {
        const failure = describePaymentError(e);
        renderMessage(transactionResult, 'error', failure.title, failure.message, failure.code);
    } finally {
        isSubmittingPayment = false;
        sendPaymentBtn.disabled = false;
    }
}
