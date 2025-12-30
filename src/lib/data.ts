



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

// --- STATIC DATA ---

const allTeams: Team[] = [
    { id: 'team_1', name: 'Arsenal', logo: 'drill', bgColourFaint: 'rgba(239, 1, 7, 0.3)', bgColourSolid: '#EF0107', textColour: '#062657', iconColour: '#FFFFFF' },
    { id: 'team_2', name: 'Aston Villa', logo: 'squirrel', bgColourFaint: 'rgba(149, 191, 229, 0.3)', bgColourSolid: '#95BFE5', textColour: '#670E36', iconColour: '#670E36' },
    { id: 'team_3', name: 'Bournemouth', logo: 'fingerprint', bgColourFaint: 'rgba(218, 41, 28, 0.3)', bgColourSolid: '#DA291C', textColour: '#000000', iconColour: '#000000' },
    { id: 'team_4', name: 'Brentford', logo: 'bug', bgColourFaint: 'rgba(200, 16, 46, 0.3)', bgColourSolid: '#C8102E', textColour: '#000000', iconColour: '#FFFFFF' },
    { id: 'team_5', name: 'Brighton', logo: 'bird', bgColourFaint: 'rgba(0, 87, 184, 0.3)', bgColourSolid: '#0057B8', textColour: '#FFFFFF', iconColour: '#FFFFFF' },
    { id: 'team_6', name: 'Chelsea', logo: 'creativeCommons', bgColourFaint: 'rgba(3, 70, 148, 0.3)', bgColourSolid: '#034694', textColour: '#FFFFFF', iconColour: '#FFFFFF' },
    { id: 'team_7', name: 'Crystal Palace', logo: 'rabbit', bgColourFaint: 'rgba(27, 69, 143, 0.3)', bgColourSolid: '#1B458F', textColour: '#C4122E', iconColour: '#C4122E' },
    { id: 'team_8', name: 'Everton', logo: 'home', bgColourFaint: 'rgba(0, 51, 153, 0.3)', bgColourSolid: '#003399', textColour: '#FFFFFF', iconColour: '#FFFFFF' },
    { id: 'team_9', name: 'Fulham', logo: 'shieldHalf', bgColourFaint: 'rgba(0, 0, 0, 0.3)', bgColourSolid: '#000000', textColour: '#FFFFFF', iconColour: '#FFFFFF' },
    { id: 'team_10', name: 'Ipswich Town', logo: 'mapPin' },
    { id: 'team_11', name: 'Leicester', logo: 'origami' },
    { id: 'team_12', name: 'Liverpool', logo: 'origami', bgColourFaint: 'rgba(200, 16, 46, 0.3)', bgColourSolid: '#C8102E', textColour: '#000000', iconColour: '#FFFFFF' },
    { id: 'team_13', name: 'Man City', logo: 'sailboat', bgColourFaint: 'rgba(108, 171, 221, 0.3)', bgColourSolid: '#6CABDD', textColour: '#00285E', iconColour: '#00285E' },
    { id: 'team_14', name: 'Man Utd', logo: 'hamburger', bgColourFaint: 'rgba(218, 41, 28, 0.3)', bgColourSolid: '#DA291C', textColour: '#FBE122', iconColour: '#FBE122' },
    { id: 'team_15', name: 'Newcastle', logo: 'castle', bgColourFaint: 'rgba(36, 31, 32, 0.3)', bgColourSolid: '#241F20', textColour: '#FFFFFF', iconColour: '#FFFFFF' },
    { id: 'team_16', name: "Nott'm Forest", logo: 'treeDeciduous', bgColourFaint: 'rgba(221, 0, 0, 0.3)', bgColourSolid: '#DD0000', textColour: '#FFFFFF', iconColour: '#FFFFFF' },
    { id: 'team_17', name: 'Southampton', logo: 'theater' },
    { id: 'team_18', name: 'Tottenham', logo: 'ship', bgColourFaint: 'rgba(19, 34, 87, 0.3)', bgColourSolid: '#132257', textColour: '#FFFFFF', iconColour: '#FFFFFF' },
    { id: 'team_19', name: 'West Ham', logo: 'utensilsCrossed', bgColourFaint: 'rgba(122, 38, 58, 0.3)', bgColourSolid: '#7A263A', textColour: '#132257', iconColour: '#FBB117' },
    { id: 'team_20', name: 'Wolves', logo: 'gitlab', bgColourFaint: 'rgba(253, 185, 19, 0.3)', bgColourSolid: '#FDB913', textColour: '#231F20', iconColour: '#231F20' },
    { id: 'team_22', name: 'Burnley', logo: 'shield' },
    { id: 'team_24', name: 'Leeds', logo: 'flower' },
    { id: 'team_25', name: 'Sunderland', logo: 'database' },
];

export { allTeams as teams };

const realMatchData2425: { home: string; away: string; homeScore: number; awayScore: number }[] = [
    { home: 'Man Utd', away: 'Fulham', homeScore: 1, awayScore: 0 },
    { home: 'West Ham', away: 'Aston Villa', homeScore: 1, awayScore: 2 },
    { home: 'Notts Forest', away: 'Bournemouth', homeScore: 1, awayScore: 1 },
    { home: 'Newcastle', away: 'Southampton', homeScore: 1, awayScore: 0 },
    { home: 'Everton', away: 'Brighton', homeScore: 0, awayScore: 3 },
    { home: 'Arsenal', away: 'Wolves', homeScore: 2, awayScore: 0 },
    { home: 'Ipswich Town', away: 'Liverpool', homeScore: 0, awayScore: 2 },
    { home: 'Chelsea', away: 'Man City', homeScore: 0, awayScore: 2 },
    { home: 'Brentford', away: 'Crystal Palace', homeScore: 2, awayScore: 1 },
    { home: 'Leicester', away: 'Tottenham', homeScore: 1, awayScore: 1 },
    { home: 'Aston Villa', away: 'Arsenal', homeScore: 0, awayScore: 2 },
    { home: 'Tottenham', away: 'Everton', homeScore: 4, awayScore: 0 },
    { home: 'Southampton', away: 'Notts Forest', homeScore: 0, awayScore: 1 },
    { home: 'Man City', away: 'Ipswich Town', homeScore: 4, awayScore: 1 },
    { home: 'Fulham', away: 'Leicester', homeScore: 2, awayScore: 1 },
    { home: 'Crystal Palace', away: 'West Ham', homeScore: 0, awayScore: 2 },
    { home: 'Brighton', away: 'Man Utd', homeScore: 2, awayScore: 1 },
    { home: 'Liverpool', away: 'Brentford', homeScore: 2, awayScore: 0 },
    { home: 'Wolves', away: 'Chelsea', homeScore: 2, awayScore: 6 },
    { home: 'Bournemouth', away: 'Newcastle', homeScore: 1, awayScore: 1 },
    { home: 'West Ham', away: 'Man City', homeScore: 1, awayScore: 3 },
    { home: 'Notts Forest', away: 'Wolves', homeScore: 1, awayScore: 1 },
    { home: 'Leicester', away: 'Aston Villa', homeScore: 1, awayScore: 2 },
    { home: 'Ipswich Town', away: 'Fulham', homeScore: 1, awayScore: 1 },
    { home: 'Everton', away: 'Bournemouth', homeScore: 2, awayScore: 3 },
    { home: 'Brentford', away: 'Southampton', homeScore: 3, awayScore: 1 },
    { home: 'Arsenal', away: 'Brighton', homeScore: 1, awayScore: 1 },
    { home: 'Man Utd', away: 'Liverpool', homeScore: 0, awayScore: 3 },
    { home: 'Newcastle', away: 'Tottenham', homeScore: 2, awayScore: 1 },
    { home: 'Chelsea', away: 'Crystal Palace', homeScore: 1, awayScore: 1 },
    { home: 'Bournemouth', away: 'Chelsea', homeScore: 0, awayScore: 1 },
    { home: 'Aston Villa', away: 'Everton', homeScore: 3, awayScore: 2 },
    { home: 'Man City', away: 'Brentford', homeScore: 2, awayScore: 1 },
    { home: 'Liverpool', away: 'Notts Forest', homeScore: 0, awayScore: 1 },
    { home: 'Fulham', away: 'West Ham', homeScore: 1, awayScore: 1 },
    { home: 'Crystal Palace', away: 'Leicester', homeScore: 2, awayScore: 2 },
    { home: 'Brighton', away: 'Ipswich Town', homeScore: 0, awayScore: 0 },
    { home: 'Southampton', away: 'Man Utd', homeScore: 0, awayScore: 3 },
    { home: 'Wolves', away: 'Newcastle', homeScore: 1, awayScore: 2 },
    { home: 'Tottenham', away: 'Arsenal', homeScore: 0, awayScore: 1 },
    { home: 'Crystal Palace', away: 'Man Utd', homeScore: 0, awayScore: 0 },
    { home: 'Tottenham', away: 'Brentford', homeScore: 3, awayScore: 1 },
    { home: 'Southampton', away: 'Ipswich Town', homeScore: 1, awayScore: 1 },
    { home: 'Liverpool', away: 'Bournemouth', homeScore: 3, awayScore: 0 },
    { home: 'Leicester', away: 'Everton', homeScore: 1, awayScore: 1 },
    { home: 'Fulham', away: 'Newcastle', homeScore: 3, awayScore: 1 },
    { home: 'Aston Villa', away: 'Wolves', homeScore: 3, awayScore: 1 },
    { home: 'West Ham', away: 'Chelsea', homeScore: 0, awayScore: 3 },
    { home: 'Man City', away: 'Arsenal', homeScore: 2, awayScore: 2 },
    { home: 'Brighton', away: 'Notts Forest', homeScore: 2, awayScore: 2 },
    { home: 'Wolves', away: 'Liverpool', homeScore: 1, awayScore: 2 },
    { home: 'Notts Forest', away: 'Fulham', homeScore: 0, awayScore: 1 },
    { home: 'Everton', away: 'Crystal Palace', homeScore: 2, awayScore: 1 },
    { home: 'Chelsea', away: 'Brighton', homeScore: 4, awayScore: 2 },
    { home: 'Brentford', away: 'West Ham', homeScore: 1, awayScore: 1 },
    { home: 'Arsenal', away: 'Leicester', homeScore: 4, awayScore: 2 },
    { home: 'Newcastle', away: 'Man City', homeScore: 1, awayScore: 1 },
    { home: 'Man Utd', away: 'Tottenham', homeScore: 0, awayScore: 3 },
    { home: 'Ipswich Town', away: 'Aston Villa', homeScore: 2, awayScore: 2 },
    { home: 'Bournemouth', away: 'Southampton', homeScore: 3, awayScore: 1 },
    { home: 'Everton', away: 'Newcastle', homeScore: 0, awayScore: 0 },
    { home: 'West Ham', away: 'Ipswich Town', homeScore: 4, awayScore: 1 },
    { home: 'Man City', away: 'Fulham', homeScore: 3, awayScore: 2 },
    { home: 'Leicester', away: 'Bournemouth', homeScore: 1, awayScore: 0 },
    { home: 'Brentford', away: 'Wolves', homeScore: 5, awayScore: 3 },
    { home: 'Arsenal', away: 'Southampton', homeScore: 3, awayScore: 1 },
    { home: 'Crystal Palace', away: 'Liverpool', homeScore: 0, awayScore: 1 },
    { home: 'Brighton', away: 'Tottenham', homeScore: 3, awayScore: 2 },
    { home: 'Chelsea', away: 'Notts Forest', homeScore: 1, awayScore: 1 },
    { home: 'Aston Villa', away: 'Man Utd', homeScore: 0, awayScore: 0 },
    { home: 'Bournemouth', away: 'Arsenal', homeScore: 2, awayScore: 0 },
    { home: 'Ipswich Town', away: 'Everton', homeScore: 0, awayScore: 2 },
    { home: 'Southampton', away: 'Leicester', homeScore: 2, awayScore: 3 },
    { home: 'Newcastle', away: 'Brighton', homeScore: 0, awayScore: 1 },
    { home: 'Man Utd', away: 'Brentford', homeScore: 2, awayScore: 1 },
    { home: 'Fulham', away: 'Aston Villa', homeScore: 1, awayScore: 3 },
    { home: 'Tottenham', away: 'West Ham', homeScore: 4, awayScore: 1 },
    { home: 'Liverpool', away: 'Chelsea', homeScore: 2, awayScore: 1 },
    { home: 'Wolves', away: 'Man City', homeScore: 1, awayScore: 2 },
    { home: 'Notts Forest', away: 'Crystal Palace', homeScore: 1, awayScore: 0 },
    { home: 'Leicester', away: 'Notts Forest', homeScore: 1, awayScore: 3 },
    { home: 'Everton', away: 'Fulham', homeScore: 1, awayScore: 1 },
    { home: 'Man City', away: 'Southampton', homeScore: 1, awayScore: 0 },
    { home: 'Brighton', away: 'Wolves', homeScore: 2, awayScore: 2 },
    { home: 'Brentford', away: 'Ipswich Town', homeScore: 4, awayScore: 3 },
    { home: 'Aston Villa', away: 'Bournemouth', homeScore: 1, awayScore: 1 },
    { home: 'Arsenal', away: 'Liverpool', homeScore: 2, awayScore: 2 },
    { home: 'West Ham', away: 'Man Utd', homeScore: 2, awayScore: 1 },
    { home: 'Crystal Palace', away: 'Tottenham', homeScore: 1, awayScore: 0 },
    { home: 'Chelsea', away: 'Newcastle', homeScore: 2, awayScore: 1 },
    { home: 'Wolves', away: 'Crystal Palace', homeScore: 2, awayScore: 2 },
    { home: 'Southampton', away: 'Everton', homeScore: 1, awayScore: 0 },
    { home: 'Notts Forest', away: 'West Ham', homeScore: 3, awayScore: 0 },
    { home: 'Liverpool', away: 'Brighton', homeScore: 2, awayScore: 1 },
    { home: 'Ipswich Town', away: 'Leicester', homeScore: 1, awayScore: 1 },
    { home: 'Bournemouth', away: 'Man City', homeScore: 2, awayScore: 1 },
    { home: 'Newcastle', away: 'Arsenal', homeScore: 1, awayScore: 0 },
    { home: 'Man Utd', away: 'Chelsea', homeScore: 1, awayScore: 1 },
    { home: 'Tottenham', away: 'Aston Villa', homeScore: 4, awayScore: 1 },
    { home: 'Fulham', away: 'Brentford', homeScore: 2, awayScore: 1 },
    { home: 'Liverpool', away: 'Aston Villa', homeScore: 2, awayScore: 0 },
    { home: 'Brighton', away: 'Man City', homeScore: 2, awayScore: 1 },
    { home: 'Wolves', away: 'Southampton', homeScore: 2, awayScore: 0 },
    { home: 'West Ham', away: 'Everton', homeScore: 0, awayScore: 0 },
    { home: 'Crystal Palace', away: 'Fulham', homeScore: 0, awayScore: 2 },
    { home: 'Brentford', away: 'Bournemouth', homeScore: 3, awayScore: 2 },
    { home: 'Chelsea', away: 'Arsenal', homeScore: 1, awayScore: 1 },
    { home: 'Tottenham', away: 'Ipswich Town', homeScore: 1, awayScore: 2 },
    { home: 'Notts Forest', away: 'Newcastle', homeScore: 1, awayScore: 3 },
    { home: 'Man Utd', away: 'Leicester', homeScore: 3, awayScore: 0 },
    { home: 'Man City', away: 'Tottenham', homeScore: 0, awayScore: 4 },
    { home: 'Fulham', away: 'Wolves', homeScore: 1, awayScore: 4 },
    { home: 'Everton', away: 'Brentford', homeScore: 0, awayScore: 0 },
    { home: 'Aston Villa', away: 'Crystal Palace', homeScore: 2, awayScore: 2 },
    { home: 'Arsenal', away: 'Notts Forest', homeScore: 3, awayScore: 0 },
    { home: 'Bournemouth', away: 'Brighton', homeScore: 1, awayScore: 2 },
    { home: 'Leicester', away: 'Chelsea', homeScore: 1, awayScore: 2 },
    { home: 'Ipswich Town', away: 'Man Utd', homeScore: 1, awayScore: 1 },
    { home: 'Southampton', away: 'Liverpool', homeScore: 2, awayScore: 3 },
    { home: 'Newcastle', away: 'West Ham', homeScore: 0, awayScore: 2 },
    { home: 'Brighton', away: 'Southampton', homeScore: 1, awayScore: 1 },
    { home: 'West Ham', away: 'Arsenal', homeScore: 2, awayScore: 5 },
    { home: 'Wolves', away: 'Bournemouth', homeScore: 2, awayScore: 4 },
    { home: 'Notts Forest', away: 'Ipswich Town', homeScore: 1, awayScore: 0 },
    { home: 'Crystal Palace', away: 'Newcastle', homeScore: 1, awayScore: 1 },
    { home: 'Brentford', away: 'Leicester', homeScore: 4, awayScore: 1 },
    { home: 'Liverpool', away: 'Man City', homeScore: 2, awayScore: 0 },
    { home: 'Tottenham', away: 'Fulham', homeScore: 1, awayScore: 1 },
    { home: 'Man Utd', away: 'Everton', homeScore: 4, awayScore: 0 },
    { home: 'Chelsea', away: 'Aston Villa', homeScore: 3, awayScore: 0 },
    { home: 'Leicester', away: 'West Ham', homeScore: 3, awayScore: 1 },
    { home: 'Ipswich Town', away: 'Crystal Palace', homeScore: 0, awayScore: 1 },
    { home: 'Aston Villa', away: 'Brentford', homeScore: 3, awayScore: 1 },
    { home: 'Arsenal', away: 'Man Utd', homeScore: 2, awayScore: 0 },
    { home: 'Southampton', away: 'Chelsea', homeScore: 1, awayScore: 5 },
    { home: 'Newcastle', away: 'Liverpool', homeScore: 3, awayScore: 3 },
    { home: 'Man City', away: 'Notts Forest', homeScore: 3, awayScore: 0 },
    { home: 'Everton', away: 'Wolves', homeScore: 4, awayScore: 0 },
    { home: 'Bournemouth', away: 'Tottenham', homeScore: 1, awayScore: 0 },
    { home: 'Fulham', away: 'Brighton', homeScore: 3, awayScore: 1 },
    { home: 'Man Utd', away: 'Notts Forest', homeScore: 2, awayScore: 3 },
    { home: 'Crystal Palace', away: 'Man City', homeScore: 2, awayScore: 2 },
    { home: 'Brentford', away: 'Newcastle', homeScore: 4, awayScore: 2 },
    { home: 'Aston Villa', away: 'Southampton', homeScore: 1, awayScore: 0 },
    { home: 'Tottenham', away: 'Chelsea', homeScore: 3, awayScore: 4 },
    { home: 'Leicester', away: 'Brighton', homeScore: 2, awayScore: 2 },
    { home: 'Ipswich Town', away: 'Bournemouth', homeScore: 1, awayScore: 2 },
    { home: 'Fulham', away: 'Arsenal', homeScore: 1, awayScore: 1 },
    { home: 'West Ham', away: 'Wolves', homeScore: 2, awayScore: 1 },
    { home: 'Notts Forest', away: 'Aston Villa', homeScore: 2, awayScore: 1 },
    { home: 'Wolves', away: 'Ipswich Town', homeScore: 1, awayScore: 2 },
    { home: 'Newcastle', away: 'Leicester', homeScore: 4, awayScore: 0 },
    { home: 'Liverpool', away: 'Fulham', homeScore: 2, awayScore: 2 },
    { home: 'Arsenal', away: 'Everton', homeScore: 0, awayScore: 0 },
    { home: 'Southampton', away: 'Tottenham', homeScore: 0, awayScore: 5 },
    { home: 'Chelsea', away: 'Brentford', homeScore: 2, awayScore: 1 },
    { home: 'Man City', away: 'Man Utd', homeScore: 1, awayScore: 2 },
    { home: 'Brighton', away: 'Crystal Palace', homeScore: 1, awayScore: 3 },
    { home: 'Bournemouth', away: 'West Ham', homeScore: 1, awayScore: 1 },
    { home: 'Crystal Palace', away: 'Arsenal', homeScore: 1, awayScore: 5 },
    { home: 'West Ham', away: 'Brighton', homeScore: 1, awayScore: 1 },
    { home: 'Ipswich Town', away: 'Newcastle', homeScore: 0, awayScore: 4 },
    { home: 'Brentford', away: 'Notts Forest', homeScore: 0, awayScore: 2 },
    { home: 'Aston Villa', away: 'Man City', homeScore: 2, awayScore: 1 },
    { home: 'Tottenham', away: 'Liverpool', homeScore: 3, awayScore: 6 },
    { home: 'Man Utd', away: 'Bournemouth', homeScore: 0, awayScore: 3 },
    { home: 'Leicester', away: 'Wolves', homeScore: 0, awayScore: 3 },
    { home: 'Fulham', away: 'Southampton', homeScore: 0, awayScore: 0 },
    { home: 'Everton', away: 'Chelsea', homeScore: 0, awayScore: 0 },
    { home: 'Liverpool', away: 'Leicester', homeScore: 3, awayScore: 1 },
    { home: 'Wolves', away: 'Man Utd', homeScore: 2, awayScore: 0 },
    { home: 'Southampton', away: 'West Ham', homeScore: 0, awayScore: 1 },
    { home: 'Notts Forest', away: 'Tottenham', homeScore: 1, awayScore: 0 },
    { home: 'Newcastle', away: 'Aston Villa', homeScore: 3, awayScore: 0 },
    { home: 'Chelsea', away: 'Fulham', homeScore: 1, awayScore: 2 },
    { home: 'Bournemouth', away: 'Crystal Palace', homeScore: 0, awayScore: 0 },
    { home: 'Man City', away: 'Everton', homeScore: 1, awayScore: 1 },
    { home: 'Arsenal', away: 'Ipswich Town', homeScore: 1, awayScore: 0 },
    { home: 'Brighton', away: 'Brentford', homeScore: 0, awayScore: 0 },
    { home: 'West Ham', away: 'Liverpool', homeScore: 0, awayScore: 5 },
    { home: 'Tottenham', away: 'Wolves', homeScore: 2, awayScore: 2 },
    { home: 'Fulham', away: 'Bournemouth', homeScore: 2, awayScore: 2 },
    { home: 'Everton', away: 'Notts Forest', homeScore: 0, awayScore: 2 },
    { home: 'Crystal Palace', away: 'Southampton', homeScore: 2, awayScore: 1 },
    { home: 'Leicester', away: 'Man City', homeScore: 0, awayScore: 2 },
    { home: 'Man Utd', away: 'Newcastle', homeScore: 0, awayScore: 2 },
    { home: 'Ipswich Town', away: 'Chelsea', homeScore: 2, awayScore: 0 },
    { home: 'Aston Villa', away: 'Brighton', homeScore: 2, awayScore: 2 },
    { home: 'Brentford', away: 'Arsenal', homeScore: 1, awayScore: 3 },
    { home: 'Brighton', away: 'Arsenal', homeScore: 1, awayScore: 1 },
    { home: 'Southampton', away: 'Brentford', homeScore: 0, awayScore: 5 },
    { home: 'Man City', away: 'West Ham', homeScore: 4, awayScore: 1 },
    { home: 'Crystal Palace', away: 'Chelsea', homeScore: 1, awayScore: 1 },
    { home: 'Aston Villa', away: 'Leicester', homeScore: 2, awayScore: 1 },
    { home: 'Bournemouth', away: 'Everton', homeScore: 1, awayScore: 0 },
    { home: 'Tottenham', away: 'Newcastle', homeScore: 1, awayScore: 2 },
    { home: 'Liverpool', away: 'Man Utd', homeScore: 2, awayScore: 2 },
    { home: 'Fulham', away: 'Ipswich Town', homeScore: 2, awayScore: 2 },
    { home: 'Wolves', away: 'Notts Forest', homeScore: 0, awayScore: 3 },
    { home: 'Notts Forest', away: 'Liverpool', homeScore: 1, awayScore: 1 },
    { home: 'West Ham', away: 'Fulham', homeScore: 3, awayScore: 2 },
    { home: 'Chelsea', away: 'Bournemouth', homeScore: 2, awayScore: 2 },
    { home: 'Brentford', away: 'Man City', homeScore: 2, awayScore: 2 },
    { home: 'Arsenal', away: 'Tottenham', homeScore: 2, awayScore: 1 },
    { home: 'Newcastle', away: 'Wolves', homeScore: 3, awayScore: 0 },
    { home: 'Leicester', away: 'Crystal Palace', homeScore: 0, awayScore: 2 },
    { home: 'Everton', away: 'Aston Villa', homeScore: 0, awayScore: 1 },
    { home: 'Man Utd', away: 'Southampton', homeScore: 3, awayScore: 1 },
    { home: 'Ipswich Town', away: 'Brighton', homeScore: 0, awayScore: 2 },
    { home: 'Arsenal', away: 'Aston Villa', homeScore: 2, awayScore: 2 },
    { home: 'West Ham', away: 'Crystal Palace', homeScore: 0, awayScore: 2 },
    { home: 'Leicester', away: 'Fulham', homeScore: 0, awayScore: 2 },
    { home: 'Brentford', away: 'Liverpool', homeScore: 0, awayScore: 2 },
    { home: 'Newcastle', away: 'Bournemouth', homeScore: 1, awayScore: 4 },
    { home: 'Ipswich Town', away: 'Man City', homeScore: 0, awayScore: 6 },
    { home: 'Notts Forest', away: 'Southampton', homeScore: 3, awayScore: 2 },
    { home: 'Man Utd', away: 'Brighton', homeScore: 1, awayScore: 3 },
    { home: 'Everton', away: 'Tottenham', homeScore: 3, awayScore: 2 },
    { home: 'Chelsea', away: 'Wolves', homeScore: 3, awayScore: 1 },
    { home: 'Man City', away: 'Chelsea', homeScore: 3, awayScore: 1 },
    { home: 'Wolves', away: 'Arsenal', homeScore: 0, awayScore: 1 },
    { home: 'Southampton', away: 'Newcastle', homeScore: 1, awayScore: 3 },
    { home: 'Liverpool', away: 'Ipswich Town', homeScore: 4, awayScore: 1 },
    { home: 'Brighton', away: 'Everton', homeScore: 0, awayScore: 1 },
    { home: 'Bournemouth', away: 'Notts Forest', homeScore: 5, awayScore: 0 },
    { home: 'Fulham', away: 'Man Utd', homeScore: 0, awayScore: 1 },
    { home: 'Aston Villa', away: 'West Ham', homeScore: 1, awayScore: 1 },
    { home: 'Tottenham', away: 'Leicester', homeScore: 1, awayScore: 2 },
    { home: 'Crystal Palace', away: 'Brentford', homeScore: 1, awayScore: 2 },
    { home: 'Wolves', away: 'Aston Villa', homeScore: 2, awayScore: 0 },
    { home: 'Newcastle', away: 'Fulham', homeScore: 1, awayScore: 2 },
    { home: 'Ipswich Town', away: 'Southampton', homeScore: 1, awayScore: 2 },
    { home: 'Everton', away: 'Leicester', homeScore: 4, awayScore: 0 },
    { home: 'Bournemouth', away: 'Liverpool', homeScore: 0, awayScore: 2 },
    { home: 'Notts Forest', away: 'Brighton', homeScore: 7, awayScore: 0 },
    { home: 'Arsenal', away: 'Man City', homeScore: 5, awayScore: 1 },
    { home: 'Man Utd', away: 'Crystal Palace', homeScore: 0, awayScore: 2 },
    { home: 'Brentford', away: 'Tottenham', homeScore: 0, awayScore: 2 },
    { home: 'Chelsea', away: 'West Ham', homeScore: 2, awayScore: 1 },
    { home: 'Everton', away: 'Liverpool', homeScore: 2, awayScore: 2 },
    { home: 'Brighton', away: 'Chelsea', homeScore: 3, awayScore: 0 },
    { home: 'Crystal Palace', away: 'Everton', homeScore: 1, awayScore: 2 },
    { home: 'West Ham', away: 'Brentford', homeScore: 0, awayScore: 1 },
    { home: 'Southampton', away: 'Bournemouth', homeScore: 1, awayScore: 3 },
    { home: 'Man City', away: 'Newcastle', homeScore: 4, awayScore: 0 },
    { home: 'Fulham', away: 'Notts Forest', homeScore: 2, awayScore: 1 },
    { home: 'Aston Villa', away: 'Ipswich Town', homeScore: 1, awayScore: 1 },
    { home: 'Leicester', away: 'Arsenal', homeScore: 0, awayScore: 2 },
    { home: 'Tottenham', away: 'Man Utd', homeScore: 1, awayScore: 0 },
    { home: 'Liverpool', away: 'Wolves', homeScore: 2, awayScore: 1 },
    { home: 'Aston Villa', away: 'Liverpool', homeScore: 2, awayScore: 2 },
    { home: 'Leicester', away: 'Brentford', homeScore: 0, awayScore: 4 },
    { home: 'Chelsea', away: 'Aston Villa', homeScore: 4, awayScore: 0 },
    { home: 'Southampton', away: 'Brighton', homeScore: 0, awayScore: 4 },
    { home: 'Ipswich Town', away: 'Tottenham', homeScore: 1, awayScore: 4 },
    { home: 'Fulham', away: 'Crystal Palace', homeScore: 0, awayScore: 2 },
    { home: 'Arsenal', away: 'West Ham', homeScore: 0, awayScore: 1 },
    { home: 'Bournemouth', away: 'Wolves', homeScore: 0, awayScore: 1 },
    { home: 'Everton', away: 'Man Utd', homeScore: 2, awayScore: 2 },
    { home: 'Man City', away: 'Liverpool', homeScore: 0, awayScore: 2 },
    { home: 'Newcastle', away: 'Notts Forest', homeScore: 4, awayScore: 3 },
    { home: 'Southampton', away: 'Chelsea', homeScore: 0, awayScore: 4 },
    { home: 'Wolves', away: 'Fulham', homeScore: 1, awayScore: 2 },
    { home: 'Crystal Palace', away: 'Aston Villa', homeScore: 4, awayScore: 1 },
    { home: 'Brighton', away: 'Bournemouth', homeScore: 2, awayScore: 1 },
    { home: 'Liverpool', away: 'Newcastle', homeScore: 2, awayScore: 0 },
    { home: 'Tottenham', away: 'Man City', homeScore: 0, awayScore: 1 },
    { home: 'Notts Forest', away: 'Arsenal', homeScore: 0, awayScore: 0 },
    { home: 'Man Utd', away: 'Ipswich Town', homeScore: 3, awayScore: 2 },
    { home: 'Brentford', away: 'Everton', homeScore: 1, awayScore: 1 },
    { home: 'West Ham', away: 'Leicester', homeScore: 2, awayScore: 0 },
    { home: 'Everton', away: 'Wolves', homeScore: 1, awayScore: 1 },
    { home: 'Brentford', away: 'Aston Villa', homeScore: 0, awayScore: 1 },
    { home: 'Southampton', away: 'Liverpool', homeScore: 1, awayScore: 3 },
    { home: 'Ipswich Town', away: 'Crystal Palace', homeScore: 1, awayScore: 0 },
    { home: 'Fulham', away: 'Brighton', homeScore: 2, awayScore: 1 },
    { home: 'Man City', away: 'Notts Forest', homeScore: 1, awayScore: 0 },
    { home: 'Arsenal', away: 'Man Utd', homeScore: 1, awayScore: 1 },
    { home: 'Bournemouth', away: 'Tottenham', homeScore: 2, awayScore: 2 },
    { home: 'Leicester', away: 'Chelsea', homeScore: 0, awayScore: 1 },
    { home: 'Newcastle', away: 'West Ham', homeScore: 0, awayScore: 1 },
    { home: 'West Ham', away: 'Bournemouth', homeScore: 2, awayScore: 2 },
    { home: 'Tottenham', away: 'Fulham', homeScore: 3, awayScore: 2 },
    { home: 'Southampton', away: 'Ipswich Town', homeScore: 1, awayScore: 2 },
    { home: 'Man Utd', away: 'Crystal Palace', homeScore: 0, awayScore: 0 },
    { home: 'Man City', away: 'Aston Villa', homeScore: 2, awayScore: 1 },
    { home: 'Liverpool', away: 'Notts Forest', homeScore: 1, awayScore: 0 },
    { home: 'Everton', away: 'Leicester', homeScore: 1, awayScore: 1 },
    { home: 'Chelsea', away: 'Brentford', homeScore: 0, awayScore: 0 },
    { home: 'Brighton', away: 'Newcastle', homeScore: 1, awayScore: 2 },
    { home: 'Arsenal', away: 'Everton', homeScore: 4, awayScore: 1 },
    { home: 'Notts Forest', away: 'Man Utd', homeScore: 1, awayScore: 1 },
    { home: 'Wolves', away: 'West Ham', homeScore: 1, awayScore: 0 },
    { home: 'Fulham', away: 'Arsenal', homeScore: 2, awayScore: 1 },
    { home: 'Everton', away: 'Liverpool', homeScore: 1, awayScore: 1 },
    { home: 'Crystal Palace', away: 'Southampton', homeScore: 1, awayScore: 1 },
    { home: 'Chelsea', away: 'Tottenham', homeScore: 1, awayScore: 0 },
    { home: 'Brentford', away: 'Newcastle', homeScore: 2, awayScore: 1 },
    { home: 'Aston Villa', away: 'Brighton', homeScore: 3, awayScore: 0 },
    { home: 'Ipswich Town', away: 'Bournemouth', homeScore: 1, awayScore: 2 },
    { home: 'Leicester', away: 'Man City', homeScore: 0, awayScore: 2 },
    { home: 'Aston Villa', away: 'Notts Forest', homeScore: 2, awayScore: 1 },
    { home: 'West Ham', away: 'Bournemouth', homeScore: 2, awayScore: 2 },
    { home: 'Ipswich Town', away: 'Wolves', homeScore: 1, awayScore: 2 },
    { home: 'Crystal Palace', away: 'Brighton', homeScore: 2, awayScore: 1 },
    { home: 'Everton', away: 'Arsenal', homeScore: 1, awayScore: 1 },
    { home: 'Man Utd', away: 'Man City', homeScore: 0, awayScore: 0 },
    { home: 'Tottenham', away: 'Southampton', homeScore: 3, awayScore: 1 },
    { home: 'Fulham', away: 'Liverpool', homeScore: 3, awayScore: 2 },
    { home: 'Brentford', away: 'Chelsea', homeScore: 0, awayScore: 0 },
    { home: 'Leicester', away: 'Newcastle', homeScore: 0, awayScore: 3 },
    { home: 'Brentford', away: 'Arsenal', homeScore: 1, awayScore: 1 },
    { home: 'Southampton', away: 'Aston Villa', homeScore: 0, awayScore: 3 },
    { home: 'Notts Forest', away: 'Everton', homeScore: 0, awayScore: 1 },
    { home: 'Brighton', away: 'Leicester', homeScore: 2, awayScore: 2 },
    { home: 'Man City', away: 'Crystal Palace', homeScore: 5, awayScore: 2 },
    { home: 'Newcastle', away: 'Man Utd', homeScore: 4, awayScore: 1 },
    { home: 'Wolves', away: 'Tottenham', homeScore: 4, awayScore: 2 },
    { home: 'Liverpool', away: 'West Ham', homeScore: 2, awayScore: 1 },
    { home: 'Chelsea', away: 'Ipswich Town', homeScore: 2, awayScore: 2 },
    { home: 'Bournemouth', away: 'Fulham', homeScore: 1, awayScore: 0 },
    { home: 'Man City', away: 'Aston Villa', homeScore: 2, awayScore: 2 },
    { home: 'Arsenal', away: 'Crystal Palace', homeScore: 2, awayScore: 2 },
    { home: 'West Ham', away: 'Southampton', homeScore: 1, awayScore: 1 },
    { home: 'Everton', away: 'Man City', homeScore: 0, awayScore: 2 },
    { home: 'Crystal Palace', away: 'Bournemouth', homeScore: 0, awayScore: 0 },
    { home: 'Brentford', away: 'Brighton', homeScore: 4, awayScore: 2 },
    { home: 'Leicester', away: 'Liverpool', homeScore: 0, awayScore: 1 },
    { home: 'Man Utd', away: 'Wolves', homeScore: 0, awayScore: 1 },
    { home: 'Ipswich Town', away: 'Arsenal', homeScore: 0, awayScore: 4 },
    { home: 'Fulham', away: 'Chelsea', homeScore: 1, awayScore: 2 },
    { home: 'Tottenham', away: 'Notts Forest', homeScore: 1, awayScore: 2 },
    { home: 'Newcastle', away: 'Aston Villa', homeScore: 5, awayScore: 0 },
    { home: 'Wolves', away: 'Leicester', homeScore: 3, awayScore: 0 },
    { home: 'Southampton', away: 'Fulham', homeScore: 1, awayScore: 0 },
    { home: 'Newcastle', away: 'Ipswich Town', homeScore: 3, awayScore: 0 },
    { home: 'Brighton', away: 'West Ham', homeScore: 3, awayScore: 2 },
    { home: 'Chelsea', away: 'Everton', homeScore: 1, awayScore: 0 },
    { home: 'Liverpool', away: 'Tottenham', homeScore: 5, awayScore: 1 },
    { home: 'Bournemouth', away: 'Man Utd', homeScore: 1, awayScore: 1 },
    { home: 'Notts Forest', away: 'Brentford', homeScore: 0, awayScore: 2 },
    { home: 'Man City', away: 'Aston Villa', homeScore: 1, awayScore: 1 },
    { home: 'Arsenal', away: 'Crystal Palace', homeScore: 2, awayScore: 2 },
    { home: 'Arsenal', away: 'Bournemouth', homeScore: 1, awayScore: 2 },
    { home: 'Leicester', away: 'Southampton', homeScore: 2, awayScore: 0 },
    { home: 'Everton', away: 'Ipswich Town', homeScore: 2, awayScore: 2 },
    { home: 'Aston Villa', away: 'Fulham', homeScore: 1, awayScore: 0 },
    { home: 'Man City', away: 'Wolves', homeScore: 1, awayScore: 0 },
    { home: 'Chelsea', away: 'Liverpool', homeScore: 3, awayScore: 1 },
    { home: 'West Ham', away: 'Tottenham', homeScore: 1, awayScore: 1 },
    { home: 'Brighton', away: 'Newcastle', homeScore: 1, awayScore: 1 },
    { home: 'Brentford', away: 'Man Utd', homeScore: 4, awayScore: 3 },
    { home: 'Crystal Palace', away: 'Notts Forest', homeScore: 1, awayScore: 1 },
    { home: 'Bournemouth', away: 'Aston Villa', homeScore: 0, awayScore: 1 },
    { home: 'Wolves', away: 'Brighton', homeScore: 0, awayScore: 2 },
    { home: 'Southampton', away: 'Man City', homeScore: 0, awayScore: 0 },
    { home: 'Ipswich Town', away: 'Brentford', homeScore: 0, awayScore: 1 },
    { home: 'Fulham', away: 'Everton', homeScore: 1, awayScore: 3 },
    { home: 'Liverpool', away: 'Arsenal', homeScore: 2, awayScore: 2 },
    { home: 'Tottenham', away: 'Crystal Palace', homeScore: 0, awayScore: 2 },
    { home: 'Notts Forest', away: 'Leicester', homeScore: 2, awayScore: 2 },
    { home: 'Man Utd', away: 'West Ham', homeScore: 0, awayScore: 2 },
    { home: 'Newcastle', away: 'Chelsea', homeScore: 2, awayScore: 0 },
    { home: 'Chelsea', away: 'Man Utd', homeScore: 1, awayScore: 0 },
    { home: 'Aston Villa', away: 'Tottenham', homeScore: 2, awayScore: 0 },
    { home: 'Arsenal', away: 'Newcastle', homeScore: 1, awayScore: 0 },
    { home: 'Leicester', away: 'Ipswich Town', homeScore: 2, awayScore: 0 },
    { home: 'Brentford', away: 'Fulham', homeScore: 2, awayScore: 3 },
    { home: 'West Ham', away: 'Notts Forest', homeScore: 1, awayScore: 2 },
    { home: 'Everton', away: 'Southampton', homeScore: 2, awayScore: 0 },
    { home: 'Brighton', away: 'Liverpool', homeScore: 3, awayScore: 2 },
    { home: 'Man City', away: 'Bournemouth', homeScore: 3, awayScore: 1 },
    { home: 'Crystal Palace', away: 'Wolves', homeScore: 4, awayScore: 2 },
    { home: 'Wolves', away: 'Brentford', homeScore: 1, awayScore: 1 },
    { home: 'Tottenham', away: 'Brighton', homeScore: 1, awayScore: 4 },
    { home: 'Southampton', away: 'Arsenal', homeScore: 1, awayScore: 2 },
    { home: 'Notts Forest', away: 'Man City', homeScore: 0, awayScore: 1 },
    { home: 'Newcastle', away: 'Everton', homeScore: 0, awayScore: 1 },
    { home: 'Man Utd', away: 'Aston Villa', homeScore: 2, awayScore: 0 },
    { home: 'Liverpool', away: 'Crystal Palace', homeScore: 1, awayScore: 1 },
    { home: 'Ipswich Town', away: 'West Ham', homeScore: 1, awayScore: 3 },
    { home: 'Fulham', away: 'Man City', homeScore: 0, awayScore: 2 },
    { home: 'Bournemouth', away: 'Leicester', homeScore: 2, awayScore: 0 },
    { home: 'Chelsea', away: 'Southampton', homeScore: 2, awayScore: 0 },
];

const teamNameToIdMap: Map<string, string> = new Map();
allTeams.forEach(team => {
    teamNameToIdMap.set(team.name.toLowerCase().replace(/'/g, '').replace(' town', ''), team.id);
});
// Add variations for team names
teamNameToIdMap.set('notts forest', 'team_16');
teamNameToIdMap.set('man city', 'team_13');
teamNameToIdMap.set('man utd', 'team_14');
teamNameToIdMap.set('newcastle', 'team_15');
teamNameToIdMap.set('west ham', 'team_19');
teamNameToIdMap.set('crystal palace', 'team_7');
teamNameToIdMap.set('leeds', 'team_24');
teamNameToIdMap.set('burnley', 'team_22');
teamNameToIdMap.set('sunderland', 'team_25');


const parseTeamName = (name: string): string => {
    const lowerName = name.toLowerCase().replace(/'/g, '').trim();
    if (teamNameToIdMap.has(lowerName)) {
        return teamNameToIdMap.get(lowerName)!;
    }
    console.warn(`Could not find team ID for name: "${name}"`);
    return 'unknown';
};


const calculateStandings = (matchesToProcess: { home: string, away: string, homeScore: number, awayScore: number }[]): PreviousSeasonStanding[] => {
    const standingsMap: Map<string, { points: number, goalDifference: number, goalsFor: number }> = new Map();

    allTeams.forEach(team => {
        standingsMap.set(team.id, { points: 0, goalDifference: 0, goalsFor: 0 });
    });

    matchesToProcess.forEach(match => {
        const homeTeamId = parseTeamName(match.home);
        const awayTeamId = parseTeamName(match.away);
        if (homeTeamId === 'unknown' || awayTeamId === 'unknown') return;

        const homeTeam = standingsMap.get(homeTeamId)!;
        const awayTeam = standingsMap.get(awayTeamId)!;

        homeTeam.goalsFor += match.homeScore;
        awayTeam.goalsFor += match.awayScore;
        homeTeam.goalDifference += match.homeScore - match.awayScore;
        awayTeam.goalDifference += match.awayScore - match.homeScore;

        if (match.homeScore > match.awayScore) {
            homeTeam.points += 3;
        } else if (match.homeScore < match.awayScore) {
            awayTeam.points += 3;
        } else {
            homeTeam.points += 1;
            awayTeam.points += 1;
        }
    });

    const calculatedStandings: (PreviousSeasonStanding & { teamName: string, goalsFor: number })[] = [];
    standingsMap.forEach((stats, teamId) => {
        const team = allTeams.find(t => t.id === teamId);
        if (team) {
            calculatedStandings.push({ teamId, teamName: team.name, ...stats });
        }
    });
    
    calculatedStandings.sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
        if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
        return a.teamName.localeCompare(b.teamName);
    });

    return calculatedStandings.map((standing, index) => ({
        teamId: standing.teamId,
        rank: index + 1,
        points: standing.points,
        goalDifference: standing.goalDifference,
    }));
};

export const previousSeasonStandings: PreviousSeasonStanding[] = calculateStandings(realMatchData2425);


export const fullUsers: Omit<User, 'score' | 'rank' | 'previousRank' | 'previousScore' | 'maxRank' | 'minRank' | 'maxScore' | 'minScore' | 'rankChange' | 'scoreChange'>[] = [
    { id: 'usr_1', name: 'Alex Anderson', avatar: '1', email: 'alex@example.com', joinDate: '2023-08-10T10:00:00Z' },
    { id: 'usr_2', name: 'Thomas Wright', avatar: '2' },
    { id: 'usr_3', name: 'Barrie Cross', avatar: '3' },
    { id: 'usr_4', name: 'Dave Nightingale', avatar: '4' },
    { id: 'usr_5', name: 'Pip Stokes', avatar: '5' },
    { id: 'usr_6', name: 'Nat Walsh', avatar: '6' },
    { id: 'usr_7', name: 'Patrick Meese', avatar: '7' },
    { id: 'usr_8', name: 'Lee Harte', avatar: '8' },
    { id: 'usr_9', name: 'Jim Poole', avatar: '9' },
    { id: 'usr_10', name: 'Lyndon Padmore', avatar: '10' },
    { id: 'usr_11', name: 'Alg Mangor Wroldsen', avatar: '11' },
    { id: 'usr_12', name: 'Steve Wroldsen', avatar: '12' },
    { id: 'usr_13', name: 'Roger Wymer', avatar: '13' },
    { id: 'usr_14', name: 'Mike Wymer', avatar: '14' },
    { id: 'usr_15', name: 'Andy Belton', avatar: '15' },
    { id: 'usr_16', name: 'Ernest Belton', avatar: '16' },
    { id: 'usr_17', name: 'Tim Birchall', avatar: '17' },
    { id: 'usr_18', name: 'Nathan Hyatt', avatar: '18' },
    { id: 'usr_19', name: 'Rory Hyatt', avatar: '19' },
    { id: 'usr_20', name: 'Gazza Littlewood', avatar: '20' },
    { id: 'usr_21', name: 'Fazil Sediqi', avatar: '21' },
    { id: 'usr_22', name: 'Shuhra Sediqi', avatar: '22' },
    { id: 'usr_23', name: 'Ilyas Taj Sediqi', avatar: '23' },
    { id: 'usr_24', name: 'Eshwa Sediqi', avatar: '24' },
    { id: 'usr_25', name: 'Ben Fellows', avatar: '25' },
    { id: 'usr_26', name: 'Michelle Duffy-Turner', avatar: '26' },
    { id: 'usr_27', name: 'Nicola Spears', avatar: '27' },
    { id: 'usr_28', name: 'Jamie Spears', avatar: '28' },
    { id: 'usr_29', name: 'Jonny Taylor', avatar: '29' },
    { id: 'usr_30', name: 'John Taylor', avatar: '30' },
    { id: 'usr_31', name: 'Sam Dixon', avatar: '31' },
    { id: 'usr_32', name: 'Doug Potter', avatar: '32' },
    { id: 'usr_33', name: 'Finlay Sinclair', avatar: '33' },
    { id: 'usr_34', name: 'Aidan Kehoe', avatar: '34' },
    { id: 'usr_35', name: 'Ben Patey', avatar: '35' },
    { id: 'usr_36', name: 'Theo Gresson', avatar: '36' },
    { id: 'usr_37', name: 'Adam Barclay', avatar: '37' },
    { id: 'usr_38', name: 'James Eldred', avatar: '38' },
    { id: 'usr_39', name: 'Otis Eldred', avatar: '39' },
    { id: 'usr_40', name: 'Dan Coles', avatar: '40' },
    { id: 'usr_41', name: 'Daniel Crick', avatar: '41' },
    { id: 'usr_42', name: 'Sheila Mckenzie', avatar: '42' },
    { id: 'usr_43', name: 'Chris Dodds', avatar: '43' },
    { id: 'usr_44', name: 'Rich Seddon', avatar: '44' },
    { id: 'usr_45', name: 'Ross Allatt', avatar: '45' },
    { id: 'usr_46', name: 'Neville Johnson', avatar: '46' },
    { id: 'usr_47', name: 'Julian Spears', avatar: '47' },
    { id: 'usr_48', name: 'Andrew Spears', avatar: '48' },
    { id: 'usr_49', name: 'Danny Broom', avatar: '49' },
    { id: 'usr_50', name: 'Paul Hammett', avatar: '1' },
    { id: 'usr_51', name: 'Tom Gill', avatar: '2' },
    { id: 'usr_52', name: 'Ronnie Bain', avatar: '3' },
    { id: 'usr_53', name: 'Matthew Bain', avatar: '4' },
    { id: 'usr_54', name: 'Sam Bain', avatar: '5' },
    { id: 'usr_55', name: 'Andy Barnes', avatar: '6' },
    { id: 'usr_56', name: 'Pascal Walls', avatar: '7' },
    { id: 'usr_57', name: 'Steve Lawrence', avatar: '8' },
    { id: 'usr_58', name: 'Gill Butler', avatar: '9' },
    { id: 'usr_59', name: 'Tom Coles', avatar: '10' },
    { id: 'usr_60', name: 'Tommy Poole', avatar: '11' },
    { id: 'usr_61', name: 'Eddie Spencer', avatar: '12' },
    { id: 'usr_62', name: 'Rory Poole', avatar: '13' },
    { id: 'usr_63', name: 'Scott Emmett', avatar: '14' },
    { id: 'usr_64', name: 'Craig Temporal', avatar: '15' },
    { id: 'usr_65', name: 'Andrew Senior', avatar: '16' },
    { id: 'usr_66', name: 'Dan Brown', avatar: '17' },
    { id: 'usr_67', name: 'Rupert Massey', avatar: '18' },
    { id: 'usr_68', name: 'Matt Howard', avatar: '19' },
    { id: 'usr_69', name: 'Justin Downing', avatar: '20' },
    { id: 'usr_70', name: 'Sam Burgess', avatar: '21' },
    { id: 'usr_71', name: 'George John Roberts', avatar: '22' },
    { id: 'usr_72', name: 'Leyton Collings', avatar: '23' },
    { id: 'usr_73', name: 'Ben Cox', avatar: '24' },
    { id: 'usr_74', name: 'Adan F Bain', avatar: '25' },
    { id: 'usr_75', name: 'Amy Parkinson', avatar: '26' },
    { id: 'usr_76', name: 'Steven Bain', avatar: '27' },
    { id: 'usr_77', name: 'Ian Scotland', avatar: '28' },
    { id: 'usr_78', name: 'Benjamin Dawes', avatar: '29' },
    { id: 'usr_79', name: 'Tom Bywater', avatar: '30' },
    { id: 'usr_80', name: 'Jack Murray', avatar: '31' },
    { id: 'usr_81', name: 'Rob Mabon', avatar: '32' },
    { id: 'usr_82', name: 'Andrew Trafford', avatar: '33' },
    { id: 'usr_83', name: 'Luca Trafford', avatar: '34' },
    { id: 'usr_84', name: 'Craig Stevens', avatar: '35' },
    { id: 'usr_85', name: 'George Butterworth', avatar: '36' },
    { id: 'usr_86', name: 'Ashley Davies', avatar: '37' },
    { id: 'usr_87', name: 'Duncan Holder', avatar: '38' },
    { id: 'usr_88', name: 'Arthur Davies', avatar: '39' },
    { id: 'usr_89', name: 'Paul Stonier', avatar: '40' },
    { id: 'usr_90', name: 'Jember Weekes', avatar: '41' },
    { id: 'usr_91', name: 'Tom Kehoe', avatar: '42' },
    { id: 'usr_92', name: 'Chris Burston', avatar: '43' },
    { id: 'usr_93', name: 'Malcolm Sinclair', avatar: '44' },
    { id: 'usr_94', name: 'Dan Parkinson', avatar: '45' },
    { id: 'usr_95', name: 'Alfie Skingley', avatar: '46' },
    { id: 'usr_96', name: 'Bev Skingley', avatar: '47' },
    { id: 'usr_97', name: 'Daniel Skingley', avatar: '48' },
    { id: 'usr_98', name: 'Ken Skingley', avatar: '49' },
    { id: 'usr_99', name: 'Lyndsey Preece', avatar: '1' },
    { id: 'usr_100', name: 'Kane Sullivan', avatar: '2' },
    { id: 'usr_101', name: 'Graeme Bailie', avatar: '3' },
    { id: 'usr_102', name: 'Dan Dawson', avatar: '4' },
    { id: 'usr_103', name: 'THE MSN', avatar: '5', isPro: true },
    { id: 'usr_104', name: 'THE A.I.', avatar: '6', isPro: true },
    { id: 'usr_105', name: 'THE SUPERCOMPUTER', avatar: '7', isPro: true },
    { id: 'usr_106', name: 'BBC', avatar: '47', isPro: true },
    { id: 'usr_107', name: 'SKY', avatar: '48', isPro: true },
    { id: 'usr_108', name: 'OPTA', avatar: '49', isPro: true },
];

export const fullPredictions: Prediction[] = [
    { userId: "usr_2", rankings: ["team_14", "team_12", "team_13", "team_1", "team_15", "team_6", "team_2", "team_16", "team_18", "team_3", "team_5", "team_9", "team_4", "team_24", "team_7", "team_19", "team_20", "team_8", "team_22", "team_25"] },
    { userId: "usr_3", rankings: ["team_12", "team_13", "team_1", "team_6", "team_2", "team_15", "team_16", "team_7", "team_5", "team_14", "team_18", "team_3", "team_4", "team_9", "team_8", "team_24", "team_20", "team_19", "team_22", "team_25"] },
    { userId: "usr_4", rankings: ["team_12", "team_1", "team_13", "team_6", "team_15", "team_14", "team_2", "team_18", "team_5", "team_3", "team_16", "team_8", "team_7", "team_9", "team_19", "team_4", "team_20", "team_24", "team_22", "team_25"] },
    { userId: "usr_5", rankings: ["team_12", "team_13", "team_6", "team_1", "team_2", "team_15", "team_5", "team_18", "team_16", "team_9", "team_14", "team_3", "team_8", "team_7", "team_20", "team_19", "team_4", "team_24", "team_22", "team_25"] },
    { userId: "usr_1", rankings: ["team_6", "team_13", "team_12", "team_1", "team_2", "team_15", "team_18", "team_5", "team_14", "team_9", "team_3", "team_4", "team_24", "team_8", "team_7", "team_20", "team_19", "team_16", "team_22", "team_25"] },
    { userId: "usr_6", rankings: ["team_6", "team_13", "team_12", "team_1", "team_15", "team_14", "team_8", "team_2", "team_7", "team_5", "team_16", "team_24", "team_19", "team_25", "team_18", "team_20", "team_3", "team_9", "team_4", "team_22"] },
    { userId: "usr_7", rankings: ["team_13", "team_12", "team_1", "team_6", "team_15", "team_2", "team_18", "team_14", "team_3", "team_16", "team_9", "team_5", "team_20", "team_7", "team_19", "team_24", "team_8", "team_4", "team_25", "team_22"] },
    { userId: "usr_8", rankings: ["team_12", "team_13", "team_1", "team_6", "team_2", "team_14", "team_18", "team_15", "team_3", "team_5", "team_8", "team_19", "team_9", "team_7", "team_20", "team_16", "team_4", "team_24", "team_25", "team_22"] },
    { userId: "usr_9", rankings: ["team_12", "team_13", "team_1", "team_6", "team_2", "team_15", "team_18", "team_14", "team_16", "team_8", "team_5", "team_4", "team_19", "team_3", "team_9", "team_7", "team_20", "team_22", "team_24", "team_25"] },
    { userId: "usr_10", rankings: ["team_13", "team_12", "team_1", "team_6", "team_18", "team_14", "team_2", "team_15", "team_19", "team_8", "team_5", "team_20", "team_4", "team_9", "team_7", "team_3", "team_16", "team_24", "team_22", "team_25"] },
    { userId: "usr_11", rankings: ["team_13", "team_12", "team_1", "team_6", "team_2", "team_14", "team_18", "team_15", "team_8", "team_5", "team_7", "team_9", "team_19", "team_4", "team_3", "team_16", "team_25", "team_20", "team_22", "team_24"] },
    { userId: "usr_12", rankings: ["team_13", "team_1", "team_12", "team_6", "team_2", "team_15", "team_4", "team_3", "team_16", "team_5", "team_7", "team_8", "team_14", "team_18", "team_9", "team_19", "team_20", "team_25", "team_22", "team_24"] },
    { userId: "usr_13", rankings: ["team_12", "team_13", "team_1", "team_15", "team_14", "team_6", "team_18", "team_8", "team_2", "team_19", "team_7", "team_5", "team_9", "team_4", "team_16", "team_20", "team_3", "team_25", "team_24", "team_22"] },
    { userId: "usr_14", rankings: ["team_12", "team_1", "team_15", "team_6", "team_13", "team_14", "team_18", "team_2", "team_8", "team_3", "team_5", "team_19", "team_9", "team_7", "team_25", "team_20", "team_4", "team_16", "team_24", "team_22"] },
    { userId: "usr_15", rankings: ["team_12", "team_6", "team_13", "team_1", "team_2", "team_14", "team_15", "team_18", "team_19", "team_5", "team_16", "team_8", "team_9", "team_7", "team_20", "team_3", "team_25", "team_4", "team_22", "team_24"] },
    { userId: "usr_16", rankings: ["team_13", "team_12", "team_1", "team_6", "team_14", "team_2", "team_15", "team_18", "team_16", "team_3", "team_7", "team_8", "team_5", "team_19", "team_4", "team_20", "team_9", "team_24", "team_22", "team_25"] },
    { userId: "usr_17", rankings: ["team_12", "team_13", "team_1", "team_6", "team_5", "team_16", "team_14", "team_18", "team_9", "team_7", "team_8", "team_2", "team_19", "team_15", "team_24", "team_20", "team_3", "team_4", "team_25", "team_22"] },
    { userId: "usr_18", rankings: ["team_12", "team_1", "team_13", "team_6", "team_15", "team_14", "team_2", "team_18", "team_16", "team_5", "team_3", "team_7", "team_8", "team_20", "team_9", "team_19", "team_4", "team_24", "team_25", "team_22"] },
    { userId: "usr_19", rankings: ["team_1", "team_12", "team_6", "team_13", "team_2", "team_16", "team_15", "team_5", "team_3", "team_18", "team_4", "team_9", "team_14", "team_8", "team_19", "team_7", "team_20", "team_24", "team_25", "team_22"] },
    { userId: "usr_20", rankings: ["team_12", "team_1", "team_6", "team_13", "team_2", "team_14", "team_15", "team_7", "team_16", "team_5", "team_3", "team_8", "team_18", "team_4", "team_9", "team_19", "team_20", "team_24", "team_22", "team_25"] },
    { userId: "usr_21", rankings: ["team_12", "team_1", "team_13", "team_14", "team_6", "team_2", "team_18", "team_15", "team_7", "team_5", "team_16", "team_3", "team_4", "team_8", "team_19", "team_9", "team_20", "team_24", "team_22", "team_25"] },
    { userId: "usr_22", rankings: ["team_12", "team_13", "team_6", "team_1", "team_2", "team_3", "team_14", "team_15", "team_7", "team_5", "team_16", "team_9", "team_4", "team_19", "team_8", "team_18", "team_20", "team_22", "team_24", "team_25"] },
    { userId: "usr_23", rankings: ["team_1", "team_13", "team_12", "team_15", "team_6", "team_16", "team_14", "team_18", "team_20", "team_9", "team_19", "team_7", "team_4", "team_5", "team_8", "team_3", "team_24", "team_2", "team_25", "team_22"] },
    { userId: "usr_24", rankings: ["team_12", "team_13", "team_1", "team_6", "team_15", "team_8", "team_3", "team_2", "team_5", "team_16", "team_7", "team_9", "team_14", "team_19", "team_20", "team_18", "team_24", "team_4", "team_25", "team_22"] },
    { userId: "usr_25", rankings: ["team_1", "team_13", "team_12", "team_6", "team_14", "team_2", "team_7", "team_15", "team_18", "team_5", "team_8", "team_3", "team_16", "team_4", "team_9", "team_19", "team_20", "team_24", "team_22", "team_25"] },
    { userId: "usr_26", rankings: ["team_6", "team_13", "team_12", "team_1", "team_2", "team_15", "team_8", "team_3", "team_14", "team_7", "team_5", "team_18", "team_16", "team_19", "team_9", "team_20", "team_24", "team_4", "team_25", "team_22"] },
    { userId: "usr_27", rankings: ["team_6", "team_12", "team_13", "team_1", "team_2", "team_15", "team_18", "team_14", "team_16", "team_5", "team_4", "team_24", "team_8", "team_3", "team_7", "team_9", "team_22", "team_19", "team_25", "team_20"] },
    { userId: "usr_28", rankings: ["team_12", "team_6", "team_1", "team_16", "team_13", "team_3", "team_15", "team_18", "team_20", "team_2", "team_5", "team_8", "team_7", "team_14", "team_19", "team_9", "team_24", "team_22", "team_4", "team_25"] },
    { userId: "usr_29", rankings: ["team_12", "team_1", "team_13", "team_6", "team_2", "team_15", "team_18", "team_14", "team_5", "team_16", "team_8", "team_3", "team_7", "team_9", "team_19", "team_4", "team_20", "team_24", "team_25", "team_22"] },
    { userId: "usr_30", rankings: ["team_13", "team_1", "team_12", "team_6", "team_15", "team_2", "team_18", "team_14", "team_7", "team_9", "team_16", "team_5", "team_3", "team_8", "team_19", "team_24", "team_20", "team_4", "team_22", "team_25"] },
    { userId: "usr_31", rankings: ["team_12", "team_13", "team_1", "team_6", "team_18", "team_2", "team_15", "team_5", "team_14", "team_7", "team_8", "team_19", "team_16", "team_3", "team_20", "team_9", "team_24", "team_4", "team_22", "team_25"] },
    { userId: "usr_32", rankings: ["team_12", "team_13", "team_1", "team_6", "team_2", "team_15", "team_14", "team_18", "team_16", "team_5", "team_8", "team_3", "team_9", "team_4", "team_19", "team_7", "team_24", "team_20", "team_22", "team_25"] },
    { userId: "usr_33", rankings: ["team_13", "team_1", "team_6", "team_12", "team_14", "team_2", "team_18", "team_5", "team_15", "team_3", "team_8", "team_9", "team_7", "team_19", "team_16", "team_4", "team_25", "team_20", "team_24", "team_22"] },
    { userId: "usr_34", rankings: ["team_1", "team_12", "team_2", "team_13", "team_6", "team_14", "team_18", "team_5", "team_15", "team_3", "team_16", "team_8", "team_9", "team_7", "team_20", "team_25", "team_24", "team_19", "team_4", "team_22"] },
    { userId: "usr_35", rankings: ["team_12", "team_13", "team_1", "team_6", "team_14", "team_2", "team_15", "team_5", "team_18", "team_8", "team_9", "team_3", "team_19", "team_7", "team_16", "team_4", "team_20", "team_24", "team_22", "team_25"] },
    { userId: "usr_36", rankings: ["team_12", "team_13", "team_6", "team_1", "team_14", "team_2", "team_18", "team_8", "team_15", "team_7", "team_5", "team_3", "team_16", "team_9", "team_19", "team_4", "team_20", "team_22", "team_24", "team_25"] },
    { userId: "usr_37", rankings: ["team_12", "team_1", "team_13", "team_6", "team_2", "team_15", "team_14", "team_5", "team_18", "team_16", "team_7", "team_8", "team_3", "team_9", "team_19", "team_4", "team_20", "team_22", "team_24", "team_25"] },
    { userId: "usr_38", rankings: ["team_12", "team_1", "team_13", "team_6", "team_14", "team_2", "team_18", "team_15", "team_16", "team_5", "team_9", "team_3", "team_8", "team_7", "team_4", "team_19", "team_24", "team_20", "team_22", "team_25"] },
    { userId: "usr_39", rankings: ["team_12", "team_13", "team_14", "team_6", "team_18", "team_1", "team_2", "team_8", "team_9", "team_7", "team_15", "team_16", "team_19", "team_5", "team_3", "team_25", "team_20", "team_22", "team_4", "team_24"] },
    { userId: "usr_40", rankings: ["team_13", "team_6", "team_12", "team_1", "team_18", "team_2", "team_14", "team_15", "team_8", "team_5", "team_16", "team_7", "team_19", "team_9", "team_20", "team_24", "team_4", "team_3", "team_25", "team_22"] },
    { userId: "usr_41", rankings: ["team_12", "team_13", "team_6", "team_1", "team_2", "team_15", "team_14", "team_18", "team_7", "team_5", "team_3", "team_16", "team_9", "team_19", "team_8", "team_20", "team_24", "team_25", "team_4", "team_22"] },
    { userId: "usr_42", rankings: ["team_12", "team_1", "team_13", "team_6", "team_15", "team_18", "team_2", "team_5", "team_14", "team_7", "team_16", "team_3", "team_8", "team_20", "team_9", "team_19", "team_4", "team_24", "team_25", "team_22"] },
    { userId: "usr_43", rankings: ["team_12", "team_6", "team_1", "team_13", "team_18", "team_14", "team_15", "team_2", "team_5", "team_16", "team_7", "team_8", "team_19", "team_3", "team_9", "team_4", "team_20", "team_24", "team_25", "team_22"] },
    { userId: "usr_44", rankings: ["team_13", "team_1", "team_14", "team_15", "team_12", "team_6", "team_18", "team_5", "team_2", "team_19", "team_4", "team_7", "team_9", "team_20", "team_16", "team_8", "team_3", "team_25", "team_22", "team_24"] },
    { userId: "usr_45", rankings: ["team_13", "team_1", "team_12", "team_6", "team_15", "team_14", "team_5", "team_2", "team_18", "team_16", "team_9", "team_7", "team_8", "team_3", "team_22", "team_4", "team_24", "team_20", "team_19", "team_25"] },
    { userId: "usr_46", rankings: ["team_6", "team_12", "team_13", "team_14", "team_1", "team_15", "team_7", "team_5", "team_2", "team_16", "team_18", "team_8", "team_20", "team_3", "team_9", "team_24", "team_19", "team_22", "team_4", "team_25"] },
    { userId: "usr_47", rankings: ["team_6", "team_12", "team_13", "team_1", "team_15", "team_14", "team_2", "team_18", "team_5", "team_9", "team_7", "team_16", "team_20", "team_24", "team_3", "team_4", "team_8", "team_22", "team_19", "team_25"] },
    { userId: "usr_48", rankings: ["team_12", "team_6", "team_13", "team_1", "team_15", "team_14", "team_7", "team_2", "team_5", "team_9", "team_18", "team_16", "team_20", "team_8", "team_3", "team_4", "team_24", "team_22", "team_19", "team_25"] },
    { userId: "usr_49", rankings: ["team_6", "team_12", "team_13", "team_1", "team_18", "team_15", "team_2", "team_16", "team_7", "team_14", "team_3", "team_5", "team_19", "team_9", "team_8", "team_20", "team_25", "team_4", "team_24", "team_22"] },
    { userId: "usr_50", rankings: ["team_12", "team_6", "team_13", "team_1", "team_2", "team_15", "team_16", "team_5", "team_3", "team_14", "team_8", "team_4", "team_19", "team_7", "team_9", "team_18", "team_20", "team_22", "team_24", "team_25"] },
    { userId: "usr_51", rankings: ["team_13", "team_6", "team_12", "team_1", "team_14", "team_2", "team_15", "team_8", "team_18", "team_7", "team_5", "team_19", "team_9", "team_16", "team_25", "team_3", "team_22", "team_24", "team_4", "team_20"] },
    { userId: "usr_52", rankings: ["team_1", "team_12", "team_13", "team_6", "team_2", "team_15", "team_18", "team_14", "team_8", "team_16", "team_5", "team_4", "team_19", "team_9", "team_24", "team_7", "team_20", "team_3", "team_25", "team_22"] },
    { userId: "usr_53", rankings: ["team_12", "team_13", "team_6", "team_18", "team_15", "team_14", "team_2", "team_16", "team_1", "team_8", "team_7", "team_5", "team_9", "team_3", "team_24", "team_25", "team_19", "team_4", "team_20", "team_22"] },
    { userId: "usr_54", rankings: ["team_6", "team_12", "team_13", "team_1", "team_15", "team_2", "team_16", "team_8", "team_14", "team_7", "team_5", "team_3", "team_9", "team_4", "team_18", "team_19", "team_24", "team_20", "team_22", "team_25"] },
    { userId: "usr_55", rankings: ["team_12", "team_13", "team_6", "team_1", "team_15", "team_18", "team_14", "team_5", "team_2", "team_3", "team_4", "team_8", "team_16", "team_19", "team_9", "team_7", "team_24", "team_25", "team_20", "team_22"] },
    { userId: "usr_56", rankings: ["team_12", "team_13", "team_1", "team_6", "team_16", "team_14", "team_5", "team_2", "team_15", "team_7", "team_8", "team_18", "team_9", "team_3", "team_19", "team_4", "team_25", "team_20", "team_24", "team_22"] },
    { userId: "usr_57", rankings: ["team_1", "team_12", "team_13", "team_14", "team_6", "team_2", "team_15", "team_5", "team_16", "team_18", "team_9", "team_7", "team_8", "team_20", "team_3", "team_19", "team_24", "team_22", "team_4", "team_25"] },
    { userId: "usr_58", rankings: ["team_1", "team_6", "team_13", "team_12", "team_14", "team_2", "team_18", "team_16", "team_7", "team_15", "team_3", "team_5", "team_9", "team_8", "team_19", "team_20", "team_25", "team_24", "team_4", "team_22"] },
    { userId: "usr_59", rankings: ["team_12", "team_1", "team_6", "team_13", "team_15", "team_18", "team_2", "team_14", "team_3", "team_5", "team_16", "team_7", "team_19", "team_4", "team_9", "team_20", "team_8", "team_24", "team_22", "team_25"] },
    { userId: "usr_60", rankings: ["team_12", "team_1", "team_13", "team_6", "team_2", "team_7", "team_15", "team_5", "team_3", "team_16", "team_18", "team_14", "team_4", "team_9", "team_8", "team_19", "team_20", "team_22", "team_24", "team_25"] },
    { userId: "usr_61", rankings: ["team_12", "team_13", "team_1", "team_6", "team_18", "team_14", "team_15", "team_2", "team_8", "team_5", "team_16", "team_4", "team_3", "team_7", "team_19", "team_9", "team_20", "team_24", "team_22", "team_25"] },
    { userId: "usr_62", rankings: ["team_12", "team_1", "team_13", "team_6", "team_2", "team_16", "team_7", "team_15", "team_5", "team_3", "team_18", "team_14", "team_4", "team_19", "team_8", "team_9", "team_24", "team_20", "team_22", "team_25"] },
    { userId: "usr_63", rankings: ["team_12", "team_13", "team_6", "team_1", "team_2", "team_18", "team_14", "team_15", "team_5", "team_16", "team_7", "team_8", "team_3", "team_19", "team_4", "team_9", "team_25", "team_24", "team_20", "team_22"] },
    { userId: "usr_64", rankings: ["team_6", "team_12", "team_13", "team_1", "team_5", "team_2", "team_14", "team_15", "team_16", "team_18", "team_8", "team_24", "team_7", "team_19", "team_9", "team_25", "team_20", "team_3", "team_4", "team_22"] },
    { userId: "usr_65", rankings: ["team_12", "team_6", "team_1", "team_13", "team_15", "team_2", "team_18", "team_14", "team_5", "team_3", "team_16", "team_9", "team_8", "team_4", "team_7", "team_19", "team_25", "team_20", "team_24", "team_22"] },
    { userId: "usr_66", rankings: ["team_12", "team_1", "team_6", "team_13", "team_15", "team_2", "team_18", "team_14", "team_5", "team_7", "team_3", "team_9", "team_8", "team_20", "team_16", "team_4", "team_19", "team_24", "team_22", "team_25"] },
    { userId: "usr_67", rankings: ["team_12", "team_1", "team_13", "team_6", "team_14", "team_15", "team_2", "team_8", "team_18", "team_5", "team_16", "team_7", "team_3", "team_9", "team_19", "team_20", "team_24", "team_4", "team_22", "team_25"] },
    { userId: "usr_68", rankings: ["team_1", "team_13", "team_12", "team_14", "team_6", "team_2", "team_18", "team_15", "team_16", "team_5", "team_3", "team_8", "team_7", "team_4", "team_9", "team_19", "team_20", "team_24", "team_22", "team_25"] },
    { userId: "usr_69", rankings: ["team_12", "team_1", "team_13", "team_15", "team_6", "team_2", "team_5", "team_7", "team_4", "team_16", "team_14", "team_18", "team_3", "team_8", "team_9", "team_19", "team_24", "team_20", "team_22", "team_25"] },
    { userId: "usr_70", rankings: ["team_13", "team_6", "team_12", "team_1", "team_2", "team_15", "team_18", "team_14", "team_16", "team_19", "team_9", "team_5", "team_8", "team_7", "team_3", "team_24", "team_4", "team_20", "team_25", "team_22"] },
    { userId: "usr_71", rankings: ["team_1", "team_12", "team_13", "team_6", "team_2", "team_15", "team_14", "team_5", "team_18", "team_3", "team_16", "team_20", "team_9", "team_7", "team_8", "team_4", "team_25", "team_19", "team_22", "team_24"] },
    { userId: "usr_72", rankings: ["team_12", "team_13", "team_6", "team_1", "team_15", "team_14", "team_2", "team_16", "team_9", "team_18", "team_8", "team_7", "team_5", "team_3", "team_19", "team_4", "team_20", "team_24", "team_22", "team_25"] },
    { userId: "usr_73", rankings: ["team_12", "team_13", "team_6", "team_1", "team_2", "team_14", "team_15", "team_16", "team_7", "team_8", "team_18", "team_3", "team_9", "team_5", "team_20", "team_24", "team_19", "team_4", "team_25", "team_22"] },
    { userId: "usr_74", rankings: ["team_12", "team_13", "team_6", "team_1", "team_18", "team_14", "team_15", "team_2", "team_24", "team_7", "team_5", "team_20", "team_8", "team_16", "team_25", "team_19", "team_9", "team_4", "team_3", "team_22"] },
    { userId: "usr_75", rankings: ["team_12", "team_1", "team_13", "team_6", "team_15", "team_2", "team_7", "team_16", "team_5", "team_4", "team_3", "team_14", "team_9", "team_8", "team_18", "team_19", "team_22", "team_20", "team_24", "team_25"] },
    { userId: "usr_76", rankings: ["team_12", "team_1", "team_6", "team_13", "team_2", "team_15", "team_7", "team_5", "team_14", "team_18", "team_8", "team_25", "team_16", "team_4", "team_19", "team_24", "team_9", "team_20", "team_3", "team_22"] },
    { userId: "usr_77", rankings: ["team_13", "team_12", "team_6", "team_1", "team_16", "team_14", "team_18", "team_5", "team_15", "team_3", "team_2", "team_8", "team_9", "team_7", "team_4", "team_19", "team_22", "team_20", "team_24", "team_25"] },
    { userId: "usr_78", rankings: ["team_12", "team_6", "team_13", "team_1", "team_14", "team_2", "team_15", "team_18", "team_8", "team_7", "team_16", "team_3", "team_5", "team_4", "team_19", "team_9", "team_22", "team_24", "team_20", "team_25"] },
    { userId: "usr_79", rankings: ["team_12", "team_1", "team_13", "team_6", "team_2", "team_15", "team_18", "team_14", "team_5", "team_7", "team_16", "team_8", "team_20", "team_19", "team_9", "team_3", "team_4", "team_24", "team_25", "team_22"] },
    { userId: "usr_80", rankings: ["team_1", "team_12", "team_6", "team_13", "team_14", "team_15", "team_2", "team_18", "team_5", "team_16", "team_7", "team_19", "team_20", "team_8", "team_4", "team_25", "team_9", "team_24", "team_3", "team_22"] },
    { userId: "usr_81", rankings: ["team_12", "team_1", "team_13", "team_6", "team_2", "team_14", "team_18", "team_15", "team_5", "team_16", "team_7", "team_8", "team_3", "team_9", "team_19", "team_20", "team_24", "team_22", "team_25", "team_4"] },
    { userId: "usr_82", rankings: ["team_1", "team_12", "team_7", "team_6", "team_13", "team_2", "team_15", "team_5", "team_14", "team_16", "team_18", "team_8", "team_3", "team_4", "team_20", "team_9", "team_24", "team_19", "team_25", "team_22"] },
    { userId: "usr_83", rankings: ["team_12", "team_1", "team_13", "team_6", "team_15", "team_2", "team_5", "team_19", "team_14", "team_18", "team_7", "team_20", "team_9", "team_4", "team_3", "team_16", "team_8", "team_24", "team_22", "team_25"] },
    { userId: "usr_84", rankings: ["team_12", "team_13", "team_6", "team_1", "team_15", "team_18", "team_14", "team_2", "team_7", "team_5", "team_16", "team_3", "team_8", "team_9", "team_19", "team_24", "team_20", "team_4", "team_25", "team_22"] },
    { userId: "usr_85", rankings: ["team_1", "team_12", "team_13", "team_6", "team_2", "team_15", "team_16", "team_8", "team_3", "team_5", "team_7", "team_18", "team_9", "team_14", "team_4", "team_19", "team_20", "team_24", "team_25", "team_22"] },
    { userId: "usr_86", rankings: ["team_12", "team_13", "team_1", "team_6", "team_15", "team_2", "team_14", "team_5", "team_18", "team_7", "team_16", "team_3", "team_9", "team_8", "team_19", "team_20", "team_25", "team_4", "team_24", "team_22"] },
    { userId: "usr_87", rankings: ["team_12", "team_6", "team_1", "team_13", "team_14", "team_18", "team_2", "team_7", "team_15", "team_8", "team_19", "team_9", "team_5", "team_4", "team_16", "team_3", "team_24", "team_22", "team_20", "team_25"] },
    { userId: "usr_88", rankings: ["team_12", "team_1", "team_6", "team_13", "team_15", "team_2", "team_14", "team_5", "team_7", "team_18", "team_16", "team_3", "team_9", "team_4", "team_8", "team_19", "team_20", "team_25", "team_24", "team_22"] },
    { userId: "usr_89", rankings: ["team_14", "team_12", "team_1", "team_13", "team_2", "team_6", "team_18", "team_22", "team_3", "team_5", "team_16", "team_9", "team_15", "team_4", "team_7", "team_25", "team_24", "team_8", "team_20", "team_19"] },
    { userId: "usr_90", rankings: ["team_13", "team_1", "team_12", "team_2", "team_6", "team_7", "team_18", "team_14", "team_15", "team_9", "team_24", "team_3", "team_22", "team_20", "team_16", "team_4", "team_5", "team_8", "team_25", "team_19"] },
    { userId: "usr_91", rankings: ["team_12", "team_1", "team_13", "team_6", "team_2", "team_15", "team_18", "team_14", "team_5", "team_7", "team_16", "team_9", "team_4", "team_19", "team_3", "team_8", "team_20", "team_24", "team_25", "team_22"] },
    { userId: "usr_92", rankings: ["team_12", "team_1", "team_13", "team_6", "team_2", "team_18", "team_15", "team_5", "team_14", "team_16", "team_7", "team_4", "team_3", "team_8", "team_9", "team_19", "team_20", "team_22", "team_24", "team_25"] },
    { userId: "usr_93", rankings: ["team_12", "team_13", "team_6", "team_1", "team_2", "team_14", "team_15", "team_18", "team_5", "team_8", "team_3", "team_16", "team_7", "team_9", "team_19", "team_24", "team_4", "team_22", "team_20", "team_25"] },
    { userId: "usr_94", rankings: ["team_12", "team_13", "team_6", "team_1", "team_15", "team_14", "team_2", "team_18", "team_5", "team_7", "team_3", "team_19", "team_9", "team_8", "team_16", "team_20", "team_22", "team_24", "team_4", "team_25"] },
    { userId: "usr_95", rankings: ["team_1", "team_12", "team_13", "team_6", "team_2", "team_18", "team_14", "team_7", "team_15", "team_16", "team_8", "team_5", "team_19", "team_9", "team_3", "team_4", "team_24", "team_25", "team_20", "team_22"] },
    { userId: "usr_96", rankings: ["team_1", "team_12", "team_6", "team_13", "team_2", "team_18", "team_16", "team_7", "team_14", "team_5", "team_8", "team_4", "team_15", "team_19", "team_24", "team_20", "team_9", "team_25", "team_22", "team_3"] },
    { userId: "usr_97", rankings: ["team_1", "team_6", "team_12", "team_13", "team_18", "team_14", "team_7", "team_2", "team_8", "team_15", "team_5", "team_16", "team_19", "team_9", "team_3", "team_4", "team_24", "team_20", "team_22", "team_25"] },
    { userId: "usr_98", rankings: ["team_1", "team_12", "team_13", "team_6", "team_14", "team_15", "team_16", "team_2", "team_3", "team_18", "team_5", "team_4", "team_7", "team_24", "team_19", "team_8", "team_9", "team_20", "team_22", "team_25"] },
    { userId: "usr_99", rankings: ["team_1", "team_13", "team_12", "team_6", "team_14", "team_9", "team_16", "team_2", "team_15", "team_24", "team_7", "team_18", "team_3", "team_8", "team_25", "team_5", "team_19", "team_4", "team_20", "team_22"] },
    { userId: "usr_100", rankings: ["team_12", "team_1", "team_13", "team_6", "team_15", "team_14", "team_2", "team_18", "team_19", "team_8", "team_5", "team_20", "team_4", "team_9", "team_7", "team_3", "team_16", "team_24", "team_25", "team_22"] },
    { userId: "usr_101", rankings: ["team_14", "team_12", "team_1", "team_13", "team_2", "team_6", "team_18", "team_15", "team_7", "team_5", "team_8", "team_24", "team_9", "team_25", "team_3", "team_19", "team_16", "team_4", "team_20", "team_22"] },
    { userId: "usr_102", rankings: ["team_13", "team_12", "team_1", "team_6", "team_18", "team_2", "team_15", "team_14", "team_16", "team_7", "team_8", "team_19", "team_3", "team_5", "team_20", "team_9", "team_24", "team_4", "team_25", "team_22"] },
    { userId: "usr_103", rankings: ["team_1", "team_13", "team_12", "team_6", "team_2", "team_15", "team_18", "team_16", "team_7", "team_8", "team_5", "team_14", "team_19", "team_4", "team_3", "team_9", "team_24", "team_20", "team_22", "team_25"] },
    { userId: "usr_104", rankings: ["team_12", "team_1", "team_13", "team_15", "team_6", "team_2", "team_16", "team_18", "team_5", "team_9", "team_14", "team_8", "team_19", "team_3", "team_4", "team_24", "team_7", "team_20", "team_22", "team_25"] },
    { userId: "usr_105", rankings: ["team_13", "team_1", "team_12", "team_6", "team_14", "team_2", "team_18", "team_15", "team_19", "team_8", "team_5", "team_20", "team_4", "team_9", "team_7", "team_3", "team_16", "team_22", "team_25", "team_24"] },
    { userId: "usr_106", rankings: ["team_13", "team_1", "team_12", "team_6", "team_14", "team_2", "team_18", "team_15", "team_19", "team_8", "team_5", "team_20", "team_4", "team_9", "team_7", "team_3", "team_16", "team_22", "team_25", "team_24"] },
    { userId: "usr_107", rankings: ["team_13", "team_1", "team_12", "team_6", "team_14", "team_2", "team_18", "team_15", "team_19", "team_8", "team_5", "team_20", "team_4", "team_9", "team_7", "team_3", "team_16", "team_22", "team_25", "team_24"] },
    { userId: "usr_108", rankings: ["team_13", "team_1", "team_12", "team_6", "team_14", "team_2", "team_18", "team_15", "team_19", "team_8", "team_5", "team_20", "team_4", "team_9", "team_7", "team_3", "team_16", "team_22", "team_25", "team_24"] }
];

const seasonMonths: SeasonMonth[] = [
    { id: 'sm_1', month: 'August', year: 2025, abbreviation: 'AUG' },
    { id: 'sm_2', month: 'September', year: 2025, abbreviation: 'SEPT' },
    { id: 'sm_3', month: 'October', year: 2025, abbreviation: 'OCT' },
    { id: 'sm_4', month: 'November', year: 2025, abbreviation: 'NOV' },
    { id: 'sm_5', month: 'December', year: 2025, abbreviation: 'DEC' },
    { id: 'sm_6', month: 'December', year: 2025, special: 'Christmas No. 1', abbreviation: 'XMAS' },
    { id: 'sm_7', month: 'January', year: 2026, abbreviation: 'JAN' },
    { id: 'sm_8', month: 'February', year: 2026, abbreviation: 'FEB' },
    { id: 'sm_9', month: 'March', year: 2026, abbreviation: 'MAR' },
    { id: 'sm_10', month: 'April', year: 2026, abbreviation: 'APR' },
    { id: 'sm_11', month: 'May', year: 2026, abbreviation: 'MAY' },
];

const WEEKS_TO_SHOW = 18;

const allMatches: Match[] = [
    { week: 1, homeTeamId: 'team_14', awayTeamId: 'team_9', homeScore: 1, awayScore: 0 },
    { week: 1, homeTeamId: 'team_19', awayTeamId: 'team_2', homeScore: 1, awayScore: 2 },
    { week: 1, homeTeamId: 'team_16', awayTeamId: 'team_3', homeScore: 1, awayScore: 1 },
    { week: 1, homeTeamId: 'team_15', awayTeamId: 'team_17', homeScore: 1, awayScore: 0 },
    { week: 1, homeTeamId: 'team_8', awayTeamId: 'team_5', homeScore: 0, awayScore: 3 },
    { week: 1, homeTeamId: 'team_1', awayTeamId: 'team_20', homeScore: 2, awayScore: 0 },
    { week: 1, homeTeamId: 'team_10', awayTeamId: 'team_12', homeScore: 0, awayScore: 2 },
    { week: 1, homeTeamId: 'team_6', awayTeamId: 'team_13', homeScore: 0, awayScore: 2 },
    { week: 1, homeTeamId: 'team_4', awayTeamId: 'team_7', homeScore: 2, awayScore: 1 },
    { week: 1, homeTeamId: 'team_11', awayTeamId: 'team_18', homeScore: 1, awayScore: 1 },
    { week: 2, homeTeamId: 'team_2', awayTeamId: 'team_1', homeScore: 0, awayScore: 2 },
    { week: 2, homeTeamId: 'team_18', awayTeamId: 'team_8', homeScore: 4, awayScore: 0 },
    { week: 2, homeTeamId: 'team_17', awayTeamId: 'team_16', homeScore: 0, awayScore: 1 },
    { week: 2, homeTeamId: 'team_13', awayTeamId: 'team_10', homeScore: 4, awayScore: 1 },
    { week: 2, homeTeamId: 'team_9', awayTeamId: 'team_11', homeScore: 2, awayScore: 1 },
    { week: 2, homeTeamId: 'team_7', awayTeamId: 'team_19', homeScore: 0, awayScore: 2 },
    { week: 2, homeTeamId: 'team_5', awayTeamId: 'team_14', homeScore: 2, awayScore: 1 },
    { week: 2, homeTeamId: 'team_12', awayTeamId: 'team_4', homeScore: 2, awayScore: 0 },
    { week: 2, homeTeamId: 'team_20', awayTeamId: 'team_6', homeScore: 2, awayScore: 6 },
    { week: 2, homeTeamId: 'team_3', awayTeamId: 'team_15', homeScore: 1, awayScore: 1 },
    { week: 3, homeTeamId: 'team_19', awayTeamId: 'team_13', homeScore: 1, awayScore: 3 },
    { week: 3, homeTeamId: 'team_16', awayTeamId: 'team_20', homeScore: 1, awayScore: 1 },
    { week: 3, homeTeamId: 'team_11', awayTeamId: 'team_2', homeScore: 1, awayScore: 2 },
    { week: 3, homeTeamId: 'team_10', awayTeamId: 'team_9', homeScore: 1, awayScore: 1 },
    { week: 3, homeTeamId: 'team_8', awayTeamId: 'team_3', homeScore: 2, awayScore: 3 },
    { week: 3, homeTeamId: 'team_4', awayTeamId: 'team_17', homeScore: 3, awayScore: 1 },
    { week: 3, homeTeamId: 'team_1', awayTeamId: 'team_5', homeScore: 1, awayScore: 1 },
    { week: 3, homeTeamId: 'team_14', awayTeamId: 'team_12', homeScore: 0, awayScore: 3 },
    { week: 3, homeTeamId: 'team_15', awayTeamId: 'team_18', homeScore: 2, awayScore: 1 },
    { week: 3, homeTeamId: 'team_6', awayTeamId: 'team_7', homeScore: 1, awayScore: 1 },
    { week: 4, homeTeamId: 'team_3', awayTeamId: 'team_6', homeScore: 0, awayScore: 1 },
    { week: 4, homeTeamId: 'team_2', awayTeamId: 'team_8', homeScore: 3, awayScore: 2 },
    { week: 4, homeTeamId: 'team_13', awayTeamId: 'team_4', homeScore: 2, awayScore: 1 },
    { week: 4, homeTeamId: 'team_12', awayTeamId: 'team_16', homeScore: 0, awayScore: 1 },
    { week: 4, homeTeamId: 'team_9', awayTeamId: 'team_19', homeScore: 1, awayScore: 1 },
    { week: 4, homeTeamId: 'team_7', awayTeamId: 'team_11', homeScore: 2, awayScore: 2 },
    { week: 4, homeTeamId: 'team_5', awayTeamId: 'team_10', homeScore: 0, awayScore: 0 },
    { week: 4, homeTeamId: 'team_17', awayTeamId: 'team_14', homeScore: 0, awayScore: 3 },
    { week: 4, homeTeamId: 'team_20', awayTeamId: 'team_15', homeScore: 1, awayScore: 2 },
    { week: 4, homeTeamId: 'team_18', awayTeamId: 'team_1', homeScore: 0, awayScore: 1 },
    { week: 5, homeTeamId: 'team_7', awayTeamId: 'team_14', homeScore: 0, awayScore: 0 },
    { week: 5, homeTeamId: 'team_18', awayTeamId: 'team_4', homeScore: 3, awayScore: 1 },
    { week: 5, homeTeamId: 'team_17', awayTeamId: 'team_10', homeScore: 1, awayScore: 1 },
    { week: 5, homeTeamId: 'team_12', awayTeamId: 'team_3', homeScore: 3, awayScore: 0 },
    { week: 5, homeTeamId: 'team_11', awayTeamId: 'team_8', homeScore: 1, awayScore: 1 },
    { week: 5, homeTeamId: 'team_9', awayTeamId: 'team_15', homeScore: 3, awayScore: 1 },
    { week: 5, homeTeamId: 'team_2', awayTeamId: 'team_20', homeScore: 3, awayScore: 1 },
    { week: 5, homeTeamId: 'team_19', awayTeamId: 'team_6', homeScore: 0, awayScore: 3 },
    { week: 5, homeTeamId: 'team_13', awayTeamId: 'team_1', homeScore: 2, awayScore: 2 },
    { week: 5, homeTeamId: 'team_5', awayTeamId: 'team_16', homeScore: 2, awayScore: 2 },
    { week: 6, homeTeamId: 'team_20', awayTeamId: 'team_12', homeScore: 1, awayScore: 2 },
    { week: 6, homeTeamId: 'team_16', awayTeamId: 'team_9', homeScore: 0, awayScore: 1 },
    { week: 6, homeTeamId: 'team_8', awayTeamId: 'team_7', homeScore: 2, awayScore: 1 },
    { week: 6, homeTeamId: 'team_6', awayTeamId: 'team_5', homeScore: 4, awayScore: 2 },
    { week: 6, homeTeamId: 'team_4', awayTeamId: 'team_19', homeScore: 1, awayScore: 1 },
    { week: 6, homeTeamId: 'team_1', awayTeamId: 'team_11', homeScore: 4, awayScore: 2 },
    { week: 6, homeTeamId: 'team_15', awayTeamId: 'team_13', homeScore: 1, awayScore: 1 },
    { week: 6, homeTeamId: 'team_14', awayTeamId: 'team_18', homeScore: 0, awayScore: 3 },
    { week: 6, homeTeamId: 'team_10', awayTeamId: 'team_2', homeScore: 2, awayScore: 2 },
    { week: 6, homeTeamId: 'team_3', awayTeamId: 'team_17', homeScore: 3, awayScore: 1 },
    { week: 7, homeTeamId: 'team_8', awayTeamId: 'team_15', homeScore: 0, awayScore: 0 },
    { week: 7, homeTeamId: 'team_19', awayTeamId: 'team_10', homeScore: 4, awayScore: 1 },
    { week: 7, homeTeamId: 'team_13', awayTeamId: 'team_9', homeScore: 3, awayScore: 2 },
    { week: 7, homeTeamId: 'team_11', awayTeamId: 'team_3', homeScore: 1, awayScore: 0 },
    { week: 7, homeTeamId: 'team_4', awayTeamId: 'team_20', homeScore: 5, awayScore: 3 },
    { week: 7, homeTeamId: 'team_1', awayTeamId: 'team_17', homeScore: 3, awayScore: 1 },
    { week: 7, homeTeamId: 'team_7', awayTeamId: 'team_12', homeScore: 0, awayScore: 1 },
    { week: 7, homeTeamId: 'team_5', awayTeamId: 'team_18', homeScore: 3, awayScore: 2 },
    { week: 7, homeTeamId: 'team_6', awayTeamId: 'team_16', homeScore: 1, awayScore: 1 },
    { week: 7, homeTeamId: 'team_2', awayTeamId: 'team_14', homeScore: 0, awayScore: 0 },
    { week: 8, homeTeamId: 'team_3', awayTeamId: 'team_1', homeScore: 2, awayScore: 0 },
    { week: 8, homeTeamId: 'team_10', awayTeamId: 'team_8', homeScore: 0, awayScore: 2 },
    { week: 8, homeTeamId: 'team_17', awayTeamId: 'team_11', homeScore: 2, awayScore: 3 },
    { week: 8, homeTeamId: 'team_15', awayTeamId: 'team_5', homeScore: 0, awayScore: 1 },
    { week: 8, homeTeamId: 'team_14', awayTeamId: 'team_4', homeScore: 2, awayScore: 1 },
    { week: 8, homeTeamId: 'team_9', awayTeamId: 'team_2', homeScore: 1, awayScore: 3 },
    { week: 8, homeTeamId: 'team_18', awayTeamId: 'team_19', homeScore: 4, awayScore: 1 },
    { week: 8, homeTeamId: 'team_12', awayTeamId: 'team_6', homeScore: 2, awayScore: 1 },
    { week: 8, homeTeamId: 'team_20', awayTeamId: 'team_13', homeScore: 1, awayScore: 2 },
    { week: 8, homeTeamId: 'team_16', awayTeamId: 'team_7', homeScore: 1, awayScore: 0 },
    { week: 9, homeTeamId: 'team_11', awayTeamId: 'team_16', homeScore: 1, awayScore: 3 },
    { week: 9, homeTeamId: 'team_8', awayTeamId: 'team_9', homeScore: 1, awayScore: 1 },
    { week: 9, homeTeamId: 'team_13', awayTeamId: 'team_17', homeScore: 1, awayScore: 0 },
    { week: 9, homeTeamId: 'team_5', awayTeamId: 'team_20', homeScore: 2, awayScore: 2 },
    { week: 9, homeTeamId: 'team_4', awayTeamId: 'team_10', homeScore: 4, awayScore: 3 },
    { week: 9, homeTeamId: 'team_2', awayTeamId: 'team_3', homeScore: 1, awayScore: 1 },
    { week: 9, homeTeamId: 'team_1', awayTeamId: 'team_12', homeScore: 2, awayScore: 2 },
    { week: 9, homeTeamId: 'team_19', awayTeamId: 'team_14', homeScore: 2, awayScore: 1 },
    { week: 9, homeTeamId: 'team_7', awayTeamId: 'team_18', homeScore: 1, awayScore: 0 },
    { week: 9, homeTeamId: 'team_6', awayTeamId: 'team_15', homeScore: 2, awayScore: 1 },
    { week: 10, homeTeamId: 'team_20', awayTeamId: 'team_7', homeScore: 2, awayScore: 2 },
    { week: 10, homeTeamId: 'team_17', awayTeamId: 'team_8', homeScore: 1, awayScore: 0 },
    { week: 10, homeTeamId: 'team_16', awayTeamId: 'team_19', homeScore: 3, awayScore: 0 },
    { week: 10, homeTeamId: 'team_12', awayTeamId: 'team_5', homeScore: 2, awayScore: 1 },
    { week: 10, homeTeamId: 'team_10', awayTeamId: 'team_11', homeScore: 1, awayScore: 1 },
    { week: 10, homeTeamId: 'team_3', awayTeamId: 'team_13', homeScore: 2, awayScore: 1 },
    { week: 10, homeTeamId: 'team_15', awayTeamId: 'team_1', homeScore: 1, awayScore: 0 },
    { week: 10, homeTeamId: 'team_14', awayTeamId: 'team_6', homeScore: 1, awayScore: 1 },
    { week: 10, homeTeamId: 'team_18', awayTeamId: 'team_2', homeScore: 4, awayScore: 1 },
    { week: 10, homeTeamId: 'team_9', awayTeamId: 'team_4', homeScore: 2, awayScore: 1 },
    { week: 11, homeTeamId: 'team_12', awayTeamId: 'team_2', homeScore: 2, awayScore: 0 },
    { week: 11, homeTeamId: 'team_5', awayTeamId: 'team_13', homeScore: 2, awayScore: 1 },
    { week: 11, homeTeamId: 'team_20', awayTeamId: 'team_17', homeScore: 2, awayScore: 0 },
    { week: 11, homeTeamId: 'team_19', awayTeamId: 'team_8', homeScore: 0, awayScore: 0 },
    { week: 11, homeTeamId: 'team_7', awayTeamId: 'team_9', homeScore: 0, awayScore: 2 },
    { week: 11, homeTeamId: 'team_4', awayTeamId: 'team_3', homeScore: 3, awayScore: 2 },
    { week: 11, homeTeamId: 'team_6', awayTeamId: 'team_1', homeScore: 1, awayScore: 1 },
    { week: 11, homeTeamId: 'team_18', awayTeamId: 'team_10', homeScore: 1, awayScore: 2 },
    { week: 11, homeTeamId: 'team_16', awayTeamId: 'team_15', homeScore: 1, awayScore: 3 },
    { week: 11, homeTeamId: 'team_14', awayTeamId: 'team_11', homeScore: 3, awayScore: 0 },
    { week: 12, homeTeamId: 'team_13', awayTeamId: 'team_18', homeScore: 0, awayScore: 4 },
    { week: 12, homeTeamId: 'team_9', awayTeamId: 'team_20', homeScore: 1, awayScore: 4 },
    { week: 12, homeTeamId: 'team_8', awayTeamId: 'team_4', homeScore: 0, awayScore: 0 },
    { week: 12, homeTeamId: 'team_2', awayTeamId: 'team_7', homeScore: 2, awayScore: 2 },
    { week: 12, homeTeamId: 'team_1', awayTeamId: 'team_16', homeScore: 3, awayScore: 0 },
    { week: 12, homeTeamId: 'team_3', awayTeamId: 'team_5', homeScore: 1, awayScore: 2 },
    { week: 12, homeTeamId: 'team_11', awayTeamId: 'team_6', homeScore: 1, awayScore: 2 },
    { week: 12, homeTeamId: 'team_10', awayTeamId: 'team_14', homeScore: 1, awayScore: 1 },
    { week: 12, homeTeamId: 'team_17', awayTeamId: 'team_12', homeScore: 2, awayScore: 3 },
    { week: 12, homeTeamId: 'team_19', awayTeamId: 'team_15', homeScore: 0, awayScore: 2 },
    { week: 13, homeTeamId: 'team_5', awayTeamId: 'team_17', homeScore: 1, awayScore: 1 },
    { week: 13, homeTeamId: 'team_19', awayTeamId: 'team_1', homeScore: 2, awayScore: 5 },
    { week: 13, homeTeamId: 'team_20', awayTeamId: 'team_3', homeScore: 2, awayScore: 4 },
    { week: 13, homeTeamId: 'team_16', awayTeamId: 'team_10', homeScore: 1, awayScore: 0 },
    { week: 13, homeTeamId: 'team_7', awayTeamId: 'team_15', homeScore: 1, awayScore: 1 },
    { week: 13, homeTeamId: 'team_4', awayTeamId: 'team_11', homeScore: 4, awayScore: 1 },
    { week: 13, homeTeamId: 'team_12', awayTeamId: 'team_13', homeScore: 2, awayScore: 0 },
    { week: 13, homeTeamId: 'team_18', awayTeamId: 'team_9', homeScore: 1, awayScore: 1 },
    { week: 13, homeTeamId: 'team_14', awayTeamId: 'team_8', homeScore: 4, awayScore: 0 },
    { week: 13, homeTeamId: 'team_6', awayTeamId: 'team_2', homeScore: 3, awayScore: 0 },
    { week: 14, homeTeamId: 'team_11', awayTeamId: 'team_19', homeScore: 3, awayScore: 1 },
    { week: 14, homeTeamId: 'team_10', awayTeamId: 'team_7', homeScore: 0, awayScore: 1 },
    { week: 14, homeTeamId: 'team_2', awayTeamId: 'team_4', homeScore: 3, awayScore: 1 },
    { week: 14, homeTeamId: 'team_1', awayTeamId: 'team_14', homeScore: 2, awayScore: 0 },
    { week: 14, homeTeamId: 'team_17', awayTeamId: 'team_6', homeScore: 1, awayScore: 5 },
    { week: 14, homeTeamId: 'team_15', awayTeamId: 'team_12', homeScore: 3, awayScore: 3 },
    { week: 14, homeTeamId: 'team_13', awayTeamId: 'team_16', homeScore: 3, awayScore: 0 },
    { week: 14, homeTeamId: 'team_8', awayTeamId: 'team_20', homeScore: 4, awayScore: 0 },
    { week: 14, homeTeamId: 'team_3', awayTeamId: 'team_18', homeScore: 1, awayScore: 0 },
    { week: 14, homeTeamId: 'team_9', awayTeamId: 'team_5', homeScore: 3, awayScore: 1 },
    { week: 15, homeTeamId: 'team_14', awayTeamId: 'team_16', homeScore: 2, awayScore: 3 },
    { week: 15, homeTeamId: 'team_7', awayTeamId: 'team_13', homeScore: 2, awayScore: 2 },
    { week: 15, homeTeamId: 'team_4', awayTeamId: 'team_15', homeScore: 4, awayScore: 2 },
    { week: 15, homeTeamId: 'team_2', awayTeamId: 'team_17', homeScore: 1, awayScore: 0 },
    { week: 15, homeTeamId: 'team_18', awayTeamId: 'team_6', homeScore: 3, awayScore: 4 },
    { week: 15, homeTeamId: 'team_11', awayTeamId: 'team_5', homeScore: 2, awayScore: 2 },
    { week: 15, homeTeamId: 'team_10', awayTeamId: 'team_3', homeScore: 1, awayScore: 2 },
    { week: 15, homeTeamId: 'team_9', awayTeamId: 'team_1', homeScore: 1, awayScore: 1 },
    { week: 15, homeTeamId: 'team_19', awayTeamId: 'team_20', homeScore: 2, awayScore: 1 },
    { week: 16, homeTeamId: 'team_16', awayTeamId: 'team_2', homeScore: 2, awayScore: 1 },
    { week: 16, homeTeamId: 'team_20', awayTeamId: 'team_10', homeScore: 1, awayScore: 2 },
    { week: 16, homeTeamId: 'team_15', awayTeamId: 'team_11', homeScore: 4, awayScore: 0 },
    { week: 16, homeTeamId: 'team_12', awayTeamId: 'team_9', homeScore: 2, awayScore: 2 },
    { week: 16, homeTeamId: 'team_1', awayTeamId: 'team_8', homeScore: 0, awayScore: 0 },
    { week: 16, homeTeamId: 'team_17', awayTeamId: 'team_18', homeScore: 0, awayScore: 5 },
    { week: 16, homeTeamId: 'team_6', awayTeamId: 'team_4', homeScore: 2, awayScore: 1 },
    { week: 16, homeTeamId: 'team_13', awayTeamId: 'team_14', homeScore: 1, awayScore: 2 },
    { week: 16, homeTeamId: 'team_5', awayTeamId: 'team_7', homeScore: 1, awayScore: 3 },
    { week: 16, homeTeamId: 'team_3', awayTeamId: 'team_19', homeScore: 1, awayScore: 1 },
    { week: 17, homeTeamId: 'team_7', awayTeamId: 'team_1', homeScore: 1, awayScore: 5 },
    { week: 17, homeTeamId: 'team_19', awayTeamId: 'team_5', homeScore: 1, awayScore: 1 },
    { week: 17, homeTeamId: 'team_10', awayTeamId: 'team_15', homeScore: 0, awayScore: 4 },
    { week: 17, homeTeamId: 'team_4', awayTeamId: 'team_16', homeScore: 0, awayScore: 2 },
    { week: 17, homeTeamId: 'team_2', awayTeamId: 'team_13', homeScore: 2, awayScore: 1 },
    { week: 17, homeTeamId: 'team_18', awayTeamId: 'team_12', homeScore: 3, awayScore: 6 },
    { week: 17, homeTeamId: 'team_14', awayTeamId: 'team_3', homeScore: 0, awayScore: 3 },
    { week: 17, homeTeamId: 'team_11', awayTeamId: 'team_20', homeScore: 0, awayScore: 3 },
    { week: 17, homeTeamId: 'team_9', awayTeamId: 'team_17', homeScore: 0, awayScore: 0 },
    { week: 17, homeTeamId: 'team_8', awayTeamId: 'team_6', homeScore: 0, awayScore: 0 },
    { week: 18, homeTeamId: 'team_12', awayTeamId: 'team_11', homeScore: 3, awayScore: 1 },
    { week: 18, homeTeamId: 'team_20', awayTeamId: 'team_14', homeScore: 2, awayScore: 0 },
    { week: 18, homeTeamId: 'team_17', awayTeamId: 'team_19', homeScore: 0, awayScore: 1 },
    { week: 18, homeTeamId: 'team_16', awayTeamId: 'team_18', homeScore: 1, awayScore: 0 },
    { week: 18, homeTeamId: 'team_15', awayTeamId: 'team_2', homeScore: 3, awayScore: 0 },
    { week: 18, homeTeamId: 'team_6', awayTeamId: 'team_9', homeScore: 1, awayScore: 2 },
    { week: 18, homeTeamId: 'team_3', awayTeamId: 'team_7', homeScore: 0, awayScore: 0 },
    { week: 18, homeTeamId: 'team_13', awayTeamId: 'team_8', homeScore: 1, awayScore: 1 },
    { week: 18, homeTeamId: 'team_10', awayTeamId: 'team_1', homeScore: 1, awayScore: 0 },
    { week: 18, homeTeamId: 'team_5', awayTeamId: 'team_4', homeScore: 0, awayScore: 0 },
];

export const matches: Match[] = allMatches.filter(m => m.week <= WEEKS_TO_SHOW);

const calculateCurrentStandings = (matchesToProcess: Match[]): CurrentStanding[] => {
    const standingsMap: Map<string, Omit<CurrentStanding, 'rank' | 'teamId'>> = new Map();

    const teamIdsInMatches = new Set(matchesToProcess.flatMap(m => [m.homeTeamId, m.awayTeamId]));
    
    allTeams.forEach(team => {
        if (teamIdsInMatches.has(team.id)) {
            standingsMap.set(team.id, { points: 0, goalDifference: 0, gamesPlayed: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0 });
        }
    });

    matchesToProcess.forEach(match => {
        const homeTeam = standingsMap.get(match.homeTeamId);
        const awayTeam = standingsMap.get(match.awayTeamId);

        if (homeTeam && awayTeam) {
            homeTeam.gamesPlayed += 1;
            awayTeam.gamesPlayed += 1;
            homeTeam.goalsFor += match.homeScore;
            awayTeam.goalsFor += match.awayScore;
            homeTeam.goalsAgainst += match.awayScore;
            awayTeam.goalsAgainst += match.homeScore;

            if (match.homeScore > match.awayScore) {
                homeTeam.wins += 1; homeTeam.points += 3; awayTeam.losses += 1;
            } else if (match.homeScore < match.awayScore) {
                awayTeam.wins += 1; awayTeam.points += 3; homeTeam.losses += 1;
            } else {
                homeTeam.draws += 1; awayTeam.draws += 1; homeTeam.points += 1; awayTeam.points += 1;
            }
        }
    });

    const calculatedStandings: (Omit<CurrentStanding, 'rank'> & {teamId: string})[] = [];
    standingsMap.forEach((stats, teamId) => {
        calculatedStandings.push({ teamId, ...stats, goalDifference: stats.goalsFor - stats.goalsAgainst });
    });
    
    calculatedStandings.sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
        if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
        const teamA = allTeams.find(t => t.id === a.teamId)!;
        const teamB = allTeams.find(t => t.id === b.teamId)!;
        return teamA.name.localeCompare(teamB.name);
    });

    let rank = 1;
    return calculatedStandings.map((standing, index) => {
        if (index > 0) {
            const prev = calculatedStandings[index - 1];
            if (standing.points !== prev.points || standing.goalDifference !== prev.goalDifference || standing.goalsFor !== prev.goalsFor) {
                rank = index + 1;
            }
        }
        return { ...standing, rank };
    });
};

export const currentStandings: CurrentStanding[] = calculateCurrentStandings(matches);
const finalStandings: CurrentStanding[] = calculateCurrentStandings(allMatches);


export const playerTeamScores: PlayerTeamScore[] = fullUsers.flatMap(user => {
    const userPrediction = fullPredictions.find(p => p.userId === user.id);
    if (!userPrediction) return [];

    const actualRanks = new Map<string, number>();
    finalStandings.forEach(s => actualRanks.set(s.teamId, s.rank));
    
    return userPrediction.rankings.map((teamId, index) => {
        const predictedRank = index + 1;
        const actualRank = actualRanks.get(teamId);
        let score = 0;
        if (actualRank !== undefined) {
            score = 5 - Math.abs(predictedRank - actualRank);
        }
        return { userId: user.id, teamId, score };
    });
});

const calculateScoresForUser = (userPredictions: string[], actualStandings: CurrentStanding[]): number => {
    const actualRanks = new Map<string, number>();
    actualStandings.forEach(s => actualRanks.set(s.teamId, s.rank));
    
    let totalScore = 0;
    userPredictions.forEach((teamId, index) => {
        const predictedRank = index + 1;
        const actualRank = actualRanks.get(teamId);
        if (actualRank !== undefined) {
            totalScore += 5 - Math.abs(predictedRank - actualRank);
        }
    });
    return totalScore;
};

const previousSeasonPlayerRanks: {[key: string]: number} = {};
[...fullUsers].sort((a,b) => (parseInt(a.id.replace('usr_','')) % 5) - (parseInt(b.id.replace('usr_','')) % 5))
  .forEach((user, index) => { previousSeasonPlayerRanks[user.id] = index + 1; });

export const fullUserHistories: UserHistory[] = fullUsers.map(user => {
    let weeklyScores: WeeklyScore[] = [{ week: 0, score: 0, rank: previousSeasonPlayerRanks[user.id] || parseInt(user.id.replace('usr_', '')) % 20 }];
    const userPrediction = fullPredictions.find(p => p.userId === user.id);

    if (userPrediction) {
        for (let week = 1; week <= 38; week++) {
             const matchesForWeek = allMatches.filter(m => m.week <= week);
             const standingsForWeek = calculateCurrentStandings(matchesForWeek);
             const score = calculateScoresForUser(userPrediction.rankings, standingsForWeek);
             weeklyScores.push({ week, score, rank: 0 }); // Rank will be calculated later
        }
    }
    return { userId: user.id, weeklyScores };
});

for (let week = 1; week <= 38; week++) {
    const weeklyPlayerStandings = fullUserHistories
      .map(h => {
          const user = fullUsers.find(u => u.id === h.userId)!;
          const weeklyScore = h.weeklyScores.find(w => w.week === week);
          return {
              userId: h.userId,
              score: weeklyScore ? weeklyScore.score : -Infinity,
              isPro: user.isPro,
              tieBreaker: parseInt(user.id.replace('usr_', ''))
          }
      })
      .sort((a, b) => b.score - a.score || a.tieBreaker - b.tieBreaker);

    let currentRank = 1;
    let rankCounter = 1;
    weeklyPlayerStandings.forEach((player, index) => {
        if (!player.isPro) {
            if (index > 0 && player.score < weeklyPlayerStandings[index - 1].score) {
                currentRank = rankCounter;
            }
            const userHistory = fullUserHistories.find(h => h.userId === player.userId)!;
            const weekData = userHistory.weeklyScores.find(w => w.week === week)!;
            weekData.rank = currentRank;
            rankCounter++;
        }
    });

    // Assign ranks to pro players separately without affecting non-pro ranks
    let proRankCounter = 1;
    weeklyPlayerStandings.forEach((player) => {
        if(player.isPro) {
            const userHistory = fullUserHistories.find(h => h.userId === player.userId)!;
            const weekData = userHistory.weeklyScores.find(w => w.week === week)!;
            weekData.rank = proRankCounter++;
        }
    })
}


const finalUsers: User[] = fullUsers.map(userStub => {
    const history = fullUserHistories.find(h => h.userId === userStub.id);
    
    if (!history || history.weeklyScores.length === 0) {
        return { ...userStub, score: 0, rank: 0, previousRank: 0, previousScore: 0, rankChange: 0, scoreChange: 0, maxScore: 0, minScore: 0, maxRank: 0, minRank: 0, };
    }
    
    const currentWeekData = history.weeklyScores.find(w => w.week === WEEKS_TO_SHOW) || { score: 0, rank: 0 };
    const previousWeekNumber = WEEKS_TO_SHOW > 1 ? WEEKS_TO_SHOW - 1 : 0;
    const previousWeekData = history.weeklyScores.find(w => w.week === previousWeekNumber) || { score: 0, rank: 0 };
    const rankChange = previousWeekData.rank && currentWeekData.rank ? previousWeekData.rank - currentWeekData.rank : 0;
    const scoreChange = currentWeekData.score - previousWeekData.score;
    
    const seasonWeeklyScores = history.weeklyScores.filter(w => w.week > 0 && w.week <= WEEKS_TO_SHOW);
    
    if (seasonWeeklyScores.length === 0) {
       return { ...userStub, score: currentWeekData.score, rank: currentWeekData.rank, previousRank: previousWeekData.rank, previousScore: previousWeekData.score, rankChange, scoreChange, maxScore: currentWeekData.score, minScore: currentWeekData.score, maxRank: currentWeekData.rank, minRank: currentWeekData.rank, };
    }

    const allScores = seasonWeeklyScores.map(w => w.score);
    const allRanks = seasonWeeklyScores.map(w => w.rank).filter(r => r > 0);
    const maxScore = Math.max(...allScores);
    const minScore = Math.min(...allScores);
    const maxRank = Math.min(...allRanks);
    const minRank = Math.max(...allRanks);
    
    return { ...userStub, score: currentWeekData.score, rank: currentWeekData.rank, previousRank: previousWeekData.rank, previousScore: previousWeekData.score, rankChange, scoreChange, maxScore, minScore, maxRank, minRank, };
});


export const weeklyTeamStandings: WeeklyTeamStanding[] = Array.from(new Set(allMatches.flatMap(m => [m.homeTeamId, m.awayTeamId]))).flatMap(teamId => {
    const ranksByWeek: WeeklyTeamStanding[] = [];

    for (let week = 1; week <= WEEKS_TO_SHOW; week++) {
        const matchesForWeek = allMatches.filter(m => m.week <= week);
        const standingsForWeek = calculateCurrentStandings(matchesForWeek);
        const teamRank = standingsForWeek.find(s => s.teamId === teamId)?.rank || 20;
        ranksByWeek.push({ week, teamId: teamId, rank: teamRank });
    }
    return ranksByWeek;
});


const generateRecentResults = (teamId: string): ('W' | 'D' | 'L' | '-')[] => {
    const results: ('W' | 'D' | 'L' | '-')[] = Array(6).fill('-');
    const teamMatches = matches.filter(m => (m.homeTeamId === teamId || m.awayTeamId === teamId) && m.week <= WEEKS_TO_SHOW).sort((a, b) => b.week - a.week);
    
    for (let i = 0; i < Math.min(teamMatches.length, 6); i++) {
        const match = teamMatches[i];
        let result: 'W' | 'D' | 'L';
        if (match.homeScore === match.awayScore) {
            result = 'D';
        } else if ((match.homeTeamId === teamId && match.homeScore > match.awayScore) || (match.awayTeamId === teamId && match.awayScore > match.homeScore)) {
            result = 'W';
        } else {
            result = 'L';
        }
        results[5 - i] = result;
    }
    
    return results;
};

export const teamRecentResults: TeamRecentResult[] = Array.from(new Set(allMatches.flatMap(m => [m.homeTeamId, m.awayTeamId]))).map((teamId) => {
    return { teamId, results: generateRecentResults(teamId) };
});

const monthWeekRanges: { [key: string]: { start: number; end: number; year: number, special?: string } } = {
    'August': { start: 1, end: 3, year: 2025 },
    'September': { start: 4, end: 7, year: 2025 },
    'October': { start: 8, end: 11, year: 2025 },
    'November': { start: 12, end: 15, year: 2025 },
    'December': { start: 16, end: 20, year: 2025 },
    'Christmas No. 1': { start: 16, end: 19, year: 2025, special: 'Christmas No. 1' },
    'January': { start: 21, end: 24, year: 2026 },
    'February': { start: 25, end: 28, year: 2026 },
    'March': { start: 29, end: 32, year: 2026 },
    'April': { start: 33, end: 36, year: 2026 },
    'May': { start: 37, end: 38, year: 2026 },
};

let monthlyMimoMData: MonthlyMimoM[] = [];
let mimoIdCounter = 1;

for (const monthOrSpecial in monthWeekRanges) {
    const { start, end, year, special } = monthWeekRanges[monthOrSpecial];
    const startWeekForCalc = start - 1;

    if (WEEKS_TO_SHOW >= end) {
        const monthlyRankChanges = fullUsers
            .filter(u => !u.isPro)
            .map(user => {
                const userHistory = fullUserHistories.find(h => h.userId === user.id);
                if (!userHistory) return { userId: user.id, rankChange: -Infinity };

                const startRank = userHistory.weeklyScores.find(ws => ws.week === startWeekForCalc)?.rank || 0;
                const endRank = userHistory.weeklyScores.find(ws => ws.week === end)?.rank || 0;

                const rankChange = (startRank > 0 && endRank > 0) ? startRank - endRank : -Infinity;
                return { userId: user.id, rankChange };
            })
            .sort((a, b) => b.rankChange - a.rankChange);

        if (monthlyRankChanges.length > 0 && monthlyRankChanges[0].rankChange > -Infinity) {
            const bestRankChange = monthlyRankChanges[0].rankChange;
            const winners = monthlyRankChanges.filter(u => u.rankChange === bestRankChange);

            winners.forEach(winner => {
                monthlyMimoMData.push({ id: `mimo_${mimoIdCounter++}`, month: monthOrSpecial, year, userId: winner.userId, type: 'winner', special });
            });

            if (!special && winners.length === 1) {
                const nextBestChange = monthlyRankChanges.find(u => u.rankChange < bestRankChange);
                if (nextBestChange && nextBestChange.rankChange > -Infinity) {
                    const runnersUp = monthlyRankChanges.filter(u => u.rankChange === nextBestChange.rankChange);
                    runnersUp.forEach(runnerUp => {
                        monthlyMimoMData.push({ id: `mimo_${mimoIdCounter++}`, month: monthOrSpecial, year, userId: runnerUp.userId, type: 'runner-up', special });
                    });
                }
            }
        }
    }
}
// Export only the data for the UI
export const users: User[] = finalUsers.slice(0, 20).sort((a, b) => a.rank - b.rank);
const userIdsForUi = new Set(users.map(u => u.id));
export const predictions: Prediction[] = fullPredictions.filter(p => userIdsForUi.has(p.userId));
export const userHistories: UserHistory[] = fullUserHistories.filter(h => userIdsForUi.has(h.userId));
export const monthlyMimoM: MonthlyMimoM[] = monthlyMimoMData;
export { seasonMonths };
