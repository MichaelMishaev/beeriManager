 # Run all admin automation tests
  npx playwright test tests/e2e/admin-panel-automation.spec.ts

  # Run specific test
  npx playwright test tests/e2e/admin-panel-automation.spec.ts -g
  "comprehensive"

  # Run with UI mode (visual debugging)
  npx playwright test tests/e2e/admin-panel-automation.spec.ts --ui

  # Run with headed browser (see the clicks happen)
  npx playwright test tests/e2e/admin-panel-automation.spec.ts --headed