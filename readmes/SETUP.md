# SETUP GUIDE - League Roaster Bot

## Step-by-Step Setup (5 minutes)

### 1️⃣ Get Your API Keys

#### Telegram Bot Token
```
1. Open https://t.me/BotFather
2. Send /start
3. Send /newbot
4. Follow instructions, give it a name (e.g., "LeagueRoasterBot")
5. Copy the token (looks like: 123456789:ABCdefGHIjklMNOpqrsTUVwxyz)
```

#### Groq API Key
```
1. Go to https://console.groq.com
2. Sign up (free)
3. Click "API Keys" on left sidebar
4. Click "Create API Key"
5. Copy the key
```

#### Riot API Key
```
1. Go to https://developer.riotgames.com
2. Sign up with your League account
3. Create a new API key
4. Copy it (valid for 24 hours during development)
```

#### MongoDB URI
```
1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up (free)
3. Create a new project
4. Create a cluster (M0 free tier)
5. Click "Connect" 
6. Choose "Drivers"
7. Copy connection string
8. Replace <password> with your password
```

### 2️⃣ Setup Locally

```bash
# Navigate to the bot folder
cd RiftWind

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your keys
notepad .env
```

Paste your keys into `.env`:
```
TELEGRAM_BOT_TOKEN=your_token_here
GROQ_API_KEY=your_groq_key_here
RIOT_API_KEY=your_riot_key_here
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/roastbot?retryWrites=true&w=majority
```

### 3️⃣ Run the Bot

```bash
npm start
```

You should see:
```
✅ Connected to MongoDB
✅ Bot is running and waiting for messages...
```

### 4️⃣ Test It!

Open Telegram and find your bot (search for the name you gave it)

Send `/start` and follow instructions!

---

## 🚀 Deploy to Cloud (FREE)

### Railway (Easiest - Takes 5 mins)

```bash
# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Login to Railway
railway login

# 3. Link your project
railway link

# 4. Add your environment variables
railway variables

# 5. Deploy
railway up
```

### Render (Also Easy)

1. Push code to GitHub
2. Go to https://render.com
3. Click "New +"
4. Select "Web Service"
5. Connect your GitHub repo
6. Add environment variables in settings
7. Deploy!

### Replit (No Git Required)

1. Go to https://replit.com
2. Click "Import from GitHub"
3. Enter your repo URL
4. Click "Create Repl"
5. Add secrets: Click "Secrets" icon
6. Add all your env variables
7. Click "Run"

---

## 📱 Using the Bot

**For you (the owner):**
```
/start - Register your League account
/roast - Get roasted on your latest match
/help - Show help
```

**Example:**
```
Me: /start
Bot: Send your game name and tag line
Me: Faker#NA1
Bot: ✅ Found! Here's your name roast: "Your name sounds like a faker... oh wait" 
     Now use /roast to get roasted on matches!

Me: /roast
Bot: [Fetches latest match and roasts your performance]
```

---

## 🐛 Common Issues & Fixes

**"Cannot find module 'dotenv'"**
```bash
npm install
```

**"Invalid API key"**
- Check .env file is in RiftWind folder
- Make sure no extra spaces in keys
- Verify keys are valid (test on their websites first)

**"Player not found"**
- Use exact format: GameName#TagLine
- Make sure account exists in League
- Riot API sometimes has delays

**"Cannot connect to MongoDB"**
- Check connection string is correct
- Add your IP to MongoDB Atlas whitelist
- Wait a moment and try again

---

## ✨ Features Your Bot Has

✅ Name roasting (Groq AI generates witty roasts)
✅ Match performance roasting (Stats-based)
✅ Account registration (saves to MongoDB)
✅ Latest match fetching (via Riot API)
✅ Persistent storage (remember users)
✅ Multi-user support
✅ Error handling
✅ Cool emojis! 🔥

---

## 📊 Free Tier Limits

- **Groq**: 30 requests/minute (plenty for casual use)
- **Riot API**: Limited but free (resets daily)
- **MongoDB**: 512MB storage (enough for 10k+ users)
- **Railway/Render**: Free tier with ~$5 credit

---

## 🎯 Next Steps

1. ✅ Setup locally and test
2. ✅ Deploy to Railway/Render
3. ✅ Share with friends
4. ✅ Customize roast prompts in ai.js if you want different tone
5. ✅ Add more commands if needed

---

**You're all set!** 🚀 Your bot is ready to roast! 🔥
