import { HttpClient, HttpParams } from '@angular/common/http';
import { fakeAsync } from '@angular/core/testing';
import { asyncScheduler, firstValueFrom, of, scheduled } from 'rxjs';
import { AddressLookuper } from './address-lookuper.service';
import { assertType } from './assert-type';

describe('Address Lookuper', () => {
  // TODO: fakeAsync schlägt an obwohl keine async. Tasks
  for (let { response, isValid } of [
    {
      response: [true, 1],
      isValid: true
    },
    {
      response: [],
      isValid: false
    }
  ]) {
    it(`should return ${isValid} for ${response}`, fakeAsync(async () => {
      const httpClientStub = assertType<HttpClient>({
        get: () => scheduled([response], asyncScheduler)
      });

      const lookuper = new AddressLookuper(httpClientStub);

      const result = await firstValueFrom(lookuper.lookup('Domgasse 5'));
      expect(result).toEqual(isValid);
    }));
  }

  it('should verify that nominatim is called', () => {
    const httpClientMock = {
      get: jest.fn<ReturnType<HttpClient['get']>, Parameters<HttpClient['get']>>()
    };

    httpClientMock.get.mockReturnValue(of(['Domgasse 5']));
    const lookuper = new AddressLookuper(assertType<HttpClient>(httpClientMock));

    lookuper.lookup('Domgasse 5');

    expect(httpClientMock.get).toHaveBeenCalledWith(
      'https://nominatim.openstreetmap.org/search.php',
      { params: new HttpParams().set('q', 'Domgasse 5').set('format', 'jsonv2') }
    );
  });

  it('should throw an error if no street number is given', () => {
    const lookuper = new AddressLookuper(assertType<HttpClient>({}));

    expect(() => lookuper.lookup('Domgasse')).toThrowError(
      'Could not parse address. Invalid format.'
    );
  });
});
