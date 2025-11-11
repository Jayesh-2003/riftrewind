# 🤖 League Roaster Bot - JavaScript Edition

A powerful Telegram bot that roasts League of Legends players on their gaming names and match performance using the free Groq AI API.

## ✨ Features

- 🎮 **Register your League account** with `/start` command
- 🔥 **Get roasted on your name** - Groq AI generates witty roasts
- 📊 **Get roasted on match performance** - Detailed stats-based roasting with `/roast`
- 💾 **Persistent storage** - Saves your account info in MongoDB
- 🚀 **Easy deployment** - Free hosting options available
- ⚡ **Fast** - Uses Groq's free tier for instant AI responses

## 🎯 Bot Commands

- `/start` - Register your League account (GameName#TagLine format)
- `/roast` - Get roasted on your latest League match
- `/help` - Show help information

## 📋 Prerequisites

You'll need to set up these free accounts:

1. **Telegram Bot Token**
   - Message [@BotFather](https://t.me/BotFather) on Telegram
   - Create a new bot and copy the token

2. **Groq API Key** (Free tier available!)
   - Sign up at [console.groq.com](https://console.groq.com)
   - Create an API key (free tier: 30 requests/minute)

3. **Riot API Key** (Free tier available!)
   - Sign up at [developer.riotgames.com](https://developer.riotgames.com)
   - Create a new API key (rate limited but free)

4. **MongoDB** (Free tier available!)
   - Create free account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
   - Create a cluster and get connection string

5. **Node.js**
   - Download from [nodejs.org](https://nodejs.org) (v18+)

## 🚀 Quick Start

### Local Development

```bash
# 1. Clone or download this project
cd RiftWind

# 2. Install dependencies
npm install

# 3. Create .env file from example
cp .env.example .env

# 4. Edit .env with your API keys
# Add your TELEGRAM_BOT_TOKEN, GROQ_API_KEY, RIOT_API_KEY, MONGODB_URI

# 5. Run the bot
npm start

# For development with auto-reload:
npm run dev
```

## 📦 Environment Variables

Copy `.env.example` to `.env` and fill in your credentials:

```env
TELEGRAM_BOT_TOKEN=your_bot_token_here
GROQ_API_KEY=your_groq_key_here
RIOT_API_KEY=your_riot_key_here
MONGODB_URI=your_mongodb_connection_string
NODE_ENV=production
```


## 📄 License

MIT License - Feel free to use and modify!

## 🤝 Contributing

Feel free to fork and submit pull requests!

## 💬 Support

If you have issues:
1. Check the troubleshooting section
2. Verify all API keys are correct
3. Check that MongoDB is connected
4. Look at console logs for error details

---

**Happy Roasting!** 🔥 May your enemies' stats be terrible! 😈
