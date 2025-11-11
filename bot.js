// bot.js - Main bot entry point with webhook support
import 'dotenv/config';
import express from 'express';
import TelegramBot from 'node-telegram-bot-api';
import * as db from './db.js';
import * as handlers from './handlers.js';

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const WEBHOOK_URL = process.env.WEBHOOK_URL;
const PORT = parseInt(process.env.PORT || '3000', 10);

// Determine if we're using webhook or polling
const useWebhook = WEBHOOK_URL && WEBHOOK_URL.trim().length > 0;

// Bot options - webhook doesn't need port in options, express handles it
const botOptions = { polling: !useWebhook };

const bot = new TelegramBot(TOKEN, botOptions);

// Bot setup
bot.setMyCommands([
  { command: 'start', description: 'Register your League account' },
  { command: 'roast', description: 'Get roasted on your latest match' },
  { command: 'analysis', description: 'Detailed match history analysis with graphs' },
  { command: 'help', description: 'Show help information' },
]);

console.log('🤖 League Roaster Bot starting...');

// Connect to database
try {
  await db.connectDB();
} catch (error) {
  console.error('❌ Failed to connect to database:', error.message);
  console.error('Make sure MONGODB_URI is set in your .env file');
  process.exit(1);
}

// Handle /start command
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  console.log(`📨 /start command from user ${userId}`);
  
  try {
    await handlers.handleStartCommand(bot, chatId, userId);
  } catch (error) {
    console.error('Error handling /start:', error);
    bot.sendMessage(chatId, '❌ Error: Could not process command');
  }
});

// Handle /roast command
bot.onText(/\/roast/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  console.log(`📨 /roast command from user ${userId}`);
  
  try {
    await handlers.handleRoastCommand(bot, chatId, userId);
  } catch (error) {
    console.error('Error handling /roast:', error);
    bot.sendMessage(chatId, '❌ Error: Could not process command');
  }
});

// Handle /help command
bot.onText(/\/help/, async (msg) => {
  const chatId = msg.chat.id;
  console.log(`📨 /help command from user ${msg.from.id}`);
  
  try {
    await handlers.handleHelpCommand(bot, chatId);
  } catch (error) {
    console.error('Error handling /help:', error);
    bot.sendMessage(chatId, '❌ Error: Could not process command');
  }
});

// Handle /analysis command
bot.onText(/\/analysis/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  console.log(`📨 /analysis command from user ${userId}`);
  
  try {
    await handlers.handleAnalysisCommand(bot, chatId, userId);
  } catch (error) {
    console.error('Error handling /analysis:', error);
    bot.sendMessage(chatId, '❌ Error: Could not process command');
  }
});

// Handle regular text messages
bot.on('message', async (msg) => {
  // Skip if it's a command
  if (msg.text?.startsWith('/')) return;

  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const text = msg.text;

  console.log(`💬 Message from user ${userId}: ${text}`);

  try {
    await handlers.handleUserInput(bot, chatId, userId, text);
  } catch (error) {
    console.error('Error handling message:', error);
    bot.sendMessage(chatId, '❌ Error: Could not process your message');
  }
});

// Error handler
bot.on('error', (error) => {
  console.error('🚨 Bot error:', error.message);
});

bot.on('polling_error', (error) => {
  console.error('🚨 Polling error:', error.message);
});

// ========== EXPRESS SERVER SETUP (REST API + WEBHOOK) ==========
// Import necessary modules for API
import * as api from './api.js';
import * as ai from './ai.js';
import { analyzeMatchHistory, generateStatsRoast, analyzeChampionRecommendations, generateChampionReport } from './stats.js';
import { generateKDAGraph, generateChampionChart } from './graphs.js';

// Create Express app
const app = express();
app.use(express.json());
app.use(express.static('public')); // Serve static files FIRST

// ========== REST API ENDPOINTS ==========

// Health check endpoint (only for /api requests, not root)
app.get('/api', (req, res) => {
  res.json({
    status: '✅ League Roaster Bot is running!',
    mode: useWebhook ? 'webhook' : 'polling',
    endpoints: {
      register: 'POST /api/register',
      roast: 'POST /api/roast',
      analysis: 'POST /api/analysis',
      nameRoast: 'POST /api/roast-name',
      matchDetails: 'GET /api/match/:matchId',
    }
  });
});

// API: Register a new user
app.post('/api/register', async (req, res) => {
  try {
    const { userId, gameName, tagLine } = req.body;

    if (!userId || !gameName || !tagLine) {
      return res.status(400).json({
        error: 'Missing required fields: userId, gameName, tagLine'
      });
    }

    console.log(`📝 API: Registering user ${userId} with ${gameName}#${tagLine}`);

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

    res.json({
      success: true,
      message: 'User registered successfully',
      data: {
        userId,
        gameName: playerData.gameName,
        tagLine: playerData.tagLine,
        puuid: playerData.puuid,
        nameRoast
      }
    });
  } catch (error) {
    console.error('API Error in /api/register:', error);
    res.status(500).json({
      error: error.message || 'Failed to register user'
    });
  }
});

// API: Get roast for latest match
app.post('/api/roast', async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        error: 'Missing required field: userId'
      });
    }

    console.log(`🔥 API: Roast request for user ${userId}`);

    // Get user data
    const user = await db.findUser(userId);

    if (!user) {
      return res.status(404).json({
        error: 'User not found. Please register first using /api/register'
      });
    }

    // Get recent match ID
    const matchId = await api.getRecentMatchId(user.puuid);

    if (!matchId) {
      return res.status(404).json({
        error: 'No recent matches found'
      });
    }

    // Get match details
    const matchData = await api.getMatchDetails(matchId);

    // Extract player stats
    const playerStats = api.extractPlayerStats(matchData, user.puuid);

    // Generate roast
    const roast = await ai.roastMatchPerformance(playerStats);

    // Get timeline data and roast (optional)
    let timelineRoast = null;
    try {
      const timelineData = await api.getMatchTimeline(matchId);
      const timelineRoasts = api.extractTimelineRoasts(timelineData, user.puuid);
      timelineRoast = await ai.roastTimelinePerformance(playerStats, timelineRoasts);
    } catch (error) {
      console.log('Timeline roast skipped:', error.message);
    }

    // Save stats
    await db.updateUserStats(userId, {
      lastMatch: matchId,
      lastStats: playerStats,
      lastRoastTime: new Date(),
    });

    res.json({
      success: true,
      data: {
        matchId,
        playerStats: {
          champion: playerStats.championName,
          level: playerStats.champLevel,
          role: playerStats.role,
          kills: playerStats.kills,
          deaths: playerStats.deaths,
          assists: playerStats.assists,
          kda: playerStats.kda.toFixed(2),
          cs: playerStats.totalMinionsKilled,
          gold: playerStats.goldEarned,
          goldPerMin: playerStats.goldPerMinute.toFixed(2),
          damage: playerStats.totalDamageDealtToChampions,
          damageTaken: playerStats.totalDamageTaken,
          visionScore: playerStats.visionScore,
          win: playerStats.win
        },
        roast,
        timelineRoast
      }
    });
  } catch (error) {
    console.error('API Error in /api/roast:', error);
    res.status(500).json({
      error: error.message || 'Failed to generate roast'
    });
  }
});

// API: Get detailed analysis with graphs
app.post('/api/analysis', async (req, res) => {
  try {
    const { userId, matchCount = 10 } = req.body;

    if (!userId) {
      return res.status(400).json({
        error: 'Missing required field: userId'
      });
    }

    console.log(`📊 API: Analysis request for user ${userId}`);

    const user = await db.findUser(userId);
    if (!user) {
      return res.status(404).json({
        error: 'User not found. Please register first using /api/register'
      });
    }

    // Analyze match history
    const stats = await analyzeMatchHistory(user.puuid, matchCount);

    // Get champion recommendations
    const recommendations = analyzeChampionRecommendations(stats);
    const champReport = generateChampionReport(stats, recommendations);

    // Generate graph URLs
    const kdaGraphUrl = await generateKDAGraph(stats.matches, user.gameName);
    const champGraphUrl = await generateChampionChart(stats.matches);

    // Generate statistical roast
    const statsRoast = generateStatsRoast(stats);

    res.json({
      success: true,
      data: {
        player: {
          gameName: user.gameName,
          tagLine: user.tagLine
        },
        overallStats: {
          winRate: stats.winRate,
          wins: stats.wins,
          losses: stats.losses,
          avgKills: stats.avgKills,
          avgDeaths: stats.avgDeaths,
          avgAssists: stats.avgAssists,
          avgKDA: stats.avgKDA,
          avgCS: stats.avgCS,
          avgGold: stats.avgGold,
          avgDamage: stats.avgDamage,
          avgVision: stats.avgVision
        },
        championPool: {
          best: stats.bestChamp,
          worst: stats.worstChamp,
          mostPlayed: stats.championStats
        },
        deathAnalysis: {
          highDeathMatches: stats.highDeathMatches,
          maxDeathsInMatch: stats.maxDeathsInMatch
        },
        graphs: {
          kdaTrend: kdaGraphUrl,
          championPerformance: champGraphUrl
        },
        roast: statsRoast,
        championReport: champReport,
        matches: stats.matches
      }
    });
  } catch (error) {
    console.error('API Error in /api/analysis:', error);
    res.status(500).json({
      error: error.message || 'Failed to generate analysis'
    });
  }
});

// API: Roast a player name without registration
app.post('/api/roast-name', async (req, res) => {
  try {
    const { gameName, tagLine } = req.body;

    if (!gameName || !tagLine) {
      return res.status(400).json({
        error: 'Missing required fields: gameName, tagLine'
      });
    }

    console.log(`📝 API: Name roast for ${gameName}#${tagLine}`);

    // Verify player exists
    const playerData = await api.getPlayerPUUID(gameName, tagLine);

    // Roast the name
    const roast = await ai.roastPlayerName(gameName, tagLine);

    res.json({
      success: true,
      data: {
        gameName: playerData.gameName,
        tagLine: playerData.tagLine,
        puuid: playerData.puuid,
        roast
      }
    });
  } catch (error) {
    console.error('API Error in /api/roast-name:', error);
    res.status(500).json({
      error: error.message || 'Failed to roast name'
    });
  }
});

// API: Get match details by matchId
app.get('/api/match/:matchId', async (req, res) => {
  try {
    const { matchId } = req.params;

    console.log(`📋 API: Match details for ${matchId}`);

    const matchData = await api.getMatchDetails(matchId);

    res.json({
      success: true,
      data: matchData
    });
  } catch (error) {
    console.error('API Error in /api/match:', error);
    res.status(500).json({
      error: error.message || 'Failed to fetch match details'
    });
  }
});

// API: Get player info by userId
app.get('/api/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    console.log(`👤 API: User info for ${userId}`);

    const user = await db.findUser(parseInt(userId));

    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        userId: user.telegram_userId,
        gameName: user.gameName,
        tagLine: user.tagLine,
        puuid: user.puuid,
        lastMatch: user.lastMatch,
        lastRoastTime: user.lastRoastTime,
        createdAt: user.created_at
      }
    });
  } catch (error) {
    console.error('API Error in /api/user:', error);
    res.status(500).json({
      error: error.message || 'Failed to fetch user info'
    });
  }
});

// ========== WEBHOOK SETUP FOR TELEGRAM ==========
if (useWebhook) {
  console.log('🌐 Setting up webhook mode...');
  
  // Webhook endpoint for Telegram
  const webhookPath = `/bot${TOKEN}`;
  app.post(webhookPath, (req, res) => {
    bot.processUpdate(req.body);
    res.sendStatus(200);
  });
  
  // Set webhook with Telegram
  (async () => {
    try {
      const webhookUrl = `${WEBHOOK_URL}${webhookPath}`;
      await bot.setWebHook(webhookUrl);
      console.log(`✅ Webhook set to: ${webhookUrl}`);
    } catch (error) {
      console.error('❌ Failed to set webhook:', error.message);
    }
  })();
}

// ========== START SERVER ==========
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server listening on port ${PORT}`);
  console.log(`📡 Mode: ${useWebhook ? 'Webhook' : 'Polling'}`);
  console.log(`🌐 REST API available at http://localhost:${PORT}/api`);
});

// Handle port already in use
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use!`);
    console.error('   Options:');
    console.error(`   1. Kill process on port ${PORT}`);
    console.error(`   2. Set different PORT in environment`);
    process.exit(1);
  } else {
    throw err;
  }
});

console.log('✅ Bot is running and waiting for messages...');
