import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ReportComponent } from './report/report.component';
import { Title } from '@angular/platform-browser';
import { CompareComponent } from './compare/compare.component';
import { Report } from './shared/interfaces/report';
import { TestComponent } from './test/test.component';
import { DynamicService } from './shared/services/dynamic.service';
import { CompareData } from './compare/compare-data';
import { SettingsService } from './shared/services/settings.service';
import { DebugReportService } from './debug/debug-report.service';
import { TabService } from './shared/services/tab.service';
import { Subscription } from 'rxjs';
import { DebugComponent } from './debug/debug.component';
import { Router } from '@angular/router';
import { Tab } from './shared/interfaces/tab';
import { ReportData } from './shared/interfaces/report-data';
import { HelperService } from './shared/services/helper.service';

declare var require: any;
const { version: appVersion } = require('../../package.json');

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit, OnDestroy, AfterViewInit {
  appVersion: string;
  @ViewChild(CompareComponent) compareComponent!: CompareComponent;
  @ViewChild(TestComponent) testComponent!: TestComponent;

  title: string = 'ladybug';
  tabs: Tab[] = [];

  protected readonly debugComponentPath: string = `/${DebugComponent.ROUTER_PATH}`;
  protected readonly testComponentPath: string = `/${TestComponent.ROUTER_PATH}`;

  newTabSubscription!: Subscription;
  newCompareTabSubscription!: Subscription;

  constructor(
    private titleService: Title,
    private dynamicService: DynamicService,
    //make sure settings are retrieved from localstorage on startup by initializing the service on startup
    private settingsService: SettingsService,
    private debugReportService: DebugReportService,
    private tabService: TabService,
    private router: Router,
    private helperService: HelperService,
  ) {
    this.appVersion = appVersion;
    this.titleService.setTitle(`Ladybug - v${this.appVersion}`);
  }

  ngOnInit(): void {
    this.subscribeToServices();
  }

  ngAfterViewInit(): void {
    this.observeReportSave();
  }

  ngOnDestroy(): void {
    this.newTabSubscription.unsubscribe();
    this.newCompareTabSubscription.unsubscribe();
  }

  subscribeToServices(): void {
    this.newTabSubscription = this.tabService.openReportInTabObservable.subscribe((value) => {
      this.openReportInSeparateTab(value);
    });

    this.newCompareTabSubscription = this.tabService.openInCompareObservable.subscribe((value) => {
      this.openNewCompareTab(value);
    });
  }

  openReportInSeparateTab(data: ReportData): void {
    const tabIndex: number = this.tabs.findIndex((tab: Tab): boolean => tab.id === data.report.storageId.toString());
    if (tabIndex == -1) {
      this.tabs.push({
        key: data.report.name,
        id: data.report.storageId.toString(),
        data: data.report,
        path: `report/${data.report.storageId}`,
      });
    }

    this.router.navigate([ReportComponent.ROUTER_PATH, data.report.storageId.toString()]);
  }

  observeReportSave(): void {
    this.dynamicService.getObservable().subscribe((report: Report) => {
      const tabIndex: number = this.tabs.findIndex((tab: Tab): boolean => Number(tab.id) == report.storageId);
      this.tabs[tabIndex].data = report;
    });
  }

  openNewCompareTab(data: CompareData): void {
    const tabId = this.helperService.createCompareTabId(data.originalReport, data.runResultReport);
    const tabIndex: number = this.tabs.findIndex((tab: Tab): boolean => tab.id == tabId);

    if (tabIndex == -1) {
      data.id = tabId;
      this.tabs.push({
        key: 'Compare',
        id: tabId,
        data: data,
        path: `compare/${tabId}`,
      });
    }
    this.router.navigate([CompareComponent.ROUTER_PATH, tabId]);
  }

  closeTab(tab: Tab): void {
    const index: number = this.tabs.indexOf(tab);
    this.tabs.splice(index, 1);
    if (this.router.url.includes(tab.path)) {
      this.router.navigate([DebugComponent.ROUTER_PATH]);
    }
  }
}
