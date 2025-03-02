import { openDatabaseSync, SQLiteDatabase } from 'expo-sqlite';

const db: SQLiteDatabase = openDatabaseSync("callout.db");

export const setupDatabase = async () => {
  await db.execAsync(
    `CREATE TABLE IF NOT EXISTS call_status (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      status TEXT NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    );`
  );
  console.log("Database initialized ✅");
};

export const saveStatus = async (status: string): Promise<void> => {
  await db.runAsync("INSERT INTO call_status (status) VALUES (?);", [status]);
  console.log("Status saved ✅");
};

export const getLatestStatus = async (): Promise<string | null> => {
  const result = (await db.getAllAsync(
    "SELECT status FROM call_status ORDER BY timestamp DESC LIMIT 1;"
  )) as any[];
  return result.length > 0 ? (result[0] as { status: string }).status : null;
};

export default db;
