
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
    { id: 'team_12', name: 'Liverpool', logo: 'origami', bgColourFaint: 'rgba(200, 16, 46, 0.3)', bgColourSolid: '#C8102E', textColour: '#000000', iconColour: '#FFFFFF' },
    { id: 'team_13', name: 'Man City', logo: 'sailboat', bgColourFaint: 'rgba(108, 171, 221, 0.3)', bgColourSolid: '#6CABDD', textColour: '#00285E', iconColour: '#00285E' },
    { id: 'team_14', name: 'Man Utd', logo: 'sparkles', bgColourFaint: 'rgba(218, 41, 28, 0.3)', bgColourSolid: '#DA291C', textColour: '#FBE122', iconColour: '#FBE122' },
    { id: 'team_15', name: 'Newcastle', logo: 'shieldUser', bgColourFaint: 'rgba(45, 41, 38, 0.3)', bgColourSolid: '#2D2926', textColour: '#FFFFFF', iconColour: '#FFFFFF' },
    { id: 'team_16', name: 'Notts Forest', logo: 'treeDeciduous', bgColourFaint: 'rgba(221, 0, 0, 0.3)', bgColourSolid: '#DD0000', textColour: '#FFFFFF', iconColour: '#FFFFFF' },
    { id: 'team_18', name: 'Tottenham', logo: 'home', bgColourFaint: 'rgba(19, 34, 83, 0.3)', bgColourSolid: '#132257', textColour: '#FFFFFF', iconColour: '#FFFFFF' },
    { id: 'team_19', name: 'West Ham', logo: 'hammer', bgColourFaint: 'rgba(122, 38, 58, 0.3)', bgColourSolid: '#7A263A', textColour: '#FBE122', iconColour: '#FBE122' },
    { id: 'team_20', name: 'Wolves', logo: 'flower', bgColourFaint: 'rgba(253, 190, 17, 0.3)', bgColourSolid: '#FDBE11', textColour: '#000000', iconColour: '#000000' },
    { id: 'team_21', name: 'Burnley', logo: 'shield', bgColourFaint: 'rgba(108, 28, 52, 0.3)', bgColourSolid: '#6C1C34', textColour: '#99D6EA', iconColour: '#99D6EA' },
    { id: 'team_22', name: 'Sunderland', logo: 'shield', bgColourFaint: 'rgba(235, 23, 23, 0.3)', bgColourSolid: '#EB1717', textColour: '#FFFFFF', iconColour: '#FFFFFF' },
    { id: 'team_23', name: 'Leeds', logo: 'flower', bgColourFaint: 'rgba(255, 255, 255, 0.3)', bgColourSolid: '#FFCD00', textColour: '#1C3C8B', iconColour: '#1C3C8B' }
];

const teamNameMapping: { [key: string]: string } = {
    'Arsenal': 'team_1', 'Aston Villa': 'team_2', 'Bournemouth': 'team_3', 'Brentford': 'team_4',
    'Brighton': 'team_5', 'Chelsea': 'team_6', 'Crystal Palace': 'team_7', 'Everton': 'team_8',
    'Fulham': 'team_9', 'Ipswich Town': 'team_10', 'Leicester City': 'team_11',
    'Liverpool': 'team_12', 'Man City': 'team_13', 'Man Utd': 'team_14', 'Newcastle': 'team_15',
    'Notts Forest': 'team_16', 'Southampton': 'team_17', 'Tottenham': 'team_18', 'Spurs': 'team_18',
    'West Ham': 'team_19', 'Wolves': 'team_20', 'Ipswich': 'team_10', 'Leicester': 'team_11',
    'Burnley': 'team_21', 'Sunderland': 'team_22', 'Leeds': 'team_23'
};


const userList = [
    { id: 'usr_1', name: 'Thomas Wright' }, { id: 'usr_2', name: 'Barrie Cross' },
    { id: 'usr_3', name: 'Dave Nightingale' }, { id: 'usr_4', name: 'Pip Stokes' },
    { id: 'usr_5', name: 'Alex Anderson' }, { id: 'usr_6', name: 'Nat Walsh' },
    { id: 'usr_7', name: 'Patrick Meese' }, { id: 'usr_8', name: 'Lee Harte' },
    { id: 'usr_9', name: 'Jim Poole' }, { id: 'usr_10', name: 'Lyndon Padmore' }
].map(u => ({ ...u, name: u.name.toUpperCase() }));

const proUsers: string[] = [];

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
    { teamId: 'team_21', rank: 18, points: 0, goalDifference: 0 }, // Burnley
    { teamId: 'team_22', rank: 19, points: 0, goalDifference: 0 }, // Sunderland
    { teamId: 'team_23', rank: 20, points: 0, goalDifference: 0 }  // Leeds
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
};


const userPredictionTeamIds: { [key: string]: string[] } = {};
for (const userId in userPredictionsRaw) {
    userPredictionTeamIds[userId] = userPredictionsRaw[userId].map(teamName => {
        const teamId = teamNameMapping[teamName];
        if (teamId) {
            return teamId;
        }
        console.warn(`Could not map team name: ${teamName} for user ${userId}`);
        return 'unknown';
    }).filter(id => id !== 'unknown');
}


export const fullPredictions: Prediction[] = Object.entries(userPredictionTeamIds).map(([userId, rankings]) => ({
    userId,
    rankings,
}));


export const matches: Match[] = [
    { week: 1, homeTeamId: 'team_12', awayTeamId: 'team_3', homeScore: 4, awayScore: 2 },
    { week: 1, homeTeamId: 'team_2', awayTeamId: 'team_15', homeScore: 0, awayScore: 0 },
    { week: 1, homeTeamId: 'team_18', awayTeamId: 'team_21', homeScore: 3, awayScore: 0 },
    { week: 1, homeTeamId: 'team_22', awayTeamId: 'team_19', homeScore: 3, awayScore: 0 },
    { week: 1, homeTeamId: 'team_5', awayTeamId: 'team_9', homeScore: 1, awayScore: 1 },
    { week: 1, homeTeamId: 'team_20', awayTeamId: 'team_13', homeScore: 0, awayScore: 4 },
    { week: 1, homeTeamId: 'team_16', awayTeamId: 'team_4', homeScore: 3, awayScore: 1 },
    { week: 1, homeTeamId: 'team_6', awayTeamId: 'team_7', homeScore: 0, awayScore: 0 },
    { week: 1, homeTeamId: 'team_14', awayTeamId: 'team_1', homeScore: 0, awayScore: 1 },
    { week: 1, homeTeamId: 'team_23', awayTeamId: 'team_8', homeScore: 1, awayScore: 0 },
    { week: 2, homeTeamId: 'team_19', awayTeamId: 'team_6', homeScore: 1, awayScore: 5 },
    { week: 2, homeTeamId: 'team_15', awayTeamId: 'team_12', homeScore: 2, awayScore: 3 },
    { week: 2, homeTeamId: 'team_13', awayTeamId: 'team_18', homeScore: 0, awayScore: 2 },
    { week: 2, homeTeamId: 'team_9', awayTeamId: 'team_14', homeScore: 1, awayScore: 1 },
    { week: 2, homeTeamId: 'team_8', awayTeamId: 'team_5', homeScore: 2, awayScore: 0 },
    { week: 2, homeTeamId: 'team_7', awayTeamId: 'team_16', homeScore: 1, awayScore: 1 },
    { week: 2, homeTeamId: 'team_21', awayTeamId: 'team_22', homeScore: 2, awayScore: 0 },
    { week: 2, homeTeamId: 'team_4', awayTeamId: 'team_2', homeScore: 1, awayScore: 0 },
    { week: 2, homeTeamId: 'team_1', awayTeamId: 'team_23', homeScore: 5, awayScore: 0 },
    { week: 2, homeTeamId: 'team_3', awayTeamId: 'team_20', homeScore: 1, awayScore: 0 },
    { week: 3, homeTeamId: 'team_20', awayTeamId: 'team_8', homeScore: 2, awayScore: 3 },
    { week: 3, homeTeamId: 'team_18', awayTeamId: 'team_3', homeScore: 0, awayScore: 1 },
    { week: 3, homeTeamId: 'team_22', awayTeamId: 'team_4', homeScore: 2, awayScore: 1 },
    { week: 3, homeTeamId: 'team_16', awayTeamId: 'team_19', homeScore: 0, awayScore: 3 },
    { week: 3, homeTeamId: 'team_14', awayTeamId: 'team_21', homeScore: 3, awayScore: 2 },
    { week: 3, homeTeamId: 'team_12', awayTeamId: 'team_1', homeScore: 1, awayScore: 0 },
    { week: 3, homeTeamId: 'team_23', awayTeamId: 'team_15', homeScore: 0, awayScore: 0 },
    { week: 3, homeTeamId: 'team_6', awayTeamId: 'team_9', homeScore: 2, awayScore: 0 },
    { week: 3, homeTeamId: 'team_5', awayTeamId: 'team_13', homeScore: 2, awayScore: 1 },
    { week: 3, homeTeamId: 'team_2', awayTeamId: 'team_7', homeScore: 0, awayScore: 3 },
    { week: 4, homeTeamId: 'team_19', awayTeamId: 'team_18', homeScore: 0, awayScore: 3 },
    { week: 4, homeTeamId: 'team_15', awayTeamId: 'team_20', homeScore: 1, awayScore: 0 },
    { week: 4, homeTeamId: 'team_13', awayTeamId: 'team_14', homeScore: 3, awayScore: 0 },
    { week: 4, homeTeamId: 'team_9', awayTeamId: 'team_23', homeScore: 1, awayScore: 0 },
    { week: 4, homeTeamId: 'team_8', awayTeamId: 'team_2', homeScore: 0, awayScore: 0 },
    { week: 4, homeTeamId: 'team_7', awayTeamId: 'team_22', homeScore: 0, awayScore: 0 },
    { week: 4, homeTeamId: 'team_21', awayTeamId: 'team_12', homeScore: 0, awayScore: 1 },
    { week: 4, homeTeamId: 'team_4', awayTeamId: 'team_6', homeScore: 2, awayScore: 2 },
    { week: 4, homeTeamId: 'team_1', awayTeamId: 'team_16', homeScore: 3, awayScore: 0 },
    { week: 4, homeTeamId: 'team_3', awayTeamId: 'team_5', homeScore: 2, awayScore: 1 }
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

const MAX_WEEK = 4;

// Calculate final standings after max week
const finalStatsMap = calculateStandings(matches, MAX_WEEK);
export const standings: CurrentStanding[] = sortStandings(finalStatsMap);
const finalTeamRanks = new Map(standings.map(s => [s.teamId, s.rank]));

// Calculate player scores based on week standings
export const playerTeamScores: PlayerTeamScore[] = userList.flatMap(user => {
    const prediction = fullPredictions.find(p => p.userId === user.id);
    if (!prediction || !prediction.rankings) {
        console.warn(`No prediction found for user: ${user.id}`);
        return [];
    };

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
        avatar: `${(i % 49) + 1}`,
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
        results.push('-');
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
