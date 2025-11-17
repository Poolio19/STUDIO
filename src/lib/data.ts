
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
};

export type Team = {
  id: string;
  name: string;
  logo: string;
};

export type Prediction = {
  userId: string;
  rankings: string[]; // Array of team IDs in predicted order
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

export type MonthlyMimoM = {
  month: string;
  year: number;
  userId: string;
  special?: string;
  type: 'winner' | 'runner-up';
};

export type SeasonMonth = {
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
    { id: 'usr_11', name: 'James', avatar: '11' },
    { id: 'usr_12', name: 'Amelia', avatar: '12' },
    { id: 'usr_13', name: 'Benjamin', avatar: '13' },
    { id: 'usr_14', name: 'Mia', avatar: '14' },
    { id: 'usr_15', name: 'Elijah', avatar: '15' },
    { id: 'usr_16', name: 'Harper', avatar: '16' },
    { id: 'usr_17', name: 'Lucas', avatar: '17' },
    { id: 'usr_18', name: 'Evelyn', avatar: '18' },
    { id: 'usr_19', name: 'Henry', avatar: '19' },
    { id: 'usr_20', name: 'Abigail', avatar: '20' },
    { id: 'usr_21', name: 'Alexander', avatar: '21' },
    { id: 'usr_22', name: 'Emily', avatar: '22' },
    { id: 'usr_23', name: 'Daniel', avatar: '23' },
    { id: 'usr_24', name: 'Elizabeth', avatar: '24' },
    { id: 'usr_25', name: 'Michael', avatar: '25' },
    { id: 'usr_26', name: 'Sofia', avatar: '26' },
    { id: 'usr_27', name: 'Matthew', avatar: '27' },
    { id: 'usr_28', name: 'Avery', avatar: '28' },
    { id: 'usr_29', name: 'Joseph', avatar: '29' },
    { id: 'usr_30', name: 'Scarlett', avatar: '30' },
    { id: 'usr_31', name: 'William', avatar: '31' },
    { id: 'usr_32', name: 'Grace', avatar: '32' },
    { id: 'usr_33', name: 'Owen', avatar: '33' },
    { id: 'usr_34', name: 'Zoe', avatar: '34' },
    { id: 'usr_35', name: 'Nathan', avatar: '35' },
    { id: 'usr_36', name: 'Lily', avatar: '36' },
    { id: 'usr_37', name: 'Ryan', avatar: '37' },
    { id: 'usr_38', name: 'Hannah', avatar: '38' },
    { id: 'usr_39', name: 'Caleb', avatar: '39' },
    { id: 'usr_40', name: 'Nora', avatar: '40' },
    { id: 'usr_41', name: 'Isaac', avatar: '41' },
    { id: 'usr_42', name: 'Addison', avatar: '42' },
    { id: 'usr_43', name: 'Levi', avatar: '43' },
    { id: 'usr_44', name: 'Stella', avatar: '44' },
    { id: 'usr_45', name: 'Samuel', avatar: '45' },
    { id: 'usr_46', name: 'Natalie', avatar: '46' },
    { id: 'usr_47', name: 'BBC', avatar: '47', isPro: true },
    { id: 'usr_48', name: 'SKY', avatar: '48', isPro: true },
    { id: 'usr_49', name: 'OPTA', avatar: '49', isPro: true },
];

export const teams: Team[] = [
    { id: 'team_1', name: 'Arsenal', logo: 'rocket' },
    { id: 'team_2', name: 'Aston Villa', logo: 'orbit' },
    { id: 'team_3', name: 'Bournemouth', logo: 'waves' },
    { id: 'team_4', name: 'Brentford', logo: 'atom' },
    { id: 'team_5', name: 'Brighton', logo: 'zap' },
    { id: 'team_6', name: 'Chelsea', logo: 'anchor' },
    { id: 'team_7', name: 'Crystal Palace', logo: 'atom' },
    { id: 'team_8', name: 'Everton', logo: 'rocket' },
    { id: 'team_9', name: 'Fulham', logo: 'orbit' },
    { id: 'team_10', name: 'Ipswich Town', logo: 'waves' },
    { id: 'team_11', name: 'Leicester City', logo: 'zap' },
    { id: 'team_12', name: 'Liverpool', logo: 'anchor' },
    { id: 'team_13', name: 'Man City', logo: 'atom' },
    { id: 'team_14', name: 'Man Utd', logo: 'rocket' },
    { id: 'team_15', 'name': 'Newcastle United', logo: 'orbit' },
    { id: 'team_16', name: 'Notts Forest', logo: 'waves' },
    { id: 'team_17', name: 'Southampton', logo: 'zap' },
    { id: 'team_18', name: 'Tottenham', logo: 'anchor' },
    { id: 'team_19', name: 'West Ham', logo: 'atom' },
    { id: 'team_20', name: 'Wolves', logo: 'rocket' },
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
    { teamId: 'team_11', rank: 18, points: 31, goalDifference: -20 },
    { teamId: 'team_10', rank: 19, points: 26, goalDifference: -35 },
    { teamId: 'team_17', rank: 20, points: 25, goalDifference: -37 },
];

export const currentStandings: CurrentStanding[] = [
    { teamId: 'team_13', rank: 1, points: 15, goalDifference: 10, gamesPlayed: 5, wins: 5, draws: 0, losses: 0, goalsFor: 12, goalsAgainst: 2 },
    { teamId: 'team_1', rank: 2, points: 13, goalDifference: 8, gamesPlayed: 5, wins: 4, draws: 1, losses: 0, goalsFor: 11, goalsAgainst: 3 },
    { teamId: 'team_12', rank: 3, points: 11, goalDifference: 6, gamesPlayed: 5, wins: 3, draws: 2, losses: 0, goalsFor: 10, goalsAgainst: 4 },
    { teamId: 'team_18', rank: 4, points: 10, goalDifference: 5, gamesPlayed: 5, wins: 3, draws: 1, losses: 1, goalsFor: 9, goalsAgainst: 4 },
    { teamId: 'team_2', rank: 5, points: 9, goalDifference: 3, gamesPlayed: 5, wins: 3, draws: 0, losses: 2, goalsFor: 8, goalsAgainst: 5 },
    { teamId: 'team_6', rank: 6, points: 8, goalDifference: 2, gamesPlayed: 5, wins: 2, draws: 2, losses: 1, goalsFor: 7, goalsAgainst: 5 },
    { teamId: 'team_19', rank: 7, points: 8, goalDifference: 1, gamesPlayed: 5, wins: 2, draws: 2, losses: 1, goalsFor: 6, goalsAgainst: 5 },
    { teamId: 'team_14', rank: 8, points: 7, goalDifference: 0, gamesPlayed: 5, wins: 2, draws: 1, losses: 2, goalsFor: 5, goalsAgainst: 5 },
    { teamId: 'team_5', rank: 9, points: 7, goalDifference: 0, gamesPlayed: 5, wins: 2, draws: 1, losses: 2, goalsFor: 6, goalsAgainst: 6 },
    { teamId: 'team_15', rank: 10, points: 6, goalDifference: -1, gamesPlayed: 5, wins: 1, draws: 3, losses: 1, goalsFor: 5, goalsAgainst: 6 },
    { teamId: 'team_7', rank: 11, points: 5, goalDifference: -2, gamesPlayed: 5, wins: 1, draws: 2, losses: 2, goalsFor: 4, goalsAgainst: 6 },
    { teamId: 'team_20', rank: 12, points: 5, goalDifference: -2, gamesPlayed: 5, wins: 1, draws: 2, losses: 2, goalsFor: 5, goalsAgainst: 7 },
    { teamId: 'team_3', rank: 13, points: 5, goalDifference: -3, gamesPlayed: 5, wins: 1, draws: 2, losses: 2, goalsFor: 4, goalsAgainst: 7 },
    { teamId: 'team_9', rank: 14, points: 4, goalDifference: -4, gamesPlayed: 5, wins: 1, draws: 1, losses: 3, goalsFor: 3, goalsAgainst: 7 },
    { teamId: 'team_4', rank: 15, points: 4, goalDifference: -4, gamesPlayed: 5, wins: 1, draws: 1, losses: 3, goalsFor: 4, goalsAgainst: 8 },
    { teamId: 'team_8', rank: 16, points: 3, goalDifference: -5, gamesPlayed: 5, wins: 0, draws: 3, losses: 2, goalsFor: 2, goalsAgainst: 7 },
    { teamId: 'team_16', rank: 17, points: 2, goalDifference: -6, gamesPlayed: 5, wins: 0, draws: 2, losses: 3, goalsFor: 3, goalsAgainst: 9 },
    { teamId: 'team_17', rank: 18, points: 2, goalDifference: -7, gamesPlayed: 5, wins: 0, draws: 2, losses: 3, goalsFor: 2, goalsAgainst: 9 },
    { teamId: 'team_11', rank: 19, points: 1, goalDifference: -8, gamesPlayed: 5, wins: 0, draws: 1, losses: 4, goalsFor: 1, goalsAgainst: 9 },
    { teamId: 'team_10', rank: 20, points: 0, goalDifference: -10, gamesPlayed: 5, wins: 0, draws: 0, losses: 5, goalsFor: 0, goalsAgainst: 10 },
];

export const seasonMonths: SeasonMonth[] = [
    { month: 'August', year: 2025, abbreviation: 'AUG' },
    { month: 'September', year: 2025, abbreviation: 'SEPT' },
    { month: 'October', year: 2025, abbreviation: 'OCT' },
    { month: 'November', year: 2025, abbreviation: 'NOV' },
    { month: 'December', year: 2025, abbreviation: 'DEC' },
    { month: 'December', year: 2025, special: 'Christmas No. 1', abbreviation: 'XMAS' },
    { month: 'January', year: 2026, abbreviation: 'JAN' },
    { month: 'February', year: 2026, abbreviation: 'FEB' },
    { month: 'March', year: 2026, abbreviation: 'MAR' },
    { month: 'April', year: 2026, abbreviation: 'APR' },
    { month: 'May', year: 2026, abbreviation: 'MAY' },
];

export const monthlyMimoM: MonthlyMimoM[] = [
    { month: 'August', year: 2025, userId: 'usr_12', type: 'winner' },
    { month: 'August', year: 2025, userId: 'usr_22', type: 'runner-up' },
];

// --- DYNAMIC & DETERMINISTIC DATA GENERATION ---

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
    
    let perturbedStandings = standings.map(team => {
        const originalRank = team.rank;
        
        // This generates a random number from a distribution that approximates a bell curve (mean 0).
        // Summing two random numbers creates a triangular distribution, a good approximation of a bell curve.
        const bellCurveRandom = (random() + random()) - 1;

        let maxPerturbation: number;
        let pessimism = 0;

        if (originalRank <= 4) { // Top 4
            maxPerturbation = 2; // Very tight predictions
        } else if (originalRank <= 10) { // 5th to 10th
            maxPerturbation = 4; // Slightly more variance
        } else { // 11th to 20th
            maxPerturbation = 7; // More variance
            // Introduce a pessimistic bias: a positive value makes it more likely the shift is positive (a worse rank).
            pessimism = 0.35; 
        }
        
        // The final shift is the bell curve value plus the pessimism bias, scaled by the max perturbation.
        // A positive shift means a worse predicted rank (e.g., rank 15 -> 17)
        // A negative shift means a better predicted rank (e.g., rank 15 -> 13)
        const perturbation = Math.round((bellCurveRandom + pessimism) * maxPerturbation);
        let predictedRank = originalRank + perturbation;

        // Clamp to be within 1-20
        predictedRank = Math.max(1, Math.min(20, predictedRank));

        return {
            teamId: team.teamId,
            originalRank: team.rank,
            predictedRank: predictedRank,
            // Add a random tie-breaker for sorting
            tieBreaker: random(),
        };
    });

    // Sort by the new predicted rank to handle collisions, using tie-breaker if needed
    perturbedStandings.sort((a, b) => a.predictedRank - b.predictedRank || a.tieBreaker - b.tieBreaker);
    
    // This array will hold the final, de-duplicated ranking.
    const finalTeamIds = new Array(20).fill(null);
    const assignedRanks = new Set<number>();

    // First pass: assign teams to their desired rank if it's available.
    perturbedStandings.forEach(p => {
        if (!assignedRanks.has(p.predictedRank)) {
            finalTeamIds[p.predictedRank - 1] = p.teamId;
            assignedRanks.add(p.predictedRank);
        }
    });
    
    // Get a list of teams that couldn't be placed in the first pass.
    const unplacedTeams = perturbedStandings.filter(p => !finalTeamIds.includes(p.teamId));

    // Second pass: fill in the gaps with the unplaced teams.
    for (let i = 0; i < 20 && unplacedTeams.length > 0; i++) {
        if (finalTeamIds[i] === null) {
            finalTeamIds[i] = unplacedTeams.shift()!.teamId;
        }
    }

    return finalTeamIds;
};

export const predictions: Prediction[] = usersData.map((user, index) => {
    return {
      userId: user.id,
      rankings: generateBiasedPrediction(previousSeasonStandings, index + 1),
    };
});

const generateScoresForUser = (userId: string, userPredictions: string[]): PlayerTeamScore[] => {
    const actualRanks = new Map<string, number>();
    currentStandings.forEach(s => actualRanks.set(s.teamId, s.rank));
    
    return userPredictions.map((teamId, index) => {
        const predictedRank = index + 1;
        const actualRank = actualRanks.get(teamId) || 0;
        const score = 5 - Math.abs(predictedRank - actualRank);
        return {
            userId: userId,
            teamId: teamId,
            score: score,
        };
    });
};

export const playerTeamScores: PlayerTeamScore[] = usersData.flatMap(user => {
    const userPrediction = predictions.find(p => p.userId === user.id);
    return generateScoresForUser(user.id, userPrediction?.rankings || []);
});


const NUM_WEEKS = 5;

const previousSeasonPlayerRanks: {[key: string]: number} = {};
[...usersData].sort((a,b) => (parseInt(a.id.replace('usr_','')) % 5) - (parseInt(b.id.replace('usr_','')) % 5))
  .forEach((user, index) => {
    previousSeasonPlayerRanks[user.id] = index + 1;
  });

const userHistories: UserHistory[] = usersData.map(user => {
    let weeklyScores: WeeklyScore[] = [];
    weeklyScores.push({ week: 0, score: 0, rank: previousSeasonPlayerRanks[user.id] });

    let lastScore = 0;
    
    let seed = parseInt(user.id.replace('usr_', ''), 10);
    // Specific seed manipulation to achieve the desired outcome dynamically
    if (user.id === 'usr_38') { // Hannah
      seed += 50; 
    }
    if (user.id === 'usr_42') { // Addison
      seed += 40; 
    }

    const random = mulberry32(seed * 42); 

    const finalScore = playerTeamScores
                .filter(s => s.userId === user.id)
                .reduce((sum, current) => sum + current.score, 0);

    const weeklyIncrements = Array.from({length: NUM_WEEKS}, () => random());
    const totalIncrements = weeklyIncrements.reduce((a, b) => a + b, 0);
    const scaleFactor = totalIncrements > 0 ? (finalScore - 0) / totalIncrements : 0;


    for (let week = 1; week <= NUM_WEEKS; week++) {
        if (week === NUM_WEEKS) {
            weeklyScores.push({ week, score: finalScore, rank: 0 }); 
        } else {
            const score_increment = weeklyIncrements[week-1] * scaleFactor;
            const currentScore = Math.round(lastScore + score_increment);
            weeklyScores.push({ week, score: currentScore, rank: 0 }); 
            lastScore = currentScore;
        }
    }
    return { userId: user.id, weeklyScores };
});

for (let week = 1; week <= NUM_WEEKS; week++) {
    const weeklyStandings = userHistories
      .map(h => ({
          userId: h.userId,
          score: h.weeklyScores.find(w => w.week === week)!.score
      }))
      .sort((a, b) => b.score - a.score);

    let currentRank = 1;
    for (let i = 0; i < weeklyStandings.length; i++) {
        if (i > 0 && weeklyStandings[i].score < weeklyStandings[i-1].score) {
            currentRank = i + 1;
        }
        const userHistory = userHistories.find(h => h.userId === weeklyStandings[i].userId)!;
        const weekData = userHistory.weeklyScores.find(w => w.week === week)!;
        weekData.rank = currentRank;
    }
}

const finalUsers: User[] = usersData.map(userStub => {
    const history = userHistories.find(h => h.userId === userStub.id)!;
    
    const currentWeekData = history.weeklyScores.find(w => w.week === NUM_WEEKS)!;
    
    const previousWeekNumber = NUM_WEEKS > 1 ? NUM_WEEKS - 1 : 0;
    const previousWeekData = history.weeklyScores.find(w => w.week === previousWeekNumber)!;
        
    const previousRank = previousWeekData.rank;
    const previousScore = previousWeekData.score;

    const rankChange = previousRank - currentWeekData.rank;
    const scoreChange = currentWeekData.score - previousScore;

    const seasonWeeklyScores = history.weeklyScores.filter(w => w.week > 0);
    
    const allScores = seasonWeeklyScores.map(w => w.score);
    const allRanks = seasonWeeklyScores.map(w => w.rank).filter(r => r > 0);
    
    const maxScore = Math.max(...allScores);
    const minScore = Math.min(...allScores);
    const maxRank = Math.min(...allRanks);
    const minRank = Math.max(...allRanks);
    
    return {
        ...userStub,
        score: currentWeekData.score,
        rank: currentWeekData.rank, 
        previousRank: previousRank,
        previousScore: previousScore,
        rankChange,
        scoreChange,
        maxScore,
        minScore,
        maxRank,
        minRank,
    };
});

export const users: User[] = finalUsers.sort((a, b) => a.rank - b.rank);
