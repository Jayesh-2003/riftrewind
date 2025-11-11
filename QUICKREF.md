# ⚡ Quick Reference Card

## 🚀 Get Started in 5 Minutes

```bash
# 1. Install dependencies
npm install

# 2. Copy environment template
cp .env.example .env

# 3. Edit .env with your API keys
# (See SETUP.md for how to get keys)

# 4. Verify everything works
node verify.js

# 5. Run the bot!
npm start
```

---

## 📝 Environment Variables

| Variable | Where to Get | Example |
|----------|-------------|---------|
| TELEGRAM_BOT_TOKEN | @BotFather on Telegram | 123456789:ABCdefGHI... |
| GROQ_API_KEY | console.groq.com | gsk_xxxxx... |
| RIOT_API_KEY | developer.riotgames.com | RGAPI-xxxxx... |
| MONGODB_URI | mongodb.com/cloud/atlas | mongodb+srv://user:pass@cluster... |

---

## 🎮 Bot Commands

| Command | What It Does | Example |
|---------|-------------|---------|
| /start | Register your League account | User sends: /start |
| /roast | Get roasted on latest match | User sends: /roast |
| /help | Show help message | User sends: /help |

---

## 🔧 Common Commands

```bash
# Run locally
npm start

# Run with auto-reload (for development)
npm run dev

# Verify API connections
node verify.js

# Install new dependency
npm install package-name

# Check what's running
ps aux | grep node

# Stop the bot (in terminal)
Ctrl + C
```

---

## 🆘 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| "Cannot find module" | Run `npm install` |
| Bot doesn't respond | Check `.env` file has all keys |
| "Player not found" | Use format: GameName#TagLine |
| MongoDB error | Run `node verify.js` to debug |
| Groq quota exceeded | Wait 1 minute, limit is 30/min |
| API key invalid | Run `node verify.js` to check |

---

## 📱 Example Bot Usage

```
You: /start
Bot: Send your game name and tag line (GameName#TagLine)

You: Faker#NA1
Bot: ✅ Account saved!
     🔥 Name Roast: "[Witty roast]"
     Now use /roast!

You: /roast
Bot: 📊 Champion: Ahri
     K/D/A: 5/2/8
     🔥 Roast: "[Match roast]"
```

---

## ☁️ Deploy in 2 Minutes

### Railway
```bash
npm install -g @railway/cli
railway login
railway link
railway variables
railway up
```

### Render
1. Push to GitHub
2. Go to render.com
3. Create Web Service
4. Connect GitHub repo
5. Add environment variables
6. Deploy!

---

## 📊 File Structure

```
bot.js          ← Main bot
├─ handlers.js  ← Commands
├─ api.js       ← Riot API
├─ ai.js        ← Groq AI
└─ db.js        ← MongoDB

.env            ← Your API keys (copy from .env.example)
package.json    ← Dependencies
README.md       ← Full docs
```

---

## 💰 Cost

- **Telegram**: Free
- **Groq**: Free (30 req/min)
- **Riot API**: Free
- **MongoDB**: Free (512MB)
- **Hosting**: Free ($5 credit/month)

**Total: $0/month** ✨

---

## 🎯 What Stats Get Roasted?

- Champion played
- Role/position
- Kills/Deaths/Assists (K/D/A)
- KDA ratio
- CS (Creep Score)
- Gold earned
- Damage dealt/taken
- Vision score
- Wards placed/destroyed
- Time dead
- Win/loss status
- Kill participation

---

## ⚙️ Tech Stack

```
Frontend:    Telegram (UI)
Bot:         Node.js + node-telegram-bot-api
AI:          Groq API (Free)
API:         Riot Games API
Database:    MongoDB (Free tier)
Hosting:     Railway/Render/Replit
```

---

## 🔐 Security Checklist

- [ ] `.env` created from `.env.example`
- [ ] API keys added to `.env`
- [ ] `.env` is in `.gitignore`
- [ ] `.env` NOT committed to Git
- [ ] MongoDB IP whitelist configured
- [ ] MongoDB password is strong
- [ ] `verify.js` passes all checks

---

## 📚 Documentation Map

| Need Help With | Read This |
|---|---|
| What does it do? | README.md |
| How to set up? | SETUP.md |
| Got questions? | FAQ.md |
| Understanding files? | FILES.md |
| Project overview? | SUMMARY.md |
| API broken? | Troubleshooting in README.md |

---

## 🆓 Free API Tier Limits

| Service | Limit | Status |
|---------|-------|--------|
| Groq | 30 req/min | ✅ Plenty |
| Riot API | Development tier | ✅ Enough |
| MongoDB | 512MB storage | ✅ Good |
| Telegram | Unlimited | ✅ Perfect |

---

## 📈 Scaling (Optional)

If you need more:

**Groq:**
- Upgrade plan ($5-20/month)
- Or use different AI

**Riot API:**
- Upgrade tier ($5/month)
- Or implement caching

**MongoDB:**
- Upgrade tier ($9+/month)
- Or use PostgreSQL

**Hosting:**
- Railway: $5 base plan
- Render: $7+ for custom plan

---

## 💡 Pro Tips

1. **Backup .env:** `cp .env .env.backup`
2. **Monitor usage:** Check Groq dashboard
3. **Test locally:** Before deploying
4. **Use verify.js:** When debugging
5. **Check logs:** They show everything
6. **Version control:** Git ignore .env
7. **Document changes:** Keep notes

---

## 🚨 Emergency Commands

```bash
# Stop bot
Ctrl + C

# Kill stuck process
lsof -ti:PORT | xargs kill -9

# Check bot status
npm list (shows dependencies)

# Clean install
rm -rf node_modules
npm install

# Run verification
node verify.js
```

---

## 📞 Getting Help

1. Check **FAQ.md** for answers
2. Run `node verify.js` to diagnose
3. Check **README.md** troubleshooting
4. Look at console logs for errors
5. Check bot.js console.log() outputs

---

## ✅ Pre-Deployment Checklist

- [ ] `.env` has all 4 required keys
- [ ] `node verify.js` shows all green checkmarks
- [ ] `/start` command works locally
- [ ] `/roast` command works locally
- [ ] MongoDB storing data correctly
- [ ] No errors in console
- [ ] Code committed to GitHub (without .env!)
- [ ] Ready to deploy! 🚀

---

## 🎓 Next Steps

1. ✅ Read README.md (5 min)
2. ✅ Follow SETUP.md (5 min)
3. ✅ Get API keys (5 min)
4. ✅ Run locally (5 min)
5. ✅ Deploy to Railway (5 min)
6. ✅ Share with friends! (∞ fun)

**Total time: ~25 minutes to production!** 🎉

---

**You're ready!** Start with `npm install` and follow the steps above. Good luck! 🔥
