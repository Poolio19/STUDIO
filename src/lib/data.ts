
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
};

export type MonthlyMimoM = {
  month: string;
  year: number;
  userId: string;
};

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
    { teamId: 'team_13', rank: 1, points: 15, goalDifference: 10, gamesPlayed: 5, wins: 5, draws: 0, losses: 0 },
    { teamId: 'team_1', rank: 2, points: 13, goalDifference: 8, gamesPlayed: 5, wins: 4, draws: 1, losses: 0 },
    { teamId: 'team_12', rank: 3, points: 11, goalDifference: 6, gamesPlayed: 5, wins: 3, draws: 2, losses: 0 },
    { teamId: 'team_18', rank: 4, points: 10, goalDifference: 5, gamesPlayed: 5, wins: 3, draws: 1, losses: 1 },
    { teamId: 'team_2', rank: 5, points: 9, goalDifference: 3, gamesPlayed: 5, wins: 3, draws: 0, losses: 2 },
    { teamId: 'team_6', rank: 6, points: 8, goalDifference: 2, gamesPlayed: 5, wins: 2, draws: 2, losses: 1 },
    { teamId: 'team_19', rank: 7, points: 8, goalDifference: 1, gamesPlayed: 5, wins: 2, draws: 2, losses: 1 },
    { teamId: 'team_14', rank: 8, points: 7, goalDifference: 0, gamesPlayed: 5, wins: 2, draws: 1, losses: 2 },
    { teamId: 'team_5', rank: 9, points: 7, goalDifference: 0, gamesPlayed: 5, wins: 2, draws: 1, losses: 2 },
    { teamId: 'team_15', rank: 10, points: 6, goalDifference: -1, gamesPlayed: 5, wins: 1, draws: 3, losses: 1 },
    { teamId: 'team_7', rank: 11, points: 5, goalDifference: -2, gamesPlayed: 5, wins: 1, draws: 2, losses: 2 },
    { teamId: 'team_20', rank: 12, points: 5, goalDifference: -2, gamesPlayed: 5, wins: 1, draws: 2, losses: 2 },
    { teamId: 'team_3', rank: 13, points: 5, goalDifference: -3, gamesPlayed: 5, wins: 1, draws: 2, losses: 2 },
    { teamId: 'team_9', rank: 14, points: 4, goalDifference: -4, gamesPlayed: 5, wins: 1, draws: 1, losses: 3 },
    { teamId: 'team_4', rank: 15, points: 4, goalDifference: -4, gamesPlayed: 5, wins: 1, draws: 1, losses: 3 },
    { teamId: 'team_8', rank: 16, points: 3, goalDifference: -5, gamesPlayed: 5, wins: 0, draws: 3, losses: 2 },
    { teamId: 'team_16', rank: 17, points: 2, goalDifference: -6, gamesPlayed: 5, wins: 0, draws: 2, losses: 3 },
    { teamId: 'team_17', rank: 18, points: 2, goalDifference: -7, gamesPlayed: 5, wins: 0, draws: 2, losses: 3 },
    { teamId: 'team_11', rank: 19, points: 1, goalDifference: -8, gamesPlayed: 5, wins: 0, draws: 1, losses: 4 },
    { teamId: 'team_10', rank: 20, points: 0, goalDifference: -10, gamesPlayed: 5, wins: 0, draws: 0, losses: 5 },
];

export const monthlyMimoM: MonthlyMimoM[] = [
    { month: 'January', year: 2024, userId: 'usr_5' },
    { month: 'February', year: 2024, userId: 'usr_8' },
    { month: 'March', year: 2024, userId: 'usr_13' },
    { month: 'April', year: 2024, userId: 'usr_2' },
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
        
        // This generates a random number from a distribution that approximates a bell curve (mean 0, std dev ~1/3).
        // By adding two randoms and subtracting 1, we get a range of -1 to 1 with values clustering around 0.
        const bellCurveRandom = (random() + random()) - 1;

        let maxPerturbation: number;
        let pessimisticBias = 0;

        if (originalRank <= 4) { // Top 4
            maxPerturbation = 2;
        } else if (originalRank <= 10) { // 5th to 10th
            maxPerturbation = 4;
        } else { // 11th to 20th
            maxPerturbation = 6;
            // Introduce a pessimistic bias: makes the random shift more likely to be positive (i.e., a worse rank).
            pessimisticBias = 0.2; 
        }
        
        const perturbation = Math.round((bellCurveRandom + pessimisticBias) * maxPerturbation);
        let predictedRank = originalRank + perturbation;

        // Clamp to be within 1-20
        predictedRank = Math.max(1, Math.min(20, predictedRank));

        return {
            teamId: team.teamId,
            originalRank: team.rank,
            predictedRank: predictedRank,
            // Add a random tie-breaker
            tieBreaker: random(),
        };
    });

    // Sort by the new predicted rank to handle collisions
    perturbedStandings.sort((a, b) => a.predictedRank - b.predictedRank || a.tieBreaker - b.tieBreaker);
    
    // Resolve duplicate predictedRanks by assigning unique ranks
    const finalTeamIds = Array(20);
    const usedRanks = new Set<number>();
    
    perturbedStandings.forEach(p => {
        let desiredRank = p.predictedRank;
        while (usedRanks.has(desiredRank) && desiredRank <= 20) {
            desiredRank++;
        }
        if (desiredRank > 20) {
             desiredRank = p.predictedRank;
             while (usedRanks.has(desiredRank) && desiredRank >= 1) {
                desiredRank--;
            }
        }
        if (usedRanks.has(desiredRank)) {
             for (let i = 1; i <= 20; i++) {
                if (!usedRanks.has(i)) {
                    desiredRank = i;
                    break;
                }
             }
        }
        finalTeamIds[desiredRank - 1] = p.teamId;
        usedRanks.add(desiredRank);
    });

    const allTeamIds = standings.map(s => s.teamId);
    const rankedTeamIds = new Set(finalTeamIds.filter(Boolean));
    const unrankedTeams = allTeamIds.filter(id => !rankedTeamIds.has(id));
    
    let unrankedIdx = 0;
    for (let i = 0; i < 20 && unrankedIdx < unrankedTeams.length; i++) {
        if (!finalTeamIds[i]) {
            finalTeamIds[i] = unrankedTeams[unrankedIdx++];
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
    const seed = parseInt(userId.replace('usr_', ''), 10);
    const random = mulberry32(seed);
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
    const seed = parseInt(user.id.replace('usr_', ''), 10);
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
