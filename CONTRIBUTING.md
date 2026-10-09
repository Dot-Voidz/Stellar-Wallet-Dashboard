# Contributing to Stellar Wallet Dashboard

Thanks for contributing. This repo is a small Stellar learning/demo dashboard. Contributions should improve real user or developer outcomes — not inflate issue counts.

## Ground rules

1. Follow the [Code of Conduct](CODE_OF_CONDUCT.md).
2. Search existing issues before opening a new one.
3. For non-trivial features, open an issue and wait for maintainer confirmation.
4. Never include real secret keys in issues, PRs, or screenshots.

## Local development

```bash
git clone https://github.com/Dot-Voidz/Stellar-Wallet-Dashboard.git
cd Stellar-Wallet-Dashboard
python3 -m http.server 8000
```

Tests:

```bash
npm install
npm test
```

## Issue quality bar

Good issues include:

- Clear problem statement and who it affects
- Reproduction or UX flow
- Acceptance criteria that can be verified
- Honest complexity (`trivial` / `medium` / `high`)

We close:

- Mass-created cosmetic/typo tasks
- Duplicate copy-to-clipboard style farm issues
- Untested LLM dump PRs the author cannot explain

Use templates in `.github/ISSUE_TEMPLATE/`.

## Pull requests

- One concern per PR
- Link the issue
- Describe how you tested (browser + `npm test` when relevant)
- Prefer accessibility and error-state improvements over decorative churn

## Testing async UI states

Wallet load, balance refresh, and payment submit all run through `createAsyncAction`
(`src/utils.js`), which exposes `idle`/`loading` states, always clears the loading flag
on error, and ignores concurrent clicks. To verify changes:

1. **Load wallet** — click Load Wallet twice quickly; the buttons stay disabled and only one load runs.
2. **Refresh balances** — click Refresh while a load is in flight; the spinner resets when the request finishes, even if Horizon errors or you go offline.
3. **Send payment** — double-click Send Payment; only one submission is attempted.
4. `npm test` covers the helper directly, including the thrown-error and concurrency cases.

## Drips Wave

If/when this repository is accepted into a Wave program, only maintainer-curated issues will carry Wave labels. Do not apply Wave labels yourself to inflate activity.
