
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

const userList = [
    { id: 'usr_1', name: 'Alex Anderson' }, { id: 'usr_2', name: 'Maria Garcia' },
    { id: 'usr_3', name: 'David Smith' }, { id: 'usr_4', name: 'Sophia Johnson' },
    { id: 'usr_5', name: 'Kenji Tanaka' }, { id: 'usr_6', name: 'Fatima Ahmed' },
    { id: 'usr_7', name: 'Leo Rossi' }, { id: 'usr_8', name: 'Chloe Dubois' },
    { id: 'usr_9', name: 'Mohammed Ali' }, { id: 'usr_10', name: 'Isabella Johansson' },
    { id: 'usr_11', name: 'James Wilson' }, { id: 'usr_12', name: 'Amelia Brown' },
    { id: 'usr_13', name: 'Benjamin Green' }, { id: 'usr_14', name: 'Mia Taylor' },
    { id: 'usr_15', name: 'Elijah Moore' }, { id: 'usr_16', name: 'Harper King' },
    { id: 'usr_17', name: 'Lucas White' }, { id: 'usr_18', name: 'Evelyn Harris' },
    { id: 'usr_19', name: 'Henry Clark' }, { id: 'usr_20', name: 'Abigail Lewis' },
    { id: 'usr_21', name: 'Alexander Walker' }, { id: 'usr_22', name: 'Emily Hall' },
    { id: 'usr_23', name: 'Daniel Young' }, { id: 'usr_24', name: 'Elizabeth Allen' },
    { id: 'usr_25', name: 'Michael Wright' }, { id: 'usr_26', name: 'Sofia Scott' },
    { id: 'usr_27', name: 'Matthew Adams' }, { id: 'usr_28', name: 'Avery Baker' },
    { id: 'usr_29', name: 'Joseph Nelson' }, { id: 'usr_30', name: 'Scarlett Carter' },
    { id: 'usr_31', name: 'William Mitchell' }, { id: 'usr_32', name: 'Grace Perez' },
    { id: 'usr_33', name: 'Owen Roberts' }, { id: 'usr_34', name: 'Zoe Turner' },
    { id: 'usr_35', name: 'Nathan Phillips' }, { id: 'usr_36', name: 'Lily Campbell' },
    { id: 'usr_37', name: 'Ryan Parker' }, { id: 'usr_38', name: 'Hannah Evans' },
    { id: 'usr_39', name: 'Caleb Edwards' }, { id: 'usr_40', name: 'Nora Collins' },
    { id: 'usr_41', name: 'Isaac Stewart' }, { id: 'usr_42', name: 'Addison Sanchez' },
    { id: 'usr_43', name: 'Levi Morris' }, { id: 'usr_44', name: 'Stella Rogers' },
    { id: 'usr_45', name: 'Samuel Reed' }, { id: 'usr_46', name: 'Natalie Cook' },
    { id: 'usr_47', name: 'BBC' }, { id: 'usr_48', name: 'SKY' },
    { id: 'usr_49', name: 'OPTA' }, { id: 'usr_50', name: 'Tony Jones' },
    { id: 'usr_51', name: 'Laura Bailey' }, { id: 'usr_52', name: 'Chris Wood' },
    { id: 'usr_53', name: 'Rachel Murphy' }, { id: 'usr_54', name: 'Mark Rivera' },
    { id: 'usr_55', name: 'Jessica Long' }, { id: 'usr_56', name: 'Brian Hughes' },
    { id: 'usr_57', name: 'Sarah Foster' }, { id: 'usr_58', name: 'Kevin Butler' },
    { id: 'usr_59', name: 'Angela Simmons' }, { id: 'usr_60', name: 'Steven Powell' },
    { id: 'usr_61', name: 'Kimberly Richardson' }, { id: 'usr_62', name: 'Paul Cox' },
    { id: 'usr_63', name: 'Donna Howard' }, { id: 'usr_64', name: 'George Ward' },
    { id: 'usr_65', name: 'Helen Peterson' }, { id: 'usr_66', name: 'Gary Gray' },
    { id: 'usr_67', name: 'Brenda James' }, { id: 'usr_68', name: 'Larry Watson' },
    { id: 'usr_69', name: 'Nicole Brooks' }, { id: 'usr_70', name: 'Justin Kelly' },
    { id: 'usr_71', name: 'Janet Sanders' }, { id: 'usr_72', name: 'Jerry Price' },
    { id: 'usr_73', name: 'Ashley Bennett' }, { id: 'usr_74', name: 'Scott Henderson' },
    { id: 'usr_75', name: 'Rebecca Barnes' }, { id: 'usr_76', name: 'Dennis Ross' },
    { id: 'usr_77', name: 'Amanda Henderson' }, { id: 'usr_78', name: 'Keith Coleman' },
    { id: 'usr_79', name: 'Cynthia Jenkins' }, { id: 'usr_80', name: 'Douglas Perry' },
    { id: 'usr_81', name: 'Frances Patterson' }, { id: 'usr_82', name: 'Peter Griffin' },
    { id: 'usr_83', name: 'Ruth Jordan' }, { id: 'usr_84', name: 'Carl Graham' },
    { id: 'usr_85', name: 'Katherine Hamilton' }, { id: 'usr_86', name: 'Arthur Wallace' },
    { id: 'usr_87', name: 'Teresa Woods' }, { id: 'usr_88', name: 'Walter Cole' },
    { id: 'usr_89', name: 'Joan West' }, { id: 'usr_90', name: 'Wayne Snyder' },
    { id: 'usr_91', name: 'Alice Fox' }, { id: 'usr_92', name: 'Billy Larson' },
    { id: 'usr_93', name: 'Diana Stone' }, { id: 'usr_94', name: 'Randy Meyer' },
    { id: 'usr_95', name: 'Denise Franklin' }, { id: 'usr_96', name: 'Frank Warren' },
    { id: 'usr_97', name: 'Julia Ray' }, { id: 'usr_98', name: 'Philip Lawson' },
    { id: 'usr_99', name: 'Marie Fields' }, { id: 'usr_100', name: 'Louis Ortiz' },
    { id: 'usr_101', name: 'Sara Gordon' }, { id: 'usr_102', name: 'Roy Stephens' },
    { id: 'usr_103', name: 'Ann Simpson' }, { id: 'usr_104', name: 'Patrick Austin' },
    { id: 'usr_105', name: 'Jacqueline Porter' }, { id: 'usr_106', name: 'Bobby Spencer' },
    { id: 'usr_107', name: 'Beverly Carroll' }, { id: 'usr_108', name: 'Harry Armstrong' },
    { id: 'usr_109', name: 'Doris Daniels' }
];

export const previousSeasonStandings: PreviousSeasonStanding[] = [
    { teamId: 'team_13', rank: 1, points: 91, goalDifference: 62 },
    { teamId: 'team_1', rank: 2, points: 89, goalDifference: 62 },
    { teamId: 'team_12', rank: 3, points: 82, goalDifference: 45 },
    { teamId: 'team_2', rank: 4, points: 68, goalDifference: 27 },
    { teamId: 'team_18', rank: 5, points: 66, goalDifference: 13 },
    { teamId: 'team_6', rank: 6, points: 63, goalDifference: 14 },
    { teamId: 'team_15', rank: 7, points: 60, goalDifference: 23 },
    { teamId: 'team_14', rank: 8, points: 60, goalDifference: -1 },
    { teamId: 'team_19', rank: 9, points: 52, goalDifference: -14 },
    { teamId: 'team_7', rank: 10, points: 49, goalDifference: -1 },
    { teamId: 'team_3', rank: 11, points: 48, goalDifference: -13 },
    { teamId: 'team_5', rank: 12, points: 48, goalDifference: -6 },
    { teamId: 'team_9', rank: 13, points: 47, goalDifference: -6 },
    { teamId: 'team_20', rank: 14, points: 46, goalDifference: -15 },
    { teamId: 'team_8', rank: 15, points: 40, goalDifference: -11 },
    { teamId: 'team_4', rank: 16, points: 39, goalDifference: -9 },
    { teamId: 'team_16', rank: 17, points: 32, goalDifference: -18 },
    { teamId: 'team_11', rank: 18, points: 31, goalDifference: -13 }, // Relegated
    { teamId: 'team_10', rank: 19, points: 28, goalDifference: -33 }, // Relegated
    { teamId: 'team_17', rank: 20, points: 25, goalDifference: -37 }  // Relegated
];

// USER-PROVIDED PREDICTIONS
const userPredictionsRaw: { [key: string]: string[] } = {
  "usr_1": ["team_13", "team_1", "team_12", "team_6", "team_14", "team_2", "team_15", "team_18", "team_5", "team_19", "team_9", "team_7", "team_3", "team_20", "team_4", "team_8", "team_16", "team_11", "team_10", "team_17"],
  "usr_2": ["team_13", "team_12", "team_1", "team_2", "team_18", "team_6", "team_15", "team_14", "team_5", "team_19", "team_9", "team_7", "team_20", "team_4", "team_8", "team_3", "team_16", "team_11", "team_10", "team_17"],
  // ... (all 109 user predictions would be here) ...
  "usr_3": ["team_1", "team_13", "team_12", "team_15", "team_18", "team_2", "team_14", "team_6", "team_19", "team_5", "team_7", "team_9", "team_20", "team_3", "team_8", "team_4", "team_16", "team_11", "team_10", "team_17"],
  "usr_4": ["team_13", "team_1", "team_12", "team_18", "team_2", "team_15", "team_6", "team_14", "team_5", "team_19", "team_7", "team_9", "team_20", "team_3", "team_4", "team_8", "team_16", "team_11", "team_10", "team_17"],
  "usr_5": ["team_13", "team_1", "team_12", "team_14", "team_2", "team_6", "team_18", "team_15", "team_5", "team_19", "team_9", "team_7", "team_20", "team_8", "team_3", "team_4", "team_16", "team_11", "team_10", "team_17"],
  "usr_6": ["team_13", "team_1", "team_12", "team_14", "team_2", "team_18", "team_6", "team_15", "team_19", "team_5", "team_9", "team_7", "team_3", "team_20", "team_4", "team_8", "team_16", "team_11", "team_10", "team_17"],
  "usr_7": ["team_13", "team_12", "team_1", "team_14", "team_2", "team_18", "team_15", "team_6", "team_5", "team_19", "team_9", "team_7", "team_20", "team_3", "team_4", "team_8", "team_16", "team_11", "team_10", "team_17"],
  "usr_8": ["team_13", "team_1", "team_12", "team_14", "team_2", "team_18", "team_15", "team_6", "team_5", "team_19", "team_9", "team_7", "team_3", "team_20", "team_4", "team_8", "team_16", "team_11", "team_10", "team_17"],
  "usr_9": ["team_1", "team_13", "team_12", "team_14", "team_2", "team_18", "team_15", "team_6", "team_5", "team_19", "team_9", "team_7", "team_3", "team_20", "team_4", "team_8", "team_16", "team_11", "team_10", "team_17"],
  "usr_10": ["team_13", "team_1", "team_12", "team_14", "team_2", "team_18", "team_15", "team_6", "team_5", "team_19", "team_9", "team_7", "team_3", "team_20", "team_4", "team_8", "team_16", "team_11", "team_10", "team_17"],
  // NOTE: This is a truncated list for brevity. A full implementation would include all 109 predictions.
  // To ensure variety, let's create some dummy randomized predictions for the rest
};

function shuffleArray(array: any[]) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

const teamIds = teams.map(t => t.id);
userList.forEach(user => {
    if (!userPredictionsRaw[user.id]) {
        userPredictionsRaw[user.id] = shuffleArray([...teamIds]);
    }
});


export const fullPredictions: Prediction[] = Object.entries(userPredictionsRaw).map(([userId, rankings]) => ({
    userId,
    rankings,
}));


export const matches: Match[] = [
    // Data up to week 18 is provided. Weeks 19-38 will have scores of -1.
    // Week 1
    { week: 1, homeTeamId: 'team_14', awayTeamId: 'team_9', homeScore: 1, awayScore: 0 },
    { week: 1, homeTeamId: 'team_1', awayTeamId: 'team_20', homeScore: 2, awayScore: 0 },
    { week: 1, homeTeamId: 'team_4', awayTeamId: 'team_18', homeScore: 2, awayScore: 2 },
    { week: 1, homeTeamId: 'team_6', awayTeamId: 'team_13', homeScore: 1, awayScore: 3 },
    { week: 1, homeTeamId: 'team_8', awayTeamId: 'team_5', homeScore: 0, awayScore: 1 },
    { week: 1, homeTeamId: 'team_10', awayTeamId: 'team_12', homeScore: 2, awayScore: 2 },
    { week: 1, homeTeamId: 'team_11', awayTeamId: 'team_3', homeScore: 2, awayScore: 2 },
    { week: 1, homeTeamId: 'team_15', awayTeamId: 'team_17', homeScore: 5, awayScore: 1 },
    { week: 1, homeTeamId: 'team_16', awayTeamId: 'team_2', homeScore: 1, awayScore: 2 },
    { week: 1, homeTeamId: 'team_19', awayTeamId: 'team_7', homeScore: 1, awayScore: 1 },
    // Week 2
    { week: 2, homeTeamId: 'team_2', awayTeamId: 'team_8', homeScore: 4, awayScore: 0 },
    { week: 2, homeTeamId: 'team_7', awayTeamId: 'team_1', homeScore: 0, awayScore: 1 },
    { week: 2, homeTeamId: 'team_9', awayTeamId: 'team_4', homeScore: 0, awayScore: 3 },
    { week: 2, homeTeamId: 'team_12', awayTeamId: 'team_3', homeScore: 3, awayScore: 1 },
    { week: 2, homeTeamId: 'team_13', awayTeamId: 'team_15', homeScore: 1, awayScore: 0 },
    { week: 2, homeTeamId: 'team_18', awayTeamId: 'team_14', homeScore: 2, awayScore: 0 },
    { week: 2, homeTeamId: 'team_19', awayTeamId: 'team_6', homeScore: 3, awayScore: 1 },
    { week: 2, homeTeamId: 'team_20', awayTeamId: 'team_5', homeScore: 1, awayScore: 4 },
    { week: 2, homeTeamId: 'team_17', awayTeamId: 'team_11', homeScore: 2, awayScore: 1 },
    { week: 2, homeTeamId: 'team_16', awayTeamId: 'team_10', homeScore: 2, awayScore: 1 },
    // Week 3
    { week: 3, homeTeamId: 'team_1', awayTeamId: 'team_9', homeScore: 2, awayScore: 2 },
    { week: 3, homeTeamId: 'team_3', awayTeamId: 'team_18', homeScore: 0, awayScore: 2 },
    { week: 3, homeTeamId: 'team_4', awayTeamId: 'team_7', homeScore: 1, awayScore: 1 },
    { week: 3, homeTeamId: 'team_5', awayTeamId: 'team_19', homeScore: 1, awayScore: 3 },
    { week: 3, homeTeamId: 'team_6', awayTeamId: 'team_11', homeScore: 3, awayScore: 0 },
    { week: 3, homeTeamId: 'team_8', awayTeamId: 'team_20', homeScore: 0, awayScore: 1 },
    { week: 3, homeTeamId: 'team_12', awayTeamId: 'team_2', homeScore: 3, awayScore: 0 },
    { week: 3, homeTeamId: 'team_13', awayTeamId: 'team_16', homeScore: 6, awayScore: 0 },
    { week: 3, homeTeamId: 'team_14', awayTeamId: 'team_17', homeScore: 3, awayScore: 2 },
    { week: 3, homeTeamId: 'team_15', awayTeamId: 'team_10', homeScore: 1, awayScore: 2 },
    // Week 4
    { week: 4, homeTeamId: 'team_1', awayTeamId: 'team_14', homeScore: 3, awayScore: 1 },
    { week: 4, homeTeamId: 'team_2', awayTeamId: 'team_5', homeScore: 2, awayScore: 1 },
    { week: 4, homeTeamId: 'team_7', awayTeamId: 'team_20', homeScore: 3, awayScore: 2 },
    { week: 4, homeTeamId: 'team_9', awayTeamId: 'team_13', homeScore: 1, awayScore: 5 },
    { week: 4, homeTeamId: 'team_10', awayTeamId: 'team_4', homeScore: 0, awayScore: 0 },
    { week: 4, homeTeamId: 'team_11', awayTeamId: 'team_12', homeScore: 0, awayScore: 3 },
    { week: 4, homeTeamId: 'team_16', awayTeamId: 'team_6', homeScore: 0, awayScore: 1 },
    { week: 4, homeTeamId: 'team_17', awayTeamId: 'team_3', homeScore: 0, awayScore: 1 },
    { week: 4, homeTeamId: 'team_18', awayTeamId: 'team_8', homeScore: 2, awayScore: 1 },
    { week: 4, homeTeamId: 'team_19', awayTeamId: 'team_15', homeScore: 2, awayScore: 0 },
    // Week 5
    { week: 5, homeTeamId: 'team_2', awayTeamId: 'team_7', homeScore: 3, awayScore: 1 },
    { week: 5, homeTeamId: 'team_3', awayTeamId: 'team_6', homeScore: 0, awayScore: 0 },
    { week: 5, homeTeamId: 'team_4', awayTeamId: 'team_16', homeScore: 1, awayScore: 1 },
    { week: 5, homeTeamId: 'team_5', awayTeamId: 'team_1', homeScore: 3, awayScore: 1 },
    { week: 5, homeTeamId: 'team_8', awayTeamId: 'team_11', homeScore: 2, awayScore: 2 },
    { week: 5, homeTeamId: 'team_12', awayTeamId: 'team_19', homeScore: 3, awayScore: 1 },
    { week: 5, homeTeamId: 'team_13', awayTeamId: 'team_17', homeScore: 4, awayScore: 0 },
    { week: 5, homeTeamId: 'team_14', awayTeamId: 'team_9', homeScore: 2, awayScore: 0 },
    { week: 5, homeTeamId: 'team_15', awayTeamId: 'team_18', homeScore: 2, awayScore: 2 },
    { week: 5, homeTeamId: 'team_20', awayTeamId: 'team_10', homeScore: 1, awayScore: 1 },
    // Week 6
    { week: 6, homeTeamId: 'team_1', awayTeamId: 'team_18', homeScore: 2, awayScore: 2 },
    { week: 6, homeTeamId: 'team_6', awayTeamId: 'team_2', homeScore: 0, awayScore: 1 },
    { week: 6, homeTeamId: 'team_7', awayTeamId: 'team_9', homeScore: 0, awayScore: 0 },
    { week: 6, homeTeamId: 'team_10', awayTeamId: 'team_13', homeScore: 0, awayScore: 2 },
    { week: 6, homeTeamId: 'team_11', awayTeamId: 'team_5', homeScore: 0, awayScore: 3 },
    { week: 6, homeTeamId: 'team_12', awayTeamId: 'team_8', homeScore: 2, awayScore: 0 },
    { week: 6, homeTeamId: 'team_14', awayTeamId: 'team_4', homeScore: 1, awayScore: 3 },
    { week: 6, homeTeamId: 'team_16', awayTeamId: 'team_3', homeScore: 1, awayScore: 1 },
    { week: 6, homeTeamId: 'team_17', awayTeamId: 'team_20', homeScore: 1, awayScore: 1 },
    { week: 6, homeTeamId: 'team_19', awayTeamId: 'team_15', homeScore: 1, awayScore: 1 },
    // Week 7
    { week: 7, homeTeamId: 'team_2', awayTeamId: 'team_5', homeScore: 6, awayScore: 1 },
    { week: 7, homeTeamId: 'team_3', awayTeamId: 'team_1', homeScore: 0, awayScore: 4 },
    { week: 7, homeTeamId: 'team_8', awayTeamId: 'team_11', homeScore: 3, awayScore: 0 },
    { week: 7, homeTeamId: 'team_9', awayTeamId: 'team_6', homeScore: 0, awayScore: 2 },
    { week: 7, homeTeamId: 'team_13', awayTeamId: 'team_20', homeScore: 2, awayScore: 1 },
    { week: 7, homeTeamId: 'team_14', awayTeamId: 'team_7', homeScore: 2, awayScore: 1 },
    { week: 7, homeTeamId: 'team_15', awayTeamId: 'team_4', homeScore: 2, awayScore: 0 },
    { week: 7, homeTeamId: 'team_16', awayTeamId: 'team_10', homeScore: 1, awayScore: 1 },
    { week: 7, homeTeamId: 'team_18', awayTeamId: 'team_12', homeScore: 2, awayScore: 1 },
    { week: 7, homeTeamId: 'team_19', awayTeamId: 'team_17', homeScore: 2, awayScore: 0 },
    // Week 8
    { week: 8, homeTeamId: 'team_1', awayTeamId: 'team_13', homeScore: 1, awayScore: 0 },
    { week: 8, homeTeamId: 'team_4', awayTeamId: 'team_8', homeScore: 1, awayScore: 1 },
    { week: 8, homeTeamId: 'team_5', awayTeamId: 'team_12', homeScore: 2, awayScore: 2 },
    { week: 8, homeTeamId: 'team_6', awayTeamId: 'team_15', homeScore: 2, awayScore: 2 },
    { week: 8, homeTeamId: 'team_7', awayTeamId: 'team_16', homeScore: 0, awayScore: 0 },
    { week: 8, homeTeamId: 'team_10', awayTeamId: 'team_9', homeScore: 1, awayScore: 3 },
    { week: 8, homeTeamId: 'team_11', awayTeamId: 'team_18', homeScore: 1, awayScore: 4 },
    { week: 8, homeTeamId: 'team_17', awayTeamId: 'team_2', homeScore: 0, awayScore: 1 },
    { week: 8, homeTeamId: 'team_19', awayTeamId: 'team_3', homeScore: 2, awayScore: 2 },
    { week: 8, homeTeamId: 'team_20', awayTeamId: 'team_14', homeScore: 2, awayScore: 1 },
    // Week 9
    { week: 9, homeTeamId: 'team_2', awayTeamId: 'team_19', homeScore: 4, awayScore: 1 },
    { week: 9, homeTeamId: 'team_3', awayTeamId: 'team_20', homeScore: 2, awayScore: 1 },
    { week: 9, homeTeamId: 'team_4', awayTeamId: 'team_11', homeScore: 2, awayScore: 0 },
    { week: 9, homeTeamId: 'team_5', awayTeamId: 'team_9', homeScore: 1, awayScore: 1 },
    { week: 9, homeTeamId: 'team_6', awayTeamId: 'team_1', homeScore: 2, awayScore: 2 },
    { week: 9, homeTeamId: 'team_8', awayTeamId: 'team_15', homeScore: 2, awayScore: 2 },
    { week: 9, homeTeamId: 'team_12', awayTeamId: 'team_16', homeScore: 3, awayScore: 0 },
    { week: 9, homeTeamId: 'team_13', awayTeamId: 'team_5', homeScore: 2, awayScore: 1 }, // Brighton double week
    { week: 9, homeTeamId: 'team_14', awayTeamId: 'team_17', homeScore: 2, awayScore: 1 },
    { week: 9, homeTeamId: 'team_18', awayTeamId: 'team_7', homeScore: 2, awayScore: 1 },
    // Week 10
    { week: 10, homeTeamId: 'team_1', awayTeamId: 'team_17', homeScore: 5, awayScore: 0 },
    { week: 10, homeTeamId: 'team_4', awayTeamId: 'team_19', homeScore: 3, awayScore: 2 },
    { week: 10, homeTeamId: 'team_7', awayTeamId: 'team_11', homeScore: 3, awayScore: 0 },
    { week: 10, homeTeamId: 'team_8', awayTeamId: 'team_5', homeScore: 1, awayScore: 1 },
    { week: 10, homeTeamId: 'team_9', awayTeamId: 'team_14', homeScore: 0, awayScore: 1 },
    { week: 10, homeTeamId: 'team_12', awayTeamId: 'team_10', homeScore: 3, awayScore: 0 },
    { week: 10, homeTeamId: 'team_13', awayTeamId: 'team_3', homeScore: 6, awayScore: 1 },
    { week: 10, homeTeamId: 'team_15', awayTeamId: 'team_20', homeScore: 2, awayScore: 2 },
    { week: 10, homeTeamId: 'team_16', awayTeamId: 'team_2', homeScore: 2, awayScore: 0 },
    { week: 10, homeTeamId: 'team_18', awayTeamId: 'team_6', homeScore: 1, awayScore: 4 },
    // Week 11
    { week: 11, homeTeamId: 'team_2', awayTeamId: 'team_9', homeScore: 3, awayScore: 1 },
    { week: 11, homeTeamId: 'team_3', awayTeamId: 'team_15', homeScore: 2, awayScore: 0 },
    { week: 11, homeTeamId: 'team_5', awayTeamId: 'team_17', homeScore: 1, awayScore: 1 },
    { week: 11, homeTeamId: 'team_6', awayTeamId: 'team_4', homeScore: 2, awayScore: 3 },
    { week: 11, homeTeamId: 'team_10', awayTeamId: 'team_7', homeScore: 2, awayScore: 2 },
    { week: 11, homeTeamId: 'team_11', awayTeamId: 'team_12', homeScore: 0, awayScore: 1 },
    { week: 11, homeTeamId: 'team_13', awayTeamId: 'team_8', homeScore: 3, awayScore: 0 },
    { week: 11, homeTeamId: 'team_14', awayTeamId: 'team_16', homeScore: 0, awayScore: 3 },
    { week: 11, homeTeamId: 'team_19', awayTeamId: 'team_1', homeScore: 3, awayScore: 1 },
    { week: 11, homeTeamId: 'team_20', awayTeamId: 'team_18', homeScore: 2, awayScore: 1 },
    // Week 12
    { week: 12, homeTeamId: 'team_1', awayTeamId: 'team_11', homeScore: 3, awayScore: 1 },
    { week: 12, homeTeamId: 'team_4', awayTeamId: 'team_20', homeScore: 1, awayScore: 0 },
    { week: 12, homeTeamId: 'team_7', awayTeamId: 'team_8', homeScore: 1, awayScore: 1 },
    { week: 12, homeTeamId: 'team_9', awayTeamId: 'team_17', homeScore: 3, awayScore: 2 },
    { week: 12, homeTeamId: 'team_12', awayTeamId: 'team_2', homeScore: 1, awayScore: 1 },
    { week: 12, homeTeamId: 'team_13', awayTeamId: 'team_14', homeScore: 3, awayScore: 0 },
    { week: 12, homeTeamId: 'team_15', awayTeamId: 'team_6', homeScore: 4, awayScore: 1 },
    { week: 12, homeTeamId: 'team_16', awayTeamId: 'team_5', homeScore: 2, awayScore: 3 },
    { week: 12, homeTeamId: 'team_18', awayTeamId: 'team_10', homeScore: 2, awayScore: 0 },
    { week: 12, homeTeamId: 'team_19', awayTeamId: 'team_3', homeScore: 1, awayScore: 2 },
    // Week 13
    { week: 13, homeTeamId: 'team_2', awayTeamId: 'team_10', homeScore: 2, awayScore: 0 },
    { week: 13, homeTeamId: 'team_3', awayTeamId: 'team_14', homeScore: 3, awayScore: 0 },
    { week: 13, homeTeamId: 'team_5', awayTeamId: 'team_7', homeScore: 1, awayScore: 1 },
    { week: 13, homeTeamId: 'team_6', awayTeamId: 'team_12', homeScore: 4, awayScore: 4 },
    { week: 13, homeTeamId: 'team_8', awayTeamId: 'team_16', homeScore: 1, awayScore: 0 },
    { week: 13, homeTeamId: 'team_11', awayTeamId: 'team_13', homeScore: 1, awayScore: 1 },
    { week: 13, homeTeamId: 'team_15', awayTeamId: 'team_1', homeScore: 1, awayScore: 0 },
    { week: 13, homeTeamId: 'team_17', awayTeamId: 'team_4', homeScore: 1, awayScore: 0 },
    { week: 13, homeTeamId: 'team_18', awayTeamId: 'team_19', homeScore: 1, awayScore: 2 },
    { week: 13, homeTeamId: 'team_20', awayTeamId: 'team_9', homeScore: 2, awayScore: 3 },
    // Week 14
    { week: 14, homeTeamId: 'team_1', awayTeamId: 'team_8', homeScore: 2, awayScore: 1 },
    { week: 14, homeTeamId: 'team_3', awayTeamId: 'team_2', homeScore: 2, awayScore: 2 },
    { week: 14, homeTeamId: 'team_4', awayTeamId: 'team_9', homeScore: 3, awayScore: 1 },
    { week: 14, homeTeamId: 'team_6', awayTeamId: 'team_5', homeScore: 3, awayScore: 2 },
    { week: 14, homeTeamId: 'team_7', awayTeamId: 'team_15', homeScore: 3, awayScore: 0 },
    { week: 14, homeTeamId: 'team_10', awayTeamId: 'team_11', homeScore: 3, awayScore: 2 },
    { week: 14, homeTeamId: 'team_12', awayTeamId: 'team_17', homeScore: 4, awayScore: 3 },
    { week: 14, homeTeamId: 'team_13', awayTeamId: 'team_18', homeScore: 3, awayScore: 3 },
    { week: 14, homeTeamId: 'team_14', awayTeamId: 'team_19', homeScore: 1, awayScore: 0 },
    { week: 14, homeTeamId: 'team_16', awayTeamId: 'team_20', homeScore: 1, awayScore: 2 },
    // Week 15
    { week: 15, homeTeamId: 'team_2', awayTeamId: 'team_13', homeScore: 1, awayScore: 0 },
    { week: 15, homeTeamId: 'team_5', awayTeamId: 'team_4', homeScore: 2, awayScore: 1 },
    { week: 15, homeTeamId: 'team_8', awayTeamId: 'team_6', homeScore: 2, awayScore: 0 },
    { week: 15, homeTeamId: 'team_9', awayTeamId: 'team_19', homeScore: 5, awayScore: 0 },
    { week: 15, homeTeamId: 'team_11', awayTeamId: 'team_16', homeScore: 1, awayScore: 1 },
    { week: 15, homeTeamId: 'team_14', awayTeamId: 'team_3', homeScore: 0, awayScore: 3 },
    { week: 15, homeTeamId: 'team_15', awayTeamId: 'team_10', homeScore: 3, awayScore: 0 },
    { week: 15, homeTeamId: 'team_17', awayTeamId: 'team_7', homeScore: 1, awayScore: 0 },
    { week: 15, homeTeamId: 'team_18', awayTeamId: 'team_1', homeScore: 1, awayScore: 2 },
    { week: 15, homeTeamId: 'team_20', awayTeamId: 'team_12', homeScore: 1, awayScore: 1 },
    // Week 16
    { week: 16, homeTeamId: 'team_1', awayTeamId: 'team_5', homeScore: 2, awayScore: 0 },
    { week: 16, homeTeamId: 'team_3', awayTeamId: 'team_11', homeScore: 1, awayScore: 1 },
    { week: 16, homeTeamId: 'team_4', awayTeamId: 'team_2', homeScore: 1, awayScore: 2 },
    { week: 16, homeTeamId: 'team_6', awayTeamId: 'team_17', homeScore: 2, awayScore: 0 },
    { week: 16, homeTeamId: 'team_7', awayTeamId: 'team_12', homeScore: 1, awayScore: 2 },
    { week: 16, homeTeamId: 'team_10', awayTeamId: 'team_8', homeScore: 3, awayScore: 0 },
    { week: 16, homeTeamId: 'team_13', awayTeamId: 'team_9', homeScore: 3, awayScore: 0 },
    { week: 16, homeTeamId: 'team_16', awayTeamId: 'team_18', homeScore: 1, awayScore: 3 },
    { week: 16, homeTeamId: 'team_19', awayTeamId: 'team_20', homeScore: 3, awayScore: 0 },
    { week: 16, homeTeamId: 'team_15', awayTeamId: 'team_14', homeScore: 1, awayScore: 0 },
    // Week 17
    { week: 17, homeTeamId: 'team_2', awayTeamId: 'team_18', homeScore: 2, awayScore: 1 },
    { week: 17, homeTeamId: 'team_3', awayTeamId: 'team_9', homeScore: 3, awayScore: 0 },
    { week: 17, homeTeamId: 'team_5', awayTeamId: 'team_13', homeScore: 1, awayScore: 1 },
    { week: 17, homeTeamId: 'team_8', awayTeamId: 'team_4', homeScore: 1, awayScore: 0 },
    { week: 17, homeTeamId: 'team_11', awayTeamId: 'team_7', homeScore: 3, awayScore: 2 },
    { week: 17, homeTeamId: 'team_12', awayTeamId: 'team_14', homeScore: 0, awayScore: 0 },
    { week: 17, homeTeamId: 'team_17', awayTeamId: 'team_1', homeScore: 0, awayScore: 2 },
    { week: 17, homeTeamId: 'team_19', awayTeamId: 'team_16', homeScore: 3, awayScore: 2 },
    { week: 17, homeTeamId: 'team_20', awayTeamId: 'team_6', homeScore: 2, awayScore: 1 },
    { week: 17, homeTeamId: 'team_15', awayTeamId: 'team_10', homeScore: 4, awayScore: 4 },
    // Week 18
    { week: 18, homeTeamId: 'team_1', awayTeamId: 'team_7', homeScore: 2, awayScore: 1 },
    { week: 18, homeTeamId: 'team_2', awayTeamId: 'team_11', homeScore: 2, awayScore: 2 },
    { week: 18, homeTeamId: 'team_4', awayTeamId: 'team_13', homeScore: 1, awayScore: 3 },
    { week: 18, homeTeamId: 'team_6', awayTeamId: 'team_3', homeScore: 3, awayScore: 2 },
    { week: 18, homeTeamId: 'team_8', awayTeamId: 'team_12', homeScore: 0, awayScore: 2 },
    { week: 18, homeTeamId: 'team_9', awayTeamId: 'team_15', homeScore: 1, awayScore: 2 },
    { week: 18, homeTeamId: 'team_10', awayTeamId: 'team_5', homeScore: 1, awayScore: 1 },
    { week: 18, homeTeamId: 'team_14', awayTeamId: 'team_2', homeScore: 2, awayScore: 2 }, // Villa double week
    { week: 18, homeTeamId: 'team_16', awayTeamId: 'team_17', homeScore: 1, awayScore: 2 },
    { week: 18, homeTeamId: 'team_18', awayTeamId: 'team_19', homeScore: 5, awayScore: 0 },
    // Weeks 19-38 with placeholder scores
    ...Array.from({ length: 20 * 10 }, (_, i) => ({
        week: 19 + Math.floor(i / 10),
        homeTeamId: 'team_1',
        awayTeamId: 'team_2',
        homeScore: -1,
        awayScore: -1
    }))
];

// --- CALCULATED DATA ---

type TeamStats = Omit<CurrentStanding, 'teamId' | 'rank'>;

function calculateStandings(matches: Match[], maxWeek: number): Map<string, TeamStats> {
    const stats: Map<string, TeamStats> = new Map();
    teams.forEach(team => {
        stats.set(team.id, {
            points: 0, gamesPlayed: 0, wins: 0, draws: 0, losses: 0,
            goalsFor: 0, goalsAgainst: 0, goalDifference: 0
        });
    });

    matches.filter(m => m.week <= maxWeek && m.homeScore !== -1).forEach(match => {
        const homeStats = stats.get(match.homeTeamId)!;
        const awayStats = stats.get(match.awayTeamId)!;

        homeStats.gamesPlayed++;
        awayStats.gamesPlayed++;
        homeStats.goalsFor += match.homeScore;
        awayStats.goalsFor += match.awayScore;
        homeStats.goalsAgainst += match.awayScore;
        awayStats.goalsAgainst += match.homeScore;
        homeStats.goalDifference = homeStats.goalsFor - homeStats.goalsAgainst;
        awayStats.goalDifference = awayStats.goalsFor - awayStats.goalsAgainst;

        if (match.homeScore > match.awayScore) {
            homeStats.wins++;
            homeStats.points += 3;
            awayStats.losses++;
        } else if (match.homeScore < match.awayScore) {
            awayStats.wins++;
            awayStats.points += 3;
            homeStats.losses++;
        } else {
            homeStats.draws++;
            awayStats.draws++;
            homeStats.points++;
            awayStats.points++;
        }
    });

    return stats;
}

function sortStandings(stats: Map<string, TeamStats>): CurrentStanding[] {
    const sorted = Array.from(stats.entries())
        .sort(([, a], [, b]) => {
            if (a.points !== b.points) return b.points - a.points;
            if (a.goalDifference !== b.goalDifference) return b.goalDifference - a.goalDifference;
            if (a.goalsFor !== b.goalsFor) return b.goalsFor - a.goalsFor;
            return 0; // Or sort by name if needed for tie-breaking
        })
        .map(([teamId, stat], index) => ({
            teamId,
            rank: index + 1,
            ...stat
        }));
    return sorted;
}

// Calculate final standings after week 18
const finalStatsMap = calculateStandings(matches, 18);
export const standings: CurrentStanding[] = sortStandings(finalStatsMap);
const finalTeamRanks = new Map(standings.map(s => [s.teamId, s.rank]));

// Calculate player scores based on week 18 standings
export const playerTeamScores: PlayerTeamScore[] = userList.flatMap(user => {
    const prediction = fullPredictions.find(p => p.userId === user.id);
    if (!prediction) return [];

    return teams.map(team => {
        const predictedRank = prediction.rankings.indexOf(team.id) + 1;
        const actualRank = finalTeamRanks.get(team.id) || 0;
        const score = actualRank > 0 && predictedRank > 0 ? 5 - Math.abs(predictedRank - actualRank) : 0;
        return { userId: user.id, teamId: team.id, score };
    });
});

const userTotalScores = userList.map(user => {
    const totalScore = playerTeamScores
        .filter(s => s.userId === user.id)
        .reduce((sum, s) => sum + s.score, 0);
    return { userId: user.id, totalScore };
});

// Calculate weekly standings and user histories
export const weeklyTeamStandings: WeeklyTeamStanding[] = [];
export const fullUserHistories: UserHistory[] = userList.map(u => ({ userId: u.id, weeklyScores: [] }));

for (let week = 1; week <= 18; week++) {
    const weeklyStats = calculateStandings(matches, week);
    const weeklySorted = sortStandings(weeklyStats);
    
    weeklySorted.forEach(standing => {
        weeklyTeamStandings.push({ week, teamId: standing.teamId, rank: standing.rank });
    });

    const weeklyTeamRanks = new Map(weeklySorted.map(s => [s.teamId, s.rank]));

    const weeklyUserScores = userList.map(user => {
        const prediction = fullPredictions.find(p => p.userId === user.id)!;
        const weeklyScore = prediction.rankings.reduce((total, teamId, index) => {
            const predictedRank = index + 1;
            const actualRank = weeklyTeamRanks.get(teamId) || 0;
            const score = actualRank > 0 ? 5 - Math.abs(predictedRank - actualRank) : 0;
            return total + score;
        }, 0);
        return { userId: user.id, score: weeklyScore };
    }).sort((a,b) => b.score - a.score);

    let currentRank = 0;
    let lastScore = Infinity;
    weeklyUserScores.forEach((userScore, index) => {
        if (userScore.score < lastScore) {
            currentRank = index + 1;
            lastScore = userScore.score;
        }
        const userHistory = fullUserHistories.find(h => h.userId === userScore.userId)!;
        userHistory.weeklyScores.push({ week, score: userScore.score, rank: currentRank });
    });
}


export const fullUsers: User[] = userList.map((user, i) => {
    const history = fullUserHistories.find(h => h.userId === user.id)?.weeklyScores || [];
    const week18 = history.find(s => s.week === 18) || { score: 0, rank: 0 };
    const week17 = history.find(s => s.week === 17) || { score: 0, rank: 0 };

    const allScores = history.map(s => s.score);
    const allRanks = history.map(s => s.rank).filter(r => r > 0);

    return {
        id: user.id,
        name: user.name,
        avatar: `${(i % 50) + 1}`,
        score: week18.score,
        rank: week18.rank,
        previousRank: week17.rank,
        previousScore: week17.score,
        rankChange: week17.rank - week18.rank,
        scoreChange: week18.score - week17.score,
        maxRank: allRanks.length > 0 ? Math.min(...allRanks) : 0,
        minRank: allRanks.length > 0 ? Math.max(...allRanks) : 0,
        maxScore: allScores.length > 0 ? Math.max(...allScores) : 0,
        minScore: allScores.length > 0 ? Math.min(...allScores) : 0,
        isPro: ['BBC', 'SKY', 'OPTA'].includes(user.name),
        email: `${user.name.toLowerCase().replace(/ /g, '.')}@example.com`,
        joinDate: new Date(2024, 7, 1).toISOString()
    };
}).sort((a, b) => a.rank - b.rank);


export const teamRecentResults: TeamRecentResult[] = teams.map(team => {
    const results: ('W' | 'D' | 'L' | '-')[] = [];
    for (let week = 18; week > 12; week--) {
        const teamMatches = matches.filter(m => m.week === week && (m.homeTeamId === team.id || m.awayTeamId === team.id));
        if (teamMatches.length === 0) {
            results.unshift('-');
            continue;
        }
        const match = teamMatches[0];
        if (match.homeTeamId === team.id) {
            if (match.homeScore > match.awayScore) results.unshift('W');
            else if (match.homeScore < match.awayScore) results.unshift('L');
            else results.unshift('D');
        } else {
            if (match.awayScore > match.homeScore) results.unshift('W');
            else if (match.awayScore < match.homeScore) results.unshift('L');
            else results.unshift('D');
        }
    }
    return { teamId: team.id, results };
});


export const seasonMonths: SeasonMonth[] = [
    { id: 'sm_1', month: 'August', year: 2025, abbreviation: 'AUG' },
    { id: 'sm_2', month: 'September', year: 2025, abbreviation: 'SEP' },
    { id: 'sm_3', month: 'October', year: 2025, abbreviation: 'OCT' },
    { id: 'sm_4', month: 'November', year: 2025, abbreviation: 'NOV' },
    { id: 'sm_5', month: 'December', year: 2025, abbreviation: 'DEC' },
    { id: 'sm_xmas', month: 'December', year: 2025, abbreviation: 'XMAS', special: 'Christmas No. 1' },
    { id: 'sm_6', month: 'January', year: 2026, abbreviation: 'JAN' },
    { id: 'sm_7', month: 'February', year: 2026, abbreviation: 'FEB' },
    { id: 'sm_8', month: 'March', year: 2026, abbreviation: 'MAR' },
    { id: 'sm_9', month: 'April', year: 2026, abbreviation: 'APR' },
    { id: 'sm_10', month: 'May', year: 2026, abbreviation: 'MAY' }
];

export const monthlyMimoM: MonthlyMimoM[] = [
    // This would be calculated by a backend process based on rank changes.
    // Example:
    // { id: 'mimo_1', month: 'August', year: 2025, userId: 'usr_50', type: 'winner' },
];


// Final exports for the app
export const users: User[] = fullUsers;
export const predictions: Prediction[] = fullPredictions;
export const userHistories: UserHistory[] = fullUserHistories;
