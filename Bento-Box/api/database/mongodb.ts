import mongoose, { ConnectOptions } from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error('Variável MONGODB_URI não definida');
}

const clientOptions: ConnectOptions = {
  serverApi: { version: '1', strict: true, deprecationErrors: true },
  maxPoolSize: 10,
};

let cached = (global as any).mongoose;
if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

export async function connectToMongoDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, clientOptions).then(async (m) => {
      if (m.connection.db) {
        await m.connection.db.admin().command({ ping: 1 });
        console.log('✅ Conectado ao MongoDB!');
      }
      return m;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}