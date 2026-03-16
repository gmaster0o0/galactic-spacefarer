// global.d.ts
declare module 'chai-subset';
declare global {
  namespace Chai {
    interface Assertion {
      // eslint-disable-next-line no-unused-vars
      containSubset(expected: object | object[]): Assertion;
    }
  }
}
export {};
