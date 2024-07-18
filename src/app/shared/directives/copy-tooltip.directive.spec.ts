import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MatTooltip, MatTooltipModule } from '@angular/material/tooltip';
import { Clipboard } from '@angular/cdk/clipboard';
import { By } from '@angular/platform-browser';
import { CopyTooltipDirective } from './copy-tooltip.directive';

@Component({
  template: ` <button [appCopyTooltip]="value">Click me</button>`,
})
class TestComponent {
  value = '';
}

describe('CopyTooltipDirective', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TestComponent],
      imports: [MatTooltipModule, CopyTooltipDirective],
      providers: [Clipboard],
    });
  });

  // eslint-disable-next-line unicorn/consistent-function-scoping
  function setup(value: string) {
    const fixture = TestBed.createComponent(TestComponent);
    const component = fixture.componentInstance;
    component.value = value;
    fixture.detectChanges();
    return fixture;
  }

  it('should not show tooltip if value is an empty string', () => {
    const fixture = setup('');
    const button = fixture.debugElement.query(By.css('button'));
    const tooltip = button.injector.get(MatTooltip);

    spyOn(tooltip, 'show').and.callThrough();
    spyOn(tooltip, 'hide').and.callThrough();

    button.nativeElement.click();

    expect(tooltip.show).not.toHaveBeenCalled();
    expect(tooltip.hide).not.toHaveBeenCalled();
  });

  it('should show tooltip if value is not an empty string', () => {
    const fixture = setup('Some value');
    const button = fixture.debugElement.query(By.css('button'));
    const tooltip = button.injector.get(MatTooltip);

    spyOn(tooltip, 'show').and.callThrough();
    spyOn(tooltip, 'hide').and.callThrough();

    button.nativeElement.click();

    fixture.detectChanges();

    expect(tooltip.show).toHaveBeenCalled();
    setTimeout(() => {
      expect(tooltip.hide).toHaveBeenCalled();
    }, 2100);
  });
});
