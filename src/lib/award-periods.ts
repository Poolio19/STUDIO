
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
