import { toNumber } from 'lodash';

export const formatTime = (timeString: string) => {
    let date = new Date(timeString);
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

// @TODO: discuss with Wijne to avoid this undefined timestamp issue without ts-ignore
export const timeStampToReadableDate = (timestamp: string | undefined) => {
    if (!timestamp) return;
    return new Date(toNumber(timestamp) * 1000).toLocaleDateString();
};
