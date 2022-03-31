import { fakeAsync } from '@angular/core/testing';
import { createComponentFactory } from '@ngneat/spectator/jest';
import { asyncScheduler, scheduled } from 'rxjs';
import { AddressLookuper } from '../../shared/address-lookuper.service';
import { RequestInfoComponent } from './request-info.component';
import { RequestInfoComponentModule } from './request-info.component.module';

describe('Request Info Spectator', () => {
  const createComponent = createComponentFactory({
    component: RequestInfoComponent,
    imports: [RequestInfoComponentModule],
    mocks: [AddressLookuper],
    declareComponent: false
  });

  const setup = () => {
    const spectator = createComponent();
    const lookuperMock = spectator.inject(AddressLookuper);
    return { spectator, lookuperMock };
  };

  const inputSelector = '[data-testid=address]';
  const buttonSelector = '[data-testid=btn-search]';
  const lookupSelector = '[data-testid=lookup-result]';

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
    const messageBox = spectator.query(lookupSelector);
    expect(messageBox).toHaveText('Address not found');

    spectator.typeInElement('Domgasse 5', inputSelector);
    spectator.click(buttonSelector);
    spectator.tick();
    expect(messageBox).toHaveText('Brochure sent');
  }));
});
