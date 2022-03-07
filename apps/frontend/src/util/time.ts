export const formatTime = (timeString: string) => {
    let date = new Date(timeString);
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};
