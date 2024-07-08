import { Component, Input, Output } from '@angular/core';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-toggle-button',
  standalone: true,
  imports: [],
  templateUrl: './toggle-button.component.html',
  styleUrl: './toggle-button.component.css',
})
export class ToggleButtonComponent {
  @Input({ required: true }) value!: boolean;
  @Input() labels?: { on: string; off: string };
  @Output() valueChanged: Subject<boolean> = new Subject<boolean>();

  protected onChange(): void {
    this.value = !this.value;
    this.valueChanged.next(this.value);
  }
}
