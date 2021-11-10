import {AfterViewInit, Component, Injector, OnChanges, ViewChild} from '@angular/core';
import {ReportComponent, ReportData} from "./report/report.component";
import {Title} from '@angular/platform-browser'
import {CompareComponent} from "./compare/compare.component";
import {DebugComponent} from "./debug/debug.component";
declare var require: any;
const { version: appVersion} = require('../../package.json')

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {
  injector!: Injector;
  appVersion: string;
  diffReports = {oldReport: '', newReport: ''}

  constructor(private inj: Injector, private titleService: Title) {
    this.appVersion = appVersion
    this.titleService.setTitle("Ladybug - v" + this.appVersion)
  }

  title = 'ladybug';
  active = 1;
  tabs: {key: string, value: any}[] = []

  /**
   * Open an extra tab for the test report
   * @param data - the data in the report
   */
  openTestReport(data: any) {
    this.injector = Injector.create({providers: [{provide: ReportData, useValue: data.data}], parent: this.inj})
    this.tabs.push( {key: data.name, value: ReportComponent})
    this.active = this.tabs.length + 3; // Active the tab immediately
  }

  openCompareReport(data: any) {
    this.active = 3;
    this.diffReports = data;
  }

  /**
   * Close the extra ta for the test report
   * @param event - mouse event
   * @param toRemove - the index of the report
   */
  closeTestReport(event: MouseEvent, toRemove: number) {
    this.tabs.splice(toRemove, 1);
    this.active--;
    event.preventDefault();
    event.stopImmediatePropagation();
  }
}
