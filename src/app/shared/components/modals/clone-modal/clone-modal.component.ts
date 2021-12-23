import {Component, ViewChild} from '@angular/core';
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: 'app-clone-modal',
  templateUrl: './clone-modal.component.html',
  styleUrls: ['./clone-modal.component.css']
})
export class CloneModalComponent {
  @ViewChild('modal') modal!: any;

  constructor(private modalService: NgbModal) {}

  open() {
    this.modalService.open(this.modal)
  }


}
