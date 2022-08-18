import { ref } from 'vue';
import { nanoid } from 'nanoid';
import { INotification } from 'shared-types/src/interfaces/global/notification.interfaces';
import { NotificationType } from 'shared-types/src/enums/global/notification.enums';

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
