import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class VersionService {
  frontendVersion?: string;
  backendVersion?: string;

  constructor(private httpService: HttpService) {}

  async getFrontendVersion() {
    if (!this.frontendVersion) {
      try {
        const response: Response = await fetch('assets/package.json');
        if (response.ok) {
          const packageJson = await response.json();
          this.frontendVersion = packageJson.version;
        } else {
          console.error('package.json could not be found in assets', response);
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
