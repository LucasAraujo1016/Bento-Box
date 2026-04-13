import mongoose, { ConnectOptions } from 'mongoose';

const MONGODB_URI = "mongodb+srv://estudo:fatec123@bento-box.ohxbvjy.mongodb.net/?appName=bento-box";
const clientOptions: ConnectOptions = { 
  serverApi: { version: '1', strict: true, deprecationErrors: true },
  maxPoolSize: 10,
};

let cached = (global as any).mongoose;
if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

export async function connectToMongoDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, clientOptions).then(async (mongooseInstance) => {
      if (mongooseInstance.connection.db) {
          await mongooseInstance.connection.db.admin().command({ ping: 1 });
          console.log("Pinged your deployment. You successfully connected to MongoDB!");
      }
      return mongooseInstance;
    });
  }
  
  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error('Erro ao conectar no MongoDB', e);
    throw e;
  }

  return cached.conn;
}