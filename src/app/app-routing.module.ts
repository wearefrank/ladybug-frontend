import { NgModule } from '@angular/core';
import { ActivatedRouteSnapshot, DetachedRouteHandle, RouteReuseStrategy, RouterModule, Routes } from '@angular/router';
import { DebugComponent } from './debug/debug.component';
import { TestComponent } from './test/test.component';
import { CompareComponent } from './compare/compare.component';
import { ReportComponent } from './report/report.component';

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

export class AppRouteReuseStrategy implements RouteReuseStrategy {
  storedRoutes: { [key: string]: DetachedRouteHandle } = {};

  shouldDetach(route: ActivatedRouteSnapshot): boolean {
    return true;
  }

  store(route: ActivatedRouteSnapshot, handle: DetachedRouteHandle | null): void {
    if (route.routeConfig && handle) {
      this.storedRoutes[route.routeConfig.path || ''] = handle;
    }
  }

  shouldAttach(route: ActivatedRouteSnapshot): boolean {
    return !!route.routeConfig && !!this.storedRoutes[route.routeConfig.path || ''];
  }

  retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle | null {
    if (!route.routeConfig) return null;
    return this.storedRoutes[route.routeConfig.path || ''];
  }

  shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean {
    return future.routeConfig === curr.routeConfig;
  }
}
