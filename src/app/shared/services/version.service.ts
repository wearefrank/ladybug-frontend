import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { firstValueFrom } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class VersionService {
  packageJsonPath = 'assets/package.json';
  frontendVersion?: string;
  backendVersion?: string;

  constructor(
    private httpService: HttpService,
    private httpClient: HttpClient,
  ) {}

  async getFrontendVersion() {
    if (!this.frontendVersion) {
      try {
        const packageJson = await firstValueFrom(this.httpClient.get<{ version: string }>(this.packageJsonPath));
        if (packageJson) {
          this.frontendVersion = packageJson.version;
        }
      } catch (error) {
        console.error('package.json could not be found in assets', error);
      }
    }
    return this.frontendVersion!;
  }

  async getBackendVersion() {
    if (!this.backendVersion) {
      this.backendVersion = await firstValueFrom(this.httpService.getBackendVersion());
    }
    return this.backendVersion;
  }
}
