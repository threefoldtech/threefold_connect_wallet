import { toNumber } from 'lodash';

export const formatTime = (timeString: string) => {
    let date = new Date(timeString);
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

export const timeStampToReadableDate = (timestamp: string) => {
    if (!timestamp) return;

    return new Date(toNumber(timestamp) * 1000).toLocaleDateString();
};

export const isBefore = (timestamp: number) => {
    const now = new Date().getTime();
    return now < timestamp;
};
