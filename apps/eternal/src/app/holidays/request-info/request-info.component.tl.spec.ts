import { TestBed } from '@angular/core/testing';
import { render, screen } from '@testing-library/angular';
import { provideMock } from '@testing-library/angular/jest-utils';
import userEvent from '@testing-library/user-event';
import { asyncScheduler, scheduled } from 'rxjs';
import { AddressLookuper } from '../../shared/address-lookuper.service';
import { RequestInfoComponent } from './request-info.component';
import { RequestInfoComponentModule } from './request-info.component.module';

describe('Request Info with Testing Library', () => {
  const setup = async () =>
    render(RequestInfoComponent, {
      imports: [RequestInfoComponentModule],
      providers: [provideMock(AddressLookuper)],
      excludeComponentDeclaration: true,
      componentProperties: {

      }
    });

  it('should instantiate', async () => {
    const renderResult = await setup();
    expect(renderResult.fixture.componentInstance).toBeInstanceOf(RequestInfoComponent);
  });

  it('should find an address', async () => {
    const { debug } = await setup();
    const lookuper = TestBed.inject(AddressLookuper);
    jest
      .spyOn(lookuper, 'lookup')
      .mockImplementation((query) => scheduled([query === 'Domgasse 5'], asyncScheduler));

    // screen.logTestingPlaygroundURL();
    debug();

    userEvent.type(screen.getByTestId('address'), 'Domgasse 15');
    userEvent.click(
      screen.getByRole('button', {
        name: /send/i
      })
    );

    expect(await screen.findByText('Address not found')).toBeTruthy();

    userEvent.clear(screen.getByTestId('address'));
    userEvent.type(screen.getByTestId('address'), 'Domgasse 5');
    userEvent.click(
      screen.getByRole('button', {
        name: /send/i
      })
    );
    expect(await screen.findByText('Brochure sent')).toBeTruthy();
  });
});
