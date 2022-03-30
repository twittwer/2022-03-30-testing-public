import { parseAddress } from './parse-address';

export class AddressLookuper {
  constructor(private addressesSource: () => string[]) {}

  lookup(query: string): boolean {
    parseAddress(query);
    return this.addressesSource().some((address) => address.startsWith(query));
  }

  // istanbul ignore next
  noop() {}
}
