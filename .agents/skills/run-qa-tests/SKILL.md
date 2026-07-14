---
name: run-qa-tests
description: Run black-box QA tests for a project and analyze results
---
# Skill: Run QA Tests

Use this skill when the user asks you to execute tests for a project.

## Execution Steps
1. Run the test command: `npm run run-tests -- --project=<project-id>`
2. Read the results from `data/<project-id>/results.json`.
3. If there are failures, analyze the `logs` and `errorMsg` in the failing test cases.
4. Report back to the user with a summary of the test run, highlighting critical failures.
5. If a new bug pattern is discovered that applies broadly, update `shared_memory.md`.
