import { ref } from 'vue';

export enum NotificationType {
    success = 'success',
    error = 'error',
    warning = 'warning',
    info = 'info',
}

export interface Notification {
    id: string;
    duration?: number;
    type: NotificationType;
    message: string;
    subtitle?: string;
}

export const notifications = ref<Notification[]>([]);

export const addNotification = (
    type: NotificationType = NotificationType.info,
    message: string,
    subtitle?: string,
    duration?: number
) => {
    const notification: Notification = {
        duration,
        // @ts-ignore
        id: globalThis.crypto.randomUUID(),
        message,
        type,
        subtitle,
    };

    notifications.value.push(notification);

    if (notification?.duration && notification.duration >= 0) {
        setTimeout(() => {
            notifications.value = notifications.value.filter(n => n.id !== notification.id);
        }, notification.duration);
    }
};
