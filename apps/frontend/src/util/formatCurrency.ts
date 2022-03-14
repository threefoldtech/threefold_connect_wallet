const formatter = new Intl.NumberFormat(undefined, {
    // minimumFractionDigits: minFractionDigits,
    maximumSignificantDigits: 6,
    minimumSignificantDigits: 4,
    useGrouping: true,
});
export const formatCurrency = (value: number) => {
    return formatter.format(value);
};
