import { NotificationType } from '../../enums/global/notification.enums';

export interface INotification {
    id: string;
    duration?: number;
    type: NotificationType;
    message: string;
    subtitle?: string;
}
