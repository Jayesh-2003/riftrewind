# 🎮 Real-Time Live Match Tracking

## Overview

The **Live Match Tracking** feature allows the bot to monitor your League of Legends game in **REAL-TIME** and send you savage roasts as events happen during the game!

## Features

### 🔴 Real-Time Events Detected
- **Kills** - Get roasted when you secure a kill
- **Multi-kills** - LEGENDARY ROASTS for triple+ kills
- **Deaths** - Ruthless mocking when you die
- **Feeding Detection** - BRUTAL callouts for multiple deaths
- **Gold Loss Tracking** - Exposure of poor trades/fights
- **Live Status Updates** - Periodic K/D/A snapshots

### 🎯 How It Works

1. **Start Tracking**: Use `/live` while in a League game
2. **Real-Time Polling**: Bot polls Riot API every 3 seconds for match data
3. **Event Detection**: Analyzes changes in K/D/A, gold, items, etc.
4. **Instant Roasts**: AI-generated savage one-liners sent immediately
5. **Status Updates**: Full stats every 15 seconds
6. **Match End**: Automatic tracking stops when game ends

### 📊 Tracked Stats

```
K/D/A Ratio
Gold & GPM
CS (Creep Score)
Champion Level
Team vs Enemy Score
Item Purchases
```

## Commands

### `/live`
Start tracking your current live game
```
User: /live
Bot: 🎮 LIVE MATCH TRACKING STARTED
     Game Mode: CLASSIC
     Duration: 0m 0s
     Players: Loading...
```

### `/stop`
Stop tracking the current live game
```
User: /stop
Bot: ⏹️ Live tracking stopped.
```

## Event Examples

### Kill Event
```
🔥 KILL!

Got a kill with Ahri? Nice farm pick, probably against afk. 💀
K/D/A: 1/0/0

🎙️ *Another kill? Must be matching beginners lol*
```

### Multi-Kill Event
```
🔥🔥🔥 3x MULTIKILL! 🔥🔥🔥

Okay fine, that was actually impressive! Don't let it go to your head.
K/D/A: 3/0/2

🎙️ *Finally showing up? Only took you 3 minutes to get a double kill*
```

### Death Event
```
💀 DEAD AGAIN! 💀

That's 1 death(ies). You're becoming canon fodder.
K/D/A: 1/1/0
Gold: 1200

🎙️ *Walked into 5 enemies solo? That's not bravery, that's suicidal*
```

### Feeding Detection
```
💀💀💀 FEEDING DETECTED 💀💀💀

3 deaths already?! You're not a player, you're a liability!
K/D/A: 2/3/1

🎙️ *Actually that might be a new personal record for speed-running deaths*
```

## Status Updates

Every 15 seconds, you receive a full status snapshot:

```
⏱️ Live Match Update

📊 Game Time: 8m 45s
K/D/A: 5/2/3
💰 Gold: 4500
🧿 CS: 45
⚡ Level: 8
Team Score: 12 vs 8

🔄 Next update in 15s...
```

## Technical Details

### Files Used
- `live.js` - Core live tracking module
- `api.js` - Riot API endpoints (added `getLiveMatchData`)
- `ai.js` - Roasting generation for live events
- `handlers.js` - Command handlers
- `db.js` - Session storage
- `bot.js` - Command registration

### Database Schema

```javascript
// liveSessions collection
{
  telegram_userId: Number,
  matchId: String,
  chatId: Number,
  puuid: String,
  startedAt: Date,
  endedAt: Date,
  messageId: Number,
  createdAt: Date
}
```

### Event Detection Logic

The system tracks state changes:
- **Previous State** → **Current State**
- Calculates deltas (K/D/A, gold, level)
- Triggers events when thresholds exceeded
- Sends immediate roasts for each event

### Polling Mechanism

```
3-second poll cycle:
  1. Fetch current live match data from Riot API
  2. Compare with last known state
  3. Detect events (kills, deaths, etc.)
  4. Generate AI roasts
  5. Send Telegram messages
  6. Update session state
```

### Rate Limiting

- **Poll Interval**: 3 seconds (Riot API: ~1 request per poll)
- **Status Updates**: Every 15 seconds
- **Max Concurrent Sessions**: Unlimited (but be careful with API limits!)

## Error Handling

```
❌ No active game found! Start playing and try again. 🎮
❌ Error: Player not found or invalid credentials
❌ Polling errors automatically caught and logged
✅ Session auto-stops when match ends
✅ Graceful shutdown on bot stop
```

## API Requirements

This feature requires:
- ✅ **Riot API Key** (in `.env`)
- ✅ Valid **PUUID** (obtained during `/start`)
- ✅ Player must be **actively in a game**

### Riot API Endpoints Used

```
GET /lol/summoner/v4/summoners/by-puuid/{puuid}
GET /lol/spectator/v4/active-games/by-summoner/{summonerId}
```

## Performance Notes

⚠️ **Important**: Each active live session makes:
- 1 Riot API call every 3 seconds
- 1 Groq AI call per event (instant roasts)

**Recommendations**:
- Monitor Riot API rate limits (20 requests/second)
- Keep Groq API quota in mind
- Maximum ~5-10 concurrent live sessions recommended

## Future Enhancements

- 📺 Real-time minimap position tracking
- 🎪 Objective tracking (towers, dragons, barons)
- 👥 Teammate performance comparison
- 📈 Detailed damage heatmaps
- 🔔 Custom alert thresholds
- 📱 Mobile app integration

## Troubleshooting

### "No active game found"
- Make sure you're actually in-game before using `/live`
- Your game must be started, not in champion select

### "Error: Player not found"
- Check your PUUID is correct from `/start`
- Make sure you've registered with `/start` first

### No events being detected
- Events only trigger on actual changes
- Make sure game time is advancing
- Check your internet connection to Riot API

### Tracking stops unexpectedly
- Bot might have crashed - check logs
- Game ended - auto-stop is normal
- Use `/stop` to manually stop anytime

## Example Workflow

```
1. User starts a League game
2. User sends /live in Telegram
3. Bot confirms tracking started
4. User gets kills → Roasts incoming!
5. User dies → More roasts!
6. Game ends → Final stats sent
7. Bot automatically stops tracking
8. User can now use /roast for full breakdown
```

## Credits

- 🚀 Built with Node.js + Telegram Bot API
- 🤖 AI Roasting: Groq LLM Integration
- 📊 Data Source: Riot Games API
- 🔥 Savage Mode: Enabled

---

**Now get out there and play! Your roasts are waiting!** 🎮🔥
