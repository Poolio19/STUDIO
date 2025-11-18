

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
  colour?: string;
  bgColour?: string;
  textColour?: string;
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
    { id: 'usr_47', name: 'BBC', avatar: '47', isPro: true },
    { id: 'usr_48', name: 'SKY', avatar: '48', isPro: true },
    { id: 'usr_49', name: 'OPTA', avatar: '49', isPro: true },
];

export const teams: Team[] = [
    { id: 'team_1', name: 'Arsenal', logo: 'drill', bgColour: 'bg-red-600', textColour: 'text-white' },
    { id: 'team_2', name: 'Aston Villa', logo: 'squirrel', bgColour: 'bg-[#670E36]', textColour: 'text-sky-300' },
    { id: 'team_3', name: 'Bournemouth', logo: 'fingerprint', bgColour: 'bg-red-600', textColour: 'text-black' },
    { id: 'team_4', name: 'Brentford', logo: 'bug', bgColour: 'bg-red-600', textColour: 'text-white' },
    { id: 'team_5', name: 'Brighton', logo: 'bird', bgColour: 'bg-blue-500', textColour: 'text-white' },
    { id: 'team_6', name: 'Chelsea', logo: 'creativeCommons', bgColour: 'bg-white', textColour: 'text-blue-600' },
    { id: 'team_7', name: 'Crystal Palace', logo: 'rabbit', bgColour: 'bg-blue-600', textColour: 'text-red-600' },
    { id: 'team_8', name: 'Everton', logo: 'home', bgColour: 'bg-blue-700', textColour: 'text-white' },
    { id: 'team_9', name: 'Fulham', logo: 'shieldHalf', bgColour: 'bg-white', textColour: 'text-black' },
    { id: 'team_10', name: 'Ipswich Town', logo: 'shield', bgColour: 'bg-blue-600', textColour: 'text-white' },
    { id: 'team_11', name: 'Leicester City', logo: 'shield', bgColour: 'bg-blue-600', textColour: 'text-white' },
    { id: 'team_12', name: 'Liverpool', logo: 'ship', bgColour: 'bg-red-600', textColour: 'text-white' },
    { id: 'team_13', name: 'Man City', logo: 'sailboat', bgColour: 'bg-sky-400', textColour: 'text-yellow-300' },
    { id: 'team_14', name: 'Man Utd', logo: 'hamburger', bgColour: 'bg-red-600', textColour: 'text-yellow-400' },
    { id: 'team_15', name: 'Newcastle', logo: 'castle', bgColour: 'bg-black', textColour: 'text-white' },
    { id: 'team_16', name: 'Notts Forest', logo: 'treeDeciduous', bgColour: 'bg-red-600', textColour: 'text-white' },
    { id: 'team_17', name: 'Southampton', logo: 'flower', bgColour: 'bg-red-600', textColour: 'text-white' },
    { id: 'team_18', name: 'Tottenham', logo: 'origami', bgColour: 'bg-blue-900', textColour: 'text-white' },
    { id: 'team_19', name: 'West Ham', logo: 'utensilsCrossed', bgColour: 'bg-[#670E36]', textColour: 'text-yellow-300' },
    { id: 'team_20', name: 'Wolves', logo: 'gitlab', bgColour: 'bg-orange-400', textColour: 'text-black' },
    { id: 'team_21', name: 'Burnley', logo: 'shield', bgColour: 'bg-[#670E36]', textColour: 'text-sky-300'},
    { id: 'team_22', name: 'Leeds', logo: 'mapPin', bgColour: 'bg-yellow-300', textColour: 'text-blue-800' },
    { id: 'team_23', name: 'Sunderland', logo: 'theater', bgColour: 'bg-red-600', textColour: 'text-white' },
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
    { teamId: 'team_21', rank: 18, points: 31, goalDifference: -20 }, // Burnley
    { teamId: 'team_22', rank: 19, points: 26, goalDifference: -35 }, // Leeds
    { teamId: 'team_23', rank: 20, points: 25, goalDifference: -37 }, // Sunderland
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
    { teamId: 'team_23', rank: 18, points: 2, goalDifference: -7, gamesPlayed: 5, wins: 0, draws: 2, losses: 3, goalsFor: 2, goalsAgainst: 9 }, // Sunderland
    { teamId: 'team_21', rank: 19, points: 1, goalDifference: -8, gamesPlayed: 5, wins: 0, draws: 1, losses: 4, goalsFor: 1, goalsAgainst: 9 }, // Burnley
    { teamId: 'team_22', rank: 20, points: 0, goalDifference: -10, gamesPlayed: 5, wins: 0, draws: 0, losses: 5, goalsFor: 0, goalsAgainst: 10 }, // Leeds
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
    { month: 'August', year: 2025, userId: 'usr_3', type: 'runner-up' },
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

    // More nuanced pessimism/optimism
    const getUserPersonality = (seed: number) => {
        const personalityRand = mulberry32(seed + 100);
        const type = personalityRand() * 3;
        if (type < 1) return 'optimist'; // Tends to predict higher ranks
        if (type < 2) return 'pessimist'; // Tends to predict lower ranks
        return 'realist'; // Stays closer to original ranks
    };

    const personality = getUserPersonality(seed);

    let perturbedStandings = standings.map(team => {
        const originalRank = team.rank;
        let perturbation = 0;

        // More bell-curve like randomness
        const bellCurveRandom = (random() + random() + random() + random() + random() + random() - 3) / 3;

        let maxPerturbation: number;
        let bias = 0;

        if (personality === 'optimist') bias = -0.1;
        if (personality === 'pessimist') bias = 0.1;


        if (originalRank <= 4) maxPerturbation = 3;
        else if (originalRank <= 10) maxPerturbation = 5;
        else maxPerturbation = 7;
        
        perturbation = Math.round((bellCurveRandom + bias) * maxPerturbation);

        let predictedRank = originalRank + perturbation;

        // Ensure predictions stay within bounds 1-20
        predictedRank = Math.max(1, Math.min(20, predictedRank));

        return {
            teamId: team.teamId,
            predictedRank,
            tieBreaker: random(),
        };
    });

    // Resolve rank collisions
    perturbedStandings.sort((a, b) => a.predictedRank - b.predictedRank || a.tieBreaker - b.tieBreaker);
    
    const finalTeamIds = new Array(20);
    const assignedRanks = new Set<number>();
    
    perturbedStandings.forEach(p => {
        let proposedRank = p.predictedRank;
        while(assignedRanks.has(proposedRank) && proposedRank <= 20) {
            proposedRank++;
        }
         if (proposedRank <= 20) {
            p.predictedRank = proposedRank;
            assignedRanks.add(p.predictedRank);
        }
    });

    for (let i = 1; i <= 20; i++) {
        if (!assignedRanks.has(i)) {
            const unplacedTeam = perturbedStandings.find(p => p.predictedRank > 20 || !finalTeamIds.includes(p.teamId));
             if (unplacedTeam) {
                unplacedTeam.predictedRank = i;
                assignedRanks.add(i);
            }
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

const generateScoresForUser = (userId: string, userPredictions: string[]): PlayerTeamScore[] => {
    const actualRanks = new Map<string, number>();
    previousSeasonStandings.forEach(s => actualRanks.set(s.teamId, s.rank));
    
    return userPredictions.map((teamId, index) => {
        const predictedRank = index + 1;
        const actualRank = actualRanks.get(teamId) || 0;
        let score = 0;
        if (actualRank > 0) {
            score = 5 - Math.abs(predictedRank - actualRank);
        }
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

export const userHistories: UserHistory[] = usersData.map(user => {
    const seed = parseInt(user.id.replace('usr_', ''), 10);
    const random = mulberry32(seed);

    const finalScore = playerTeamScores
        .filter(s => s.userId === user.id)
        .reduce((acc, s) => acc + s.score, 0);

    let weeklyScores: WeeklyScore[] = [];
    weeklyScores.push({ week: 0, score: 0, rank: previousSeasonPlayerRanks[user.id] || seed % 20 });
    
    let scoreProgression = [0];
    for (let i = 1; i < NUM_WEEKS; i++) {
        scoreProgression.push(random());
    }
    scoreProgression.sort();

    let lastScore = 0;
    for (let week = 1; week <= NUM_WEEKS; week++) {
        let cumulativeScore;
        if (week === NUM_WEEKS) {
            cumulativeScore = finalScore;
        } else {
            cumulativeScore = Math.round(finalScore * scoreProgression[week]);
        }
        weeklyScores.push({ week, score: cumulativeScore, rank: 0 }); 
        lastScore = cumulativeScore;
    }
    return { userId: user.id, weeklyScores };
});

for (let week = 1; week <= NUM_WEEKS; week++) {
    const weeklyStandings = userHistories
      .map(h => ({
          userId: h.userId,
          score: h.weeklyScores.find(w => w.week === week)!.score,
          tieBreaker: parseInt(h.userId.replace('usr_',''))
      }))
      .sort((a, b) => {
          if (b.score !== a.score) {
              return b.score - a.score;
          }
          return a.tieBreaker - b.tieBreaker;
      });

    weeklyStandings.forEach((player, index) => {
        const rank = index + 1;
        const userHistory = userHistories.find(h => h.userId === player.userId)!;
        const weekData = userHistory.weeklyScores.find(w => w.week === week)!;
        weekData.rank = rank;
    });
}

const finalUsers: User[] = usersData.map(userStub => {
    const history = userHistories.find(h => h.userId === userStub.id);
    const totalScore = playerTeamScores
        .filter(s => s.userId === userStub.id)
        .reduce((acc, s) => acc + s.score, 0);
    
    if (!history || history.weeklyScores.length === 0) {
        // Return a default/empty user object if history is missing
        return {
            ...userStub,
            score: totalScore,
            rank: 0,
            previousRank: 0,
            previousScore: 0,
            rankChange: 0,
            scoreChange: 0,
            maxScore: 0,
            minScore: 0,
            maxRank: 0,
            minRank: 0,
        };
    }
    
    const currentWeekData = history.weeklyScores.find(w => w.week === NUM_WEEKS) || { score: totalScore, rank: 0 };
    
    const previousWeekNumber = NUM_WEEKS > 1 ? NUM_WEEKS - 1 : 0;
    const previousWeekData = history.weeklyScores.find(w => w.week === previousWeekNumber) || { score: 0, rank: 0 };
        
    const rankChange = previousWeekData.rank && currentWeekData.rank ? previousWeekData.rank - currentWeekData.rank : 0;
    const scoreChange = currentWeekData.score - previousWeekData.score;

    const seasonWeeklyScores = history.weeklyScores.filter(w => w.week > 0);
    
    if (seasonWeeklyScores.length === 0) {
       return {
            ...userStub,
            score: currentWeekData.score,
            rank: currentWeekData.rank, 
            previousRank: previousWeekData.rank,
            previousScore: previousWeekData.score,
            rankChange,
            scoreChange,
            maxScore: currentWeekData.score,
            minScore: currentWeekData.score,
            maxRank: currentWeekData.rank,
            minRank: currentWeekData.rank,
        };
    }

    const allScores = seasonWeeklyScores.map(w => w.score);
    const allRanks = seasonWeeklyScores.map(w => w.rank).filter(r => r > 0);
    
    const maxScore = Math.max(...allScores);
    const minScore = Math.min(...allScores);
    const maxRank = Math.min(...allRanks);
    const minRank = Math.max(...allRanks);
    
    return {
        ...userStub,
        score: totalScore,
        rank: currentWeekData.rank,
        previousRank: previousWeekData.rank,
        previousScore: previousWeekData.score,
        rankChange,
        scoreChange,
        maxScore,
        minScore,
        maxRank,
        minRank,
    };
});

// Final ranking of users based on the score derived from playerTeamScores
const sortedFinalUsers = finalUsers.sort((a, b) => {
    if (b.score !== a.score) {
        return b.score - a.score;
    }
    return parseInt(a.id.replace('usr_', '')) - parseInt(b.id.replace('usr_', ''));
});

// Assign final ranks
let currentRank = 1;
for (let i = 0; i < sortedFinalUsers.length; i++) {
    if (i > 0 && sortedFinalUsers[i].score < sortedFinalUsers[i-1].score) {
        currentRank = i + 1;
    }
    sortedFinalUsers[i].rank = currentRank;

    // Also update the rank in the last week of their history
    const userHistory = userHistories.find(h => h.userId === sortedFinalUsers[i].id);
    if(userHistory) {
        const lastWeek = userHistory.weeklyScores.find(w => w.week === NUM_WEEKS);
        if(lastWeek) {
            lastWeek.rank = currentRank;
        }
    }
}


export const users: User[] = sortedFinalUsers;


const TOTAL_CHART_WEEKS = 6;
const currentWeekNumber = currentStandings[0]?.gamesPlayed || 1;

export const weeklyTeamStandings: WeeklyTeamStanding[] = teams.flatMap(team => {
    const seed = parseInt(team.id.replace('team_', ''), 10);
    if (isNaN(seed)) return []; // guard against invalid team IDs
    const random = mulberry32(seed);
    const finalRank = currentStandings.find(s => s.teamId === team.id)?.rank || 10;
    
    const weeklyRanks: WeeklyTeamStanding[] = [];
    
    let lastRank = finalRank;
    for (let i = 0; i < TOTAL_CHART_WEEKS; i++) {
        const week = currentWeekNumber - i;
        if (week < 1) continue;

        if (i === 0) {
            weeklyRanks.push({ week, teamId: team.id, rank: finalRank });
        } else {
             const fluctuation = Math.round((random() - 0.5) * 4);
             const newRank = Math.max(1, Math.min(20, lastRank + fluctuation));
             weeklyRanks.push({ week, teamId: team.id, rank: newRank });
             lastRank = newRank;
        }
    }
    return weeklyRanks.reverse();
});
