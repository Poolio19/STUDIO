
export const awardPeriods = [
    { id: 'aug', month: 'August', year: 2025, startWeek: 0, endWeek: 3, abbreviation: 'AUG' },
    { id: 'sep', month: 'September', year: 2025, startWeek: 3, endWeek: 7, abbreviation: 'SEPT' },
    { id: 'oct', month: 'October', year: 2025, startWeek: 7, endWeek: 10, abbreviation: 'OCT' },
    { id: 'nov', month: 'November', year: 2025, startWeek: 10, endWeek: 13, abbreviation: 'NOV' },
    { id: 'dec', month: 'December', year: 2025, startWeek: 13, endWeek: 19, abbreviation: 'DEC' },
    { id: 'jan', month: 'January', year: 2026, startWeek: 19, endWeek: 24, abbreviation: 'JAN' },
    { id: 'feb', month: 'February', year: 2026, startWeek: 24, endWeek: 28, abbreviation: 'FEB' },
    { id: 'mar', month: 'March', year: 2026, startWeek: 28, endWeek: 32, abbreviation: 'MAR' },
    { id: 'apr', month: 'April', year: 2026, startWeek: 32, endWeek: 35, abbreviation: 'APR' },
    { id: 'may', month: 'May', year: 2026, startWeek: 35, endWeek: 38, abbreviation: 'MAY' },
];
      
export const specialAwards = [
    { id: 'xmas', special: 'Christmas No. 1', year: 2025, startWeek: 13, endWeek: 17, abbreviation: 'XMAS'},
];

export const allAwardPeriods = [...awardPeriods, ...specialAwards];

export const weekStarts = [
    { week: 1, date: "2025-08-11T00:00:00Z" },
    { week: 2, date: "2025-08-18T00:00:00Z" },
    { week: 3, date: "2025-08-25T00:00:00Z" },
    { week: 4, date: "2025-09-08T00:00:00Z" },
    { week: 5, date: "2025-09-15T00:00:00Z" },
    { week: 6, date: "2025-09-22T00:00:00Z" },
    { week: 7, date: "2025-09-29T00:00:00Z" },
    { week: 8, date: "2025-10-13T00:00:00Z" },
    { week: 9, date: "2025-10-20T00:00:00Z" },
    { week: 10, date: "2025-10-27T00:00:00Z" },
    { week: 11, date: "2025-11-03T00:00:00Z" },
    { week: 12, date: "2025-11-17T00:00:00Z" },
    { week: 13, date: "2025-11-24T00:00:00Z" },
    { week: 14, date: "2025-12-01T00:00:00Z" },
    { week: 15, date: "2025-12-05T00:00:00Z" },
    { week: 16, date: "2025-12-08T00:00:00Z" },
    { week: 17, date: "2025-12-15T00:00:00Z" },
    { week: 18, date: "2025-12-22T00:00:00Z" },
    { week: 19, date: "2025-12-29T00:00:00Z" },
    { week: 20, date: "2026-01-01T00:00:00Z" },
    { week: 21, date: "2026-01-05T00:00:00Z" },
    { week: 22, date: "2026-01-12T00:00:00Z" },
    { week: 23, date: "2026-01-19T00:00:00Z" },
    { week: 24, date: "2026-01-26T00:00:00Z" },
    { week: 25, date: "2026-02-02T00:00:00Z" },
    { week: 26, date: "2026-02-09T00:00:00Z" },
    { week: 27, date: "2026-02-23T00:00:00Z" },
    { week: 28, date: "2026-02-27T00:00:00Z" },
    { week: 29, date: "2026-03-02T00:00:00Z" },
    { week: 30, date: "2026-03-09T00:00:00Z" },
    { week: 31, date: "2026-03-16T00:00:00Z" },
    { week: 32, date: "2026-04-06T00:00:00Z" },
    { week: 33, date: "2026-04-13T00:00:00Z" },
    { week: 34, date: "2026-04-20T00:00:00Z" },
    { week: 35, date: "2026-04-27T00:00:00Z" },
    { week: 36, date: "2026-05-04T00:00:00Z" },
    { week: 37, date: "2026-05-11T00:00:00Z" },
    { week: 38, date: "2026-05-18T00:00:00Z" },
].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

export function getCompetitionWeek(dateStr: string): number {
    const d = new Date(dateStr).getTime();
    for (const w of weekStarts) {
        if (d >= new Date(w.date).getTime()) return w.week;
    }
    return 1;
}
