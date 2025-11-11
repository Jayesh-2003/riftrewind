#!/usr/bin/env node

// verify.js - Verify all API keys and connections
import 'dotenv/config';
import axios from 'axios';
import { MongoClient } from 'mongodb';
import { Groq } from 'groq-sdk';

console.log('🔍 Verifying League Roaster Bot Setup...\n');

// Check environment variables
console.log('📋 Checking environment variables...');
const required = ['TELEGRAM_BOT_TOKEN', 'GROQ_API_KEY', 'RIOT_API_KEY', 'MONGODB_URI'];
let allSet = true;

for (const env of required) {
  if (process.env[env]) {
    console.log(`  ✅ ${env} is set`);
  } else {
    console.log(`  ❌ ${env} is NOT set`);
    allSet = false;
  }
}

if (!allSet) {
  console.log('\n❌ Missing environment variables! Copy .env.example to .env and fill in your keys.');
  process.exit(1);
}

// Verify Telegram Token
console.log('\n📱 Verifying Telegram Bot Token...');
try {
  const response = await axios.get(
    `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/getMe`
  );
  console.log(`  ✅ Telegram bot: @${response.data.result.username}`);
} catch (error) {
  console.log('  ❌ Invalid Telegram token');
}

// Verify Riot API
console.log('\n🎮 Verifying Riot API Key...');
try {
  // Test with a famous player
  const response = await axios.get(
    'https://asia.api.riotgames.com/riot/account/v1/accounts/by-riot-id/Faker/NA1',
    {
      headers: { 'X-Riot-Token': process.env.RIOT_API_KEY },
    }
  );
  if (response.data.puuid) {
    console.log('  ✅ Riot API key is valid');
  }
} catch (error) {
  if (error.response?.status === 403) {
    console.log('  ❌ Invalid Riot API key (403 Forbidden)');
  } else if (error.response?.status === 401) {
    console.log('  ❌ Riot API key is not authenticated');
  } else {
    console.log(`  ❌ Error: ${error.message}`);
  }
}

// Verify Groq API
console.log('\n🤖 Verifying Groq API Key...');
try {
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  const response = await groq.models.list();
  if (response.data.length > 0) {
    console.log(`  ✅ Groq API key is valid (${response.data.length} models available)`);
  }
} catch (error) {
  console.log(`  ❌ Invalid Groq API key: ${error.message}`);
}

// Verify MongoDB
console.log('\n💾 Verifying MongoDB Connection...');
try {
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const admin = client.db('admin');
  await admin.command({ ping: 1 });
  console.log('  ✅ MongoDB connection successful');
  await client.close();
} catch (error) {
  console.log(`  ❌ MongoDB connection failed: ${error.message}`);
  console.log('     Make sure your IP is whitelisted in MongoDB Atlas');
}

console.log('\n✨ Verification complete!\n');
