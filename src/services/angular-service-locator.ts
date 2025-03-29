import type * as ng from 'angular'

declare let angular: ng.IAngularStatic

export class AngularServiceLocator {
  private static injector: ng.auto.IInjectorService | null = null

  private static getInjector(): ng.auto.IInjectorService {
    if (this.injector) {
      return this.injector
    }

    const appElement = document.querySelector('[ng-app]')
    if (!appElement) {
      throw new Error('Angular app not found')
    }

    this.injector = angular.element(appElement).injector()
    return this.injector
  }

  static getService<T>(serviceName: string): T {
    return this.getInjector().get(serviceName)
  }
}
