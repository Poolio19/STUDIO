

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
    { id: 'usr_1', name: 'Alex', avatar: '1', email: 'alex@example.com', joinDate: '2023-08-10T10:00:00Z' },
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
    { id: 'team_12', name: 'Liverpool', logo: 'origami', bgColourFaint: 'rgba(200, 16, 46, 0.3)', bgColourSolid: '#C8102E', textColour: '#000000', iconColour: '#FFFFFF' },
    { id: 'team_13', name: 'Man City', logo: 'sailboat', bgColourFaint: 'rgba(108, 171, 221, 0.3)', bgColourSolid: '#6CABDD', textColour: '#00285E', iconColour: '#00285E' },
    { id: 'team_14', name: 'Man Utd', logo: 'hamburger', bgColourFaint: 'rgba(218, 41, 28, 0.3)', bgColourSolid: '#DA291C', textColour: '#FBE122', iconColour: '#FBE122' },
    { id: 'team_15', name: 'Newcastle', logo: 'castle', bgColourFaint: 'rgba(36, 31, 32, 0.3)', bgColourSolid: '#241F20', textColour: '#FFFFFF', iconColour: '#FFFFFF' },
    { id: 'team_16', name: "Nott'm Forest", logo: 'treeDeciduous', bgColourFaint: 'rgba(221, 0, 0, 0.3)', bgColourSolid: '#DD0000', textColour: '#FFFFFF', iconColour: '#FFFFFF' },
    { id: 'team_18', name: 'Tottenham', logo: 'ship', bgColourFaint: 'rgba(19, 34, 87, 0.3)', bgColourSolid: '#132257', textColour: '#FFFFFF', iconColour: '#FFFFFF' },
    { id: 'team_19', name: 'West Ham', logo: 'utensilsCrossed', bgColourFaint: 'rgba(122, 38, 58, 0.3)', bgColourSolid: '#7A263A', textColour: '#132257', iconColour: '#FBB117' },
    { id: 'team_20', name: 'Wolves', logo: 'gitlab', bgColourFaint: 'rgba(253, 185, 19, 0.3)', bgColourSolid: '#FDB913', textColour: '#231F20', iconColour: '#231F20' },
    { id: 'team_22', name: 'Burnley', logo: 'shield', bgColourFaint: 'rgba(108, 29, 69, 0.3)', bgColourSolid: '#6C1D45', textColour: '#99D6EA', iconColour: '#99D6EA' },
    { id: 'team_24', name: 'Leeds', logo: 'flower', bgColourFaint: 'rgba(255, 205, 0, 0.3)', bgColourSolid: '#FFCD00', textColour: '#1D428A', iconColour: '#1D428A' },
    { id: 'team_25', name: 'Sunderland', logo: 'database', bgColourFaint: 'rgba(235, 20, 30, 0.3)', bgColourSolid: '#EB141E', textColour: '#000000', iconColour: '#FFFFFF' },
];

export const previousSeasonStandings: PreviousSeasonStanding[] = [
    { teamId: 'team_12', rank: 1, points: 84, goalDifference: 45 },
    { teamId: 'team_1', rank: 2, points: 74, goalDifference: 35 },
    { teamId: 'team_13', rank: 3, points: 71, goalDifference: 28 },
    { teamId: 'team_6', rank: 4, points: 69, goalDifference: 21 },
    { teamId: 'team_15', rank: 5, points: 66, goalDifference: 21 },
    { teamId: 'team_2', rank: 6, points: 66, goalDifference: 7 },
    { teamId: 'team_16', rank: 7, points: 65, goalDifference: 12 },
    { teamId: 'team_5', rank: 8, points: 61, goalDifference: 7 },
    { teamId: 'team_3', rank: 9, points: 56, goalDifference: 12 },
    { teamId: 'team_4', rank: 10, points: 56, goalDifference: 9 },
    { teamId: 'team_9', rank: 11, points: 54, goalDifference: 0 },
    { teamId: 'team_7', rank: 12, points: 53, goalDifference: 0 },
    { teamId: 'team_8', rank: 13, points: 48, goalDifference: -2 },
    { teamId: 'team_19', rank: 14, points: 43, goalDifference: -16 },
    { teamId: 'team_14', rank: 15, points: 42, goalDifference: -10 },
    { teamId: 'team_20', rank: 16, points: 42, goalDifference: -15 },
    { teamId: 'team_18', rank: 17, points: 38, goalDifference: -1 },
    { teamId: 'team_11', rank: 18, points: 25, goalDifference: -47 }, // Leicester
    { teamId: 'team_21', rank: 19, points: 22, goalDifference: -46 }, // Ipswich
    { teamId: 'team_23', rank: 20, points: 12, goalDifference: -60 }, // Southampton
];

const seasonMonths: SeasonMonth[] = [
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

// --- DYNAMIC & DETERMINISTIC DATA GENERATION ---

const WEEKS_TO_SHOW = 18;

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
        return { teamId: team.id, predictedRank, tieBreaker: random() };
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
    // We need to construct a full 20-team list for the prediction generator.
    // Get the existing 17 teams from the provided standings.
    const existingTeamIds = new Set(previousSeasonStandings.map(s => s.teamId));
    const allTeamIds = new Set(teams.map(t => t.id));
    
    // Find the 3 teams that are in the main `teams` list but not in `previousSeasonStandings`.
    // These will be our "promoted" teams.
    const promotedTeams = teams.filter(t => !existingTeamIds.has(t.id));

    // Create a full 20-team base standing list.
    const fullBaseStandings: PreviousSeasonStanding[] = [
        ...previousSeasonStandings.filter(s => existingTeamIds.has(s.teamId)),
        // Add the promoted teams at the bottom.
        ...promotedTeams.map((team, i) => ({
            teamId: team.id,
            rank: 18 + i,
            points: 0, // Points/GD don't matter here, just rank.
            goalDifference: 0,
        }))
    ];

    return {
      userId: user.id,
      rankings: generateBiasedPrediction(fullBaseStandings, index + 1),
    };
});

const teamNameToIdMap = new Map(teams.map(t => [t.name.replace("'","’"), t.id]));
// Correcting "Notts Forest" to match the team name in the map
const correctedTeamNameToIdMap = new Map(teams.map(t => [t.name, t.id]));
correctedTeamNameToIdMap.set("Notts Forest", "team_16")

const realMatchData: { week: number; home: string; homeScore: number; away: string; awayScore: number; }[] = [
    { week: 1, home: 'Liverpool', homeScore: 4, away: 'Bournemouth', awayScore: 2 },
    { week: 1, home: 'Wolves', homeScore: 0, away: 'Man City', awayScore: 4 },
    { week: 1, home: 'Tottenham', homeScore: 3, away: 'Burnley', awayScore: 0 },
    { week: 1, home: 'Sunderland', homeScore: 3, away: 'West Ham', awayScore: 0 },
    { week: 1, home: 'Brighton', homeScore: 1, away: 'Fulham', awayScore: 1 },
    { week: 1, home: 'Aston Villa', homeScore: 0, away: 'Newcastle', awayScore: 0 },
    { week: 1, home: 'Man Utd', homeScore: 0, away: 'Arsenal', awayScore: 1 },
    { week: 1, home: 'Nott\'m Forest', homeScore: 3, away: 'Brentford', awayScore: 1 },
    { week: 1, home: 'Chelsea', homeScore: 0, away: 'Crystal Palace', awayScore: 0 },
    { week: 1, home: 'Leeds', homeScore: 1, away: 'Everton', awayScore: 0 },
    { week: 2, home: 'West Ham', homeScore: 1, away: 'Chelsea', awayScore: 5 },
    { week: 2, home: 'Arsenal', homeScore: 5, away: 'Leeds', awayScore: 0 },
    { week: 2, home: 'Burnley', homeScore: 2, away: 'Sunderland', awayScore: 0 },
    { week: 2, home: 'Brentford', homeScore: 1, away: 'Aston Villa', awayScore: 0 },
    { week: 2, home: 'Bournemouth', homeScore: 1, away: 'Wolves', awayScore: 0 },
    { week: 2, home: 'Man City', homeScore: 0, away: 'Tottenham', awayScore: 2 },
    { week: 2, home: 'Fulham', homeScore: 1, away: 'Man Utd', awayScore: 1 },
    { week: 2, home: 'Everton', homeScore: 2, away: 'Brighton', awayScore: 0 },
    { week: 2, home: 'Crystal Palace', homeScore: 1, away: 'Nott\'m Forest', awayScore: 1 },
    { week: 2, home: 'Newcastle', homeScore: 2, away: 'Liverpool', awayScore: 3 },
    { week: 3, home: 'Leeds', homeScore: 0, away: 'Newcastle', awayScore: 0 },
    { week: 3, home: 'Wolves', homeScore: 2, away: 'Everton', awayScore: 3 },
    { week: 3, home: 'Tottenham', homeScore: 0, away: 'Bournemouth', awayScore: 1 },
    { week: 3, home: 'Sunderland', homeScore: 2, away: 'Brentford', awayScore: 1 },
    { week: 3, home: 'Man Utd', homeScore: 3, away: 'Burnley', awayScore: 2 },
    { week: 3, home: 'Chelsea', homeScore: 2, away: 'Fulham', awayScore: 0 },
    { week: 3, home: 'Aston Villa', homeScore: 0, away: 'Crystal Palace', awayScore: 3 },
    { week: 3, home: 'Liverpool', homeScore: 1, away: 'Arsenal', awayScore: 0 },
    { week: 3, home: 'Nott\'m Forest', homeScore: 0, away: 'West Ham', awayScore: 3 },
    { week: 3, home: 'Brighton', homeScore: 2, away: 'Man City', awayScore: 1 },
    { week: 4, home: 'Brentford', homeScore: 2, away: 'Chelsea', awayScore: 2 },
    { week: 4, home: 'West Ham', homeScore: 0, away: 'Tottenham', awayScore: 3 },
    { week: 4, home: 'Newcastle', homeScore: 1, away: 'Wolves', awayScore: 0 },
    { week: 4, home: 'Fulham', homeScore: 1, away: 'Leeds', awayScore: 0 },
    { week: 4, home: 'Everton', homeScore: 0, away: 'Aston Villa', awayScore: 0 },
    { week: 4, home: 'Crystal Palace', homeScore: 0, away: 'Sunderland', awayScore: 0 },
    { week: 4, home: 'Bournemouth', homeScore: 2, away: 'Brighton', awayScore: 1 },
    { week: 4, home: 'Arsenal', homeScore: 3, away: 'Nott\'m Forest', awayScore: 0 },
    { week: 4, home: 'Man City', homeScore: 3, away: 'Man Utd', awayScore: 0 },
    { week: 4, home: 'Burnley', homeScore: 0, away: 'Liverpool', awayScore: 1 },
    { week: 5, home: 'Fulham', homeScore: 3, away: 'Brentford', awayScore: 1 },
    { week: 5, home: 'Man Utd', homeScore: 2, away: 'Chelsea', awayScore: 1 },
    { week: 5, home: 'Wolves', homeScore: 1, away: 'Leeds', awayScore: 3 },
    { week: 5, home: 'West Ham', homeScore: 1, away: 'Crystal Palace', awayScore: 2 },
    { week: 5, home: 'Burnley', homeScore: 1, away: 'Nott\'m Forest', awayScore: 1 },
    { week: 5, home: 'Brighton', homeScore: 2, away: 'Tottenham', awayScore: 2 },
    { week: 5, home: 'Liverpool', homeScore: 2, away: 'Everton', awayScore: 1 },
    { week: 5, home: 'Arsenal', homeScore: 1, away: 'Man City', awayScore: 1 },
    { week: 5, home: 'Sunderland', homeScore: 1, away: 'Aston Villa', awayScore: 1 },
    { week: 5, home: 'Bournemouth', homeScore: 0, away: 'Newcastle', awayScore: 0 },
    { week: 6, home: 'Tottenham', homeScore: 1, away: 'Wolves', awayScore: 1 },
    { week: 6, home: 'Nott\'m Forest', homeScore: 0, away: 'Sunderland', awayScore: 1 },
    { week: 6, home: 'Man City', homeScore: 5, away: 'Burnley', awayScore: 1 },
    { week: 6, home: 'Leeds', homeScore: 2, away: 'Bournemouth', awayScore: 2 },
    { week: 6, home: 'Crystal Palace', homeScore: 2, away: 'Liverpool', awayScore: 1 },
    { week: 6, home: 'Chelsea', homeScore: 1, away: 'Brighton', awayScore: 3 },
    { week: 6, home: 'Brentford', homeScore: 3, away: 'Man Utd', awayScore: 1 },
    { week: 6, home: 'Newcastle', homeScore: 1, away: 'Arsenal', awayScore: 2 },
    { week: 6, home: 'Aston Villa', homeScore: 3, away: 'Fulham', awayScore: 1 },
    { week: 6, home: 'Everton', homeScore: 1, away: 'West Ham', awayScore: 1 },
    { week: 7, home: 'Bournemouth', homeScore: 3, away: 'Fulham', awayScore: 1 },
    { week: 7, home: 'Chelsea', homeScore: 2, away: 'Liverpool', awayScore: 1 },
    { week: 7, home: 'Man Utd', homeScore: 2, away: 'Sunderland', awayScore: 0 },
    { week: 7, home: 'Arsenal', homeScore: 2, away: 'West Ham', awayScore: 0 },
    { week: 7, home: 'Leeds', homeScore: 1, away: 'Tottenham', awayScore: 2 },
    { week: 7, home: 'Brentford', homeScore: 0, away: 'Man City', awayScore: 1 },
    { week: 7, home: 'Wolves', homeScore: 1, away: 'Brighton', awayScore: 1 },
    { week: 7, home: 'Newcastle', homeScore: 2, away: 'Nott\'m Forest', awayScore: 0 },
    { week: 7, home: 'Everton', homeScore: 2, away: 'Crystal Palace', awayScore: 1 },
    { week: 7, home: 'Aston Villa', homeScore: 2, away: 'Burnley', awayScore: 1 },
    { week: 8, home: 'Fulham', homeScore: 0, away: 'Arsenal', awayScore: 1 },
    { week: 8, home: 'Sunderland', homeScore: 2, away: 'Wolves', awayScore: 0 },
    { week: 8, home: 'Man City', homeScore: 2, away: 'Everton', awayScore: 0 },
    { week: 8, home: 'Crystal Palace', homeScore: 3, away: 'Bournemouth', awayScore: 3 },
    { week: 8, home: 'Burnley', homeScore: 2, away: 'Leeds', awayScore: 0 },
    { week: 8, home: 'Brighton', homeScore: 2, away: 'Newcastle', awayScore: 1 },
    { week: 8, home: 'Nott\'m Forest', homeScore: 0, away: 'Chelsea', awayScore: 3 },
    { week: 8, home: 'Liverpool', homeScore: 1, away: 'Man Utd', awayScore: 2 },
    { week: 8, home: 'Tottenham', homeScore: 1, away: 'Aston Villa', awayScore: 2 },
    { week: 8, home: 'West Ham', homeScore: 0, away: 'Brentford', awayScore: 2 },
    { week: 9, home: 'Leeds', homeScore: 2, away: 'West Ham', awayScore: 1 },
    { week: 9, home: 'Brentford', homeScore: 3, away: 'Liverpool', awayScore: 2 },
    { week: 9, home: 'Man Utd', homeScore: 4, away: 'Brighton', awayScore: 2 },
    { week: 9, home: 'Newcastle', homeScore: 2, away: 'Fulham', awayScore: 1 },
    { week: 9, home: 'Chelsea', homeScore: 1, away: 'Sunderland', awayScore: 2 },
    { week: 9, home: 'Everton', homeScore: 0, away: 'Tottenham', awayScore: 3 },
    { week: 9, home: 'Wolves', homeScore: 2, away: 'Burnley', awayScore: 3 },
    { week: 9, home: 'Aston Villa', homeScore: 1, away: 'Man City', awayScore: 0 },
    { week: 9, home: 'Arsenal', homeScore: 1, away: 'Crystal Palace', awayScore: 0 },
    { week: 9, home: 'Bournemouth', homeScore: 2, away: 'Nott\'m Forest', awayScore: 0 },
    { week: 10, home: 'Liverpool', homeScore: 2, away: 'Aston Villa', awayScore: 0 },
    { week: 10, home: 'Tottenham', homeScore: 0, away: 'Chelsea', awayScore: 1 },
    { week: 10, home: 'Nott\'m Forest', homeScore: 2, away: 'Man Utd', awayScore: 2 },
    { week: 10, home: 'Fulham', homeScore: 3, away: 'Wolves', awayScore: 0 },
    { week: 10, home: 'Crystal Palace', homeScore: 2, away: 'Brentford', awayScore: 0 },
    { week: 10, home: 'Burnley', homeScore: 0, away: 'Arsenal', awayScore: 2 },
    { week: 10, home: 'Brighton', homeScore: 3, away: 'Leeds', awayScore: 0 },
    { week: 10, home: 'Man City', homeScore: 3, away: 'Bournemouth', awayScore: 1 },
    { week: 10, home: 'West Ham', homeScore: 3, away: 'Newcastle', awayScore: 1 },
    { week: 10, home: 'Sunderland', homeScore: 1, away: 'Everton', awayScore: 1 },
    { week: 11, home: 'Chelsea', homeScore: 3, away: 'Wolves', awayScore: 0 },
    { week: 11, home: 'Sunderland', homeScore: 2, away: 'Arsenal', awayScore: 2 },
    { week: 11, home: 'West Ham', homeScore: 3, away: 'Burnley', awayScore: 2 },
    { week: 11, home: 'Everton', homeScore: 2, away: 'Fulham', awayScore: 0 },
    { week: 11, home: 'Tottenham', homeScore: 2, away: 'Man Utd', awayScore: 2 },
    { week: 11, home: 'Man City', homeScore: 3, away: 'Liverpool', awayScore: 0 },
    { week: 11, home: 'Nott\'m Forest', homeScore: 3, away: 'Leeds', awayScore: 1 },
    { week: 11, home: 'Crystal Palace', homeScore: 0, away: 'Brighton', awayScore: 0 },
    { week: 11, home: 'Brentford', homeScore: 3, away: 'Newcastle', awayScore: 1 },
    { week: 11, home: 'Aston Villa', homeScore: 4, away: 'Bournemouth', awayScore: 0 },
    { week: 12, home: 'Newcastle', homeScore: 2, away: 'Man City', awayScore: 1 },
    { week: 12, home: 'Wolves', homeScore: 0, away: 'Crystal Palace', awayScore: 2 },
    { week: 12, home: 'Liverpool', homeScore: 0, away: 'Nott\'m Forest', awayScore: 3 },
    { week: 12, home: 'Fulham', homeScore: 1, away: 'Sunderland', awayScore: 0 },
    { week: 12, home: 'Brighton', homeScore: 2, away: 'Brentford', awayScore: 1 },
    { week: 12, home: 'Bournemouth', homeScore: 2, away: 'West Ham', awayScore: 2 },
    { week: 12, home: 'Burnley', homeScore: 0, away: 'Chelsea', awayScore: 2 },
    { week: 12, home: 'Arsenal', homeScore: 4, away: 'Tottenham', awayScore: 1 },
    { week: 12, home: 'Leeds', homeScore: 1, away: 'Aston Villa', awayScore: 2 },
    { week: 12, home: 'Man Utd', homeScore: 0, away: 'Everton', awayScore: 1 },
    { week: 13, home: 'Tottenham', homeScore: 1, away: 'Fulham', awayScore: 2 },
    { week: 13, home: 'Everton', homeScore: 1, away: 'Newcastle', awayScore: 4 },
    { week: 13, home: 'Sunderland', homeScore: 3, away: 'Bournemouth', awayScore: 2 },
    { week: 13, home: 'Man City', homeScore: 3, away: 'Leeds', awayScore: 2 },
    { week: 13, home: 'Brentford', homeScore: 3, away: 'Burnley', awayScore: 1 },
    { week: 13, home: 'Chelsea', homeScore: 1, away: 'Arsenal', awayScore: 1 },
    { week: 13, home: 'West Ham', homeScore: 0, away: 'Liverpool', awayScore: 2 },
    { week: 13, home: 'Nott\'m Forest', homeScore: 0, away: 'Brighton', awayScore: 2 },
    { week: 13, home: 'Aston Villa', homeScore: 1, away: 'Wolves', awayScore: 0 },
    { week: 13, home: 'Crystal Palace', homeScore: 1, away: 'Man Utd', awayScore: 2 },
    { week: 14, home: 'Newcastle', homeScore: 2, away: 'Tottenham', awayScore: 2 },
    { week: 14, home: 'Fulham', homeScore: 4, away: 'Man City', awayScore: 5 },
    { week: 14, home: 'Bournemouth', homeScore: 0, away: 'Everton', awayScore: 1 },
    { week: 14, home: 'Liverpool', homeScore: 1, away: 'Sunderland', awayScore: 1 },
    { week: 14, home: 'Leeds', homeScore: 3, away: 'Chelsea', awayScore: 1 },
    { week: 14, home: 'Wolves', homeScore: 0, away: 'Nott\'m Forest', awayScore: 1 },
    { week: 14, home: 'Burnley', homeScore: 0, away: 'Crystal Palace', awayScore: 1 },
    { week: 14, home: 'Brighton', homeScore: 3, away: 'Aston Villa', awayScore: 4 },
    { week: 14, home: 'Arsenal', homeScore: 2, away: 'Brentford', awayScore: 0 },
    { week: 14, home: 'Man Utd', homeScore: 1, away: 'West Ham', awayScore: 1 },
    { week: 15, home: 'Leeds', homeScore: 3, away: 'Liverpool', awayScore: 3 },
    { week: 15, home: 'Tottenham', homeScore: 2, away: 'Brentford', awayScore: 0 },
    { week: 15, home: 'Newcastle', homeScore: 2, away: 'Burnley', awayScore: 1 },
    { week: 15, home: 'Man City', homeScore: 3, away: 'Sunderland', awayScore: 0 },
    { week: 15, home: 'Everton', homeScore: 3, away: 'Nott\'m Forest', awayScore: 0 },
    { week: 15, home: 'Bournemouth', homeScore: 0, away: 'Chelsea', awayScore: 0 },
    { week: 15, home: 'Aston Villa', homeScore: 2, away: 'Arsenal', awayScore: 1 },
    { week: 15, home: 'Fulham', homeScore: 1, away: 'Crystal Palace', awayScore: 2 },
    { week: 15, home: 'Brighton', homeScore: 1, away: 'West Ham', awayScore: 1 },
    { week: 15, home: 'Wolves', homeScore: 1, away: 'Man Utd', awayScore: 4 },
    { week: 16, home: 'Arsenal', homeScore: 2, away: 'Wolves', awayScore: 1 },
    { week: 16, home: 'Burnley', homeScore: 2, away: 'Fulham', awayScore: 3 },
    { week: 16, home: 'Liverpool', homeScore: 2, away: 'Brighton', awayScore: 0 },
    { week: 16, home: 'Chelsea', homeScore: 2, away: 'Everton', awayScore: 0 },
    { week: 16, home: 'Brentford', homeScore: 1, away: 'Leeds', awayScore: 1 },
    { week: 16, home: 'West Ham', homeScore: 2, away: 'Aston Villa', awayScore: 3 },
    { week: 16, home: 'Sunderland', homeScore: 1, away: 'Newcastle', awayScore: 0 },
    { week: 16, home: 'Nott\'m Forest', homeScore: 3, away: 'Tottenham', awayScore: 0 },
    { week: 16, home: 'Crystal Palace', homeScore: 0, away: 'Man City', awayScore: 3 },
    { week: 16, home: 'Man Utd', homeScore: 4, away: 'Bournemouth', awayScore: 4 },
    { week: 17, home: 'Leeds', homeScore: 4, away: 'Crystal Palace', awayScore: 1 },
    { week: 17, home: 'Everton', homeScore: 0, away: 'Arsenal', awayScore: 1 },
    { week: 17, home: 'Tottenham', homeScore: 1, away: 'Liverpool', awayScore: 2 },
    { week: 17, home: 'Wolves', homeScore: 0, away: 'Brentford', awayScore: 2 },
    { week: 17, home: 'Man City', homeScore: 3, away: 'West Ham', awayScore: 0 },
    { week: 17, home: 'Brighton', homeScore: 0, away: 'Sunderland', awayScore: 0 },
    { week: 17, home: 'Bournemouth', homeScore: 1, away: 'Burnley', awayScore: 1 },
    { week: 17, home: 'Newcastle', homeScore: 2, away: 'Chelsea', awayScore: 2 },
    { week: 17, home: 'Aston Villa', homeScore: 2, away: 'Man Utd', awayScore: 1 },
    { week: 17, home: 'Fulham', homeScore: 1, away: 'Nott\'m Forest', awayScore: 0 },
    { week: 18, home: 'Man Utd', homeScore: 1, away: 'Newcastle', awayScore: 0 },
    { week: 18, home: 'Chelsea', homeScore: 1, away: 'Aston Villa', awayScore: 2 },
    { week: 18, home: 'West Ham', homeScore: 0, away: 'Fulham', awayScore: 1 },
    { week: 18, home: 'Liverpool', homeScore: 2, away: 'Wolves', awayScore: 1 },
    { week: 18, home: 'Burnley', homeScore: 0, away: 'Everton', awayScore: 0 },
    { week: 18, home: 'Brentford', homeScore: 4, away: 'Bournemouth', awayScore: 1 },
    { week: 18, home: 'Arsenal', homeScore: 2, away: 'Brighton', awayScore: 1 },
    { week: 18, home: 'Nott\'m Forest', homeScore: 1, away: 'Man City', awayScore: 2 },
    { week: 18, home: 'Crystal Palace', homeScore: 0, away: 'Tottenham', awayScore: 1 },
    { week: 18, home: 'Sunderland', homeScore: 1, away: 'Leeds', awayScore: 1 },
];

const calculateStandings = (matchesToProcess: Match[]): CurrentStanding[] => {
    const standingsMap: Map<string, Omit<CurrentStanding, 'rank' | 'teamId'>> = new Map();

    const teamIdsForStandings = new Set(matchesToProcess.flatMap(m => [m.homeTeamId, m.awayTeamId]));
    
    teams.forEach(team => {
        if (teamIdsForStandings.has(team.id)) {
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

const allMatches: Match[] = realMatchData.map(m => {
    const homeTeamId = correctedTeamNameToIdMap.get(m.home.replace("Nott'm Forest", "Nott'm Forest"));
    const awayTeamId = correctedTeamNameToIdMap.get(m.away.replace("Nott'm Forest", "Nott'm Forest"));
    if (!homeTeamId || !awayTeamId) {
        console.error(`Could not find team ID for match: ${m.home} vs ${m.away}`);
        return null;
    }
    return {...m, homeTeamId, awayTeamId};
}).filter((m): m is Match => m !== null);


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
        if (actualRank !== undefined) {
            score = 5 - Math.abs(predictedRank - actualRank);
        }
        return { userId: user.id, teamId, score };
    });
});

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
              isPro: user.isPro,
              tieBreaker: parseInt(user.id.replace('usr_', ''))
          }
      })
      .sort((a, b) => b.score - a.score || a.tieBreaker - b.tieBreaker);

    let currentRank = 1;
    let rankCounter = 1;
    weeklyPlayerStandings.forEach((player, index) => {
        if (!player.isPro) {
            if (index > 0 && player.score < weeklyPlayerStandings[index - 1].score) {
                currentRank = rankCounter;
            }
            const userHistory = userHistories.find(h => h.userId === player.userId)!;
            const weekData = userHistory.weeklyScores.find(w => w.week === week)!;
            weekData.rank = currentRank;
            rankCounter++;
        }
    });

    // Assign ranks to pro players separately without affecting non-pro ranks
    weeklyPlayerStandings.forEach((player, index) => {
        if(player.isPro) {
            const userHistory = userHistories.find(h => h.userId === player.userId)!;
            const weekData = userHistory.weeklyScores.find(w => w.week === week)!;
            weekData.rank = index + 1;
        }
    })
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


export const weeklyTeamStandings: WeeklyTeamStanding[] = Array.from(new Set(allMatches.flatMap(m => [m.homeTeamId, m.awayTeamId]))).flatMap(teamId => {
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

// --- DYNAMICALLY GENERATE MIMO AWARDS ---
const monthWeekRanges: { [key: string]: { start: number; end: number; year: number, special?: string } } = {
    'August': { start: 1, end: 3, year: 2025 },
    'September': { start: 4, end: 7, year: 2025 },
    'October': { start: 8, end: 11, year: 2025 },
    'November': { start: 12, end: 15, year: 2025 },
    'December': { start: 16, end: 20, year: 2025 },
    'Christmas No. 1': { start: 16, end: 19, year: 2025, special: 'Christmas No. 1' }, // Christmas is around week 19
    'January': { start: 21, end: 24, year: 2026 },
    'February': { start: 25, end: 28, year: 2026 },
    'March': { start: 29, end: 32, year: 2026 },
    'April': { start: 33, end: 36, year: 2026 },
    'May': { start: 37, end: 38, year: 2026 },
};

let monthlyMimoM: MonthlyMimoM[] = [];
let mimoIdCounter = 1;

for (const monthOrSpecial in monthWeekRanges) {
    const { start, end, year, special } = monthWeekRanges[monthOrSpecial];
    const startWeekForCalc = start - 1;

    if (WEEKS_TO_SHOW >= end) {
        const monthlyRankChanges = usersData
            .filter(u => !u.isPro)
            .map(user => {
                const userHistory = userHistories.find(h => h.userId === user.id);
                if (!userHistory) return { userId: user.id, rankChange: -Infinity };

                const startRank = userHistory.weeklyScores.find(ws => ws.week === startWeekForCalc)?.rank || 0;
                const endRank = userHistory.weeklyScores.find(ws => ws.week === end)?.rank || 0;

                const rankChange = (startRank > 0 && endRank > 0) ? startRank - endRank : -Infinity;
                return { userId: user.id, rankChange };
            })
            .sort((a, b) => b.rankChange - a.rankChange);

        if (monthlyRankChanges.length > 0 && monthlyRankChanges[0].rankChange > -Infinity) {
            const bestRankChange = monthlyRankChanges[0].rankChange;
            const winners = monthlyRankChanges.filter(u => u.rankChange === bestRankChange);

            winners.forEach(winner => {
                monthlyMimoM.push({ id: `mimo_${mimoIdCounter++}`, month: monthOrSpecial, year, userId: winner.userId, type: 'winner', special });
            });

            // Only award runner-up if it's NOT a special award and there wasn't a tie for first place
            if (!special && winners.length === 1) {
                const nextBestChange = monthlyRankChanges.find(u => u.rankChange < bestRankChange);
                if (nextBestChange && nextBestChange.rankChange > -Infinity) {
                    const runnersUp = monthlyRankChanges.filter(u => u.rankChange === nextBestChange.rankChange);
                    runnersUp.forEach(runnerUp => {
                        monthlyMimoM.push({ id: `mimo_${mimoIdCounter++}`, month: monthOrSpecial, year, userId: runnerUp.userId, type: 'runner-up', special });
                    });
                }
            }
        }
    }
}

export {
    seasonMonths,
    monthlyMimoM
};
