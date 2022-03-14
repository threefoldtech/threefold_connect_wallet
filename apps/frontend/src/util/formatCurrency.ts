const formatter = new Intl.NumberFormat(undefined, {
    // minimumFractionDigits: minFractionDigits,
    maximumSignificantDigits: 6,
    minimumSignificantDigits: 4,
    useGrouping: true,
});
export const formatCurrency = (value: number | string | undefined = 0) => {
    const parsed = typeof value === 'string' ? parseFloat(value) : value;

    if (parsed === undefined || isNaN(parsed)) {
        return formatter.format(0);
    }
    return formatter.format(parsed);
};
