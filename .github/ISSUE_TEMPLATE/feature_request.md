name: Feature request
about: Suggest a new feature, enhancement, or improvement.
title: "[FEATURE] "
labels: enhancement
body:
  - type: markdown
    attributes:
      value: |
        Thanks for suggesting an improvement! Please fill in the details below.
  - type: input
    id: summary
    attributes:
      label: Summary
      description: Provide a short summary of the proposed feature.
  - type: textarea
    id: motivation
    attributes:
      label: Motivation
      description: Why is this feature useful? What problem does it solve?
  - type: textarea
    id: proposal
    attributes:
      label: Proposed solution
      description: Describe how the feature should work.
  - type: textarea
    id: acceptance
    attributes:
      label: Acceptance criteria
      description: What needs to be true for this feature to be complete?
