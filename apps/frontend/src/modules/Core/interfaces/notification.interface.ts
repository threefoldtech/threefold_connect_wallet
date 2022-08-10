import { NotificationType } from '@/modules/Core/enums/notification.enum';

export interface INotification {
    id: string;
    duration?: number;
    type: NotificationType;
    message: string;
    subtitle?: string;
}
