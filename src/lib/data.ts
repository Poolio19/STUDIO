
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
    { id: 'team_18', name: 'Tottenham', logo: 'home', bgColourFaint: 'rgba(19, 34, 83, 0.3)', bgColourSolid: '#132257', textColour: '#FFFFFF', iconColour: '#FFFFFF' },
    { id: 'team_19', name: 'West Ham', logo: 'hammer', bgColourFaint: 'rgba(122, 38, 58, 0.3)', bgColourSolid: '#7A263A', textColour: '#FBE122', iconColour: '#FBE122' },
    { id: 'team_20', name: 'Wolves', logo: 'flower', bgColourFaint: 'rgba(253, 190, 17, 0.3)', bgColourSolid: '#FDBE11', textColour: '#000000', iconColour: '#000000' }
];

const teamNameMapping: { [key: string]: string } = {
    'Arsenal': 'team_1', 'Aston Villa': 'team_2', 'Bournemouth': 'team_3', 'Brentford': 'team_4',
    'Brighton': 'team_5', 'Chelsea': 'team_6', 'Crystal Palace': 'team_7', 'Everton': 'team_8',
    'Fulham': 'team_9', 'Ipswich Town': 'team_10', 'Leicester City': 'team_11',
    'Liverpool': 'team_12', 'Man City': 'team_13', 'Man Utd': 'team_14', 'Newcastle': 'team_15',
    'Notts Forest': 'team_16', 'Southampton': 'team_17', 'Tottenham': 'team_18', 'Spurs': 'team_18',
    'West Ham': 'team_19', 'Wolves': 'team_20', 'Ipswich': 'team_10', 'Leicester': 'team_11'
};


const userList = [
    { id: 'usr_1', name: 'Thomas Wright' }, { id: 'usr_2', name: 'Barrie Cross' },
    { id: 'usr_3', name: 'Dave Nightingale' }, { id: 'usr_4', name: 'Pip Stokes' },
    { id: 'usr_5', name: 'Alex Anderson' }, { id: 'usr_6', name: 'Nat Walsh' },
    { id: 'usr_7', name: 'Patrick Meese' }, { id: 'usr_8', name: 'Lee Harte' },
    { id: 'usr_9', name: 'Jim Poole' }, { id: 'usr_10', name: 'Lyndon Padmore' },
    { id: 'usr_11', name: 'Alf Mangor Wroldsen' }, { id: 'usr_12', name: 'Steve Wroldsen' },
    { id: 'usr_13', name: 'Roger Wymer' }, { id: 'usr_14', name: 'Mike Wymer' },
    { id: 'usr_15', name: 'Andy Belton' }, { id: 'usr_16', name: 'Ernest Belton' },
    { id: 'usr_17', name: 'Tim Birchall' }, { id: 'usr_18', name: 'Nathan Hyatt' },
    { id: 'usr_19', name: 'Rory Hyatt' }, { id: 'usr_20', name: 'Gazza Littlewood' },
    { id: 'usr_21', name: 'Fazil Sediqi' }, { id: 'usr_22', name: 'Shuhra Sediqi' },
    { id: 'usr_23', name: 'Ilyas Taj Sediqi' }, { id: 'usr_24', name: 'Eshwa Sediqi' },
    { id: 'usr_25', name: 'Ben Fellows' }, { id: 'usr_26', name: 'Michelle Duffy-Turner' },
    { id: 'usr_27', name: 'Nicola Spears' }, { id: 'usr_28', name: 'Jamie Spears' },
    { id: 'usr_29', name: 'Jonny Taylor' }, { id: 'usr_30', name: 'John Taylor' },
    { id: 'usr_31', name: 'Sam Dixon' }, { id: 'usr_32', name: 'Doug Potter' },
    { id: 'usr_33', name: 'Finlay Sinclair' }, { id: 'usr_34', name: 'YOUR NAME HERE' },
    { id: 'usr_35', name: 'Aidan Kehoe' }, { id: 'usr_36', name: 'Ben Patey' },
    { id: 'usr_37', name: 'Theo Gresson' }, { id: 'usr_38', name: 'Adam Barclay' },
    { id: 'usr_39', name: 'James Eldred' }, { id: 'usr_40', name: 'Otis Eldred' },
    { id: 'usr_41', name: 'Dan Coles' }, { id: 'usr_42', name: 'Daniel Crick' },
    { id: 'usr_43', name: 'Sheila McKenzie' }, { id: 'usr_44', name: 'Chris Dodds' },
    { id: 'usr_45', name: 'Rich Seddon' }, { id: 'usr_46', name: 'Ross Allatt' },
    { id: 'usr_47', name: 'Neville Johnson' }, { id: 'usr_48', name: 'Julian Spears' },
    { id: 'usr_49', name: 'Andrew Spears' }, { id: 'usr_50', name: 'Danny Broom' },
    { id: 'usr_51', name: 'Paul Hammett' }, { id: 'usr_52', name: 'Tom Gill' },
    { id: 'usr_53', name: 'Ronnie Bain' }, { id: 'usr_54', name: 'Matthew Bain' },
    { id: 'usr_55', name: 'Sam Bain' }, { id: 'usr_56', name: 'Andy Barnes' },
    { id: 'usr_57', name: 'Pascal Walls' }, { id: 'usr_58', name: 'Steve Lawrence' },
    { id: 'usr_59', name: 'Gill Butler' }, { id: 'usr_60', name: 'Tom Coles' },
    { id: 'usr_61', name: 'Tommy Poole' }, { id: 'usr_62', 'name': 'Eddie Spencer' },
    { id: 'usr_63', name: 'Rory Poole' }, { id: 'usr_64', name: 'Scott Emmett' },
    { id: 'usr_65', name: 'Craig Temporal' }, { id: 'usr_66', name: 'Andrew Senior' },
    { id: 'usr_67', name: 'Dan Brown' }, { id: 'usr_68', name: 'Rupert Massey' },
    { id: 'usr_69', name: 'Matt Howard' }, { id: 'usr_70', name: 'Justin Downing' },
    { id: 'usr_71', name: 'Sam Burgess' }, { id: 'usr_72', name: 'George John Roberts' },
    { id: 'usr_73', name: 'Leyton Collings' }, { id: 'usr_74', name: 'Ben Cox' },
    { id: 'usr_75', name: 'Adam F Bain' }, { id: 'usr_76', name: 'Amy Parkinson' },
    { id: 'usr_77', name: 'Steven Bain' }, { id: 'usr_78', name: 'Ian Scotland' },
    { id: 'usr_79', name: 'Benjamin Dawes' }, { id: 'usr_80', name: 'Tom Bywater' },
    { id: 'usr_81', name: 'Jack Murray' }, { id: 'usr_82', name: 'Rob Mabon' },
    { id: 'usr_83', name: 'Andrew Trafford' }, { id: 'usr_84', name: 'Luca Trafford' },
    { id: 'usr_85', name: 'Craig Stevens' }, { id: 'usr_86', name: 'George Butterworth' },
    { id: 'usr_87', name: 'Ashley Davies' }, { id: 'usr_88', name: 'Duncan Holder' },
    { id: 'usr_89', name: 'Arthur Davies' }, { id: 'usr_90', name: 'Paul Stonier' },
    { id: 'usr_91', name: 'Jember Weekes' }, { id: 'usr_92', name: 'Tom Kehoe' },
    { id: 'usr_93', name: 'Chris Burston' }, { id: 'usr_94', name: 'Malcolm Sinclair' },
    { id: 'usr_95', name: 'Dan Parkinson' }, { id: 'usr_96', name: 'Alfie Skingley' },
    { id: 'usr_97', name: 'Bev Skingley' }, { id: 'usr_98', name: 'Daniel Skingley' },
    { id: 'usr_99', name: 'Ken Skingley' }, { id: 'usr_100', name: 'Lyndsey Preece' },
    { id: 'usr_101', name: 'Kane Sullivan' }, { id: 'usr_102', name: 'Graeme Bailie' },
    { id: 'usr_103', name: 'Dan Dawson' }, { id: 'usr_104', name: 'THE MSN' },
    { id: 'usr_105', name: 'THE A.I.' }, { id: 'usr_106', name: 'THE SUPERCOMPUTER' }
].map(u => ({ ...u, name: u.name.toUpperCase() }));

const proUsers = ['THE MSN', 'THE A.I.', 'THE SUPERCOMPUTER'];

userList.forEach(user => {
    if (!proUsers.includes(user.name)) {
        user.name = user.name.replace(/\b\w/g, l => l.toUpperCase()).replace(/\B[A-Z]/g, l => l.toLowerCase());
    }
});


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
    { teamId: 'team_11', rank: 18, points: 31, goalDifference: -13 },
    { teamId: 'team_10', rank: 19, points: 28, goalDifference: -33 },
    { teamId: 'team_17', rank: 20, points: 25, goalDifference: -37 }
];

const userPredictionsRaw: { [key: string]: string[] } = {
  "usr_1": ["Man Utd", "Liverpool", "Man City", "Arsenal", "Newcastle", "Chelsea", "Aston Villa", "Notts Forest", "Tottenham", "Bournemouth", "Brighton", "Fulham", "Brentford", "Ipswich", "Crystal Palace", "West Ham", "Wolves", "Everton", "Leicester", "Southampton"],
  "usr_2": ["Liverpool", "Man City", "Arsenal", "Chelsea", "Aston Villa", "Newcastle", "Notts Forest", "Crystal Palace", "Brighton", "Man Utd", "Tottenham", "Bournemouth", "Brentford", "Fulham", "Everton", "Ipswich", "Wolves", "West Ham", "Leicester", "Southampton"],
  "usr_3": ["Liverpool", "Arsenal", "Man City", "Chelsea", "Newcastle", "Man Utd", "Aston Villa", "Tottenham", "Brighton", "Bournemouth", "Notts Forest", "Everton", "Crystal Palace", "Fulham", "West Ham", "Brentford", "Wolves", "Ipswich", "Leicester", "Southampton"],
  "usr_4": ["Liverpool", "Man City", "Chelsea", "Arsenal", "Aston Villa", "Newcastle", "Brighton", "Tottenham", "Notts Forest", "Fulham", "Man Utd", "Bournemouth", "Everton", "Crystal Palace", "Wolves", "West Ham", "Brentford", "Ipswich", "Leicester", "Southampton"],
  "usr_5": ["Chelsea", "Man City", "Liverpool", "Arsenal", "Aston Villa", "Newcastle", "Tottenham", "Brighton", "Man Utd", "Fulham", "Bournemouth", "Brentford", "Ipswich", "Everton", "Crystal Palace", "Wolves", "West Ham", "Notts Forest", "Leicester", "Southampton"],
  "usr_6": ["Chelsea", "Man City", "Liverpool", "Arsenal", "Newcastle", "Man Utd", "Everton", "Aston Villa", "Crystal Palace", "Brighton", "Notts Forest", "Ipswich", "West Ham", "Southampton", "Tottenham", "Wolves", "Bournemouth", "Fulham", "Brentford", "Leicester"],
  "usr_7": ["Man City", "Liverpool", "Arsenal", "Chelsea", "Newcastle", "Aston Villa", "Tottenham", "Man Utd", "Bournemouth", "Notts Forest", "Fulham", "Brighton", "Wolves", "Crystal Palace", "West Ham", "Ipswich", "Everton", "Brentford", "Southampton", "Leicester"],
  "usr_8": ["Liverpool", "Man City", "Arsenal", "Chelsea", "Aston Villa", "Man Utd", "Tottenham", "Newcastle", "Bournemouth", "Brighton", "Everton", "West Ham", "Fulham", "Crystal Palace", "Wolves", "Notts Forest", "Brentford", "Ipswich", "Southampton", "Leicester"],
  "usr_9": ["Liverpool", "Man City", "Arsenal", "Chelsea", "Aston Villa", "Newcastle", "Tottenham", "Man Utd", "Notts Forest", "Everton", "Brighton", "Brentford", "West Ham", "Bournemouth", "Fulham", "Crystal Palace", "Wolves", "Leicester", "Ipswich", "Southampton"],
  "usr_10": ["Man City", "Liverpool", "Arsenal", "Chelsea", "Tottenham", "Man Utd", "Aston Villa", "Newcastle", "West Ham", "Everton", "Brighton", "Wolves", "Brentford", "Fulham", "Crystal Palace", "Bournemouth", "Notts Forest", "Ipswich", "Leicester", "Southampton"],
  "usr_11": ["Man City", "Liverpool", "Arsenal", "Chelsea", "Aston Villa", "Man Utd", "Tottenham", "Newcastle", "Everton", "Brighton", "Crystal Palace", "Fulham", "West Ham", "Brentford", "Bournemouth", "Notts Forest", "Southampton", "Wolves", "Leicester", "Ipswich"],
  "usr_12": ["Man City", "Arsenal", "Liverpool", "Chelsea", "Aston Villa", "Newcastle", "Brentford", "Bournemouth", "Notts Forest", "Brighton", "Crystal Palace", "Everton", "Man Utd", "Tottenham", "Fulham", "West Ham", "Wolves", "Southampton", "Leicester", "Ipswich"],
  "usr_13": ["Liverpool", "Man City", "Arsenal", "Newcastle", "Man Utd", "Chelsea", "Tottenham", "Everton", "Aston Villa", "West Ham", "Crystal Palace", "Brighton", "Fulham", "Brentford", "Notts Forest", "Wolves", "Bournemouth", "Southampton", "Ipswich", "Leicester"],
  "usr_14": ["Liverpool", "Arsenal", "Newcastle", "Chelsea", "Man City", "Man Utd", "Tottenham", "Aston Villa", "Everton", "Bournemouth", "Brighton", "West Ham", "Fulham", "Crystal Palace", "Southampton", "Wolves", "Brentford", "Notts Forest", "Ipswich", "Leicester"],
  "usr_15": ["Liverpool", "Chelsea", "Man City", "Arsenal", "Aston Villa", "Man Utd", "Newcastle", "Tottenham", "West Ham", "Brighton", "Notts Forest", "Everton", "Fulham", "Crystal Palace", "Wolves", "Bournemouth", "Southampton", "Brentford", "Leicester", "Ipswich"],
  "usr_16": ["Man City", "Liverpool", "Arsenal", "Chelsea", "Man Utd", "Aston Villa", "Newcastle", "Tottenham", "Notts Forest", "Bournemouth", "Crystal Palace", "Everton", "Brighton", "West Ham", "Brentford", "Wolves", "Fulham", "Ipswich", "Leicester", "Southampton"],
  "usr_17": ["Liverpool", "Man City", "Arsenal", "Chelsea", "Brighton", "Notts Forest", "Man Utd", "Tottenham", "Fulham", "Crystal Palace", "Everton", "Aston Villa", "West Ham", "Newcastle", "Ipswich", "Wolves", "Bournemouth", "Brentford", "Southampton", "Leicester"],
  "usr_18": ["Liverpool", "Arsenal", "Man City", "Chelsea", "Newcastle", "Man Utd", "Aston Villa", "Tottenham", "Notts Forest", "Brighton", "Bournemouth", "Crystal Palace", "Everton", "Wolves", "Fulham", "West Ham", "Brentford", "Ipswich", "Southampton", "Leicester"],
  "usr_19": ["Arsenal", "Liverpool", "Chelsea", "Man City", "Aston Villa", "Notts Forest", "Newcastle", "Brighton", "Bournemouth", "Tottenham", "Brentford", "Fulham", "Man Utd", "Everton", "West Ham", "Crystal Palace", "Wolves", "Ipswich", "Southampton", "Leicester"],
  "usr_20": ["Liverpool", "Arsenal", "Chelsea", "Man City", "Aston Villa", "Man Utd", "Newcastle", "Crystal Palace", "Notts Forest", "Brighton", "Bournemouth", "Everton", "Tottenham", "Brentford", "Fulham", "West Ham", "Wolves", "Ipswich", "Leicester", "Southampton"],
  "usr_21": ["Liverpool", "Arsenal", "Man City", "Man Utd", "Chelsea", "Aston Villa", "Tottenham", "Newcastle", "Crystal Palace", "Brighton", "Notts Forest", "Bournemouth", "Brentford", "Everton", "West Ham", "Fulham", "Wolves", "Ipswich", "Leicester", "Southampton"],
  "usr_22": ["Liverpool", "Man City", "Chelsea", "Arsenal", "Aston Villa", "Bournemouth", "Man Utd", "Newcastle", "Crystal Palace", "Brighton", "Notts Forest", "Fulham", "Brentford", "West Ham", "Everton", "Tottenham", "Wolves", "Leicester", "Ipswich", "Southampton"],
  "usr_23": ["Arsenal", "Man City", "Liverpool", "Newcastle", "Chelsea", "Notts Forest", "Man Utd", "Tottenham", "Wolves", "Fulham", "West Ham", "Crystal Palace", "Brentford", "Brighton", "Everton", "Bournemouth", "Ipswich", "Aston Villa", "Southampton", "Leicester"],
  "usr_24": ["Liverpool", "Man City", "Arsenal", "Chelsea", "Newcastle", "Everton", "Bournemouth", "Aston Villa", "Brighton", "Notts Forest", "Crystal Palace", "Fulham", "Man Utd", "West Ham", "Wolves", "Tottenham", "Ipswich", "Brentford", "Southampton", "Leicester"],
  "usr_25": ["Arsenal", "Man City", "Liverpool", "Chelsea", "Man Utd", "Aston Villa", "Crystal Palace", "Newcastle", "Tottenham", "Brighton", "Everton", "Bournemouth", "Notts Forest", "Brentford", "Fulham", "West Ham", "Wolves", "Ipswich", "Leicester", "Southampton"],
  "usr_26": ["Chelsea", "Man City", "Liverpool", "Arsenal", "Aston Villa", "Newcastle", "Everton", "Bournemouth", "Man Utd", "Crystal Palace", "Brighton", "Tottenham", "Notts Forest", "West Ham", "Fulham", "Wolves", "Ipswich", "Brentford", "Southampton", "Leicester"],
  "usr_27": ["Chelsea", "Liverpool", "Man City", "Arsenal", "Aston Villa", "Newcastle", "Tottenham", "Man Utd", "Notts Forest", "Brighton", "Brentford", "Ipswich", "Everton", "Bournemouth", "Crystal Palace", "Fulham", "Leicester", "West Ham", "Southampton", "Wolves"],
  "usr_28": ["Liverpool", "Chelsea", "Arsenal", "Notts Forest", "Man City", "Bournemouth", "Newcastle", "Tottenham", "Wolves", "Aston Villa", "Brighton", "Everton", "Crystal Palace", "Man Utd", "West Ham", "Fulham", "Ipswich", "Leicester", "Brentford", "Southampton"],
  "usr_29": ["Liverpool", "Arsenal", "Man City", "Chelsea", "Aston Villa", "Newcastle", "Tottenham", "Man Utd", "Brighton", "Notts Forest", "Everton", "Bournemouth", "Crystal Palace", "Fulham", "West Ham", "Brentford", "Wolves", "Ipswich", "Southampton", "Leicester"],
  "usr_30": ["Man City", "Arsenal", "Liverpool", "Chelsea", "Newcastle", "Aston Villa", "Tottenham", "Man Utd", "Crystal Palace", "Fulham", "Notts Forest", "Brighton", "Bournemouth", "Everton", "West Ham", "Ipswich", "Wolves", "Brentford", "Leicester", "Southampton"],
  "usr_31": ["Liverpool", "Man City", "Arsenal", "Chelsea", "Tottenham", "Aston Villa", "Newcastle", "Brighton", "Man Utd", "Crystal Palace", "Everton", "West Ham", "Notts Forest", "Bournemouth", "Wolves", "Fulham", "Ipswich", "Brentford", "Leicester", "Southampton"],
  "usr_32": ["Liverpool", "Man City", "Arsenal", "Chelsea", "Aston Villa", "Newcastle", "Man Utd", "Tottenham", "Notts Forest", "Brighton", "Everton", "Bournemouth", "Fulham", "Brentford", "West Ham", "Crystal Palace", "Ipswich", "Wolves", "Leicester", "Southampton"],
  "usr_33": ["Man City", "Arsenal", "Chelsea", "Liverpool", "Man Utd", "Aston Villa", "Tottenham", "Brighton", "Newcastle", "Bournemouth", "Everton", "Fulham", "Crystal Palace", "West Ham", "Notts Forest", "Brentford", "Southampton", "Wolves", "Ipswich", "Leicester"],
  "usr_34": ["Man City", "Liverpool", "Chelsea", "Arsenal", "Aston Villa", "Tottenham", "Man Utd", "Brighton", "Newcastle", "Crystal Palace", "Bournemouth", "Notts Forest", "Fulham", "Everton", "West Ham", "Brentford", "Ipswich", "Southampton", "Wolves", "Leicester"],
  "usr_35": ["Arsenal", "Liverpool", "Aston Villa", "Man City", "Chelsea", "Man Utd", "Tottenham", "Brighton", "Newcastle", "Bournemouth", "Notts Forest", "Everton", "Fulham", "Crystal Palace", "Wolves", "Southampton", "Ipswich", "West Ham", "Brentford", "Leicester"],
  "usr_36": ["Liverpool", "Man City", "Arsenal", "Chelsea", "Man Utd", "Aston Villa", "Newcastle", "Brighton", "Tottenham", "Everton", "Fulham", "Bournemouth", "West Ham", "Crystal Palace", "Notts Forest", "Brentford", "Wolves", "Ipswich", "Leicester", "Southampton"],
  "usr_37": ["Liverpool", "Man City", "Chelsea", "Arsenal", "Man Utd", "Aston Villa", "Tottenham", "Everton", "Newcastle", "Crystal Palace", "Brighton", "Bournemouth", "Notts Forest", "Fulham", "West Ham", "Brentford", "Wolves", "Leicester", "Ipswich", "Southampton"],
  "usr_38": ["Liverpool", "Arsenal", "Man City", "Chelsea", "Aston Villa", "Newcastle", "Man Utd", "Brighton", "Tottenham", "Notts Forest", "Crystal Palace", "Everton", "Bournemouth", "Fulham", "West Ham", "Brentford", "Wolves", "Leicester", "Ipswich", "Southampton"],
  "usr_39": ["Liverpool", "Arsenal", "Man City", "Chelsea", "Man Utd", "Aston Villa", "Tottenham", "Newcastle", "Notts Forest", "Brighton", "Fulham", "Bournemouth", "Everton", "Crystal Palace", "Brentford", "West Ham", "Ipswich", "Wolves", "Leicester", "Southampton"],
  "usr_40": ["Liverpool", "Man City", "Man Utd", "Chelsea", "Tottenham", "Arsenal", "Aston Villa", "Everton", "Fulham", "Crystal Palace", "Newcastle", "Notts Forest", "West Ham", "Brighton", "Bournemouth", "Southampton", "Wolves", "Leicester", "Brentford", "Ipswich"],
  "usr_41": ["Man City", "Chelsea", "Liverpool", "Arsenal", "Tottenham", "Aston Villa", "Man Utd", "Newcastle", "Everton", "Brighton", "Notts Forest", "Crystal Palace", "West Ham", "Fulham", "Wolves", "Ipswich", "Brentford", "Bournemouth", "Southampton", "Leicester"],
  "usr_42": ["Liverpool", "Man City", "Chelsea", "Arsenal", "Aston Villa", "Newcastle", "Man Utd", "Tottenham", "Crystal Palace", "Brighton", "Bournemouth", "Notts Forest", "Fulham", "West Ham", "Everton", "Wolves", "Ipswich", "Southampton", "Brentford", "Leicester"],
  "usr_43": ["Liverpool", "Arsenal", "Man City", "Chelsea", "Newcastle", "Tottenham", "Aston Villa", "Brighton", "Man Utd", "Crystal Palace", "Notts Forest", "Bournemouth", "Everton", "Wolves", "Fulham", "West Ham", "Brentford", "Ipswich", "Southampton", "Leicester"],
  "usr_44": ["Liverpool", "Chelsea", "Arsenal", "Man City", "Tottenham", "Man Utd", "Newcastle", "Aston Villa", "Brighton", "Notts Forest", "Crystal Palace", "Everton", "West Ham", "Bournemouth", "Fulham", "Brentford", "Wolves", "Ipswich", "Southampton", "Leicester"],
  "usr_45": ["Man City", "Arsenal", "Man Utd", "Newcastle", "Liverpool", "Chelsea", "Tottenham", "Brighton", "Aston Villa", "West Ham", "Brentford", "Crystal Palace", "Fulham", "Wolves", "Notts Forest", "Everton", "Bournemouth", "Southampton", "Leicester", "Ipswich"],
  "usr_46": ["Man City", "Arsenal", "Liverpool", "Chelsea", "Newcastle", "Man Utd", "Brighton", "Aston Villa", "Tottenham", "Notts Forest", "Fulham", "Crystal Palace", "Everton", "Bournemouth", "Leicester", "Brentford", "Ipswich", "Wolves", "West Ham", "Southampton"],
  "usr_47": ["Chelsea", "Liverpool", "Man City", "Man Utd", "Arsenal", "Newcastle", "Crystal Palace", "Brighton", "Aston Villa", "Notts Forest", "Tottenham", "Everton", "Wolves", "Bournemouth", "Fulham", "Ipswich", "West Ham", "Leicester", "Brentford", "Southampton"],
  "usr_48": ["Chelsea", "Liverpool", "Man City", "Arsenal", "Newcastle", "Man Utd", "Aston Villa", "Tottenham", "Brighton", "Fulham", "Crystal Palace", "Notts Forest", "Wolves", "Ipswich", "Bournemouth", "Brentford", "Everton", "Leicester", "West Ham", "Southampton"],
  "usr_49": ["Liverpool", "Chelsea", "Man City", "Arsenal", "Newcastle", "Man Utd", "Crystal Palace", "Aston Villa", "Brighton", "Fulham", "Tottenham", "Notts Forest", "Wolves", "Everton", "Bournemouth", "Brentford", "Ipswich", "Leicester", "West Ham", "Southampton"],
  "usr_50": ["Chelsea", "Liverpool", "Man City", "Arsenal", "Tottenham", "Newcastle", "Aston Villa", "Notts Forest", "Crystal Palace", "Man Utd", "Bournemouth", "Brighton", "West Ham", "Fulham", "Everton", "Wolves", "Southampton", "Brentford", "Ipswich", "Leicester"],
  "usr_51": ["Liverpool", "Chelsea", "Man City", "Arsenal", "Aston Villa", "Newcastle", "Notts Forest", "Brighton", "Bournemouth", "Man Utd", "Everton", "Brentford", "West Ham", "Crystal Palace", "Fulham", "Tottenham", "Wolves", "Leicester", "Ipswich", "Southampton"],
  "usr_52": ["Man City", "Chelsea", "Liverpool", "Arsenal", "Man Utd", "Aston Villa", "Newcastle", "Everton", "Tottenham", "Crystal Palace", "Brighton", "West Ham", "Fulham", "Notts Forest", "Southampton", "Bournemouth", "Leicester", "Ipswich", "Brentford", "Wolves"],
  "usr_53": ["Arsenal", "Liverpool", "Man City", "Chelsea", "Aston Villa", "Newcastle", "Tottenham", "Man Utd", "Everton", "Notts Forest", "Brighton", "Brentford", "West Ham", "Fulham", "Ipswich", "Crystal Palace", "Wolves", "Bournemouth", "Southampton", "Leicester"],
  "usr_54": ["Liverpool", "Man City", "Chelsea", "Tottenham", "Newcastle", "Man Utd", "Aston Villa", "Notts Forest", "Arsenal", "Everton", "Crystal Palace", "Brighton", "Fulham", "Bournemouth", "Ipswich", "Southampton", "West Ham", "Brentford", "Wolves", "Leicester"],
  "usr_55": ["Chelsea", "Liverpool", "Man City", "Arsenal", "Newcastle", "Aston Villa", "Notts Forest", "Everton", "Man Utd", "Crystal Palace", "Brighton", "Bournemouth", "Fulham", "Brentford", "Tottenham", "West Ham", "Ipswich", "Wolves", "Leicester", "Southampton"],
  "usr_56": ["Liverpool", "Man City", "Chelsea", "Arsenal", "Newcastle", "Tottenham", "Man Utd", "Brighton", "Aston Villa", "Bournemouth", "Brentford", "Everton", "Notts Forest", "West Ham", "Fulham", "Crystal Palace", "Ipswich", "Southampton", "Wolves", "Leicester"],
  "usr_57": ["Liverpool", "Man City", "Arsenal", "Chelsea", "Notts Forest", "Man Utd", "Brighton", "Aston Villa", "Newcastle", "Crystal Palace", "Everton", "Tottenham", "Fulham", "Bournemouth", "West Ham", "Brentford", "Southampton", "Wolves", "Ipswich", "Leicester"],
  "usr_58": ["Arsenal", "Liverpool", "Man City", "Man Utd", "Chelsea", "Aston Villa", "Newcastle", "Brighton", "Notts Forest", "Tottenham", "Fulham", "Crystal Palace", "Everton", "Wolves", "Bournemouth", "West Ham", "Ipswich", "Leicester", "Brentford", "Southampton"],
  "usr_59": ["Arsenal", "Chelsea", "Man City", "Liverpool", "Man Utd", "Aston Villa", "Tottenham", "Notts Forest", "Crystal Palace", "Newcastle", "Bournemouth", "Brighton", "Fulham", "Everton", "West Ham", "Wolves", "Southampton", "Ipswich", "Brentford", "Leicester"],
  "usr_60": ["Liverpool", "Arsenal", "Chelsea", "Man City", "Newcastle", "Tottenham", "Aston Villa", "Man Utd", "Bournemouth", "Brighton", "Notts Forest", "Crystal Palace", "West Ham", "Brentford", "Fulham", "Wolves", "Everton", "Ipswich", "Leicester", "Southampton"],
  "usr_61": ["Liverpool", "Arsenal", "Man City", "Chelsea", "Aston Villa", "Crystal Palace", "Newcastle", "Brighton", "Bournemouth", "Notts Forest", "Tottenham", "Man Utd", "Brentford", "Fulham", "Everton", "West Ham", "Wolves", "Leicester", "Ipswich", "Southampton"],
  "usr_62": ["Liverpool", "Man City", "Arsenal", "Chelsea", "Tottenham", "Man Utd", "Newcastle", "Aston Villa", "Everton", "Brighton", "Notts Forest", "Brentford", "Bournemouth", "Crystal Palace", "West Ham", "Fulham", "Wolves", "Ipswich", "Leicester", "Southampton"],
  "usr_63": ["Liverpool", "Arsenal", "Man City", "Chelsea", "Aston Villa", "Notts Forest", "Crystal Palace", "Newcastle", "Brighton", "Bournemouth", "Tottenham", "Man Utd", "Brentford", "West Ham", "Everton", "Fulham", "Ipswich", "Wolves", "Leicester", "Southampton"],
  "usr_64": ["Liverpool", "Man City", "Chelsea", "Arsenal", "Aston Villa", "Tottenham", "Man Utd", "Newcastle", "Brighton", "Notts Forest", "Crystal Palace", "Everton", "Bournemouth", "West Ham", "Brentford", "Fulham", "Southampton", "Ipswich", "Wolves", "Leicester"],
  "usr_65": ["Chelsea", "Liverpool", "Man City", "Arsenal", "Brighton", "Aston Villa", "Man Utd", "Newcastle", "Notts Forest", "Tottenham", "Everton", "Ipswich", "Crystal Palace", "West Ham", "Fulham", "Southampton", "Wolves", "Bournemouth", "Brentford", "Leicester"],
  "usr_66": ["Liverpool", "Chelsea", "Arsenal", "Man City", "Newcastle", "Aston Villa", "Tottenham", "Man Utd", "Brighton", "Bournemouth", "Notts Forest", "Fulham", "Everton", "Brentford", "Crystal Palace", "West Ham", "Southampton", "Wolves", "Ipswich", "Leicester"],
  "usr_67": ["Liverpool", "Arsenal", "Chelsea", "Man City", "Newcastle", "Aston Villa", "Tottenham", "Man Utd", "Brighton", "Crystal Palace", "Bournemouth", "Fulham", "Everton", "Wolves", "Notts Forest", "Brentford", "West Ham", "Ipswich", "Leicester", "Southampton"],
  "usr_68": ["Liverpool", "Arsenal", "Man City", "Chelsea", "Man Utd", "Newcastle", "Aston Villa", "Everton", "Tottenham", "Brighton", "Notts Forest", "Crystal Palace", "Bournemouth", "Fulham", "West Ham", "Wolves", "Ipswich", "Brentford", "Leicester", "Southampton"],
  "usr_69": ["Arsenal", "Man City", "Liverpool", "Man Utd", "Chelsea", "Aston Villa", "Tottenham", "Newcastle", "Notts Forest", "Brighton", "Bournemouth", "Everton", "Crystal Palace", "Brentford", "Fulham", "West Ham", "Wolves", "Ipswich", "Leicester", "Southampton"],
  "usr_70": ["Liverpool", "Arsenal", "Man City", "Newcastle", "Chelsea", "Aston Villa", "Brighton", "Crystal Palace", "Brentford", "Notts Forest", "Man Utd", "Tottenham", "Bournemouth", "Everton", "Fulham", "West Ham", "Ipswich", "Wolves", "Leicester", "Southampton"],
  "usr_71": ["Man City", "Chelsea", "Liverpool", "Arsenal", "Aston Villa", "Newcastle", "Tottenham", "Man Utd", "Notts Forest", "West Ham", "Fulham", "Brighton", "Everton", "Crystal Palace", "Bournemouth", "Ipswich", "Brentford", "Wolves", "Southampton", "Leicester"],
  "usr_72": ["Arsenal", "Liverpool", "Man City", "Chelsea", "Aston Villa", "Newcastle", "Man Utd", "Brighton", "Tottenham", "Bournemouth", "Notts Forest", "Wolves", "Fulham", "Crystal Palace", "Everton", "Brentford", "Southampton", "West Ham", "Leicester", "Ipswich"],
  "usr_73": ["Liverpool", "Man City", "Chelsea", "Arsenal", "Newcastle", "Man Utd", "Aston Villa", "Notts Forest", "Fulham", "Tottenham", "Everton", "Crystal Palace", "Brighton", "Bournemouth", "West Ham", "Brentford", "Wolves", "Ipswich", "Leicester", "Southampton"],
  "usr_74": ["Liverpool", "Man City", "Chelsea", "Arsenal", "Aston Villa", "Man Utd", "Newcastle", "Notts Forest", "Crystal Palace", "Everton", "Tottenham", "Bournemouth", "Fulham", "Brighton", "Wolves", "Ipswich", "West Ham", "Brentford", "Southampton", "Leicester"],
  "usr_75": ["Liverpool", "Man City", "Chelsea", "Arsenal", "Tottenham", "Man Utd", "Newcastle", "Aston Villa", "Ipswich", "Crystal Palace", "Brighton", "Wolves", "Everton", "Notts Forest", "Southampton", "West Ham", "Fulham", "Brentford", "Bournemouth", "Leicester"],
  "usr_76": ["Liverpool", "Arsenal", "Man City", "Chelsea", "Newcastle", "Aston Villa", "Crystal Palace", "Notts Forest", "Brighton", "Brentford", "Bournemouth", "Man Utd", "Fulham", "Everton", "Tottenham", "West Ham", "Leicester", "Wolves", "Ipswich", "Southampton"],
  "usr_77": ["Liverpool", "Arsenal", "Chelsea", "Man City", "Aston Villa", "Newcastle", "Crystal Palace", "Brighton", "Man Utd", "Tottenham", "Everton", "Southampton", "Notts Forest", "Brentford", "West Ham", "Ipswich", "Fulham", "Wolves", "Bournemouth", "Leicester"],
  "usr_78": ["Man City", "Liverpool", "Chelsea", "Arsenal", "Notts Forest", "Man Utd", "Tottenham", "Brighton", "Newcastle", "Bournemouth", "Aston Villa", "Everton", "Fulham", "Crystal Palace", "Brentford", "West Ham", "Leicester", "Wolves", "Ipswich", "Southampton"],
  "usr_79": ["Liverpool", "Chelsea", "Man City", "Arsenal", "Man Utd", "Aston Villa", "Newcastle", "Tottenham", "Everton", "Crystal Palace", "Notts Forest", "Bournemouth", "Brighton", "Brentford", "West Ham", "Fulham", "Leicester", "Ipswich", "Wolves", "Southampton"],
  "usr_80": ["Liverpool", "Arsenal", "Man City", "Chelsea", "Aston Villa", "Newcastle", "Tottenham", "Man Utd", "Brighton", "Crystal Palace", "Notts Forest", "Everton", "Wolves", "West Ham", "Fulham", "Bournemouth", "Brentford", "Ipswich", "Southampton", "Leicester"],
  "usr_81": ["Arsenal", "Liverpool", "Chelsea", "Man City", "Man Utd", "Newcastle", "Aston Villa", "Tottenham", "Brighton", "Notts Forest", "Crystal Palace", "West Ham", "Wolves", "Everton", "Brentford", "Southampton", "Fulham", "Ipswich", "Bournemouth", "Leicester"],
  "usr_82": ["Liverpool", "Arsenal", "Man City", "Chelsea", "Aston Villa", "Man Utd", "Tottenham", "Newcastle", "Brighton", "Notts Forest", "Crystal Palace", "Everton", "Bournemouth", "Fulham", "West Ham", "Wolves", "Ipswich", "Leicester", "Southampton", "Brentford"],
  "usr_83": ["Arsenal", "Liverpool", "Crystal Palace", "Chelsea", "Man City", "Aston Villa", "Newcastle", "Brighton", "Man Utd", "Notts Forest", "Tottenham", "Everton", "Bournemouth", "Brentford", "Wolves", "Fulham", "Ipswich", "West Ham", "Southampton", "Leicester"],
  "usr_84": ["Liverpool", "Arsenal", "Man City", "Chelsea", "Newcastle", "Aston Villa", "Brighton", "West Ham", "Man Utd", "Tottenham", "Crystal Palace", "Wolves", "Fulham", "Brentford", "Bournemouth", "Notts Forest", "Everton", "Ipswich", "Leicester", "Southampton"],
  "usr_85": ["Liverpool", "Man City", "Chelsea", "Arsenal", "Newcastle", "Tottenham", "Man Utd", "Aston Villa", "Crystal Palace", "Brighton", "Notts Forest", "Bournemouth", "Everton", "Fulham", "West Ham", "Ipswich", "Wolves", "Brentford", "Southampton", "Leicester"],
  "usr_86": ["Arsenal", "Liverpool", "Man City", "Chelsea", "Aston Villa", "Newcastle", "Notts Forest", "Everton", "Bournemouth", "Brighton", "Crystal Palace", "Tottenham", "Fulham", "Man Utd", "Brentford", "West Ham", "Wolves", "Ipswich", "Southampton", "Leicester"],
  "usr_87": ["Liverpool", "Man City", "Arsenal", "Chelsea", "Newcastle", "Aston Villa", "Man Utd", "Brighton", "Tottenham", "Crystal Palace", "Notts Forest", "Bournemouth", "Fulham", "Everton", "West Ham", "Wolves", "Southampton", "Brentford", "Ipswich", "Leicester"],
  "usr_88": ["Liverpool", "Chelsea", "Arsenal", "Man City", "Man Utd", "Tottenham", "Aston Villa", "Crystal Palace", "Newcastle", "Everton", "West Ham", "Fulham", "Brighton", "Brentford", "Notts Forest", "Bournemouth", "Ipswich", "Leicester", "Wolves", "Southampton"],
  "usr_89": ["Liverpool", "Arsenal", "Chelsea", "Man City", "Newcastle", "Aston Villa", "Man Utd", "Brighton", "Crystal Palace", "Tottenham", "Notts Forest", "Bournemouth", "Fulham", "Brentford", "Everton", "West Ham", "Wolves", "Southampton", "Ipswich", "Leicester"],
  "usr_90": ["Man Utd", "Liverpool", "Arsenal", "Man City", "Aston Villa", "Chelsea", "Tottenham", "Leicester", "Bournemouth", "Brighton", "Notts Forest", "Fulham", "Newcastle", "Brentford", "Crystal Palace", "Southampton", "Ipswich", "Everton", "Wolves", "West Ham"],
  "usr_91": ["Man City", "Arsenal", "Liverpool", "Aston Villa", "Chelsea", "Crystal Palace", "Tottenham", "Man Utd", "Newcastle", "Fulham", "Ipswich", "Bournemouth", "Leicester", "Wolves", "Notts Forest", "Brentford", "Brighton", "Everton", "Southampton", "West Ham"],
  "usr_92": ["Liverpool", "Arsenal", "Man City", "Chelsea", "Aston Villa", "Newcastle", "Tottenham", "Man Utd", "Brighton", "Crystal Palace", "Notts Forest", "Fulham", "Brentford", "West Ham", "Bournemouth", "Everton", "Wolves", "Ipswich", "Southampton", "Leicester"],
  "usr_93": ["Liverpool", "Arsenal", "Man City", "Chelsea", "Aston Villa", "Tottenham", "Newcastle", "Brighton", "Man Utd", "Notts Forest", "Crystal Palace", "Brentford", "Bournemouth", "Everton", "Fulham", "West Ham", "Wolves", "Leicester", "Ipswich", "Southampton"],
  "usr_94": ["Liverpool", "Man City", "Chelsea", "Arsenal", "Aston Villa", "Man Utd", "Newcastle", "Tottenham", "Brighton", "Everton", "Bournemouth", "Notts Forest", "Crystal Palace", "Fulham", "West Ham", "Ipswich", "Brentford", "Leicester", "Wolves", "Southampton"],
  "usr_95": ["Liverpool", "Man City", "Chelsea", "Arsenal", "Newcastle", "Man Utd", "Aston Villa", "Tottenham", "Brighton", "Crystal Palace", "Bournemouth", "West Ham", "Fulham", "Everton", "Notts Forest", "Wolves", "Leicester", "Ipswich", "Brentford", "Southampton"],
  "usr_96": ["Arsenal", "Liverpool", "Man City", "Chelsea", "Aston Villa", "Tottenham", "Man Utd", "Crystal Palace", "Newcastle", "Notts Forest", "Everton", "Brighton", "West Ham", "Fulham", "Bournemouth", "Brentford", "Ipswich", "Southampton", "Wolves", "Leicester"],
  "usr_97": ["Arsenal", "Liverpool", "Chelsea", "Man City", "Aston Villa", "Tottenham", "Notts Forest", "Crystal Palace", "Man Utd", "Brighton", "Everton", "Brentford", "Newcastle", "West Ham", "Ipswich", "Wolves", "Fulham", "Southampton", "Leicester", "Bournemouth"],
  "usr_98": ["Arsenal", "Chelsea", "Liverpool", "Man City", "Tottenham", "Man Utd", "Crystal Palace", "Aston Villa", "Everton", "Newcastle", "Brighton", "Notts Forest", "West Ham", "Fulham", "Bournemouth", "Brentford", "Ipswich", "Wolves", "Leicester", "Southampton"],
  "usr_99": ["Arsenal", "Liverpool", "Man City", "Chelsea", "Man Utd", "Newcastle", "Notts Forest", "Aston Villa", "Bournemouth", "Tottenham", "Brighton", "Brentford", "Crystal Palace", "Ipswich", "West Ham", "Everton", "Fulham", "Wolves", "Leicester", "Southampton"],
  "usr_100": ["Arsenal", "Man City", "Liverpool", "Chelsea", "Man Utd", "Fulham", "Notts Forest", "Aston Villa", "Newcastle", "Ipswich", "Crystal Palace", "Tottenham", "Bournemouth", "Everton", "Southampton", "Brighton", "West Ham", "Brentford", "Wolves", "Leicester"],
  "usr_101": ["Liverpool", "Arsenal", "Man City", "Chelsea", "Newcastle", "Man Utd", "Aston Villa", "Tottenham", "West Ham", "Everton", "Brighton", "Wolves", "Brentford", "Fulham", "Crystal Palace", "Bournemouth", "Notts Forest", "Ipswich", "Southampton", "Leicester"],
  "usr_102": ["Man Utd", "Liverpool", "Arsenal", "Man City", "Aston Villa", "Chelsea", "Tottenham", "Newcastle", "Crystal Palace", "Brighton", "Everton", "Ipswich", "Fulham", "Southampton", "Bournemouth", "West Ham", "Notts Forest", "Brentford", "Wolves", "Leicester"],
  "usr_103": ["Man City", "Liverpool", "Arsenal", "Chelsea", "Tottenham", "Aston Villa", "Newcastle", "Man Utd", "Notts Forest", "Crystal Palace", "Everton", "West Ham", "Bournemouth", "Brighton", "Wolves", "Fulham", "Ipswich", "Brentford", "Southampton", "Leicester"],
  "usr_104": ["Arsenal", "Man City", "Liverpool", "Chelsea", "Aston Villa", "Newcastle", "Tottenham", "Notts Forest", "Crystal Palace", "Everton", "Brighton", "Man Utd", "West Ham", "Brentford", "Bournemouth", "Fulham", "Ipswich", "Wolves", "Leicester", "Southampton"],
  "usr_105": ["Liverpool", "Arsenal", "Man City", "Newcastle", "Chelsea", "Aston Villa", "Notts Forest", "Tottenham", "Brighton", "Fulham", "Man Utd", "Everton", "West Ham", "Bournemouth", "Brentford", "Ipswich", "Crystal Palace", "Wolves", "Leicester", "Southampton"],
  "usr_106": ["Man City", "Arsenal", "Liverpool", "Chelsea", "Man Utd", "Aston Villa", "Tottenham", "Newcastle", "West Ham", "Everton", "Brighton", "Wolves", "Brentford", "Fulham", "Crystal Palace", "Bournemouth", "Notts Forest", "Leicester", "Southampton", "Ipswich"]
};


const userPredictionTeamIds: { [key: string]: string[] } = {};
for (const userId in userPredictionsRaw) {
    userPredictionTeamIds[userId] = userPredictionsRaw[userId].map(teamName => {
        const normalizedName = teamName.toLowerCase().replace(/\s/g, '');
        for (const key in teamNameMapping) {
            if (key.toLowerCase().replace(/\s/g, '') === normalizedName) {
                return teamNameMapping[key];
            }
        }
        // Fallback for names that match directly in the teams list if not in mapping
        const team = teams.find(t => t.name.toLowerCase().replace(/\s/g, '') === normalizedName);
        if (team) return team.id;

        console.warn(`Could not map team name: ${teamName} for user ${userId}`);
        return 'unknown';
    }).filter(id => id !== 'unknown');
}


export const fullPredictions: Prediction[] = Object.entries(userPredictionTeamIds).map(([userId, rankings]) => ({
    userId,
    rankings,
}));


export const matches: Match[] = [
    // Data up to week 18 is provided.
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
];

// --- CALCULATED DATA ---

type TeamStats = Omit<CurrentStanding, 'teamId' | 'rank'>;

function calculateStandings(matches: Match[], maxWeek: number): Map<string, TeamStats> {
    const stats: Map<string, TeamStats> = new Map();
    teams.forEach(team => {
        stats.set(team.id, {
            points: 0, gamesPlayed: 0, wins: 0, draws: 0, losses: 0,
            goalsFor: 0, goalsAgainst: 0, goalDifference: 0, teamId: team.id, rank: 0
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

function sortStandings(statsMap: Map<string, TeamStats>): CurrentStanding[] {
    const sorted = Array.from(statsMap.values())
        .sort((a, b) => {
            if (a.points !== b.points) return b.points - a.points;
            if (a.goalDifference !== b.goalDifference) return b.goalDifference - a.goalDifference;
            if (a.goalsFor !== b.goalsFor) return b.goalsFor - a.goalsFor;
            const teamA = teams.find(t => t.id === a.teamId)?.name || '';
            const teamB = teams.find(t => t.id === b.teamId)?.name || '';
            return teamA.localeCompare(teamB);
        })
        .map((stat, index) => ({
            ...stat,
            rank: index + 1,
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
    if (!prediction || !prediction.rankings) return [];

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
        const prediction = fullPredictions.find(p => p.userId === user.id);
        if (!prediction || !prediction.rankings) return { userId: user.id, score: 0 };
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
        avatar: `${(i % 49) + 1}`,
        score: week18.score,
        rank: week18.rank,
        previousRank: week17.rank,
        previousScore: week17.score,
        rankChange: week17.rank > 0 && week18.rank > 0 ? week17.rank - week18.rank : 0,
        scoreChange: week18.score - week17.score,
        maxRank: allRanks.length > 0 ? Math.min(...allRanks) : 0,
        minRank: allRanks.length > 0 ? Math.max(...allRanks) : 0,
        maxScore: allScores.length > 0 ? Math.max(...allScores) : 0,
        minScore: allScores.length > 0 ? Math.min(...allScores) : 0,
        isPro: proUsers.includes(user.name),
        email: `${user.name.toLowerCase().replace(/ /g, '.')}@example.com`,
        joinDate: new Date(2024, 7, 1).toISOString()
    };
}).sort((a, b) => {
    if (a.rank === 0) return 1;
    if (b.rank === 0) return -1;
    return a.rank - b.rank;
});

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
    { id: 'mimom_aug_1', month: 'August', year: 2025, userId: 'usr_32', type: 'winner' },
    { id: 'mimom_aug_2', month: 'August', year: 2025, userId: 'usr_60', type: 'runner-up' },
    { id: 'mimom_sep_1', month: 'September', year: 2025, userId: 'usr_87', type: 'winner' },
    { id: 'mimom_sep_2', month: 'September', year: 2025, userId: 'usr_75', type: 'runner-up' },
    { id: 'mimom_oct_1', month: 'October', year: 2025, userId: 'usr_83', type: 'winner' },
    { id: 'mimom_oct_2', month: 'October', year: 2025, userId: 'usr_76', type: 'runner-up' },
    { id: 'mimom_nov_1', month: 'November', year: 2025, userId: 'usr_85', type: 'winner' },
    { id: 'mimom_nov_2', month: 'November', year: 2025, userId: 'usr_94', type: 'runner-up' },
];


// Final exports for the app
export const users: User[] = fullUsers;
export const predictions: Prediction[] = fullPredictions;
export const userHistories: UserHistory[] = fullUserHistories;

    
    