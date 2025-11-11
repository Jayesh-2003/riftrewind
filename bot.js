// bot.js - Main bot entry point with webhook support
import 'dotenv/config';
import express from 'express';
import TelegramBot from 'node-telegram-bot-api';
import * as db from './db.js';
import * as handlers from './handlers.js';
import * as live from './live.js';

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
  { command: 'live', description: 'Track your current game LIVE 🎮' },
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

// Handle /live command
bot.onText(/\/live/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  console.log(`📨 /live command from user ${userId}`);
  
  try {
    await handlers.handleLiveCommand(bot, chatId, userId);
  } catch (error) {
    console.error('Error handling /live:', error);
    bot.sendMessage(chatId, '❌ Error: Could not process command');
  }
});

// Handle /stop command
bot.onText(/\/stop/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  console.log(`📨 /stop command from user ${userId}`);
  
  try {
    await handlers.handleStopLiveCommand(bot, chatId, userId);
  } catch (error) {
    console.error('Error handling /stop:', error);
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

// ========== WEBHOOK SETUP ==========
if (useWebhook) {
  console.log('🌐 Setting up webhook mode...');
  
  // Create Express app for webhook
  const app = express();
  app.use(express.json());
  
  // Health check endpoint
  app.get('/', (req, res) => {
    res.send('✅ League Roaster Bot is running!');
  });
  
  // Webhook endpoint
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
  
  // Start HTTP server with error handling
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Webhook server listening on port ${PORT}`);
  });
  
  // Handle port already in use
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`❌ Port ${PORT} is already in use!`);
      console.error('   Options:');
      console.error(`   1. Kill process on port ${PORT}`);
      console.error(`   2. Set different PORT in environment`);
      console.error(`   3. Use polling mode (set WEBHOOK_URL empty)`);
      process.exit(1);
    } else {
      throw err;
    }
  });
} else {
  console.log('📡 Using polling mode (local development)');
}

console.log('✅ Bot is running and waiting for messages...');
