import { AfterViewInit, Component, Injector, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ReportComponent, ReportData } from './report/report.component';
import { Title } from '@angular/platform-browser';
import { HttpService } from './shared/services/http.service';
import { CompareComponent } from './compare/compare.component';
import { Report } from './shared/interfaces/report';
import { TestComponent } from './test/test.component';
import { DynamicService } from './shared/services/dynamic.service';
import { CompareData } from './compare/compare-data';
import { SettingsService } from './shared/services/settings.service';
import { DebugReportService } from './debug/debug-report.service';
import { TabService } from './shared/services/tab.service';
import { Subscription } from 'rxjs';
import { Tab } from './shared/interfaces/tab';

declare var require: any;
const { version: appVersion } = require('../../package.json');

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit, OnDestroy, AfterViewInit {
  injector!: Injector;
  reportInjector!: Injector;
  compareInjector!: Injector;
  appVersion: string;
  FIXED_TAB_AMOUNT = 2;
  @ViewChild(CompareComponent) compareComponent!: CompareComponent;
  @ViewChild(TestComponent) testComponent!: TestComponent;

  title = 'ladybug';
  active = 1;
  previousActive = 1;
  tabs: Tab[] = [];

  newTabSubscription!: Subscription;
  newCompareTabSubscription!: Subscription;

  constructor(
    private inj: Injector,
    private titleService: Title,
    private httpService: HttpService,
    private dynamicService: DynamicService,
    //make sure settings are retrieved from localstorage on startup by initializing the service on startup
    private settingsService: SettingsService,
    private debugReportService: DebugReportService,
    private tabService: TabService,
  ) {
    this.appVersion = appVersion;
    this.titleService.setTitle('Ladybug - v' + this.appVersion);
  }

  ngOnInit() {
    this.subscribeToServices();
  }

  ngAfterViewInit(): void {
    this.observeReportSave();
  }

  ngOnDestroy() {
    this.newTabSubscription.unsubscribe();
    this.newCompareTabSubscription.unsubscribe();
  }

  subscribeToServices() {
    this.newTabSubscription = this.tabService.openReportInTabObservable.subscribe((value) =>
      this.openReportInSeparateTab(value),
    );

    this.newCompareTabSubscription = this.tabService.openInCompareObservable.subscribe((value) =>
      this.openNewCompareTab(value),
    );
  }

  openReportInSeparateTab(data: any): void {
    const tabIndex: number = this.tabs.findIndex((tab) => tab.id === data.data.storageId);
    if (tabIndex == -1) {
      this.changingTabs(data.data, 'Report');
      this.tabs.push({
        key: data.name,
        id: data.data.storageId,
        data: data.data,
        path: `report/${data.report.storageId}`,
      });
      this.active = this.FIXED_TAB_AMOUNT + this.tabs.length; // Active the tab immediately
    } else {
      this.active = this.FIXED_TAB_AMOUNT + tabIndex + 1;
    }
  }

  observeReportSave() {
    this.dynamicService.getObservable().subscribe((report: Report) => {
      const tabIndex: number = this.tabs.findIndex((tab: Tab): boolean => tab.id == report.storageId);
      this.tabs.findIndex((tab) => tab.id == report.storageId);
      this.tabs[tabIndex].data = report;
    });
  }

  openNewCompareTab(data: any) {
    const tabId = data.originalReport.storageId + '-' + data.runResultReport.storageId;
    const tabIndex: number = this.tabs.findIndex((tab) => tab.id == tabId);

    if (tabIndex == -1) {
      data.id = tabId;
      this.changingTabs(data, 'Compare');
      this.tabs.push({
        key: 'Compare',
        id: tabId,
        data: data,
        path: `compare/${tabId}`,
      });
      this.active = this.FIXED_TAB_AMOUNT + this.tabs.length;
    } else {
      this.active = this.FIXED_TAB_AMOUNT + tabIndex + 1;
    }
  }

  closeTab(event: MouseEvent, toRemove: number): void {
    this.tabs.splice(toRemove, 1);
    this.active = this.previousActive;
    event.preventDefault();
    event.stopImmediatePropagation();
  }

  detectTabChange(event: any) {
    let tab = this.tabs[event.nextId - this.FIXED_TAB_AMOUNT - 1];
    if (event.nextId > this.FIXED_TAB_AMOUNT) {
      this.changingTabs(tab.data, tab.key);
    }

    if (event.nextId == 2) {
      this.testComponent.getCopiedReports();
      this.testComponent.getGeneratorStatus();
    }
  }

  changingTabs(data: any, type: any) {
    if (type == 'Compare') {
      this.compareInjector = Injector.create({
        providers: [{ provide: CompareData, useValue: data }],
        parent: this.inj,
      });
    } else {
      this.reportInjector = Injector.create({
        providers: [{ provide: ReportData, useValue: data }],
        parent: this.inj,
      });
    }
  }
}
