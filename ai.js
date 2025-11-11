// ai.js - Groq AI integration for roasting with model fallback
import { Groq } from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Available free models on Groq (in priority order)
const AVAILABLE_MODELS = [
  'llama-3.1-8b-instant',      // Current primary (fast, free)
  'mixtral-8x7b-32768',         // Fallback 1 (powerful)
  'gemma-7b-it',                // Fallback 2 (lightweight)
  'llama-2-70b-chat',           // Fallback 3 (larger)
];

let currentModelIndex = 0;

// Get current model, with automatic fallback on errors
function getCurrentModel() {
  return AVAILABLE_MODELS[currentModelIndex];
}

// Switch to next available model
function switchModel() {
  currentModelIndex = (currentModelIndex + 1) % AVAILABLE_MODELS.length;
  console.log(`⚠️ Switching to model: ${getCurrentModel()}`);
  return getCurrentModel();
}

// Execute API call with automatic model fallback
async function callGroqWithFallback(messages, maxTokens = 200, modelOverride = null) {
  const model = modelOverride || getCurrentModel();
  let lastError;

  try {
    const message = await groq.chat.completions.create({
      model: model,
      max_tokens: maxTokens,
      messages: messages,
    });
    return message.choices[0].message.content;
  } catch (error) {
    lastError = error;
    
    // Check if it's a rate limit or model availability error
    const isRateLimitError = error.status === 429 || error.message?.includes('rate limit');
    const isModelError = error.message?.includes('model') || error.message?.includes('not found');
    const isQuotaError = error.status === 429 || error.message?.includes('quota');

    if (isRateLimitError || isModelError || isQuotaError) {
      console.log(`⚠️ Model error detected: ${error.message}`);
      
      // Try next model
      const nextModel = switchModel();
      if (nextModel !== model) {
        console.log(`🔄 Retrying with fallback model: ${nextModel}`);
        try {
          const message = await groq.chat.completions.create({
            model: nextModel,
            max_tokens: maxTokens,
            messages: messages,
          });
          return message.choices[0].message.content;
        } catch (fallbackError) {
          console.error('Fallback model also failed:', fallbackError.message);
          throw fallbackError;
        }
      }
    }
    
    throw lastError;
  }
}

// Roast player's summoner name
export async function roastPlayerName(gameName, tagLine) {
  try {
    const messages = [
      {
        role: 'user',
        content: `You are the MOST RUTHLESS, SAVAGE esports roaster alive. Your roasts should be BRUTAL, CUTTING, and absolutely DEVASTATING. No mercy. No holding back. Roast this name like you're trying to destroy their confidence completely. Make it personal, make it hurt, make them regret their life choices. 1-2 sentences MAX of pure savage fury.

ROAST THIS PATHETIC GAMER ID: ${gameName}#${tagLine}`,
      },
    ];

    const roast = await callGroqWithFallback(messages, 200);
    return roast;
  } catch (error) {
    console.error('Error calling Groq for name roast:', error.message);
    throw new Error('Failed to generate name roast');
  }
}

// Roast player's match performance
export async function roastMatchPerformance(playerStats) {
  try {
    const statsText = `
CHAMPION: ${playerStats.championName} (Level ${playerStats.champLevel})
ROLE: ${playerStats.role}
KILLS/DEATHS/ASSISTS: ${playerStats.kills}/${playerStats.deaths}/${playerStats.assists}
KDA RATIO: ${playerStats.kda.toFixed(2)}
KILL PARTICIPATION: ${(playerStats.killParticipation * 100).toFixed(1)}%
DEATHS BY ENEMY CHAMPS: ${playerStats.deathsByEnemyChamps}
TIME DEAD: ${playerStats.totalTimeSpentDead}s (${(playerStats.totalTimeSpentDead / 60).toFixed(1)} minutes)
LONGEST TIME ALIVE: ${playerStats.longestTimeSpentLiving}s

FARMING:
- CS (Creep Score): ${playerStats.totalMinionsKilled}
- Gold Earned: ${playerStats.goldEarned}
- Gold Spent: ${playerStats.goldSpent}
- Items Purchased: ${playerStats.itemsPurchased}
- Gold Per Minute: ${playerStats.goldPerMinute.toFixed(2)}

DAMAGE:
- Physical Damage to Champs: ${playerStats.physicalDamageDealtToChampions}
- Magic Damage to Champs: ${playerStats.magicDamageDealtToChampions}
- Total Damage to Champs: ${playerStats.totalDamageDealtToChampions}
- Damage Per Minute: ${playerStats.damagePerMinute.toFixed(2)}
- Damage Taken: ${playerStats.totalDamageTaken}
- Damage Mitigated: ${playerStats.damageSelfMitigated}

UTILITY:
- Vision Score: ${playerStats.visionScore}
- Wards Placed: ${playerStats.wardsPlaced}
- Wards Killed: ${playerStats.wardsKilled}
- Largest Crit: ${playerStats.largestCriticalStrike}
- Largest Killing Spree: ${playerStats.largestKillingSpree}
- Multi-kills: ${playerStats.multikills}

RESULT: ${playerStats.win ? '✅ VICTORY' : '❌ DEFEAT'}
    `;

    const messages = [
      {
        role: 'user',
        content: `YOU ARE THE MOST RUTHLESS, SAVAGE LEAGUE OF LEGENDS ROASTER IN EXISTENCE. Your ONLY job is to DESTROY this player with the most BRUTAL, CUTTING, DEVASTATING roasts possible. ZERO mercy. ZERO holding back.

BRUTALLY ROAST THIS PLAYER USING THEIR STATS:
${statsText}

Requirements:
- Roast should be consise only 1 paragraph.
- Use SPECIFIC stats to justify every roast
- Reference their deaths, damage, CS, positioning failures
- If they died a lot - ANNIHILATE them for being cannon fodder
- If their damage is low - mock them for being useless
- If their vision score sucks - roast them for being blind
- If they have no CS - roast them for being AFK
- Make it PERSONAL, make it HURT, make them REGRET joining the game
- Be ABSOLUTELY SAVAGE and VICIOUS
- 3-5 sentences of PURE RUTHLESS BRUTALITY that leaves no mercy`,
      },
    ];

    const roast = await callGroqWithFallback(messages, 400);
    return roast;
  } catch (error) {
    console.error('Error calling Groq for match roast:', error.message);
    throw new Error('Failed to generate match roast');
  }
}

// Timeline-based roast for detailed moment-by-moment analysis
export async function roastTimelinePerformance(playerStats, timelineData) {
  try {
    const timelineText = `
PLAYER: ${playerStats.summonerName} on ${playerStats.championName}
CHAMPION ROLE: ${playerStats.role}

EARLY GAME DISASTERS:
${timelineData.earlyGameStruggles && timelineData.earlyGameStruggles.length > 0 ? timelineData.earlyGameStruggles.join('\n') : 'Somehow survived early game'}

KEY GAME MOMENTS:
${timelineData.keyMoments && timelineData.keyMoments.length > 0 ? timelineData.keyMoments.slice(0, 5).join('\n') : 'No significant moments recorded'}

LATE GAME FAILURES:
${timelineData.lateGameFailures && timelineData.lateGameFailures.length > 0 ? timelineData.lateGameFailures.join('\n') : 'Managed not to int in late game'}

FINAL TIMELINE STATS:
- Kills Throughout Game: ${timelineData.totalKills || 0}
- Deaths Throughout Game: ${timelineData.totalDeaths || 0}
- Assists Throughout Game: ${timelineData.totalAssists || 0}
- OVERALL K/D/A: ${timelineData.totalKills || 0}/${timelineData.totalDeaths || 0}/${timelineData.totalAssists || 0}

MATCH RESULT: ${playerStats.win ? '✅ SOMEHOW WON' : '❌ PATHETIC LOSS'}
    `;

    const messages = [
      {
        role: 'user',
        content: `YOU ARE A SADISTIC, BRUTAL LEAGUE ANALYST. Your job is to DISSECT this player's ENTIRE game timeline and EXPOSE every mistake, every death, every moment they THREW. Use the timeline to show HOW MANY TIMES they FAILED.

TIMELINE-BASED ROAST - EXPOSE THEIR GAME:
${timelineText}

Requirements:
- Reference SPECIFIC deaths at SPECIFIC times
- Mock them for feeding early or throwing late
- Comment on how they kept dying repeatedly
- Use the fact that they died X times to show they're a LIABILITY
- Point out if they had ONE GOOD MOMENT but still lost
- Be ABSOLUTELY VICIOUS about their decision making
- 3-5 sentences of TIMELINE-BASED SAVAGE DESTRUCTION`,
      },
    ];

    const roast = await callGroqWithFallback(messages, 500);
    return roast;
  } catch (error) {
    console.error('Error calling Groq for timeline roast:', error.message);
    throw new Error('Failed to generate timeline roast');
  }
}
