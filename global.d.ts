// global.d.ts
declare global {
  namespace Chai {
    interface Assertion {
      containSubset(expected: object | object[]): Assertion;
    }
  }
}
export {};
