import { AngularServiceLocator } from './angular-service-locator'
import { NotificationService, NotificationOptions } from '../types/notification'

export class UINotification {
  private readonly notificationService: NotificationService

  constructor () {
    try {
      this.notificationService = AngularServiceLocator.getService('Notification')
    } catch (error) {
      console.error('Failed to get Notification service', error)
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
