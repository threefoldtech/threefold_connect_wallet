const formatter = new Intl.NumberFormat(undefined, {
    maximumSignificantDigits: 6,
    minimumSignificantDigits: 4,
    useGrouping: true,
});

export const currencyUtil = (value: number | string | undefined = 0) => {
    const parsedValue = typeof value === 'string' ? parseFloat(value) : value;

    if (parsedValue === undefined || isNaN(parsedValue)) {
        return formatter.format(0);
    }
    return formatter.format(parsedValue);
};
