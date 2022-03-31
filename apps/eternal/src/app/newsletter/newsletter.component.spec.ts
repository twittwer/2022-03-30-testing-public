import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import {
  ComponentFixture,
  ComponentFixtureAutoDetect,
  TestBed,
  TestModuleMetadata
} from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NewsletterComponent } from './newsletter.component';

describe('NewsletterComponent', () => {
  let component: NewsletterComponent;
  let fixture: ComponentFixture<NewsletterComponent>;

  const setup = (config: TestModuleMetadata = {}) => {
    TestBed.configureTestingModule({
      ...{
        declarations: [NewsletterComponent],
        imports: [ReactiveFormsModule, HttpClientTestingModule],
        providers: [{ provide: ComponentFixtureAutoDetect, useValue: true }]
      },
      ...config
    });
    fixture = TestBed.createComponent(NewsletterComponent);
    component = fixture.componentInstance;
  };

  it('should create', () => {
    setup({ providers: [] });
    expect(component).toBeTruthy();
  });

  it('should subscribe without DOM interaction', () => {
    component.formGroup.setValue({ email: 'user@host.com' });
    component.handleSubmit();
    expect(component.message).toBe('Thank you for your subscription');
  });

  it('should not subscribe without DOM interaction', () => {
    component.handleSubmit();
    expect(component.message).toBe('Please provide an email');
  });

  it('should not subscribe with DOM interaction', () => {
    fixture.debugElement.query(By.css('button')).nativeElement.click();
    const messageBox = fixture.debugElement.query(By.css('p'))
      .nativeElement as HTMLParagraphElement;
    expect(messageBox.textContent).toBe('Please provide an email');
  });

  it.only('should subscribe with DOM interaction', () => {
    const input = fixture.debugElement.query(By.css('input')).nativeElement as HTMLInputElement;
    input.value = 'user@host.com';
    input.dispatchEvent(new CustomEvent('input'));

    fixture.debugElement.query(By.css('button')).nativeElement.click();

    const controller = TestBed.inject(HttpTestingController);
    const req = controller.expectOne('http://some.host.com/newsletter/subscribe');
    req.flush(true);
    fixture.detectChanges();

    const messageBox = fixture.debugElement.query(By.css('p'))
      .nativeElement as HTMLParagraphElement;
    expect(messageBox.textContent).toBe('Thank for your subscription!');
  });

  it('should subscribe in mixed mode', () => {
    const input = fixture.debugElement.query(By.css('input')).nativeElement as HTMLInputElement;
    input.value = 'user@host.com';
    input.dispatchEvent(new CustomEvent('input'));

    component.handleSubmit();
    fixture.detectChanges();
    const messageBox = fixture.debugElement.query(By.css('p'))
      .nativeElement as HTMLParagraphElement;
    expect(messageBox.textContent).toBe('Thank you for your subscription');
  });
});
