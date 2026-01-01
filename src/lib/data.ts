
export type User = {
  id: string;
  name: string;
  avatar: string;
  score: number;
  rank: number;
  previousRank: number;
  previousScore: number;
  maxRank: number;
  minRank: number;
  maxScore: number;
  minScore: number;
  rankChange: number; // positive for up, negative for down, 0 for no change
  scoreChange: number;
  isPro?: boolean;
  email?: string;
  joinDate?: string;
};

export type Team = {
  id: string;
  name:string;
  logo: string;
  iconColour?: string;
  bgColourFaint?: string;
  bgColourSolid?: string;
  textColour?: string;
};

export type Prediction = {
  userId: string;
  rankings: string[]; // Array of team IDs in predicted order
};

export type Match = {
    week: number;
    homeTeamId: string;
    awayTeamId: string;
    homeScore: number;
    awayScore: number;
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
    goalsFor: number;
    goalsAgainst: number;
};

export type TeamRecentResult = {
  teamId: string;
  results: ('W' | 'D' | 'L' | '-')[];
};

export type MonthlyMimoM = {
  id: string;
  month: string;
  year: number;
  userId: string;
  special?: string;
  type: 'winner' | 'runner-up';
};

export type SeasonMonth = {
    id: string;
    month: string;
    year: number;
    special?: string;
    abbreviation: string;
}

export type PlayerTeamScore = {
    userId: string;
    teamId: string;
    score: number;
};

export type WeeklyScore = {
    week: number;
    score: number;
    rank: number;
};

export type UserHistory = {
    userId: string;
    weeklyScores: WeeklyScore[];
};

export type WeeklyTeamStanding = {
    week: number;
    teamId: string;
    rank: number;
};


// --- MINIMAL TEST DATA ---

export const teams: Team[] = [
    { id: 'team_1', name: 'Arsenal', logo: 'drill', bgColourFaint: 'rgba(239, 1, 7, 0.3)', bgColourSolid: '#EF0107', textColour: '#062657', iconColour: '#FFFFFF' },
    { id: 'team_12', name: 'Liverpool', logo: 'origami', bgColourFaint: 'rgba(200, 16, 46, 0.3)', bgColourSolid: '#C8102E', textColour: '#000000', iconColour: '#FFFFFF' },
    { id: 'team_13', name: 'Man City', logo: 'sailboat', bgColourFaint: 'rgba(108, 171, 221, 0.3)', bgColourSolid: '#6CABDD', textColour: '#00285E', iconColour: '#00285E' },
    { id: 'team_6', name: 'Chelsea', logo: 'creativeCommons', bgColourFaint: 'rgba(3, 70, 148, 0.3)', bgColourSolid: '#034694', textColour: '#FFFFFF', iconColour: '#FFFFFF' },
];

export const fullUsers: User[] = [
    { id: 'usr_1', name: 'Alex Anderson', avatar: '1', email: 'alex@example.com', joinDate: '2023-08-10T10:00:00Z', score: 10, rank: 1, previousRank: 2, previousScore: 5, maxRank: 1, minRank: 3, maxScore: 10, minScore: 2, rankChange: 1, scoreChange: 5 },
    { id: 'usr_2', name: 'Thomas Wright', avatar: '2', score: 8, rank: 2, previousRank: 1, previousScore: 8, maxRank: 1, minRank: 2, maxScore: 9, minScore: 8, rankChange: -1, scoreChange: 0 },
    { id: 'usr_3', name: 'Barrie Cross', avatar: '3', score: 5, rank: 3, previousRank: 3, previousScore: 5, maxRank: 3, minRank: 4, maxScore: 5, minScore: 3, rankChange: 0, scoreChange: 0 },
];

export const fullPredictions: Prediction[] = [
    { userId: "usr_1", rankings: ["team_6", "team_13", "team_12", "team_1"] },
    { userId: "usr_2", rankings: ["team_1", "team_12", "team_13", "team_6"] },
    { userId: "usr_3", rankings: ["team_12", "team_13", "team_1", "team_6"] },
];

export const matches: Match[] = [
    { week: 1, homeTeamId: 'team_1', awayTeamId: 'team_13', homeScore: -1, awayScore: -1 },
    { week: 1, homeTeamId: 'team_12', awayTeamId: 'team_6', homeScore: -1, awayScore: -1 },
];

export const previousSeasonStandings: PreviousSeasonStanding[] = [
    { teamId: 'team_13', rank: 1, points: 90, goalDifference: 60 },
    { teamId: 'team_1', rank: 2, points: 88, goalDifference: 55 },
    { teamId: 'team_12', rank: 3, points: 85, goalDifference: 50 },
    { teamId: 'team_6', rank: 4, points: 80, goalDifference: 45 },
];

export const seasonMonths: SeasonMonth[] = [
    { id: 'sm_1', month: 'August', year: 2025, abbreviation: 'AUG' },
];

export const monthlyMimoM: MonthlyMimoM[] = [];

export const fullUserHistories: UserHistory[] = [
    { userId: 'usr_1', weeklyScores: [{ week: 0, score: 0, rank: 0 }] },
    { userId: 'usr_2', weeklyScores: [{ week: 0, score: 0, rank: 0 }] },
    { userId: 'usr_3', weeklyScores: [{ week: 0, score: 0, rank: 0 }] },
];

export const playerTeamScores: PlayerTeamScore[] = [];

export const weeklyTeamStandings: WeeklyTeamStanding[] = [];

export const teamRecentResults: TeamRecentResult[] = [];

// Export limited data for UI performance
export const users: User[] = fullUsers.slice(0, 20);
export const predictions: Prediction[] = fullPredictions.slice(0, 20);
export const userHistories: UserHistory[] = fullUserHistories.slice(0, 20);
