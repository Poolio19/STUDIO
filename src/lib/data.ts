export type User = {
  id: string;
  name: string;
  avatar: string;
  score: number;
  rank: number;
  rankChange: number; // positive for up, negative for down, 0 for no change
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

export const users: User[] = [
  { id: 'usr_1', name: 'Alex', avatar: '1', score: 1250, rank: 1, rankChange: 0 },
  { id: 'usr_2', name: 'Maria', avatar: '2', score: 1180, rank: 2, rankChange: 1 },
  { id: 'usr_3', name: 'David', avatar: '3', score: 1175, rank: 3, rankChange: -1 },
  { id: 'usr_4', name: 'Sophia', avatar: '4', score: 1050, rank: 4, rankChange: 0 },
  { id: 'usr_5', name: 'Kenji', avatar: '5', score: 980, rank: 5, rankChange: 2 },
  { id: 'usr_6', name: 'Fatima', avatar: '6', score: 950, rank: 6, rankChange: -1 },
  { id: 'usr_7', name: 'Leo', avatar: '7', score: 890, rank: 7, rankChange: 0 },
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
