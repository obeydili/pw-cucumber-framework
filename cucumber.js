const common = {
  paths: ['features/**/*.feature'],
  import: ['src/support/**/*.ts', 'src/steps/**/*.ts'],
  format: ['progress', 'html:reports/cucumber-report.html', 'json:reports/cucumber-report.json'],
  tags: 'not @wip', // <-- Ignored globally across all profiles!
};

// 1. The Default Profile (runs everything)
export default common;

// 2. The CI Profile (Exported by name!)
export const ci = common;

// 3. The Smoke Profile (only runs @smoke, ignores @wip)
export const smoke = {
  ...common,
  tags: '@smoke and not @wip',
};

// 4. The Regression Profile (runs @regression, ignores @wip)
export const regression = {
  ...common,
  tags: '@regression and not @wip',
};
