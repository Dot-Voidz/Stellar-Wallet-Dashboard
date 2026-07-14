name: Bug report
about: Report a bug or unexpected behavior.
title: "[BUG] "
labels: bug
body:
  - type: markdown
    attributes:
      value: |
        Thanks for reporting an issue! Please fill in the sections below.
  - type: input
    id: environment
    attributes:
      label: Environment
      description: Browser, operating system, Stellar network, etc.
      placeholder: "Chrome 123, macOS, testnet"
  - type: textarea
    id: steps
    attributes:
      label: Steps to reproduce
      description: Describe how to reproduce the bug.
  - type: textarea
    id: expected
    attributes:
      label: Expected behavior
  - type: textarea
    id: actual
    attributes:
      label: Actual behavior
  - type: textarea
    id: logs
    attributes:
      label: Error messages or logs
      description: Copy any error message shown in the UI or browser console.
