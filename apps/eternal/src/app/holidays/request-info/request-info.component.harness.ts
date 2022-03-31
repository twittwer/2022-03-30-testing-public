import { ComponentHarness } from '@angular/cdk/testing';
import { MatButtonHarness } from '@angular/material/button/testing';

export class RequestInfoComponentHarness extends ComponentHarness {
  static hostSelector = 'app-request-info';
  protected getInput = this.locatorFor('[data-testid=address]');
  protected getButton = this.locatorFor(MatButtonHarness);
  protected getLookupResult = this.locatorFor('[data-testid=lookup-result]');

  async search(): Promise<void> {
    const button = await this.getButton();
    return button.click();
  }

  async writeAddress(address: string): Promise<void> {
    const input = await this.getInput();
    await input.clear();
    return input.sendKeys(address);
  }

  async getResult(): Promise<string> {
    const p = await this.getLookupResult();
    return p.text();
  }
}
