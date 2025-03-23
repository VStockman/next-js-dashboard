'use server';

import postgres from 'postgres';

export const ITEMS_PER_PAGE = 6;
export const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });
