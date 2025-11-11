# ❓ FAQ & Examples

## 🎯 Frequently Asked Questions

### Q: Do I need to know JavaScript to use this?
**A:** No! Just follow the SETUP.md guide. No coding needed unless you want to customize.

### Q: Is this really free?
**A:** Yes! All APIs have free tiers:
- Telegram: 100% free
- Groq: Free tier (30 requests/min)
- Riot API: Free tier (limited but enough)
- MongoDB: Free tier (512MB)
- Hosting: Railway/Render/Replit all have free options

### Q: What if I don't want to use Groq?
**A:** You can replace it with:
- Claude (Anthropic) - free tier available
- OpenAI GPT-4o mini - cheap option
- Llama via Replicate - free tier
- Local LLM with Ollama - completely free

Just modify `ai.js` file.

### Q: Can multiple people use my bot?
**A:** Yes! Each Telegram user has their own data stored in MongoDB. Your one bot can serve unlimited users (within API rate limits).

### Q: How often can I use /roast?
**A:** Unlimited! But Groq has 30 requests/minute limit. If you hit it, wait a minute.

### Q: Will my data be safe in MongoDB?
**A:** Yes. Use:
- IP whitelist in MongoDB
- Strong password
- Don't share connection string

### Q: What if Riot API rate limits me?
**A:** It's limited but free for development. If you run out:
- Wait for limits to reset (daily)
- Or pay for higher tier ($5/month)

### Q: Can I customize the roasts?
**A:** Absolutely! Edit `ai.js`:
- Change system message to be funnier/meaner/nicer
- Modify what stats are included
- Change roasting style

### Q: How do I update the bot after deploying?
**A:** Push new code to GitHub → Railway/Render auto-redeploys

### Q: What if something breaks?
**A:** Check logs:
- Local: Look at terminal output
- Railway: Dashboard → Deployments → View logs
- Render: Dashboard → Logs

---

## 💬 Example Bot Conversations

### Example 1: First Time User

```
User: /start
Bot: 🎮 Welcome to the League Roaster Bot!
     Send your game name (the one before #) and tag line (the one after #)
     Example: If your Riot ID is PlayerName#NA1, send:
     PlayerName#NA1

User: Doublelift#NA1
Bot: 🔍 Searching for your account...
     ✅ Account saved!
     
     📝 Name Roast:
     "Doublelift? More like Quadruple-Drop!"
     
     Now use /roast to get roasted on matches!

User: /roast
Bot: 🎮 Fetching your latest match...
     📊 Match Roast:
     
     🎯 Champion: Aphelios
     📍 Role: ADC
     ⚔️ K/D/A: 12/3/15
     📈 KDA: 9.0
     🧿 CS: 456
     ✅ WIN
     
     🔥 "12 kills and it STILL felt like your teammates were 1v5.
     At this point, just boot everyone else and Aphelios 1v9."
```

### Example 2: Experienced User

```
User: /roast
Bot: 🎮 Fetching your latest match...
     📊 Match Roast:
     
     🎯 Champion: Lee Sin
     📍 Role: JUNGLE
     ⚔️ K/D/A: 3/8/6
     📈 KDA: 1.13
     🧿 CS: 145
     ❌ LOSS
     
     🔥 "3 kills, 8 deaths - you were literally a ward that talks.
     Your Lee Sin kicks sent your teammates to the shadow realm.
     The enemy jungler has you blocked."
```

### Example 3: New Player

```
User: /start
Bot: 🎮 Welcome to the League Roaster Bot!...

User: xXProGamer420Xx#EUW1
Bot: 🔍 Searching for your account...
     ❌ Player not found!
     Make sure your Riot ID (GameName#TagLine) is correct!
     Hint: Check your League client under settings

User: ProGamer420#EUW1
Bot: ✅ Account saved!
     
     📝 Name Roast:
     "Your name screams 2013 clan membership. Did you get that
     from a hat factory?"
```

### Example 4: Multiple Users

```
User1: /roast
Bot: 🎮 Fetching your latest match...
     [Generates roast for User1]

User2: /roast
Bot: 🎮 Fetching your latest match...
     [Generates different roast for User2]

User3: /start
Bot: Welcome User3!
     [User3 registers independently]
```

---

## 🎮 LoL-Specific Examples

### Diamond Player (Good Stats)

```
Champion: Yasuo
K/D/A: 15/2/10
KDA: 12.5
CS: 380
Damage: 18,000
Win: ✅

Potential Roast:
"15 kills and you're still somehow the most toxic person in the game.
Congratulations on carrying, now work on your personality."
```

### Bronze Player (Rough Game)

```
Champion: Garen
K/D/A: 1/12/3
KDA: 0.33
CS: 98
Damage: 4,000
Time Dead: 240s
Loss: ❌

Potential Roast:
"You died so much the enemy team probably thinks you're a support.
12 deaths and a Garen? The report button just created a support ticket."
```

### Support Player (Great Plays)

```
Champion: Thresh
K/D/A: 2/1/25
KDA: 27.0
Vision Score: 85
Wards Placed: 42
Win: ✅

Potential Roast:
"25 assists and your ADC still complains. At this point you should
be a coach. Your vision game is literally the only reason your team
has functioning eyes."
```

---

## 🔄 Troubleshooting Scenarios

### Scenario 1: Bot Doesn't Respond

**Symptoms:** Send command → No response

**Solutions (in order):**
1. Is bot running? Check terminal for `✅ Bot is running...`
2. Did you copy .env file? Check for `cp .env.example .env`
3. Are API keys valid? Run `node verify.js`
4. Is internet connection working?

**Fix:**
```bash
# Kill current bot (Ctrl+C)
# Check .env file
cat .env
# Run verification
node verify.js
# Restart
npm start
```

### Scenario 2: "Player not found" Error

**Symptoms:** /start works but says player not found

**Possible Causes:**
- Wrong summoner name format
- Typo in game name or tag line
- Account doesn't exist
- Riot API hasn't indexed it yet

**Solution:**
1. Check exact spelling in League client
2. Make sure format is `GameName#TagLine`
3. Try with a famous player first: `Faker#NA1`
4. Wait a few hours if newly created account

### Scenario 3: MongoDB Connection Error

**Symptoms:** Bot starts but crashes with MongoDB error

**Fix:**
1. Check connection string in .env
2. Replace `<password>` with actual password
3. In MongoDB Atlas:
   - Go to Network Access
   - Add your IP address (or allow all: `0.0.0.0/0`)
4. Test connection: `node verify.js`

### Scenario 4: Groq Quota Exceeded

**Symptoms:** Bot responds: "Error: Failed to generate roast"

**Cause:** Hit 30 requests/minute limit

**Fix:**
1. Wait 1 minute
2. Try again
3. To increase: Upgrade Groq plan (paid)

---

## 📊 Cost Breakdown (Monthly)

| Service | Free Tier | Typical Cost |
|---------|-----------|--------------|
| Telegram | ✅ Forever Free | - |
| Groq | ✅ 30 req/min | Free - sufficient |
| Riot API | ✅ Development | Free - sufficient |
| MongoDB | ✅ 512MB | Free - sufficient |
| Railway | ✅ $5 credit | $0 (with credit) |
| Render | ✅ 750 hours | $0 |
| Replit | ✅ Always-on | $0 |

**Total: $0-5/month** depending on hosting choice

---

## 🎨 Customization Examples

### Make Roasts Meaner

Edit `ai.js`, change system message:
```javascript
system: "You are a RUTHLESS League roaster. Be savage, harsh, and merciless."
```

### Make Roasts Funnier (But Nice)

```javascript
system: "You are a hilarious esports commentator. Make funny roasts that are clever but not mean."
```

### Include More Stats

Edit the `roastMatchPerformance()` function:
```javascript
const statsText = `
  ... existing stats ...
  Item 1: ${playerStats.item0}
  Item 2: ${playerStats.item1}
  ... more items ...
`;
```

### Add Custom Commands

In `bot.js`:
```javascript
bot.onText(/\/stats/, async (msg) => {
  // Your custom stats command
});
```

---

## ⚙️ Advanced Configuration

### Change AI Model

In `ai.js`, replace `mixtral-8x7b-32768` with:
- `llama2-70b-4096` (Groq alternative)
- `gemma-7b-it` (Groq alternative)
- Any OpenAI model (requires adapter)

### Use Different Database

Replace MongoDB with:
- PostgreSQL + pg driver
- Firebase
- DynamoDB
- Supabase

### Add Webhook Mode

For production deployments:
```javascript
// Instead of polling
bot = new TelegramBot(TOKEN, { webHook: { port: 3000 } });
```

---

## 🆘 Getting More Help

1. **Telegram Bot Documentation**: https://core.telegram.org/bots
2. **Groq Community**: https://discord.gg/groq
3. **Riot Developer Community**: https://www.reddit.com/r/leagueoflegends/
4. **MongoDB Docs**: https://docs.mongodb.com/
5. **Node.js Help**: https://nodejs.org/en/docs/

---

## 🎁 Pro Tips

💡 **Tip 1:** Test locally before deploying
```bash
npm start
# Send messages in Telegram
# Check that everything works
# Then deploy
```

💡 **Tip 2:** Use `console.log()` for debugging
```javascript
console.log('User ID:', userId); // Shows in your terminal
```

💡 **Tip 3:** Check database directly
```javascript
// In MongoDB Atlas, go to Collections → View data
```

💡 **Tip 4:** Backup your .env file
```bash
# Keep a safe copy (NOT in Git!)
cp .env .env.backup
```

💡 **Tip 5:** Monitor API usage
- Groq Dashboard: Check request count
- Riot: Check rate limit headers
- MongoDB: Check storage usage

---

**Happy roasting!** 🔥 May your bot be swift and your roasts be savage! 🎮
