export function formatMonthYear(value, locale = 'en') {
    if (!value)
        return '';
    const [year, month] = value.split('-');
    if (!year || !month)
        return value;
    if (locale === 'ru') {
        return `${month}.${year}`;
    }
    return `${month}/${year}`;
}
export function currentMonthValue() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
}
