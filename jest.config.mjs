export default {
  testEnvironment: 'node',
  fakeTimers: {
    enableGlobally: true,
    legacyFakeTimers: false,
  },
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1'
  }
};
