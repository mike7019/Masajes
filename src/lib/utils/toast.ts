// Simple toast utility that mimics sonner API but uses our existing toast system
// This is a temporary solution until we can properly integrate sonner

let toastContext: any = null

export const setToastContext = (context: any) => {
  toastContext = context
}

export const toast = {
  success: (message: string) => {
    if (toastContext) {
      toastContext.addToast({ message, type: 'success' })
    } else {
      console.log('Success:', message)
    }
  },
  error: (message: string) => {
    if (toastContext) {
      toastContext.addToast({ message, type: 'error' })
    } else {
      console.error('Error:', message)
    }
  },
  warning: (message: string) => {
    if (toastContext) {
      toastContext.addToast({ message, type: 'warning' })
    } else {
      console.warn('Warning:', message)
    }
  },
  info: (message: string) => {
    if (toastContext) {
      toastContext.addToast({ message, type: 'info' })
    } else {
      console.info('Info:', message)
    }
  }
}