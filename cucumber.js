export default {
  default: {
    paths: ['features/**/*.feature'],
    import: ['src/support/**/*.ts', 'src/steps/**/*.ts'],
    format: ['progress', 'html:reports/cucumber-report.html'],
  },
};
