export interface NotificationOptions {
  message: string
  delay?: number
  title?: string
  type?: 'info' | 'error' | 'success' | 'warning' | 'primary'
  positionX?: 'left' | 'center' | 'right'
  positionY?: 'top' | 'center' | 'bottom'
}

export interface NotificationService {
  info: (options: NotificationOptions | string) => void
  error: (options: NotificationOptions | string) => void
  success: (options: NotificationOptions | string) => void
  warning: (options: NotificationOptions | string) => void
  primary: (options: NotificationOptions | string) => void
}
