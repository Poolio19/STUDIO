
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

// --- MINIMAL TEST DATA ---

const allTeams: Team[] = [
    { id: 'team_1', name: 'Arsenal', logo: 'drill', bgColourFaint: 'rgba(239, 1, 7, 0.3)', bgColourSolid: '#EF0107', textColour: '#062657', iconColour: '#FFFFFF' },
    { id: 'team_12', name: 'Liverpool', logo: 'origami', bgColourFaint: 'rgba(200, 16, 46, 0.3)', bgColourSolid: '#C8102E', textColour: '#000000', iconColour: '#FFFFFF' },
    { id: 'team_13', name: 'Man City', logo: 'sailboat', bgColourFaint: 'rgba(108, 171, 221, 0.3)', bgColourSolid: '#6CABDD', textColour: '#00285E', iconColour: '#00285E' },
    { id: 'team_6', name: 'Chelsea', logo: 'creativeCommons', bgColourFaint: 'rgba(3, 70, 148, 0.3)', bgColourSolid: '#034694', textColour: '#FFFFFF', iconColour: '#FFFFFF' },
];

export { allTeams as teams };


const WEEKS_TO_SHOW = 2;

const allMatches: Match[] = [
    { week: 1, homeTeamId: 'team_1', awayTeamId: 'team_13', homeScore: 1, awayScore: 1 },
    { week: 1, homeTeamId: 'team_12', awayTeamId: 'team_6', homeScore: 2, awayScore: 0 },
    { week: 2, homeTeamId: 'team_1', awayTeamId: 'team_12', homeScore: 2, awayScore: 2 },
    { week: 2, homeTeamId: 'team_13', awayTeamId: 'team_6', homeScore: 3, awayScore: 1 },
];

export const matches: Match[] = allMatches.filter(m => m.week <= WEEKS_TO_SHOW);

const calculateStandings = (matchesToProcess: Match[]): (PreviousSeasonStanding & { rank: number })[] => {
    const standingsMap: Map<string, { points: number, goalDifference: number, goalsFor: number }> = new Map();

    allTeams.forEach(team => {
        standingsMap.set(team.id, { points: 0, goalDifference: 0, goalsFor: 0 });
    });

    matchesToProcess.forEach(match => {
        const homeTeam = standingsMap.get(match.homeTeamId)!;
        const awayTeam = standingsMap.get(match.awayTeamId)!;

        homeTeam.goalsFor += match.homeScore;
        awayTeam.goalsFor += match.awayScore;
        homeTeam.goalDifference += match.homeScore - match.awayScore;
        awayTeam.goalDifference += match.awayScore - match.homeScore;

        if (match.homeScore > match.awayScore) {
            homeTeam.points += 3;
        } else if (match.homeScore < match.awayScore) {
            awayTeam.points += 3;
        } else {
            homeTeam.points += 1;
            awayTeam.points += 1;
        }
    });

    const calculatedStandings: ({ teamId: string, teamName: string, goalsFor: number, points: number, goalDifference: number })[] = [];
    standingsMap.forEach((stats, teamId) => {
        const team = allTeams.find(t => t.id === teamId);
        if (team) {
            calculatedStandings.push({ teamId, teamName: team.name, ...stats });
        }
    });
    
    calculatedStandings.sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
        if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
        return a.teamName.localeCompare(b.teamName);
    });

    return calculatedStandings.map((standing, index) => ({
        teamId: standing.teamId,
        rank: index + 1,
        points: standing.points,
        goalDifference: standing.goalDifference,
    }));
};


export const previousSeasonStandings: PreviousSeasonStanding[] = calculateStandings(allMatches);

export const fullUsers: Omit<User, 'score' | 'rank' | 'previousRank' | 'previousScore' | 'maxRank' | 'minRank' | 'maxScore' | 'minScore' | 'rankChange' | 'scoreChange'>[] = [
    { id: 'usr_1', name: 'Alex Anderson', avatar: '1', email: 'alex@example.com', joinDate: '2023-08-10T10:00:00Z' },
    { id: 'usr_2', name: 'Thomas Wright', avatar: '2' },
    { id: 'usr_3', name: 'Barrie Cross', avatar: '3' },
];

export const fullPredictions: Prediction[] = [
    { userId: "usr_1", rankings: ["team_6", "team_13", "team_12", "team_1"] },
    { userId: "usr_2", rankings: ["team_12", "team_13", "team_1", "team_6"] },
    { userId: "usr_3", rankings: ["team_1", "team_12", "team_13", "team_6"] },
];

const calculateCurrentStandings = (matchesToProcess: Match[]): CurrentStanding[] => {
    const standingsMap: Map<string, Omit<CurrentStanding, 'rank' | 'teamId'>> = new Map();

    const teamIdsInMatches = new Set(matchesToProcess.flatMap(m => [m.homeTeamId, m.awayTeamId]));
    
    allTeams.forEach(team => {
        if (teamIdsInMatches.has(team.id)) {
            standingsMap.set(team.id, { points: 0, goalDifference: 0, gamesPlayed: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0 });
        }
    });

    matchesToProcess.forEach(match => {
        const homeTeam = standingsMap.get(match.homeTeamId);
        const awayTeam = standingsMap.get(match.awayTeamId);

        if (homeTeam && awayTeam) {
            homeTeam.gamesPlayed += 1;
            awayTeam.gamesPlayed += 1;
            homeTeam.goalsFor += match.homeScore;
            awayTeam.goalsFor += match.awayScore;
            homeTeam.goalsAgainst += match.awayScore;
            awayTeam.goalsAgainst += match.homeScore;

            if (match.homeScore > match.awayScore) {
                homeTeam.wins += 1; homeTeam.points += 3; awayTeam.losses += 1;
            } else if (match.homeScore < match.awayScore) {
                awayTeam.wins += 1; awayTeam.points += 3; homeTeam.losses += 1;
            } else {
                homeTeam.draws += 1; awayTeam.draws += 1; homeTeam.points += 1; awayTeam.points += 1;
            }
        }
    });

    const calculatedStandings: (Omit<CurrentStanding, 'rank'> & {teamId: string})[] = [];
    standingsMap.forEach((stats, teamId) => {
        calculatedStandings.push({ teamId, ...stats, goalDifference: stats.goalsFor - stats.goalsAgainst });
    });
    
    calculatedStandings.sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
        if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
        const teamA = allTeams.find(t => t.id === a.teamId)!;
        const teamB = allTeams.find(t => t.id === b.teamId)!;
        return teamA.name.localeCompare(teamB.name);
    });

    let rank = 1;
    return calculatedStandings.map((standing, index) => {
        if (index > 0) {
            const prev = calculatedStandings[index - 1];
            if (standing.points !== prev.points || standing.goalDifference !== prev.goalDifference || standing.goalsFor !== prev.goalsFor) {
                rank = index + 1;
            }
        }
        return { ...standing, rank };
    });
};

export const currentStandings: CurrentStanding[] = calculateCurrentStandings(matches);
const finalStandings: CurrentStanding[] = calculateCurrentStandings(allMatches);

const calculateScoresForUser = (userPredictions: string[], actualStandings: CurrentStanding[]): number => {
    const actualRanks = new Map<string, number>();
    actualStandings.forEach(s => actualRanks.set(s.teamId, s.rank));
    
    let totalScore = 0;
    userPredictions.forEach((teamId, index) => {
        const predictedRank = index + 1;
        const actualRank = actualRanks.get(teamId);
        if (actualRank !== undefined) {
            totalScore += 5 - Math.abs(predictedRank - actualRank);
        }
    });
    return totalScore;
};

export const playerTeamScores: PlayerTeamScore[] = fullUsers.flatMap(user => {
    const userPrediction = fullPredictions.find(p => p.userId === user.id);
    if (!userPrediction) return [];

    const actualRanks = new Map<string, number>();
    finalStandings.forEach(s => actualRanks.set(s.teamId, s.rank));
    
    return userPrediction.rankings.map((teamId, index) => {
        const predictedRank = index + 1;
        const actualRank = actualRanks.get(teamId);
        let score = 0;
        if (actualRank !== undefined) {
            score = 5 - Math.abs(predictedRank - actualRank);
        }
        return { userId: user.id, teamId, score };
    });
});

export const fullUserHistories: UserHistory[] = fullUsers.map(user => {
    let weeklyScores: WeeklyScore[] = [{ week: 0, score: 0, rank: 0 }];
    const userPrediction = fullPredictions.find(p => p.userId === user.id);

    if (userPrediction) {
        for (let week = 1; week <= 2; week++) { // Only calculate for test weeks
             const matchesForWeek = allMatches.filter(m => m.week <= week);
             const standingsForWeek = calculateCurrentStandings(matchesForWeek);
             const score = calculateScoresForUser(userPrediction.rankings, standingsForWeek);
             weeklyScores.push({ week, score, rank: 0 });
        }
    }
    return { userId: user.id, weeklyScores };
});

// Calculate ranks for each test week
for (let week = 1; week <= 2; week++) {
    const weeklyPlayerStandings = fullUserHistories
      .map(h => ({
          userId: h.userId,
          score: h.weeklyScores.find(w => w.week === week)?.score ?? -Infinity,
      }))
      .sort((a, b) => b.score - a.score);

    weeklyPlayerStandings.forEach((player, index) => {
        const userHistory = fullUserHistories.find(h => h.userId === player.userId)!;
        const weekData = userHistory.weeklyScores.find(w => w.week === week)!;
        weekData.rank = index + 1;
    });
}

const finalUsers: User[] = fullUsers.map(userStub => {
    const history = fullUserHistories.find(h => h.userId === userStub.id);
    if (!history) return { ...userStub, score: 0, rank: 0, previousRank: 0, previousScore: 0, rankChange: 0, scoreChange: 0, maxScore: 0, minScore: 0, maxRank: 0, minRank: 0, };
    
    const currentWeekData = history.weeklyScores.find(w => w.week === WEEKS_TO_SHOW) || { score: 0, rank: 0 };
    const previousWeekData = history.weeklyScores.find(w => w.week === WEEKS_TO_SHOW - 1) || { score: 0, rank: 0 };
    const rankChange = previousWeekData.rank - currentWeekData.rank;
    const scoreChange = currentWeekData.score - previousWeekData.score;
    
    const seasonWeeklyScores = history.weeklyScores.filter(w => w.week > 0 && w.week <= WEEKS_TO_SHOW);
    if (seasonWeeklyScores.length === 0) return { ...userStub, score: 0, rank: 0, previousRank: 0, previousScore: 0, rankChange: 0, scoreChange: 0, maxScore: 0, minScore: 0, maxRank: 0, minRank: 0, };

    const allScores = seasonWeeklyScores.map(w => w.score);
    const allRanks = seasonWeeklyScores.map(w => w.rank).filter(r => r > 0);
    const maxScore = Math.max(...allScores);
    const minScore = Math.min(...allScores);
    const maxRank = Math.min(...allRanks);
    const minRank = Math.max(...allRanks);
    
    return { ...userStub, score: currentWeekData.score, rank: currentWeekData.rank, previousRank: previousWeekData.rank, previousScore: previousWeekData.score, rankChange, scoreChange, maxScore, minScore, maxRank, minRank, };
});


export const weeklyTeamStandings: WeeklyTeamStanding[] = Array.from(new Set(allMatches.flatMap(m => [m.homeTeamId, m.awayTeamId]))).flatMap(teamId => {
    const ranksByWeek: WeeklyTeamStanding[] = [];
    for (let week = 1; week <= WEEKS_TO_SHOW; week++) {
        const matchesForWeek = allMatches.filter(m => m.week <= week);
        const standingsForWeek = calculateCurrentStandings(matchesForWeek);
        const teamRank = standingsForWeek.find(s => s.teamId === teamId)?.rank || 4;
        ranksByWeek.push({ week, teamId: teamId, rank: teamRank });
    }
    return ranksByWeek;
});


const generateRecentResults = (teamId: string): ('W' | 'D' | 'L' | '-')[] => {
    const results: ('W' | 'D' | 'L' | '-')[] = Array(6).fill('-');
    const teamMatches = matches.filter(m => (m.homeTeamId === teamId || m.awayTeamId === teamId) && m.week <= WEEKS_TO_SHOW).sort((a, b) => b.week - a.week);
    
    for (let i = 0; i < Math.min(teamMatches.length, 6); i++) {
        const match = teamMatches[i];
        let result: 'W' | 'D' | 'L';
        if (match.homeScore === match.awayScore) {
            result = 'D';
        } else if ((match.homeTeamId === teamId && match.homeScore > match.awayScore) || (match.awayTeamId === teamId && match.awayScore > match.homeScore)) {
            result = 'W';
        } else {
            result = 'L';
        }
        results[5 - i] = result;
    }
    
    return results;
};

export const teamRecentResults: TeamRecentResult[] = Array.from(new Set(allMatches.flatMap(m => [m.homeTeamId, m.awayTeamId]))).map((teamId) => {
    return { teamId, results: generateRecentResults(teamId) };
});

export const seasonMonths: SeasonMonth[] = [
    { id: 'sm_1', month: 'August', year: 2025, abbreviation: 'AUG' },
];

export const monthlyMimoM: MonthlyMimoM[] = [];

// Export the data for the UI
export const users: User[] = finalUsers;
export const predictions: Prediction[] = fullPredictions;
export const userHistories: UserHistory[] = fullUserHistories;

    