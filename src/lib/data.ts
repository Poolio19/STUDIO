
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
    { id: 'team_01', name: 'Arsenal', logo: 'drill', bgColourFaint: 'rgba(239, 1, 7, 0.3)', bgColourSolid: '#EF0107', textColour: '#062657', iconColour: '#FFFFFF' },
    { id: 'team_02', name: 'Aston Villa', logo: 'fingerprint', bgColourFaint: 'rgba(103, 0, 52, 0.3)', bgColourSolid: '#670034', textColour: '#95BFE5', iconColour: '#95BFE5' },
    { id: 'team_03', name: 'Bournemouth', logo: 'cherry', bgColourFaint: 'rgba(218, 41, 28, 0.3)', bgColourSolid: '#DA291C', textColour: '#000000', iconColour: '#FFFFFF' },
    { id: 'team_04', name: 'Brentford', logo: 'bug', bgColourFaint: 'rgba(227, 6, 19, 0.3)', bgColourSolid: '#E30613', textColour: '#FFFFFF', iconColour: '#FFFFFF' },
    { id: 'team_05', name: 'Brighton', logo: 'bird', bgColourFaint: 'rgba(0, 87, 184, 0.3)', bgColourSolid: '#0057B8', textColour: '#FFFFFF', iconColour: '#FFFFFF' },
    { id: 'team_06', name: 'Chelsea', logo: 'creativeCommons', bgColourFaint: 'rgba(3, 70, 148, 0.3)', bgColourSolid: '#034694', textColour: '#FFFFFF', iconColour: '#FFFFFF' },
    { id: 'team_07', name: 'Crystal Palace', logo: 'castle', bgColourFaint: 'rgba(27, 69, 143, 0.3)', bgColourSolid: '#1B458F', textColour: '#C4122E', iconColour: '#C4122E' },
    { id: 'team_08', name: 'Everton', logo: 'shieldHalf', bgColourFaint: 'rgba(0, 51, 160, 0.3)', bgColourSolid: '#0033A0', textColour: '#FFFFFF', iconColour: '#FFFFFF' },
    { id: 'team_09', name: 'Fulham', logo: 'rabbit', bgColourFaint: 'rgba(0, 0, 0, 0.3)', bgColourSolid: '#000000', textColour: '#FFFFFF', iconColour: '#FFFFFF' },
    { id: 'team_10', name: 'Ipswich', logo: 'theater', bgColourFaint: 'rgba(0, 51, 160, 0.3)', bgColourSolid: '#0033A0', textColour: '#FFFFFF', iconColour: '#FFFFFF' },
    { id: 'team_11', name: 'Leicester', logo: 'squirrel', bgColourFaint: 'rgba(0, 83, 160, 0.3)', bgColourSolid: '#0053A0', textColour: '#FDBE11', iconColour: '#FDBE11' },
    { id: 'team_12', name: 'Liverpool', logo: 'origami', bgColourFaint: 'rgba(200, 16, 46, 0.3)', bgColourSolid: '#C8102E', textColour: '#000000', iconColour: '#FFFFFF' },
    { id: 'team_13', name: 'Man City', logo: 'sailboat', bgColourFaint: 'rgba(108, 171, 221, 0.3)', bgColourSolid: '#6CABDD', textColour: '#00285E', iconColour: '#00285E' },
    { id: 'team_14', name: 'Man Utd', logo: 'sparkles', bgColourFaint: 'rgba(218, 41, 28, 0.3)', bgColourSolid: '#DA291C', textColour: '#FBE122', iconColour: '#FBE122' },
    { id: 'team_15', name: 'Newcastle', logo: 'shieldUser', bgColourFaint: 'rgba(45, 41, 38, 0.3)', bgColourSolid: '#2D2926', textColour: '#FFFFFF', iconColour: '#FFFFFF' },
    { id: 'team_16', name: 'Notts Forest', logo: 'treeDeciduous', bgColourFaint: 'rgba(221, 0, 0, 0.3)', bgColourSolid: '#DD0000', textColour: '#FFFFFF', iconColour: '#FFFFFF' },
    { id: 'team_17', name: 'Southampton', logo: 'gitlab', bgColourFaint: 'rgba(215, 25, 32, 0.3)', bgColourSolid: '#D71920', textColour: '#FFFFFF', iconColour: '#FFFFFF' },
    { id: 'team_18', name: 'Tottenham', logo: 'home', bgColourFaint: 'rgba(19, 34, 83, 0.3)', bgColourSolid: '#132257', textColour: '#FFFFFF', iconColour: '#FFFFFF' },
    { id: 'team_19', name: 'West Ham', logo: 'hammer', bgColourFaint: 'rgba(122, 38, 58, 0.3)', bgColourSolid: '#7A263A', textColour: '#FBE122', iconColour: '#FBE122' },
    { id: 'team_20', name: 'Wolves', logo: 'flower', bgColourFaint: 'rgba(253, 190, 17, 0.3)', bgColourSolid: '#FDBE11', textColour: '#000000', iconColour: '#000000' }
];

const teamNameMapping: { [key: string]: string } = teams.reduce((acc, team) => {
    acc[team.name] = team.id;
    if(team.name === 'Tottenham') acc['Spurs'] = team.id;
    return acc;
}, {} as { [key: string]: string });

const userListRaw = [
    { id: 'usr_001', name: 'Thomas Wright' }, { id: 'usr_002', name: 'Barrie Cross' },
    { id: 'usr_003', name: 'Dave Nightingale' }, { id: 'usr_004', name: 'Pip Stokes' },
    { id: 'usr_005', name: 'Alex Anderson' }, { id: 'usr_006', name: 'Nat Walsh' },
    { id: 'usr_007', name: 'Patrick Meese' }, { id: 'usr_008', name: 'Lee Harte' },
    { id: 'usr_009', name: 'Jim Poole' }, { id: 'usr_010', name: 'Lyndon Padmore' },
    { id: 'usr_011', name: 'Mark Hurst' }, { id: 'usr_012', name: 'Paul Baker' },
    { id: 'usr_013', name: 'Andy Casey' }, { id: 'usr_014', name: 'Richard Wood' },
    { id: 'usr_015', name: 'Richard Thomas' }, { id: 'usr_016', name: 'Matthew Byrne' },
    { id: 'usr_017', name: 'Gary Jakeman' }, { id: 'usr_018', name: 'Paul Davies' },
    { id: 'usr_019', name: 'Graham Hough' }, { id: 'usr_020', name: 'Mark Allen' },
    { id: 'usr_021', name: 'Steve Wilson' }, { id: 'usr_022', name: 'Leighton Doyle' },
    { id: 'usr_023', name: 'Adam Evans' }, { id: 'usr_024', name: 'Andrew Hingley' },
    { id: 'usr_025', name: 'Ben Lancaster' }, { id: 'usr_026', name: 'Ashley Radnall' },
    { id: 'usr_027', name: 'Gareth Ellis' }, { id: 'usr_028', name: 'Chris Radnall' },
    { id: 'usr_029', name: 'Gary Williams' }, { id: 'usr_030', name: 'Gavin Budge' },
    { id: 'usr_031', name: 'Matt Hall' }, { id: 'usr_032', name: 'Robert Chapman' },
    { id: 'usr_033', name: 'Paul Radnall' }, { id: 'usr_034', name: 'Tom Lancaster' },
    { id: 'usr_035', name: 'David Wheale' }, { id: 'usr_036', name: 'Simon Wilkes' },
    { id: 'usr_037', name: 'Steve Gray' }, { id: 'usr_038', name: 'Tom Barrett' },
    { id: 'usr_039', name: 'Paul Casey' }, { id: 'usr_040', name: 'James Hurst' },
    { id: 'usr_041', name: 'Nick Radnall' }, { id: 'usr_042', name: 'Matt Casey' },
    { id: 'usr_043', name: 'Andrew Evans' }, { id: 'usr_044', name: 'Dean Wilkes' },
    { id: 'usr_045', name: 'Neil Evans' }, { id: 'usr_046', name: 'Phil Hanlon' },
    { id: 'usr_047', name: 'Paul Hanlon' }, { id: 'usr_048', name: 'Jonathan Radnall' },
    { id: 'usr_049', name: 'Joe Radnall' }, { id: 'usr_050', name: 'James Radnall' },
    { id: 'usr_051', name: 'Dan Stokes' }, { id: 'usr_052', name: 'David Stokes' },
    { id: 'usr_053', name: 'Adam Nightingale' }, { id: 'usr_054', name: 'Dan Nightingale' },
    { id: 'usr_055', name: 'Steve Stokes' }, { id: 'usr_056', name: 'Robbie Nightingale' },
    { id: 'usr_057', name: 'Roger Nightingale' }, { id: 'usr_058', name: 'Phil Cross' },
    { id: 'usr_059', name: 'Paul Baker-Brian' }, { id: 'usr_060', name: 'Ben Baker' },
    { id: 'usr_061', name: 'Ollie Baker' }, { id: 'usr_062', name: 'Richard Baker' },
    { id: 'usr_063', name: 'Paul Baker-Brian Snr' }, { id: 'usr_064', name: 'Luke Baker' },
    { id: 'usr_065', name: 'Joe Baker' }, { id: 'usr_066', name: 'Sam Baker' },
    { id: 'usr_067', name: 'Jake Baker' }, { id: 'usr_068', name: 'Jack Baker' },
    { id: 'usr_069', name: 'Dan Baker' }, { id: 'usr_070', name: 'Matt Baker' },
    { id: 'usr_071', name: 'Tom Baker' }, { id: 'usr_072', name: 'Andrew Baker' },
    { id: 'usr_073', name: 'Steve Baker' }, { id: 'usr_074', name: 'Andy Baker' },
    { id: 'usr_075', name: 'Chris Baker' }, { id: 'usr_076', name: 'John Baker' },
    { id: 'usr_077', name: 'Neil Baker' }, { id: 'usr_078', name: 'Gary Baker' },
    { id: 'usr_079', name: 'Dave Baker' }, { id: 'usr_080', name: 'Mark Baker' },
    { id: 'usr_081', name: 'Graham Baker' }, { id: 'usr_082', name: 'Leighton Baker' },
    { id: 'usr_083', name: 'Adam Baker' }, { id: 'usr_084', name: 'Gareth Baker' },
    { id: 'usr_085', name: 'Ben Baker-Brian' }, { id: 'usr_086', name: 'Ashley Baker' },
    { id: 'usr_087', name: 'Gavin Baker' }, { id: 'usr_088', name: 'Robert Baker' },
    { id: 'usr_089', name: 'Tom Baker-Brian' }, { id: 'usr_090', name: 'David Baker-Brian' },
    { id: 'usr_091', name: 'Simon Baker' }, { id: 'usr_092', name: 'Steve Baker-Brian' },
    { id: 'usr_093', name: 'Tom Barrett-Brian' }, { id: 'usr_094', name: 'Paul Casey-Brian' },
    { id: 'usr_095', name: 'James Hurst-Brian' }, { id: 'usr_096', name: 'Nick Radnall-Brian' },
    { id: 'usr_097', name: 'Matt Casey-Brian' }, { id: 'usr_098', name: 'Andrew Evans-Brian' },
    { id: 'usr_099', name: 'Dean Wilkes-Brian' }, { id: 'usr_100', name: 'Neil Evans-Brian' },
    { id: 'usr_101', name: 'Phil Hanlon-Brian' }, { id: 'usr_102', name: 'Paul Hanlon-Brian' },
    { id: 'usr_103', name: 'Jonathan Radnall-Brian' }, { id: 'usr_104', name: 'Joe Radnall-Brian' },
    { id: 'usr_105', name: 'James Radnall-Brian' }, { id: 'usr_106', name: 'BBC', isPro: true },
    { id: 'usr_107', name: 'SKY', isPro: true }, { id: 'usr_108', name: 'OPTA', isPro: true },
    { id: 'usr_109', name: 'THE SUN', isPro: true }
];

const userList = userListRaw.map(u => ({ ...u, name: u.isPro ? u.name : u.name.replace(/\b\w/g, l => l.toUpperCase()).replace(/\B[A-Z]/g, l => l.toLowerCase()) }));

export const previousSeasonStandings: PreviousSeasonStanding[] = [
    { teamId: 'team_13', rank: 1, points: 91, goalDifference: 62 },
    { teamId: 'team_01', rank: 2, points: 89, goalDifference: 62 },
    { teamId: 'team_12', rank: 3, points: 82, goalDifference: 45 },
    { teamId: 'team_02', rank: 4, points: 68, goalDifference: 27 },
    { teamId: 'team_18', rank: 5, points: 66, goalDifference: 13 },
    { teamId: 'team_06', rank: 6, points: 63, goalDifference: 14 },
    { teamId: 'team_15', rank: 7, points: 60, goalDifference: 23 },
    { teamId: 'team_14', rank: 8, points: 60, goalDifference: -1 },
    { teamId: 'team_19', rank: 9, points: 52, goalDifference: -14 },
    { teamId: 'team_07', rank: 10, points: 49, goalDifference: -1 },
    { teamId: 'team_05', rank: 11, points: 48, goalDifference: -6 },
    { teamId: 'team_03', rank: 12, points: 48, goalDifference: -13 },
    { teamId: 'team_09', rank: 13, points: 47, goalDifference: -6 },
    { teamId: 'team_20', rank: 14, points: 46, goalDifference: -15 },
    { teamId: 'team_08', rank: 15, points: 40, goalDifference: -11 },
    { teamId: 'team_04', rank: 16, points: 39, goalDifference: -9 },
    { teamId: 'team_16', rank: 17, points: 32, goalDifference: -18 },
    { teamId: 'team_11', rank: 18, points: 0, goalDifference: 0 },
    { teamId: 'team_10', rank: 19, points: 0, goalDifference: 0 },
    { teamId: 'team_17', rank: 20, points: 0, goalDifference: 0 }
];

const userPredictionsRaw: { [key: string]: string[] } = {
  "usr_001": ["Man Utd", "Liverpool", "Man City", "Arsenal", "Newcastle", "Chelsea", "Aston Villa", "Notts Forest", "Tottenham", "Bournemouth", "Brighton", "Fulham", "Brentford", "Ipswich", "Crystal Palace", "West Ham", "Wolves", "Everton", "Leicester", "Southampton"],
  "usr_002": ["Liverpool", "Man City", "Arsenal", "Chelsea", "Aston Villa", "Newcastle", "Notts Forest", "Crystal Palace", "Brighton", "Man Utd", "Tottenham", "Bournemouth", "Brentford", "Fulham", "Everton", "Ipswich", "Wolves", "West Ham", "Leicester", "Southampton"],
  "usr_003": ["Liverpool", "Arsenal", "Man City", "Chelsea", "Newcastle", "Man Utd", "Aston Villa", "Tottenham", "Brighton", "Bournemouth", "Notts Forest", "Everton", "Crystal Palace", "Fulham", "West Ham", "Brentford", "Wolves", "Ipswich", "Leicester", "Southampton"],
  "usr_004": ["Liverpool", "Man City", "Chelsea", "Arsenal", "Aston Villa", "Newcastle", "Brighton", "Tottenham", "Notts Forest", "Fulham", "Man Utd", "Bournemouth", "Everton", "Crystal Palace", "Wolves", "West Ham", "Brentford", "Ipswich", "Leicester", "Southampton"],
  "usr_005": ["Chelsea", "Man City", "Liverpool", "Arsenal", "Aston Villa", "Newcastle", "Tottenham", "Brighton", "Man Utd", "Fulham", "Bournemouth", "Brentford", "Ipswich", "Everton", "Crystal Palace", "Wolves", "West Ham", "Notts Forest", "Leicester", "Southampton"],
  "usr_006": ["Chelsea", "Man City", "Liverpool", "Arsenal", "Newcastle", "Man Utd", "Everton", "Aston Villa", "Crystal Palace", "Brighton", "Notts Forest", "Ipswich", "West Ham", "Southampton", "Tottenham", "Wolves", "Bournemouth", "Fulham", "Brentford", "Leicester"],
  "usr_007": ["Man City", "Liverpool", "Arsenal", "Chelsea", "Newcastle", "Aston Villa", "Tottenham", "Man Utd", "Bournemouth", "Notts Forest", "Fulham", "Brighton", "Wolves", "Crystal Palace", "West Ham", "Ipswich", "Everton", "Brentford", "Southampton", "Leicester"],
  "usr_008": ["Liverpool", "Man City", "Arsenal", "Chelsea", "Aston Villa", "Man Utd", "Tottenham", "Newcastle", "Bournemouth", "Brighton", "Everton", "West Ham", "Fulham", "Crystal Palace", "Wolves", "Notts Forest", "Brentford", "Ipswich", "Southampton", "Leicester"],
  "usr_009": ["Liverpool", "Man City", "Arsenal", "Chelsea", "Aston Villa", "Newcastle", "Tottenham", "Man Utd", "Notts Forest", "Everton", "Brighton", "Brentford", "West Ham", "Bournemouth", "Fulham", "Crystal Palace", "Wolves", "Leicester", "Ipswich", "Southampton"],
  "usr_010": ["Man City", "Liverpool", "Arsenal", "Chelsea", "Tottenham", "Man Utd", "Aston Villa", "Newcastle", "West Ham", "Everton", "Brighton", "Wolves", "Brentford", "Fulham", "Crystal Palace", "Bournemouth", "Notts Forest", "Ipswich", "Leicester", "Southampton"],
  "usr_106": ["Man City", "Arsenal", "Liverpool", "Aston Villa", "Tottenham", "Chelsea", "Newcastle", "Man Utd", "West Ham", "Brighton", "Bournemouth", "Crystal Palace", "Wolves", "Fulham", "Everton", "Brentford", "Notts Forest", "Ipswich", "Southampton", "Leicester"],
  "usr_107": ["Man City", "Arsenal", "Liverpool", "Chelsea", "Tottenham", "Man Utd", "Aston Villa", "Newcastle", "West Ham", "Brighton", "Crystal Palace", "Fulham", "Everton", "Bournemouth", "Brentford", "Wolves", "Notts Forest", "Ipswich", "Leicester", "Southampton"],
  "usr_108": ["Man City", "Arsenal", "Liverpool", "Aston Villa", "Chelsea", "Newcastle", "Man Utd", "Tottenham", "West Ham", "Crystal Palace", "Brighton", "Bournemouth", "Fulham", "Wolves", "Brentford", "Everton", "Notts Forest", "Ipswich", "Southampton", "Leicester"],
  "usr_109": ["Man City", "Arsenal", "Liverpool", "Aston Villa", "Tottenham", "Man Utd", "Newcastle", "Chelsea", "West Ham", "Brighton", "Crystal Palace", "Wolves", "Fulham", "Bournemouth", "Everton", "Brentford", "Notts Forest", "Ipswich", "Leicester", "Southampton"]
};

const userPredictionTeamIds: { [key: string]: string[] } = {};
for (const userId in userPredictionsRaw) {
    userPredictionTeamIds[userId] = userPredictionsRaw[userId].map(teamName => teamNameMapping[teamName]).filter(Boolean);
}

// Add dummy predictions for the rest of the users
for (let i = 11; i <= 105; i++) {
    const userId = `usr_${String(i).padStart(3, '0')}`;
    if (!userPredictionTeamIds[userId]) {
        userPredictionTeamIds[userId] = teams.map(t => t.id).sort(() => Math.random() - 0.5);
    }
}

export const fullPredictions: Prediction[] = Object.entries(userPredictionTeamIds).map(([userId, rankings]) => ({
    userId,
    rankings,
}));

export const matches: Match[] = [
    // Week 1
    { week: 1, homeTeamId: 'team_14', awayTeamId: 'team_09', homeScore: 1, awayScore: 0 },
    { week: 1, homeTeamId: 'team_01', awayTeamId: 'team_16', homeScore: 2, awayScore: 1 },
    { week: 1, homeTeamId: 'team_03', awayTeamId: 'team_19', homeScore: 1, awayScore: 1 },
    { week: 1, homeTeamId: 'team_05', awayTeamId: 'team_11', homeScore: 3, awayScore: 0 },
    { week: 1, homeTeamId: 'team_08', awayTeamId: 'team_09', homeScore: 0, awayScore: 1 },
    { week: 1, homeTeamId: 'team_15', awayTeamId: 'team_02', homeScore: 5, awayScore: 1 },
    { week: 1, homeTeamId: 'team_04', awayTeamId: 'team_18', homeScore: 2, awayScore: 2 },
    { week: 1, homeTeamId: 'team_06', awayTeamId: 'team_12', homeScore: 1, awayScore: 1 },
    { week: 1, homeTeamId: 'team_13', awayTeamId: 'team_10', homeScore: -1, awayScore: -1 },
    { week: 1, homeTeamId: 'team_20', awayTeamId: 'team_17', homeScore: -1, awayScore: -1 },

    // Week 2
    { week: 2, homeTeamId: 'team_16', awayTeamId: 'team_11', homeScore: 2, awayScore: 1 },
    { week: 2, homeTeamId: 'team_09', awayTeamId: 'team_04', homeScore: 0, awayScore: 3 },
    { week: 2, homeTeamId: 'team_12', awayTeamId: 'team_03', homeScore: 3, awayScore: 1 },
    { week: 2, homeTeamId: 'team_18', awayTeamId: 'team_14', homeScore: 2, awayScore: 0 },
    { week: 2, homeTeamId: 'team_20', awayTeamId: 'team_05', homeScore: 1, awayScore: 4 },
    { week: 2, homeTeamId: 'team_02', awayTeamId: 'team_08', homeScore: 4, awayScore: 0 },
    { week: 2, homeTeamId: 'team_19', awayTeamId: 'team_06', homeScore: 3, awayScore: 1 },
    { week: 2, homeTeamId: 'team_13', awayTeamId: 'team_15', homeScore: 1, awayScore: 0 },
    { week: 2, homeTeamId: 'team_07', awayTeamId: 'team_01', homeScore: 0, awayScore: 1 },
    { week: 2, homeTeamId: 'team_10', awayTeamId: 'team_17', homeScore: -1, awayScore: -1 },
    
    // Week 3
    { week: 3, homeTeamId: 'team_06', awayTeamId: 'team_11', homeScore: 3, awayScore: 0 },
    { week: 3, homeTeamId: 'team_03', awayTeamId: 'team_18', homeScore: 0, awayScore: 2 },
    { week: 3, homeTeamId: 'team_01', awayTeamId: 'team_09', homeScore: 2, awayScore: 2 },
    { week: 3, homeTeamId: 'team_04', awayTeamId: 'team_07', homeScore: 1, awayScore: 1 },
    { week: 3, homeTeamId: 'team_14', awayTeamId: 'team_16', homeScore: 3, awayScore: 2 },
    { week: 3, homeTeamId: 'team_08', awayTeamId: 'team_20', homeScore: 0, awayScore: 1 },
    { week: 3, homeTeamId: 'team_05', awayTeamId: 'team_19', homeScore: 1, awayScore: 3 },
    { week: 3, homeTeamId: 'team_11', awayTeamId: 'team_02', homeScore: 1, awayScore: 2 },
    { week: 3, homeTeamId: 'team_15', awayTeamId: 'team_12', homeScore: 1, awayScore: 2 },
    { week: 3, homeTeamId: 'team_10', awayTeamId: 'team_13', homeScore: -1, awayScore: -1 },
    
    // Week 4
    { week: 4, homeTeamId: 'team_11', awayTeamId: 'team_14', homeScore: 0, awayScore: 1 },
    { week: 4, homeTeamId: 'team_05', awayTeamId: 'team_15', homeScore: 3, awayScore: 1 },
    { week: 4, homeTeamId: 'team_04', awayTeamId: 'team_03', homeScore: 2, awayScore: 2 },
    { week: 4, homeTeamId: 'team_06', awayTeamId: 'team_16', homeScore: 0, awayScore: 1 },
    { week: 4, homeTeamId: 'team_12', awayTeamId: 'team_02', homeScore: 3, awayScore: 0 },
    { week: 4, homeTeamId: 'team_07', awayTeamId: 'team_20', homeScore: 3, awayScore: 2 },
    { week: 4, homeTeamId: 'team_01', awayTeamId: 'team_14', homeScore: 3, awayScore: 1 },
    { week: 4, homeTeamId: 'team_13', awayTeamId: 'team_09', homeScore: 5, awayScore: 1 },
    { week: 4, homeTeamId: 'team_18', awayTeamId: 'team_10', homeScore: -1, awayScore: -1 },
    { week: 4, homeTeamId: 'team_19', awayTeamId: 'team_17', homeScore: -1, awayScore: -1 },
    
    // Week 5
    { week: 5, homeTeamId: 'team_02', awayTeamId: 'team_07', homeScore: 3, awayScore: 1 },
    { week: 5, homeTeamId: 'team_09', awayTeamId: 'team_11', homeScore: 1, awayScore: 0 },
    { week: 5, homeTeamId: 'team_14', awayTeamId: 'team_05', homeScore: 1, awayScore: 3 },
    { week: 5, homeTeamId: 'team_18', awayTeamId: 'team_11', homeScore: 2, awayScore: 1 },
    { week: 5, homeTeamId: 'team_19', awayTeamId: 'team_13', homeScore: 1, awayScore: 3 },
    { week: 5, homeTeamId: 'team_20', awayTeamId: 'team_12', homeScore: 1, awayScore: 3 },
    { week: 5, homeTeamId: 'team_01', awayTeamId: 'team_18', homeScore: 2, awayScore: 2 },
    { week: 5, homeTeamId: 'team_03', awayTeamId: 'team_06', homeScore: 0, awayScore: 0 },
    { week: 5, homeTeamId: 'team_16', awayTeamId: 'team_04', homeScore: 1, awayScore: 1 },
    { week: 5, homeTeamId: 'team_08', awayTeamId: 'team_10', homeScore: -1, awayScore: -1 },
    
    // Week 6
    { week: 6, homeTeamId: 'team_07', awayTeamId: 'team_09', homeScore: 0, awayScore: 0 },
    { week: 6, homeTeamId: 'team_11', awayTeamId: 'team_01', homeScore: 0, awayScore: 1 },
    { week: 6, homeTeamId: 'team_13', awayTeamId: 'team_16', homeScore: 2, awayScore: 0 },
    { week: 6, homeTeamId: 'team_04', awayTeamId: 'team_08', homeScore: 1, awayScore: 3 },
    { week: 6, homeTeamId: 'team_12', awayTeamId: 'team_19', homeScore: 3, awayScore: 1 },
    { week: 6, homeTeamId: 'team_05', awayTeamId: 'team_03', homeScore: 3, awayScore: 1 },
    { week: 6, homeTeamId: 'team_06', awayTeamId: 'team_02', homeScore: 0, awayScore: 1 },
    { week: 6, homeTeamId: 'team_01', awayTeamId: 'team_18', homeScore: 2, awayScore: 2 },
    { week: 6, homeTeamId: 'team_11', awayTeamId: 'team_14', homeScore: 0, awayScore: 1 },
    { week: 6, homeTeamId: 'team_10', awayTeamId: 'team_17', homeScore: -1, awayScore: -1 },

    // Week 7
    { week: 7, homeTeamId: 'team_02', awayTeamId: 'team_05', homeScore: 6, awayScore: 1 },
    { week: 7, homeTeamId: 'team_03', awayTeamId: 'team_01', homeScore: 0, awayScore: 4 },
    { week: 7, homeTeamId: 'team_08', awayTeamId: 'team_11', homeScore: 1, awayScore: 2 },
    { week: 7, homeTeamId: 'team_14', awayTeamId: 'team_07', homeScore: 2, awayScore: 1 },
    { week: 7, homeTeamId: 'team_15', awayTeamId: 'team_04', homeScore: 2, awayScore: 0 },
    { week: 7, homeTeamId: 'team_16', awayTeamId: 'team_04', homeScore: 1, awayScore: 1 },
    { week: 7, homeTeamId: 'team_18', awayTeamId: 'team_12', homeScore: 2, awayScore: 1 },
    { week: 7, homeTeamId: 'team_09', awayTeamId: 'team_06', homeScore: 0, awayScore: 2 },
    { week: 7, homeTeamId: 'team_20', awayTeamId: 'team_13', homeScore: 2, awayScore: 1 },
    { week: 7, homeTeamId: 'team_19', awayTeamId: 'team_10', homeScore: -1, awayScore: -1 },

    // Week 8
    { week: 8, homeTeamId: 'team_11', awayTeamId: 'team_18', homeScore: 1, awayScore: 4 },
    { week: 8, homeTeamId: 'team_01', awayTeamId: 'team_13', homeScore: 1, awayScore: 0 },
    { week: 8, homeTeamId: 'team_03', awayTeamId: 'team_20', homeScore: 1, awayScore: 2 },
    { week: 8, homeTeamId: 'team_04', awayTeamId: 'team_14', homeScore: 1, awayScore: 2 },
    { week: 8, homeTeamId: 'team_06', awayTeamId: 'team_01', homeScore: 1, awayScore: 4 },
    { week: 8, homeTeamId: 'team_07', awayTeamId: 'team_16', homeScore: 0, awayScore: 0 },
    { week: 8, homeTeamId: 'team_09', awayTeamId: 'team_11', homeScore: 3, awayScore: 1 },
    { week: 8, homeTeamId: 'team_12', awayTeamId: 'team_08', homeScore: 2, awayScore: 0 },
    { week: 8, homeTeamId: 'team_19', awayTeamId: 'team_15', homeScore: 2, awayScore: 2 },
    { week: 8, homeTeamId: 'team_05', awayTeamId: 'team_02', homeScore: 1, awayScore: 1 },

    // Week 9
    { week: 9, homeTeamId: 'team_02', awayTeamId: 'team_19', homeScore: 4, awayScore: 1 },
    { week: 9, homeTeamId: 'team_04', awayTeamId: 'team_11', homeScore: 3, awayScore: 2 },
    { week: 9, homeTeamId: 'team_06', awayTeamId: 'team_04', homeScore: 2, awayScore: 0 },
    { week: 9, homeTeamId: 'team_12', awayTeamId: 'team_16', homeScore: 3, awayScore: 0 },
    { week: 9, homeTeamId: 'team_13', awayTeamId: 'team_05', homeScore: 2, awayScore: 1 },
    { week: 9, homeTeamId: 'team_15', awayTeamId: 'team_07', homeScore: 4, awayScore: 0 },
    { week: 9, homeTeamId: 'team_20', awayTeamId: 'team_15', homeScore: 2, awayScore: 2 },
    { week: 9, homeTeamId: 'team_18', awayTeamId: 'team_09', homeScore: 1, awayScore: 0 },
    { week: 9, homeTeamId: 'team_14', awayTeamId: 'team_13', homeScore: 0, awayScore: 3 },
    { week: 9, homeTeamId: 'team_08', awayTeamId: 'team_17', homeScore: -1, awayScore: -1 },
    
    // Week 10
    { week: 10, homeTeamId: 'team_09', awayTeamId: 'team_14', homeScore: 0, awayScore: 1 },
    { week: 10, homeTeamId: 'team_04', awayTeamId: 'team_19', homeScore: 3, awayScore: 2 },
    { week: 10, homeTeamId: 'team_08', awayTeamId: 'team_05', homeScore: 1, awayScore: 1 },
    { week: 10, homeTeamId: 'team_11', awayTeamId: 'team_20', homeScore: 2, awayScore: 1 },
    { week: 10, homeTeamId: 'team_15', awayTeamId: 'team_01', homeScore: 1, awayScore: 0 },
    { week: 10, homeTeamId: 'team_16', awayTeamId: 'team_02', homeScore: 2, awayScore: 0 },
    { week: 10, homeTeamId: 'team_11', awayTeamId: 'team_06', homeScore: 1, awayScore: 4 },
    { week: 10, homeTeamId: 'team_18', awayTeamId: 'team_06', homeScore: 1, awayScore: 4 },
    { week: 10, homeTeamId: 'team_13', awayTeamId: 'team_03', homeScore: 6, awayScore: 1 },
    { week: 10, homeTeamId: 'team_12', awayTeamId: 'team_10', homeScore: -1, awayScore: -1 },

    // Week 11
    { week: 11, homeTeamId: 'team_14', awayTeamId: 'team_11', homeScore: 1, awayScore: 0 },
    { week: 11, homeTeamId: 'team_01', awayTeamId: 'team_04', homeScore: 3, awayScore: 1 },
    { week: 11, homeTeamId: 'team_05', awayTeamId: 'team_11', homeScore: 1, awayScore: 1 },
    { week: 11, homeTeamId: 'team_07', awayTeamId: 'team_08', homeScore: 1, awayScore: 1 },
    { week: 11, homeTeamId: 'team_12', awayTeamId: 'team_04', homeScore: 4, awayScore: 4 },
    { week: 11, homeTeamId: 'team_13', awayTeamId: 'team_06', homeScore: 4, awayScore: 4 },
    { week: 11, homeTeamId: 'team_02', awayTeamId: 'team_09', homeScore: 3, awayScore: 1 },
    { week: 11, homeTeamId: 'team_19', awayTeamId: 'team_16', homeScore: 3, awayScore: 2 },
    { week: 11, homeTeamId: 'team_20', awayTeamId: 'team_18', homeScore: 2, awayScore: 1 },
    { week: 11, homeTeamId: 'team_15', awayTeamId: 'team_17', homeScore: -1, awayScore: -1 },

    // Week 12
    { week: 12, homeTeamId: 'team_01', awayTeamId: 'team_20', homeScore: 2, awayScore: 1 },
    { week: 12, homeTeamId: 'team_04', awayTeamId: 'team_01', homeScore: 0, awayScore: 1 },
    { week: 12, homeTeamId: 'team_11', awayTeamId: 'team_19', homeScore: 0, awayScore: 1 },
    { week: 12, homeTeamId: 'team_15', awayTeamId: 'team_06', homeScore: 4, awayScore: 1 },
    { week: 12, homeTeamId: 'team_16', awayTeamId: 'team_05', homeScore: 2, awayScore: 3 },
    { week: 12, homeTeamId: 'team_18', awayTeamId: 'team_02', homeScore: 1, awayScore: 2 },
    { week: 12, homeTeamId: 'team_09', awayTeamId: 'team_20', homeScore: 3, awayScore: 2 },
    { week: 12, homeTeamId: 'team_08', awayTeamId: 'team_14', homeScore: 0, awayScore: 3 },
    { week: 12, homeTeamId: 'team_13', awayTeamId: 'team_12', homeScore: 1, awayScore: 1 },
    { week: 12, homeTeamId: 'team_10', awayTeamId: 'team_11', homeScore: -1, awayScore: -1 },
    
    // Week 13
    { week: 13, homeTeamId: 'team_01', awayTeamId: 'team_20', homeScore: 2, awayScore: 1 },
    { week: 13, homeTeamId: 'team_02', awayTeamId: 'team_13', homeScore: 1, awayScore: 2 },
    { week: 13, homeTeamId: 'team_05', awayTeamId: 'team_04', homeScore: 1, awayScore: 2 },
    { week: 13, homeTeamId: 'team_06', awayTeamId: 'team_05', homeScore: 3, awayScore: 2 },
    { week: 13, homeTeamId: 'team_12', awayTeamId: 'team_09', homeScore: 4, awayScore: 3 },
    { week: 13, homeTeamId: 'team_15', awayTeamId: 'team_14', homeScore: 1, awayScore: 0 },
    { week: 13, homeTeamId: 'team_16', awayTeamId: 'team_08', homeScore: 0, awayScore: 1 },
    { week: 13, homeTeamId: 'team_19', awayTeamId: 'team_07', homeScore: 1, awayScore: 1 },
    { week: 13, homeTeamId: 'team_18', awayTeamId: 'team_13', homeScore: 3, awayScore: 3 },
    { week: 13, homeTeamId: 'team_11', awayTeamId: 'team_17', homeScore: -1, awayScore: -1 },

    // Week 14
    { week: 14, homeTeamId: 'team_02', awayTeamId: 'team_14', homeScore: 1, awayScore: 0 },
    { week: 14, homeTeamId: 'team_05', awayTeamId: 'team_04', homeScore: 2, awayScore: 1 },
    { week: 14, homeTeamId: 'team_07', awayTeamId: 'team_12', homeScore: 1, awayScore: 1 },
    { week: 14, homeTeamId: 'team_08', awayTeamId: 'team_15', homeScore: 3, awayScore: 0 },
    { week: 14, homeTeamId: 'team_09', awayTeamId: 'team_16', homeScore: 5, awayScore: 0 },
    { week: 14, homeTeamId: 'team_11', awayTeamId: 'team_03', homeScore: 3, awayScore: 2 },
    { week: 14, homeTeamId: 'team_14', awayTeamId: 'team_06', homeScore: 2, awayScore: 1 },
    { week: 14, homeTeamId: 'team_19', awayTeamId: 'team_01', homeScore: 1, awayScore: 2 },
    { week: 14, homeTeamId: 'team_20', awayTeamId: 'team_11', homeScore: 1, awayScore: 0 },
    { week: 14, homeTeamId: 'team_10', awayTeamId: 'team_18', homeScore: -1, awayScore: -1 },

    // Week 15
    { week: 15, homeTeamId: 'team_07', awayTeamId: 'team_12', homeScore: 1, awayScore: 2 },
    { week: 15, homeTeamId: 'team_05', awayTeamId: 'team_11', homeScore: 1, awayScore: 1 },
    { week: 15, homeTeamId: 'team_11', awayTeamId: 'team_08', homeScore: 1, awayScore: 1 },
    { week: 15, homeTeamId: 'team_16', awayTeamId: 'team_18', homeScore: 0, awayScore: 2 },
    { week: 15, homeTeamId: 'team_01', awayTeamId: 'team_02', homeScore: 2, awayScore: 0 },
    { week: 15, homeTeamId: 'team_03', awayTeamId: 'team_14', homeScore: 0, awayScore: 3 },
    { week: 15, homeTeamId: 'team_13', awayTeamId: 'team_02', homeScore: 2, awayScore: 2 },
    { week: 15, homeTeamId: 'team_19', awayTeamId: 'team_20', homeScore: 3, awayScore: 0 },
    { week: 15, homeTeamId: 'team_09', awayTeamId: 'team_19', homeScore: 5, awayScore: 0 },
    { week: 15, homeTeamId: 'team_06', awayTeamId: 'team_10', homeScore: -1, awayScore: -1 },

    // Week 16
    { week: 16, homeTeamId: 'team_12', awayTeamId: 'team_14', homeScore: 0, awayScore: 0 },
    { week: 16, homeTeamId: 'team_02', awayTeamId: 'team_11', homeScore: 1, awayScore: 0 },
    { week: 16, homeTeamId: 'team_03', awayTeamId: 'team_16', homeScore: 2, awayScore: 3 },
    { week: 16, homeTeamId: 'team_06', awayTeamId: 'team_11', homeScore: 2, awayScore: 2 },
    { week: 16, homeTeamId: 'team_08', awayTeamId: 'team_06', homeScore: 2, awayScore: 0 },
    { week: 16, homeTeamId: 'team_15', awayTeamId: 'team_09', homeScore: 3, awayScore: 0 },
    { week: 16, homeTeamId: 'team_18', awayTeamId: 'team_08', homeScore: 2, awayScore: 1 },
    { week: 16, homeTeamId: 'team_19', awayTeamId: 'team_14', homeScore: 2, awayScore: 0 },
    { week: 16, homeTeamId: 'team_20', awayTeamId: 'team_06', homeScore: 2, awayScore: 1 },
    { week: 16, homeTeamId: 'team_01', awayTeamId: 'team_17', homeScore: -1, awayScore: -1 },
    
    // Week 17
    { week: 17, homeTeamId: 'team_02', awayTeamId: 'team_11', homeScore: 3, awayScore: 2 },
    { week: 17, homeTeamId: 'team_07', awayTeamId: 'team_05', homeScore: 3, awayScore: 0 },
    { week: 17, homeTeamId: 'team_11', awayTeamId: 'team_13', homeScore: 2, awayScore: 3 },
    { week: 17, homeTeamId: 'team_14', awayTeamId: 'team_02', homeScore: 0, awayScore: 1 },
    { week: 17, homeTeamId: 'team_16', awayTeamId: 'team_15', homeScore: 2, awayScore: 1 },
    { week: 17, homeTeamId: 'team_18', awayTeamId: 'team_03', homeScore: 3, awayScore: 1 },
    { week: 17, homeTeamId: 'team_19', awayTeamId: 'team_14', homeScore: 2, awayScore: 3 },
    { week: 17, homeTeamId: 'team_20', awayTeamId: 'team_08', homeScore: 3, awayScore: 0 },
    { week: 17, homeTeamId: 'team_01', awayTeamId: 'team_19', homeScore: 0, awayScore: 2 },
    { week: 17, homeTeamId: 'team_09', awayTeamId: 'team_10', homeScore: -1, awayScore: -1 },

    // Week 18
    { week: 18, homeTeamId: 'team_06', awayTeamId: 'team_20', homeScore: 5, awayScore: 0 },
    { week: 18, homeTeamId: 'team_04', awayTeamId: 'team_12', homeScore: 1, awayScore: 1 },
    { week: 18, homeTeamId: 'team_08', awayTeamId: 'team_18', homeScore: 0, awayScore: 1 },
    { week: 18, homeTeamId: 'team_11', awayTeamId: 'team_07', homeScore: 1, awayScore: 2 },
    { week: 18, homeTeamId: 'team_14', awayTeamId: 'team_15', homeScore: 2, awayScore: 3 },
    { week: 18, homeTeamId: 'team_01', awayTeamId: 'team_05', homeScore: 3, awayScore: 0 },
    { week: 18, homeTeamId: 'team_13', awayTeamId: 'team_08', homeScore: 2, awayScore: 0 },
    { week: 18, homeTeamId: 'team_12', awayTeamId: 'team_15', homeScore: 4, awayScore: 2 },
    { week: 18, homeTeamId: 'team_02', awayTeamId: 'team_16', homeScore: 2, awayScore: 3 },
    { week: 18, homeTeamId: 'team_11', awayTeamId: 'team_17', homeScore: -1, awayScore: -1 },

    // Weeks 19-38 (no results yet)
    ...Array.from({ length: 20 * 10 }, (_, i) => {
        const week = 19 + Math.floor(i / 10);
        const team1Index = i % 20;
        const team2Index = (i + 10) % 20;
        return {
            week,
            homeTeamId: teams[team1Index].id,
            awayTeamId: teams[team2Index].id,
            homeScore: -1,
            awayScore: -1,
        };
    })
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

function sortStandings(statsMap: Map<string, TeamStats>): CurrentStanding[] {
    const sorted = Array.from(statsMap.entries())
        .map(([teamId, stats]) => ({ ...stats, teamId }))
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

const MAX_WEEK = 18;

const finalStatsMap = calculateStandings(matches, MAX_WEEK);
export const standings: CurrentStanding[] = sortStandings(finalStatsMap);
const finalTeamRanks = new Map(standings.map(s => [s.teamId, s.rank]));

export const playerTeamScores: PlayerTeamScore[] = userList.flatMap(user => {
    const prediction = fullPredictions.find(p => p.userId === user.id);
    if (!prediction || !prediction.rankings) {
        return [];
    };

    return teams.map(team => {
        const predictedRank = prediction.rankings.indexOf(team.id) + 1;
        const actualRank = finalTeamRanks.get(team.id) || 0;
        const score = actualRank > 0 && predictedRank > 0 ? 5 - Math.abs(predictedRank - actualRank) : 0;
        return { userId: user.id, teamId: team.id, score };
    });
});

export const weeklyTeamStandings: WeeklyTeamStanding[] = [];
export const fullUserHistories: UserHistory[] = userList.map(u => ({ userId: u.id, weeklyScores: [] }));

for (let week = 1; week <= MAX_WEEK; week++) {
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
    const lastWeekData = history.find(s => s.week === MAX_WEEK) || { score: 0, rank: 0 };
    const prevWeekData = history.find(s => s.week === MAX_WEEK - 1) || { score: 0, rank: 0 };

    const allScores = history.map(s => s.score);
    const allRanks = history.map(s => s.rank).filter(r => r > 0);

    return {
        id: user.id,
        name: user.name,
        avatar: `${(i % 50) + 1}`,
        score: lastWeekData.score,
        rank: lastWeekData.rank,
        previousRank: prevWeekData.rank,
        previousScore: prevWeekData.score,
        rankChange: prevWeekData.rank > 0 && lastWeekData.rank > 0 ? prevWeekData.rank - lastWeekData.rank : 0,
        scoreChange: lastWeekData.score - prevWeekData.score,
        maxRank: allRanks.length > 0 ? Math.min(...allRanks) : 0,
        minRank: allRanks.length > 0 ? Math.max(...allRanks) : 0,
        maxScore: allScores.length > 0 ? Math.max(...allScores) : 0,
        minScore: allScores.length > 0 ? Math.min(...allScores) : 0,
        isPro: user.isPro || false,
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
    const teamMatches = matches.filter(m => m.week <= MAX_WEEK && (m.homeTeamId === team.id || m.awayTeamId === team.id))
        .sort((a,b) => b.week - a.week)
        .slice(0, 6);

    for (const match of teamMatches) {
        if (match.homeTeamId === team.id) {
            if (match.homeScore > match.awayScore) results.push('W');
            else if (match.homeScore < match.awayScore) results.push('L');
            else results.push('D');
        } else {
            if (match.awayScore > match.homeScore) results.push('W');
            else if (match.awayScore < match.homeScore) results.push('L');
            else results.push('D');
        }
    }
    
    while (results.length < 6) {
        results.unshift('-');
    }

    return { teamId: team.id, results: results.reverse() };
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

export const monthlyMimoM: MonthlyMimoM[] = [];

// Final exports for the app
export const users: User[] = fullUsers;
export const predictions: Prediction[] = fullPredictions;
export const userHistories: UserHistory[] = fullUserHistories;
