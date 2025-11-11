// handlers.js - Command handlers
import * as db from './db.js';
import * as api from './api.js';
import * as ai from './ai.js';

const userStates = new Map(); // Track user state for multi-step interactions

export async function handleStartCommand(bot, chatId, userId) {
  userStates.set(userId, { step: 'waiting_for_gamename' });

  await bot.sendMessage(
    chatId,
    "🎮 Welcome to the League Roaster Bot!\n\n" +
    "Send your game name (the one before #) and tag line (the one after #)\n\n" +
    "Example: If your Riot ID is PlayerName#NA1, send:\n" +
    "PlayerName#NA1"
  );
}

export async function handleUserInput(bot, chatId, userId, text) {
  const state = userStates.get(userId);

  if (!state) {
    return;
  }

  if (state.step === 'waiting_for_gamename') {
    await processGameName(bot, chatId, userId, text);
  } else if (state.step === 'asking_timeline_roast') {
    await processTimelineChoice(bot, chatId, userId, text, state);
  }
}

async function processTimelineChoice(bot, chatId, userId, choice, state) {
  try {
    const response = choice.trim().toLowerCase();
    
    if (!['yes', 'y', 'no', 'n'].includes(response)) {
      await bot.sendMessage(
        chatId,
        "❌ Reply with Yes or No"
      );
      return;
    }

    if (response === 'no' || response === 'n') {
      await bot.sendMessage(chatId, "Okay, coward! 😏");
      userStates.delete(userId);
      return;
    }

    // Get timeline roast
    const loadingMsg = await bot.sendMessage(chatId, "⏱️ Pulling up your FULL timeline destruction...");

    try {
      const matchId = state.lastMatchId;
      const timelineData = await api.getMatchTimeline(matchId);
      const timelineRoasts = api.extractTimelineRoasts(timelineData, state.puuid);
      const timelineRoast = await ai.roastTimelinePerformance(state.playerStats, timelineRoasts);

      await bot.editMessageText(
        `⏱️⏱️⏱️ TIMELINE ROAST ⏱️⏱️⏱️\n\n${timelineRoast}`,
        { chat_id: chatId, message_id: loadingMsg.message_id }
      );

      userStates.delete(userId);
    } catch (error) {
      await bot.deleteMessage(chatId, loadingMsg.message_id).catch(() => {});
      await bot.sendMessage(chatId, `❌ Timeline error: ${error.message}`);
      userStates.delete(userId);
    }
  } catch (error) {
    console.error('Error in processTimelineChoice:', error);
    await bot.sendMessage(chatId, `❌ Error: ${error.message}`);
    userStates.delete(userId);
  }
}

async function processGameName(bot, chatId, userId, riotId) {
  try {
    // Validate format
    if (!riotId.includes('#')) {
      await bot.sendMessage(
        chatId,
        "❌ Invalid format! Please use: GameName#TagLine\n" +
        "Example: PlayerName#NA1"
      );
      return;
    }

    const [gameName, tagLine] = riotId.split('#');

    if (!gameName || !tagLine) {
      await bot.sendMessage(
        chatId,
        "❌ Invalid format! Please use: GameName#TagLine"
      );
      return;
    }

    // Show loading message
    const loadingMsg = await bot.sendMessage(chatId, "🔍 Searching for your account...");

    try {
      // Get player PUUID
      const playerData = await api.getPlayerPUUID(gameName, tagLine);

      // Roast the name
      const nameRoast = await ai.roastPlayerName(gameName, tagLine);

      // Save to database
      await db.saveUser({
        telegram_userId: userId,
        puuid: playerData.puuid,
        gameName: playerData.gameName,
        tagLine: playerData.tagLine,
        created_at: new Date(),
      });

      // Delete loading message
      await bot.deleteMessage(chatId, loadingMsg.message_id).catch(() => {});

      // Send roast
      await bot.sendMessage(
        chatId,
        "✅ Account saved!\n\n" +
        `📝 Name Roast:\n${nameRoast}\n\n` +
        "Now use /roast to get roasted on your latest match!"
      );

      userStates.delete(userId);
    } catch (error) {
      await bot.deleteMessage(chatId, loadingMsg.message_id).catch(() => {});
      await bot.sendMessage(
        chatId,
        `❌ Error: ${error.message}\n\nMake sure your Riot ID (GameName#TagLine) is correct!`
      );
    }
  } catch (error) {
    console.error('Error in processGameName:', error);
    await bot.sendMessage(chatId, '❌ Something went wrong. Please try again.');
  }
}

export async function handleRoastCommand(bot, chatId, userId) {
  try {
    // Get user data
    const user = await db.findUser(userId);

    if (!user) {
      await bot.sendMessage(
        chatId,
        "❌ You haven't registered yet! Use /start first."
      );
      return;
    }

    const loadingMsg = await bot.sendMessage(chatId, "🎮 Fetching your latest match and destroying you...");

    try {
      // Get recent match ID
      const matchId = await api.getRecentMatchId(user.puuid);

      if (!matchId) {
        await bot.deleteMessage(chatId, loadingMsg.message_id).catch(() => {});
        await bot.sendMessage(chatId, "❌ No recent matches found!");
        return;
      }

      // Get match details
      const matchData = await api.getMatchDetails(matchId);

      // Extract player stats
      const playerStats = api.extractPlayerStats(matchData, user.puuid);

      // Generate overview roast
      const overviewRoast = await ai.roastMatchPerformance(playerStats);

      const roastMessage = "📊 MATCH ROAST:\n\n" +
        `🎯 Champion: ${playerStats.championName} (Lvl ${playerStats.champLevel})\n` +
        `📍 Role: ${playerStats.role}\n` +
        `⚔️ K/D/A: ${playerStats.kills}/${playerStats.deaths}/${playerStats.assists}\n` +
        `📈 KDA Ratio: ${playerStats.kda.toFixed(2)}\n` +
        `🧿 CS: ${playerStats.totalMinionsKilled}\n` +
        `💰 Gold: ${playerStats.goldEarned} (${playerStats.goldPerMinute.toFixed(2)}/min)\n` +
        `⚡ Damage: ${playerStats.totalDamageDealtToChampions}\n` +
        `🛡️ Damage Taken: ${playerStats.totalDamageTaken}\n` +
        `👁️ Vision: ${playerStats.visionScore} | Wards: ${playerStats.wardsPlaced}\n` +
        `� Deaths: ${playerStats.totalTimeSpentDead}s dead (${(playerStats.totalTimeSpentDead / 60).toFixed(1)}min)\n` +
        `${playerStats.win ? '✅ WIN' : '❌ LOSS'}\n\n` +
        `🔥🔥🔥 OVERVIEW ROAST 🔥🔥🔥\n${overviewRoast}`;

      // Update message with overview roast
      await bot.editMessageText(
        roastMessage,
        { chat_id: chatId, message_id: loadingMsg.message_id }
      );

      // Save stats
      await db.updateUserStats(userId, {
        lastMatch: matchId,
        lastStats: playerStats,
        lastRoastTime: new Date(),
      });

      // Ask if they want timeline roast
      userStates.set(userId, {
        step: 'asking_timeline_roast',
        puuid: user.puuid,
        lastMatchId: matchId,
        playerStats: playerStats,
      });

      await bot.sendMessage(
        chatId,
        "⏱️ Want the FULL TIMELINE ROAST?\n\n" +
        "This will expose EVERY mistake, EVERY death, your ENTIRE game arc!\n\n" +
        "Reply: Yes or No"
      );
    } catch (error) {
      await bot.deleteMessage(chatId, loadingMsg.message_id).catch(() => {});
      throw error;
    }
  } catch (error) {
    console.error('Error in handleRoastCommand:', error);
    await bot.sendMessage(
      chatId,
      `❌ Error: ${error.message}`
    );
  }
}

export async function handleHelpCommand(bot, chatId) {
  await bot.sendMessage(
    chatId,
    "📖 **League Roaster Bot Help**\n\n" +
    "*Available Commands:*\n" +
    "/start - Register your League account\n" +
    "/roast - Get roasted on your latest match\n" +
    "/analysis - Get detailed stats analysis with graphs\n" +
    "/help - Show this help message\n\n" +
    "The bot will roast your gaming name and your match performance! 🔥"
  );
}

export async function handleAnalysisCommand(bot, chatId, userId) {
  const { analyzeMatchHistory } = await import('./stats.js');
  const { generateKDAGraph, generateChampionChart } = await import('./graphs.js');
  const { generateStatsRoast, analyzeChampionRecommendations, generateChampionReport } = await import('./stats.js');

  try {
    const user = await db.findUser(userId);
    if (!user) {
      await bot.sendMessage(
        chatId,
        "❌ Please use /start first to register your account"
      );
      return;
    }

    const loadingMsg = await bot.sendMessage(
      chatId,
      "📊 Analyzing your last 10 matches... 🔄"
    );

    // Analyze match history
    const stats = await analyzeMatchHistory(user.puuid, 10);

    // Get champion recommendations
    const recommendations = analyzeChampionRecommendations(stats);
    const champReport = generateChampionReport(stats, recommendations);

    // Generate graph URLs
    const kdaGraphUrl = await generateKDAGraph(stats.matches, user.gameName);
    const champGraphUrl = await generateChampionChart(stats.matches);

    // Generate statistical roast
    const statsRoast = generateStatsRoast(stats);

    // Create analysis text
    const analysisText = `
📈 **${user.gameName} - Last 10 Matches Analysis**

**Overall Stats:**
• Win Rate: ${stats.winRate}% (${stats.wins}W - ${stats.losses}L)
• Avg K/D/A: ${stats.avgKills}/${stats.avgDeaths}/${stats.avgAssists}
• Avg KDA Ratio: ${stats.avgKDA}
• Avg CS/min: ${stats.avgCS}
• Avg Gold/min: ${stats.avgGold}
• Avg Damage: ${stats.avgDamage}
• Avg Vision Score: ${stats.avgVision}

**Champion Pool:**
🟢 Best: ${stats.bestChamp?.name} (${stats.bestChamp?.winRate}% WR, ${stats.bestChamp?.games}G)
🔴 Worst: ${stats.worstChamp?.name} (${stats.worstChamp?.winRate}% WR, ${stats.worstChamp?.games}G)

**Death Analysis:**
• High death games (8+): ${stats.highDeathMatches}/10
• Max deaths in a game: ${stats.maxDeathsInMatch}

🔥 **Statistical Roast:**
"${statsRoast}"
    `;

    // Send analysis with graphs
    await bot.deleteMessage(chatId, loadingMsg.message_id).catch(() => {});
    
    await bot.sendMessage(chatId, analysisText, { parse_mode: 'Markdown' });
    
    // Send KDA graph as image from URL
    await bot.sendPhoto(chatId, kdaGraphUrl, {
      caption: '📊 K/D/A Trend Over Last 10 Matches'
    }).catch((err) => {
      console.error('Error sending KDA graph:', err);
    });

    // Send Champion graph as image from URL
    await bot.sendPhoto(chatId, champGraphUrl, {
      caption: '🎯 Champion Performance Breakdown'
    }).catch((err) => {
      console.error('Error sending champion graph:', err);
    });

    // Send champion recommendations
    await bot.sendMessage(chatId, champReport, { parse_mode: 'Markdown' }).catch((err) => {
      console.error('Error sending champion report:', err);
    });

  } catch (error) {
    console.error('Error in handleAnalysisCommand:', error);
    await bot.sendMessage(
      chatId,
      `❌ Error: ${error.message}`
    );
  }
}
