
export const awardPeriods = [
    { id: 'aug', month: 'August', year: 2025, startWeek: 0, endWeek: 4, abbreviation: 'AUG' },
    { id: 'sep', month: 'September', year: 2025, startWeek: 4, endWeek: 7, abbreviation: 'SEPT' },
    { id: 'oct', month: 'October', year: 2025, startWeek: 7, endWeek: 10, abbreviation: 'OCT' },
    { id: 'nov', month: 'November', year: 2025, startWeek: 10, endWeek: 14, abbreviation: 'NOV' },
    { id: 'dec', month: 'December', year: 2025, startWeek: 14, endWeek: 19, abbreviation: 'DEC' },
    { id: 'jan', month: 'January', year: 2026, startWeek: 19, endWeek: 24, abbreviation: 'JAN' },
    { id: 'feb', month: 'February', year: 2026, startWeek: 24, endWeek: 28, abbreviation: 'FEB' },
    { id: 'mar', month: 'March', year: 2026, startWeek: 28, endWeek: 32, abbreviation: 'MAR' },
    { id: 'apr', month: 'April', year: 2026, startWeek: 32, endWeek: 35, abbreviation: 'APR' },
    { id: 'may', month: 'May', year: 2026, startWeek: 35, endWeek: 38, abbreviation: 'MAY' },
];
      
export const specialAwards = [
    { id: 'xmas', special: 'Xmas No 1', year: 2025, startWeek: 14, endWeek: 17, abbreviation: 'XMAS'},
];

// Chronological sort for the Hall of Fame display
export const allAwardPeriods = [
    awardPeriods[0], // Aug (0-4)
    awardPeriods[1], // Sep (4-7)
    awardPeriods[2], // Oct (7-10)
    awardPeriods[3], // Nov (10-14)
    specialAwards[0], // Xmas (14-17)
    awardPeriods[4], // Dec (14-19)
    awardPeriods[5], // Jan (19-24)
    awardPeriods[6], // Feb (24-28)
    awardPeriods[7], // Mar (28-32)
    awardPeriods[8], // Apr (32-35)
    awardPeriods[9], // May (35-38)
];

/**
 * Anchor dates for competition weeks.
 */
export const weekStarts = [
    { week: 0, date: "2025-08-11T00:00:00Z" },
    { week: 4, date: "2025-09-14T00:00:00Z" },
    { week: 7, date: "2025-10-05T00:00:00Z" },
    { week: 10, date: "2025-11-03T00:00:00Z" },
    { week: 14, date: "2025-12-04T00:00:00Z" },
    { week: 19, date: "2026-01-01T00:00:00Z" },
    { week: 24, date: "2026-02-02T00:00:00Z" },
    { week: 28, date: "2026-03-01T00:00:00Z" },
    { week: 32, date: "2026-04-13T00:00:00Z" },
].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

export function getCompetitionWeek(dateStr: string): number {
    const d = new Date(dateStr).getTime();
    for (const w of weekStarts) {
        if (d >= new Date(w.date).getTime()) return w.week;
    }
    return 1;
}
