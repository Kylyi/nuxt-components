import { defineStore } from 'pinia'

// TYPES
import type { INotification } from '~/components/Notification/types/notification.type'

export const useNotificationStore = defineStore('notification', () => {
  const notifications = ref<INotification[]>([])
  const notificationsHistory = ref<INotification[]>([])

  const notificationIdxById = computed(() => {
    return notifications.value.reduce((agg, notification, idx) => {
      agg[notification.id] = idx

      return agg
    }, {} as Record<string | number, number>)
  })

  const addNotification = (notification: Omit<INotification, 'id'>) => {
    const sameNotification = notifications.value.find(notif => {
      return (
        notif.title === notification.title &&
        notif.subtitle === notification.subtitle &&
        notif.type === notification.type
      )
    })

    if (sameNotification?.counter !== undefined) {
      sameNotification.counter++
    } else {
      notifications.value = [
        { ...notification, counter: 1, id: Date.now() },
        ...notifications.value,
      ]
    }

    notificationsHistory.value = [
      { ...notification, id: Date.now(), timeout: 0 },
      ...notificationsHistory.value,
    ].slice(0, 50)
  }

  const removeNotification = (id: INotification['id']) => {
    notifications.value = notifications.value.filter(notif => notif.id !== id)
  }

  return {
    notifications,
    notificationsHistory,
    notificationIdxById,
    addNotification,
    removeNotification,
  }
})
