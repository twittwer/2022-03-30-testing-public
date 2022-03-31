import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { fakeAsync, TestBed, TestModuleMetadata, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { createComponentFactory } from '@ngneat/spectator/jest';
import { asyncScheduler, scheduled } from 'rxjs';
import { AddressLookuper } from '../../shared/address-lookuper.service';
import { RequestInfoComponent } from './request-info.component';
import { RequestInfoComponentModule } from './request-info.component.module';

describe('Request Info Component', () => {
  function setup(config: TestModuleMetadata = {}) {
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

    return { fixture, lookupMock };
  }

  it('should find an address', fakeAsync(() => {
    const { fixture, lookupMock } = setup();
    lookupMock.mockImplementation((query) => scheduled([query === 'Domgasse 5'], asyncScheduler));

    const input = fixture.debugElement.query(By.css('[data-testid=address]'))
      .nativeElement as HTMLInputElement;
    const button = fixture.debugElement.query(By.css('[data-testid=btn-search]'))
      .nativeElement as HTMLButtonElement;

    fixture.detectChanges();
    input.value = 'Domgasse 15';
    input.dispatchEvent(new Event('input'));

    button.click();
    tick();
    fixture.detectChanges();

    const lookupResult = fixture.debugElement.query(By.css('[data-testid=lookup-result]'))
      .nativeElement as HTMLElement;

    expect(lookupResult.textContent).toContain('Address not found');

    input.value = 'Domgasse 5';
    input.dispatchEvent(new Event('input'));
    button.click();
    tick();
    fixture.detectChanges();

    expect(lookupResult.textContent).toContain('Brochure sent');
  }));
});

describe('Request Info Spectator', () => {
  const inputSelector = '[data-testid=address]';
  const buttonSelector = '[data-testid=btn-search]';
  const lookupSelector = '[data-testid=lookup-result]';

  describe('Component Test', () => {
    const createComponent = createComponentFactory({
      component: RequestInfoComponent,
      imports: [NoopAnimationsModule, RequestInfoComponentModule],
      mocks: [AddressLookuper],
      declareComponent: false
    });

    const setup = () => {
      const spectator = createComponent();
      const lookuperMock = spectator.inject(AddressLookuper);
      return { spectator, lookuperMock };
    };

    it('should instantiate', () => {
      const { spectator } = setup();
      expect(spectator.component).toBeInstanceOf(RequestInfoComponent);
    });

    it('should find an address', fakeAsync(() => {
      const { spectator, lookuperMock } = setup();

      lookuperMock.lookup.mockImplementation((query) =>
        scheduled([query === 'Domgasse 5'], asyncScheduler)
      );

      spectator.typeInElement('Domgasse 15', inputSelector);
      spectator.click(buttonSelector);
      spectator.tick();

      const lookupResult = spectator.query(lookupSelector);
      expect(lookupResult).toHaveText('Address not found');

      spectator.typeInElement('Domgasse 5', inputSelector);
      spectator.click(buttonSelector);
      spectator.tick();

      expect(lookupResult).toHaveText('Brochure sent');
    }));
  });

  describe('Integration Test', () => {
    const createComponent = createComponentFactory({
      component: RequestInfoComponent,
      imports: [RequestInfoComponentModule, HttpClientTestingModule],
      declareComponent: false
    });

    it('should instantiate', () => {
      const spectator = createComponent();
      expect(spectator.component).toBeInstanceOf(RequestInfoComponent);
    });

    it('should find address "Domgasse 5"', fakeAsync(() => {
      const spectator = createComponent();
      spectator.typeInElement('Domgasse 5', inputSelector);
      spectator.click(buttonSelector);

      const request = spectator
        .inject(HttpTestingController)
        .expectOne((req) => req.url.match(/nominatim/));
      request.flush([true]);

      spectator.detectChanges();
      expect(spectator.query(lookupSelector)).toHaveText('Brochure sent');
    }));
  });
});
