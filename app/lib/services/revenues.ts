'use server';

import postgres from 'postgres';
import { Revenue } from '../models/types';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

export async function getRevenue() {
  try {
    const data = await sql<Revenue[]>`SELECT * FROM revenue`;

    return data;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch revenue data.');
  }
}
