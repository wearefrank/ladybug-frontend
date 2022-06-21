import { DatePipe } from '@angular/common';
import { EnumToArrayPipe } from './enum-to-array.pipe';

describe('EnumToArrayPipe', () => {
  it('create an instance', () => {
    const pipe = new EnumToArrayPipe(new DatePipe('0'));
    expect(pipe).toBeTruthy();
  });
});
