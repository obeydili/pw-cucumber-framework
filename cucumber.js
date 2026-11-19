const common = {
  paths: ['features/**/*.feature'],
  import: ['src/support/**/*.ts', 'src/steps/**/*.ts'],
  format: ['progress', 'html:reports/cucumber-report.html', 'json:reports/cucumber-report.json'],
  tags: 'not @wip',
};

// Default profile: everything except @wip.
export default common;

// CI profile (cucumber-js -p ci).
export const ci = common;

export const smoke = {
  ...common,
  tags: '@smoke and not @wip',
};

export const regression = {
  ...common,
  tags: '@regression and not @wip',
};
