
export type User = {
  id: string;
  name: string;
  avatar: string;
  score: number;
  rank: number;
  maxRank: number;
  minRank: number;
  maxScore: number;
  minScore: number;
  rankChange: number; // positive for up, negative for down, 0 for no change
  scoreChange: number;
};

export type Team = {
  id: string;
  name: string;
  logo: string;
};

export type Prediction = {
  userId: string;
  rankings: string[]; // Array of team IDs in predicted order
};

export type UserPredictionHistory = {
  game: string;
  prediction: string;
  actual: string;
  points: number;
  date: string;
};

export type PreviousSeasonStanding = {
  teamId: string;
  rank: number;
  points: number;
  goalDifference: number;
};

export type CurrentStanding = {
    teamId: string;
    rank: number;
    points: number;
    goalDifference: number;
    gamesPlayed: number;
    wins: number;
    draws: number;
    losses: number;
};

export type MonthlyMimoM = {
  month: string;
  year: number;
  userId: string;
};

export type PlayerTeamScore = {
    userId: string;
    teamId: string;
    score: number;
};

let usersData: User[] = [
    { id: 'usr_1', name: 'Alex', avatar: '1', score: 0, rank: 1, maxRank: 1, minRank: 5, maxScore: 90, minScore: -10, rankChange: 0, scoreChange: 16 },
    { id: 'usr_2', name: 'Maria', avatar: '2', score: 0, rank: 2, maxRank: 2, minRank: 8, maxScore: 80, minScore: -20, rankChange: 1, scoreChange: 12 },
    { id: 'usr_3', name: 'David', avatar: '3', score: 0, rank: 2, maxRank: 1, minRank: 10, maxScore: 85, minScore: -15, rankChange: -1, scoreChange: -6 },
    { id: 'usr_4', name: 'Sophia', avatar: '4', score: 0, rank: 4, maxRank: 4, minRank: 6, maxScore: 60, minScore: 0, rankChange: 0, scoreChange: 8 },
    { id: 'usr_5', name: 'Kenji', avatar: '5', score: 0, rank: 5, maxRank: 5, minRank: 9, maxScore: 50, minScore: -5, rankChange: 2, scoreChange: 20 },
    { id: 'usr_6', name: 'Fatima', avatar: '6', score: 0, rank: 6, maxRank: 3, minRank: 12, maxScore: 40, minScore: -25, rankChange: -1, scoreChange: -10 },
    { id: 'usr_7', name: 'Leo', avatar: '7', score: 0, rank: 7, maxRank: 7, minRank: 15, maxScore: 20, minScore: -30, rankChange: 0, scoreChange: 6 },
    { id: 'usr_8', name: 'Chloe', avatar: '8', score: 0, rank: 7, maxRank: 8, minRank: 18, maxScore: 30, minScore: -40, rankChange: 3, scoreChange: 18 },
    { id: 'usr_9', name: 'Mohammed', avatar: '9', score: 0, rank: 9, maxRank: 6, minRank: 20, maxScore: 10, minScore: -50, rankChange: -2, scoreChange: -8 },
    { id: 'usr_10', name: 'Isabella', avatar: '10', score: 0, rank: 10, maxRank: 9, minRank: 22, maxScore: 5, minScore: -60, rankChange: 1, scoreChange: 8 },
    { id: 'usr_11', name: 'James', avatar: '11', score: 0, rank: 11, maxRank: 10, minRank: 25, maxScore: 0, minScore: -70, rankChange: 0, scoreChange: 0 },
    { id: 'usr_12', name: 'Amelia', avatar: '12', score: 0, rank: 12, maxRank: 11, minRank: 28, maxScore: -10, minScore: -80, rankChange: -3, scoreChange: -16 },
    { id: 'usr_13', name: 'Benjamin', avatar: '13', score: 0, rank: 13, maxRank: 12, minRank: 29, maxScore: -15, minScore: -85, rankChange: 2, scoreChange: 10 },
    { id: 'usr_14', name: 'Mia', avatar: '14', score: 0, rank: 14, maxRank: 13, minRank: 30, maxScore: -20, minScore: -90, rankChange: 0, scoreChange: 2 },
    { id: 'usr_15', name: 'Elijah', avatar: '15', score: 0, rank: 15, maxRank: 15, minRank: 30, maxScore: -25, minScore: -95, rankChange: 1, scoreChange: 4 },
    { id: 'usr_16', name: 'Harper', avatar: '16', score: 0, rank: 16, maxRank: 16, minRank: 30, maxScore: -30, minScore: -100, rankChange: -1, scoreChange: -4 },
    { id: 'usr_17', name: 'Lucas', avatar: '17', score: 0, rank: 17, maxRank: 17, minRank: 30, maxScore: -35, minScore: -105, rankChange: 0, scoreChange: 0 },
    { id: 'usr_18', name: 'Evelyn', avatar: '18', score: 0, rank: 18, maxRank: 18, minRank: 30, maxScore: -40, minScore: -110, rankChange: 1, scoreChange: 2 },
    { id: 'usr_19', name: 'Henry', avatar: '19', score: 0, rank: 19, maxRank: 19, minRank: 30, maxScore: -45, minScore: -115, rankChange: -1, scoreChange: -2 },
    { id: 'usr_20', name: 'Abigail', avatar: '20', score: 0, rank: 20, maxRank: 20, minRank: 30, maxScore: -50, minScore: -120, rankChange: 0, scoreChange: 0 },
    { id: 'usr_21', name: 'Alexander', avatar: '21', score: 0, rank: 21, maxRank: 21, minRank: 30, maxScore: -55, minScore: -125, rankChange: 0, scoreChange: 0 },
    { id: 'usr_22', name: 'Emily', avatar: '22', score: 0, rank: 22, maxRank: 22, minRank: 30, maxScore: -60, minScore: -130, rankChange: 0, scoreChange: 0 },
    { id: 'usr_23', name: 'Daniel', avatar: '23', score: 0, rank: 23, maxRank: 23, minRank: 30, maxScore: -65, minScore: -135, rankChange: 0, scoreChange: 0 },
    { id: 'usr_24', name: 'Elizabeth', avatar: '24', score: 0, rank: 24, maxRank: 24, minRank: 30, maxScore: -70, minScore: -140, rankChange: 0, scoreChange: 0 },
    { id: 'usr_25', name: 'Michael', avatar: '25', score: 0, rank: 25, maxRank: 25, minRank: 30, maxScore: -75, minScore: -145, rankChange: 0, scoreChange: 0 },
    { id: 'usr_26', name: 'Sofia', avatar: '26', score: 0, rank: 26, minRank: 30, maxScore: -80, minScore: -150, rankChange: 0, scoreChange: 0 },
    { id: 'usr_27', name: 'Matthew', avatar: '27', score: 0, rank: 27, maxRank: 27, minRank: 30, maxScore: -85, minScore: -155, rankChange: 0, scoreChange: 0 },
    { id: 'usr_28', name: 'Avery', avatar: '28', score: 0, rank: 28, maxRank: 28, minRank: 30, maxScore: -90, minScore: -160, rankChange: 0, scoreChange: 0 },
    { id: 'usr_29', name: 'Joseph', avatar: '29', score: 0, rank: 29, maxRank: 29, minRank: 30, maxScore: -95, minScore: -165, rankChange: 0, scoreChange: 0 },
    { id: 'usr_30', name: 'Scarlett', avatar: '30', score: 0, rank: 30, maxRank: 30, minRank: 30, maxScore: -100, minScore: -170, rankChange: 0, scoreChange: 0 },
];

export const teams: Team[] = [
    { id: 'team_1', name: 'Arsenal', logo: 'rocket' },
    { id: 'team_2', name: 'Aston Villa', logo: 'orbit' },
    { id: 'team_3', name: 'Bournemouth', logo: 'waves' },
    { id: 'team_4', name: 'Brentford', logo: 'atom' },
    { id: 'team_5', name: 'Brighton', logo: 'zap' },
    { id: 'team_6', name: 'Chelsea', logo: 'anchor' },
    { id: 'team_7', name: 'Crystal Palace', logo: 'atom' },
    { id: 'team_8', name: 'Everton', logo: 'rocket' },
    { id: 'team_9', name: 'Fulham', logo: 'orbit' },
    { id: 'team_10', name: 'Ipswich Town', logo: 'waves' },
    { id: 'team_11', name: 'Leicester City', logo: 'zap' },
    { id: 'team_12', name: 'Liverpool', logo: 'anchor' },
    { id: 'team_13', name: 'Man City', logo: 'atom' },
    { id: 'team_14', name: 'Man Utd', logo: 'rocket' },
    { id: 'team_15', name: 'Newcastle United', logo: 'orbit' },
    { id: 'team_16', name: 'Notts Forest', logo: 'waves' },
    { id: 'team_17', name: 'Southampton', logo: 'zap' },
    { id: 'team_18', name: 'Tottenham', logo: 'anchor' },
    { id: 'team_19', name: 'West Ham', logo: 'atom' },
    { id: 'team_20', name: 'Wolves', logo: 'rocket' },
];

export const previousSeasonStandings: PreviousSeasonStanding[] = [
    { teamId: 'team_13', rank: 1, points: 91, goalDifference: 62 },
    { teamId: 'team_1', rank: 2, points: 89, goalDifference: 65 },
    { teamId: 'team_12', rank: 3, points: 82, goalDifference: 45 },
    { teamId: 'team_2', rank: 4, points: 68, goalDifference: 22 },
    { teamId: 'team_18', rank: 5, points: 66, goalDifference: 13 },
    { teamId: 'team_6', rank: 6, points: 63, goalDifference: 14 },
    { teamId: 'team_15', rank: 7, points: 60, goalDifference: 23 },
    { teamId: 'team_14', rank: 8, points: 60, goalDifference: -1 },
    { teamId: 'team_19', rank: 9, points: 52, goalDifference: -14 },
    { teamId: 'team_7', rank: 10, points: 49, goalDifference: -1 },
    { teamId: 'team_5', rank: 11, points: 48, goalDifference: -7 },
    { teamId: 'team_3', rank: 12, points: 48, goalDifference: -13 },
    { teamId: 'team_9', rank: 13, points: 47, goalDifference: -6 },
    { teamId: 'team_20', rank: 14, points: 46, goalDifference: -15 },
    { teamId: 'team_8', rank: 15, points: 40, goalDifference: -11 },
    { teamId: 'team_4', rank: 16, points: 39, goalDifference: -9 },
    { teamId: 'team_16', rank: 17, points: 32, goalDifference: -18 },
    { teamId: 'team_11', rank: 18, points: 31, goalDifference: -20 },
    { teamId: 'team_10', rank: 19, points: 26, goalDifference: -35 },
    { teamId: 'team_17', rank: 20, points: 25, goalDifference: -37 },
];

/**
 * Generates a slightly randomized version of the previous season's standings.
 * It swaps a few teams around to create a plausible but not identical prediction.
 * @param baseStandings The standings from the previous season.
 * @returns A new array of team IDs in a slightly different order.
 */
const generateBiasedPrediction = (baseStandings: PreviousSeasonStanding[]): string[] => {
  const teamIds = baseStandings.map(s => s.teamId);
  const newRankings = [...teamIds];

  // Perform a few swaps to introduce some variability
  const numSwaps = Math.floor(Math.random() * 5) + 3; // 3 to 7 swaps

  for (let i = 0; i < numSwaps; i++) {
    const idx1 = Math.floor(Math.random() * newRankings.length);
    let idx2 = Math.floor(Math.random() * newRankings.length);

    // Ensure the swap is not with the same index and is somewhat close
    const maxSwapDistance = 5;
    if (Math.abs(idx1 - idx2) > maxSwapDistance) {
      idx2 = (idx1 + Math.floor(Math.random() * maxSwapDistance) - 2) % newRankings.length;
      if (idx2 < 0) idx2 += newRankings.length;
    }
    if (idx1 === idx2) {
        idx2 = (idx1 + 1) % newRankings.length;
    }


    // Swap elements
    [newRankings[idx1], newRankings[idx2]] = [newRankings[idx2], newRankings[idx1]];
  }

  return newRankings;
}

export const predictions: Prediction[] = usersData.map(user => {
    return {
      userId: user.id,
      rankings: generateBiasedPrediction(previousSeasonStandings),
    };
});

export const currentStandings: CurrentStanding[] = [
    { teamId: 'team_13', rank: 1, points: 12, goalDifference: 8, gamesPlayed: 4, wins: 4, draws: 0, losses: 0 },
    { teamId: 'team_1', rank: 2, points: 10, goalDifference: 6, gamesPlayed: 4, wins: 3, draws: 1, losses: 0 },
    { teamId: 'team_12', rank: 3, points: 10, goalDifference: 5, gamesPlayed: 4, wins: 3, draws: 1, losses: 0 },
    { teamId: 'team_18', rank: 4, points: 9, goalDifference: 4, gamesPlayed: 4, wins: 3, draws: 0, losses: 1 },
    { teamId: 'team_2', rank: 5, points: 9, goalDifference: 3, gamesPlayed: 4, wins: 3, draws: 0, losses: 1 },
    { teamId: 'team_6', rank: 6, points: 7, goalDifference: 2, gamesPlayed: 4, wins: 2, draws: 1, losses: 1 },
    { teamId: 'team_19', rank: 7, points: 7, goalDifference: 1, gamesPlayed: 4, wins: 2, draws: 1, losses: 1 },
    { teamId: 'team_14', rank: 8, points: 6, goalDifference: 0, gamesPlayed: 4, wins: 2, draws: 0, losses: 2 },
    { teamId: 'team_5', rank: 9, points: 6, goalDifference: 0, gamesPlayed: 4, wins: 2, draws: 0, losses: 2 },
    { teamId: 'team_15', rank: 10, points: 5, goalDifference: -1, gamesPlayed: 4, wins: 1, draws: 2, losses: 1 },
    { teamId: 'team_7', rank: 11, points: 4, goalDifference: -2, gamesPlayed: 4, wins: 1, draws: 1, losses: 2 },
    { teamId: 'team_20', rank: 12, points: 4, goalDifference: -2, gamesPlayed: 4, wins: 1, draws: 1, losses: 2 },
    { teamId: 'team_3', rank: 13, points: 4, goalDifference: -3, gamesPlayed: 4, wins: 1, draws: 1, losses: 2 },
    { teamId: 'team_9', rank: 14, points: 3, goalDifference: -4, gamesPlayed: 4, wins: 1, draws: 0, losses: 3 },
    { teamId: 'team_4', rank: 15, points: 3, goalDifference: -4, gamesPlayed: 4, wins: 1, draws: 0, losses: 3 },
    { teamId: 'team_8', rank: 16, points: 2, goalDifference: -5, gamesPlayed: 4, wins: 0, draws: 2, losses: 2 },
    { teamId: 'team_16', rank: 17, points: 2, goalDifference: -6, gamesPlayed: 4, wins: 0, draws: 2, losses: 2 },
    { teamId: 'team_17', rank: 18, points: 1, goalDifference: -7, gamesPlayed: 4, wins: 0, draws: 1, losses: 3 },
    { teamId: 'team_11', rank: 19, points: 1, goalDifference: -8, gamesPlayed: 4, wins: 0, draws: 1, losses: 3 },
    { teamId: 'team_10', rank: 20, points: 0, goalDifference: -9, gamesPlayed: 4, wins: 0, draws: 0, losses: 4 },
];

export const monthlyMimoM: MonthlyMimoM[] = [
    { month: 'January', year: 2024, userId: 'usr_5' },
    { month: 'February', year: 2024, userId: 'usr_8' },
    { month: 'March', year: 2024, userId: 'usr_13' },
    { month: 'April', year: 2024, userId: 'usr_2' },
];

const generateScores = (userId: string): PlayerTeamScore[] => {
    return teams.map(team => {
        let score;
        const rand = Math.random();
        if (rand < 0.1) score = 5; // 10% chance of a perfect 5
        else if (rand < 0.3) score = 4; // 20% chance
        else if (rand < 0.6) score = 3; // 30% chance
        else if (rand < 0.8) score = 2; // 20% chance
        else if (rand < 0.9) score = 1; // 10% chance
        else score = 0; // 10% chance

        // occasionally give negative scores
        if (Math.random() < 0.15) {
             score = -Math.floor(Math.random() * 5); // -0 to -4
        }
        return {
            userId: userId,
            teamId: team.id,
            score: score
        };
    });
};

const allScores: PlayerTeamScore[] = usersData.flatMap(user => generateScores(user.id));
export const playerTeamScores: PlayerTeamScore[] = allScores;

// --- Recalculate user scores and ranks based on playerTeamScores ---
usersData.forEach(user => {
    const totalScore = playerTeamScores
        .filter(score => score.userId === user.id)
        .reduce((sum, current) => sum + current.score, 0);
    user.score = totalScore;
});

// Sort users by score in descending order
const sortedUsersData = [...usersData].sort((a, b) => b.score - a.score);

// Assign ranks, handling ties
let currentRank = 1;
for (let i = 0; i < sortedUsersData.length; i++) {
    if (i > 0 && sortedUsersData[i].score < sortedUsersData[i - 1].score) {
        currentRank = i + 1;
    }
    const user = sortedUsersData[i];
    user.rank = currentRank;

    // Set high/low watermarks to the current (and only) values
    user.maxRank = currentRank;
    user.minRank = currentRank;
    user.maxScore = user.score;
    user.minScore = user.score;
}

export const users: User[] = sortedUsersData;
