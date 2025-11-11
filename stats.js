// stats.js - Analyze historical match data for statistical roasts
import * as api from './api.js';

// Fetch and analyze last N matches
export async function analyzeMatchHistory(puuid, matchCount = 10) {
  try {
    // Get last N match IDs
    const matchIds = await api.getMatchIdsByPUUID(puuid, matchCount);
    
    // Fetch all match details
    const matchesData = await Promise.all(
      matchIds.map(async (matchId) => {
        const match = await api.getMatchDetails(matchId);
        return extractMatchData(match, puuid);
      })
    );

    return calculateStatistics(matchesData);
  } catch (error) {
    console.error('Error analyzing match history:', error.message);
    throw new Error('Failed to analyze match history');
  }
}

// Extract relevant data from a match
function extractMatchData(matchData, puuid) {
  const participant = matchData.info.participants.find(p => p.puuid === puuid);
  
  if (!participant) {
    throw new Error('Player not found in match data');
  }

  return {
    matchId: matchData.metadata.matchId,
    championName: participant.championName,
    role: participant.teamPosition || 'UNKNOWN',
    kills: participant.kills,
    deaths: participant.deaths,
    assists: participant.assists,
    kda: participant.challenges?.kda || (participant.kills + participant.assists) / (participant.deaths || 1),
    cs: participant.totalMinionsKilled,
    gold: participant.goldEarned,
    damage: participant.totalDamageDealtToChampions,
    damageTaken: participant.totalDamageTaken,
    visionScore: participant.visionScore,
    win: participant.win,
    duration: matchData.info.gameDuration,
    timestamp: matchData.info.gameCreation,
  };
}

// Calculate comprehensive statistics
function calculateStatistics(matches) {
  if (matches.length === 0) {
    throw new Error('No matches found');
  }

  const totalGames = matches.length;
  const wins = matches.filter(m => m.win).length;
  const losses = totalGames - wins;
  const winRate = (wins / totalGames) * 100;

  // K/D/A averages
  const avgKills = (matches.reduce((sum, m) => sum + m.kills, 0) / totalGames).toFixed(2);
  const avgDeaths = (matches.reduce((sum, m) => sum + m.deaths, 0) / totalGames).toFixed(2);
  const avgAssists = (matches.reduce((sum, m) => sum + m.assists, 0) / totalGames).toFixed(2);
  const avgKDA = (matches.reduce((sum, m) => sum + m.kda, 0) / totalGames).toFixed(2);

  // Champion breakdown
  const championStats = {};
  matches.forEach(match => {
    if (!championStats[match.championName]) {
      championStats[match.championName] = { wins: 0, losses: 0, kda: [], count: 0 };
    }
    championStats[match.championName].wins += match.win ? 1 : 0;
    championStats[match.championName].losses += match.win ? 0 : 1;
    championStats[match.championName].kda.push(match.kda);
    championStats[match.championName].count += 1;
  });

  // Best and worst champions
  const bestChamp = Object.entries(championStats).sort(
    (a, b) => (b[1].wins / b[1].count) - (a[1].wins / a[1].count)
  )[0];
  
  const worstChamp = Object.entries(championStats).sort(
    (a, b) => (b[1].wins / b[1].count) - (a[1].wins / a[1].count)
  ).pop();

  // CS and damage stats
  const avgCS = (matches.reduce((sum, m) => sum + m.cs, 0) / totalGames).toFixed(1);
  const avgGold = (matches.reduce((sum, m) => sum + m.gold, 0) / totalGames).toFixed(0);
  const avgDamage = (matches.reduce((sum, m) => sum + m.damage, 0) / totalGames).toFixed(0);
  const avgVision = (matches.reduce((sum, m) => sum + m.visionScore, 0) / totalGames).toFixed(1);

  // Death breakdown
  const highDeathMatches = matches.filter(m => m.deaths >= 8).length;
  const maxDeathsInMatch = Math.max(...matches.map(m => m.deaths));

  return {
    totalGames,
    wins,
    losses,
    winRate: winRate.toFixed(1),
    avgKills,
    avgDeaths,
    avgAssists,
    avgKDA,
    avgCS,
    avgGold,
    avgDamage,
    avgVision,
    bestChamp: bestChamp ? { name: bestChamp[0], winRate: ((bestChamp[1].wins / bestChamp[1].count) * 100).toFixed(0), games: bestChamp[1].count } : null,
    worstChamp: worstChamp ? { name: worstChamp[0], winRate: ((worstChamp[1].wins / worstChamp[1].count) * 100).toFixed(0), games: worstChamp[1].count } : null,
    highDeathMatches,
    maxDeathsInMatch,
    matches, // Include raw matches for graphing
  };
}

// Generate statistical roast from history
export function generateStatsRoast(stats) {
  const roasts = [];

  // Win rate roast
  if (stats.winRate < 40) {
    roasts.push(`With a ${stats.winRate}% win rate, you're losing more than a casino. Maybe it's time to accept you're not climbing out of your rank.`);
  } else if (stats.winRate < 50) {
    roasts.push(`${stats.winRate}% win rate is basically 50/50 - you're a coin flip. Your team can't tell if you're an asset or a liability.`);
  } else if (stats.winRate >= 55) {
    roasts.push(`Oh wow, ${stats.winRate}% win rate. Congrats on being slightly above average - your team probably still mutes you though.`);
  }

  // KDA roast
  if (stats.avgDeaths > 7) {
    roasts.push(`Averaging ${stats.avgDeaths} deaths per game? You're not a player, you're a feeding simulator. Your teammates see you as enemy gold.`);
  } else if (stats.avgDeaths > 5) {
    roasts.push(`${stats.avgDeaths} deaths per game average - you're trying to set a record for respawn timer speedrun.`);
  }

  // Champion pool roast
  if (stats.bestChamp && stats.worstChamp) {
    const diff = parseInt(stats.bestChamp.winRate) - parseInt(stats.worstChamp.winRate);
    if (diff > 30) {
      roasts.push(`You're ${diff}% better on ${stats.bestChamp.name} than ${stats.worstChamp.name}. Stop picking ${stats.worstChamp.name} - you're torturing your team.`);
    }
  }

  // CS roast
  if (stats.avgCS < 4) {
    roasts.push(`${stats.avgCS} CS per minute? Were you afk? That's support numbers and you're not even playing support.`);
  } else if (stats.avgCS < 5) {
    roasts.push(`Averaging ${stats.avgCS} CS/min - you're more interested in roaming into enemy territory to die than farming.`);
  }

  // High death matches
  if (stats.highDeathMatches > stats.totalGames * 0.5) {
    roasts.push(`You die 8+ times in more than half your games. You're either inting or just genuinely terrible at staying alive.`);
  }

  // Return random roast or combine if multiple
  return roasts.length > 0 ? roasts[Math.floor(Math.random() * roasts.length)] : 'You exist. That\'s about all I can say about your play.';
}

// Analyze champion performance and give personalized recommendations
export function analyzeChampionRecommendations(stats) {
  const champStats = {};
  
  // Build detailed champion stats
  stats.matches.forEach(match => {
    const champ = match.championName;
    if (!champStats[champ]) {
      champStats[champ] = {
        name: champ,
        wins: 0,
        games: 0,
        totalKDA: 0,
        totalCS: 0,
        totalDamage: 0,
        totalGold: 0,
        totalDeaths: 0,
        avgDuration: 0,
      };
    }
    champStats[champ].wins += match.win ? 1 : 0;
    champStats[champ].games += 1;
    champStats[champ].totalKDA += match.kda;
    champStats[champ].totalCS += match.cs;
    champStats[champ].totalDamage += match.damage;
    champStats[champ].totalGold += match.gold;
    champStats[champ].totalDeaths += match.deaths;
    champStats[champ].avgDuration = match.duration;
  });

  // Calculate metrics for each champion
  const champMetrics = Object.values(champStats).map(champ => {
    const avgKDA = (champ.totalKDA / champ.games).toFixed(2);
    const avgCS = (champ.totalCS / champ.games).toFixed(1);
    const avgDamage = (champ.totalDamage / champ.games).toFixed(0);
    const avgGold = (champ.totalGold / champ.games).toFixed(0);
    const avgDeaths = (champ.totalDeaths / champ.games).toFixed(1);
    const winRate = ((champ.wins / champ.games) * 100).toFixed(0);
    
    // Calculate a "best fit" score based on multiple factors
    const deathPenalty = avgDeaths > stats.avgDeaths ? 0.8 : 1.2; // Lower score if deaths are high
    const kdaBonus = avgKDA > stats.avgKDA ? 1.3 : 0.9;
    const csBonus = avgCS > stats.avgCS ? 1.2 : 0.85;
    const winBonus = winRate >= 50 ? 1.5 : 0.7;
    
    const fitScore = (parseFloat(winRate) * winBonus + parseFloat(avgKDA) * kdaBonus + 
                      parseFloat(avgCS) * csBonus - parseFloat(avgDeaths) * deathPenalty) / 10;

    return {
      name: champ.name,
      games: champ.games,
      winRate: parseInt(winRate),
      avgKDA: parseFloat(avgKDA),
      avgCS: parseFloat(avgCS),
      avgGold: parseInt(avgGold),
      avgDamage: parseInt(avgDamage),
      avgDeaths: parseFloat(avgDeaths),
      fitScore: parseFloat(fitScore).toFixed(2),
    };
  });

  // Sort by fit score
  champMetrics.sort((a, b) => parseFloat(b.fitScore) - parseFloat(a.fitScore));

  // Get recommendations
  const topChamps = champMetrics.slice(0, 3);
  const bottomChamps = champMetrics.slice(-2);

  return {
    allChampions: champMetrics,
    topRecommendations: topChamps,
    bottomChampions: bottomChamps,
  };
}

// Generate champion recommendation report
export function generateChampionReport(stats, recommendations) {
  const report = [];

  report.push('🎯 **PERSONALIZED CHAMPION RECOMMENDATIONS**\n');

  // Top recommendations
  report.push('✅ **Best Champions For You:**');
  recommendations.topRecommendations.forEach((champ, idx) => {
    const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉';
    report.push(
      `${medal} **${champ.name}**\n` +
      `  • Win Rate: ${champ.winRate}%\n` +
      `  • Avg KDA: ${champ.avgKDA}\n` +
      `  • Avg CS: ${champ.avgCS}/min\n` +
      `  • Games: ${champ.games}\n`
    );
  });

  // Why they're good
  report.push('\n📊 **Why These Champions Work For You:**');
  const topChamp = recommendations.topRecommendations[0];
  if (topChamp.winRate >= 50) {
    report.push(`✓ ${topChamp.name} has ${topChamp.winRate}% win rate - your most consistent pick`);
  }
  if (topChamp.avgKDA > stats.avgKDA) {
    report.push(`✓ Better KDA than your average (${topChamp.avgKDA} vs ${stats.avgKDA})`);
  }
  if (topChamp.avgDeaths < stats.avgDeaths) {
    report.push(`✓ Fewer deaths (${topChamp.avgDeaths} vs ${stats.avgDeaths}avg) - safer playstyle`);
  }
  if (topChamp.avgCS > stats.avgCS) {
    report.push(`✓ Higher CS (${topChamp.avgCS}/min) - better farming with this champ`);
  }

  // Bottom performers
  report.push('\n\n❌ **STOP PICKING THESE:**');
  recommendations.bottomChampions.forEach(champ => {
    const reason = champ.winRate < 40 ? 'Terrible win rate' :
                   champ.avgDeaths > stats.avgDeaths + 2 ? 'You die too much' :
                   champ.avgKDA < stats.avgKDA ? 'Weak KDA' : 'Not working for you';
    report.push(`❌ ${champ.name} - ${champ.winRate}% WR (${reason})`);
  });

  // Overall playstyle analysis
  report.push('\n\n🔍 **YOUR PLAYSTYLE ANALYSIS:**');
  if (stats.avgCS < 4.5) {
    report.push('⚠️ Low CS - You\'re weak at farming. Pick champions that don\'t need scaling');
  } else if (stats.avgCS > 7) {
    report.push('✓ Good CS - You can pick scaling champions and carry late game');
  }

  if (stats.avgDeaths > 6) {
    report.push('⚠️ High deaths - Pick safer champions with better escape mechanics');
  } else if (stats.avgDeaths < 4) {
    report.push('✓ Low deaths - You can play aggressive champions');
  }

  if (stats.avgKDA < 1.5) {
    report.push('⚠️ Low KDA - Focus on utility/support champions over carry champions');
  } else if (stats.avgKDA > 3) {
    report.push('✓ High KDA - You can hard carry on mechanical champions');
  }

  return report.join('\n');
}

