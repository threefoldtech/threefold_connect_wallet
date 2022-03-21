import { ref } from 'vue';
import { nanoid } from 'nanoid';

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
    duration: number = 10000
) => {
    const foundNotification = notifications.value.find(
        (notification: Notification) => notification.message === message && notification.subtitle === subtitle
    );
    if (foundNotification) {
        return;
    }

    const notification: Notification = {
        duration,
        // @ts-ignore
        id: nanoid(),
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
