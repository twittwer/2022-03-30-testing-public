import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { fakeAsync, TestBed, TestModuleMetadata } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { asyncScheduler, scheduled } from 'rxjs';
import { AddressLookuper } from '../../shared/address-lookuper.service';
import { RequestInfoComponent } from './request-info.component';
import { RequestInfoComponentHarness } from './request-info.component.harness';
import { RequestInfoComponentModule } from './request-info.component.module';

describe('Request Info Component with Harness', () => {
  async function setup(config: TestModuleMetadata = {}) {
    const lookupMock = jest.fn<
      ReturnType<AddressLookuper['lookup']>,
      Parameters<AddressLookuper['lookup']>
    >();
    const defaultConfig: TestModuleMetadata = {
      imports: [NoopAnimationsModule, RequestInfoComponentModule],
      providers: [{ provide: AddressLookuper, useValue: { lookup: lookupMock } }]
    };

    const fixture = TestBed.configureTestingModule({ ...defaultConfig, ...config }).createComponent(
      RequestInfoComponent
    );
    lookupMock.mockReset();

    const harness = await TestbedHarnessEnvironment.harnessForFixture(
      fixture,
      RequestInfoComponentHarness
    );

    return { fixture, lookupMock, harness };
  }

  it('should find an address', fakeAsync(async () => {
    const { lookupMock, harness } = await setup();
    lookupMock.mockImplementation((query) => scheduled([query === 'Domgasse 5'], asyncScheduler));

    await harness.writeAddress('Domgasse 15');
    await harness.search();

    expect(await harness.getResult()).toContain('Address not found');

    await harness.writeAddress('Domgasse 5');
    await harness.search();

    expect(await harness.getResult()).toContain('Brochure sent');
  }));
});
