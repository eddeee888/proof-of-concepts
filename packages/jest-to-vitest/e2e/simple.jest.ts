const add = (a: number, b: number): number => a + b;

const mock = jest.fn();
const mock2 = jest.fn().mockImplementation();

describe('add', () => {
  it('returns correct value', () => {
    expect(add(1, 2)).toBe(3);
  });

  it('returns correct value', () => {
    expect(add(2, 3)).toBe(5);
  });
});
