import { fakeAsync, flush, flushMicrotasks, tick, waitForAsync } from '@angular/core/testing';
import { firstValueFrom, Observable, of } from 'rxjs';

class DataLoader {
  private _number = 1;

  get number() {
    return this._number;
  }

  increment() {
    window.setTimeout(() => this._number++);
  }
}

class DataLoaderObservable {
  private _number = 1;

  get number() {
    return this._number;
  }

  increment() {
    new Observable((subscriber) => {
      window.setTimeout(() => subscriber.next(1));
    }).subscribe((n) => this._number++);
  }
}

describe('Async', () => {
  it('should use setTimeout', () => {
    let a = 1;
    window.setTimeout(() => {
      a = a + 1;
      expect(a).toBe(2);
    });
  });

  it('should use a Promise', () => {
    let a = 1;
    Promise.resolve().then(() => {
      a = a + 1;
      expect(a).toBe(2);
    });
  });

  it('should use done callback', (done) => {
    let a = 1;
    Promise.resolve()
      .then(() => {
        a = a + 1;
        expect(a).toBe(2);
      })
      .then(done, done);
  });

  it('should use waitForAsync', waitForAsync(() => {
    let a = 1;
    Promise.resolve().then(() => {
      a = a + 1;
      expect(a).toBe(2);
    });
  }));

  it('should test DataLoader', fakeAsync(() => {
    const loader = new DataLoader();
    loader.increment();
    tick();
    expect(loader.number).toBe(2);
  }));

  it('should use fakeAsync', fakeAsync(() => {
    let a = 1;
    window.setTimeout(() => {
      a = a + 100;
    }, 10000);

    window.setTimeout(() => {
      a = a + 10;
    });

    Promise.resolve().then(() => {
      a = a + 1;
    });

    flushMicrotasks();
    expect(a).toBe(2);

    tick();
    expect(a).toBe(12);

    tick(10000);
    expect(a).toBe(112);
  }));

  it('should use flush', fakeAsync(() => {
    let a = 1;
    window.setTimeout(() => {
      a = a + 100;
    }, 10000);

    window.setTimeout(() => {
      a = a + 10;
    });

    Promise.resolve().then(() => {
      a = a + 1;
    });

    flush();
    expect(a).toBe(112);
  }));

  it('should use observables', fakeAsync(async () => {
    let a = 1;

    const n = await firstValueFrom(of(1));
    a = a + n;
    expect(a).toBe(2);
  }));

  it('should test DataLoaderObservable', fakeAsync(() => {
    const loader = new DataLoaderObservable();
    loader.increment();
    tick();
    expect(loader.number).toBe(2);
  }));
});
