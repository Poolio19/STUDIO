
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


// --- FULL DATA SET ---

export const teams: Team[] = [
    { id: 'team_1', name: 'Arsenal', logo: 'drill', bgColourFaint: 'rgba(239, 1, 7, 0.3)', bgColourSolid: '#EF0107', textColour: '#062657', iconColour: '#FFFFFF' },
    { id: 'team_2', name: 'Aston Villa', logo: 'fingerprint', bgColourFaint: 'rgba(103, 0, 52, 0.3)', bgColourSolid: '#670034', textColour: '#95BFE5', iconColour: '#95BFE5' },
    { id: 'team_3', name: 'Bournemouth', logo: 'cherry', bgColourFaint: 'rgba(218, 41, 28, 0.3)', bgColourSolid: '#DA291C', textColour: '#000000', iconColour: '#FFFFFF' },
    { id: 'team_4', name: 'Brentford', logo: 'bug', bgColourFaint: 'rgba(227, 6, 19, 0.3)', bgColourSolid: '#E30613', textColour: '#FFFFFF', iconColour: '#FFFFFF' },
    { id: 'team_5', name: 'Brighton', logo: 'bird', bgColourFaint: 'rgba(0, 87, 184, 0.3)', bgColourSolid: '#0057B8', textColour: '#FFFFFF', iconColour: '#FFFFFF' },
    { id: 'team_6', name: 'Chelsea', logo: 'creativeCommons', bgColourFaint: 'rgba(3, 70, 148, 0.3)', bgColourSolid: '#034694', textColour: '#FFFFFF', iconColour: '#FFFFFF' },
    { id: 'team_7', name: 'Crystal Palace', logo: 'castle', bgColourFaint: 'rgba(27, 69, 143, 0.3)', bgColourSolid: '#1B458F', textColour: '#C4122E', iconColour: '#C4122E' },
    { id: 'team_8', name: 'Everton', logo: 'shieldHalf', bgColourFaint: 'rgba(0, 51, 160, 0.3)', bgColourSolid: '#0033A0', textColour: '#FFFFFF', iconColour: '#FFFFFF' },
    { id: 'team_9', name: 'Fulham', logo: 'rabbit', bgColourFaint: 'rgba(0, 0, 0, 0.3)', bgColourSolid: '#000000', textColour: '#FFFFFF', iconColour: '#FFFFFF' },
    { id: 'team_10', name: 'Ipswich Town', logo: 'gitlab', bgColourFaint: 'rgba(29, 66, 138, 0.3)', bgColourSolid: '#1D428A', textColour: '#FFFFFF', iconColour: '#FFFFFF' },
    { id: 'team_11', name: 'Leicester City', logo: 'squirrel', bgColourFaint: 'rgba(0, 83, 160, 0.3)', bgColourSolid: '#0053A0', textColour: '#FDBE11', iconColour: '#FDBE11' },
    { id: 'team_12', name: 'Liverpool', logo: 'origami', bgColourFaint: 'rgba(200, 16, 46, 0.3)', bgColourSolid: '#C8102E', textColour: '#000000', iconColour: '#FFFFFF' },
    { id: 'team_13', name: 'Man City', logo: 'sailboat', bgColourFaint: 'rgba(108, 171, 221, 0.3)', bgColourSolid: '#6CABDD', textColour: '#00285E', iconColour: '#00285E' },
    { id: 'team_14', name: 'Man Utd', logo: 'sparkles', bgColourFaint: 'rgba(218, 41, 28, 0.3)', bgColourSolid: '#DA291C', textColour: '#FBE122', iconColour: '#FBE122' },
    { id: 'team_15', name: 'Newcastle', logo: 'shieldUser', bgColourFaint: 'rgba(45, 41, 38, 0.3)', bgColourSolid: '#2D2926', textColour: '#FFFFFF', iconColour: '#FFFFFF' },
    { id: 'team_16', name: 'Notts Forest', logo: 'treeDeciduous', bgColourFaint: 'rgba(221, 0, 0, 0.3)', bgColourSolid: '#DD0000', textColour: '#FFFFFF', iconColour: '#FFFFFF' },
    { id: 'team_17', name: 'Southampton', logo: 'theater', bgColourFaint: 'rgba(215, 25, 32, 0.3)', bgColourSolid: '#D71920', textColour: '#FFFFFF', iconColour: '#FFFFFF' },
    { id: 'team_18', name: 'Spurs', logo: 'home', bgColourFaint: 'rgba(19, 34, 83, 0.3)', bgColourSolid: '#132257', textColour: '#FFFFFF', iconColour: '#FFFFFF' },
    { id: 'team_19', name: 'West Ham', logo: 'hammer', bgColourFaint: 'rgba(122, 38, 58, 0.3)', bgColourSolid: '#7A263A', textColour: '#FBE122', iconColour: '#FBE122' },
    { id: 'team_20', name: 'Wolves', logo: 'flower', bgColourFaint: 'rgba(253, 190, 17, 0.3)', bgColourSolid: '#FDBE11', textColour: '#000000', iconColour: '#000000' }
];

export const fullUsers: User[] = [
  { id: 'usr_1', name: 'Alex Anderson', avatar: '1', score: 10, rank: 1, previousRank: 2, previousScore: 5, maxRank: 1, minRank: 3, maxScore: 10, minScore: 2, rankChange: 1, scoreChange: 5, email: 'alex.anderson@example.com', joinDate: '2023-08-10' },
  { id: 'usr_2', name: 'Maria Garcia', avatar: '2', score: 8, rank: 2, previousRank: 1, previousScore: 8, maxRank: 1, minRank: 2, maxScore: 9, minScore: 8, rankChange: -1, scoreChange: 0, email: 'maria.garcia@example.com', joinDate: '2023-08-11' },
  { id: 'usr_3', name: 'David Smith', avatar: '3', score: 5, rank: 3, previousRank: 3, previousScore: 5, maxRank: 3, minRank: 4, maxScore: 5, minScore: 3, rankChange: 0, scoreChange: 0, email: 'david.smith@example.com', joinDate: '2023-08-12' },
  { id: 'usr_4', name: 'Sophia Johnson', avatar: '4', score: 3, rank: 4, previousRank: 5, previousScore: 1, maxRank: 4, minRank: 6, maxScore: 3, minScore: -2, rankChange: 1, scoreChange: 2, email: 'sophia.johnson@example.com', joinDate: '2023-08-13' },
  { id: 'usr_5', name: 'Kenji Tanaka', avatar: '5', score: 1, rank: 5, previousRank: 4, previousScore: 3, maxRank: 4, minRank: 5, maxScore: 4, minScore: 1, rankChange: -1, scoreChange: -2, email: 'kenji.tanaka@example.com', joinDate: '2023-08-14' },
  { id: 'usr_6', name: 'Fatima Ahmed', avatar: '6', score: 0, rank: 6, previousRank: 6, previousScore: 0, maxRank: 6, minRank: 8, maxScore: 2, minScore: -1, rankChange: 0, scoreChange: 0, email: 'fatima.ahmed@example.com', joinDate: '2023-08-15' },
  { id: 'usr_7', name: 'Leo Rossi', avatar: '7', score: -2, rank: 7, previousRank: 8, previousScore: -4, maxRank: 7, minRank: 9, maxScore: 0, minScore: -5, rankChange: 1, scoreChange: 2, email: 'leo.rossi@example.com', joinDate: '2023-08-16' },
  { id: 'usr_8', name: 'Chloe Dubois', avatar: '8', score: -5, rank: 8, previousRank: 7, previousScore: -3, maxRank: 7, minRank: 8, maxScore: -2, minScore: -6, rankChange: -1, scoreChange: -2, email: 'chloe.dubois@example.com', joinDate: '2023-08-17' },
  { id: 'usr_9', name: 'Mohammed Ali', avatar: '9', score: -8, rank: 9, previousRank: 9, previousScore: -8, maxRank: 8, minRank: 10, maxScore: -7, minScore: -10, rankChange: 0, scoreChange: 0, email: 'mohammed.ali@example.com', joinDate: '2023-08-18' },
  { id: 'usr_10', name: 'Isabella Johansson', avatar: '10', score: -12, rank: 10, previousRank: 10, previousScore: -10, maxRank: 9, minRank: 11, maxScore: -9, minScore: -12, rankChange: 0, scoreChange: -2, email: 'isabella.johansson@example.com', joinDate: '2023-08-19' },
  { id: 'usr_11', name: 'James Wilson', avatar: '11', score: 15, rank: 1, previousRank: 3, previousScore: 12, maxRank: 1, minRank: 5, maxScore: 15, minScore: 10, rankChange: 2, scoreChange: 3, isPro: false, email: 'james.wilson@example.com', joinDate: '2023-08-20' },
  { id: 'usr_12', name: 'Amelia Brown', avatar: '12', score: -15, rank: 12, previousRank: 11, previousScore: -13, maxRank: 10, minRank: 13, maxScore: -11, minScore: -15, rankChange: -1, scoreChange: -2, isPro: false, email: 'amelia.brown@example.com', joinDate: '2023-08-21' },
  { id: 'usr_13', name: 'Benjamin Green', avatar: '13', score: 20, rank: 1, previousRank: 1, previousScore: 20, maxRank: 1, minRank: 1, maxScore: 20, minScore: 20, rankChange: 0, scoreChange: 0, isPro: true, email: 'benjamin.green@example.com', joinDate: '2023-08-22' },
  { id: 'usr_14', name: 'Mia Taylor', avatar: '14', score: -20, rank: 14, previousRank: 14, previousScore: -18, maxRank: 13, minRank: 15, maxScore: -17, minScore: -20, rankChange: 0, scoreChange: -2, isPro: false, email: 'mia.taylor@example.com', joinDate: '2023-08-23' },
  { id: 'usr_15', name: 'Elijah Moore', avatar: '15', score: 25, rank: 1, previousRank: 2, previousScore: 22, maxRank: 1, minRank: 3, maxScore: 25, minScore: 20, rankChange: 1, scoreChange: 3, isPro: false, email: 'elijah.moore@example.com', joinDate: '2023-08-24' },
  { id: 'usr_16', name: 'Harper King', avatar: '16', score: -25, rank: 16, previousRank: 15, previousScore: -22, maxRank: 14, minRank: 16, maxScore: -21, minScore: -25, rankChange: -1, scoreChange: -3, isPro: false, email: 'harper.king@example.com', joinDate: '2023-08-25' },
  { id: 'usr_17', name: 'Lucas White', avatar: '17', score: 30, rank: 1, previousRank: 1, previousScore: 30, maxRank: 1, minRank: 1, maxScore: 30, minScore: 30, rankChange: 0, scoreChange: 0, isPro: true, email: 'lucas.white@example.com', joinDate: '2023-08-26' },
  { id: 'usr_18', name: 'Evelyn Harris', avatar: '18', score: -30, rank: 18, previousRank: 18, previousScore: -28, maxRank: 17, minRank: 19, maxScore: -27, minScore: -30, rankChange: 0, scoreChange: -2, isPro: false, email: 'evelyn.harris@example.com', joinDate: '2023-08-27' },
  { id: 'usr_19', name: 'Henry Clark', avatar: '19', score: 35, rank: 1, previousRank: 2, previousScore: 32, maxRank: 1, minRank: 3, maxScore: 35, minScore: 30, rankChange: 1, scoreChange: 3, isPro: false, email: 'henry.clark@example.com', joinDate: '2023-08-28' },
  { id: 'usr_20', name: 'Abigail Lewis', avatar: '20', score: -35, rank: 20, previousRank: 19, previousScore: -32, maxRank: 18, minRank: 20, maxScore: -31, minScore: -35, rankChange: -1, scoreChange: -3, isPro: false, email: 'abigail.lewis@example.com', joinDate: '2023-08-29' }
];

export const fullPredictions: Prediction[] = [
  { userId: "usr_1", rankings: ["team_13", "team_1", "team_12", "team_6", "team_2", "team_18", "team_15", "team_19", "team_7", "team_5", "team_20", "team_9", "team_8", "team_3", "team_4", "team_16", "team_17", "team_11", "team_10", "team_14"] },
  { userId: "usr_2", rankings: ["team_13", "team_1", "team_12", "team_6", "team_2", "team_18", "team_15", "team_19", "team_7", "team_5", "team_20", "team_9", "team_8", "team_3", "team_4", "team_16", "team_17", "team_11", "team_10", "team_14"] },
  { userId: "usr_3", rankings: ["team_13", "team_1", "team_12", "team_6", "team_2", "team_18", "team_15", "team_19", "team_7", "team_5", "team_20", "team_9", "team_8", "team_3", "team_4", "team_16", "team_17", "team_11", "team_10", "team_14"] },
  { userId: "usr_4", rankings: ["team_13", "team_1", "team_12", "team_6", "team_2", "team_18", "team_15", "team_19", "team_7", "team_5", "team_20", "team_9", "team_8", "team_3", "team_4", "team_16", "team_17", "team_11", "team_10", "team_14"] },
  { userId: "usr_5", rankings: ["team_13", "team_1", "team_12", "team_6", "team_2", "team_18", "team_15", "team_19", "team_7", "team_5", "team_20", "team_9", "team_8", "team_3", "team_4", "team_16", "team_17", "team_11", "team_10", "team_14"] },
  { userId: "usr_6", rankings: ["team_13", "team_1", "team_12", "team_6", "team_2", "team_18", "team_15", "team_19", "team_7", "team_5", "team_20", "team_9", "team_8", "team_3", "team_4", "team_16", "team_17", "team_11", "team_10", "team_14"] },
  { userId: "usr_7", rankings: ["team_13", "team_1", "team_12", "team_6", "team_2", "team_18", "team_15", "team_19", "team_7", "team_5", "team_20", "team_9", "team_8", "team_3", "team_4", "team_16", "team_17", "team_11", "team_10", "team_14"] },
  { userId: "usr_8", rankings: ["team_13", "team_1", "team_12", "team_6", "team_2", "team_18", "team_15", "team_19", "team_7", "team_5", "team_20", "team_9", "team_8", "team_3", "team_4", "team_16", "team_17", "team_11", "team_10", "team_14"] },
  { userId: "usr_9", rankings: ["team_13", "team_1", "team_12", "team_6", "team_2", "team_18", "team_15", "team_19", "team_7", "team_5", "team_20", "team_9", "team_8", "team_3", "team_4", "team_16", "team_17", "team_11", "team_10", "team_14"] },
  { userId: "usr_10", rankings: ["team_13", "team_1", "team_12", "team_6", "team_2", "team_18", "team_15", "team_19", "team_7", "team_5", "team_20", "team_9", "team_8", "team_3", "team_4", "team_16", "team_17", "team_11", "team_10", "team_14"] },
  { userId: "usr_11", rankings: ["team_13", "team_1", "team_12", "team_6", "team_2", "team_18", "team_15", "team_19", "team_7", "team_5", "team_20", "team_9", "team_8", "team_3", "team_4", "team_16", "team_17", "team_11", "team_10", "team_14"] },
  { userId: "usr_12", rankings: ["team_13", "team_1", "team_12", "team_6", "team_2", "team_18", "team_15", "team_19", "team_7", "team_5", "team_20", "team_9", "team_8", "team_3", "team_4", "team_16", "team_17", "team_11", "team_10", "team_14"] },
  { userId: "usr_13", rankings: ["team_13", "team_1", "team_12", "team_6", "team_2", "team_18", "team_15", "team_19", "team_7", "team_5", "team_20", "team_9", "team_8", "team_3", "team_4", "team_16", "team_17", "team_11", "team_10", "team_14"] },
  { userId: "usr_14", rankings: ["team_13", "team_1", "team_12", "team_6", "team_2", "team_18", "team_15", "team_19", "team_7", "team_5", "team_20", "team_9", "team_8", "team_3", "team_4", "team_16", "team_17", "team_11", "team_10", "team_14"] },
  { userId: "usr_15", rankings: ["team_13", "team_1", "team_12", "team_6", "team_2", "team_18", "team_15", "team_19", "team_7", "team_5", "team_20", "team_9", "team_8", "team_3", "team_4", "team_16", "team_17", "team_11", "team_10", "team_14"] },
  { userId: "usr_16", rankings: ["team_13", "team_1", "team_12", "team_6", "team_2", "team_18", "team_15", "team_19", "team_7", "team_5", "team_20", "team_9", "team_8", "team_3", "team_4", "team_16", "team_17", "team_11", "team_10", "team_14"] },
  { userId: "usr_17", rankings: ["team_13", "team_1", "team_12", "team_6", "team_2", "team_18", "team_15", "team_19", "team_7", "team_5", "team_20", "team_9", "team_8", "team_3", "team_4", "team_16", "team_17", "team_11", "team_10", "team_14"] },
  { userId: "usr_18", rankings: ["team_13", "team_1", "team_12", "team_6", "team_2", "team_18", "team_15", "team_19", "team_7", "team_5", "team_20", "team_9", "team_8", "team_3", "team_4", "team_16", "team_17", "team_11", "team_10", "team_14"] },
  { userId: "usr_19", rankings: ["team_13", "team_1", "team_12", "team_6", "team_2", "team_18", "team_15", "team_19", "team_7", "team_5", "team_20", "team_9", "team_8", "team_3", "team_4", "team_16", "team_17", "team_11", "team_10", "team_14"] },
  { userId: "usr_20", rankings: ["team_13", "team_1", "team_12", "team_6", "team_2", "team_18", "team_15", "team_19", "team_7", "team_5", "team_20", "team_9", "team_8", "team_3", "team_4", "team_16", "team_17", "team_11", "team_10", "team_14"] }
];

export const matches: Match[] = [
    { week: 1, homeTeamId: 'team_1', awayTeamId: 'team_20', homeScore: -1, awayScore: -1 },
    { week: 1, homeTeamId: 'team_2', awayTeamId: 'team_19', homeScore: -1, awayScore: -1 },
    { week: 1, homeTeamId: 'team_3', awayTeamId: 'team_18', homeScore: -1, awayScore: -1 },
    { week: 1, homeTeamId: 'team_4', awayTeamId: 'team_17', homeScore: -1, awayScore: -1 },
    { week: 1, homeTeamId: 'team_5', awayTeamId: 'team_16', homeScore: -1, awayScore: -1 },
    { week: 1, homeTeamId: 'team_6', awayTeamId: 'team_15', homeScore: -1, awayScore: -1 },
    { week: 1, homeTeamId: 'team_7', awayTeamId: 'team_14', homeScore: -1, awayScore: -1 },
    { week: 1, homeTeamId: 'team_8', awayTeamId: 'team_13', homeScore: -1, awayScore: -1 },
    { week: 1, homeTeamId: 'team_9', awayTeamId: 'team_12', homeScore: -1, awayScore: -1 },
    { week: 1, homeTeamId: 'team_10', awayTeamId: 'team_11', homeScore: -1, awayScore: -1 }
];

export const previousSeasonStandings: PreviousSeasonStanding[] = teams.map((team, index) => ({
    teamId: team.id,
    rank: index + 1,
    points: 90 - index * 3,
    goalDifference: 40 - index * 2
}));

export const seasonMonths: SeasonMonth[] = [
    { id: 'sm_1', month: 'August', year: 2025, abbreviation: 'AUG' },
    { id: 'sm_2', month: 'September', year: 2025, abbreviation: 'SEP' },
    { id: 'sm_3', month: 'October', year: 2025, abbreviation: 'OCT' },
    { id: 'sm_4', month: 'November', year: 2025, abbreviation: 'NOV' },
    { id: 'sm_5', month: 'December', year: 2025, abbreviation: 'DEC', special: 'Christmas No. 1' },
    { id: 'sm_6', month: 'January', year: 2026, abbreviation: 'JAN' },
    { id: 'sm_7', month: 'February', year: 2026, abbreviation: 'FEB' },
    { id: 'sm_8', month: 'March', year: 2026, abbreviation: 'MAR' },
    { id: 'sm_9', month: 'April', year: 2026, abbreviation: 'APR' },
    { id: 'sm_10', month: 'May', year: 2026, abbreviation: 'MAY' }
];

export const monthlyMimoM: MonthlyMimoM[] = [];

export const fullUserHistories: UserHistory[] = fullUsers.map(user => ({
    userId: user.id,
    weeklyScores: [{ week: 0, score: 0, rank: 0 }]
}));

export const playerTeamScores: PlayerTeamScore[] = [];

export const weeklyTeamStandings: WeeklyTeamStanding[] = [];

export const teamRecentResults: TeamRecentResult[] = teams.map(team => ({
    teamId: team.id,
    results: ['-', '-', '-', '-', '-', '-']
}));

// Export all data for the app to use
export const users: User[] = fullUsers;
export const predictions: Prediction[] = fullPredictions;
export const userHistories: UserHistory[] = fullUserHistories;
