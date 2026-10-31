export default {
  default: {
    paths: ['features/**/*.feature'],
    import: [
      'src/support/hooks.ts',
      'src/support/world.ts',
      'src/steps/ui/login.steps.ts', // Exact file name
    ],
    format: ['progress', 'html:reports/cucumber-report.html'],
  },
};
