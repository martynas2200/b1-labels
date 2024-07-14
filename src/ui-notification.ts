import type * as ng from 'angular'

export interface NotificationService {
  info: (options: NotificationOptions | string) => void
  error: (options: NotificationOptions | string) => void
  success: (options: NotificationOptions | string) => void
  warning: (options: NotificationOptions | string) => void
  primary: (options: NotificationOptions | string) => void
}
interface NotificationOptions {
  message: string
  delay?: number
  title?: string
  type?: 'info' | 'error' | 'success' | 'warning' | 'primary'
  positionX?: 'left' | 'center' | 'right'
  positionY?: 'top' | 'center' | 'bottom'
}

declare let angular: ng.IAngularStatic

export class UINotification {
  private readonly notificationService: NotificationService

  constructor () {
    const appElement = document.querySelector('[ng-app]')
    if (appElement === null) {
      throw new Error('Angular app not found')
    }
    try {
      const injector = angular.element(appElement).injector()
      this.notificationService = injector.get('Notification')
    } catch (error) {
      console.error('Failed to get Notification service', error)
      alert('Failed to get Notification service')
      this.notificationService = {
        info: (options: NotificationOptions | string): void =>  alert(options),
        error: (options: NotificationOptions | string): void => alert(options),
        success: (options: NotificationOptions | string): void => alert(options),
        warning: (options: NotificationOptions | string): void => alert(options),
        primary: (options: NotificationOptions | string): void => alert(options)
      }
    }
  }

  info (options: NotificationOptions | string): void {
    this.notificationService.info(options)
  }

  error (options: NotificationOptions | string): void {
    this.notificationService.error(options)
  }

  success (options: NotificationOptions | string): void {
    this.notificationService.success(options)
  }

  warning (options: NotificationOptions | string): void {
    this.notificationService.warning(options)
  }

  primary (options: NotificationOptions | string): void {
    this.notificationService.primary(options)
  }
}
