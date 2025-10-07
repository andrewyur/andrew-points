const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
const divisions: { limit: number; unit: Intl.RelativeTimeFormatUnit }[] = [
    { limit: 60, unit: 'second' },
    { limit: 60, unit: 'minute' },
    { limit: 24, unit: 'hour' },
    { limit: 7, unit: 'day' },
];

export function formatTimeRelative(time: Date) {
    const diffMs = time.getTime() - new Date().getTime();
    const diffSec = Math.round(diffMs / 1000);

    let relTime = ""

    let value = diffSec;
    for (let i = 0; i < divisions.length; i++) {
        const division = divisions[i];
        relTime = rtf.format(Math.round(value), division.unit);
        if (Math.abs(value) < division.limit) {
            break;
        }
        value /= division.limit;
    }
    return relTime
}

export function formatTimeAbsolute(date: Date) {
    return Intl.DateTimeFormat('en-us', {
        dateStyle: 'short',
        timeStyle: 'short',
    }).format(date)
}