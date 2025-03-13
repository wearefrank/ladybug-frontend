/* eslint sonarjs/no-gratuitous-expressions: 0 */
/* eslint sonarjs/no-extra-arguments: 0 */

import { Injectable, NgModule } from '@angular/core';
import { ActivatedRouteSnapshot, DetachedRouteHandle, RouteReuseStrategy, RouterModule, Routes } from '@angular/router';
import { DebugComponent } from './debug/debug.component';
import { TestComponent } from './test/test.component';
import { CompareComponent } from './compare/compare.component';
import { ReportComponent } from './report/report.component';
import { TabService } from './shared/services/tab.service';

export const routes: Routes = [
  {
    component: DebugComponent,
    path: DebugComponent.ROUTER_PATH,
    pathMatch: 'full',
  },
  {
    component: TestComponent,
    path: TestComponent.ROUTER_PATH,
  },
  {
    component: ReportComponent,
    path: `${ReportComponent.ROUTER_PATH}/:id`,
  },
  {
    component: CompareComponent,
    path: `${CompareComponent.ROUTER_PATH}/:id`,
  },
  {
    path: '',
    redirectTo: 'debug',
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}

@Injectable({
  providedIn: 'root',
})
export class AppRouteReuseStrategy implements RouteReuseStrategy {
  storedRoutes: { [key: string]: DetachedRouteHandle } = {};

  constructor(private tabService: TabService) {
    this.tabService.closeTab$.subscribe((closeTab) => {
      const pathPrefix = closeTab.type === 'report' ? 'report' : 'compare';
      const routePath = `${pathPrefix}/${closeTab.id}`;

      delete this.storedRoutes[routePath];
    });
  }

  shouldDetach(route: ActivatedRouteSnapshot): boolean {
    return true;
  }

  store(route: ActivatedRouteSnapshot, handle: DetachedRouteHandle | null): void {
    if (route.routeConfig && handle) {
      const path = route.routeConfig.path || '';
      const id = this.getRouteId(route);

      if (path.startsWith('report') || path.startsWith('compare')) {
        if (
          (path.startsWith('report') && this.tabService.activeReportTabs.has(id)) ||
          (path.startsWith('compare') && this.tabService.activeCompareTabs.has(id))
        ) {
          this.storedRoutes[path] = handle;
        } else {
          delete this.storedRoutes[path];
        }
      } else {
        this.storedRoutes[path] = handle;
      }
    }
  }

  shouldAttach(route: ActivatedRouteSnapshot): boolean {
    const path = route.routeConfig?.path || '';
    return !!this.storedRoutes[path];
  }

  retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle | null {
    const path = route.routeConfig?.path || '';
    return this.storedRoutes[path] || null;
  }

  shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean {
    return future.routeConfig === curr.routeConfig;
  }

  private getRouteId(route: ActivatedRouteSnapshot): string {
    return route.params['id'] || '';
  }
}
