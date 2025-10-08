export type User = {
  id: string;
  name: string;
  avatar: string;
  score: number;
  rank: number;
  rankChange: number; // positive for up, negative for down, 0 for no change
};

export type Game = {
  id: string;
  teamA: string;
  teamB: string;
  teamALogo: string;
  teamBLogo: string;
  date: string;
  time: string;
};

export type Prediction = {
  userId: string;
  gameId: string;
  scoreA: number | null;
  scoreB: number | null;
};

export type UserPredictionHistory = {
  game: string;
  prediction: string;
  actual: string;
  points: number;
  date: string;
};

export const users: User[] = [
  { id: 'usr_1', name: 'Alex', avatar: '1', score: 1250, rank: 1, rankChange: 0 },
  { id: 'usr_2', name: 'Maria', avatar: '2', score: 1180, rank: 2, rankChange: 1 },
  { id: 'usr_3', name: 'David', avatar: '3', score: 1175, rank: 3, rankChange: -1 },
  { id: 'usr_4', name: 'Sophia', avatar: '4', score: 1050, rank: 4, rankChange: 0 },
  { id: 'usr_5', name: 'Kenji', avatar: '5', score: 980, rank: 5, rankChange: 2 },
  { id: 'usr_6', name: 'Fatima', avatar: '6', score: 950, rank: 6, rankChange: -1 },
  { id: 'usr_7', name: 'Leo', avatar: '7', score: 890, rank: 7, rankChange: 0 },
];

export const games: Game[] = [
    {
        id: 'gm_1',
        teamA: 'Quantum FC',
        teamB: 'Photon United',
        teamALogo: 'atom',
        teamBLogo: 'zap',
        date: '2024-07-28',
        time: '18:00 UTC',
    },
    {
        id: 'gm_2',
        teamA: 'Celestial Rovers',
        teamB: 'Meteor Strikers',
        teamALogo: 'rocket',
        teamBLogo: 'orbit',
        date: '2024-07-29',
        time: '20:00 UTC',
    },
    {
        id: 'gm_3',
        teamA: 'Abyssal Titans',
        teamB: 'Tidal Waves',
        teamALogo: 'anchor',
        teamBLogo: 'waves',
        date: '2024-07-30',
        time: '19:00 UTC',
    },
];

export const predictions: Prediction[] = [
    { userId: 'usr_1', gameId: 'gm_1', scoreA: 2, scoreB: 1 },
    { userId: 'usr_2', gameId: 'gm_1', scoreA: 3, scoreB: 0 },
    { userId: 'usr_3', gameId: 'gm_1', scoreA: 1, scoreB: 1 },
    { userId: 'usr_4', gameId: 'gm_1', scoreA: 2, scoreB: 2 },
    { userId: 'usr_5', gameId: 'gm_1', scoreA: 0, scoreB: 1 },
    { userId: 'usr_6', gameId: 'gm_1', scoreA: 1, scoreB: 2 },
    { userId: 'usr_7', gameId: 'gm_1', scoreA: 3, scoreB: 1 },
    { userId: 'usr_1', gameId: 'gm_2', scoreA: 1, scoreB: 0 },
    { userId: 'usr_2', gameId: 'gm_2', scoreA: 2, scoreB: 1 },
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
