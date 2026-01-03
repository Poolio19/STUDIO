
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

const generateInitialUserData = (user: { id: string; name: string }, index: number): User => {
    const rank = index + 1;
    const score = Math.floor(50 - (rank * 2.5));
    return {
        id: user.id,
        name: user.name,
        avatar: `${(index % 50) + 1}`,
        score: score,
        rank: rank,
        previousRank: rank,
        previousScore: score,
        maxRank: rank,
        minRank: rank,
        maxScore: score,
        minScore: score,
        rankChange: 0,
        scoreChange: 0,
        isPro: false,
        email: `${user.name.toLowerCase().replace(/ /g, '.')}@example.com`,
        joinDate: new Date().toISOString()
    };
};

const userList = [
    { id: 'usr_1', name: 'Alex Anderson' },
    { id: 'usr_2', name: 'Maria Garcia' },
    { id: 'usr_3', name: 'David Smith' },
    { id: 'usr_4', name: 'Sophia Johnson' },
    { id: 'usr_5', name: 'Kenji Tanaka' },
    { id: 'usr_6', name: 'Fatima Ahmed' },
    { id: 'usr_7', name: 'Leo Rossi' },
    { id: 'usr_8', name: 'Chloe Dubois' },
    { id: 'usr_9', name: 'Mohammed Ali' },
    { id: 'usr_10', name: 'Isabella Johansson' },
    { id: 'usr_11', name: 'James Wilson' },
    { id: 'usr_12', name: 'Amelia Brown' },
    { id: 'usr_13', name: 'Benjamin Green' },
    { id: 'usr_14', name: 'Mia Taylor' },
    { id: 'usr_15', name: 'Elijah Moore' },
    { id: 'usr_16', name: 'Harper King' },
    { id: 'usr_17', name: 'Lucas White' },
    { id: 'usr_18', name: 'Evelyn Harris' },
    { id: 'usr_19', name: 'Henry Clark' },
    { id: 'usr_20', name: 'Abigail Lewis' },
    { id: 'usr_21', name: 'Alexander Walker' },
    { id: 'usr_22', name: 'Emily Hall' },
    { id: 'usr_23', name: 'Daniel Young' },
    { id: 'usr_24', name: 'Elizabeth Allen' },
    { id: 'usr_25', name: 'Michael Wright' },
    { id: 'usr_26', name: 'Sofia Scott' },
    { id: 'usr_27', name: 'Matthew Adams' },
    { id: 'usr_28', name: 'Avery Baker' },
    { id: 'usr_29', name: 'Joseph Nelson' },
    { id: 'usr_30', name: 'Scarlett Carter' },
    { id: 'usr_31', name: 'William Mitchell' },
    { id: 'usr_32', name: 'Grace Perez' },
    { id: 'usr_33', name: 'Owen Roberts' },
    { id: 'usr_34', name: 'Zoe Turner' },
    { id: 'usr_35', name: 'Nathan Phillips' },
    { id: 'usr_36', name: 'Lily Campbell' },
    { id: 'usr_37', name: 'Ryan Parker' },
    { id: 'usr_38', name: 'Hannah Evans' },
    { id: 'usr_39', name: 'Caleb Edwards' },
    { id: 'usr_40', name: 'Nora Collins' },
    { id: 'usr_41', name: 'Isaac Stewart' },
    { id: 'usr_42', name: 'Addison Sanchez' },
    { id: 'usr_43', name: 'Levi Morris' },
    { id: 'usr_44', name: 'Stella Rogers' },
    { id: 'usr_45', name: 'Samuel Reed' },
    { id: 'usr_46', name: 'Natalie Cook' },
    { id: 'usr_47', name: 'BBC' },
    { id: 'usr_48', name: 'SKY' },
    { id: 'usr_49', name: 'OPTA' },
    { id: 'usr_50', name: 'Tony Jones' },
    { id: 'usr_51', name: 'Laura Bailey' },
    { id: 'usr_52', name: 'Chris Wood' },
    { id: 'usr_53', name: 'Rachel Murphy' },
    { id: 'usr_54', name: 'Mark Rivera' },
    { id: 'usr_55', name: 'Jessica Long' },
    { id: 'usr_56', name: 'Brian Hughes' },
    { id: 'usr_57', name: 'Sarah Foster' },
    { id: 'usr_58', name: 'Kevin Butler' },
    { id: 'usr_59', name: 'Angela Simmons' },
    { id: 'usr_60', name: 'Steven Powell' },
    { id: 'usr_61', name: 'Kimberly Richardson' },
    { id: 'usr_62', name: 'Paul Cox' },
    { id: 'usr_63', name: 'Donna Howard' },
    { id: 'usr_64', name: 'George Ward' },
    { id: 'usr_65', name: 'Helen Peterson' },
    { id: 'usr_66', name: 'Gary Gray' },
    { id: 'usr_67', 'name': 'Brenda James' },
    { id: 'usr_68', 'name': 'Larry Watson' },
    { id: 'usr_69', 'name': 'Nicole Brooks' },
    { id: 'usr_70', 'name': 'Justin Kelly' },
    { id: 'usr_71', 'name': 'Janet Sanders' },
    { id: 'usr_72', 'name': 'Jerry Price' },
    { id: 'usr_73', 'name': 'Ashley Bennett' },
    { id: 'usr_74', 'name': 'Scott Henderson' },
    { id: 'usr_75', 'name': 'Rebecca Barnes' },
    { id: 'usr_76', 'name': 'Dennis Ross' },
    { id: 'usr_77', 'name': 'Amanda Henderson' },
    { id: 'usr_78', 'name': 'Keith Coleman' },
    { id: 'usr_79', 'name': 'Cynthia Jenkins' },
    { id: 'usr_80', 'name': 'Douglas Perry' },
    { id: 'usr_81', 'name': 'Frances Patterson' },
    { id: 'usr_82', 'name': 'Peter Griffin' },
    { id: 'usr_83', 'name': 'Ruth Jordan' },
    { id: 'usr_84', 'name': 'Carl Graham' },
    { id: 'usr_85', 'name': 'Katherine Hamilton' },
    { id: 'usr_86', 'name': 'Arthur Wallace' },
    { id: 'usr_87', 'name': 'Teresa Woods' },
    { id: 'usr_88', 'name': 'Walter Cole' },
    { id: 'usr_89', 'name': 'Joan West' },
    { id: 'usr_90', 'name': 'Wayne Snyder' },
    { id: 'usr_91', 'name': 'Alice Fox' },
    { id: 'usr_92', 'name': 'Billy Larson' },
    { id: 'usr_93', 'name': 'Diana Stone' },
    { id: 'usr_94', 'name': 'Randy Meyer' },
    { id: 'usr_95', 'name': 'Denise Franklin' },
    { id: 'usr_96', 'name': 'Frank Warren' },
    { id: 'usr_97', 'name': 'Julia Ray' },
    { id: 'usr_98', 'name': 'Philip Lawson' },
    { id: 'usr_99', 'name': 'Marie Fields' },
    { id: 'usr_100', 'name': 'Louis Ortiz' },
    { id: 'usr_101', 'name': 'Sara Gordon' },
    { id: 'usr_102', 'name': 'Roy Stephens' },
    { id: 'usr_103', 'name': 'Ann Simpson' },
    { id: 'usr_104', 'name': 'Patrick Austin' },
    { id: 'usr_105', 'name': 'Jacqueline Porter' },
    { id: 'usr_106', 'name': 'Bobby Spencer' },
    { id: 'usr_107', 'name': 'Beverly Carroll' },
    { id: 'usr_108', 'name': 'Harry Armstrong' },
    { id: 'usr_109', 'name': 'Doris Daniels' }
];


export const fullUsers: User[] = userList.map(generateInitialUserData);

const defaultPrediction = ["team_13", "team_1", "team_12", "team_6", "team_2", "team_18", "team_15", "team_19", "team_7", "team_5", "team_20", "team_9", "team_8", "team_3", "team_4", "team_16", "team_17", "team_11", "team_10", "team_14"];

export const fullPredictions: Prediction[] = fullUsers.map(user => ({
    userId: user.id,
    rankings: defaultPrediction,
}));

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

export const playerTeamScores: PlayerTeamScore[] = fullUsers.flatMap(user => 
    teams.map(team => ({
        userId: user.id,
        teamId: team.id,
        score: 0 
    }))
);

export const weeklyTeamStandings: WeeklyTeamStanding[] = [];

export const teamRecentResults: TeamRecentResult[] = teams.map(team => ({
    teamId: team.id,
    results: ['-', '-', '-', '-', '-', '-']
}));

// Export all data for the app to use
export const users: User[] = fullUsers;
export const predictions: Prediction[] = fullPredictions;
export const userHistories: UserHistory[] = fullUserHistories;
