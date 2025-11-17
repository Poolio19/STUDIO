
import { userHistories, users, type UserHistory } from '@/lib/data';

export type UserChartData = {
    week: number;
    Score: number;
    Rank: number;
};

export const getHistoryForUser = (userId: string): UserChartData[] => {
    const history = userHistories.find(h => h.userId === userId);
    if (!history) return [];

    return history.weeklyScores
        .filter(week => week.week > 0) // Exclude week 0
        .map(week => ({
            week: week.week,
            Score: week.score,
            Rank: week.rank,
        }));
};

// Example data for a default user (Alex)
export const defaultUserHistory = getHistoryForUser('usr_1');
