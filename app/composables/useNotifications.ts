// Simple notification composable for toast notifications
// In production, this would integrate with a toast library like vue-sonner or vue-toastification

export const useNotifications = () => {
  const notify = {
    success: (message: string) => {
      // TODO: Integrate with toast library or notification system
      console.log('✓ Success:', message)
    },
    error: (message: string) => {
      // TODO: Integrate with toast library or notification system
      console.error('✗ Error:', message)
    },
    info: (message: string) => {
      // TODO: Integrate with toast library or notification system
      console.info('ℹ Info:', message)
    },
    warning: (message: string) => {
      // TODO: Integrate with toast library or notification system
      console.warn('⚠ Warning:', message)
    },
  }

  return {
    notify,
  }
}
