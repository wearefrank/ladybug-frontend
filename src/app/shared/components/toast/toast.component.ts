import {Component, OnInit, ViewChild} from '@angular/core';
import {NgbAlert} from "@ng-bootstrap/ng-bootstrap";
import {Alert} from "../../interfaces/alert";

@Component({
  selector: 'app-toast',
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.css']
})
export class ToastComponent implements OnInit {
  TIMEOUT = 1000;
  alerts: Alert[] = [
    // {type: 'warning', message: 'There is some error wow!'},
    // {type: 'danger', message: 'There is a big error wow!'},
    // {type: 'success', message: 'There is no error wow!'}
    ]

  @ViewChild('staticAlert', {static: false}) staticAlert!: NgbAlert;

  constructor() {}

  ngOnInit(): void {
    // Show the alert for 5 seconds
    setTimeout(() => {
      if (this.staticAlert) {
        this.staticAlert.close();
        this.alerts = [];
      }
    }, this.TIMEOUT)
  }

  /**
   * Closes the alert
   * @param alert - alert that will be closed
   */
  close(alert: Alert): void {
    this.alerts.splice(this.alerts.indexOf(alert), 1)
    this.ngOnInit();
  }

  /**
   * Adds an alert
   * @param alert - alert that will be added
   */
  addAlert(alert: Alert): void {
    this.alerts.push(alert)
    this.ngOnInit();
  }
}
