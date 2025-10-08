export type User = {
  id: string;
  name: string;
  avatar: string;
  score: number;
  maxScore: number;
  minScore: number;
  rank: number;
  maxRank: number;
  minRank: number;
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
}

export const users: User[] = [
    { id: 'usr_1', name: 'Alex', avatar: '1', score: 85, maxScore: 100, minScore: -190, rank: 1, maxRank: 1, minRank: 5, rankChange: 0, scoreChange: 15 },
    { id: 'usr_2', name: 'Maria', avatar: '2', score: 72, maxScore: 100, minScore: -190, rank: 2, maxRank: 2, minRank: 8, rankChange: 1, scoreChange: 12 },
    { id: 'usr_3', name: 'David', avatar: '3', score: 68, maxScore: 100, minScore: -190, rank: 3, maxRank: 1, minRank: 10, rankChange: -1, scoreChange: -5 },
    { id: 'usr_4', name: 'Sophia', avatar: '4', score: 55, maxScore: 100, minScore: -190, rank: 4, maxRank: 4, minRank: 6, rankChange: 0, scoreChange: 8 },
    { id: 'usr_5', name: 'Kenji', avatar: '5', score: 40, maxScore: 100, minScore: -190, rank: 5, maxRank: 5, minRank: 9, rankChange: 2, scoreChange: 20 },
    { id: 'usr_6', name: 'Fatima', avatar: '6', score: 25, maxScore: 100, minScore: -190, rank: 6, maxRank: 3, minRank: 12, rankChange: -1, scoreChange: -10 },
    { id: 'usr_7', name: 'Leo', avatar: '7', score: 10, maxScore: 100, minScore: -190, rank: 7, maxRank: 7, minRank: 15, rankChange: 0, scoreChange: 5 },
];

export const teams: Team[] = [
  { id: 'team_1', name: 'Quantum FC', logo: 'atom' },
  { id: 'team_2', name: 'Photon United', logo: 'zap' },
  { id: 'team_3', name: 'Celestial Rovers', logo: 'rocket' },
  { id: 'team_4', name: 'Meteor Strikers', logo: 'orbit' },
  { id: 'team_5', name: 'Abyssal Titans', logo: 'anchor' },
  { id: 'team_6', name: 'Tidal Waves', logo: 'waves' },
  { id: 'team_7', name: 'Emerald Dragons', logo: 'atom' },
  { id: 'team_8', name: 'Crimson Warriors', logo: 'swords' },
  { id: 'team_9', name: 'Golden Griffins', logo: 'zap' },
  { id: 'team_10', name: 'Azure Phoenix', logo: 'rocket' },
  { id: 'team_11', name: 'Obsidian Giants', logo: 'orbit' },
  { id: 'team_12', name: 'Silver Serpents', logo: 'anchor' },
  { id: 'team_13', name: 'Iron Golems', logo: 'waves' },
  { id: 'team_14', name: 'Bronze Bulls', logo: 'atom' },
  { id: 'team_15', name: 'Steel Stallions', logo: 'swords' },
  { id: 'team_16', name: 'Void Vikings', logo: 'zap' },
  { id: 'team_17', name: 'Arctic Foxes', logo: 'rocket' },
  { id: 'team_18', name: 'Desert Scorpions', logo: 'orbit' },
  { id: 'team_19', name: 'Jungle Jaguars', logo: 'anchor' },
  { id: 'team_20', name: 'Mountain Lions', logo: 'waves' },
];

export const predictions: Prediction[] = [
    { userId: 'usr_1', rankings: ['team_1', 'team_3', 'team_2', 'team_4', 'team_5', 'team_6', 'team_7', 'team_8', 'team_9', 'team_10', 'team_11', 'team_12', 'team_13', 'team_14', 'team_15', 'team_16', 'team_17', 'team_18', 'team_19', 'team_20'] },
    { userId: 'usr_2', rankings: ['team_2', 'team_1', 'team_3', 'team_4', 'team_5', 'team_6', 'team_7', 'team_8', 'team_9', 'team_10', 'team_11', 'team_12', 'team_13', 'team_14', 'team_15', 'team_16', 'team_17', 'team_18', 'team_19', 'team_20'] },
];

export const userPredictionHistory: UserPredictionHistory[] = [
  { game: "Quantum FC vs Photon United", prediction: "2-1", actual: "2-0", points: 10, date: "2024-07-21" },
  { game: "Celestial Rovers vs Meteor Strikers", prediction: "1-1", actual: "1-1", points: 25, date: "2024-07-22" },
  { game: "Abyssal Titans vs Tidal Waves", prediction: "0-3", actual: "1-3", points: 10, date: "2024-07-23" },
  { game: "Giants vs Dwarves", prediction: "4-2", actual: "1-0", points: 0, date: "2024-07-14" },
  { game: "Wizards vs Knights", prediction: "2-2", actual: "3-1", points: 0, date: "2024-07-15" },
];

export const weeklyPerformance = [
  { week: 'Week 1', score: 50 },
  { week: 'Week 2', score: 75 },
  { week: 'Week 3', score: 60 },
  { week: 'Week 4', score: 90 },
  { week: 'Week 5', score: 85 },
];

export const previousSeasonStandings: PreviousSeasonStanding[] = [
  { teamId: 'team_3', rank: 1, points: 94, goalDifference: 62 },
  { teamId: 'team_1', rank: 2, points: 92, goalDifference: 60 },
  { teamId: 'team_8', rank: 3, points: 89, goalDifference: 45 },
  { teamId: 'team_2', rank: 4, points: 75, goalDifference: 38 },
  { teamId: 'team_9', rank: 5, points: 68, goalDifference: 13 },
  { teamId: 'team_15', rank: 6, points: 62, goalDifference: 15 },
  { teamId: 'team_5', rank: 7, points: 60, goalDifference: 10 },
  { teamId: 'team_11', rank: 8, points: 55, goalDifference: 0 },
  { teamId: 'team_18', rank: 9, points: 52, goalDifference: -1 },
  { teamId: 'team_12', rank: 10, points: 50, goalDifference: 3 },
  { teamId: 'team_6', rank: 11, points: 49, goalDifference: -4 },
  { teamId: 'team_19', rank: 12, points: 48, goalDifference: -6 },
  { teamId: 'team_13', rank: 13, points: 45, goalDifference: -6 },
  { teamId: 'team_20', rank: 14, points: 43, goalDifference: -13 },
  { teamId: 'team_7', rank: 15, points: 40, goalDifference: -10 },
  { teamId: 'team_4', rank: 16, points: 39, goalDifference: -13 },
  { teamId: 'team_10', rank: 17, points: 38, goalDifference: -21 },
  { teamId: 'team_14', rank: 18, points: 29, goalDifference: -33 },
  { teamId: 'team_17', rank: 19, points: 27, goalDifference: -32 },
  { teamId: 'team_16', rank: 20, points: 26, goalDifference: -55 },
];

export const currentStandings: CurrentStanding[] = [
    { teamId: 'team_1', rank: 1, points: 12, goalDifference: 8, gamesPlayed: 5, wins: 4, draws: 0, losses: 1 },
    { teamId: 'team_2', rank: 2, points: 12, goalDifference: 7, gamesPlayed: 5, wins: 4, draws: 0, losses: 1 },
    { teamId: 'team_8', rank: 3, points: 11, goalDifference: 5, gamesPlayed: 5, wins: 3, draws: 2, losses: 0 },
    { teamId: 'team_3', rank: 4, points: 10, goalDifference: 4, gamesPlayed: 5, wins: 3, draws: 1, losses: 1 },
    { teamId: 'team_15', rank: 5, points: 9, goalDifference: 2, gamesPlayed: 5, wins: 2, draws: 3, losses: 0 },
    { teamId: 'team_9', rank: 6, points: 9, goalDifference: 1, gamesPlayed: 5, wins: 2, draws: 3, losses: 0 },
    { teamId: 'team_5', rank: 7, points: 8, goalDifference: 2, gamesPlayed: 5, wins: 2, draws: 2, losses: 1 },
    { teamId: 'team_11', rank: 8, points: 8, goalDifference: 0, gamesPlayed: 5, wins: 2, draws: 2, losses: 1 },
    { teamId: 'team_12', rank: 9, points: 7, goalDifference: -1, gamesPlayed: 5, wins: 2, draws: 1, losses: 2 },
    { teamId: 'team_18', rank: 10, points: 7, goalDifference: -2, gamesPlayed: 5, wins: 2, draws: 1, losses: 2 },
    { teamId: 'team_6', rank: 11, points: 6, goalDifference: -1, gamesPlayed: 5, wins: 1, draws: 3, losses: 1 },
    { teamId: 'team_20', rank: 12, points: 6, goalDifference: -3, gamesPlayed: 5, wins: 1, draws: 3, losses: 1 },
    { teamId: 'team_7', rank: 13, points: 5, goalDifference: -2, gamesPlayed: 5, wins: 1, draws: 2, losses: 2 },
    { teamId: 'team_19', rank: 14, points: 5, goalDifference: -4, gamesPlayed: 5, wins: 1, draws: 2, losses: 2 },
    { teamId: 'team_4', rank: 15, points: 4, goalDifference: -5, gamesPlayed: 5, wins: 1, draws: 1, losses: 3 },
    { teamId: 'team_13', rank: 16, points: 4, goalDifference: -6, gamesPlayed: 5, wins: 1, draws: 1, losses: 3 },
    { teamId: 'team_10', rank: 17, points: 3, goalDifference: -7, gamesPlayed: 5, wins: 0, draws: 3, losses: 2 },
    { teamId: 'team_17', rank: 18, points: 2, goalDifference: -8, gamesPlayed: 5, wins: 0, draws: 2, losses: 3 },
    { teamId: 'team_14', rank: 19, points: 1, goalDifference: -9, gamesPlayed: 5, wins: 0, draws: 1, losses: 4 },
    { teamId: 'team_16', rank: 20, points: 1, goalDifference: -10, gamesPlayed: 5, wins: 0, draws: 1, losses: 4 },
];

    