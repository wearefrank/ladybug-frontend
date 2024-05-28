import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

@Component({
  selector: 'app-toggle',
  templateUrl: './toggle.component.html',
  styleUrls: ['./toggle.component.css'],
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule],
})
export class ToggleComponent {
  @Input() state = false;
  @Output() stateChange = new EventEmitter<boolean>();

  changeState(): void {
    this.stateChange.emit(this.state);
  }
}
