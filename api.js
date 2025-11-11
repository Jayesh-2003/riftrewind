// api.js - External API calls (Riot API)
import axios from 'axios';

const RIOT_API_KEY = process.env.RIOT_API_KEY;
const ASIA_API = 'https://asia.api.riotgames.com';
const SEA_API = 'https://sea.api.riotgames.com';

const axiosInstance = axios.create({
  headers: {
    'X-Riot-Token': RIOT_API_KEY,
  },
});

// Get player PUUID by game name and tag line
export async function getPlayerPUUID(gameName, tagLine) {
  try {
    const response = await axiosInstance.get(
      `${ASIA_API}/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching PUUID:', error.response?.data || error.message);
    throw new Error('Player not found or invalid credentials');
  }
}

// Get recent match ID
export async function getRecentMatchId(puuid) {
  try {
    const response = await axiosInstance.get(
      `${SEA_API}/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=1`
    );
    return response.data[0]; // Returns first match ID
  } catch (error) {
    console.error('Error fetching match ID:', error.response?.data || error.message);
    throw new Error('Could not fetch recent match');
  }
}

// Get multiple recent match IDs for analysis
export async function getMatchIdsByPUUID(puuid, count = 10) {
  try {
    const response = await axiosInstance.get(
      `${SEA_API}/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=${Math.min(count, 100)}`
    );
    return response.data; // Returns array of match IDs
  } catch (error) {
    console.error('Error fetching match IDs:', error.response?.data || error.message);
    throw new Error('Could not fetch match history');
  }
}

// Get match details
export async function getMatchDetails(matchId) {
  try {
    const response = await axiosInstance.get(
      `${SEA_API}/lol/match/v5/matches/${matchId}`
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching match:', error.response?.data || error.message);
    throw new Error('Could not fetch match details');
  }
}

// Get match timeline for detailed analysis
export async function getMatchTimeline(matchId) {
  try {
    const response = await axiosInstance.get(
      `${SEA_API}/lol/match/v5/matches/${matchId}/timeline`
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching timeline:', error.response?.data || error.message);
    throw new Error('Could not fetch match timeline');
  }
}

// Extract timeline roastable moments from player
export function extractTimelineRoasts(timelineData, puuid) {
  const events = [];
  
  // Get player participation timeline events
  if (timelineData.info && timelineData.info.frames) {
    const frames = timelineData.info.frames;
    
    let deathCount = 0;
    let killCount = 0;
    let assistCount = 0;
    let earlyGameStruggles = [];
    let lateGameFailures = [];
    
    frames.forEach((frame, frameIndex) => {
      const frameTime = frame.timestamp / 1000; // Convert to seconds
      const minutes = Math.floor(frameTime / 60);
      
      if (frame.events) {
        frame.events.forEach(event => {
          // Check for kills
          if (event.type === 'CHAMPION_KILL') {
            if (event.killerId === puuid) {
              killCount++;
              if (minutes < 15) {
                events.push(`Early game kill at ${minutes}m (possibly lucky)`);
              }
            }
            // Check if killed
            if (event.victimId === puuid) {
              deathCount++;
              if (minutes < 10) {
                earlyGameStruggles.push(`Died at ${minutes}m (feeding early)`);
              } else if (minutes > 30) {
                lateGameFailures.push(`Died at ${minutes}m (critical moment)`);
              }
            }
            // Check for assists
            if (event.assistIds && event.assistIds.includes(puuid)) {
              assistCount++;
            }
          }
          
          // Check for building destruction (turrets)
          if (event.type === 'BUILDING_KILL' && event.killerId === puuid) {
            if (minutes < 20) {
              events.push(`Split pushing early at ${minutes}m`);
            }
          }
        });
      }
    });
    
    return {
      totalDeaths: deathCount,
      totalKills: killCount,
      totalAssists: assistCount,
      earlyGameStruggles: earlyGameStruggles,
      lateGameFailures: lateGameFailures,
      keyMoments: events,
    };
  }
  
  return {
    totalDeaths: 0,
    totalKills: 0,
    totalAssists: 0,
    earlyGameStruggles: [],
    lateGameFailures: [],
    keyMoments: [],
  };
}


// Extract player stats from match
export function extractPlayerStats(matchData, puuid) {
  const participant = matchData.info.participants.find(p => p.puuid === puuid);
  if (!participant) throw new Error('Player not found in match');
  
  // Determine role from available data
  let role = participant.role || participant.teamPosition || participant.lane || participant.individualPosition || 'UNKNOWN';
  if (role === 'Invalid' || !role) role = 'UNKNOWN';
  
  return {
    summonerName: participant.summonerName || participant.riotIdGameName || 'Unknown',
    championName: participant.championName,
    role: role,
    champLevel: participant.champLevel,
    kills: participant.kills,
    deaths: participant.deaths,
    assists: participant.assists,
    kda: participant.challenges?.kda || ((participant.kills + participant.assists) / Math.max(participant.deaths, 1)),
    goldEarned: participant.goldEarned,
    goldSpent: participant.goldSpent,
    physicalDamageDealtToChampions: participant.physicalDamageDealtToChampions,
    magicDamageDealtToChampions: participant.magicDamageDealtToChampions,
    totalDamageDealtToChampions: participant.totalDamageDealtToChampions,
    totalDamageTaken: participant.totalDamageTaken,
    damageSelfMitigated: participant.damageSelfMitigated,
    visionScore: participant.visionScore,
    wardsPlaced: participant.wardsPlaced,
    wardsKilled: participant.wardTakedowns,
    totalMinionsKilled: participant.totalMinionsKilled,
    totalTimeSpentDead: participant.totalTimeSpentDead,
    longestTimeSpentLiving: participant.longestTimeSpentLiving,
    win: participant.win,
    killParticipation: participant.challenges?.killParticipation || 0,
    damagePerMinute: participant.challenges?.damagePerMinute || 0,
    goldPerMinute: participant.challenges?.goldPerMinute || 0,
    deathsByEnemyChamps: participant.challenges?.deathsByEnemyChamps || 0,
    skillshotsDodged: participant.challenges?.skillshotsDodged || 0,
    dodgeSkillShotsSmallWindow: participant.challenges?.dodgeSkillShotsSmallWindow || 0,
    itemsPurchased: participant.itemsPurchased,
    largestCriticalStrike: participant.largestCriticalStrike,
    largestKillingSpree: participant.largestKillingSpree,
    multikills: participant.multikills,
    doubleKills: participant.doubleKills,
    tripleKills: participant.tripleKills,
  };
}
