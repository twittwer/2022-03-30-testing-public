const { getJestProjects } = require('@nrwl/jest');

module.exports = {
  projects: getJestProjects(),
  collectCoverageFrom: ['**/src/app/**/*.ts']
};
