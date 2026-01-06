

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
    matchDate: string;
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
    { id: 'team_10', name: 'Leeds', logo: 'theater', bgColourFaint: 'rgba(255, 205, 0, 0.3)', bgColourSolid: '#FFCD00', textColour: '#1D428A', iconColour: '#1D428A' },
    { id: 'team_11', name: 'Burnley', logo: 'squirrel', bgColourFaint: 'rgba(108, 29, 69, 0.3)', bgColourSolid: '#6C1D45', textColour: '#99D6EA', iconColour: '#99D6EA' },
    { id: 'team_12', name: 'Liverpool', logo: 'origami', bgColourFaint: 'rgba(200, 16, 46, 0.3)', bgColourSolid: '#C8102E', textColour: '#000000', iconColour: '#FFFFFF' },
    { id: 'team_13', name: 'Man City', logo: 'sailboat', bgColourFaint: 'rgba(108, 171, 221, 0.3)', bgColourSolid: '#6CABDD', textColour: '#00285E', iconColour: '#00285E' },
    { id: 'team_14', name: 'Man Utd', logo: 'sparkles', bgColourFaint: 'rgba(218, 41, 28, 0.3)', bgColourSolid: '#DA291C', textColour: '#FBE122', iconColour: '#FBE122' },
    { id: 'team_15', name: 'Newcastle', logo: 'shieldUser', bgColourFaint: 'rgba(45, 41, 38, 0.3)', bgColourSolid: '#2D2926', textColour: '#FFFFFF', iconColour: '#FFFFFF' },
    { id: 'team_16', name: 'Notts Forest', logo: 'treeDeciduous', bgColourFaint: 'rgba(221, 0, 0, 0.3)', bgColourSolid: '#DD0000', textColour: '#FFFFFF', iconColour: '#FFFFFF' },
    { id: 'team_17', name: 'Sunderland', logo: 'gitlab', bgColourFaint: 'rgba(235, 20, 30, 0.3)', bgColourSolid: '#EB141E', textColour: '#FFFFFF', iconColour: '#FFFFFF' },
    { id: 'team_18', name: 'Tottenham', logo: 'home', bgColourFaint: 'rgba(19, 34, 83, 0.3)', bgColourSolid: '#132257', textColour: '#FFFFFF', iconColour: '#FFFFFF' },
    { id: 'team_19', name: 'West Ham', logo: 'hammer', bgColourFaint: 'rgba(122, 38, 58, 0.3)', bgColourSolid: '#7A263A', textColour: '#FBE122', iconColour: '#FBE122' },
    { id: 'team_20', name: 'Wolves', logo: 'flower', bgColourFaint: 'rgba(253, 190, 17, 0.3)', bgColourSolid: '#FDBE11', textColour: '#000000', iconColour: '#000000' }
];

const teamNameMapping: { [key: string]: string } = teams.reduce((acc, team) => {
    const lowerCaseName = team.name.toLowerCase();
    acc[lowerCaseName] = team.id;
    if (lowerCaseName === 'tottenham') acc['spurs'] = team.id;
    if (lowerCaseName === 'man city') acc['manchester city'] = team.id;
    if (lowerCaseName === 'man utd') acc['manchester united'] = team.id;
    if (lowerCaseName === 'notts forest') {
      acc['nottingham forest'] = team.id;
      acc['forest'] = team.id;
    }
    // Handle relegated team names from prediction data
    acc['ipswich town'] = 'team_10'; // Map to Leeds
    acc['ipswich'] = 'team_10';
    acc['leicester city'] = 'team_11'; // Map to Burnley
    acc['leicester'] = 'team_11';
    acc['southampton'] = 'team_17'; // Map to Sunderland
    
    return acc;
}, {} as { [key: string]: string });


const userListRaw = [
  { id: 'usr_001', name: 'Tom Wright'}, { id: 'usr_002', name: 'Barrie Cross'}, { id: 'usr_003', name: 'Dave Nightingale'},
  { id: 'usr_004', name: 'Pip Stokes'}, { id: 'usr_005', name: 'Alex Anderson'}, { id: 'usr_006', name: 'Nat Walsh'},
  { id: 'usr_007', name: 'Patrick Meese'}, { id: 'usr_008', name: 'Lee Harte'}, { id: 'usr_009', name: 'Jim Poole'},
  { id: 'usr_010', name: 'Lyndon Padmore'}, { id: 'usr_011', name: 'Alf Wroldsen'}, { id: 'usr_012', name: 'Steve Wroldsen'},
  { id: 'usr_013', name: 'Roger Wymer'}, { id: 'usr_014', name: 'Mike Wymer'}, { id: 'usr_015', name: 'Andy Belton'},
  { id: 'usr_016', name: 'Ernest Belton'}, { id: 'usr_017', name: 'Tim Birchall'}, { id: 'usr_018', name: 'Nathan Hyatt'},
  { id: 'usr_019', name: 'Rory Hyatt'}, { id: 'usr_020', name: 'Gaz Littlewood'}, { id: 'usr_021', name: 'Fazil Sediqi'},
  { id: 'usr_022', name: 'Shuhra Sediqi'}, { id: 'usr_023', name: 'Ilyas Taj Sediqi'}, { id: 'usr_024', name: 'Eshwa Sediqi'},
  { id: 'usr_025', name: 'Ben Fellows'}, { id: 'usr_026', name: 'Michelle Duffy-Turner'}, { id: 'usr_027', name: 'Nicola Spears'},
  { id: 'usr_028', name: 'Jamie Spears'}, { id: 'usr_029', name: 'Jonny Taylot'}, { id: 'usr_030', name: 'John Taylor'},
  { id: 'usr_031', name: 'Sam Dixon'}, { id: 'usr_032', name: 'Doug Potter'}, { id: 'usr_033', name: 'Finlay Sinclair'},
  { id: 'usr_034', name: 'Bart Ainsworth'}, { id: 'usr_035', name: 'Aidan Kehoe'}, { id: 'usr_036', name: 'Ben Patey'},
  { id: 'usr_037', name: 'Theo Gresson'}, { id: 'usr_038', name: 'Adam Barclay'}, { id: 'usr_039', name: 'James Eldred'},
  { id: 'usr_040', name: 'Otis Eldred'}, { id: 'usr_041', name: 'Dan Coles'}, { id: 'usr_042', name: 'Daniel Crick'},
  { id: 'usr_043', name: 'Sheila McKenzie'}, { id: 'usr_044', name: 'Chris Dodds'}, { id: 'usr_045', name: 'Rich Seddon'},
  { id: 'usr_046', name: 'Ross Allatt'}, { id: 'usr_047', name: 'Neville Johnson'}, { id: 'usr_048', name: 'Julian Spears'},
  { id: 'usr_049', name: 'Andrew Spears'}, { id: 'usr_050', name: 'Danny Broom'}, { id: 'usr_051', name: 'Paul Hammett'},
  { id: 'usr_052', name: 'Tom Gill'}, { id: 'usr_053', name: 'Ronnie Bain'}, { id: 'usr_054', name: 'Matthew Bain'},
  { id: 'usr_055', name: 'Sam Bain'}, { id: 'usr_056', name: 'Andy Barnes'}, { id: 'usr_057', name: 'Pascal Walls'},
  { id: 'usr_058', name: 'Steve Lawrence'}, { id: 'usr_059', name: 'Gill Butler'}, { id: 'usr_060', name: 'Tom Coles'},
  { id: 'usr_061', name: 'Tom Poole'}, { id: 'usr_062', name: 'Eddie Spencer'}, { id: 'usr_063', name: 'Rory Poole'},
  { id: 'usr_064', name: 'Scott Emmett'}, { id: 'usr_065', name: 'Craig Temporal'}, { id: 'usr_066', name: 'Andy Senior'},
  { id: 'usr_067', name: 'Dan Brown'}, { id: 'usr_068', name: 'Rupert Massey'}, { id: 'usr_069', name: 'Matt Howard'},
  { id: 'usr_070', name: 'Justin Downing'}, { id: 'usr_071', name: 'Sam Burgess'}, { id: 'usr_072', name: 'George Roberts'},
  { id: 'usr_073', name: 'Leyton Collings'}, { id: 'usr_074', name: 'Ben Cox'}, { id: 'usr_075', name: 'Adam F Bain'},
  { id: 'usr_076', name: 'Amy Parkinson'}, { id: 'usr_077', name: 'Stven Bain'}, { id: 'usr_078', name: 'Ian Scotland'},
  { id: 'usr_079', name: 'Ben Dawes'}, { id: 'usr_080', name: 'Tom Bywater'}, { id: 'usr_081', name: 'Jack Murray'},
  { id: 'usr_082', name: 'Rob Mabon'}, { id: 'usr_083', name: 'Andrew Trafford'}, { id: 'usr_084', name: 'Luca Trafford'},
  { id: 'usr_085', name: 'Craig Stevens'}, { id: 'usr_086', name: 'George Butterworth'}, { id: 'usr_087', name: 'Ashley Davies'},
  { id: 'usr_088', name: 'Duncan Holder'}, { id: 'usr_089', name: 'Arthur Gwyn-Davies'}, { id: 'usr_090', name: 'Paul Stonier'},
  { id: 'usr_091', name: 'Jember Weekes'}, { id: 'usr_092', name: 'Tom Kehoe'}, { id: 'usr_093', name: 'Chris Burston'},
  { id: 'usr_094', name: 'Malcolm Sinclair'}, { id: 'usr_095', name: 'Dan Parkinson'}, { id: 'usr_096', name: 'Alfie Skingley'},
  { id: 'usr_097', name: 'Bev Skingley'}, { id: 'usr_098', name: 'Dan Skingley'}, { id: 'usr_099', name: 'Ken Skingley'},
  { id: 'usr_100', name: 'Lyndsey Preece'}, { id: 'usr_101', name: 'Kane Sullivan'}, { id: 'usr_102', name: 'Graeme Bailie'},
  { id: 'usr_103', name: 'Dan Dawson'}, { id: 'usr_104', name: 'Alix Nicholls'}, { id: 'usr_105', name: 'Alistair Whitfield'},
  { id: 'usr_106', name: 'THE PREM-MEM', isPro: true }, { id: 'usr_107', name: 'THE AI', isPro: true }, { id: 'usr_108', name: 'THE SUPERCOMPUTER', isPro: true }, { id: 'usr_109', name: 'Alex Liston' }
];

export const userList = userListRaw.map(u => ({ ...u, name: u.isPro ? u.name : u.name.replace(/\b\w/g, l => l.toUpperCase()).replace(/\B[A-Z]/g, l => l.toLowerCase()) }));

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
    "usr_001":["Man Utd","Liverpool","Man City","Arsenal","Newcastle","Chelsea","Aston Villa","Notts Forest","Tottenham","Bournemouth","Brighton","Fulham","Brentford","Leeds","Crystal Palace","West Ham","Wolves","Everton","Burnley","Sunderland"],
    "usr_002":["Liverpool","Man City","Arsenal","Chelsea","Aston Villa","Newcastle","Notts Forest","Crystal Palace","Brighton","Man Utd","Tottenham","Bournemouth","Brentford","Fulham","Everton","Leeds","Wolves","West Ham","Burnley","Sunderland"],
    "usr_003":["Liverpool","Arsenal","Man City","Chelsea","Newcastle","Man Utd","Aston Villa","Tottenham","Brighton","Bournemouth","Notts Forest","Everton","Crystal Palace","Fulham","West Ham","Brentford","Wolves","Leeds","Burnley","Sunderland"],
    "usr_004":["Liverpool","Man City","Chelsea","Arsenal","Aston Villa","Newcastle","Brighton","Tottenham","Notts Forest","Fulham","Man Utd","Bournemouth","Everton","Crystal Palace","Wolves","West Ham","Brentford","Leeds","Burnley","Sunderland"],
    "usr_005":["Chelsea","Man City","Liverpool","Arsenal","Aston Villa","Newcastle","Tottenham","Brighton","Man Utd","Fulham","Bournemouth","Brentford","Leeds","Everton","Crystal Palace","Wolves","West Ham","Notts Forest","Burnley","Sunderland"],
    "usr_006":["Chelsea","Man City","Liverpool","Arsenal","Newcastle","Man Utd","Everton","Aston Villa","Crystal Palace","Brighton","Notts Forest","Leeds","West Ham","Sunderland","Tottenham","Wolves","Bournemouth","Fulham","Brentford","Burnley"],
    "usr_007":["Man City","Liverpool","Arsenal","Chelsea","Newcastle","Aston Villa","Tottenham","Man Utd","Bournemouth","Notts Forest","Fulham","Brighton","Wolves","Crystal Palace","West Ham","Leeds","Everton","Brentford","Sunderland","Burnley"],
    "usr_008":["Liverpool","Man City","Arsenal","Chelsea","Aston Villa","Man Utd","Tottenham","Newcastle","Bournemouth","Brighton","Everton","West Ham","Fulham","Crystal Palace","Wolves","Notts Forest","Brentford","Leeds","Sunderland","Burnley"],
    "usr_009":["Liverpool","Man City","Arsenal","Chelsea","Aston Villa","Newcastle","Tottenham","Man Utd","Notts Forest","Everton","Brighton","Brentford","West Ham","Bournemouth","Fulham","Crystal Palace","Wolves","Burnley","Leeds","Sunderland"],
    "usr_010":["Man City","Liverpool","Arsenal","Chelsea","Tottenham","Man Utd","Aston Villa","Newcastle","West Ham","Everton","Brighton","Wolves","Brentford","Fulham","Crystal Palace","Bournemouth","Notts Forest","Leeds","Burnley","Sunderland"],
    "usr_011":["Man City","Liverpool","Arsenal","Chelsea","Aston Villa","Man Utd","Tottenham","Newcastle","Everton","Brighton","Crystal Palace","Fulham","West Ham","Brentford","Bournemouth","Notts Forest","Sunderland","Wolves","Burnley","Leeds"],
    "usr_012":["Man City","Arsenal","Liverpool","Chelsea","Aston Villa","Newcastle","Brentford","Bournemouth","Notts Forest","Brighton","Crystal Palace","Everton","Man Utd","Tottenham","Fulham","West Ham","Wolves","Sunderland","Burnley","Leeds"],
    "usr_013":["Liverpool","Man City","Arsenal","Newcastle","Man Utd","Chelsea","Tottenham","Everton","Aston Villa","West Ham","Crystal Palace","Brighton","Fulham","Brentford","Notts Forest","Wolves","Bournemouth","Sunderland","Leeds","Burnley"],
    "usr_014":["Liverpool","Arsenal","Newcastle","Chelsea","Man City","Man Utd","Tottenham","Aston Villa","Everton","Bournemouth","Brighton","West Ham","Fulham","Crystal Palace","Sunderland","Wolves","Brentford","Notts Forest","Leeds","Burnley"],
    "usr_015":["Liverpool","Chelsea","Man City","Arsenal","Aston Villa","Man Utd","Newcastle","Tottenham","West Ham","Brighton","Notts Forest","Everton","Fulham","Crystal Palace","Wolves","Bournemouth","Sunderland","Brentford","Burnley","Leeds"],
    "usr_016":["Man City","Liverpool","Arsenal","Chelsea","Man Utd","Aston Villa","Newcastle","Tottenham","Notts Forest","Bournemouth","Crystal Palace","Everton","Brighton","West Ham","Brentford","Wolves","Fulham","Leeds","Burnley","Sunderland"],
    "usr_017":["Liverpool","Man City","Arsenal","Chelsea","Brighton","Notts Forest","Man Utd","Tottenham","Fulham","Crystal Palace","Everton","Aston Villa","West Ham","Newcastle","Leeds","Wolves","Bournemouth","Brentford","Sunderland","Burnley"],
    "usr_018":["Liverpool","Arsenal","Man City","Chelsea","Newcastle","Man Utd","Aston Villa","Tottenham","Notts Forest","Brighton","Bournemouth","Crystal Palace","Everton","Wolves","Fulham","West Ham","Brentford","Leeds","Sunderland","Burnley"],
    "usr_019":["Arsenal","Liverpool","Chelsea","Man City","Aston Villa","Notts Forest","Newcastle","Brighton","Bournemouth","Tottenham","Brentford","Fulham","Man Utd","Everton","West Ham","Crystal Palace","Wolves","Leeds","Sunderland","Burnley"],
    "usr_020":["Liverpool","Arsenal","Chelsea","Man City","Aston Villa","Man Utd","Newcastle","Crystal Palace","Notts Forest","Brighton","Bournemouth","Everton","Tottenham","Brentford","Fulham","West Ham","Wolves","Leeds","Burnley","Sunderland"],
    "usr_021":["Liverpool","Arsenal","Man City","Man Utd","Chelsea","Aston Villa","Tottenham","Newcastle","Crystal Palace","Brighton","Notts Forest","Bournemouth","Brentford","Everton","West Ham","Fulham","Wolves","Leeds","Burnley","Sunderland"],
    "usr_022":["Liverpool","Man City","Chelsea","Arsenal","Aston Villa","Bournemouth","Man Utd","Newcastle","Crystal Palace","Brighton","Notts Forest","Fulham","Brentford","West Ham","Everton","Tottenham","Wolves","Burnley","Leeds","Sunderland"],
    "usr_023":["Arsenal","Man City","Liverpool","Newcastle","Chelsea","Notts Forest","Man Utd","Tottenham","Wolves","Fulham","West Ham","Crystal Palace","Brentford","Brighton","Everton","Bournemouth","Leeds","Aston Villa","Sunderland","Burnley"],
    "usr_024":["Liverpool","Man City","Arsenal","Chelsea","Newcastle","Everton","Bournemouth","Aston Villa","Brighton","Notts Forest","Crystal Palace","Fulham","Man Utd","West Ham","Wolves","Tottenham","Leeds","Brentford","Sunderland","Burnley"],
    "usr_025":["Arsenal","Man City","Liverpool","Chelsea","Man Utd","Aston Villa","Crystal Palace","Newcastle","Tottenham","Brighton","Everton","Bournemouth","Notts Forest","Brentford","Fulham","West Ham","Wolves","Leeds","Burnley","Sunderland"],
    "usr_026":["Chelsea","Man City","Liverpool","Arsenal","Aston Villa","Newcastle","Everton","Bournemouth","Man Utd","Crystal Palace","Brighton","Tottenham","Notts Forest","West Ham","Fulham","Wolves","Leeds","Brentford","Sunderland","Burnley"],
    "usr_027":["Chelsea","Liverpool","Man City","Arsenal","Aston Villa","Newcastle","Tottenham","Man Utd","Notts Forest","Brighton","Brentford","Leeds","Everton","Bournemouth","Crystal Palace","Fulham","Burnley","West Ham","Sunderland","Wolves"],
    "usr_028":["Liverpool","Chelsea","Arsenal","Notts Forest","Man City","Bournemouth","Newcastle","Tottenham","Wolves","Aston Villa","Brighton","Everton","Crystal Palace","Man Utd","West Ham","Fulham","Leeds","Burnley","Brentford","Sunderland"],
    "usr_029":["Liverpool","Arsenal","Man City","Chelsea","Aston Villa","Newcastle","Tottenham","Man Utd","Brighton","Notts Forest","Everton","Bournemouth","Crystal Palace","Fulham","West Ham","Brentford","Wolves","Leeds","Sunderland","Burnley"],
    "usr_030":["Man City","Arsenal","Liverpool","Chelsea","Newcastle","Aston Villa","Tottenham","Man Utd","Crystal Palace","Fulham","Notts Forest","Brighton","Bournemouth","Everton","West Ham","Leeds","Wolves","Brentford","Burnley","Sunderland"],
    "usr_031":["Liverpool","Man City","Arsenal","Chelsea","Tottenham","Aston Villa","Newcastle","Brighton","Man Utd","Crystal Palace","Everton","West Ham","Notts Forest","Bournemouth","Wolves","Fulham","Leeds","Brentford","Burnley","Sunderland"],
    "usr_032":["Liverpool","Man City","Arsenal","Chelsea","Aston Villa","Newcastle","Man Utd","Tottenham","Notts Forest","Brighton","Everton","Bournemouth","Fulham","Brentford","West Ham","Crystal Palace","Leeds","Wolves","Burnley","Sunderland"],
    "usr_033":["Man City","Arsenal","Chelsea","Liverpool","Man Utd","Aston Villa","Tottenham","Brighton","Newcastle","Bournemouth","Everton","Fulham","Crystal Palace","West Ham","Notts Forest","Brentford","Sunderland","Wolves","Leeds","Burnley"],
    "usr_034":["Man City","Liverpool","Chelsea","Arsenal","Aston Villa","Tottenham","Man Utd","Brighton","Newcastle","Crystal Palace","Bournemouth","Notts Forest","Fulham","Everton","West Ham","Brentford","Leeds","Sunderland","Wolves","Burnley"],
    "usr_035":["Arsenal","Liverpool","Aston Villa","Man City","Chelsea","Man Utd","Tottenham","Brighton","Newcastle","Bournemouth","Notts Forest","Everton","Fulham","Crystal Palace","Wolves","Sunderland","Leeds","West Ham","Brentford","Burnley"],
    "usr_036":["Liverpool","Man City","Arsenal","Chelsea","Man Utd","Aston Villa","Newcastle","Brighton","Tottenham","Everton","Fulham","Bournemouth","West Ham","Crystal Palace","Notts Forest","Brentford","Wolves","Leeds","Burnley","Sunderland"],
    "usr_037":["Liverpool","Man City","Chelsea","Arsenal","Man Utd","Aston Villa","Tottenham","Everton","Newcastle","Crystal Palace","Brighton","Bournemouth","Notts Forest","Fulham","West Ham","Brentford","Wolves","Burnley","Leeds","Sunderland"],
    "usr_038":["Liverpool","Arsenal","Man City","Chelsea","Aston Villa","Newcastle","Man Utd","Brighton","Tottenham","Notts Forest","Crystal Palace","Everton","Bournemouth","Fulham","West Ham","Brentford","Wolves","Burnley","Leeds","Sunderland"],
    "usr_039":["Liverpool","Arsenal","Man City","Chelsea","Man Utd","Aston Villa","Tottenham","Newcastle","Notts Forest","Brighton","Fulham","Bournemouth","Everton","Crystal Palace","Brentford","West Ham","Leeds","Wolves","Burnley","Sunderland"],
    "usr_040":["Liverpool","Man City","Man Utd","Chelsea","Tottenham","Arsenal","Aston Villa","Everton","Fulham","Crystal Palace","Newcastle","Notts Forest","West Ham","Brighton","Bournemouth","Sunderland","Wolves","Burnley","Brentford","Leeds"],
    "usr_041":["MAN CITY","CHELSEA","LIVERPOOL","ARSENAL","TOTTENHAM","ASTON VILLA","MAN UTD","NEWCASTLE","EVERTON","BRIGHTON","NOTTS FOREST","CRYSTAL PALACE","WEST HAM","FULHAM","WOLVES","LEEDS","BRENTFORD","BOURNEMOUTH","SUNDERLAND","BURNLEY"],
    "usr_042":["Liverpool","Man City","Chelsea","Arsenal","Aston Villa","Newcastle","Man Utd","Tottenham","Crystal Palace","Brighton","Bournemouth","Notts Forest","Fulham","West Ham","Everton","Wolves","Leeds","Sunderland","Brentford","Burnley"],
    "usr_043":["Liverpool","Arsenal","Man City","Chelsea","Newcastle","Tottenham","Aston Villa","Brighton","Man Utd","Crystal Palace","Notts Forest","Bournemouth","Everton","Wolves","Fulham","West Ham","Brentford","Leeds","Sunderland","Burnley"],
    "usr_044":["Liverpool","Chelsea","Arsenal","Man City","Tottenham","Man Utd","Newcastle","Aston Villa","Brighton","Notts Forest","Crystal Palace","Everton","West Ham","Bournemouth","Fulham","Brentford","Wolves","Leeds","Sunderland","Burnley"],
    "usr_045":["Man City","Arsenal","Man Utd","Newcastle","Liverpool","Chelsea","Tottenham","Brighton","Aston Villa","West Ham","Brentford","Crystal Palace","Fulham","Wolves","Notts Forest","Everton","Bournemouth","Sunderland","Burnley","Leeds"],
    "usr_046":["Man City","Arsenal","Liverpool","Chelsea","Newcastle","Man Utd","Brighton","Aston Villa","Tottenham","Notts Forest","Fulham","Crystal Palace","Everton","Bournemouth","Burnley","Brentford","Leeds","Wolves","West Ham","Sunderland"],
    "usr_047":["Chelsea","Liverpool","Man City","Man Utd","Arsenal","Newcastle","Crystal Palace","Brighton","Aston Villa","Notts Forest","Tottenham","Everton","Wolves","Bournemouth","Fulham","Leeds","West Ham","Burnley","Brentford","Sunderland"],
    "usr_048":["Chelsea","Liverpool","Man City","Arsenal","Newcastle","Man Utd","Aston Villa","Tottenham","Brighton","Fulham","Crystal Palace","Notts Forest","Wolves","Leeds","Bournemouth","Brentford","Everton","Burnley","West Ham","Sunderland"],
    "usr_049":["Liverpool","Chelsea","Man City","Arsenal","Newcastle","Man Utd","Crystal Palace","Aston Villa","Brighton","Fulham","Tottenham","Notts Forest","Wolves","Everton","Bournemouth","Brentford","Leeds","Burnley","West Ham","Sunderland"],
    "usr_050":["Chelsea","Liverpool","Man City","Arsenal","Tottenham","Newcastle","Aston Villa","Notts Forest","Crystal Palace","Man Utd","Bournemouth","Brighton","West Ham","Fulham","Everton","Wolves","Sunderland","Brentford","Leeds","Burnley"],
    "usr_051":["Liverpool","Chelsea","Man City","Arsenal","Aston Villa","Newcastle","Notts Forest","Brighton","Bournemouth","Man Utd","Everton","Brentford","West Ham","Crystal Palace","Fulham","Tottenham","Wolves","Burnley","Leeds","Sunderland"],
    "usr_052":["Man City","Chelsea","Liverpool","Arsenal","Man Utd","Aston Villa","Newcastle","Everton","Tottenham","Crystal Palace","Brighton","West Ham","Fulham","Notts Forest","Sunderland","Bournemouth","Burnley","Leeds","Brentford","Wolves"],
    "usr_053":["Arsenal","Liverpool","Man City","Chelsea","Aston Villa","Newcastle","Tottenham","Man Utd","Everton","Notts Forest","Brighton","Brentford","West Ham","Fulham","Leeds","Crystal Palace","Wolves","Bournemouth","Sunderland","Burnley"],
    "usr_054":["Liverpool","Man City","Chelsea","Tottenham","Newcastle","Man Utd","Aston Villa","Notts Forest","Arsenal","Everton","Crystal Palace","Brighton","Fulham","Bournemouth","Leeds","Sunderland","West Ham","Brentford","Wolves","Burnley"],
    "usr_055":["Chelsea","Liverpool","Man City","Arsenal","Newcastle","Aston Villa","Notts Forest","Everton","Man Utd","Crystal Palace","Brighton","Bournemouth","Fulham","Brentford","Tottenham","West Ham","Leeds","Wolves","Burnley","Sunderland"],
    "usr_056":["Liverpool","Man City","Chelsea","Arsenal","Newcastle","Tottenham","Man Utd","Brighton","Aston Villa","Bournemouth","Brentford","Everton","Notts Forest","West Ham","Fulham","Crystal Palace","Leeds","Sunderland","Wolves","Burnley"],
    "usr_057":["Liverpool","Man City","Arsenal","Chelsea","Notts Forest","Man Utd","Brighton","Aston Villa","Newcastle","Crystal Palace","Everton","Tottenham","Fulham","Bournemouth","West Ham","Brentford","Sunderland","Wolves","Leeds","Burnley"],
    "usr_058":["Arsenal","Liverpool","Man City","Man Utd","Chelsea","Aston Villa","Newcastle","Brighton","Notts Forest","Tottenham","Fulham","Crystal Palace","Everton","Wolves","Bournemouth","West Ham","Leeds","Burnley","Brentford","Sunderland"],
    "usr_059":["Arsenal","Chelsea","Man City","liverpool","man utd","Aston Villa","Tottenham","Notts Forest","Crystal Palace","Newcastle","Bournemouth","Brighton","Fulham","everton","West Ham","wolves","Sunderland","Leeds","Brentford","Burnley"],
    "usr_060":["Liverpool","Arsenal","Chelsea","Man City","Newcastle","Tottenham","Aston Villa","Man Utd","Bournemouth","Brighton","Notts Forest","Crystal Palace","West Ham","Brentford","Fulham","Wolves","Everton","Leeds","Burnley","Sunderland"],
    "usr_061":["Liverpool","Arsenal","Man City","Chelsea","Aston Villa","Crystal Palace","Newcastle","Brighton","Bournemouth","Notts Forest","Tottenham","Man Utd","Brentford","Fulham","Everton","West Ham","Wolves","Burnley","Leeds","Sunderland"],
    "usr_062":["Liverpool","Man City","Arsenal","Chelsea","Tottenham","Man Utd","Newcastle","Aston Villa","Everton","Brighton","Notts Forest","Brentford","Bournemouth","Crystal Palace","West Ham","Fulham","Wolves","Leeds","Burnley","Sunderland"],
    "usr_063":["Liverpool","Arsenal","Man City","Chelsea","Aston villa","Notts forest","Crystal palace","Newcastle","brighton","bournemouth","Tottenham","Man utd","Brentford","West Ham","Everton","Fulham","Leeds","Wolves","Burnley","Sunderland"],
    "usr_064":["Liverpool","Man City","Chelsea","Arsenal","Aston Villa","Tottenham","Man Utd","Newcastle","Brighton","Notts Forest","Crystal Palace","Everton","Bournemouth","West Ham","Brentford","Fulham","Sunderland","Leeds","Wolves","Burnley"],
    "usr_065":["Chelsea","Liverpool","Man City","Arsenal","Brighton","Aston Villa","Man Utd","Newcastle","Notts Forest","Tottenham","Everton","Leeds","Crystal Palace","West Ham","Fulham","Sunderland","Wolves","Bournemouth","Brentford","Burnley"],
    "usr_066":["Liverpool","Chelsea","Arsenal","Man City","Newcastle","Aston Villa","Tottenham","Man Utd","Brighton","Bournemouth","Notts Forest","Fulham","Everton","Brentford","Crystal Palace","West Ham","Sunderland","Wolves","Leeds","Burnley"],
    "usr_067":["Liverpool","Arsenal","Chelsea","Man City","Newcastle","Aston Villa","Tottenham","Man Utd","Brighton","Crystal Palace","Bournemouth","Fulham","Everton","Wolves","Notts Forest","Brentford","West Ham","Leeds","Burnley","Sunderland"],
    "usr_068":["Liverpool","Arsenal","Man City","Chelsea","Man Utd","Newcastle","Aston Villa","Everton","Tottenham","Brighton","Notts Forest","Crystal Palace","Bournemouth","Fulham","West Ham","Wolves","Leeds","Brentford","Burnley","Sunderland"],
    "usr_069":["Arsenal","Man City","Liverpool","Man Utd","Chelsea","Aston Villa","Tottenham","Newcastle","Notts Forest","Brighton","Bournemouth","Everton","Crystal Palace","Brentford","Fulham","West Ham","Wolves","Leeds","Burnley","Sunderland"],
    "usr_070":["Liverpool","Arsenal","Man City","Newcastle","Chelsea","Aston Villa","Brighton","Crystal Palace","Brentford","Notts Forest","Man Utd","Tottenham","Bournemouth","Everton","Fulham","West Ham","Leeds","Wolves","Burnley","Sunderland"],
    "usr_071":["Man City","Chelsea","Liverpool","Arsenal","Aston Villa","Newcastle","Tottenham","Man Utd","Notts Forest","West Ham","Fulham","Brighton","Everton","Crystal Palace","Bournemouth","Leeds","Brentford","Wolves","Sunderland","Burnley"],
    "usr_072":["Arsenal","Liverpool","Man City","Chelsea","Aston Villa","Newcastle","Man Utd","Brighton","Tottenham","Bournemouth","Notts Forest","Wolves","Fulham","Crystal Palace","Everton","Brentford","Sunderland","West Ham","Burnley","Leeds"],
    "usr_073":["Liverpool","Man City","Chelsea","Arsenal","Newcastle","Man Utd","Aston Villa","Notts Forest","Fulham","Tottenham","Everton","Crystal Palace","Brighton","Bournemouth","West Ham","Brentford","Wolves","Leeds","Burnley","Sunderland"],
    "usr_074":["Liverpool","Man City","Chelsea","Arsenal","Aston Villa","Man Utd","Newcastle","Notts Forest","Crystal Palace","Everton","Tottenham","Bournemouth","Fulham","Brighton","Wolves","Leeds","West Ham","Brentford","Sunderland","Burnley"],
    "usr_075":["Liverpool","Man City","Chelsea","Arsenal","Tottenham","Man Utd","Newcastle","Aston Villa","Leeds","Crystal Palace","Brighton","Wolves","Everton","Notts Forest","Sunderland","West Ham","Fulham","Brentford","Bournemouth","Burnley"],
    "usr_076":["Liverpool","Arsenal","Man City","Chelsea","Newcastle","Aston Villa","Crystal Palace","Notts Forest","Brighton","Brentford","Bournemouth","Man Utd","Fulham","Everton","Tottenham","West Ham","Burnley","Wolves","Leeds","Sunderland"],
    "usr_077":["Liverpool","Arsenal","Chelsea","Man City","Aston Villa","Newcastle","Crystal Palace","Brighton","Man Utd","Tottenham","Everton","Sunderland","Notts Forest","Brentford","West Ham","Leeds","Fulham","Wolves","Bournemouth","Burnley"],
    "usr_078":["Man City","Liverpool","Chelsea","Arsenal","Notts Forest","Man Utd","Tottenham","Brighton","Newcastle","Bournemouth","Aston Villa","Everton","Fulham","Crystal Palace","Brentford","West Ham","Burnley","Wolves","Leeds","Sunderland"],
    "usr_079":["Liverpool","Chelsea","Man City","Arsenal","Man Utd","Aston Villa","Newcastle","Tottenham","Everton","Crystal Palace","Notts Forest","Bournemouth","Brighton","Brentford","West Ham","Fulham","Burnley","Leeds","Wolves","Sunderland"],
    "usr_080":["Liverpool","Arsenal","Man City","Chelsea","Aston Villa","Newcastle","Tottenham","Man Utd","Brighton","Crystal Palace","Notts Forest","Everton","Wolves","West Ham","Fulham","Bournemouth","Brentford","Leeds","Sunderland","Burnley"],
    "usr_081":["Arsenal","Liverpool","Chelsea","Man City","Man Utd","Newcastle","Aston Villa","Tottenham","Brighton","Notts Forest","Crystal Palace","West Ham","Wolves","Everton","Brentford","Sunderland","Fulham","Leeds","Bournemouth","Burnley"],
    "usr_082":["Liverpool","Arsenal","Man City","Chelsea","Aston Villa","Man Utd","Tottenham","Newcastle","Brighton","Notts Forest","Crystal Palace","Everton","Bournemouth","Fulham","West Ham","Wolves","Leeds","Burnley","Sunderland","Brentford"],
    "usr_083":["Arsenal","Liverpool","Crystal Palace","Chelsea","Man City","Aston Villa","Newcastle","Brighton","Man Utd","Notts Forest","Tottenham","Everton","Bournemouth","Brentford","Wolves","Fulham","Leeds","West Ham","Sunderland","Burnley"],
    "usr_084":["Liverpool","Arsenal","Man City","Chelsea","Newcastle","Aston Villa","Brighton","West Ham","Man Utd","Tottenham","Crystal Palace","Wolves","Fulham","Brentford","Bournemouth","Notts Forest","Everton","Leeds","Burnley","Sunderland"],
    "usr_085":["Liverpool","Man City","Chelsea","Arsenal","Newcastle","Tottenham","Man Utd","Aston Villa","Crystal Palace","Brighton","Notts Forest","Bournemouth","Everton","Fulham","West Ham","Leeds","Wolves","Brentford","Sunderland","Burnley"],
    "usr_086":["Arsenal","Liverpool","Man City","Chelsea","Aston Villa","Newcastle","Notts Forest","Everton","Bournemouth","Brighton","Crystal Palace","Tottenham","Fulham","Man Utd","Brentford","West Ham","Wolves","Leeds","Sunderland","Burnley"],
    "usr_087":["Liverpool","Man City","Arsenal","Chelsea","Newcastle","Aston Villa","Man Utd","Brighton","Tottenham","Crystal Palace","Notts Forest","Bournemouth","Fulham","Everton","West Ham","Wolves","Sunderland","Brentford","Leeds","Burnley"],
    "usr_088":["Liverpool","Chelsea","Arsenal","Man City","Man Utd","Tottenham","Aston Villa","Crystal Palace","Newcastle","Everton","West Ham","Fulham","Brighton","Brentford","Notts Forest","Bournemouth","Leeds","Burnley","Wolves","Sunderland"],
    "usr_089":["Liverpool","Arsenal","Chelsea","Man City","Newcastle","Aston Villa","Man Utd","Brighton","Crystal Palace","Tottenham","Notts Forest","Bournemouth","Fulham","Brentford","Everton","West Ham","Wolves","Sunderland","Leeds","Burnley"],
    "usr_090":["Man Utd","Liverpool","Arsenal","Man City","Aston Villa","Chelsea","Tottenham","Burnley","Bournemouth","Brighton","Notts Forest","Fulham","Newcastle","Brentford","Crystal Palace","Sunderland","Leeds","Everton","Wolves","West Ham"],
    "usr_091":["Man City","Arsenal","Liverpool","Aston Villa","Chelsea","Crystal Palace","Tottenham","Man Utd","Newcastle","Fulham","Leeds","Bournemouth","Burnley","Wolves","Notts Forest","Brentford","Brighton","Everton","Sunderland","West Ham"],
    "usr_092":["Liverpool","Arsenal","Man City","Chelsea","Aston Villa","Newcastle","Tottenham","Man Utd","Brighton","Crystal Palace","Notts Forest","Fulham","Brentford","West Ham","Bournemouth","Everton","Wolves","Leeds","Sunderland","Burnley"],
    "usr_093":["Liverpool","Arsenal","Man City","Chelsea","Aston Villa","Tottenham","Newcastle","Brighton","Man Utd","Notts Forest","Crystal Palace","Brentford","Bournemouth","Everton","Fulham","West Ham","Wolves","Burnley","Leeds","Sunderland"],
    "usr_094":["Liverpool","Man City","Chelsea","Arsenal","Aston Villa","Man Utd","Newcastle","Tottenham","Brighton","Everton","Bournemouth","Notts Forest","Crystal Palace","Fulham","West Ham","Leeds","Brentford","Burnley","Wolves","Sunderland"],
    "usr_095":["Liverpool","Man City","Chelsea","Arsenal","Newcastle","Man Utd","Aston Villa","Tottenham","Brighton","Crystal Palace","Bournemouth","West Ham","Fulham","Everton","Notts Forest","Wolves","Burnley","Leeds","Brentford","Sunderland"],
    "usr_096":["Arsenal","Liverpool","Man City","Chelsea","Aston Villa","Tottenham","Man Utd","Crystal Palace","Newcastle","Notts Forest","Everton","Brighton","West Ham","Fulham","Bournemouth","Brentford","Leeds","Sunderland","Wolves","Burnley"],
    "usr_097":["Arsenal","Liverpool","Chelsea","Man City","Aston Villa","Tottenham","Notts Forest","Crystal Palace","Man Utd","Brighton","Everton","Brentford","Newcastle","West Ham","Leeds","Wolves","Fulham","Sunderland","Burnley","Bournemouth"],
    "usr_098":["Arsenal","Chelsea","Liverpool","Man City","Tottenham","Man Utd","Crystal Palace","Aston Villa","Everton","Newcastle","Brighton","Notts Forest","West Ham","Fulham","Bournemouth","Brentford","Leeds","Wolves","Burnley","Sunderland"],
    "usr_099":["Arsenal","Liverpool","Man City","Chelsea","Man Utd","Newcastle","Notts Forest","Aston Villa","Bournemouth","Tottenham","Brighton","Brentford","Crystal Palace","Leeds","West Ham","Everton","Fulham","Wolves","Burnley","Sunderland"],
    "usr_100":["Arsenal","Man City","Liverpool","Chelsea","Man Utd","Fulham","Notts Forest","Aston Villa","Newcastle","Leeds","Crystal Palace","Tottenham","Bournemouth","Everton","Sunderland","Brighton","West Ham","Brentford","Wolves","Burnley"],
    "usr_101":["Liverpool","Arsenal","Man City","Chelsea","Newcastle","Man Utd","Aston Villa","Tottenham","West Ham","Everton","Brighton","Wolves","Brentford","Fulham","Crystal Palace","Bournemouth","Notts Forest","Leeds","Sunderland","Burnley"],
    "usr_102":["Man Utd","Liverpool","Arsenal","Man City","Aston Villa","Chelsea","Tottenham","Newcastle","Crystal Palace","Brighton","Everton","Leeds","Fulham","Sunderland","Bournemouth","West Ham","Notts Forest","Brentford","Wolves","Burnley"],
    "usr_103":["Man City","Liverpool","Arsenal","Chelsea","Tottenham","Aston Villa","Newcastle","Man Utd","Notts Forest","Crystal Palace","Everton","West Ham","Bournemouth","Brighton","Wolves","Fulham","Leeds","Brentford","Sunderland","Burnley"],
    "usr_104":["Liverpool","Arsenal","Man City","Chelsea","Newcastle","Tottenham","Man Utd","Aston Villa","Brighton","Fulham","Notts Forest","Everton","Crystal Palace","Brentford","Bournemouth","Wolves","West Ham","Leeds","Burnley","Sunderland"],
    "usr_105":["Arsenal","Man City","Liverpool","Chelsea","Aston Villa","Tottenham","Man Utd","Newcastle","Fulham","Everton","Crystal Palace","Bournemouth","Wolves","Brighton","West Ham","Notts Forest","Leeds","Burnley","Sunderland","Brentford"],
    "usr_106":["Liverpool","Man City","Arsenal","Chelsea","Aston Villa","Newcastle","Man Utd","Tottenham","Brighton","Notts Forest","Crystal Palace","Everton","Bournemouth","Fulham","West Ham","Brentford","Wolves","Leeds","Sunderland","Burnley"],
    "usr_107":["Liverpool","Arsenal","Man City","Newcastle","Chelsea","Aston Villa","Notts Forest","Tottenham","Brighton","Fulham","Man Utd","Everton","West Ham","Bournemouth","Brentford","Leeds","Crystal Palace","Wolves","Burnley","Sunderland"],
    "usr_108":["Man City","Arsenal","Liverpool","Chelsea","Man Utd","Aston Villa","Tottenham","Newcastle","West Ham","Everton","Brighton","Wolves","Brentford","Fulham","Crystal Palace","Bournemouth","Notts Forest","Burnley","Sunderland","Leeds"],
    "usr_109":["Liverpool","Man City","Arsenal","Chelsea","Man Utd","Notts Forest","Tottenham","Aston Villa","Newcastle","Brighton","Bournemouth","Fulham","Crystal Palace","Everton","West Ham","Sunderland","Leeds","Brentford","Wolves","Burnley"]
};

// Helper function to convert 'DD/MM/YYYY HH:mm' to ISO 8601 format
const parseDate = (dateString: string): string => {
  const [datePart, timePart] = dateString.split(' ');
  const [day, month, year] = datePart.split('/');
  return new Date(`${year}-${month}-${day}T${timePart}:00`).toISOString();
};

const userPredictionTeamIds: { [key: string]: string[] } = {};
for (const userId in userPredictionsRaw) {
    userPredictionTeamIds[userId] = userPredictionsRaw[userId].map(teamName => {
      const cleanedTeamName = teamName.toLowerCase().trim();
      const teamId = teamNameMapping[cleanedTeamName];
      if (!teamId) {
        console.warn(`Could not find team ID for team name: "${teamName}" for user ${userId}`);
      }
      return teamId;
    }).filter(Boolean);
}

export const fullPredictions: Prediction[] = Object.entries(userPredictionTeamIds).map(([userId, rankings]) => ({
    userId,
    rankings,
}));

export const matches: Match[] = [
    { week: 1, matchDate: parseDate('15/08/2025 20:00'), homeTeamId: 'team_12', awayTeamId: 'team_03', homeScore: 4, awayScore: 2 },
    { week: 1, matchDate: parseDate('16/08/2025 12:30'), homeTeamId: 'team_02', awayTeamId: 'team_15', homeScore: 0, awayScore: 0 },
    { week: 1, matchDate: parseDate('16/08/2025 15:00'), homeTeamId: 'team_18', awayTeamId: 'team_11', homeScore: 3, awayScore: 0 },
    { week: 1, matchDate: parseDate('16/08/2025 15:00'), homeTeamId: 'team_17', awayTeamId: 'team_19', homeScore: 3, awayScore: 0 },
    { week: 1, matchDate: parseDate('16/08/2025 15:00'), homeTeamId: 'team_05', awayTeamId: 'team_09', homeScore: 1, awayScore: 1 },
    { week: 1, matchDate: parseDate('16/08/2025 17:30'), homeTeamId: 'team_20', awayTeamId: 'team_13', homeScore: 0, awayScore: 4 },
    { week: 1, matchDate: parseDate('17/08/2025 14:00'), homeTeamId: 'team_16', awayTeamId: 'team_04', homeScore: 3, awayScore: 1 },
    { week: 1, matchDate: parseDate('17/08/2025 14:00'), homeTeamId: 'team_06', awayTeamId: 'team_07', homeScore: 0, awayScore: 0 },
    { week: 1, matchDate: parseDate('17/08/2025 16:30'), homeTeamId: 'team_14', awayTeamId: 'team_01', homeScore: 0, awayScore: 1 },
    { week: 1, matchDate: parseDate('18/08/2025 20:00'), homeTeamId: 'team_10', awayTeamId: 'team_08', homeScore: 1, awayScore: 0 },
    { week: 2, matchDate: parseDate('23/08/2025 15:00'), homeTeamId: 'team_19', awayTeamId: 'team_06', homeScore: 1, awayScore: 5 },
    { week: 2, matchDate: parseDate('23/08/2025 15:00'), homeTeamId: 'team_15', awayTeamId: 'team_12', homeScore: 2, awayScore: 3 },
    { week: 2, matchDate: parseDate('23/08/2025 15:00'), homeTeamId: 'team_13', awayTeamId: 'team_18', homeScore: 0, awayScore: 2 },
    { week: 2, matchDate: parseDate('23/08/2025 15:00'), homeTeamId: 'team_09', awayTeamId: 'team_14', homeScore: 1, awayScore: 1 },
    { week: 2, matchDate: parseDate('23/08/2025 15:00'), homeTeamId: 'team_08', awayTeamId: 'team_05', homeScore: 2, awayScore: 0 },
    { week: 2, matchDate: parseDate('23/08/2025 15:00'), homeTeamId: 'team_07', awayTeamId: 'team_16', homeScore: 1, awayScore: 1 },
    { week: 2, matchDate: parseDate('23/08/2025 15:00'), homeTeamId: 'team_11', awayTeamId: 'team_17', homeScore: 2, awayScore: 0 },
    { week: 2, matchDate: parseDate('23/08/2025 15:00'), homeTeamId: 'team_04', awayTeamId: 'team_02', homeScore: 1, awayScore: 0 },
    { week: 2, matchDate: parseDate('23/08/2025 15:00'), homeTeamId: 'team_01', awayTeamId: 'team_10', homeScore: 5, awayScore: 0 },
    { week: 2, matchDate: parseDate('23/08/2025 15:00'), homeTeamId: 'team_03', awayTeamId: 'team_20', homeScore: 1, awayScore: 0 },
    { week: 3, matchDate: parseDate('30/08/2025 15:00'), homeTeamId: 'team_20', awayTeamId: 'team_08', homeScore: 2, awayScore: 3 },
    { week: 3, matchDate: parseDate('30/08/2025 15:00'), homeTeamId: 'team_18', awayTeamId: 'team_03', homeScore: 0, awayScore: 1 },
    { week: 3, matchDate: parseDate('30/08/2025 15:00'), homeTeamId: 'team_17', awayTeamId: 'team_04', homeScore: 2, awayScore: 1 },
    { week: 3, matchDate: parseDate('30/08/2025 15:00'), homeTeamId: 'team_16', awayTeamId: 'team_19', homeScore: 0, awayScore: 3 },
    { week: 3, matchDate: parseDate('30/08/2025 15:00'), homeTeamId: 'team_14', awayTeamId: 'team_11', homeScore: 3, awayScore: 2 },
    { week: 3, matchDate: parseDate('30/08/2025 15:00'), homeTeamId: 'team_12', awayTeamId: 'team_01', homeScore: 1, awayScore: 0 },
    { week: 3, matchDate: parseDate('30/08/2025 15:00'), homeTeamId: 'team_10', awayTeamId: 'team_15', homeScore: 0, awayScore: 0 },
    { week: 3, matchDate: parseDate('30/08/2025 15:00'), homeTeamId: 'team_06', awayTeamId: 'team_09', homeScore: 2, awayScore: 0 },
    { week: 3, matchDate: parseDate('30/08/2025 15:00'), homeTeamId: 'team_05', awayTeamId: 'team_13', homeScore: 2, awayScore: 1 },
    { week: 3, matchDate: parseDate('30/08/2025 15:00'), homeTeamId: 'team_02', awayTeamId: 'team_07', homeScore: 0, awayScore: 3 },
    { week: 4, matchDate: parseDate('13/09/2025 15:00'), homeTeamId: 'team_19', awayTeamId: 'team_18', homeScore: 0, awayScore: 3 },
    { week: 4, matchDate: parseDate('13/09/2025 15:00'), homeTeamId: 'team_15', awayTeamId: 'team_20', homeScore: 1, awayScore: 0 },
    { week: 4, matchDate: parseDate('13/09/2025 15:00'), homeTeamId: 'team_13', awayTeamId: 'team_14', homeScore: 3, awayScore: 0 },
    { week: 4, matchDate: parseDate('13/09/2025 15:00'), homeTeamId: 'team_09', awayTeamId: 'team_10', homeScore: 1, awayScore: 0 },
    { week: 4, matchDate: parseDate('13/09/2025 15:00'), homeTeamId: 'team_08', awayTeamId: 'team_02', homeScore: 0, awayScore: 0 },
    { week: 4, matchDate: parseDate('13/09/2025 15:00'), homeTeamId: 'team_07', awayTeamId: 'team_17', homeScore: 0, awayScore: 0 },
    { week: 4, matchDate: parseDate('13/09/2025 15:00'), homeTeamId: 'team_11', awayTeamId: 'team_12', homeScore: 0, awayScore: 1 },
    { week: 4, matchDate: parseDate('13/09/2025 15:00'), homeTeamId: 'team_04', awayTeamId: 'team_06', homeScore: 2, awayScore: 2 },
    { week: 4, matchDate: parseDate('13/09/2025 15:00'), homeTeamId: 'team_01', awayTeamId: 'team_16', homeScore: 3, awayScore: 0 },
    { week: 4, matchDate: parseDate('13/09/2025 15:00'), homeTeamId: 'team_03', awayTeamId: 'team_05', homeScore: 2, awayScore: 1 },
    { week: 5, matchDate: parseDate('20/09/2025 15:00'), homeTeamId: 'team_20', awayTeamId: 'team_10', homeScore: 1, awayScore: 3 },
    { week: 5, matchDate: parseDate('20/09/2025 15:00'), homeTeamId: 'team_19', awayTeamId: 'team_07', homeScore: 1, awayScore: 2 },
    { week: 5, matchDate: parseDate('20/09/2025 15:00'), homeTeamId: 'team_17', awayTeamId: 'team_02', homeScore: 1, awayScore: 1 },
    { week: 5, matchDate: parseDate('20/09/2025 15:00'), homeTeamId: 'team_14', awayTeamId: 'team_06', homeScore: 2, awayScore: 1 },
    { week: 5, matchDate: parseDate('20/09/2025 15:00'), homeTeamId: 'team_12', awayTeamId: 'team_08', homeScore: 2, awayScore: 1 },
    { week: 5, matchDate: parseDate('20/09/2025 15:00'), homeTeamId: 'team_09', awayTeamId: 'team_04', homeScore: 3, awayScore: 1 },
    { week: 5, matchDate: parseDate('20/09/2025 15:00'), homeTeamId: 'team_11', awayTeamId: 'team_16', homeScore: 1, awayScore: 1 },
    { week: 5, matchDate: parseDate('20/09/2025 15:00'), homeTeamId: 'team_05', awayTeamId: 'team_18', homeScore: 2, awayScore: 2 },
    { week: 5, matchDate: parseDate('20/09/2025 15:00'), homeTeamId: 'team_01', awayTeamId: 'team_13', homeScore: 1, awayScore: 1 },
    { week: 5, matchDate: parseDate('20/09/2025 15:00'), homeTeamId: 'team_03', awayTeamId: 'team_15', homeScore: 0, awayScore: 0 },
    { week: 6, matchDate: parseDate('27/09/2025 15:00'), homeTeamId: 'team_18', awayTeamId: 'team_20', homeScore: 1, awayScore: 1 },
    { week: 6, matchDate: parseDate('27/09/2025 15:00'), homeTeamId: 'team_16', awayTeamId: 'team_17', homeScore: 0, awayScore: 1 },
    { week: 6, matchDate: parseDate('27/09/2025 15:00'), homeTeamId: 'team_15', awayTeamId: 'team_01', homeScore: 1, awayScore: 2 },
    { week: 6, matchDate: parseDate('27/09/2025 15:00'), homeTeamId: 'team_13', awayTeamId: 'team_11', homeScore: 5, awayScore: 1 },
    { week: 6, matchDate: parseDate('27/09/2025 15:00'), homeTeamId: 'team_10', awayTeamId: 'team_03', homeScore: 2, awayScore: 2 },
    { week: 6, matchDate: parseDate('27/09/2025 15:00'), homeTeamId: 'team_08', awayTeamId: 'team_19', homeScore: 1, awayScore: 1 },
    { week: 6, matchDate: parseDate('27/09/2025 15:00'), homeTeamId: 'team_07', awayTeamId: 'team_12', homeScore: 2, awayScore: 1 },
    { week: 6, matchDate: parseDate('27/09/2025 15:00'), homeTeamId: 'team_06', awayTeamId: 'team_05', homeScore: 1, awayScore: 3 },
    { week: 6, matchDate: parseDate('27/09/2025 15:00'), homeTeamId: 'team_04', awayTeamId: 'team_14', homeScore: 3, awayScore: 1 },
    { week: 6, matchDate: parseDate('27/09/2025 15:00'), homeTeamId: 'team_02', awayTeamId: 'team_09', homeScore: 3, awayScore: 1 },
    { week: 7, matchDate: parseDate('04/10/2025 15:00'), homeTeamId: 'team_20', awayTeamId: 'team_05', homeScore: 1, awayScore: 1 },
    { week: 7, matchDate: parseDate('04/10/2025 15:00'), homeTeamId: 'team_15', awayTeamId: 'team_16', homeScore: 2, awayScore: 0 },
    { week: 7, matchDate: parseDate('04/10/2025 15:00'), homeTeamId: 'team_14', awayTeamId: 'team_17', homeScore: 2, awayScore: 0 },
    { week: 7, matchDate: parseDate('04/10/2025 15:00'), homeTeamId: 'team_10', awayTeamId: 'team_18', homeScore: 1, awayScore: 2 },
    { week: 7, matchDate: parseDate('04/10/2025 15:00'), homeTeamId: 'team_08', awayTeamId: 'team_07', homeScore: 2, awayScore: 1 },
    { week: 7, matchDate: parseDate('04/10/2025 15:00'), homeTeamId: 'team_06', awayTeamId: 'team_12', homeScore: 2, awayScore: 1 },
    { week: 7, matchDate: parseDate('04/10/2025 15:00'), homeTeamId: 'team_04', awayTeamId: 'team_13', homeScore: 0, awayScore: 1 },
    { week: 7, matchDate: parseDate('04/10/2025 15:00'), homeTeamId: 'team_02', awayTeamId: 'team_11', homeScore: 2, awayScore: 1 },
    { week: 7, matchDate: parseDate('04/10/2025 15:00'), homeTeamId: 'team_01', awayTeamId: 'team_19', homeScore: 2, awayScore: 0 },
    { week: 7, matchDate: parseDate('04/10/2025 15:00'), homeTeamId: 'team_03', awayTeamId: 'team_09', homeScore: 3, awayScore: 1 },
    { week: 8, matchDate: parseDate('18/10/2025 15:00'), homeTeamId: 'team_19', awayTeamId: 'team_04', homeScore: 0, awayScore: 2 },
    { week: 8, matchDate: parseDate('18/10/2025 15:00'), homeTeamId: 'team_18', awayTeamId: 'team_02', homeScore: 1, awayScore: 2 },
    { week: 8, matchDate: parseDate('18/10/2025 15:00'), homeTeamId: 'team_17', awayTeamId: 'team_20', homeScore: 2, awayScore: 0 },
    { week: 8, matchDate: parseDate('18/10/2025 15:00'), homeTeamId: 'team_16', awayTeamId: 'team_06', homeScore: 0, awayScore: 3 },
    { week: 8, matchDate: parseDate('18/10/2025 15:00'), homeTeamId: 'team_13', awayTeamId: 'team_01', homeScore: 2, awayScore: 0 },
    { week: 8, matchDate: parseDate('18/10/2025 15:00'), homeTeamId: 'team_12', awayTeamId: 'team_14', homeScore: 1, awayScore: 2 },
    { week: 8, matchDate: parseDate('18/10/2025 15:00'), homeTeamId: 'team_09', awayTeamId: 'team_03', homeScore: 0, awayScore: 1 },
    { week: 8, matchDate: parseDate('18/10/2025 15:00'), homeTeamId: 'team_07', awayTeamId: 'team_15', homeScore: 3, awayScore: 3 },
    { week: 8, matchDate: parseDate('18/10/2025 15:00'), homeTeamId: 'team_11', awayTeamId: 'team_10', homeScore: 2, awayScore: 0 },
    { week: 8, matchDate: parseDate('18/10/2025 15:00'), homeTeamId: 'team_05', awayTeamId: 'team_08', homeScore: 2, awayScore: 1 },
    { week: 9, matchDate: parseDate('25/10/2025 15:00'), homeTeamId: 'team_20', awayTeamId: 'team_11', homeScore: 2, awayScore: 3 },
    { week: 9, matchDate: parseDate('25/10/2025 15:00'), homeTeamId: 'team_15', awayTeamId: 'team_09', homeScore: 2, awayScore: 1 },
    { week: 9, matchDate: parseDate('25/10/2025 15:00'), homeTeamId: 'team_14', awayTeamId: 'team_05', homeScore: 4, awayScore: 2 },
    { week: 9, matchDate: parseDate('25/10/2025 15:00'), homeTeamId: 'team_10', awayTeamId: 'team_19', homeScore: 2, awayScore: 1 },
    { week: 9, matchDate: parseDate('25/10/2025 15:00'), homeTeamId: 'team_08', awayTeamId: 'team_18', homeScore: 0, awayScore: 3 },
    { week: 9, matchDate: parseDate('25/10/2025 15:00'), homeTeamId: 'team_06', awayTeamId: 'team_17', homeScore: 1, awayScore: 2 },
    { week: 9, matchDate: parseDate('25/10/2025 15:00'), homeTeamId: 'team_04', awayTeamId: 'team_12', homeScore: 3, awayScore: 2 },
    { week: 9, matchDate: parseDate('25/10/2025 15:00'), homeTeamId: 'team_02', awayTeamId: 'team_13', homeScore: 1, awayScore: 0 },
    { week: 9, matchDate: parseDate('25/10/2025 15:00'), homeTeamId: 'team_01', awayTeamId: 'team_07', homeScore: 1, awayScore: 0 },
    { week: 9, matchDate: parseDate('25/10/2025 15:00'), homeTeamId: 'team_03', awayTeamId: 'team_16', homeScore: 2, awayScore: 0 },
    { week: 10, matchDate: parseDate('01/11/2025 15:00'), homeTeamId: 'team_19', awayTeamId: 'team_15', homeScore: 3, awayScore: 1 },
    { week: 10, matchDate: parseDate('01/11/2025 15:00'), homeTeamId: 'team_18', awayTeamId: 'team_06', homeScore: 0, awayScore: 1 },
    { week: 10, matchDate: parseDate('01/11/2025 15:00'), homeTeamId: 'team_17', awayTeamId: 'team_08', homeScore: 1, awayScore: 1 },
    { week: 10, matchDate: parseDate('01/11/2025 15:00'), homeTeamId: 'team_16', awayTeamId: 'team_14', homeScore: 2, awayScore: 2 },
    { week: 10, matchDate: parseDate('01/11/2025 15:00'), homeTeamId: 'team_13', awayTeamId: 'team_03', homeScore: 3, awayScore: 1 },
    { week: 10, matchDate: parseDate('01/11/2025 15:00'), homeTeamId: 'team_12', awayTeamId: 'team_02', homeScore: 2, awayScore: 0 },
    { week: 10, matchDate: parseDate('01/11/2025 15:00'), homeTeamId: 'team_09', awayTeamId: 'team_20', homeScore: 3, awayScore: 0 },
    { week: 10, matchDate: parseDate('01/11/2025 15:00'), homeTeamId: 'team_07', awayTeamId: 'team_04', homeScore: 2, awayScore: 0 },
    { week: 10, matchDate: parseDate('01/11/2025 15:00'), homeTeamId: 'team_11', awayTeamId: 'team_01', homeScore: 0, awayScore: 2 },
    { week: 10, matchDate: parseDate('01/11/2025 15:00'), homeTeamId: 'team_05', awayTeamId: 'team_10', homeScore: 3, awayScore: 0 },
    { week: 11, matchDate: parseDate('08/11/2025 15:00'), homeTeamId: 'team_19', awayTeamId: 'team_11', homeScore: 3, awayScore: 2 },
    { week: 11, matchDate: parseDate('08/11/2025 15:00'), homeTeamId: 'team_18', awayTeamId: 'team_14', homeScore: 2, awayScore: 2 },
    { week: 11, matchDate: parseDate('08/11/2025 15:00'), homeTeamId: 'team_17', awayTeamId: 'team_01', homeScore: 2, awayScore: 2 },
    { week: 11, matchDate: parseDate('08/11/2025 15:00'), homeTeamId: 'team_16', awayTeamId: 'team_10', homeScore: 3, awayScore: 1 },
    { week: 11, matchDate: parseDate('08/11/2025 15:00'), homeTeamId: 'team_13', awayTeamId: 'team_12', homeScore: 3, awayScore: 0 },
    { week: 11, matchDate: parseDate('08/11/2025 15:00'), homeTeamId: 'team_08', awayTeamId: 'team_09', homeScore: 2, awayScore: 0 },
    { week: 11, matchDate: parseDate('08/11/2025 15:00'), homeTeamId: 'team_07', awayTeamId: 'team_05', homeScore: 0, awayScore: 0 },
    { week: 11, matchDate: parseDate('08/11/2025 15:00'), homeTeamId: 'team_06', awayTeamId: 'team_20', homeScore: 3, awayScore: 0 },
    { week: 11, matchDate: parseDate('08/11/2025 15:00'), homeTeamId: 'team_04', awayTeamId: 'team_15', homeScore: 3, awayScore: 1 },
    { week: 11, matchDate: parseDate('08/11/2025 15:00'), homeTeamId: 'team_02', awayTeamId: 'team_03', homeScore: 4, awayScore: 0 },
    { week: 12, matchDate: parseDate('22/11/2025 15:00'), homeTeamId: 'team_20', awayTeamId: 'team_07', homeScore: 0, awayScore: 2 },
    { week: 12, matchDate: parseDate('22/11/2025 15:00'), homeTeamId: 'team_15', awayTeamId: 'team_13', homeScore: 2, awayScore: 1 },
    { week: 12, matchDate: parseDate('22/11/2025 15:00'), homeTeamId: 'team_14', awayTeamId: 'team_08', homeScore: 0, awayScore: 1 },
    { week: 12, matchDate: parseDate('22/11/2025 15:00'), homeTeamId: 'team_12', awayTeamId: 'team_16', homeScore: 0, awayScore: 3 },
    { week: 12, matchDate: parseDate('22/11/2025 15:00'), homeTeamId: 'team_10', awayTeamId: 'team_02', homeScore: 1, awayScore: 2 },
    { week: 12, matchDate: parseDate('22/11/2025 15:00'), homeTeamId: 'team_09', awayTeamId: 'team_17', homeScore: 1, awayScore: 0 },
    { week: 12, matchDate: parseDate('22/11/2025 15:00'), homeTeamId: 'team_11', awayTeamId: 'team_06', homeScore: 0, awayScore: 2 },
    { week: 12, matchDate: parseDate('22/11/2025 15:00'), homeTeamId: 'team_05', awayTeamId: 'team_04', homeScore: 2, awayScore: 1 },
    { week: 12, matchDate: parseDate('22/11/2025 15:00'), homeTeamId: 'team_01', awayTeamId: 'team_18', homeScore: 4, awayScore: 1 },
    { week: 12, matchDate: parseDate('22/11/2025 15:00'), homeTeamId: 'team_03', awayTeamId: 'team_19', homeScore: 2, awayScore: 2 },
    { week: 13, matchDate: parseDate('29/11/2025 15:00'), homeTeamId: 'team_19', awayTeamId: 'team_12', homeScore: 0, awayScore: 2 },
    { week: 13, matchDate: parseDate('29/11/2025 15:00'), homeTeamId: 'team_18', awayTeamId: 'team_09', homeScore: 1, awayScore: 2 },
    { week: 13, matchDate: parseDate('29/11/2025 15:00'), homeTeamId: 'team_17', awayTeamId: 'team_03', homeScore: 3, awayScore: 2 },
    { week: 13, matchDate: parseDate('29/11/2025 15:00'), homeTeamId: 'team_16', awayTeamId: 'team_05', homeScore: 0, awayScore: 2 },
    { week: 13, matchDate: parseDate('29/11/2025 15:00'), homeTeamId: 'team_13', awayTeamId: 'team_10', homeScore: 3, awayScore: 2 },
    { week: 13, matchDate: parseDate('29/11/2025 15:00'), homeTeamId: 'team_08', awayTeamId: 'team_15', homeScore: 1, awayScore: 4 },
    { week: 13, matchDate: parseDate('29/11/2025 15:00'), homeTeamId: 'team_07', awayTeamId: 'team_14', homeScore: 1, awayScore: 2 },
    { week: 13, matchDate: parseDate('29/11/2025 15:00'), homeTeamId: 'team_06', awayTeamId: 'team_01', homeScore: 1, awayScore: 1 },
    { week: 13, matchDate: parseDate('29/11/2025 15:00'), homeTeamId: 'team_04', awayTeamId: 'team_11', homeScore: 3, awayScore: 1 },
    { week: 13, matchDate: parseDate('29/11/2025 15:00'), homeTeamId: 'team_02', awayTeamId: 'team_20', homeScore: 1, awayScore: 0 },
    { week: 14, matchDate: parseDate('03/12/2025 20:00'), homeTeamId: 'team_20', awayTeamId: 'team_16', homeScore: 0, awayScore: 1 },
    { week: 14, matchDate: parseDate('03/12/2025 20:00'), homeTeamId: 'team_15', awayTeamId: 'team_18', homeScore: 2, awayScore: 2 },
    { week: 14, matchDate: parseDate('03/12/2025 20:00'), homeTeamId: 'team_14', awayTeamId: 'team_19', homeScore: 1, awayScore: 1 },
    { week: 14, matchDate: parseDate('03/12/2025 20:00'), homeTeamId: 'team_12', awayTeamId: 'team_17', homeScore: 1, awayScore: 1 },
    { week: 14, matchDate: parseDate('03/12/2025 20:00'), homeTeamId: 'team_10', awayTeamId: 'team_06', homeScore: 3, awayScore: 1 },
    { week: 14, matchDate: parseDate('03/12/2025 20:00'), homeTeamId: 'team_09', awayTeamId: 'team_13', homeScore: 4, awayScore: 5 },
    { week: 14, matchDate: parseDate('03/12/2025 20:00'), homeTeamId: 'team_11', awayTeamId: 'team_07', homeScore: 0, awayScore: 1 },
    { week: 14, matchDate: parseDate('03/12/2025 20:00'), homeTeamId: 'team_05', awayTeamId: 'team_02', homeScore: 3, awayScore: 4 },
    { week: 14, matchDate: parseDate('03/12/2025 20:00'), homeTeamId: 'team_01', awayTeamId: 'team_04', homeScore: 2, awayScore: 0 },
    { week: 14, matchDate: parseDate('03/12/2025 20:00'), homeTeamId: 'team_03', awayTeamId: 'team_08', homeScore: 0, awayScore: 1 },
    { week: 15, matchDate: parseDate('06/12/2025 15:00'), homeTeamId: 'team_20', awayTeamId: 'team_14', homeScore: 1, awayScore: 4 },
    { week: 15, matchDate: parseDate('06/12/2025 15:00'), homeTeamId: 'team_18', awayTeamId: 'team_04', homeScore: 2, awayScore: 0 },
    { week: 15, matchDate: parseDate('06/12/2025 15:00'), homeTeamId: 'team_15', awayTeamId: 'team_11', homeScore: 2, awayScore: 1 },
    { week: 15, matchDate: parseDate('06/12/2025 15:00'), homeTeamId: 'team_13', awayTeamId: 'team_17', homeScore: 3, awayScore: 0 },
    { week: 15, matchDate: parseDate('06/12/2025 15:00'), homeTeamId: 'team_10', awayTeamId: 'team_12', homeScore: 3, awayScore: 3 },
    { week: 15, matchDate: parseDate('06/12/2025 15:00'), homeTeamId: 'team_09', awayTeamId: 'team_07', homeScore: 1, awayScore: 2 },
    { week: 15, matchDate: parseDate('06/12/2025 15:00'), homeTeamId: 'team_08', awayTeamId: 'team_16', homeScore: 3, awayScore: 0 },
    { week: 15, matchDate: parseDate('06/12/2025 15:00'), homeTeamId: 'team_05', awayTeamId: 'team_19', homeScore: 1, awayScore: 1 },
    { week: 15, matchDate: parseDate('06/12/2025 15:00'), homeTeamId: 'team_02', awayTeamId: 'team_01', homeScore: 2, awayScore: 1 },
    { week: 15, matchDate: parseDate('06/12/2025 15:00'), homeTeamId: 'team_03', awayTeamId: 'team_06', homeScore: 0, awayScore: 0 },
    { week: 16, matchDate: parseDate('13/12/2025 15:00'), homeTeamId: 'team_19', awayTeamId: 'team_02', homeScore: 2, awayScore: 3 },
    { week: 16, matchDate: parseDate('13/12/2025 15:00'), homeTeamId: 'team_17', awayTeamId: 'team_15', homeScore: 1, awayScore: 0 },
    { week: 16, matchDate: parseDate('13/12/2025 15:00'), homeTeamId: 'team_16', awayTeamId: 'team_18', homeScore: 3, awayScore: 0 },
    { week: 16, matchDate: parseDate('13/12/2025 15:00'), homeTeamId: 'team_14', awayTeamId: 'team_03', homeScore: 4, awayScore: 4 },
    { week: 16, matchDate: parseDate('13/12/2025 15:00'), homeTeamId: 'team_12', awayTeamId: 'team_05', homeScore: 2, awayScore: 0 },
    { week: 16, matchDate: parseDate('13/12/2025 15:00'), homeTeamId: 'team_07', awayTeamId: 'team_13', homeScore: 0, awayScore: 3 },
    { week: 16, matchDate: parseDate('13/12/2025 15:00'), homeTeamId: 'team_06', awayTeamId: 'team_08', homeScore: 2, awayScore: 0 },
    { week: 16, matchDate: parseDate('13/12/2025 15:00'), homeTeamId: 'team_11', awayTeamId: 'team_09', homeScore: 2, awayScore: 3 },
    { week: 16, matchDate: parseDate('13/12/2025 15:00'), homeTeamId: 'team_04', awayTeamId: 'team_10', homeScore: 1, awayScore: 1 },
    { week: 16, matchDate: parseDate('13/12/2025 15:00'), homeTeamId: 'team_01', awayTeamId: 'team_20', homeScore: 2, awayScore: 1 },
    { week: 17, matchDate: parseDate('20/12/2025 15:00'), homeTeamId: 'team_20', awayTeamId: 'team_04', homeScore: 0, awayScore: 2 },
    { week: 17, matchDate: parseDate('20/12/2025 15:00'), homeTeamId: 'team_18', awayTeamId: 'team_12', homeScore: 1, awayScore: 2 },
    { week: 17, matchDate: parseDate('20/12/2025 15:00'), homeTeamId: 'team_15', awayTeamId: 'team_03', homeScore: 2, awayScore: 2 },
    { week: 17, matchDate: parseDate('20/12/2025 15:00'), homeTeamId: 'team_13', awayTeamId: 'team_16', homeScore: 3, awayScore: 0 },
    { week: 17, matchDate: parseDate('20/12/2025 15:00'), homeTeamId: 'team_10', awayTeamId: 'team_07', homeScore: 4, awayScore: 1 },
    { week: 17, matchDate: parseDate('20/12/2025 15:00'), homeTeamId: 'team_09', awayTeamId: 'team_01', homeScore: 1, awayScore: 0 },
    { week: 17, matchDate: parseDate('20/12/2025 15:00'), homeTeamId: 'team_08', awayTeamId: 'team_11', homeScore: 0, awayScore: 1 },
    { week: 17, matchDate: parseDate('20/12/2025 15:00'), homeTeamId: 'team_05', awayTeamId: 'team_17', homeScore: 0, awayScore: 0 },
    { week: 17, matchDate: parseDate('20/12/2025 15:00'), homeTeamId: 'team_02', awayTeamId: 'team_14', homeScore: 2, awayScore: 1 },
    { week: 17, matchDate: parseDate('20/12/2025 15:00'), homeTeamId: 'team_19', awayTeamId: 'team_06', homeScore: 1, awayScore: 1 },
    { week: 18, matchDate: parseDate('27/12/2025 15:00'), homeTeamId: 'team_19', awayTeamId: 'team_09', homeScore: 0, awayScore: 1 },
    { week: 18, matchDate: parseDate('27/12/2025 15:00'), homeTeamId: 'team_17', awayTeamId: 'team_10', homeScore: 1, awayScore: 1 },
    { week: 18, matchDate: parseDate('27/12/2025 15:00'), homeTeamId: 'team_16', awayTeamId: 'team_13', homeScore: 1, awayScore: 2 },
    { week: 18, matchDate: parseDate('27/12/2025 15:00'), homeTeamId: 'team_14', awayTeamId: 'team_16', homeScore: 1, awayScore: 0 },
    { week: 18, matchDate: parseDate('27/12/2025 15:00'), homeTeamId: 'team_12', awayTeamId: 'team_20', homeScore: 2, awayScore: 1 },
    { week: 18, matchDate: parseDate('27/12/2025 15:00'), homeTeamId: 'team_07', awayTeamId: 'team_18', homeScore: 0, awayScore: 1 },
    { week: 18, matchDate: parseDate('27/12/2025 15:00'), homeTeamId: 'team_06', awayTeamId: 'team_02', homeScore: 1, awayScore: 2 },
    { week: 18, matchDate: parseDate('27/12/2025 15:00'), homeTeamId: 'team_11', awayTeamId: 'team_08', homeScore: 0, awayScore: 0 },
    { week: 18, matchDate: parseDate('27/12/2025 15:00'), homeTeamId: 'team_04', awayTeamId: 'team_03', homeScore: 4, awayScore: 1 },
    { week: 18, matchDate: parseDate('27/12/2025 15:00'), homeTeamId: 'team_01', awayTeamId: 'team_05', homeScore: 2, awayScore: 1 },
];

const playedMatches = matches.filter(m => m.homeScore !== -1);

// Calculate weekly standings
export const weeklyTeamStandings: WeeklyTeamStanding[] = (() => {
  const allWeeklyStandings: WeeklyTeamStanding[] = [];
  const teamScores: { [teamId: string]: { week: number; rank: number }[] } = {};

  teams.forEach(team => {
    teamScores[team.id] = [];
  });

  const maxWeek = Math.max(...playedMatches.map(m => m.week), 0);

  for (let week = 1; week <= maxWeek; week++) {
    const weeklyMatches = playedMatches.filter(m => m.week <= week);
    const standings: { [teamId: string]: { points: number, goalDifference: number, goalsFor: number } } = {};

    teams.forEach(team => {
      standings[team.id] = { points: 0, goalDifference: 0, goalsFor: 0 };
    });

    weeklyMatches.forEach(match => {
      const home = standings[match.homeTeamId];
      const away = standings[match.awayTeamId];
      
      home.goalsFor += match.homeScore;
      away.goalsFor += match.awayScore;
      home.goalDifference += match.homeScore - match.awayScore;
      away.goalDifference += match.awayScore - match.homeScore;

      if (match.homeScore > match.awayScore) {
        home.points += 3;
      } else if (match.awayScore > match.homeScore) {
        away.points += 3;
      } else {
        home.points += 1;
        away.points += 1;
      }
    });

    const sortedTeamIds = Object.keys(standings).sort((a, b) => {
      const standingA = standings[a];
      const standingB = standings[b];
      if (standingB.points !== standingA.points) return standingB.points - standingA.points;
      if (standingB.goalDifference !== standingA.goalDifference) return standingB.goalDifference - standingA.goalDifference;
      if (standingB.goalsFor !== standingA.goalsFor) return standingB.goalsFor - standingA.goalsFor;
      return teams.find(t => t.id === a)!.name.localeCompare(teams.find(t => t.id === b)!.name);
    });

    sortedTeamIds.forEach((teamId, index) => {
        allWeeklyStandings.push({ week, teamId, rank: index + 1 });
    });
  }

  return allWeeklyStandings;
})();

export const standings: CurrentStanding[] = (() => {
    if (playedMatches.length === 0) {
        return teams.map(team => ({
            teamId: team.id,
            rank: 0,
            points: 0,
            goalDifference: 0,
            gamesPlayed: 0,
            wins: 0,
            draws: 0,
            losses: 0,
            goalsFor: 0,
            goalsAgainst: 0,
        }));
    }

    const teamStats: { [key: string]: Omit<CurrentStanding, 'teamId' | 'rank'> } = {};

    teams.forEach(team => {
        teamStats[team.id] = {
            points: 0,
            gamesPlayed: 0,
            wins: 0,
            draws: 0,
            losses: 0,
            goalsFor: 0,
            goalsAgainst: 0,
            goalDifference: 0,
        };
    });

    playedMatches.forEach(match => {
        const homeStats = teamStats[match.homeTeamId];
        const awayStats = teamStats[match.awayTeamId];

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
        } else if (match.awayScore > match.homeScore) {
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

    const sortedStandings = Object.entries(teamStats)
        .map(([teamId, stats]) => ({ teamId, ...stats }))
        .sort((a, b) => {
            if (b.points !== a.points) return b.points - a.points;
            if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
            if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
            return teams.find(t => t.id === a.teamId)!.name.localeCompare(teams.find(t => t.id === b.teamId)!.name);
        });

    return sortedStandings.map((team, index) => ({
        ...team,
        rank: index + 1
    }));
})();

const finalRankings: { [teamId: string]: number } = {};
standings.forEach(s => {
    finalRankings[s.teamId] = s.rank;
});

export const playerTeamScores: PlayerTeamScore[] = fullPredictions.flatMap(prediction => {
    return prediction.rankings.map((teamId, index) => {
        const predictedRank = index + 1;
        const actualRank = finalRankings[teamId];
        const score = 5 - Math.abs(predictedRank - actualRank);
        return {
            userId: prediction.userId,
            teamId: teamId,
            score: score
        };
    });
});

const weeklyScoresByUser: { [userId: string]: WeeklyScore[] } = {};
userList.forEach(user => {
    weeklyScoresByUser[user.id] = [];
    const prediction = fullPredictions.find(p => p.userId === user.id);
    if (!prediction) return;
    const maxWeek = Math.max(...playedMatches.map(m => m.week), 0);

    for (let week = 1; week <= maxWeek; week++) {
        let totalScore = 0;
        const weeklyStandingsForWeek = weeklyTeamStandings.filter(ws => ws.week === week);
        const weeklyFinalRankings: { [teamId: string]: number } = {};
        weeklyStandingsForWeek.forEach(s => {
            weeklyFinalRankings[s.teamId] = s.rank;
        });

        prediction.rankings.forEach((teamId, index) => {
            const predictedRank = index + 1;
            const actualRank = weeklyFinalRankings[teamId];
            if (actualRank !== undefined) {
                totalScore += 5 - Math.abs(predictedRank - actualRank);
            }
        });
        weeklyScoresByUser[user.id].push({ week, score: totalScore, rank: 0 }); // Rank calculated later
    }
});

// Calculate ranks for each week
const maxWeek = Math.max(...playedMatches.map(m => m.week), 0);
for (let week = 1; week <= maxWeek; week++) {
    const scoresForWeek = userList.map(user => ({
        userId: user.id,
        score: weeklyScoresByUser[user.id]?.find(s => s.week === week)?.score ?? -Infinity,
    })).sort((a, b) => b.score - a.score);

    let currentRank = 1;
    for(let i=0; i<scoresForWeek.length; i++) {
        if(i > 0 && scoresForWeek[i].score < scoresForWeek[i-1].score) {
            currentRank = i + 1;
        }
        const userWeekScore = weeklyScoresByUser[scoresForWeek[i].userId].find(s => s.week === week);
        if(userWeekScore) {
            userWeekScore.rank = currentRank;
        }
    }
}

export const fullUsers: User[] = (() => {
    const finalUsers = userList.map(user => {
        const weeklyScores = weeklyScoresByUser[user.id] || [];
        const latestWeek = weeklyScores.length > 0 ? weeklyScores[weeklyScores.length - 1] : { score: 0, rank: 0, week: 0 };
        const previousWeek = weeklyScores.length > 1 ? weeklyScores[weeklyScores.length - 2] : { score: 0, rank: 0, week: 0 };
        
        const allScores = weeklyScores.map(w => w.score);
        const allRanks = weeklyScores.map(w => w.rank).filter(r => r > 0);

        return {
            ...user,
            score: latestWeek.score,
            rank: latestWeek.rank,
            previousScore: previousWeek.score,
            previousRank: previousWeek.rank,
            scoreChange: latestWeek.score - previousWeek.score,
            rankChange: previousWeek.rank > 0 ? previousWeek.rank - latestWeek.rank : 0,
            maxScore: allScores.length > 0 ? Math.max(...allScores) : 0,
            minScore: allScores.length > 0 ? Math.min(...allScores) : 0,
            maxRank: allRanks.length > 0 ? Math.min(...allRanks) : 0,
            minRank: allRanks.length > 0 ? Math.max(...allRanks) : 0,
            avatar: String((userList.findIndex(u => u.id === user.id) % 49) + 1),
            email: `${user.name.replace(/ /g, '.').toLowerCase()}@prempred.com`,
            joinDate: '2025-08-01T12:00:00.000Z'
        };
    });

    finalUsers.sort((a, b) => a.rank - b.rank || a.name.localeCompare(b.name));
    
    //Re-rank based on new sort
    let currentRank = 1;
    for (let i = 0; i < finalUsers.length; i++) {
        if (i > 0 && finalUsers[i].score < finalUsers[i-1].score) {
            currentRank = i + 1;
        }
        finalUsers[i].rank = currentRank;
    }

    return finalUsers;
})();

export const fullUserHistories: UserHistory[] = Object.entries(weeklyScoresByUser).map(([userId, weeklyScores]) => {
    return { userId, weeklyScores };
});


export const teamRecentResults: TeamRecentResult[] = teams.map(team => {
    const results: ('W' | 'D' | 'L' | '-')[] = [];
    const teamMatches = playedMatches
        .filter(m => m.homeTeamId === team.id || m.awayTeamId === team.id)
        .sort((a, b) => new Date(b.matchDate).getTime() - new Date(a.matchDate).getTime())
        .slice(0, 6);

    for (let i = 0; i < 6; i++) {
        const match = teamMatches[i];
        if (!match) {
            results.unshift('-');
            continue;
        }
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
  { id: 'sm_01', month: 'August', year: 2025, abbreviation: 'AUG' },
  { id: 'sm_02', month: 'September', year: 2025, abbreviation: 'SEP' },
  { id: 'sm_03', month: 'October', year: 2025, abbreviation: 'OCT' },
  { id: 'sm_04', month: 'November', year: 2025, abbreviation: 'NOV' },
  { id: 'sm_05', month: 'December', year: 2025, abbreviation: 'DEC' },
  { id: 'sm_06', special: 'Christmas No. 1', month: 'December', year: 2025, abbreviation: 'XMAS' },
  { id: 'sm_07', month: 'January', year: 2026, abbreviation: 'JAN' },
  { id: 'sm_08', month: 'February', year: 2026, abbreviation: 'FEB' },
  { id: 'sm_09', month: 'March', year: 2026, abbreviation: 'MAR' },
  { id: 'sm_10', month: 'April', year: 2026, abbreviation: 'APR' },
  { id: 'sm_11', month: 'May', year: 2026, abbreviation: 'MAY' },
];

export const monthlyMimoM: MonthlyMimoM[] = [
    { id: 'mimo_01', month: 'August', year: 2025, userId: 'usr_028', type: 'winner' },
    { id: 'mimo_02', month: 'August', year: 2025, userId: 'usr_026', type: 'runner-up' },
    { id: 'mimo_03', month: 'September', year: 2025, userId: 'usr_028', type: 'winner' },
    { id: 'mimo_04', month: 'September', year: 2025, userId: 'usr_049', type: 'runner-up' },
    { id: 'mimo_05', month: 'October', year: 2025, userId: 'usr_049', type: 'winner' },
    { id: 'mimo_06', month: 'October', year: 2025, userId: 'usr_065', type: 'runner-up' },
    { id: 'mimo_07', month: 'November', year: 2025, userId: 'usr_074', type: 'winner' },
    { id: 'mimo_08', month: 'November', year: 2025, userId: 'usr_086', type: 'runner-up' },
    { id: 'mimo_09', special: 'Christmas No. 1', month: 'December', year: 2025, userId: 'usr_086', type: 'winner' },
];

    