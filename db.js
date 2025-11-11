// db.js - MongoDB connection and operations
import { MongoClient } from 'mongodb';

let db = null;

export async function connectDB() {
  if (db) return db;

  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  db = client.db('roastbot');
  
  // Create indexes
  await db.collection('users').createIndex({ telegram_userId: 1 });
  
  console.log('✅ Connected to MongoDB');
  return db;
}

export function getDB() {
  if (!db) throw new Error('Database not connected');
  return db;
}

// User operations
export async function findUser(telegramUserId) {
  const db = getDB();
  return await db.collection('users').findOne({ telegram_userId: telegramUserId });
}

export async function saveUser(userData) {
  const db = getDB();
  return await db.collection('users').findOneAndUpdate(
    { telegram_userId: userData.telegram_userId },
    { $set: userData },
    { upsert: true, returnDocument: 'after' }
  );
}

export async function updateUserStats(telegramUserId, stats) {
  const db = getDB();
  return await db.collection('users').findOneAndUpdate(
    { telegram_userId: telegramUserId },
    { $set: { ...stats, updated_at: new Date() } },
    { returnDocument: 'after' }
  );
}

// Live session operations
export async function saveLiveSession(telegramUserId, sessionData) {
  const db = getDB();
  return await db.collection('liveSessions').findOneAndUpdate(
    { telegram_userId: telegramUserId },
    {
      $set: {
        telegram_userId: telegramUserId,
        ...sessionData,
        createdAt: new Date(),
      },
    },
    { upsert: true, returnDocument: 'after' }
  );
}

export async function endLiveSession(telegramUserId) {
  const db = getDB();
  return await db.collection('liveSessions').findOneAndUpdate(
    { telegram_userId: telegramUserId },
    { $set: { endedAt: new Date(), active: false } },
    { returnDocument: 'after' }
  );
}

export async function findLiveSession(telegramUserId) {
  const db = getDB();
  return await db.collection('liveSessions').findOne({
    telegram_userId: telegramUserId,
  });
}

export async function getActiveLiveSessions() {
  const db = getDB();
  return await db.collection('liveSessions').find({
    endedAt: { $exists: false },
  }).toArray();
}
