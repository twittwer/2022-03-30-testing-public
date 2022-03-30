import { AddressLookuper } from './address-lookuper.service';

describe('Address Lookuper', () => {
  it('should pass addresses in the constructor', () => {
    const addresses = ['Domgasse 15, 1010 Wien'];
    const lookuper = new AddressLookuper(() => addresses);

    expect(lookuper.lookup('Domgasse 5, 1010 Wien')).toBe(false);
    expect(lookuper.lookup('Domgasse 15, 1010 Wien')).toBe(true);
  });

  it('should work with short query input and long address store', () => {
    const addresses = ['Domgasse 15, 1010 Wien'];
    const lookuper = new AddressLookuper(() => addresses);

    expect(lookuper.lookup('Domgasse 15')).toBe(true);
  });

  it('should throw an error if no street number is given', () => {
    const lookuper = new AddressLookuper(() => []);

    expect(() => lookuper.lookup('Domgasse')).toThrowError(
      'Could not parse address. Invalid format.'
    );
  });
});
