import { ref } from 'vue';
import { nanoid } from 'nanoid';
import { NotificationType } from '@/modules/Core/enums/notification.enum';
import { INotification } from '@/modules/Core/interfaces/notification.interface';

export const notifications = ref<INotification[]>([]);

export const addNotification = (
    type: NotificationType = NotificationType.info,
    message: string,
    subtitle?: string,
    duration: number = 10000
) => {
    const foundNotification = notifications.value.find(
        (notification: INotification) => notification.message === message && notification.subtitle === subtitle
    );
    if (foundNotification) {
        return;
    }

    const notification: INotification = {
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
