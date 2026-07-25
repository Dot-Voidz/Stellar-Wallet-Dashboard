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

## Drips Wave

If/when this repository is accepted into a Wave program, only maintainer-curated issues will carry Wave labels. Do not apply Wave labels yourself to inflate activity.
