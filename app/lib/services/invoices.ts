'use server';

import { CreateInvoiceSchema, UpdateInvoiceSchema } from '../models/schemas';
import {
  InvoiceForm,
  InvoicesTable,
  InvoiceState,
  LatestInvoiceRaw,
} from '../models/types';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { formatCurrency } from '../utils';
import { ITEMS_PER_PAGE } from '../constants';
import postgres from 'postgres';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

export async function getLatestInvoices() {
  try {
    const data = await sql<LatestInvoiceRaw[]>`
        SELECT invoices.amount, customers.name, customers.image_url, customers.email, invoices.id
        FROM invoices
        JOIN customers ON invoices.customer_id = customers.id
        ORDER BY invoices.date DESC
        LIMIT 5`;

    const latestInvoices = data.map((invoice) => ({
      ...invoice,
      amount: formatCurrency(invoice.amount),
    }));
    return latestInvoices;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch the latest invoices.');
  }
}

export async function getFilteredInvoices(query: string, currentPage: number) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    const invoices = await sql<InvoicesTable[]>`
        SELECT
          invoices.id,
          invoices.amount,
          invoices.date,
          invoices.status,
          customers.name,
          customers.email,
          customers.image_url
        FROM invoices
        JOIN customers ON invoices.customer_id = customers.id
        WHERE
          customers.name ILIKE ${`%${query}%`} OR
          customers.email ILIKE ${`%${query}%`} OR
          invoices.amount::text ILIKE ${`%${query}%`} OR
          invoices.date::text ILIKE ${`%${query}%`} OR
          invoices.status ILIKE ${`%${query}%`}
        ORDER BY invoices.date DESC
        LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
      `;

    return invoices;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch invoices.');
  }
}

export async function getInvoicesPages(query: string) {
  try {
    const data = await sql`SELECT COUNT(*)
      FROM invoices
      JOIN customers ON invoices.customer_id = customers.id
      WHERE
        customers.name ILIKE ${`%${query}%`} OR
        customers.email ILIKE ${`%${query}%`} OR
        invoices.amount::text ILIKE ${`%${query}%`} OR
        invoices.date::text ILIKE ${`%${query}%`} OR
        invoices.status ILIKE ${`%${query}%`}
    `;

    const totalPages = Math.ceil(Number(data[0].count) / ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch total number of invoices.');
  }
}

export async function getInvoiceById(id: string) {
  try {
    const data = await sql<InvoiceForm[]>`
        SELECT
          invoices.id,
          invoices.customer_id,
          invoices.amount,
          invoices.status
        FROM invoices
        WHERE invoices.id = ${id};
      `;

    const invoice = data.map((invoice) => ({
      ...invoice,
      // Convert amount from cents to dollars
      amount: invoice.amount / 100,
    }));

    return invoice[0];
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch invoice.');
  }
}

export async function createInvoice(
  prevState: InvoiceState,
  formData: FormData
) {
  const validatedFields = CreateInvoiceSchema.safeParse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Invoice.',
    };
  }

  const { customerId, amount, status } = validatedFields.data;
  const amountInCents = amount * 100;
  const date = new Date().toISOString().split('T')[0];

  try {
    await sql`
      INSERT INTO invoices (customer_id, amount, status, date)
      VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
    `;
  } catch (error) {
    console.error(error);
    return {
      message: 'Database Error: Failed to Create Invoice.',
    };
  }

  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

export async function updateInvoice(
  id: string,
  prevState: InvoiceState,
  formData: FormData
) {
  const validatedFields = UpdateInvoiceSchema.safeParse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Update Invoice.',
    };
  }

  const { customerId, amount, status } = validatedFields.data;
  const amountInCents = amount * 100;

  try {
    await sql`
      UPDATE invoices
      SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
      WHERE id = ${id}
    `;
  } catch (error) {
    console.error(error);
    return { message: 'Database Error: Failed to Update Invoice.' };
  }

  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

export async function deleteInvoice(id: string) {
  try {
    await sql`DELETE FROM invoices WHERE id = ${id}`;
  } catch (e) {
    console.error(e);
  }
  revalidatePath('/dashboard/invoices');
}
