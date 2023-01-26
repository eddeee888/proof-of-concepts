const add = (a: number, b: number): number => a + b;

const mock = jest.fn();

describe('add', () => {
  beforeEach(() => {
    console.log('beforeEach');
  });

  beforeAll(() => {
    console.log('beforeEach');
  });

  it('returns correct value', () => {
    const mock2 = jest.fn().mockImplementation();
    expect(add(1, 2)).toBe(3);
  });

  it('returns correct value', () => {
    expect(add(2, 3)).toBe(5);
  });
});
