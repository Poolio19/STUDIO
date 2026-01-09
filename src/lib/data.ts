

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
    id: string;
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
    { id: 'team_10', name: 'Ipswich', logo: 'theater', bgColourFaint: 'rgba(255, 205, 0, 0.3)', bgColourSolid: '#1D428A', textColour: '#FFFFFF', iconColour: '#FFFFFF' },
    { id: 'team_11', name: 'Leicester', logo: 'squirrel', bgColourFaint: 'rgba(108, 29, 69, 0.3)', bgColourSolid: '#003090', textColour: '#FDBE11', iconColour: '#FDBE11' },
    { id: 'team_12', name: 'Liverpool', logo: 'origami', bgColourFaint: 'rgba(200, 16, 46, 0.3)', bgColourSolid: '#C8102E', textColour: '#000000', iconColour: '#FFFFFF' },
    { id: 'team_13', name: 'Man City', logo: 'sailboat', bgColourFaint: 'rgba(108, 171, 221, 0.3)', bgColourSolid: '#6CABDD', textColour: '#00285E', iconColour: '#00285E' },
    { id: 'team_14', name: 'Man Utd', logo: 'sparkles', bgColourFaint: 'rgba(218, 41, 28, 0.3)', bgColourSolid: '#DA291C', textColour: '#FBE122', iconColour: '#FBE122' },
    { id: 'team_15', name: 'Newcastle', logo: 'shieldUser', bgColourFaint: 'rgba(45, 41, 38, 0.3)', bgColourSolid: '#2D2926', textColour: '#FFFFFF', iconColour: '#FFFFFF' },
    { id: 'team_16', name: 'Notts Forest', logo: 'treeDeciduous', bgColourFaint: 'rgba(221, 0, 0, 0.3)', bgColourSolid: '#DD0000', textColour: '#FFFFFF', iconColour: '#FFFFFF' },
    { id: 'team_17', name: 'Southampton', logo: 'gitlab', bgColourFaint: 'rgba(235, 20, 30, 0.3)', bgColourSolid: '#D71920', textColour: '#FFFFFF', iconColour: '#FFFFFF' },
    { id: 'team_18', name: 'Tottenham', logo: 'home', bgColourFaint: 'rgba(19, 34, 83, 0.3)', bgColourSolid: '#132257', textColour: '#FFFFFF', iconColour: '#FFFFFF' },
    { id: 'team_19', name: 'West Ham', logo: 'hammer', bgColourFaint: 'rgba(122, 38, 58, 0.3)', bgColourSolid: '#7A263A', textColour: '#FBE122', iconColour: '#FBE122' },
    { id: 'team_20', name: 'Wolves', logo: 'flower', bgColourFaint: 'rgba(253, 190, 17, 0.3)', bgColourSolid: '#FDBE11', textColour: '#000000', iconColour: '#000000' },
    // Relegated teams for last season's data
    { id: 'team_21', name: 'Luton', logo: 'utensilsCrossed', bgColourFaint: 'rgba(247, 143, 30, 0.3)', bgColourSolid: '#F78F1E', textColour: '#000000', iconColour: '#FFFFFF' },
    { id: 'team_22', name: 'Burnley', logo: 'volleyball', bgColourFaint: 'rgba(108, 29, 69, 0.3)', bgColourSolid: '#6C1D45', textColour: '#99D6EA', iconColour: '#99D6EA' },
    { id: 'team_23', name: 'Sheffield Utd', logo: 'swords', bgColourFaint: 'rgba(238, 39, 55, 0.3)', bgColourSolid: '#EE2737', textColour: '#FFFFFF', iconColour: '#FFFFFF' }
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
    if (lowerCaseName === 'ipswich') {
        acc['ipswich town'] = team.id;
    }
    if (lowerCaseName === 'leicester') {
        acc['leicester city'] = team.id;
    }
    if (lowerCaseName === 'southampton') {
        // No extra mapping needed
    }
    
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
    { teamId: 'team_21', rank: 18, points: 27, goalDifference: -33 }, // Luton
    { teamId: 'team_22', rank: 19, points: 24, goalDifference: -37 }, // Burnley
    { teamId: 'team_23', rank: 20, points: 16, goalDifference: -69 }  // Sheffield Utd
];

const userPredictionsRaw: { [key: string]: string[] } = {
    "usr_001":["Man Utd","Liverpool","Man City","Arsenal","Newcastle","Chelsea","Aston Villa","Notts Forest","Tottenham","Bournemouth","Brighton","Fulham","Brentford","Ipswich","Crystal Palace","West Ham","Wolves","Everton","Leicester","Southampton"],
    "usr_002":["Liverpool","Man City","Arsenal","Chelsea","Aston Villa","Newcastle","Notts Forest","Crystal Palace","Brighton","Man Utd","Tottenham","Bournemouth","Brentford","Fulham","Everton","Ipswich","Wolves","West Ham","Leicester","Southampton"],
    "usr_003":["Liverpool","Arsenal","Man City","Chelsea","Newcastle","Man Utd","Aston Villa","Tottenham","Brighton","Bournemouth","Notts Forest","Everton","Crystal Palace","Fulham","West Ham","Brentford","Wolves","Ipswich","Leicester","Southampton"],
    "usr_004":["Liverpool","Man City","Chelsea","Arsenal","Aston Villa","Newcastle","Brighton","Tottenham","Notts Forest","Fulham","Man Utd","Bournemouth","Everton","Crystal Palace","Wolves","West Ham","Brentford","Ipswich","Leicester","Southampton"],
    "usr_005":["Chelsea","Man City","Liverpool","Arsenal","Aston Villa","Newcastle","Tottenham","Brighton","Man Utd","Fulham","Bournemouth","Brentford","Ipswich","Everton","Crystal Palace","Wolves","West Ham","Notts Forest","Leicester","Southampton"],
    "usr_006":["Chelsea","Man City","Liverpool","Arsenal","Newcastle","Man Utd","Everton","Aston Villa","Crystal Palace","Brighton","Notts Forest","Ipswich","West Ham","Southampton","Tottenham","Wolves","Bournemouth","Fulham","Brentford","Leicester"],
    "usr_007":["Man City","Liverpool","Arsenal","Chelsea","Newcastle","Aston Villa","Tottenham","Man Utd","Bournemouth","Notts Forest","Fulham","Brighton","Wolves","Crystal Palace","West Ham","Ipswich","Everton","Brentford","Southampton","Leicester"],
    "usr_008":["Liverpool","Man City","Arsenal","Chelsea","Aston Villa","Man Utd","Tottenham","Newcastle","Bournemouth","Brighton","Everton","West Ham","Fulham","Crystal Palace","Wolves","Notts Forest","Brentford","Ipswich","Southampton","Leicester"],
    "usr_009":["Liverpool","Man City","Arsenal","Chelsea","Aston Villa","Newcastle","Tottenham","Man Utd","Notts Forest","Everton","Brighton","Brentford","West Ham","Bournemouth","Fulham","Crystal Palace","Wolves","Leicester","Ipswich","Southampton"],
    "usr_010":["Man City","Liverpool","Arsenal","Chelsea","Tottenham","Man Utd","Aston Villa","Newcastle","West Ham","Everton","Brighton","Wolves","Brentford","Fulham","Crystal Palace","Bournemouth","Notts Forest","Ipswich","Leicester","Southampton"],
    "usr_011":["Man City","Liverpool","Arsenal","Chelsea","Aston Villa","Man Utd","Tottenham","Newcastle","Everton","Brighton","Crystal Palace","Fulham","West Ham","Brentford","Bournemouth","Notts Forest","Southampton","Wolves","Leicester","Ipswich"],
    "usr_012":["Man City","Arsenal","Liverpool","Chelsea","Aston Villa","Newcastle","Brentford","Bournemouth","Notts Forest","Brighton","Crystal Palace","Everton","Man Utd","Tottenham","Fulham","West Ham","Wolves","Southampton","Leicester","Ipswich"],
    "usr_013":["Liverpool","Man City","Arsenal","Newcastle","Man Utd","Chelsea","Tottenham","Everton","Aston Villa","West Ham","Crystal Palace","Brighton","Fulham","Brentford","Notts Forest","Wolves","Bournemouth","Southampton","Ipswich","Leicester"],
    "usr_014":["Liverpool","Arsenal","Newcastle","Chelsea","Man City","Man Utd","Tottenham","Aston Villa","Everton","Bournemouth","Brighton","West Ham","Fulham","Crystal Palace","Southampton","Wolves","Brentford","Notts Forest","Ipswich","Leicester"],
    "usr_015":["Liverpool","Chelsea","Man City","Arsenal","Aston Villa","Man Utd","Newcastle","Tottenham","West Ham","Brighton","Notts Forest","Everton","Fulham","Crystal Palace","Wolves","Bournemouth","Southampton","Brentford","Leicester","Ipswich"],
    "usr_016":["Man City","Liverpool","Arsenal","Chelsea","Man Utd","Aston Villa","Newcastle","Tottenham","Notts Forest","Bournemouth","Crystal Palace","Everton","Brighton","West Ham","Brentford","Wolves","Fulham","Ipswich","Leicester","Southampton"],
    "usr_017":["Liverpool","Man City","Arsenal","Chelsea","Brighton","Notts Forest","Man Utd","Tottenham","Fulham","Crystal Palace","Everton","Aston Villa","West Ham","Newcastle","Ipswich","Wolves","Bournemouth","Brentford","Southampton","Leicester"],
    "usr_018":["Liverpool","Arsenal","Man City","Chelsea","Newcastle","Man Utd","Aston Villa","Tottenham","Notts Forest","Brighton","Bournemouth","Crystal Palace","Everton","Wolves","Fulham","West Ham","Brentford","Ipswich","Southampton","Leicester"],
    "usr_019":["Arsenal","Liverpool","Chelsea","Man City","Aston Villa","Notts Forest","Newcastle","Brighton","Bournemouth","Tottenham","Brentford","Fulham","Man Utd","Everton","West Ham","Crystal Palace","Wolves","Ipswich","Southampton","Leicester"],
    "usr_020":["Liverpool","Arsenal","Chelsea","Man City","Aston Villa","Man Utd","Newcastle","Crystal Palace","Notts Forest","Brighton","Bournemouth","Everton","Tottenham","Brentford","Fulham","West Ham","Wolves","Ipswich","Leicester","Southampton"],
    "usr_021":["Liverpool","Arsenal","Man City","Man Utd","Chelsea","Aston Villa","Tottenham","Newcastle","Crystal Palace","Brighton","Notts Forest","Bournemouth","Brentford","Everton","West Ham","Fulham","Wolves","Ipswich","Leicester","Southampton"],
    "usr_022":["Liverpool","Man City","Chelsea","Arsenal","Aston Villa","Bournemouth","Man Utd","Newcastle","Crystal Palace","Brighton","Notts Forest","Fulham","Brentford","West Ham","Everton","Tottenham","Wolves","Leicester","Ipswich","Southampton"],
    "usr_023":["Arsenal","Man City","Liverpool","Newcastle","Chelsea","Notts Forest","Man Utd","Tottenham","Wolves","Fulham","West Ham","Crystal Palace","Brentford","Brighton","Everton","Bournemouth","Ipswich","Aston Villa","Southampton","Leicester"],
    "usr_024":["Liverpool","Man City","Arsenal","Chelsea","Newcastle","Everton","Bournemouth","Aston Villa","Brighton","Notts Forest","Crystal Palace","Fulham","Man Utd","West Ham","Wolves","Tottenham","Ipswich","Brentford","Southampton","Leicester"],
    "usr_025":["Arsenal","Man City","Liverpool","Chelsea","Man Utd","Aston Villa","Crystal Palace","Newcastle","Tottenham","Brighton","Everton","Bournemouth","Notts Forest","Brentford","Fulham","West Ham","Wolves","Ipswich","Leicester","Southampton"],
    "usr_026":["Chelsea","Man City","Liverpool","Arsenal","Aston Villa","Newcastle","Everton","Bournemouth","Man Utd","Crystal Palace","Brighton","Tottenham","Notts Forest","West Ham","Fulham","Wolves","Ipswich","Brentford","Southampton","Leicester"],
    "usr_027":["Chelsea","Liverpool","Man City","Arsenal","Aston Villa","Newcastle","Tottenham","Man Utd","Notts Forest","Brighton","Brentford","Ipswich","Everton","Bournemouth","Crystal Palace","Fulham","Leicester","West Ham","Southampton","Wolves"],
    "usr_028":["Liverpool","Chelsea","Arsenal","Notts Forest","Man City","Bournemouth","Newcastle","Tottenham","Wolves","Aston Villa","Brighton","Everton","Crystal Palace","Man Utd","West Ham","Fulham","Ipswich","Leicester","Brentford","Southampton"],
    "usr_029":["Liverpool","Arsenal","Man City","Chelsea","Aston Villa","Newcastle","Tottenham","Man Utd","Brighton","Notts Forest","Everton","Bournemouth","Crystal Palace","Fulham","West Ham","Brentford","Wolves","Ipswich","Southampton","Leicester"],
    "usr_030":["Man City","Arsenal","Liverpool","Chelsea","Newcastle","Aston Villa","Tottenham","Man Utd","Crystal Palace","Fulham","Notts Forest","Brighton","Bournemouth","Everton","West Ham","Ipswich","Wolves","Brentford","Leicester","Southampton"],
    "usr_031":["Liverpool","Man City","Arsenal","Chelsea","Tottenham","Aston Villa","Newcastle","Brighton","Man Utd","Crystal Palace","Everton","West Ham","Notts Forest","Bournemouth","Wolves","Fulham","Ipswich","Brentford","Leicester","Southampton"],
    "usr_032":["Liverpool","Man City","Arsenal","Chelsea","Aston Villa","Newcastle","Man Utd","Tottenham","Notts Forest","Brighton","Everton","Bournemouth","Fulham","Brentford","West Ham","Crystal Palace","Ipswich","Wolves","Leicester","Southampton"],
    "usr_033":["Man City","Arsenal","Chelsea","Liverpool","Man Utd","Aston Villa","Tottenham","Brighton","Newcastle","Bournemouth","Everton","Fulham","Crystal Palace","West Ham","Notts Forest","Brentford","Southampton","Wolves","Ipswich","Leicester"],
    "usr_034":["Man City","Liverpool","Chelsea","Arsenal","Aston Villa","Tottenham","Man Utd","Brighton","Newcastle","Crystal Palace","Bournemouth","Notts Forest","Fulham","Everton","West Ham","Brentford","Ipswich","Southampton","Wolves","Leicester"],
    "usr_035":["Arsenal","Liverpool","Aston Villa","Man City","Chelsea","Man Utd","Tottenham","Brighton","Newcastle","Bournemouth","Notts Forest","Everton","Fulham","Crystal Palace","Wolves","Southampton","Ipswich","West Ham","Brentford","Leicester"],
    "usr_036":["Liverpool","Man City","Arsenal","Chelsea","Man Utd","Aston Villa","Newcastle","Brighton","Tottenham","Everton","Fulham","Bournemouth","West Ham","Crystal Palace","Notts Forest","Brentford","Wolves","Ipswich","Leicester","Southampton"],
    "usr_037":["Liverpool","Man City","Chelsea","Arsenal","Man Utd","Aston Villa","Tottenham","Everton","Newcastle","Crystal Palace","Brighton","Bournemouth","Notts Forest","Fulham","West Ham","Brentford","Wolves","Leicester","Ipswich","Southampton"],
    "usr_038":["Liverpool","Arsenal","Man City","Chelsea","Aston Villa","Newcastle","Man Utd","Brighton","Tottenham","Notts Forest","Crystal Palace","Everton","Bournemouth","Fulham","West Ham","Brentford","Wolves","Leicester","Ipswich","Southampton"],
    "usr_039":["Liverpool","Arsenal","Man City","Chelsea","Man Utd","Aston Villa","Tottenham","Newcastle","Notts Forest","Brighton","Fulham","Bournemouth","Everton","Crystal Palace","Brentford","West Ham","Ipswich","Wolves","Leicester","Southampton"],
    "usr_040":["Liverpool","Man City","Man Utd","Chelsea","Tottenham","Arsenal","Aston Villa","Everton","Fulham","Crystal Palace","Newcastle","Notts Forest","West Ham","Brighton","Bournemouth","Southampton","Wolves","Leicester","Brentford","Ipswich"],
    "usr_041":["MAN CITY","CHELSEA","LIVERPOOL","ARSENAL","TOTTENHAM","ASTON VILLA","MAN UTD","NEWCASTLE","EVERTON","BRIGHTON","NOTTS FOREST","CRYSTAL PALACE","WEST HAM","FULHAM","WOLVES","IPSWICH","BRENTFORD","BOURNEMOUTH","SOUTHAMPTON","LEICESTER"],
    "usr_042":["Liverpool","Man City","Chelsea","Arsenal","Aston Villa","Newcastle","Man Utd","Tottenham","Crystal Palace","Brighton","Bournemouth","Notts Forest","Fulham","West Ham","Everton","Wolves","Ipswich","Southampton","Brentford","Leicester"],
    "usr_043":["Liverpool","Arsenal","Man City","Chelsea","Newcastle","Tottenham","Aston Villa","Brighton","Man Utd","Crystal Palace","Notts Forest","Bournemouth","Everton","Wolves","Fulham","West Ham","Brentford","Ipswich","Southampton","Leicester"],
    "usr_044":["Liverpool","Chelsea","Arsenal","Man City","Tottenham","Man Utd","Newcastle","Aston Villa","Brighton","Notts Forest","Crystal Palace","Everton","West Ham","Bournemouth","Fulham","Brentford","Wolves","Ipswich","Southampton","Leicester"],
    "usr_045":["Man City","Arsenal","Man Utd","Newcastle","Liverpool","Chelsea","Tottenham","Brighton","Aston Villa","West Ham","Brentford","Crystal Palace","Fulham","Wolves","Notts Forest","Everton","Bournemouth","Southampton","Leicester","Ipswich"],
    "usr_046":["Man City","Arsenal","Liverpool","Chelsea","Newcastle","Man Utd","Brighton","Aston Villa","Tottenham","Notts Forest","Fulham","Crystal Palace","Everton","Bournemouth","Leicester","Brentford","Ipswich","Wolves","West Ham","Southampton"],
    "usr_047":["Chelsea","Liverpool","Man City","Man Utd","Arsenal","Newcastle","Crystal Palace","Brighton","Aston Villa","Notts Forest","Tottenham","Everton","Wolves","Bournemouth","Fulham","Ipswich","West Ham","Leicester","Brentford","Southampton"],
    "usr_048":["Chelsea","Liverpool","Man City","Arsenal","Newcastle","Man Utd","Aston Villa","Tottenham","Brighton","Fulham","Crystal Palace","Notts Forest","Wolves","Ipswich","Bournemouth","Brentford","Everton","Leicester","West Ham","Southampton"],
    "usr_049":["Liverpool","Chelsea","Man City","Arsenal","Newcastle","Man Utd","Crystal Palace","Aston Villa","Brighton","Fulham","Tottenham","Notts Forest","Wolves","Everton","Bournemouth","Brentford","Ipswich","Leicester","West Ham","Southampton"],
    "usr_050":["Chelsea","Liverpool","Man City","Arsenal","Tottenham","Newcastle","Aston Villa","Notts Forest","Crystal Palace","Man Utd","Bournemouth","Brighton","West Ham","Fulham","Everton","Wolves","Southampton","Brentford","Ipswich","Leicester"],
    "usr_051":["Liverpool","Chelsea","Man City","Arsenal","Aston Villa","Newcastle","Notts Forest","Brighton","Bournemouth","Man Utd","Everton","Brentford","West Ham","Crystal Palace","Fulham","Tottenham","Wolves","Leicester","Ipswich","Southampton"],
    "usr_052":["Man City","Chelsea","Liverpool","Arsenal","Man Utd","Aston Villa","Newcastle","Everton","Tottenham","Crystal Palace","Brighton","West Ham","Fulham","Notts Forest","Southampton","Bournemouth","Leicester","Ipswich","Brentford","Wolves"],
    "usr_053":["Arsenal","Liverpool","Man City","Chelsea","Aston Villa","Newcastle","Tottenham","Man Utd","Everton","Notts Forest","Brighton","Brentford","West Ham","Fulham","Ipswich","Crystal Palace","Wolves","Bournemouth","Southampton","Leicester"],
    "usr_054":["Liverpool","Man City","Chelsea","Tottenham","Newcastle","Man Utd","Aston Villa","Notts Forest","Arsenal","Everton","Crystal Palace","Brighton","Fulham","Bournemouth","Ipswich","Southampton","West Ham","Brentford","Wolves","Leicester"],
    "usr_055":["Chelsea","Liverpool","Man City","Arsenal","Newcastle","Aston Villa","Notts Forest","Everton","Man Utd","Crystal Palace","Brighton","Bournemouth","Fulham","Brentford","Tottenham","West Ham","Ipswich","Wolves","Leicester","Southampton"],
    "usr_056":["Liverpool","Man City","Chelsea","Arsenal","Newcastle","Tottenham","Man Utd","Brighton","Aston Villa","Bournemouth","Brentford","Everton","Notts Forest","West Ham","Fulham","Crystal Palace","Ipswich","Southampton","Wolves","Leicester"],
    "usr_057":["Liverpool","Man City","Arsenal","Chelsea","Notts Forest","Man Utd","Brighton","Aston Villa","Newcastle","Crystal Palace","Everton","Tottenham","Fulham","Bournemouth","West Ham","Brentford","Southampton","Wolves","Ipswich","Leicester"],
    "usr_058":["Arsenal","Liverpool","Man City","Man Utd","Chelsea","Aston Villa","Newcastle","Brighton","Notts Forest","Tottenham","Fulham","Crystal Palace","Everton","Wolves","Bournemouth","West Ham","Ipswich","Leicester","Brentford","Southampton"],
    "usr_059":["Arsenal","Chelsea","Man City","liverpool","man utd","Aston Villa","Tottenham","Notts Forest","Crystal Palace","Newcastle","Bournemouth","Brighton","Fulham","everton","West Ham","wolves","Southampton","Ipswich","Brentford","Leicester"],
    "usr_060":["Liverpool","Arsenal","Chelsea","Man City","Newcastle","Tottenham","Aston Villa","Man Utd","Bournemouth","Brighton","Notts Forest","Crystal Palace","West Ham","Brentford","Fulham","Wolves","Everton","Ipswich","Leicester","Southampton"],
    "usr_061":["Liverpool","Arsenal","Man City","Chelsea","Aston Villa","Crystal Palace","Newcastle","Brighton","Bournemouth","Notts Forest","Tottenham","Man Utd","Brentford","Fulham","Everton","West Ham","Wolves","Leicester","Ipswich","Southampton"],
    "usr_062":["Liverpool","Man City","Arsenal","Chelsea","Tottenham","Man Utd","Newcastle","Aston Villa","Everton","Brighton","Notts Forest","Brentford","Bournemouth","Crystal Palace","West Ham","Fulham","Wolves","Ipswich","Leicester","Southampton"],
    "usr_063":["Liverpool","Arsenal","Man City","Chelsea","Aston villa","Notts forest","Crystal palace","Newcastle","brighton","bournemouth","Tottenham","Man utd","Brentford","West Ham","Everton","Fulham","Ipswich","Wolves","Leicester","Southampton"],
    "usr_064":["Liverpool","Man City","Chelsea","Arsenal","Aston Villa","Tottenham","Man Utd","Newcastle","Brighton","Notts Forest","Crystal Palace","Everton","Bournemouth","West Ham","Brentford","Fulham","Southampton","Ipswich","Wolves","Leicester"],
    "usr_065":["Chelsea","Liverpool","Man City","Arsenal","Brighton","Aston Villa","Man Utd","Newcastle","Notts Forest","Tottenham","Everton","Ipswich","Crystal Palace","West Ham","Fulham","Southampton","Wolves","Bournemouth","Brentford","Leicester"],
    "usr_066":["Liverpool","Chelsea","Arsenal","Man City","Newcastle","Aston Villa","Tottenham","Man Utd","Brighton","Bournemouth","Notts Forest","Fulham","Everton","Brentford","Crystal Palace","West Ham","Southampton","Wolves","Ipswich","Leicester"],
    "usr_067":["Liverpool","Arsenal","Chelsea","Man City","Newcastle","Aston Villa","Tottenham","Man Utd","Brighton","Crystal Palace","Bournemouth","Fulham","Everton","Wolves","Notts Forest","Brentford","West Ham","Ipswich","Leicester","Southampton"],
    "usr_068":["Liverpool","Arsenal","Man City","Chelsea","Man Utd","Newcastle","Aston Villa","Everton","Tottenham","Brighton","Notts Forest","Crystal Palace","Bournemouth","Fulham","West Ham","Wolves","Ipswich","Brentford","Leicester","Southampton"],
    "usr_069":["Arsenal","Man City","Liverpool","Man Utd","Chelsea","Aston Villa","Tottenham","Newcastle","Notts Forest","Brighton","Bournemouth","Everton","Crystal Palace","Brentford","Fulham","West Ham","Wolves","Ipswich","Leicester","Southampton"],
    "usr_070":["Liverpool","Arsenal","Man City","Newcastle","Chelsea","Aston Villa","Brighton","Crystal Palace","Brentford","Notts Forest","Man Utd","Tottenham","Bournemouth","Everton","Fulham","West Ham","Ipswich","Wolves","Leicester","Southampton"],
    "usr_071":["Man City","Chelsea","Liverpool","Arsenal","Aston Villa","Newcastle","Tottenham","Man Utd","Notts Forest","West Ham","Fulham","Brighton","Everton","Crystal Palace","Bournemouth","Ipswich","Brentford","Wolves","Southampton","Leicester"],
    "usr_072":["Arsenal","Liverpool","Man City","Chelsea","Aston Villa","Newcastle","Man Utd","Brighton","Tottenham","Bournemouth","Notts Forest","Wolves","Fulham","Crystal Palace","Everton","Brentford","Southampton","West Ham","Leicester","Ipswich"],
    "usr_073":["Liverpool","Man City","Chelsea","Arsenal","Newcastle","Man Utd","Aston Villa","Notts Forest","Fulham","Tottenham","Everton","Crystal Palace","Brighton","Bournemouth","West Ham","Brentford","Wolves","Ipswich","Leicester","Southampton"],
    "usr_074":["Liverpool","Man City","Chelsea","Arsenal","Aston Villa","Man Utd","Newcastle","Notts Forest","Crystal Palace","Everton","Tottenham","Bournemouth","Fulham","Brighton","Wolves","Ipswich","West Ham","Brentford","Southampton","Leicester"],
    "usr_075":["Liverpool","Man City","Chelsea","Arsenal","Tottenham","Man Utd","Newcastle","Aston Villa","Ipswich","Crystal Palace","Brighton","Wolves","Everton","Notts Forest","Southampton","West Ham","Fulham","Brentford","Bournemouth","Leicester"],
    "usr_076":["Liverpool","Arsenal","Man City","Chelsea","Newcastle","Aston Villa","Crystal Palace","Notts Forest","Brighton","Brentford","Bournemouth","Man Utd","Fulham","Everton","Tottenham","West Ham","Leicester","Wolves","Ipswich","Southampton"],
    "usr_077":["Liverpool","Arsenal","Chelsea","Man City","Aston Villa","Newcastle","Crystal Palace","Brighton","Man Utd","Tottenham","Everton","Southampton","Notts Forest","Brentford","West Ham","Ipswich","Fulham","Wolves","Bournemouth","Leicester"],
    "usr_078":["Man City","Liverpool","Chelsea","Arsenal","Notts Forest","Man Utd","Tottenham","Brighton","Newcastle","Bournemouth","Aston Villa","Everton","Fulham","Crystal Palace","Brentford","West Ham","Leicester","Wolves","Ipswich","Southampton"],
    "usr_079":["Liverpool","Chelsea","Man City","Arsenal","Man Utd","Aston Villa","Newcastle","Tottenham","Everton","Crystal Palace","Notts Forest","Bournemouth","Brighton","Brentford","West Ham","Fulham","Leicester","Ipswich","Wolves","Southampton"],
    "usr_080":["Liverpool","Arsenal","Man City","Chelsea","Aston Villa","Newcastle","Tottenham","Man Utd","Brighton","Crystal Palace","Notts Forest","Everton","Wolves","West Ham","Fulham","Bournemouth","Brentford","Ipswich","Southampton","Leicester"],
    "usr_081":["Arsenal","Liverpool","Chelsea","Man City","Man Utd","Newcastle","Aston Villa","Tottenham","Brighton","Notts Forest","Crystal Palace","West Ham","Wolves","Everton","Brentford","Southampton","Fulham","Ipswich","Bournemouth","Leicester"],
    "usr_082":["Liverpool","Arsenal","Man City","Chelsea","Aston Villa","Man Utd","Tottenham","Newcastle","Brighton","Notts Forest","Crystal Palace","Everton","Bournemouth","Fulham","West Ham","Wolves","Ipswich","Leicester","Southampton","Brentford"],
    "usr_083":["Arsenal","Liverpool","Crystal Palace","Chelsea","Man City","Aston Villa","Newcastle","Brighton","Man Utd","Notts Forest","Tottenham","Everton","Bournemouth","Brentford","Wolves","Fulham","Ipswich","West Ham","Southampton","Leicester"],
    "usr_084":["Liverpool","Arsenal","Man City","Chelsea","Newcastle","Aston Villa","Brighton","West Ham","Man Utd","Tottenham","Crystal Palace","Wolves","Fulham","Brentford","Bournemouth","Notts Forest","Everton","Ipswich","Leicester","Southampton"],
    "usr_085":["Liverpool","Man City","Chelsea","Arsenal","Newcastle","Tottenham","Man Utd","Aston Villa","Crystal Palace","Brighton","Notts Forest","Bournemouth","Everton","Fulham","West Ham","Ipswich","Wolves","Brentford","Southampton","Leicester"],
    "usr_086":["Arsenal","Liverpool","Man City","Chelsea","Aston Villa","Newcastle","Notts Forest","Everton","Bournemouth","Brighton","Crystal Palace","Tottenham","Fulham","Man Utd","Brentford","West Ham","Wolves","Ipswich","Southampton","Leicester"],
    "usr_087":["Liverpool","Man City","Arsenal","Chelsea","Newcastle","Aston Villa","Man Utd","Brighton","Tottenham","Crystal Palace","Notts Forest","Bournemouth","Fulham","Everton","West Ham","Wolves","Southampton","Brentford","Ipswich","Leicester"],
    "usr_088":["Liverpool","Chelsea","Arsenal","Man City","Man Utd","Tottenham","Aston Villa","Crystal Palace","Newcastle","Everton","West Ham","Fulham","Brighton","Brentford","Notts Forest","Bournemouth","Ipswich","Leicester","Wolves","Southampton"],
    "usr_089":["Liverpool","Arsenal","Chelsea","Man City","Newcastle","Aston Villa","Man Utd","Brighton","Crystal Palace","Tottenham","Notts Forest","Bournemouth","Fulham","Brentford","Everton","West Ham","Wolves","Southampton","Ipswich","Leicester"],
    "usr_090":["Man Utd","Liverpool","Arsenal","Man City","Aston Villa","Chelsea","Tottenham","Leicester","Bournemouth","Brighton","Notts Forest","Fulham","Newcastle","Brentford","Crystal Palace","Southampton","Ipswich","Everton","Wolves","West Ham"],
    "usr_091":["Man City","Arsenal","Liverpool","Aston Villa","Chelsea","Crystal Palace","Tottenham","Man Utd","Newcastle","Fulham","Ipswich","Bournemouth","Leicester","Wolves","Notts Forest","Brentford","Brighton","Everton","Southampton","West Ham"],
    "usr_092":["Liverpool","Arsenal","Man City","Chelsea","Aston Villa","Newcastle","Tottenham","Man Utd","Brighton","Crystal Palace","Notts Forest","Fulham","Brentford","West Ham","Bournemouth","Everton","Wolves","Ipswich","Southampton","Leicester"],
    "usr_093":["Liverpool","Arsenal","Man City","Chelsea","Aston Villa","Tottenham","Newcastle","Brighton","Man Utd","Notts Forest","Crystal Palace","Brentford","Bournemouth","Everton","Fulham","West Ham","Wolves","Leicester","Ipswich","Southampton"],
    "usr_094":["Liverpool","Man City","Chelsea","Arsenal","Aston Villa","Man Utd","Newcastle","Tottenham","Brighton","Everton","Bournemouth","Notts Forest","Crystal Palace","Fulham","West Ham","Ipswich","Brentford","Leicester","Wolves","Southampton"],
    "usr_095":["Liverpool","Man City","Chelsea","Arsenal","Newcastle","Man Utd","Aston Villa","Tottenham","Brighton","Crystal Palace","Bournemouth","West Ham","Fulham","Everton","Notts Forest","Wolves","Leicester","Ipswich","Brentford","Southampton"],
    "usr_096":["Arsenal","Liverpool","Man City","Chelsea","Aston Villa","Tottenham","Man Utd","Crystal Palace","Newcastle","Notts Forest","Everton","Brighton","West Ham","Fulham","Bournemouth","Brentford","Ipswich","Southampton","Wolves","Leicester"],
    "usr_097":["Arsenal","Liverpool","Chelsea","Man City","Aston Villa","Tottenham","Notts Forest","Crystal Palace","Man Utd","Brighton","Everton","Brentford","Newcastle","West Ham","Ipswich","Wolves","Fulham","Southampton","Leicester","Bournemouth"],
    "usr_098":["Arsenal","Chelsea","Liverpool","Man City","Tottenham","Man Utd","Crystal Palace","Aston Villa","Everton","Newcastle","Brighton","Notts Forest","West Ham","Fulham","Bournemouth","Brentford","Ipswich","Wolves","Leicester","Southampton"],
    "usr_099":["Arsenal","Liverpool","Man City","Chelsea","Man Utd","Newcastle","Notts Forest","Aston Villa","Bournemouth","Tottenham","Brighton","Brentford","Crystal Palace","Ipswich","West Ham","Everton","Fulham","Wolves","Leicester","Southampton"],
    "usr_100":["Arsenal","Man City","Liverpool","Chelsea","Man Utd","Fulham","Notts Forest","Aston Villa","Newcastle","Ipswich","Crystal Palace","Tottenham","Bournemouth","Everton","Southampton","Brighton","West Ham","Brentford","Wolves","Leicester"],
    "usr_101":["Liverpool","Arsenal","Man City","Chelsea","Newcastle","Man Utd","Aston Villa","Tottenham","West Ham","Everton","Brighton","Wolves","Brentford","Fulham","Crystal Palace","Bournemouth","Notts Forest","Ipswich","Southampton","Leicester"],
    "usr_102":["Man Utd","Liverpool","Arsenal","Man City","Aston Villa","Chelsea","Tottenham","Newcastle","Crystal Palace","Brighton","Everton","Ipswich","Fulham","Southampton","Bournemouth","West Ham","Notts Forest","Brentford","Wolves","Leicester"],
    "usr_103":["Man City","Liverpool","Arsenal","Chelsea","Tottenham","Aston Villa","Newcastle","Man Utd","Notts Forest","Crystal Palace","Everton","West Ham","Bournemouth","Brighton","Wolves","Fulham","Ipswich","Brentford","Southampton","Leicester"],
    "usr_104":["Liverpool","Arsenal","Man City","Chelsea","Newcastle","Tottenham","Man Utd","Aston Villa","Brighton","Fulham","Notts Forest","Everton","Crystal Palace","Brentford","Bournemouth","Wolves","West Ham","Ipswich","Leicester","Southampton"],
    "usr_105":["Arsenal","Man City","Liverpool","Chelsea","Aston Villa","Tottenham","Man Utd","Newcastle","Fulham","Everton","Crystal Palace","Bournemouth","Wolves","Brighton","West Ham","Notts Forest","Ipswich","Leicester","Southampton","Brentford"],
    "usr_106":["Liverpool","Man City","Arsenal","Chelsea","Aston Villa","Newcastle","Man Utd","Tottenham","Brighton","Notts Forest","Crystal Palace","Everton","Bournemouth","Fulham","West Ham","Brentford","Wolves","Ipswich","Southampton","Leicester"],
    "usr_107":["Liverpool","Arsenal","Man City","Newcastle","Chelsea","Aston Villa","Notts Forest","Tottenham","Brighton","Fulham","Man Utd","Everton","West Ham","Bournemouth","Brentford","Ipswich","Crystal Palace","Wolves","Leicester","Southampton"],
    "usr_108":["Man City","Arsenal","Liverpool","Chelsea","Man Utd","Aston Villa","Tottenham","Newcastle","West Ham","Everton","Brighton","Wolves","Brentford","Fulham","Crystal Palace","Bournemouth","Notts Forest","Leicester","Southampton","Ipswich"],
    "usr_109":["Liverpool","Man City","Arsenal","Chelsea","Man Utd","Notts Forest","Tottenham","Aston Villa","Newcastle","Brighton","Bournemouth","Fulham","Crystal Palace","Everton","West Ham","Southampton","Ipswich","Brentford","Wolves","Leicester"]
};

// Helper function to convert 'DD/MM/YYYY HH:mm' to ISO 8601 format
const parseDate = (dateString: string): string => {
  const [datePart, timePart] = dateString.split(' ');
  const [day, month, year] = datePart.split('/');
  const time = timePart || '15:00'; // Default time if not provided
  return new Date(`${year}-${month}-${day}T${time}:00`).toISOString();
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
    { id: '1-team_12-team_03', week: 1, matchDate: '2025-08-15T15:00:00.000Z', homeTeamId: 'team_12', awayTeamId: 'team_03', homeScore: 4, awayScore: 2 },
    { id: '1-team_20-team_13', week: 1, matchDate: '2025-08-16T15:00:00.000Z', homeTeamId: 'team_20', awayTeamId: 'team_13', homeScore: 0, awayScore: 4 },
    { id: '1-team_18-team_11', week: 1, matchDate: '2025-08-16T15:00:00.000Z', homeTeamId: 'team_18', awayTeamId: 'team_11', homeScore: 3, awayScore: 0 },
    { id: '1-team_17-team_19', week: 1, matchDate: '2025-08-16T15:00:00.000Z', homeTeamId: 'team_17', awayTeamId: 'team_19', homeScore: 3, awayScore: 0 },
    { id: '1-team_05-team_09', week: 1, matchDate: '2025-08-16T15:00:00.000Z', homeTeamId: 'team_05', awayTeamId: 'team_09', homeScore: 1, awayScore: 1 },
    { id: '1-team_02-team_15', week: 1, matchDate: '2025-08-16T15:00:00.000Z', homeTeamId: 'team_02', awayTeamId: 'team_15', homeScore: 0, awayScore: 0 },
    { id: '1-team_14-team_01', week: 1, matchDate: '2025-08-17T15:00:00.000Z', homeTeamId: 'team_14', awayTeamId: 'team_01', homeScore: 0, awayScore: 1 },
    { id: '1-team_16-team_04', week: 1, matchDate: '2025-08-17T15:00:00.000Z', homeTeamId: 'team_16', awayTeamId: 'team_04', homeScore: 3, awayScore: 1 },
    { id: '1-team_06-team_07', week: 1, matchDate: '2025-08-17T15:00:00.000Z', homeTeamId: 'team_06', awayTeamId: 'team_07', homeScore: 0, awayScore: 0 },
    { id: '1-team_10-team_08', week: 1, matchDate: '2025-08-18T15:00:00.000Z', homeTeamId: 'team_10', awayTeamId: 'team_08', homeScore: 1, awayScore: 0 },
    { id: '2-team_19-team_06', week: 2, matchDate: '2025-08-22T15:00:00.000Z', homeTeamId: 'team_19', awayTeamId: 'team_06', homeScore: 1, awayScore: 5 },
    { id: '2-team_01-team_10', week: 2, matchDate: '2025-08-23T15:00:00.000Z', homeTeamId: 'team_01', awayTeamId: 'team_10', homeScore: 5, awayScore: 0 },
    { id: '2-team_11-team_17', week: 2, matchDate: '2025-08-23T15:00:00.000Z', homeTeamId: 'team_11', awayTeamId: 'team_17', homeScore: 2, awayScore: 0 },
    { id: '2-team_04-team_02', week: 2, matchDate: '2025-08-23T15:00:00.000Z', homeTeamId: 'team_04', awayTeamId: 'team_02', homeScore: 1, awayScore: 0 },
    { id: '2-team_03-team_20', week: 2, matchDate: '2025-08-23T15:00:00.000Z', homeTeamId: 'team_03', awayTeamId: 'team_20', homeScore: 1, awayScore: 0 },
    { id: '2-team_13-team_18', week: 2, matchDate: '2025-08-23T15:00:00.000Z', homeTeamId: 'team_13', awayTeamId: 'team_18', homeScore: 0, awayScore: 2 },
    { id: '2-team_09-team_14', week: 2, matchDate: '2025-08-24T15:00:00.000Z', homeTeamId: 'team_09', awayTeamId: 'team_14', homeScore: 1, awayScore: 1 },
    { id: '2-team_08-team_05', week: 2, matchDate: '2025-08-24T15:00:00.000Z', homeTeamId: 'team_08', awayTeamId: 'team_05', homeScore: 2, awayScore: 0 },
    { id: '2-team_07-team_16', week: 2, matchDate: '2025-08-24T15:00:00.000Z', homeTeamId: 'team_07', awayTeamId: 'team_16', homeScore: 1, awayScore: 1 },
    { id: '2-team_15-team_12', week: 2, matchDate: '2025-08-25T15:00:00.000Z', homeTeamId: 'team_15', awayTeamId: 'team_12', homeScore: 2, awayScore: 3 },
    { id: '3-team_10-team_15', week: 3, matchDate: '2025-08-30T15:00:00.000Z', homeTeamId: 'team_10', awayTeamId: 'team_15', homeScore: 0, awayScore: 0 },
    { id: '3-team_20-team_08', week: 3, matchDate: '2025-08-30T15:00:00.000Z', homeTeamId: 'team_20', awayTeamId: 'team_08', homeScore: 2, awayScore: 3 },
    { id: '3-team_18-team_03', week: 3, matchDate: '2025-08-30T15:00:00.000Z', homeTeamId: 'team_18', awayTeamId: 'team_03', homeScore: 0, awayScore: 1 },
    { id: '3-team_17-team_04', week: 3, matchDate: '2025-08-30T15:00:00.000Z', homeTeamId: 'team_17', awayTeamId: 'team_04', homeScore: 2, awayScore: 1 },
    { id: '3-team_14-team_11', week: 3, matchDate: '2025-08-30T15:00:00.000Z', homeTeamId: 'team_14', awayTeamId: 'team_11', homeScore: 3, awayScore: 2 },
    { id: '3-team_06-team_09', week: 3, matchDate: '2025-08-30T15:00:00.000Z', homeTeamId: 'team_06', awayTeamId: 'team_09', homeScore: 2, awayScore: 0 },
    { id: '3-team_02-team_07', week: 3, matchDate: '2025-08-31T15:00:00.000Z', homeTeamId: 'team_02', awayTeamId: 'team_07', homeScore: 0, awayScore: 3 },
    { id: '3-team_12-team_01', week: 3, matchDate: '2025-08-31T15:00:00.000Z', homeTeamId: 'team_12', awayTeamId: 'team_01', homeScore: 1, awayScore: 0 },
    { id: '3-team_16-team_19', week: 3, matchDate: '2025-08-31T15:00:00.000Z', homeTeamId: 'team_16', awayTeamId: 'team_19', homeScore: 0, awayScore: 3 },
    { id: '3-team_05-team_13', week: 3, matchDate: '2025-08-31T15:00:00.000Z', homeTeamId: 'team_05', awayTeamId: 'team_13', homeScore: 2, awayScore: 1 },
    { id: '4-team_04-team_06', week: 4, matchDate: '2025-09-13T15:00:00.000Z', homeTeamId: 'team_04', awayTeamId: 'team_06', homeScore: 2, awayScore: 2 },
    { id: '4-team_19-team_18', week: 4, matchDate: '2025-09-13T15:00:00.000Z', homeTeamId: 'team_19', awayTeamId: 'team_18', homeScore: 0, awayScore: 3 },
    { id: '4-team_15-team_20', week: 4, matchDate: '2025-09-13T15:00:00.000Z', homeTeamId: 'team_15', awayTeamId: 'team_20', homeScore: 1, awayScore: 0 },
    { id: '4-team_09-team_10', week: 4, matchDate: '2025-09-13T15:00:00.000Z', homeTeamId: 'team_09', awayTeamId: 'team_10', homeScore: 1, awayScore: 0 },
    { id: '4-team_08-team_02', week: 4, matchDate: '2025-09-13T15:00:00.000Z', homeTeamId: 'team_08', awayTeamId: 'team_02', homeScore: 0, awayScore: 0 },
    { id: '4-team_07-team_17', week: 4, matchDate: '2025-09-13T15:00:00.000Z', homeTeamId: 'team_07', awayTeamId: 'team_17', homeScore: 0, awayScore: 0 },
    { id: '4-team_03-team_05', week: 4, matchDate: '2025-09-13T15:00:00.000Z', homeTeamId: 'team_03', awayTeamId: 'team_05', homeScore: 2, awayScore: 1 },
    { id: '4-team_01-team_16', week: 4, matchDate: '2025-09-13T15:00:00.000Z', homeTeamId: 'team_01', awayTeamId: 'team_16', homeScore: 3, awayScore: 0 },
    { id: '4-team_13-team_14', week: 4, matchDate: '2025-09-14T15:00:00.000Z', homeTeamId: 'team_13', awayTeamId: 'team_14', homeScore: 3, awayScore: 0 },
    { id: '4-team_11-team_12', week: 4, matchDate: '2025-09-14T15:00:00.000Z', homeTeamId: 'team_11', awayTeamId: 'team_12', homeScore: 0, awayScore: 1 },
    { id: '5-team_09-team_04', week: 5, matchDate: '2025-09-20T15:00:00.000Z', homeTeamId: 'team_09', awayTeamId: 'team_04', homeScore: 3, awayScore: 1 },
    { id: '5-team_14-team_06', week: 5, matchDate: '2025-09-20T15:00:00.000Z', homeTeamId: 'team_14', awayTeamId: 'team_06', homeScore: 2, awayScore: 1 },
    { id: '5-team_20-team_10', week: 5, matchDate: '2025-09-20T15:00:00.000Z', homeTeamId: 'team_20', awayTeamId: 'team_10', homeScore: 1, awayScore: 3 },
    { id: '5-team_19-team_07', week: 5, matchDate: '2025-09-20T15:00:00.000Z', homeTeamId: 'team_19', awayTeamId: 'team_07', homeScore: 1, awayScore: 2 },
    { id: '5-team_11-team_16', week: 5, matchDate: '2025-09-20T15:00:00.000Z', homeTeamId: 'team_11', awayTeamId: 'team_16', homeScore: 1, awayScore: 1 },
    { id: '5-team_05-team_18', week: 5, matchDate: '2025-09-20T15:00:00.000Z', homeTeamId: 'team_05', awayTeamId: 'team_18', homeScore: 2, awayScore: 2 },
    { id: '5-team_12-team_08', week: 5, matchDate: '2025-09-20T15:00:00.000Z', homeTeamId: 'team_12', awayTeamId: 'team_08', homeScore: 2, awayScore: 1 },
    { id: '5-team_01-team_13', week: 5, matchDate: '2025-09-21T15:00:00.000Z', homeTeamId: 'team_01', awayTeamId: 'team_13', homeScore: 1, awayScore: 1 },
    { id: '5-team_17-team_02', week: 5, matchDate: '2025-09-21T15:00:00.000Z', homeTeamId: 'team_17', awayTeamId: 'team_02', homeScore: 1, awayScore: 1 },
    { id: '5-team_03-team_15', week: 5, matchDate: '2025-09-21T15:00:00.000Z', homeTeamId: 'team_03', awayTeamId: 'team_15', homeScore: 0, awayScore: 0 },
    { id: '6-team_18-team_20', week: 6, matchDate: '2025-09-27T15:00:00.000Z', homeTeamId: 'team_18', awayTeamId: 'team_20', homeScore: 1, awayScore: 1 },
    { id: '6-team_16-team_17', week: 6, matchDate: '2025-09-27T15:00:00.000Z', homeTeamId: 'team_16', awayTeamId: 'team_17', homeScore: 0, awayScore: 1 },
    { id: '6-team_13-team_11', week: 6, matchDate: '2025-09-27T15:00:00.000Z', homeTeamId: 'team_13', awayTeamId: 'team_11', homeScore: 5, awayScore: 1 },
    { id: '6-team_10-team_03', week: 6, matchDate: '2025-09-27T15:00:00.000Z', homeTeamId: 'team_10', awayTeamId: 'team_03', homeScore: 2, awayScore: 2 },
    { id: '6-team_07-team_12', week: 6, matchDate: '2025-09-27T15:00:00.000Z', homeTeamId: 'team_07', awayTeamId: 'team_12', homeScore: 2, awayScore: 1 },
    { id: '6-team_06-team_05', week: 6, matchDate: '2025-09-27T15:00:00.000Z', homeTeamId: 'team_06', awayTeamId: 'team_05', homeScore: 1, awayScore: 3 },
    { id: '6-team_04-team_14', week: 6, matchDate: '2025-09-27T15:00:00.000Z', homeTeamId: 'team_04', awayTeamId: 'team_14', homeScore: 3, awayScore: 1 },
    { id: '6-team_15-team_01', week: 6, matchDate: '2025-09-28T15:00:00.000Z', homeTeamId: 'team_15', awayTeamId: 'team_01', homeScore: 1, awayScore: 2 },
    { id: '6-team_02-team_09', week: 6, matchDate: '2025-09-28T15:00:00.000Z', homeTeamId: 'team_02', awayTeamId: 'team_09', homeScore: 3, awayScore: 1 },
    { id: '6-team_08-team_19', week: 6, matchDate: '2025-09-29T15:00:00.000Z', homeTeamId: 'team_08', awayTeamId: 'team_19', homeScore: 1, awayScore: 1 },
    { id: '7-team_03-team_09', week: 7, matchDate: '2025-10-03T15:00:00.000Z', homeTeamId: 'team_03', awayTeamId: 'team_09', homeScore: 3, awayScore: 1 },
    { id: '7-team_06-team_12', week: 7, matchDate: '2025-10-04T15:00:00.000Z', homeTeamId: 'team_06', awayTeamId: 'team_12', homeScore: 2, awayScore: 1 },
    { id: '7-team_14-team_17', week: 7, matchDate: '2025-10-04T15:00:00.000Z', homeTeamId: 'team_14', awayTeamId: 'team_17', homeScore: 2, awayScore: 0 },
    { id: '7-team_01-team_19', week: 7, matchDate: '2025-10-04T15:00:00.000Z', homeTeamId: 'team_01', awayTeamId: 'team_19', homeScore: 2, awayScore: 0 },
    { id: '7-team_10-team_18', week: 7, matchDate: '2025-10-04T15:00:00.000Z', homeTeamId: 'team_10', awayTeamId: 'team_18', homeScore: 1, awayScore: 2 },
    { id: '7-team_04-team_13', week: 7, matchDate: '2025-10-05T15:00:00.000Z', homeTeamId: 'team_04', awayTeamId: 'team_13', homeScore: 0, awayScore: 1 },
    { id: '7-team_20-team_05', week: 7, matchDate: '2025-10-05T15:00:00.000Z', homeTeamId: 'team_20', awayTeamId: 'team_05', homeScore: 1, awayScore: 1 },
    { id: '7-team_15-team_16', week: 7, matchDate: '2025-10-05T15:00:00.000Z', homeTeamId: 'team_15', awayTeamId: 'team_16', homeScore: 2, awayScore: 0 },
    { id: '7-team_08-team_07', week: 7, matchDate: '2025-10-05T15:00:00.000Z', homeTeamId: 'team_08', awayTeamId: 'team_07', homeScore: 2, awayScore: 1 },
    { id: '7-team_02-team_11', week: 7, matchDate: '2025-10-05T15:00:00.000Z', homeTeamId: 'team_02', awayTeamId: 'team_11', homeScore: 2, awayScore: 1 },
    { id: '8-team_09-team_01', week: 8, matchDate: '2025-10-18T15:00:00.000Z', homeTeamId: 'team_09', awayTeamId: 'team_01', homeScore: 0, awayScore: 1 },
    { id: '8-team_17-team_20', week: 8, matchDate: '2025-10-18T15:00:00.000Z', homeTeamId: 'team_17', awayTeamId: 'team_20', homeScore: 2, awayScore: 0 },
    { id: '8-team_13-team_08', week: 8, matchDate: '2025-10-18T15:00:00.000Z', homeTeamId: 'team_13', awayTeamId: 'team_08', homeScore: 2, awayScore: 0 },
    { id: '8-team_07-team_03', week: 8, matchDate: '2025-10-18T15:00:00.000Z', homeTeamId: 'team_07', awayTeamId: 'team_03', homeScore: 3, awayScore: 3 },
    { id: '8-team_11-team_10', week: 8, matchDate: '2025-10-18T15:00:00.000Z', homeTeamId: 'team_11', awayTeamId: 'team_10', homeScore: 2, awayScore: 0 },
    { id: '8-team_05-team_15', week: 8, matchDate: '2025-10-18T15:00:00.000Z', homeTeamId: 'team_05', awayTeamId: 'team_15', homeScore: 2, awayScore: 1 },
    { id: '8-team_16-team_06', week: 8, matchDate: '2025-10-18T15:00:00.000Z', homeTeamId: 'team_16', awayTeamId: 'team_06', homeScore: 0, awayScore: 3 },
    { id: '8-team_12-team_14', week: 8, matchDate: '2025-10-19T15:00:00.000Z', homeTeamId: 'team_12', awayTeamId: 'team_14', homeScore: 1, awayScore: 2 },
    { id: '8-team_18-team_02', week: 8, matchDate: '2025-10-19T15:00:00.000Z', homeTeamId: 'team_18', awayTeamId: 'team_02', homeScore: 1, awayScore: 2 },
    { id: '8-team_19-team_04', week: 8, matchDate: '2025-10-20T15:00:00.000Z', homeTeamId: 'team_19', awayTeamId: 'team_04', homeScore: 0, awayScore: 2 },
    { id: '9-team_10-team_19', week: 9, matchDate: '2025-10-24T15:00:00.000Z', homeTeamId: 'team_10', awayTeamId: 'team_19', homeScore: 2, awayScore: 1 },
    { id: '9-team_04-team_12', week: 9, matchDate: '2025-10-25T15:00:00.000Z', homeTeamId: 'team_04', awayTeamId: 'team_12', homeScore: 3, awayScore: 2 },
    { id: '9-team_14-team_05', week: 9, matchDate: '2025-10-25T15:00:00.000Z', homeTeamId: 'team_14', awayTeamId: 'team_05', homeScore: 4, awayScore: 2 },
    { id: '9-team_15-team_09', week: 9, matchDate: '2025-10-25T15:00:00.000Z', homeTeamId: 'team_15', awayTeamId: 'team_09', homeScore: 2, awayScore: 1 },
    { id: '9-team_06-team_17', week: 9, matchDate: '2025-10-25T15:00:00.000Z', homeTeamId: 'team_06', awayTeamId: 'team_17', homeScore: 1, awayScore: 2 },
    { id: '9-team_08-team_18', week: 9, matchDate: '2025-10-26T15:00:00.000Z', homeTeamId: 'team_08', awayTeamId: 'team_18', homeScore: 0, awayScore: 3 },
    { id: '9-team_20-team_11', week: 9, matchDate: '2025-10-26T15:00:00.000Z', homeTeamId: 'team_20', awayTeamId: 'team_11', homeScore: 2, awayScore: 3 },
    { id: '9-team_02-team_13', week: 9, matchDate: '2025-10-26T15:00:00.000Z', homeTeamId: 'team_02', awayTeamId: 'team_13', homeScore: 1, awayScore: 0 },
    { id: '9-team_01-team_07', week: 9, matchDate: '2025-10-26T15:00:00.000Z', homeTeamId: 'team_01', awayTeamId: 'team_07', homeScore: 1, awayScore: 0 },
    { id: '9-team_03-team_16', week: 9, matchDate: '2025-10-26T15:00:00.000Z', homeTeamId: 'team_03', awayTeamId: 'team_16', homeScore: 2, awayScore: 0 },
    { id: '10-team_12-team_02', week: 10, matchDate: '2025-11-01T15:00:00.000Z', homeTeamId: 'team_12', awayTeamId: 'team_02', homeScore: 2, awayScore: 0 },
    { id: '10-team_18-team_06', week: 10, matchDate: '2025-11-01T15:00:00.000Z', homeTeamId: 'team_18', awayTeamId: 'team_06', homeScore: 0, awayScore: 1 },
    { id: '10-team_16-team_14', week: 10, matchDate: '2025-11-01T15:00:00.000Z', homeTeamId: 'team_16', awayTeamId: 'team_14', homeScore: 2, awayScore: 2 },
    { id: '10-team_09-team_20', week: 10, matchDate: '2025-11-01T15:00:00.000Z', homeTeamId: 'team_09', awayTeamId: 'team_20', homeScore: 3, awayScore: 0 },
    { id: '10-team_07-team_04', week: 10, matchDate: '2025-11-01T15:00:00.000Z', homeTeamId: 'team_07', awayTeamId: 'team_04', homeScore: 2, awayScore: 0 },
    { id: '10-team_11-team_01', week: 10, matchDate: '2025-11-01T15:00:00.000Z', homeTeamId: 'team_11', awayTeamId: 'team_01', homeScore: 0, awayScore: 2 },
    { id: '10-team_05-team_10', week: 10, matchDate: '2025-11-01T15:00:00.000Z', homeTeamId: 'team_05', awayTeamId: 'team_10', homeScore: 3, awayScore: 0 },
    { id: '10-team_13-team_03', week: 10, matchDate: '2025-11-02T15:00:00.000Z', homeTeamId: 'team_13', awayTeamId: 'team_03', homeScore: 3, awayScore: 1 },
    { id: '10-team_19-team_15', week: 10, matchDate: '2025-11-02T15:00:00.000Z', homeTeamId: 'team_19', awayTeamId: 'team_15', homeScore: 3, awayScore: 1 },
    { id: '10-team_17-team_08', week: 10, matchDate: '2025-11-03T15:00:00.000Z', homeTeamId: 'team_17', awayTeamId: 'team_08', homeScore: 1, awayScore: 1 },
    { id: '11-team_06-team_20', week: 11, matchDate: '2025-11-08T15:00:00.000Z', homeTeamId: 'team_06', awayTeamId: 'team_20', homeScore: 3, awayScore: 0 },
    { id: '11-team_17-team_01', week: 11, matchDate: '2025-11-08T15:00:00.000Z', homeTeamId: 'team_17', awayTeamId: 'team_01', homeScore: 2, awayScore: 2 },
    { id: '11-team_19-team_11', week: 11, matchDate: '2025-11-08T15:00:00.000Z', homeTeamId: 'team_19', awayTeamId: 'team_11', homeScore: 3, awayScore: 2 },
    { id: '11-team_08-team_09', week: 11, matchDate: '2025-11-08T15:00:00.000Z', homeTeamId: 'team_08', awayTeamId: 'team_09', homeScore: 2, awayScore: 0 },
    { id: '11-team_18-team_14', week: 11, matchDate: '2025-11-08T15:00:00.000Z', homeTeamId: 'team_18', awayTeamId: 'team_14', homeScore: 2, awayScore: 2 },
    { id: '11-team_13-team_12', week: 11, matchDate: '2025-11-09T15:00:00.000Z', homeTeamId: 'team_13', awayTeamId: 'team_12', homeScore: 3, awayScore: 0 },
    { id: '11-team_16-team_10', week: 11, matchDate: '2025-11-09T15:00:00.000Z', homeTeamId: 'team_16', awayTeamId: 'team_10', homeScore: 3, awayScore: 1 },
    { id: '11-team_07-team_05', week: 11, matchDate: '2025-11-09T15:00:00.000Z', homeTeamId: 'team_07', awayTeamId: 'team_05', homeScore: 0, awayScore: 0 },
    { id: '11-team_04-team_15', week: 11, matchDate: '2025-11-09T15:00:00.000Z', homeTeamId: 'team_04', awayTeamId: 'team_15', homeScore: 3, awayScore: 1 },
    { id: '11-team_02-team_03', week: 11, matchDate: '2025-11-09T15:00:00.000Z', homeTeamId: 'team_02', awayTeamId: 'team_03', homeScore: 4, awayScore: 0 },
    { id: '12-team_15-team_13', week: 12, matchDate: '2025-11-22T15:00:00.000Z', homeTeamId: 'team_15', awayTeamId: 'team_13', homeScore: 2, awayScore: 1 },
    { id: '12-team_20-team_07', week: 12, matchDate: '2025-11-22T15:00:00.000Z', homeTeamId: 'team_20', awayTeamId: 'team_07', homeScore: 0, awayScore: 2 },
    { id: '12-team_12-team_16', week: 12, matchDate: '2025-11-22T15:00:00.000Z', homeTeamId: 'team_12', awayTeamId: 'team_16', homeScore: 0, awayScore: 3 },
    { id: '12-team_09-team_17', week: 12, matchDate: '2025-11-22T15:00:00.000Z', homeTeamId: 'team_09', awayTeamId: 'team_17', homeScore: 1, awayScore: 0 },
    { id: '12-team_05-team_04', week: 12, matchDate: '2025-11-22T15:00:00.000Z', homeTeamId: 'team_05', awayTeamId: 'team_04', homeScore: 2, awayScore: 1 },
    { id: '12-team_03-team_19', week: 12, matchDate: '2025-11-22T15:00:00.000Z', homeTeamId: 'team_03', awayTeamId: 'team_19', homeScore: 2, awayScore: 2 },
    { id: '12-team_10-team_02', week: 12, matchDate: '2025-11-22T15:00:00.000Z', homeTeamId: 'team_10', awayTeamId: 'team_02', homeScore: 1, awayScore: 2 },
    { id: '12-team_11-team_06', week: 12, matchDate: '2025-11-22T15:00:00.000Z', homeTeamId: 'team_11', awayTeamId: 'team_06', homeScore: 0, awayScore: 2 },
    { id: '12-team_01-team_18', week: 12, matchDate: '2025-11-23T15:00:00.000Z', homeTeamId: 'team_01', awayTeamId: 'team_18', homeScore: 4, awayScore: 1 },
    { id: '12-team_14-team_08', week: 12, matchDate: '2025-11-24T15:00:00.000Z', homeTeamId: 'team_14', awayTeamId: 'team_08', homeScore: 0, awayScore: 1 },
    { id: '13-team_18-team_09', week: 13, matchDate: '2025-11-29T15:00:00.000Z', homeTeamId: 'team_18', awayTeamId: 'team_09', homeScore: 1, awayScore: 2 },
    { id: '13-team_08-team_15', week: 13, matchDate: '2025-11-29T15:00:00.000Z', homeTeamId: 'team_08', awayTeamId: 'team_15', homeScore: 1, awayScore: 4 },
    { id: '13-team_17-team_03', week: 13, matchDate: '2025-11-29T15:00:00.000Z', homeTeamId: 'team_17', awayTeamId: 'team_03', homeScore: 3, awayScore: 2 },
    { id: '13-team_13-team_10', week: 13, matchDate: '2025-11-29T15:00:00.000Z', homeTeamId: 'team_13', awayTeamId: 'team_10', homeScore: 3, awayScore: 2 },
    { id: '13-team_04-team_11', week: 13, matchDate: '2025-11-29T15:00:00.000Z', homeTeamId: 'team_04', awayTeamId: 'team_11', homeScore: 3, awayScore: 1 },
    { id: '13-team_06-team_01', week: 13, matchDate: '2025-11-30T15:00:00.000Z', homeTeamId: 'team_06', awayTeamId: 'team_01', homeScore: 1, awayScore: 1 },
    { id: '13-team_19-team_12', week: 13, matchDate: '2025-11-30T15:00:00.000Z', homeTeamId: 'team_19', awayTeamId: 'team_12', homeScore: 0, awayScore: 2 },
    { id: '13-team_16-team_05', week: 13, matchDate: '2025-11-30T15:00:00.000Z', homeTeamId: 'team_16', awayTeamId: 'team_05', homeScore: 0, awayScore: 2 },
    { id: '13-team_07-team_14', week: 13, matchDate: '2025-11-30T15:00:00.000Z', homeTeamId: 'team_07', awayTeamId: 'team_14', homeScore: 1, awayScore: 2 },
    { id: '13-team_02-team_20', week: 13, matchDate: '2025-11-30T15:00:00.000Z', homeTeamId: 'team_02', awayTeamId: 'team_20', homeScore: 1, awayScore: 0 },
    { id: '14-team_15-team_18', week: 14, matchDate: '2025-12-02T15:00:00.000Z', homeTeamId: 'team_15', awayTeamId: 'team_18', homeScore: 2, awayScore: 2 },
    { id: '14-team_09-team_13', week: 14, matchDate: '2025-12-02T15:00:00.000Z', homeTeamId: 'team_09', awayTeamId: 'team_13', homeScore: 4, awayScore: 5 },
    { id: '14-team_03-team_08', week: 14, matchDate: '2025-12-02T15:00:00.000Z', homeTeamId: 'team_03', awayTeamId: 'team_08', homeScore: 0, awayScore: 1 },
    { id: '14-team_12-team_17', week: 14, matchDate: '2025-12-03T15:00:00.000Z', homeTeamId: 'team_12', awayTeamId: 'team_17', homeScore: 1, awayScore: 1 },
    { id: '14-team_10-team_06', week: 14, matchDate: '2025-12-03T15:00:00.000Z', homeTeamId: 'team_10', awayTeamId: 'team_06', homeScore: 3, awayScore: 1 },
    { id: '14-team_20-team_16', week: 14, matchDate: '2025-12-03T15:00:00.000Z', homeTeamId: 'team_20', awayTeamId: 'team_16', homeScore: 0, awayScore: 1 },
    { id: '14-team_11-team_07', week: 14, matchDate: '2025-12-03T15:00:00.000Z', homeTeamId: 'team_11', awayTeamId: 'team_07', homeScore: 0, awayScore: 1 },
    { id: '14-team_05-team_02', week: 14, matchDate: '2025-12-03T15:00:00.000Z', homeTeamId: 'team_05', awayTeamId: 'team_02', homeScore: 3, awayScore: 4 },
    { id: '14-team_01-team_04', week: 14, matchDate: '2025-12-03T15:00:00.000Z', homeTeamId: 'team_01', awayTeamId: 'team_04', homeScore: 2, awayScore: 0 },
    { id: '14-team_14-team_19', week: 14, matchDate: '2025-12-04T15:00:00.000Z', homeTeamId: 'team_14', awayTeamId: 'team_19', homeScore: 1, awayScore: 1 },
    { id: '15-team_10-team_12', week: 15, matchDate: '2025-12-06T15:00:00.000Z', homeTeamId: 'team_10', awayTeamId: 'team_12', homeScore: 3, awayScore: 3 },
    { id: '15-team_18-team_04', week: 15, matchDate: '2025-12-06T15:00:00.000Z', homeTeamId: 'team_18', awayTeamId: 'team_04', homeScore: 2, awayScore: 0 },
    { id: '15-team_15-team_11', week: 15, matchDate: '2025-12-06T15:00:00.000Z', homeTeamId: 'team_15', awayTeamId: 'team_11', homeScore: 2, awayScore: 1 },
    { id: '15-team_13-team_17', week: 15, matchDate: '2025-12-06T15:00:00.000Z', homeTeamId: 'team_13', awayTeamId: 'team_17', homeScore: 3, awayScore: 0 },
    { id: '15-team_08-team_16', week: 15, matchDate: '2025-12-06T15:00:00.000Z', homeTeamId: 'team_08', awayTeamId: 'team_16', homeScore: 3, awayScore: 0 },
    { id: '15-team_03-team_06', week: 15, matchDate: '2025-12-06T15:00:00.000Z', homeTeamId: 'team_03', awayTeamId: 'team_06', homeScore: 0, awayScore: 0 },
    { id: '15-team_02-team_01', week: 15, matchDate: '2025-12-06T15:00:00.000Z', homeTeamId: 'team_02', awayTeamId: 'team_01', homeScore: 2, awayScore: 1 },
    { id: '15-team_09-team_07', week: 15, matchDate: '2025-12-07T15:00:00.000Z', homeTeamId: 'team_09', awayTeamId: 'team_07', homeScore: 1, awayScore: 2 },
    { id: '15-team_05-team_19', week: 15, matchDate: '2025-12-07T15:00:00.000Z', homeTeamId: 'team_05', awayTeamId: 'team_19', homeScore: 1, awayScore: 1 },
    { id: '15-team_20-team_14', week: 15, matchDate: '2025-12-08T15:00:00.000Z', homeTeamId: 'team_20', awayTeamId: 'team_14', homeScore: 1, awayScore: 4 },
    { id: '16-team_01-team_20', week: 16, matchDate: '2025-12-13T15:00:00.000Z', homeTeamId: 'team_01', awayTeamId: 'team_20', homeScore: 2, awayScore: 1 },
    { id: '16-team_11-team_09', week: 16, matchDate: '2025-12-13T15:00:00.000Z', homeTeamId: 'team_11', awayTeamId: 'team_09', homeScore: 2, awayScore: 3 },
    { id: '16-team_12-team_05', week: 16, matchDate: '2025-12-13T15:00:00.000Z', homeTeamId: 'team_12', awayTeamId: 'team_05', homeScore: 2, awayScore: 0 },
    { id: '16-team_06-team_08', week: 16, matchDate: '2025-12-13T15:00:00.000Z', homeTeamId: 'team_06', awayTeamId: 'team_08', homeScore: 2, awayScore: 0 },
    { id: '16-team_04-team_10', week: 16, matchDate: '2025-12-14T15:00:00.000Z', homeTeamId: 'team_04', awayTeamId: 'team_10', homeScore: 1, awayScore: 1 },
    { id: '16-team_19-team_02', week: 16, matchDate: '2025-12-14T15:00:00.000Z', homeTeamId: 'team_19', awayTeamId: 'team_02', homeScore: 2, awayScore: 3 },
    { id: '16-team_17-team_15', week: 16, matchDate: '2025-12-14T15:00:00.000Z', homeTeamId: 'team_17', awayTeamId: 'team_15', homeScore: 1, awayScore: 0 },
    { id: '16-team_16-team_18', week: 16, matchDate: '2025-12-14T15:00:00.000Z', homeTeamId: 'team_16', awayTeamId: 'team_18', homeScore: 3, awayScore: 0 },
    { id: '16-team_07-team_13', week: 16, matchDate: '2025-12-14T15:00:00.000Z', homeTeamId: 'team_07', awayTeamId: 'team_13', homeScore: 0, awayScore: 3 },
    { id: '16-team_14-team_03', week: 16, matchDate: '2025-12-15T15:00:00.000Z', homeTeamId: 'team_14', awayTeamId: 'team_03', homeScore: 4, awayScore: 4 },
    { id: '17-team_10-team_07', week: 17, matchDate: '2025-12-20T15:00:00.000Z', homeTeamId: 'team_10', awayTeamId: 'team_07', homeScore: 4, awayScore: 1 },
    { id: '17-team_08-team_01', week: 17, matchDate: '2025-12-20T15:00:00.000Z', homeTeamId: 'team_08', awayTeamId: 'team_01', homeScore: 0, awayScore: 1 },
    { id: '17-team_18-team_12', week: 17, matchDate: '2025-12-20T15:00:00.000Z', homeTeamId: 'team_18', awayTeamId: 'team_12', homeScore: 1, awayScore: 2 },
    { id: '17-team_20-team_04', week: 17, matchDate: '2025-12-20T15:00:00.000Z', homeTeamId: 'team_20', awayTeamId: 'team_04', homeScore: 0, awayScore: 2 },
    { id: '17-team_13-team_19', week: 17, matchDate: '2025-12-20T15:00:00.000Z', homeTeamId: 'team_13', awayTeamId: 'team_19', homeScore: 3, awayScore: 0 },
    { id: '17-team_05-team_17', week: 17, matchDate: '2025-12-20T15:00:00.000Z', homeTeamId: 'team_05', awayTeamId: 'team_17', homeScore: 0, awayScore: 0 },
    { id: '17-team_03-team_11', week: 17, matchDate: '2025-12-20T15:00:00.000Z', homeTeamId: 'team_03', awayTeamId: 'team_11', homeScore: 1, awayScore: 1 },
    { id: '17-team_02-team_14', week: 17, matchDate: '2025-12-21T15:00:00.000Z', homeTeamId: 'team_02', awayTeamId: 'team_14', homeScore: 2, awayScore: 1 },
    { id: '17-team_15-team_06', week: 17, matchDate: '2025-12-21T15:00:00.000Z', homeTeamId: 'team_15', awayTeamId: 'team_06', homeScore: 2, awayScore: 2 },
    { id: '17-team_09-team_16', week: 17, matchDate: '2025-12-22T15:00:00.000Z', homeTeamId: 'team_09', awayTeamId: 'team_16', homeScore: 1, awayScore: 0 },
    { id: '18-team_14-team_15', week: 18, matchDate: '2025-12-26T15:00:00.000Z', homeTeamId: 'team_14', awayTeamId: 'team_15', homeScore: 1, awayScore: 0 },
    { id: '18-team_06-team_02', week: 18, matchDate: '2025-12-27T15:00:00.000Z', homeTeamId: 'team_06', awayTeamId: 'team_02', homeScore: 1, awayScore: 2 },
    { id: '18-team_19-team_09', week: 18, matchDate: '2025-12-27T15:00:00.000Z', homeTeamId: 'team_19', awayTeamId: 'team_09', homeScore: 0, awayScore: 1 },
    { id: '18-team_12-team_20', week: 18, matchDate: '2025-12-27T15:00:00.000Z', homeTeamId: 'team_12', awayTeamId: 'team_20', homeScore: 2, awayScore: 1 },
    { id: '18-team_11-team_08', week: 18, matchDate: '2025-12-27T15:00:00.000Z', homeTeamId: 'team_11', awayTeamId: 'team_08', homeScore: 0, awayScore: 0 },
    { id: '18-team_04-team_03', week: 18, matchDate: '2025-12-27T15:00:00.000Z', homeTeamId: 'team_04', awayTeamId: 'team_03', homeScore: 4, awayScore: 1 },
    { id: '18-team_01-team_05', week: 18, matchDate: '2025-12-27T15:00:00.000Z', homeTeamId: 'team_01', awayTeamId: 'team_05', homeScore: 2, awayScore: 1 },
    { id: '18-team_16-team_13', week: 18, matchDate: '2025-12-27T15:00:00.000Z', homeTeamId: 'team_16', awayTeamId: 'team_13', homeScore: 1, awayScore: 2 },
    { id: '18-team_07-team_18', week: 18, matchDate: '2025-12-28T15:00:00.000Z', homeTeamId: 'team_07', awayTeamId: 'team_18', homeScore: 0, awayScore: 1 },
    { id: '18-team_17-team_10', week: 18, matchDate: '2025-12-28T15:00:00.000Z', homeTeamId: 'team_17', awayTeamId: 'team_10', homeScore: 1, awayScore: 1 },
    { id: '19-team_14-team_20', week: 19, matchDate: '2025-12-30T15:00:00.000Z', homeTeamId: 'team_14', awayTeamId: 'team_20', homeScore: 1, awayScore: 1 },
    { id: '19-team_01-team_02', week: 19, matchDate: '2025-12-30T15:00:00.000Z', homeTeamId: 'team_01', awayTeamId: 'team_02', homeScore: 4, awayScore: 1 },
    { id: '19-team_19-team_05', week: 19, matchDate: '2025-12-30T15:00:00.000Z', homeTeamId: 'team_19', awayTeamId: 'team_05', homeScore: 2, awayScore: 2 },
    { id: '19-team_16-team_08', week: 19, matchDate: '2025-12-30T15:00:00.000Z', homeTeamId: 'team_16', awayTeamId: 'team_08', homeScore: 0, awayScore: 2 },
    { id: '19-team_06-team_03', week: 19, matchDate: '2025-12-30T15:00:00.000Z', homeTeamId: 'team_06', awayTeamId: 'team_03', homeScore: 2, awayScore: 2 },
    { id: '19-team_11-team_15', week: 19, matchDate: '2025-12-30T15:00:00.000Z', homeTeamId: 'team_11', awayTeamId: 'team_15', homeScore: 1, awayScore: 3 },
    { id: '19-team_17-team_13', week: 19, matchDate: '2026-01-01T15:00:00.000Z', homeTeamId: 'team_17', awayTeamId: 'team_13', homeScore: 0, awayScore: 0 },
    { id: '19-team_04-team_18', week: 19, matchDate: '2026-01-01T15:00:00.000Z', homeTeamId: 'team_04', awayTeamId: 'team_18', homeScore: 0, awayScore: 0 },
    { id: '19-team_12-team_10', week: 19, matchDate: '2026-01-01T15:00:00.000Z', homeTeamId: 'team_12', awayTeamId: 'team_10', homeScore: 0, awayScore: 0 },
    { id: '19-team_07-team_09', week: 19, matchDate: '2026-01-01T15:00:00.000Z', homeTeamId: 'team_07', awayTeamId: 'team_09', homeScore: 1, awayScore: 1 },
    { id: '20-team_03-team_01', week: 20, matchDate: '2026-01-03T15:00:00.000Z', homeTeamId: 'team_03', awayTeamId: 'team_01', homeScore: 2, awayScore: 3 },
    { id: '20-team_20-team_19', week: 20, matchDate: '2026-01-03T15:00:00.000Z', homeTeamId: 'team_20', awayTeamId: 'team_19', homeScore: 3, awayScore: 0 },
    { id: '20-team_05-team_11', week: 20, matchDate: '2026-01-03T15:00:00.000Z', homeTeamId: 'team_05', awayTeamId: 'team_11', homeScore: 2, awayScore: 0 },
    { id: '20-team_02-team_16', week: 20, matchDate: '2026-01-03T15:00:00.000Z', homeTeamId: 'team_02', awayTeamId: 'team_16', homeScore: 3, awayScore: 1 },
    { id: '20-team_13-team_06', week: 20, matchDate: '2026-01-04T15:00:00.000Z', homeTeamId: 'team_13', awayTeamId: 'team_06', homeScore: 1, awayScore: 1 },
    { id: '20-team_09-team_12', week: 20, matchDate: '2026-01-04T15:00:00.000Z', homeTeamId: 'team_09', awayTeamId: 'team_12', homeScore: 2, awayScore: 2 },
    { id: '20-team_18-team_17', week: 20, matchDate: '2026-01-04T15:00:00.000Z', homeTeamId: 'team_18', awayTeamId: 'team_17', homeScore: 1, awayScore: 1 },
    { id: '20-team_15-team_07', week: 20, matchDate: '2026-01-04T15:00:00.000Z', homeTeamId: 'team_15', awayTeamId: 'team_07', homeScore: 2, awayScore: 0 },
    { id: '20-team_08-team_04', week: 20, matchDate: '2026-01-04T15:00:00.000Z', homeTeamId: 'team_08', awayTeamId: 'team_04', homeScore: 2, awayScore: 4 },
    { id: '20-team_10-team_14', week: 20, matchDate: '2026-01-04T15:00:00.000Z', homeTeamId: 'team_10', awayTeamId: 'team_14', homeScore: 1, awayScore: 1 },
    { id: '21-team_19-team_16', week: 21, matchDate: '2026-01-06T15:00:00.000Z', homeTeamId: 'team_19', awayTeamId: 'team_16', homeScore: 1, awayScore: 2 },
    { id: '21-team_15-team_10', week: 21, matchDate: '2026-01-07T15:00:00.000Z', homeTeamId: 'team_15', awayTeamId: 'team_10', homeScore: 4, awayScore: 3 },
    { id: '21-team_11-team_14', week: 21, matchDate: '2026-01-07T15:00:00.000Z', homeTeamId: 'team_11', awayTeamId: 'team_14', homeScore: 2, awayScore: 2 },
    { id: '21-team_13-team_05', week: 21, matchDate: '2026-01-07T15:00:00.000Z', homeTeamId: 'team_13', awayTeamId: 'team_05', homeScore: 1, awayScore: 1 },
    { id: '21-team_09-team_06', week: 21, matchDate: '2026-01-07T15:00:00.000Z', homeTeamId: 'team_09', awayTeamId: 'team_06', homeScore: 2, awayScore: 1 },
    { id: '21-team_08-team_20', week: 21, matchDate: '2026-01-07T15:00:00.000Z', homeTeamId: 'team_08', awayTeamId: 'team_20', homeScore: 1, awayScore: 1 },
    { id: '21-team_07-team_02', week: 21, matchDate: '2026-01-07T15:00:00.000Z', homeTeamId: 'team_07', awayTeamId: 'team_02', homeScore: 0, awayScore: 0 },
    { id: '21-team_04-team_17', week: 21, matchDate: '2026-01-07T15:00:00.000Z', homeTeamId: 'team_04', awayTeamId: 'team_17', homeScore: 3, awayScore: 0 },
    { id: '21-team_03-team_18', week: 21, matchDate: '2026-01-07T15:00:00.000Z', homeTeamId: 'team_03', awayTeamId: 'team_18', homeScore: 3, awayScore: 2 },
    { id: '21-team_01-team_12', week: 21, matchDate: '2026-01-08T15:00:00.000Z', homeTeamId: 'team_01', awayTeamId: 'team_12', homeScore: -1, awayScore: -1 },
    { id: '22-team_14-team_13', week: 22, matchDate: '2026-01-17T15:00:00.000Z', homeTeamId: 'team_14', awayTeamId: 'team_13', homeScore: -1, awayScore: -1 },
    { id: '22-team_18-team_19', week: 22, matchDate: '2026-01-17T15:00:00.000Z', homeTeamId: 'team_18', awayTeamId: 'team_19', homeScore: -1, awayScore: -1 },
    { id: '22-team_17-team_07', week: 22, matchDate: '2026-01-17T15:00:00.000Z', homeTeamId: 'team_17', awayTeamId: 'team_07', homeScore: -1, awayScore: -1 },
    { id: '22-team_12-team_11', week: 22, matchDate: '2026-01-17T15:00:00.000Z', homeTeamId: 'team_12', awayTeamId: 'team_11', homeScore: -1, awayScore: -1 },
    { id: '22-team_10-team_09', week: 22, matchDate: '2026-01-17T15:00:00.000Z', homeTeamId: 'team_10', awayTeamId: 'team_09', homeScore: -1, awayScore: -1 },
    { id: '22-team_06-team_04', week: 22, matchDate: '2026-01-17T15:00:00.000Z', homeTeamId: 'team_06', awayTeamId: 'team_04', homeScore: -1, awayScore: -1 },
    { id: '22-team_16-team_01', week: 22, matchDate: '2026-01-17T15:00:00.000Z', homeTeamId: 'team_16', awayTeamId: 'team_01', homeScore: -1, awayScore: -1 },
    { id: '22-team_20-team_15', week: 22, matchDate: '2026-01-18T15:00:00.000Z', homeTeamId: 'team_20', awayTeamId: 'team_15', homeScore: -1, awayScore: -1 },
    { id: '22-team_02-team_08', week: 22, matchDate: '2026-01-18T15:00:00.000Z', homeTeamId: 'team_02', awayTeamId: 'team_08', homeScore: -1, awayScore: -1 },
    { id: '22-team_05-team_03', week: 22, matchDate: '2026-01-19T15:00:00.000Z', homeTeamId: 'team_05', awayTeamId: 'team_03', homeScore: -1, awayScore: -1 },
    { id: '23-team_19-team_17', week: 23, matchDate: '2026-01-24T15:00:00.000Z', homeTeamId: 'team_19', awayTeamId: 'team_17', homeScore: -1, awayScore: -1 },
    { id: '23-team_13-team_20', week: 23, matchDate: '2026-01-24T15:00:00.000Z', homeTeamId: 'team_13', awayTeamId: 'team_20', homeScore: -1, awayScore: -1 },
    { id: '23-team_09-team_05', week: 23, matchDate: '2026-01-24T15:00:00.000Z', homeTeamId: 'team_09', awayTeamId: 'team_05', homeScore: -1, awayScore: -1 },
    { id: '23-team_11-team_18', week: 23, matchDate: '2026-01-24T15:00:00.000Z', homeTeamId: 'team_11', awayTeamId: 'team_18', homeScore: -1, awayScore: -1 },
    { id: '23-team_03-team_12', week: 23, matchDate: '2026-01-24T15:00:00.000Z', homeTeamId: 'team_03', awayTeamId: 'team_12', homeScore: -1, awayScore: -1 },
    { id: '23-team_15-team_02', week: 23, matchDate: '2026-01-25T15:00:00.000Z', homeTeamId: 'team_15', awayTeamId: 'team_02', homeScore: -1, awayScore: -1 },
    { id: '23-team_07-team_06', week: 23, matchDate: '2026-01-25T15:00:00.000Z', homeTeamId: 'team_07', awayTeamId: 'team_06', homeScore: -1, awayScore: -1 },
    { id: '23-team_04-team_16', week: 23, matchDate: '2026-01-25T15:00:00.000Z', homeTeamId: 'team_04', awayTeamId: 'team_16', homeScore: -1, awayScore: -1 },
    { id: '23-team_01-team_14', week: 23, matchDate: '2026-01-25T15:00:00.000Z', homeTeamId: 'team_01', awayTeamId: 'team_14', homeScore: -1, awayScore: -1 },
    { id: '23-team_08-team_10', week: 23, matchDate: '2026-01-26T15:00:00.000Z', homeTeamId: 'team_08', awayTeamId: 'team_10', homeScore: -1, awayScore: -1 },
    { id: '24-team_20-team_03', week: 24, matchDate: '2026-01-31T15:00:00.000Z', homeTeamId: 'team_20', awayTeamId: 'team_03', homeScore: -1, awayScore: -1 },
    { id: '24-team_10-team_01', week: 24, matchDate: '2026-01-31T15:00:00.000Z', homeTeamId: 'team_10', awayTeamId: 'team_01', homeScore: -1, awayScore: -1 },
    { id: '24-team_05-team_08', week: 24, matchDate: '2026-01-31T15:00:00.000Z', homeTeamId: 'team_05', awayTeamId: 'team_08', homeScore: -1, awayScore: -1 },
    { id: '24-team_06-team_19', week: 24, matchDate: '2026-01-31T15:00:00.000Z', homeTeamId: 'team_06', awayTeamId: 'team_19', homeScore: -1, awayScore: -1 },
    { id: '24-team_12-team_15', week: 24, matchDate: '2026-01-31T15:00:00.000Z', homeTeamId: 'team_12', awayTeamId: 'team_15', homeScore: -1, awayScore: -1 },
    { id: '24-team_16-team_07', week: 24, matchDate: '2026-02-01T15:00:00.000Z', homeTeamId: 'team_16', awayTeamId: 'team_07', homeScore: -1, awayScore: -1 },
    { id: '24-team_14-team_09', week: 24, matchDate: '2026-02-01T15:00:00.000Z', homeTeamId: 'team_14', awayTeamId: 'team_09', homeScore: -1, awayScore: -1 },
    { id: '24-team_02-team_04', week: 24, matchDate: '2026-02-01T15:00:00.000Z', homeTeamId: 'team_02', awayTeamId: 'team_04', homeScore: -1, awayScore: -1 },
    { id: '24-team_18-team_13', week: 24, matchDate: '2026-02-01T15:00:00.000Z', homeTeamId: 'team_18', awayTeamId: 'team_13', homeScore: -1, awayScore: -1 },
    { id: '24-team_17-team_11', week: 24, matchDate: '2026-02-02T15:00:00.000Z', homeTeamId: 'team_17', awayTeamId: 'team_11', homeScore: -1, awayScore: -1 },
    { id: '25-team_10-team_16', week: 25, matchDate: '2026-02-06T15:00:00.000Z', homeTeamId: 'team_10', awayTeamId: 'team_16', homeScore: -1, awayScore: -1 },
    { id: '25-team_14-team_18', week: 25, matchDate: '2026-02-07T15:00:00.000Z', homeTeamId: 'team_14', awayTeamId: 'team_18', homeScore: -1, awayScore: -1 },
    { id: '25-team_20-team_06', week: 25, matchDate: '2026-02-07T15:00:00.000Z', homeTeamId: 'team_20', awayTeamId: 'team_06', homeScore: -1, awayScore: -1 },
    { id: '25-team_09-team_08', week: 25, matchDate: '2026-02-07T15:00:00.000Z', homeTeamId: 'team_09', awayTeamId: 'team_08', homeScore: -1, awayScore: -1 },
    { id: '25-team_11-team_19', week: 25, matchDate: '2026-02-07T15:00:00.000Z', homeTeamId: 'team_11', awayTeamId: 'team_19', homeScore: -1, awayScore: -1 },
    { id: '25-team_01-team_17', week: 25, matchDate: '2026-02-07T15:00:00.000Z', homeTeamId: 'team_01', awayTeamId: 'team_17', homeScore: -1, awayScore: -1 },
    { id: '25-team_03-team_02', week: 25, matchDate: '2026-02-07T15:00:00.000Z', homeTeamId: 'team_03', awayTeamId: 'team_02', homeScore: -1, awayScore: -1 },
    { id: '25-team_15-team_04', week: 25, matchDate: '2026-02-07T15:00:00.000Z', homeTeamId: 'team_15', awayTeamId: 'team_04', homeScore: -1, awayScore: -1 },
    { id: '25-team_05-team_07', week: 25, matchDate: '2026-02-08T15:00:00.000Z', homeTeamId: 'team_05', awayTeamId: 'team_07', homeScore: -1, awayScore: -1 },
    { id: '25-team_12-team_13', week: 25, matchDate: '2026-02-08T15:00:00.000Z', homeTeamId: 'team_12', awayTeamId: 'team_13', homeScore: -1, awayScore: -1 },
    { id: '26-team_18-team_15', week: 26, matchDate: '2026-02-10T15:00:00.000Z', homeTeamId: 'team_18', awayTeamId: 'team_15', homeScore: -1, awayScore: -1 },
    { id: '26-team_08-team_03', week: 26, matchDate: '2026-02-10T15:00:00.000Z', homeTeamId: 'team_08', awayTeamId: 'team_03', homeScore: -1, awayScore: -1 },
    { id: '26-team_06-team_10', week: 26, matchDate: '2026-02-10T15:00:00.000Z', homeTeamId: 'team_06', awayTeamId: 'team_10', homeScore: -1, awayScore: -1 },
    { id: '26-team_19-team_14', week: 26, matchDate: '2026-02-10T15:00:00.000Z', homeTeamId: 'team_19', awayTeamId: 'team_14', homeScore: -1, awayScore: -1 },
    { id: '26-team_16-team_20', week: 26, matchDate: '2026-02-11T15:00:00.000Z', homeTeamId: 'team_16', awayTeamId: 'team_20', homeScore: -1, awayScore: -1 },
    { id: '26-team_13-team_09', week: 26, matchDate: '2026-02-11T15:00:00.000Z', homeTeamId: 'team_13', awayTeamId: 'team_09', homeScore: -1, awayScore: -1 },
    { id: '26-team_07-team_11', week: 26, matchDate: '2026-02-11T15:00:00.000Z', homeTeamId: 'team_07', awayTeamId: 'team_11', homeScore: -1, awayScore: -1 },
    { id: '26-team_02-team_05', week: 26, matchDate: '2026-02-11T15:00:00.000Z', homeTeamId: 'team_02', awayTeamId: 'team_05', homeScore: -1, awayScore: -1 },
    { id: '26-team_17-team_12', week: 26, matchDate: '2026-02-11T15:00:00.000Z', homeTeamId: 'team_17', awayTeamId: 'team_12', homeScore: -1, awayScore: -1 },
    { id: '26-team_04-team_01', week: 26, matchDate: '2026-02-12T15:00:00.000Z', homeTeamId: 'team_04', awayTeamId: 'team_01', homeScore: -1, awayScore: -1 },
    { id: '27-team_13-team_15', week: 27, matchDate: '2026-02-21T15:00:00.000Z', homeTeamId: 'team_13', awayTeamId: 'team_15', homeScore: -1, awayScore: -1 },
    { id: '27-team_16-team_12', week: 27, matchDate: '2026-02-21T15:00:00.000Z', homeTeamId: 'team_16', awayTeamId: 'team_12', homeScore: -1, awayScore: -1 },
    { id: '27-team_07-team_20', week: 27, matchDate: '2026-02-21T15:00:00.000Z', homeTeamId: 'team_07', awayTeamId: 'team_20', homeScore: -1, awayScore: -1 },
    { id: '27-team_06-team_11', week: 27, matchDate: '2026-02-21T15:00:00.000Z', homeTeamId: 'team_06', awayTeamId: 'team_11', homeScore: -1, awayScore: -1 },
    { id: '27-team_04-team_05', week: 27, matchDate: '2026-02-21T15:00:00.000Z', homeTeamId: 'team_04', awayTeamId: 'team_05', homeScore: -1, awayScore: -1 },
    { id: '27-team_02-team_10', week: 27, matchDate: '2026-02-21T15:00:00.000Z', homeTeamId: 'team_02', awayTeamId: 'team_10', homeScore: -1, awayScore: -1 },
    { id: '27-team_19-team_03', week: 27, matchDate: '2026-02-21T15:00:00.000Z', homeTeamId: 'team_19', awayTeamId: 'team_03', homeScore: -1, awayScore: -1 },
    { id: '27-team_17-team_09', week: 27, matchDate: '2026-02-22T15:00:00.000Z', homeTeamId: 'team_17', awayTeamId: 'team_09', homeScore: -1, awayScore: -1 },
    { id: '27-team_18-team_01', week: 27, matchDate: '2026-02-22T15:00:00.000Z', homeTeamId: 'team_18', awayTeamId: 'team_01', homeScore: -1, awayScore: -1 },
    { id: '27-team_08-team_14', week: 27, matchDate: '2026-02-23T15:00:00.000Z', homeTeamId: 'team_08', awayTeamId: 'team_14', homeScore: -1, awayScore: -1 },
    { id: '28-team_20-team_02', week: 28, matchDate: '2026-02-27T15:00:00.000Z', homeTeamId: 'team_20', awayTeamId: 'team_02', homeScore: -1, awayScore: -1 },
    { id: '28-team_03-team_17', week: 28, matchDate: '2026-02-28T15:00:00.000Z', homeTeamId: 'team_03', awayTeamId: 'team_17', homeScore: -1, awayScore: -1 },
    { id: '28-team_15-team_08', week: 28, matchDate: '2026-02-28T15:00:00.000Z', homeTeamId: 'team_15', awayTeamId: 'team_08', homeScore: -1, awayScore: -1 },
    { id: '28-team_14-team_07', week: 28, matchDate: '2026-02-28T15:00:00.000Z', homeTeamId: 'team_14', awayTeamId: 'team_07', homeScore: -1, awayScore: -1 },
    { id: '28-team_12-team_19', week: 28, matchDate: '2026-02-28T15:00:00.000Z', homeTeamId: 'team_12', awayTeamId: 'team_19', homeScore: -1, awayScore: -1 },
    { id: '28-team_11-team_04', week: 28, matchDate: '2026-02-28T15:00:00.000Z', homeTeamId: 'team_11', awayTeamId: 'team_04', homeScore: -1, awayScore: -1 },
    { id: '28-team_05-team_16', week: 28, matchDate: '2026-02-28T15:00:00.000Z', homeTeamId: 'team_05', awayTeamId: 'team_16', homeScore: -1, awayScore: -1 },
    { id: '28-team_10-team_13', week: 28, matchDate: '2026-02-28T15:00:00.000Z', homeTeamId: 'team_10', awayTeamId: 'team_13', homeScore: -1, awayScore: -1 },
    { id: '28-team_09-team_18', week: 28, matchDate: '2026-03-01T15:00:00.000Z', homeTeamId: 'team_09', awayTeamId: 'team_18', homeScore: -1, awayScore: -1 },
    { id: '28-team_01-team_06', week: 28, matchDate: '2026-03-01T15:00:00.000Z', homeTeamId: 'team_01', awayTeamId: 'team_06', homeScore: -1, awayScore: -1 },
    { id: '29-team_20-team_12', week: 29, matchDate: '2026-03-04T15:00:00.000Z', homeTeamId: 'team_20', awayTeamId: 'team_12', homeScore: -1, awayScore: -1 },
    { id: '29-team_18-team_07', week: 29, matchDate: '2026-03-04T15:00:00.000Z', homeTeamId: 'team_18', awayTeamId: 'team_07', homeScore: -1, awayScore: -1 },
    { id: '29-team_15-team_14', week: 29, matchDate: '2026-03-04T15:00:00.000Z', homeTeamId: 'team_15', awayTeamId: 'team_14', homeScore: -1, awayScore: -1 },
    { id: '29-team_13-team_16', week: 29, matchDate: '2026-03-04T15:00:00.000Z', homeTeamId: 'team_13', awayTeamId: 'team_16', homeScore: -1, awayScore: -1 },
    { id: '29-team_10-team_17', week: 29, matchDate: '2026-03-04T15:00:00.000Z', homeTeamId: 'team_10', awayTeamId: 'team_17', homeScore: -1, awayScore: -1 },
    { id: '29-team_09-team_19', week: 29, matchDate: '2026-03-04T15:00:00.000Z', homeTeamId: 'team_09', awayTeamId: 'team_19', homeScore: -1, awayScore: -1 },
    { id: '29-team_08-team_11', week: 29, matchDate: '2026-03-04T15:00:00.000Z', homeTeamId: 'team_08', awayTeamId: 'team_11', homeScore: -1, awayScore: -1 },
    { id: '29-team_05-team_01', week: 29, matchDate: '2026-03-04T15:00:00.000Z', homeTeamId: 'team_05', awayTeamId: 'team_01', homeScore: -1, awayScore: -1 },
    { id: '29-team_02-team_06', week: 29, matchDate: '2026-03-04T15:00:00.000Z', homeTeamId: 'team_02', awayTeamId: 'team_06', homeScore: -1, awayScore: -1 },
    { id: '29-team_03-team_04', week: 29, matchDate: '2026-03-04T15:00:00.000Z', homeTeamId: 'team_03', awayTeamId: 'team_04', homeScore: -1, awayScore: -1 },
    { id: '30-team_19-team_13', week: 30, matchDate: '2026-03-14T15:00:00.000Z', homeTeamId: 'team_19', awayTeamId: 'team_13', homeScore: -1, awayScore: -1 },
    { id: '30-team_17-team_05', week: 30, matchDate: '2026-03-14T15:00:00.000Z', homeTeamId: 'team_17', awayTeamId: 'team_05', homeScore: -1, awayScore: -1 },
    { id: '30-team_16-team_09', week: 30, matchDate: '2026-03-14T15:00:00.000Z', homeTeamId: 'team_16', awayTeamId: 'team_09', homeScore: -1, awayScore: -1 },
    { id: '30-team_14-team_02', week: 30, matchDate: '2026-03-14T15:00:00.000Z', homeTeamId: 'team_14', awayTeamId: 'team_02', homeScore: -1, awayScore: -1 },
    { id: '30-team_12-team_18', week: 30, matchDate: '2026-03-14T15:00:00.000Z', homeTeamId: 'team_12', awayTeamId: 'team_18', homeScore: -1, awayScore: -1 },
    { id: '30-team_07-team_10', week: 30, matchDate: '2026-03-14T15:00:00.000Z', homeTeamId: 'team_07', awayTeamId: 'team_10', homeScore: -1, awayScore: -1 },
    { id: '30-team_06-team_15', week: 30, matchDate: '2026-03-14T15:00:00.000Z', homeTeamId: 'team_06', awayTeamId: 'team_15', homeScore: -1, awayScore: -1 },
    { id: '30-team_11-team_03', week: 30, matchDate: '2026-03-14T15:00:00.000Z', homeTeamId: 'team_11', awayTeamId: 'team_03', homeScore: -1, awayScore: -1 },
    { id: '30-team_04-team_20', week: 30, matchDate: '2026-03-14T15:00:00.000Z', homeTeamId: 'team_04', awayTeamId: 'team_20', homeScore: -1, awayScore: -1 },
    { id: '30-team_01-team_08', week: 30, matchDate: '2026-03-14T15:00:00.000Z', homeTeamId: 'team_01', awayTeamId: 'team_08', homeScore: -1, awayScore: -1 },
    { id: '31-team_20-team_01', week: 31, matchDate: '2026-03-21T15:00:00.000Z', homeTeamId: 'team_20', awayTeamId: 'team_01', homeScore: -1, awayScore: -1 },
    { id: '31-team_18-team_16', week: 31, matchDate: '2026-03-21T15:00:00.000Z', homeTeamId: 'team_18', awayTeamId: 'team_16', homeScore: -1, awayScore: -1 },
    { id: '31-team_15-team_17', week: 31, matchDate: '2026-03-21T15:00:00.000Z', homeTeamId: 'team_15', awayTeamId: 'team_17', homeScore: -1, awayScore: -1 },
    { id: '31-team_13-team_07', week: 31, matchDate: '2026-03-21T15:00:00.000Z', homeTeamId: 'team_13', awayTeamId: 'team_07', homeScore: -1, awayScore: -1 },
    { id: '31-team_10-team_04', week: 31, matchDate: '2026-03-21T15:00:00.000Z', homeTeamId: 'team_10', awayTeamId: 'team_04', homeScore: -1, awayScore: -1 },
    { id: '31-team_09-team_11', week: 31, matchDate: '2026-03-21T15:00:00.000Z', homeTeamId: 'team_09', awayTeamId: 'team_11', homeScore: -1, awayScore: -1 },
    { id: '31-team_08-team_06', week: 31, matchDate: '2026-03-21T15:00:00.000Z', homeTeamId: 'team_08', awayTeamId: 'team_06', homeScore: -1, awayScore: -1 },
    { id: '31-team_05-team_12', week: 31, matchDate: '2026-03-21T15:00:00.000Z', homeTeamId: 'team_05', awayTeamId: 'team_12', homeScore: -1, awayScore: -1 },
    { id: '31-team_02-team_19', week: 31, matchDate: '2026-03-21T15:00:00.000Z', homeTeamId: 'team_02', awayTeamId: 'team_19', homeScore: -1, awayScore: -1 },
    { id: '31-team_03-team_14', week: 31, matchDate: '2026-03-21T15:00:00.000Z', homeTeamId: 'team_03', awayTeamId: 'team_14', homeScore: -1, awayScore: -1 },
    { id: '32-team_19-team_20', week: 32, matchDate: '2026-04-11T15:00:00.000Z', homeTeamId: 'team_19', awayTeamId: 'team_20', homeScore: -1, awayScore: -1 },
    { id: '32-team_17-team_18', week: 32, matchDate: '2026-04-11T15:00:00.000Z', homeTeamId: 'team_17', awayTeamId: 'team_18', homeScore: -1, awayScore: -1 },
    { id: '32-team_16-team_02', week: 32, matchDate: '2026-04-11T15:00:00.000Z', homeTeamId: 'team_16', awayTeamId: 'team_02', homeScore: -1, awayScore: -1 },
    { id: '32-team_14-team_10', week: 32, matchDate: '2026-04-11T15:00:00.000Z', homeTeamId: 'team_14', awayTeamId: 'team_10', homeScore: -1, awayScore: -1 },
    { id: '32-team_12-team_09', week: 32, matchDate: '2026-04-11T15:00:00.000Z', homeTeamId: 'team_12', awayTeamId: 'team_09', homeScore: -1, awayScore: -1 },
    { id: '32-team_07-team_15', week: 32, matchDate: '2026-04-11T15:00:00.000Z', homeTeamId: 'team_07', awayTeamId: 'team_15', homeScore: -1, awayScore: -1 },
    { id: '32-team_06-team_13', week: 32, matchDate: '2026-04-11T15:00:00.000Z', homeTeamId: 'team_06', awayTeamId: 'team_13', homeScore: -1, awayScore: -1 },
    { id: '32-team_11-team_05', week: 32, matchDate: '2026-04-11T15:00:00.000Z', homeTeamId: 'team_11', awayTeamId: 'team_05', homeScore: -1, awayScore: -1 },
    { id: '32-team_04-team_08', week: 32, matchDate: '2026-04-11T15:00:00.000Z', homeTeamId: 'team_04', awayTeamId: 'team_08', homeScore: -1, awayScore: -1 },
    { id: '32-team_01-team_03', week: 32, matchDate: '2026-04-11T15:00:00.000Z', homeTeamId: 'team_01', awayTeamId: 'team_03', homeScore: -1, awayScore: -1 },
    { id: '33-team_18-team_05', week: 33, matchDate: '2026-04-18T15:00:00.000Z', homeTeamId: 'team_18', awayTeamId: 'team_05', homeScore: -1, awayScore: -1 },
    { id: '33-team_16-team_11', week: 33, matchDate: '2026-04-18T15:00:00.000Z', homeTeamId: 'team_16', awayTeamId: 'team_11', homeScore: -1, awayScore: -1 },
    { id: '33-team_15-team_03', week: 33, matchDate: '2026-04-18T15:00:00.000Z', homeTeamId: 'team_15', awayTeamId: 'team_03', homeScore: -1, awayScore: -1 },
    { id: '33-team_13-team_01', week: 33, matchDate: '2026-04-18T15:00:00.000Z', homeTeamId: 'team_13', awayTeamId: 'team_01', homeScore: -1, awayScore: -1 },
    { id: '33-team_10-team_20', week: 33, matchDate: '2026-04-18T15:00:00.000Z', homeTeamId: 'team_10', awayTeamId: 'team_20', homeScore: -1, awayScore: -1 },
    { id: '33-team_08-team_12', week: 33, matchDate: '2026-04-18T15:00:00.000Z', homeTeamId: 'team_08', awayTeamId: 'team_12', homeScore: -1, awayScore: -1 },
    { id: '33-team_19-team_07', week: 33, matchDate: '2026-04-18T15:00:00.000Z', homeTeamId: 'team_19', awayTeamId: 'team_07', homeScore: -1, awayScore: -1 },
    { id: '33-team_14-team_06', week: 33, matchDate: '2026-04-18T15:00:00.000Z', homeTeamId: 'team_14', awayTeamId: 'team_06', homeScore: -1, awayScore: -1 },
    { id: '33-team_09-team_04', week: 33, matchDate: '2026-04-18T15:00:00.000Z', homeTeamId: 'team_09', awayTeamId: 'team_04', homeScore: -1, awayScore: -1 },
    { id: '33-team_17-team_02', week: 33, matchDate: '2026-04-18T15:00:00.000Z', homeTeamId: 'team_17', awayTeamId: 'team_02', homeScore: -1, awayScore: -1 },
    { id: '34-team_15-team_05', week: 34, matchDate: '2026-04-25T15:00:00.000Z', homeTeamId: 'team_15', awayTeamId: 'team_05', homeScore: -1, awayScore: -1 },
    { id: '34-team_08-team_14', week: 34, matchDate: '2026-04-25T15:00:00.000Z', homeTeamId: 'team_08', awayTeamId: 'team_14', homeScore: -1, awayScore: -1 },
    { id: '34-team_13-team_12', week: 34, matchDate: '2026-04-25T15:00:00.000Z', homeTeamId: 'team_13', awayTeamId: 'team_12', homeScore: -1, awayScore: -1 },
    { id: '34-team_07-team_01', week: 34, matchDate: '2026-04-25T15:00:00.000Z', homeTeamId: 'team_07', awayTeamId: 'team_01', homeScore: -1, awayScore: -1 },
    { id: '34-team_06-team_11', week: 34, matchDate: '2026-04-25T15:00:00.000Z', homeTeamId: 'team_06', awayTeamId: 'team_11', homeScore: -1, awayScore: -1 },
    { id: '34-team_04-team_16', week: 34, matchDate: '2026-04-25T15:00:00.000Z', homeTeamId: 'team_04', awayTeamId: 'team_16', homeScore: -1, awayScore: -1 },
    { id: '34-team_03-team_10', week: 34, matchDate: '2026-04-25T15:00:00.000Z', homeTeamId: 'team_03', awayTeamId: 'team_10', homeScore: -1, awayScore: -1 },
    { id: '34-team_02-team_18', week: 34, matchDate: '2026-04-25T15:00:00.000Z', homeTeamId: 'team_02', awayTeamId: 'team_18', homeScore: -1, awayScore: -1 },
    { id: '34-team_09-team_20', week: 34, matchDate: '2026-04-25T15:00:00.000Z', homeTeamId: 'team_09', awayTeamId: 'team_20', homeScore: -1, awayScore: -1 },
    { id: '34-team_17-team_19', week: 34, matchDate: '2026-04-25T15:00:00.000Z', homeTeamId: 'team_17', awayTeamId: 'team_19', homeScore: -1, awayScore: -1 },
    { id: '35-team_19-team_08', week: 35, matchDate: '2026-05-02T15:00:00.000Z', homeTeamId: 'team_19', awayTeamId: 'team_08', homeScore: -1, awayScore: -1 },
    { id: '35-team_18-team_04', week: 35, matchDate: '2026-05-02T15:00:00.000Z', homeTeamId: 'team_18', awayTeamId: 'team_04', homeScore: -1, awayScore: -1 },
    { id: '35-team_14-team_17', week: 35, matchDate: '2026-05-02T15:00:00.000Z', homeTeamId: 'team_14', awayTeamId: 'team_17', homeScore: -1, awayScore: -1 },
    { id: '35-team_12-team_06', week: 35, matchDate: '2026-05-02T15:00:00.000Z', homeTeamId: 'team_12', awayTeamId: 'team_06', homeScore: -1, awayScore: -1 },
    { id: '35-team_11-team_13', week: 35, matchDate: '2026-05-02T15:00:00.000Z', homeTeamId: 'team_11', awayTeamId: 'team_13', homeScore: -1, awayScore: -1 },
    { id: '35-team_10-team_03', week: 35, matchDate: '2026-05-02T15:00:00.000Z', homeTeamId: 'team_10', awayTeamId: 'team_03', homeScore: -1, awayScore: -1 },
    { id: '35-team_09-team_02', week: 35, matchDate: '2026-05-02T15:00:00.000Z', homeTeamId: 'team_09', awayTeamId: 'team_02', homeScore: -1, awayScore: -1 },
    { id: '35-team_07-team_19', week: 35, matchDate: '2026-05-02T15:00:00.000Z', homeTeamId: 'team_07', awayTeamId: 'team_19', homeScore: -1, awayScore: -1 },
    { id: '35-team_05-team_15', week: 35, matchDate: '2026-05-02T15:00:00.000Z', homeTeamId: 'team_05', awayTeamId: 'team_15', homeScore: -1, awayScore: -1 },
    { id: '35-team_01-team_18', week: 35, matchDate: '2026-05-02T15:00:00.000Z', homeTeamId: 'team_01', awayTeamId: 'team_18', homeScore: -1, awayScore: -1 },
    { id: '36-team_19-team_10', week: 36, matchDate: '2026-05-09T15:00:00.000Z', homeTeamId: 'team_19', awayTeamId: 'team_10', homeScore: -1, awayScore: -1 },
    { id: '36-team_18-team_12', week: 36, matchDate: '2026-05-09T15:00:00.000Z', homeTeamId: 'team_18', awayTeamId: 'team_12', homeScore: -1, awayScore: -1 },
    { id: '36-team_17-team_09', week: 36, matchDate: '2026-05-09T15:00:00.000Z', homeTeamId: 'team_17', awayTeamId: 'team_09', homeScore: -1, awayScore: -1 },
    { id: '36-team_15-team_16', week: 36, matchDate: '2026-05-09T15:00:00.000Z', homeTeamId: 'team_15', awayTeamId: 'team_16', homeScore: -1, awayScore: -1 },
    { id: '36-team_13-team_05', week: 36, matchDate: '2026-05-09T15:00:00.000Z', homeTeamId: 'team_13', awayTeamId: 'team_05', homeScore: -1, awayScore: -1 },
    { id: '36-team_08-team_17', week: 36, matchDate: '2026-05-09T15:00:00.000Z', homeTeamId: 'team_08', awayTeamId: 'team_17', homeScore: -1, awayScore: -1 },
    { id: '36-team_07-team_04', week: 36, matchDate: '2026-05-09T15:00:00.000Z', homeTeamId: 'team_07', awayTeamId: 'team_04', homeScore: -1, awayScore: -1 },
    { id: '36-team_06-team_18', week: 36, matchDate: '2026-05-09T15:00:00.000Z', homeTeamId: 'team_06', awayTeamId: 'team_18', homeScore: -1, awayScore: -1 },
    { id: '36-team_03-team_14', week: 36, matchDate: '2026-05-09T15:00:00.000Z', homeTeamId: 'team_03', awayTeamId: 'team_14', homeScore: -1, awayScore: -1 },
    { id: '36-team_02-team_11', week: 36, matchDate: '2026-05-09T15:00:00.000Z', homeTeamId: 'team_02', awayTeamId: 'team_11', homeScore: -1, awayScore: -1 },
    { id: '37-team_19-team_01', week: 37, matchDate: '2026-05-17T15:00:00.000Z', homeTeamId: 'team_19', awayTeamId: 'team_01', homeScore: -1, awayScore: -1 },
    { id: '37-team_18-team_10', week: 37, matchDate: '2026-05-17T15:00:00.000Z', homeTeamId: 'team_18', awayTeamId: 'team_10', homeScore: -1, awayScore: -1 },
    { id: '37-team_17-team_06', week: 37, matchDate: '2026-05-17T15:00:00.000Z', homeTeamId: 'team_17', awayTeamId: 'team_06', homeScore: -1, awayScore: -1 },
    { id: '37-team_16-team_15', week: 37, matchDate: '2026-05-17T15:00:00.000Z', homeTeamId: 'team_16', awayTeamId: 'team_15', homeScore: -1, awayScore: -1 },
    { id: '37-team_14-team_12', week: 37, matchDate: '2026-05-17T15:00:00.000Z', homeTeamId: 'team_14', awayTeamId: 'team_12', homeScore: -1, awayScore: -1 },
    { id: '37-team_11-team_03', week: 37, matchDate: '2026-05-17T15:00:00.000Z', homeTeamId: 'team_11', awayTeamId: 'team_03', homeScore: -1, awayScore: -1 },
    { id: '37-team_09-team_07', week: 37, matchDate: '2026-05-17T15:00:00.000Z', homeTeamId: 'team_09', awayTeamId: 'team_07', homeScore: -1, awayScore: -1 },
    { id: '37-team_08-team_13', week: 37, matchDate: '2026-05-17T15:00:00.000Z', homeTeamId: 'team_08', awayTeamId: 'team_13', homeScore: -1, awayScore: -1 },
    { id: '37-team_05-team_20', week: 37, matchDate: '2026-05-17T15:00:00.000Z', homeTeamId: 'team_05', awayTeamId: 'team_20', homeScore: -1, awayScore: -1 },
    { id: '37-team_04-team_02', week: 37, matchDate: '2026-05-17T15:00:00.000Z', homeTeamId: 'team_04', awayTeamId: 'team_02', homeScore: -1, awayScore: -1 },
    { id: '38-team_20-team_17', week: 38, matchDate: '2026-05-24T15:00:00.000Z', homeTeamId: 'team_20', awayTeamId: 'team_17', homeScore: -1, awayScore: -1 },
    { id: '38-team_15-team_19', week: 38, matchDate: '2026-05-24T15:00:00.000Z', homeTeamId: 'team_15', awayTeamId: 'team_19', homeScore: -1, awayScore: -1 },
    { id: '38-team_13-team_08', week: 38, matchDate: '2026-05-24T15:00:00.000Z', homeTeamId: 'team_13', awayTeamId: 'team_08', homeScore: -1, awayScore: -1 },
    { id: '38-team_12-team_06', week: 38, matchDate: '2026-05-24T15:00:00.000Z', homeTeamId: 'team_12', awayTeamId: 'team_06', homeScore: -1, awayScore: -1 },
    { id: '38-team_10-team_18', week: 38, matchDate: '2026-05-24T15:00:00.000Z', homeTeamId: 'team_10', awayTeamId: 'team_18', homeScore: -1, awayScore: -1 },
    { id: '38-team_09-team_14', week: 38, matchDate: '2026-05-24T15:00:00.000Z', homeTeamId: 'team_09', awayTeamId: 'team_14', homeScore: -1, awayScore: -1 },
    { id: '38-team_07-team_04', week: 38, matchDate: '2026-05-24T15:00:00.000Z', homeTeamId: 'team_07', awayTeamId: 'team_04', homeScore: -1, awayScore: -1 },
    { id: '38-team_05-team_11', week: 38, matchDate: '2026-05-24T15:00:00.000Z', homeTeamId: 'team_05', awayTeamId: 'team_11', homeScore: -1, awayScore: -1 },
    { id: '38-team_03-team_07', week: 38, matchDate: '2026-05-24T15:00:00.000Z', homeTeamId: 'team_03', awayTeamId: 'team_07', homeScore: -1, awayScore: -1 },
    { id: '38-team_02-team_13', week: 38, matchDate: '2026-05-24T15:00:00.000Z', homeTeamId: 'team_02', awayTeamId: 'team_13', homeScore: -1, awayScore: -1 },
    { id: '38-team_01-team_16', week: 38, matchDate: '2026-05-24T15:00:00.000Z', homeTeamId: 'team_01', awayTeamId: 'team_16', homeScore: -1, awayScore: -1 }
];

const playedMatches = matches.filter(m => m.homeScore !== -1);

// Calculate weekly standings
export const weeklyTeamStandings: WeeklyTeamStanding[] = (() => {
  const allWeeklyStandings: WeeklyTeamStanding[] = [];
  const teamScores: { [teamId: string]: { week: number; rank: number }[] } = {};

  teams.forEach(team => {
    teamScores[team.id] = [];
  });

  const maxWeek = Math.max(...matches.map(m => m.week), 0);

  for (let week = 1; week <= maxWeek; week++) {
    const weeklyMatches = playedMatches.filter(m => m.week <= week);
    const standings: { [teamId: string]: { points: number, goalDifference: number, goalsFor: number } } = {};

    teams.forEach(team => {
      standings[team.id] = { points: 0, goalDifference: 0, goalsFor: 0 };
    });

    weeklyMatches.forEach(match => {
      if (!standings[match.homeTeamId] || !standings[match.awayTeamId]) return;
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
      const teamA = teams.find(t => t.id === a);
      const teamB = teams.find(t => t.id === b);
      if (!teamA || !teamB) return 0;
      return teamA.name.localeCompare(teamB.name);
    });

    sortedTeamIds.forEach((teamId, index) => {
        allWeeklyStandings.push({ week, teamId, rank: index + 1 });
    });
  }

  return allWeeklyStandings;
})();

export const standings: CurrentStanding[] = (() => {
    if (playedMatches.length === 0) {
        return teams.slice(0, 20).map(team => ({
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

    teams.slice(0, 20).forEach(team => {
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

        if (!homeStats || !awayStats) return;

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
            const teamA = teams.find(t => t.id === a.teamId);
            const teamB = teams.find(t => t.id === b.teamId);
            if (!teamA || !teamB) return 0;
            return teamA.name.localeCompare(teamB.name);
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
    const maxWeek = Math.max(...matches.map(m => m.week), 0);

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
const maxWeek = Math.max(...matches.map(m => m.week), 0);
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

    
    

    


