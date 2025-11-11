// live.js - Real-time match tracking and live event detection
import * as api from './api.js';
import * as ai from './ai.js';
import * as db from './db.js';

// Map to track active live sessions: userId -> { matchId, chatId, lastState, pollInterval, startTime }
const activeLiveSessions = new Map();

// Track previous states to detect changes
const matchStates = new Map(); // matchId -> lastState

// Event types that can be detected
const EVENT_TYPES = {
  KILL: 'kill',
  DEATH: 'death',
  TOWER_DESTROY: 'tower_destroy',
  BARON: 'baron',
  DRAGON: 'dragon',
  MULTIKILL: 'multikill',
  TURNAROUND: 'turnaround',
  FEEDING: 'feeding',
};

/**
 * Start tracking a live match
 * @param {Object} bot - Telegram bot instance
 * @param {number} chatId - User's chat ID
 * @param {string} userId - User ID
 * @param {string} puuid - Player PUUID
 */
export async function startLiveTracking(bot, chatId, userId, puuid) {
  try {
    // Check if player is in a live match
    const liveMatch = await api.getLiveMatchData(puuid);

    if (!liveMatch) {
      await bot.sendMessage(
        chatId,
        "❌ No active game found! Start playing and try again. 🎮"
      );
      return;
    }

    const matchId = liveMatch.gameId;

    // Create session
    const session = {
      matchId: matchId,
      chatId: chatId,
      userId: userId,
      puuid: puuid,
      startTime: Date.now(),
      lastUpdate: Date.now(),
      lastState: null,
      pollInterval: null,
      detectedEvents: [],
    };

    activeLiveSessions.set(userId, session);

    // Send initial message
    const gameMode = liveMatch.gameMode || 'UNKNOWN';
    const queueId = liveMatch.queueId || 0;
    const startMsg = await bot.sendMessage(
      chatId,
      `🎮 **LIVE MATCH TRACKING STARTED** 🎮\n\n` +
        `📊 Game Mode: ${gameMode}\n` +
        `⏱️ Duration: 0m 0s\n` +
        `👥 Players: Loading...\n\n` +
        `🔄 Updates incoming... Get ready to get roasted! 🔥`
    );

    // Start polling
    const pollInterval = setInterval(async () => {
      try {
        await pollLiveMatch(bot, session, liveMatch);
      } catch (error) {
        console.error('Error polling live match:', error.message);
      }
    }, 3000); // Poll every 3 seconds

    session.pollInterval = pollInterval;

    // Save session to database
    await db.saveLiveSession(userId, {
      matchId: matchId,
      chatId: chatId,
      puuid: puuid,
      startedAt: new Date(),
      messageId: startMsg.message_id,
    });

    console.log(`🎮 Started live tracking for user ${userId} - Match ${matchId}`);
  } catch (error) {
    console.error('Error starting live tracking:', error);
    await bot.sendMessage(
      chatId,
      `❌ Error: ${error.message}`
    );
  }
}

/**
 * Poll for live match updates
 */
async function pollLiveMatch(bot, session, initialMatchData) {
  const { chatId, userId, puuid, matchId } = session;

  try {
    // Fetch current live match data
    const currentMatch = await api.getLiveMatchData(puuid);

    if (!currentMatch || currentMatch.gameId !== matchId) {
      // Match ended
      await stopLiveTracking(bot, userId, true);
      return;
    }

    // Get player data from match
    const playerData = currentMatch.participants.find(p => p.summonerName);
    if (!playerData) return;

    const currentState = {
      gameDuration: currentMatch.gameLength,
      kills: playerData.stats?.kills || 0,
      deaths: playerData.stats?.deaths || 0,
      assists: playerData.stats?.assists || 0,
      cs: playerData.stats?.minionsKilled || 0,
      gold: playerData.currentGold || 0,
      level: playerData.championLevel || 1,
      health: playerData.stats?.championDamageDealt || 0,
      team: currentMatch.teamId === 100 ? 'BLUE' : 'RED',
      teamKills: currentMatch.teamId === 100 
        ? currentMatch.blueTeamStats?.totalKills || 0
        : currentMatch.redTeamStats?.totalKills || 0,
      enemyTeamKills: currentMatch.teamId === 100
        ? currentMatch.redTeamStats?.totalKills || 0
        : currentMatch.blueTeamStats?.totalKills || 0,
    };

    session.lastState = currentState;

    // Detect events
    const events = await detectGameEvents(session, currentState, playerData);

    // Send roasts for detected events
    if (events.length > 0) {
      for (const event of events) {
        const roast = await generateEventRoast(event, currentState, playerData);
        await bot.sendMessage(chatId, roast, { parse_mode: 'Markdown' });
      }
      session.detectedEvents.push(...events);
    }

    // Update session status periodically (every 15 seconds)
    if (Date.now() - session.lastUpdate > 15000) {
      const statusMsg = formatLiveStatus(currentState, session);
      try {
        await bot.sendMessage(chatId, statusMsg, { parse_mode: 'Markdown' });
        session.lastUpdate = Date.now();
      } catch (err) {
        console.error('Error sending status update:', err.message);
      }
    }
  } catch (error) {
    console.error('Error in pollLiveMatch:', error.message);
  }
}

/**
 * Detect game events by comparing states
 */
async function detectGameEvents(session, currentState, playerData) {
  const events = [];

  if (!session.lastState) {
    session.lastState = currentState;
    return events;
  }

  const lastState = session.lastState;

  // Detect kills
  if (currentState.kills > lastState.kills) {
    const killCount = currentState.kills - lastState.kills;
    if (killCount >= 3) {
      events.push({
        type: EVENT_TYPES.MULTIKILL,
        data: { count: killCount },
      });
    } else {
      events.push({
        type: EVENT_TYPES.KILL,
        data: { count: killCount },
      });
    }
  }

  // Detect deaths
  if (currentState.deaths > lastState.deaths) {
    const deathCount = currentState.deaths - lastState.deaths;
    if (deathCount >= 2) {
      events.push({
        type: EVENT_TYPES.FEEDING,
        data: { count: deathCount },
      });
    } else {
      events.push({
        type: EVENT_TYPES.DEATH,
        data: { count: deathCount },
      });
    }
  }

  // Detect gold swing (turnaround)
  const goldDiff = currentState.gold - lastState.gold;
  if (goldDiff < -500 && currentState.gameDuration < 900) {
    // Lost 500+ gold early game
    events.push({
      type: EVENT_TYPES.TURNAROUND,
      data: { goldLoss: Math.abs(goldDiff) },
    });
  }

  return events;
}

/**
 * Generate roast for a detected event
 */
async function generateEventRoast(event, currentState, playerData) {
  const championName = playerData.championName || 'Champion';
  let baseMessage = '';

  switch (event.type) {
    case EVENT_TYPES.KILL:
      baseMessage =
        `🔥 **${event.data.count === 1 ? 'KILL!' : event.data.count + 'x KILLS'}**\n\n` +
        `Got a kill with ${championName}? Nice farm pick, probably against afk. 💀\n` +
        `K/D/A: ${currentState.kills}/${currentState.deaths}/${currentState.assists}`;
      break;

    case EVENT_TYPES.MULTIKILL:
      baseMessage =
        `🔥🔥🔥 **${event.data.count}x MULTIKILL!** 🔥🔥🔥\n\n` +
        `Okay fine, that was actually impressive! Don't let it go to your head.\n` +
        `K/D/A: ${currentState.kills}/${currentState.deaths}/${currentState.assists}`;
      break;

    case EVENT_TYPES.DEATH:
      baseMessage =
        `💀 **DEAD AGAIN!** 💀\n\n` +
        `That's ${event.data.count} death(ies). You're becoming canon fodder.\n` +
        `K/D/A: ${currentState.kills}/${currentState.deaths}/${currentState.assists}\n` +
        `Gold: ${currentState.gold}`;
      break;

    case EVENT_TYPES.FEEDING:
      baseMessage =
        `💀💀💀 **FEEDING DETECTED** 💀💀💀\n\n` +
        `${event.data.count} deaths already?! You're not a player, you're a liability!\n` +
        `K/D/A: ${currentState.kills}/${currentState.deaths}/${currentState.assists}`;
      break;

    case EVENT_TYPES.TURNAROUND:
      baseMessage =
        `📉 **MASSIVE GOLD LOSS** 📉\n\n` +
        `Lost ${event.data.goldLoss} gold! The enemy is farming you. 🤡\n` +
        `Current Gold: ${currentState.gold}`;
      break;

    default:
      baseMessage = `Event: ${event.type}`;
  }

  try {
    const aiRoast = await ai.roastLiveEvent(event, currentState, championName);
    return `${baseMessage}\n\n🎙️ *${aiRoast}*`;
  } catch (error) {
    console.error('Error generating AI roast:', error.message);
    return baseMessage;
  }
}

/**
 * Format live match status
 */
function formatLiveStatus(currentState, session) {
  const gameDurationMin = Math.floor(currentState.gameDuration / 60);
  const gameDurationSec = currentState.gameDuration % 60;

  return (
    `⏱️ **Live Match Update**\n\n` +
    `📊 Game Time: ${gameDurationMin}m ${gameDurationSec}s\n` +
    `K/D/A: ${currentState.kills}/${currentState.deaths}/${currentState.assists}\n` +
    `💰 Gold: ${currentState.gold}\n` +
    `🧿 CS: ${currentState.cs}\n` +
    `⚡ Level: ${currentState.level}\n` +
    `Team Score: ${currentState.teamKills} vs ${currentState.enemyTeamKills}\n\n` +
    `🔄 Next update in 15s...`
  );
}

/**
 * Stop tracking a live match
 */
export async function stopLiveTracking(bot, userId, matchEnded = false) {
  const session = activeLiveSessions.get(userId);

  if (!session) return;

  // Clear polling
  if (session.pollInterval) {
    clearInterval(session.pollInterval);
  }

  const { chatId, lastState } = session;

  // Send final message
  if (matchEnded && lastState) {
    const finalRoast =
      `🏁 **MATCH ENDED** 🏁\n\n` +
      `Final Stats:\n` +
      `📊 K/D/A: ${lastState.kills}/${lastState.deaths}/${lastState.assists}\n` +
      `💰 Gold: ${lastState.gold}\n` +
      `🧿 CS: ${lastState.cs}\n\n` +
      `GG! Use /roast to see the full breakdown.`;

    await bot.sendMessage(chatId, finalRoast);
  }

  // Remove session
  activeLiveSessions.delete(userId);

  // Update database
  await db.endLiveSession(userId);

  console.log(`🛑 Stopped live tracking for user ${userId}`);
}

/**
 * Get all active live sessions (for debugging/monitoring)
 */
export function getActiveSessions() {
  return Array.from(activeLiveSessions.entries()).map(([userId, session]) => ({
    userId,
    matchId: session.matchId,
    duration: (Date.now() - session.startTime) / 1000,
    events: session.detectedEvents.length,
  }));
}

/**
 * Stop all active sessions (cleanup on bot shutdown)
 */
export async function stopAllSessions() {
  for (const [userId] of activeLiveSessions) {
    await stopLiveTracking(null, userId, false);
  }
}
