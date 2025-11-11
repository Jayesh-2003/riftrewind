# 📚 Project Structure & File Guide

## 🗂️ Complete File Layout

```
RiftWind/
├── 🤖 CORE BOT FILES
│   ├── bot.js                  # Main bot entry point (START HERE)
│   ├── handlers.js             # Command logic (/start, /roast, /help)
│   ├── api.js                  # Riot API integration
│   ├── ai.js                   # Groq AI integration
│   └── db.js                   # MongoDB integration
│
├── ⚙️ CONFIGURATION
│   ├── package.json            # Dependencies & npm scripts
│   ├── .env.example            # Template for API keys
│   ├── .env                    # Your actual API keys (create this)
│   └── .gitignore              # What to ignore in Git
│
├── 📖 DOCUMENTATION
│   ├── README.md               # Full documentation (START HERE)
│   ├── SETUP.md                # Step-by-step setup guide
│   ├── SUMMARY.md              # Project overview
│   ├── FAQ.md                  # FAQ & examples
│   └── FILES.md                # This file
│
├── 🐳 DEPLOYMENT
│   ├── Dockerfile              # Docker configuration
│   ├── railway.toml            # Railway deployment config
│   └── verify.js               # Verify all connections
│
└── 📦 NODE_MODULES (created after npm install)
    └── ... all dependencies ...
```

---

## 📄 File Descriptions

### 🤖 Core Bot Files

#### `bot.js` (Main Entry Point)
**What it does:** 
- Starts the Telegram bot
- Listens for commands (/start, /roast, /help)
- Routes messages to handlers
- Connects to MongoDB

**Key Features:**
- Polling-based bot (doesn't need webhook)
- Error handling
- Command registration
- User state management

**When to edit:**
- Add new commands
- Change command names
- Modify error messages

**Example:**
```javascript
// Run the bot
npm start
// Bot listens for /start, /roast, /help commands
```

---

#### `handlers.js` (Command Logic)
**What it does:**
- /start handler: Registers new users
- /roast handler: Fetches and roasts recent match
- /help handler: Shows help message
- Message handler: Processes user input

**Key Functions:**
- `handleStartCommand()` - User registration flow
- `handleRoastCommand()` - Fetch and roast match
- `handleUserInput()` - Process regular messages

**When to edit:**
- Change command messages
- Modify registration flow
- Add new commands
- Change roast logic

---

#### `api.js` (Riot API)
**What it does:**
- Fetches player PUUID by game name + tag line
- Fetches recent match ID
- Fetches full match data
- Extracts player stats

**Key Functions:**
- `getPlayerPUUID(gameName, tagLine)` - Get account ID
- `getRecentMatchId(puuid)` - Get latest match
- `getMatchDetails(matchId)` - Get full match data
- `extractPlayerStats(matchData, puuid)` - Extract stats

**When to edit:**
- Change API endpoints
- Add more stat extraction
- Modify error handling
- Add new Riot API features

**Stats Extracted:**
- K/D/A (Kills/Deaths/Assists)
- CS (Creep Score)
- Gold earned
- Damage dealt & taken
- Vision score
- Wards placed/destroyed
- Time dead
- Win/loss status

---

#### `ai.js` (Groq AI Integration)
**What it does:**
- Generates witty name roasts
- Generates match performance roasts
- Handles AI prompt engineering

**Key Functions:**
- `roastPlayerName(gameName, tagLine)` - Name roast
- `roastMatchPerformance(playerStats)` - Match roast

**When to edit:**
- Change roast tone (meaner/nicer)
- Modify system prompts
- Add more context to roasts
- Switch to different AI model

**Models Available (Free):**
- mixtral-8x7b-32768 (current)
- llama2-70b-4096
- gemma-7b-it

---

#### `db.js` (MongoDB)
**What it does:**
- Connects to MongoDB Atlas
- Saves user account data
- Retrieves user data
- Updates user stats

**Key Functions:**
- `connectDB()` - Connect to MongoDB
- `findUser(telegramUserId)` - Get user data
- `saveUser(userData)` - Create/update user
- `updateUserStats()` - Update match stats

**Data Stored:**
```javascript
{
  telegram_userId: 123456789,
  puuid: "account-uuid",
  gameName: "PlayerName",
  tagLine: "NA1",
  lastMatch: "match-id",
  lastStats: { ... },
  created_at: Date,
  updated_at: Date
}
```

**When to edit:**
- Change database name
- Add more user fields
- Modify indexes
- Switch database provider

---

### ⚙️ Configuration Files

#### `package.json`
**What it is:**
- NPM package manifest
- Lists all dependencies
- Defines npm scripts

**Scripts:**
- `npm start` - Run bot in production
- `npm run dev` - Run bot with auto-reload (requires nodemon)

**Dependencies:**
- dotenv - Load .env file
- node-telegram-bot-api - Telegram bot
- mongodb - Database driver
- axios - HTTP requests
- groq-sdk - AI API

**When to edit:**
- Add new dependencies: `npm install package-name`
- Update package.json automatically
- Modify start scripts
- Change Node.js version requirement

---

#### `.env.example`
**What it is:**
- Template for environment variables
- Shows what keys you need
- Safe to commit to Git

**Variables:**
```
TELEGRAM_BOT_TOKEN     - Telegram bot token
GROQ_API_KEY          - Groq API key
RIOT_API_KEY          - Riot Games API key
MONGODB_URI           - MongoDB connection string
NODE_ENV              - Environment (development/production)
```

**When to edit:**
- Add new required environment variables
- Update example values
- Document new features

---

#### `.env` (NOT in Git)
**What it is:**
- Your actual API keys
- Created locally from .env.example
- NEVER commit to Git

**Setup:**
```bash
cp .env.example .env
# Edit .env with your real API keys
```

---

#### `.gitignore`
**What it is:**
- Tells Git what files to ignore
- Prevents accidental commits
- Includes: node_modules/, .env, logs

**Contents:**
- node_modules/ - Installed packages
- .env - Your API keys
- .DS_Store - macOS files
- *.log - Log files
- .idea/, .vscode/ - IDE configs

---

### 📖 Documentation Files

#### `README.md` (START HERE!)
**What it contains:**
- Project overview
- Features list
- Quick start guide
- Prerequisites
- Deployment options
- Troubleshooting
- API documentation links

**Read this if:**
- First time using the bot
- Need deployment instructions
- Have questions about features
- Want to contribute

---

#### `SETUP.md` (Step-by-Step Guide)
**What it contains:**
- How to get all API keys
- Local setup instructions
- How to run the bot
- Cloud deployment guides
- Common issues & fixes

**Read this if:**
- Setting up for first time
- Having setup problems
- Deploying to cloud
- Need detailed instructions

---

#### `SUMMARY.md` (Project Overview)
**What it contains:**
- What the bot does
- Quick start (3 steps)
- Tech stack
- Key features
- Future enhancements

**Read this if:**
- Want quick overview
- New to the project
- Need to explain to others

---

#### `FAQ.md` (Examples & Troubleshooting)
**What it contains:**
- Frequently asked questions
- Example bot conversations
- League-specific examples
- Troubleshooting scenarios
- Cost breakdown
- Customization examples
- Pro tips

**Read this if:**
- Have questions
- Want example conversations
- Having problems
- Want to customize

---

#### `FILES.md` (This File!)
**What it contains:**
- Complete file layout
- Detailed description of each file
- When to edit each file
- File purposes and contents

**Read this if:**
- Need to understand project structure
- Want to modify code
- Confused about a file's purpose

---

### 🐳 Deployment Files

#### `Dockerfile`
**What it is:**
- Container configuration
- Instructions for Docker
- Multi-stage build optimization

**When to use:**
- Deploy to Docker environments
- Use with Docker Compose
- Run on Kubernetes

**Usage:**
```bash
docker build -t roast-bot .
docker run -e TELEGRAM_BOT_TOKEN=xxx roast-bot
```

---

#### `railway.toml`
**What it is:**
- Railway.app deployment config
- Tells Railway how to run the bot
- Environment configuration

**When to use:**
- Deploy to Railway
- Automatic deployment from GitHub

---

#### `verify.js`
**What it is:**
- Verification script
- Tests all API connections
- Checks environment variables

**Usage:**
```bash
node verify.js
# Outputs:
# ✅ Telegram bot: @YourBotName
# ✅ Riot API key is valid
# ✅ Groq API key is valid
# ✅ MongoDB connection successful
```

**When to run:**
- After setting up .env
- Troubleshooting connection issues
- Before deploying
- Verifying setup is correct

---

## 🔄 File Dependencies

```
bot.js (Main)
├── handlers.js
│   ├── api.js
│   │   └── axios
│   ├── ai.js
│   │   └── groq-sdk
│   └── db.js
│       └── mongodb
├── db.js
└── dotenv
```

---

## 📊 Quick Reference: What to Edit

| Task | File to Edit |
|------|--------------|
| Add new command | bot.js + handlers.js |
| Change roast tone | ai.js (system message) |
| Add more stats | api.js + ai.js |
| Change database | db.js |
| Use different AI | ai.js (model) |
| Change welcome message | handlers.js |
| Fix API error | api.js or verify.js |
| Update documentation | README.md, etc. |

---

## 🚀 First Time Workflow

1. **Read:** README.md (understand what bot does)
2. **Setup:** Follow SETUP.md (get API keys, install deps)
3. **Configure:** Copy .env.example → .env (add your keys)
4. **Verify:** Run `node verify.js` (check all connections)
5. **Run:** `npm start` (start the bot)
6. **Test:** Message bot on Telegram (/start, /roast)
7. **Deploy:** Follow deployment instructions in README.md

---

## 💡 Tips

**Tip 1:** Start with README.md and SETUP.md
- They have all the information you need

**Tip 2:** Run verify.js if something doesn't work
- It checks all API connections quickly

**Tip 3:** Check console logs
- Terminal output shows what's happening
- Error messages help debug

**Tip 4:** Edit one file at a time
- Make change, test locally
- Then deploy if working

**Tip 5:** Keep your .env file safe
- Never share API keys
- Don't commit to Git
- Backup before changes

---

**You've got everything you need!** 🎉

Start with **README.md**, then follow **SETUP.md**, and you'll have a working bot in 10 minutes! 🚀
