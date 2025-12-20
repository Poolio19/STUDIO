

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

// --- STATIC DATA ---

let usersData: Omit<User, 'score' | 'rank' | 'previousRank' | 'previousScore' | 'maxRank' | 'minRank' | 'maxScore' | 'minScore' | 'rankChange' | 'scoreChange'>[] = [
    { id: 'usr_1', name: 'Alex', avatar: '1' },
    { id: 'usr_2', name: 'Maria', avatar: '2' },
    { id: 'usr_3', name: 'David', avatar: '3' },
    { id: 'usr_4', name: 'Sophia', avatar: '4' },
    { id: 'usr_5', name: 'Kenji', avatar: '5' },
    { id: 'usr_6', name: 'Fatima', avatar: '6' },
    { id: 'usr_7', name: 'Leo', avatar: '7' },
    { id: 'usr_8', name: 'Chloe', avatar: '8' },
    { id: 'usr_9', name: 'Mohammed', avatar: '9' },
    { id: 'usr_10', name: 'Isabella', avatar: '10' },
    { id: 'usr_11', 'name': 'James', avatar: '11' },
    { id: 'usr_12', name: 'Amelia', avatar: '12' },
    { id: 'usr_13', name: 'Benjamin', avatar: '13' },
    { id: 'usr_14', name: 'Mia', avatar: '14' },
    { id: 'usr_15', name: 'Elijah', avatar: '15' },
    { id: 'usr_16', name: 'Harper', avatar: '16' },
    { id: 'usr_17', name: 'Lucas', avatar: '17' },
    { id: 'usr_18', name: 'Evelyn', avatar: '18' },
    { id: 'usr_19', name: 'Henry', avatar: '19' },
    { id: 'usr_20', name: 'Abigail', avatar: '20' },
    { id: 'usr_47', name: 'BBC', avatar: '47', isPro: true },
    { id: 'usr_48', name: 'SKY', avatar: '48', isPro: true },
    { id: 'usr_49', name: 'OPTA', avatar: '49', isPro: true },
];

export const teams: Team[] = [
    { id: 'team_1', name: 'Arsenal', logo: 'drill', bgColourFaint: 'rgba(239, 1, 7, 0.3)', bgColourSolid: '#EF0107', textColour: '#062657', iconColour: '#FFFFFF' },
    { id: 'team_2', name: 'Aston Villa', logo: 'squirrel', bgColourFaint: 'rgba(149, 191, 229, 0.3)', bgColourSolid: '#95BFE5', textColour: '#670E36', iconColour: '#670E36' },
    { id: 'team_3', name: 'Bournemouth', logo: 'fingerprint', bgColourFaint: 'rgba(218, 41, 28, 0.3)', bgColourSolid: '#DA291C', textColour: '#000000', iconColour: '#000000' },
    { id: 'team_4', name: 'Brentford', logo: 'bug', bgColourFaint: 'rgba(200, 16, 46, 0.3)', bgColourSolid: '#C8102E', textColour: '#000000', iconColour: '#FFFFFF' },
    { id: 'team_5', name: 'Brighton', logo: 'bird', bgColourFaint: 'rgba(0, 87, 184, 0.3)', bgColourSolid: '#0057B8', textColour: '#FFFFFF', iconColour: '#FFFFFF' },
    { id: 'team_6', name: 'Chelsea', logo: 'creativeCommons', bgColourFaint: 'rgba(3, 70, 148, 0.3)', bgColourSolid: '#034694', textColour: '#FFFFFF', iconColour: '#FFFFFF' },
    { id: 'team_7', name: 'Crystal Palace', logo: 'rabbit', bgColourFaint: 'rgba(27, 69, 143, 0.3)', bgColourSolid: '#1B458F', textColour: '#C4122E', iconColour: '#C4122E' },
    { id: 'team_8', name: 'Everton', logo: 'home', bgColourFaint: 'rgba(0, 51, 153, 0.3)', bgColourSolid: '#003399', textColour: '#FFFFFF', iconColour: '#FFFFFF' },
    { id: 'team_9', name: 'Fulham', logo: 'shieldHalf', bgColourFaint: 'rgba(0, 0, 0, 0.3)', bgColourSolid: '#000000', textColour: '#FFFFFF', iconColour: '#FFFFFF' },
    { id: 'team_10', name: 'Ipswich Town', logo: 'mapPin', bgColourFaint: 'rgba(0, 87, 184, 0.3)', bgColourSolid: '#0057B8', textColour: '#FFFFFF', iconColour: '#FFFFFF' },
    { id: 'team_11', name: 'Leicester City', logo: 'sparkles', bgColourFaint: 'rgba(0, 83, 160, 0.3)', bgColourSolid: '#0053A0', textColour: '#FDBE11', iconColour: '#FDBE11' },
    { id: 'team_12', name: 'Liverpool', logo: 'origami', bgColourFaint: 'rgba(200, 16, 46, 0.3)', bgColourSolid: '#C8102E', textColour: '#000000', iconColour: '#FFFFFF' },
    { id: 'team_13', name: 'Man City', logo: 'sailboat', bgColourFaint: 'rgba(108, 171, 221, 0.3)', bgColourSolid: '#6CABDD', textColour: '#00285E', iconColour: '#00285E' },
    { id: 'team_14', name: 'Man Utd', logo: 'hamburger', bgColourFaint: 'rgba(218, 41, 28, 0.3)', bgColourSolid: '#DA291C', textColour: '#FBE122', iconColour: '#FBE122' },
    { id: 'team_15', name: 'Newcastle', logo: 'castle', bgColourFaint: 'rgba(36, 31, 32, 0.3)', bgColourSolid: '#241F20', textColour: '#FFFFFF', iconColour: '#FFFFFF' },
    { id: 'team_16', name: 'Notts Forest', logo: 'treeDeciduous', bgColourFaint: 'rgba(221, 0, 0, 0.3)', bgColourSolid: '#DD0000', textColour: '#FFFFFF', iconColour: '#FFFFFF' },
    { id: 'team_17', name: 'Southampton', logo: 'flower', bgColourFaint: 'rgba(215, 25, 32, 0.3)', bgColourSolid: '#D71920', textColour: '#FFFFFF', iconColour: '#FFFFFF' },
    { id: 'team_18', name: 'Tottenham', logo: 'ship', bgColourFaint: 'rgba(19, 34, 87, 0.3)', bgColourSolid: '#132257', textColour: '#FFFFFF', iconColour: '#FFFFFF' },
    { id: 'team_19', name: 'West Ham', logo: 'utensilsCrossed', bgColourFaint: 'rgba(122, 38, 58, 0.3)', bgColourSolid: '#7A263A', textColour: '#132257', iconColour: '#FBB117' },
    { id: 'team_20', name: 'Wolves', logo: 'gitlab', bgColourFaint: 'rgba(253, 185, 19, 0.3)', bgColourSolid: '#FDB913', textColour: '#231F20', iconColour: '#231F20' },
    // Relegated teams, needed for previous season standings context
    { id: 'team_21', name: 'Luton Town', logo: 'theater', bgColourFaint: 'rgba(247, 143, 30, 0.3)', bgColourSolid: '#F78F1E', textColour: '#000000', iconColour: '#000000' },
    { id: 'team_22', name: 'Burnley', logo: 'shield', bgColourFaint: 'rgba(108, 29, 69, 0.3)', bgColourSolid: '#6C1D45', textColour: '#99D6EA', iconColour: '#99D6EA' },
    { id: 'team_23', name: 'Sheffield Utd', logo: 'swords', bgColourFaint: 'rgba(238, 39, 55, 0.3)', bgColourSolid: '#EE2737', textColour: '#000000', iconColour: '#FFFFFF' },
];

export const previousSeasonStandings: PreviousSeasonStanding[] = [
    { teamId: 'team_13', rank: 1, points: 91, goalDifference: 62 },
    { teamId: 'team_1', rank: 2, points: 89, goalDifference: 65 },
    { teamId: 'team_12', rank: 3, points: 82, goalDifference: 45 },
    { teamId: 'team_2', rank: 4, points: 68, goalDifference: 22 },
    { teamId: 'team_18', rank: 5, points: 66, goalDifference: 13 },
    { teamId: 'team_6', rank: 6, points: 63, goalDifference: 14 },
    { teamId: 'team_15', rank: 7, points: 60, goalDifference: 23 },
    { teamId: 'team_14', rank: 8, points: 60, goalDifference: -1 },
    { teamId: 'team_19', rank: 9, points: 52, goalDifference: -14 },
    { teamId: 'team_7', rank: 10, points: 49, goalDifference: -1 },
    { teamId: 'team_5', rank: 11, points: 48, goalDifference: -7 },
    { teamId: 'team_3', rank: 12, points: 48, goalDifference: -13 },
    { teamId: 'team_9', rank: 13, points: 47, goalDifference: -6 },
    { teamId: 'team_20', rank: 14, points: 46, goalDifference: -15 },
    { teamId: 'team_8', rank: 15, points: 40, goalDifference: -11 },
    { teamId: 'team_4', rank: 16, points: 39, goalDifference: -9 },
    { teamId: 'team_16', rank: 17, points: 32, goalDifference: -18 },
    { teamId: 'team_21', rank: 18, points: 26, goalDifference: -33 }, // Luton
    { teamId: 'team_22', rank: 19, points: 24, goalDifference: -37 }, // Burnley
    { teamId: 'team_23', rank: 20, points: 16, goalDifference: -69 }, // Sheffield
];

export const seasonMonths: SeasonMonth[] = [
    { id: 'sm_1', month: 'August', year: 2025, abbreviation: 'AUG' },
    { id: 'sm_2', month: 'September', year: 2025, abbreviation: 'SEPT' },
    { id: 'sm_3', month: 'October', year: 2025, abbreviation: 'OCT' },
    { id: 'sm_4', month: 'November', year: 2025, abbreviation: 'NOV' },
    { id: 'sm_5', month: 'December', year: 2025, abbreviation: 'DEC' },
    { id: 'sm_6', month: 'December', year: 2025, special: 'Christmas No. 1', abbreviation: 'XMAS' },
    { id: 'sm_7', month: 'January', year: 2026, abbreviation: 'JAN' },
    { id: 'sm_8', month: 'February', year: 2026, abbreviation: 'FEB' },
    { id: 'sm_9', month: 'March', year: 2026, abbreviation: 'MAR' },
    { id: 'sm_10', month: 'April', year: 2026, abbreviation: 'APR' },
    { id: 'sm_11', month: 'May', year: 2026, abbreviation: 'MAY' },
];

export const monthlyMimoM: MonthlyMimoM[] = [
    { id: 'mimo_1', month: 'August', year: 2025, userId: 'usr_12', type: 'winner' },
    { id: 'mimo_2', month: 'August', year: 2025, userId: 'usr_3', type: 'runner-up' },
];

// --- DYNAMIC & DETERMINISTIC DATA GENERATION ---

const WEEKS_TO_SHOW = 10;
const CURRENT_SEASON_TEAMS = teams.filter(t => !['team_21', 'team_22', 'team_23'].includes(t.id)).map(t => t.id);

// Simple seeded random number generator for consistency
const mulberry32 = (seed: number) => {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const generateBiasedPrediction = (baseStandings: PreviousSeasonStanding[], seed: number): string[] => {
    const random = mulberry32(seed);
    const standings = [...baseStandings].sort((a, b) => a.rank - b.rank);
    const getUserPersonality = (seed: number) => {
        const personalityRand = mulberry32(seed + 100);
        const type = personalityRand() * 3;
        if (type < 1) return 'optimist';
        if (type < 2) return 'pessimist';
        return 'realist';
    };
    const personality = getUserPersonality(seed);
    let perturbedStandings = standings.map(team => {
        const originalRank = team.rank;
        let perturbation = 0;
        const bellCurveRandom = (random() + random() + random() + random() + random() + random() - 3) / 3;
        let maxPerturbation: number;
        let bias = 0;
        if (personality === 'optimist') bias = -0.1;
        if (personality === 'pessimist') bias = 0.1;
        if (originalRank <= 4) maxPerturbation = 3;
        else if (originalRank <= 12) maxPerturbation = 12;
        else maxPerturbation = 18;
        perturbation = Math.round((bellCurveRandom + bias) * maxPerturbation);
        let predictedRank = originalRank + perturbation;
        predictedRank = Math.max(1, Math.min(20, predictedRank));
        return { teamId: team.teamId, predictedRank, tieBreaker: random() };
    });
    perturbedStandings.sort((a, b) => a.predictedRank - b.predictedRank || a.tieBreaker - b.tieBreaker);
    const finalTeamIds = new Array(20);
    const assignedRanks = new Set<number>();
    perturbedStandings.forEach(p => {
        let proposedRank = p.predictedRank;
        while(assignedRanks.has(proposedRank) && proposedRank <= 20) { proposedRank++; }
         if (proposedRank <= 20) { p.predictedRank = proposedRank; assignedRanks.add(p.predictedRank); }
    });
    for (let i = 1; i <= 20; i++) {
        if (!assignedRanks.has(i)) {
            const unplacedTeam = perturbedStandings.find(p => p.predictedRank > 20 || !finalTeamIds.includes(p.teamId));
             if (unplacedTeam) { unplacedTeam.predictedRank = i; assignedRanks.add(i); }
        }
    }
    perturbedStandings.sort((a, b) => a.predictedRank - b.predictedRank);
    return perturbedStandings.map(p => p.teamId);
};

export const predictions: Prediction[] = usersData.map((user, index) => {
    return {
      userId: user.id,
      rankings: generateBiasedPrediction(previousSeasonStandings, index + 1),
    };
});

const generateSeasonFixtures = (): Omit<Match, 'homeScore' | 'awayScore'>[] => {
    const numTeams = CURRENT_SEASON_TEAMS.length;
    let fixtures: Omit<Match, 'homeScore' | 'awayScore'>[] = [];

    // Generate home and away fixtures for each pair of teams
    for (let i = 0; i < numTeams; i++) {
        for (let j = 0; j < numTeams; j++) {
            if (i !== j) {
                fixtures.push({ week: 0, homeTeamId: CURRENT_SEASON_TEAMS[i], awayTeamId: CURRENT_SEASON_TEAMS[j] });
            }
        }
    }

    // Shuffle fixtures to randomize match-ups per week
    const random = mulberry32(123); // Fixed seed for deterministic shuffling
    for (let i = fixtures.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        [fixtures[i], fixtures[j]] = [fixtures[j], fixtures[i]];
    }

    // Assign weeks to fixtures, ensuring no team plays more than once a week
    let week = 1;
    const assignedFixtures: Omit<Match, 'homeScore' | 'awayScore'>[] = [];
    while (fixtures.length > 0 && week <= 38) {
        const teamsInWeek: Set<string> = new Set();
        const weekFixtures: Omit<Match, 'homeScore' | 'awayScore'>[] = [];
        let remainingFixtures: Omit<Match, 'homeScore' | 'awayScore'>[] = [];

        for (const fixture of fixtures) {
            if (!teamsInWeek.has(fixture.homeTeamId) && !teamsInWeek.has(fixture.awayTeamId)) {
                teamsInWeek.add(fixture.homeTeamId);
                teamsInWeek.add(fixture.awayTeamId);
                weekFixtures.push({ ...fixture, week });
            } else {
                remainingFixtures.push(fixture);
            }
        }
        
        assignedFixtures.push(...weekFixtures);
        fixtures = remainingFixtures;
        if (weekFixtures.length > 0) {
            week++;
        }
    }

    return assignedFixtures;
};

const simulateMatchScores = (fixtures: Omit<Match, 'homeScore' | 'awayScore'>[]): Match[] => {
    const teamStrengths = new Map<string, number>();
    previousSeasonStandings.forEach(s => {
        // Simple strength from 1 to 20 (inverted rank)
        teamStrengths.set(s.teamId, 21 - s.rank);
    });
    // Add strengths for promoted teams
    teamStrengths.set('team_10', 5); // Ipswich
    teamStrengths.set('team_11', 4); // Leicester
    teamStrengths.set('team_17', 3); // Southampton

    return fixtures.map((fixture, index) => {
        const random = mulberry32(index);
        const homeStrength = teamStrengths.get(fixture.homeTeamId) || 10;
        const awayStrength = teamStrengths.get(fixture.awayTeamId) || 10;
        
        const homeAdvantage = 0.2; // Small advantage for home team
        
        const homePotential = (homeStrength / 20) + homeAdvantage;
        const awayPotential = awayStrength / 20;

        let homeScore = 0;
        let awayScore = 0;

        // Simulate goals based on potential
        if (random() < homePotential * 0.7) homeScore++;
        if (random() < homePotential * 0.4) homeScore++;
        if (random() < homePotential * 0.2) homeScore++;

        if (random() < awayPotential * 0.6) awayScore++;
        if (random() < awayPotential * 0.3) awayScore++;
        if (random() < awayPotential * 0.15) awayScore++;
        
        return { ...fixture, homeScore, awayScore };
    });
};

const calculateStandings = (matchesToProcess: Match[]): CurrentStanding[] => {
    const standingsMap: Map<string, Omit<CurrentStanding, 'rank' | 'teamId'>> = new Map();

    CURRENT_SEASON_TEAMS.forEach(teamId => {
        standingsMap.set(teamId, { points: 0, goalDifference: 0, gamesPlayed: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0 });
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
        const teamA = teams.find(t => t.id === a.teamId)!;
        const teamB = teams.find(t => t.id === b.teamId)!;
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

const calculateScoresForUser = (userPredictions: string[], actualStandings: CurrentStanding[]): number => {
    const actualRanks = new Map<string, number>();
    actualStandings.forEach(s => actualRanks.set(s.teamId, s.rank));
    
    let totalScore = 0;
    userPredictions.forEach((teamId, index) => {
        const predictedRank = index + 1;
        const actualRank = actualRanks.get(teamId);
        if (actualRank) {
            totalScore += 5 - Math.abs(predictedRank - actualRank);
        }
    });
    return totalScore;
};

const allFixtures = generateSeasonFixtures();
export const allMatches: Match[] = simulateMatchScores(allFixtures);
export const matches: Match[] = allMatches.filter(m => m.week <= WEEKS_TO_SHOW);
export const currentStandings: CurrentStanding[] = calculateStandings(matches);
const finalStandings: CurrentStanding[] = calculateStandings(allMatches);


export const playerTeamScores: PlayerTeamScore[] = usersData.flatMap(user => {
    const userPrediction = predictions.find(p => p.userId === user.id);
    if (!userPrediction) return [];

    const actualRanks = new Map<string, number>();
    finalStandings.forEach(s => actualRanks.set(s.teamId, s.rank));
    
    return userPrediction.rankings.map((teamId, index) => {
        const predictedRank = index + 1;
        const actualRank = actualRanks.get(teamId);
        let score = 0;
        if (actualRank) {
            score = 5 - Math.abs(predictedRank - actualRank);
        }
        return { userId: user.id, teamId, score };
    });
});

const previousSeasonPlayerRanks: {[key: string]: number} = {};
[...usersData].sort((a,b) => (parseInt(a.id.replace('usr_','')) % 5) - (parseInt(b.id.replace('usr_','')) % 5))
  .forEach((user, index) => { previousSeasonPlayerRanks[user.id] = index + 1; });

export const userHistories: UserHistory[] = usersData.map(user => {
    let weeklyScores: WeeklyScore[] = [{ week: 0, score: 0, rank: previousSeasonPlayerRanks[user.id] || parseInt(user.id.replace('usr_', '')) % 20 }];
    const userPrediction = predictions.find(p => p.userId === user.id);

    if (userPrediction) {
        for (let week = 1; week <= 38; week++) {
             const matchesForWeek = allMatches.filter(m => m.week <= week);
             const standingsForWeek = calculateStandings(matchesForWeek);
             const score = calculateScoresForUser(userPrediction.rankings, standingsForWeek);
             weeklyScores.push({ week, score, rank: 0 }); // Rank will be calculated later
        }
    }
    return { userId: user.id, weeklyScores };
});

for (let week = 1; week <= 38; week++) {
    const weeklyPlayerStandings = userHistories
      .map(h => {
          const user = usersData.find(u => u.id === h.userId)!;
          const weeklyScore = h.weeklyScores.find(w => w.week === week);
          return {
              userId: h.userId,
              score: weeklyScore ? weeklyScore.score : -Infinity,
              tieBreaker: parseInt(user.id.replace('usr_', ''))
          }
      })
      .sort((a, b) => b.score - a.score || a.tieBreaker - b.tieBreaker);

    let currentRank = 1;
    weeklyPlayerStandings.forEach((player, index) => {
        if (index > 0 && player.score < weeklyPlayerStandings[index - 1].score) {
            currentRank = index + 1;
        }
        const userHistory = userHistories.find(h => h.userId === player.userId)!;
        const weekData = userHistory.weeklyScores.find(w => w.week === week)!;
        weekData.rank = currentRank;
    });
}


const finalUsers: User[] = usersData.map(userStub => {
    const history = userHistories.find(h => h.userId === userStub.id);
    
    if (!history || history.weeklyScores.length === 0) {
        return { ...userStub, score: 0, rank: 0, previousRank: 0, previousScore: 0, rankChange: 0, scoreChange: 0, maxScore: 0, minScore: 0, maxRank: 0, minRank: 0, };
    }
    
    const currentWeekData = history.weeklyScores.find(w => w.week === WEEKS_TO_SHOW) || { score: 0, rank: 0 };
    const previousWeekNumber = WEEKS_TO_SHOW > 1 ? WEEKS_TO_SHOW - 1 : 0;
    const previousWeekData = history.weeklyScores.find(w => w.week === previousWeekNumber) || { score: 0, rank: 0 };
    const rankChange = previousWeekData.rank && currentWeekData.rank ? previousWeekData.rank - currentWeekData.rank : 0;
    const scoreChange = currentWeekData.score - previousWeekData.score;
    
    const seasonWeeklyScores = history.weeklyScores.filter(w => w.week > 0 && w.week <= WEEKS_TO_SHOW);
    
    if (seasonWeeklyScores.length === 0) {
       return { ...userStub, score: currentWeekData.score, rank: currentWeekData.rank, previousRank: previousWeekData.rank, previousScore: previousWeekData.score, rankChange, scoreChange, maxScore: currentWeekData.score, minScore: currentWeekData.score, maxRank: currentWeekData.rank, minRank: currentWeekData.rank, };
    }

    const allScores = seasonWeeklyScores.map(w => w.score);
    const allRanks = seasonWeeklyScores.map(w => w.rank).filter(r => r > 0);
    const maxScore = Math.max(...allScores);
    const minScore = Math.min(...allScores);
    const maxRank = Math.min(...allRanks);
    const minRank = Math.max(...allRanks);
    
    return { ...userStub, score: currentWeekData.score, rank: currentWeekData.rank, previousRank: previousWeekData.rank, previousScore: previousWeekData.score, rankChange, scoreChange, maxScore, minScore, maxRank, minRank, };
});

export const users: User[] = finalUsers.sort((a, b) => a.rank - b.rank);


export const weeklyTeamStandings: WeeklyTeamStanding[] = CURRENT_SEASON_TEAMS.flatMap(teamId => {
    const ranksByWeek: WeeklyTeamStanding[] = [];

    for (let week = 1; week <= WEEKS_TO_SHOW; week++) {
        const matchesForWeek = allMatches.filter(m => m.week <= week);
        const standingsForWeek = calculateStandings(matchesForWeek);
        const teamRank = standingsForWeek.find(s => s.teamId === teamId)?.rank || 20;
        ranksByWeek.push({ week, teamId: teamId, rank: teamRank });
    }
    return ranksByWeek;
});


const generateRecentResults = (teamId: string): ('W' | 'D' | 'L' | '-')[] => {
    const results: ('W' | 'D' | 'L' | '-')[] = Array(6).fill('-');
    const teamMatches = matches.filter(m => m.homeTeamId === teamId || m.awayTeamId === teamId).sort((a, b) => b.week - a.week);
    
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

export const teamRecentResults: TeamRecentResult[] = CURRENT_SEASON_TEAMS.map((teamId) => {
    return { teamId, results: generateRecentResults(teamId) };
});
