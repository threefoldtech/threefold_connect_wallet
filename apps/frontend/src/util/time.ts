import { toNumber } from 'lodash';

export const formatTime = (timeString: string) => {
    let date = new Date(timeString);
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

export const timeStampToReadableDate = (timestamp: string) => {
    return new Date(toNumber(timestamp) * 1000).toLocaleDateString();
};
