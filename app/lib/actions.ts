'use server';

import { z } from 'zod';
import postgres from 'postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { signIn } from '@/auth';
import { AuthError } from 'next-auth';
import bcrypt from 'bcryptjs';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

const UserSchema = z.object({
  id: z.string(),
  name: z.string().min(1, {
    message: 'Please enter a first name and a last name.',
  }),
  email: z.string().email({
    message: 'Please enter a valid email address.',
  }),
  password: z
    .string()
    .min(6, { message: 'Please enter a password with at least 6 characters.' }),
});

const InvoiceSchema = z.object({
  id: z.string(),
  customerId: z.string({
    invalid_type_error: 'Please select a customer.',
  }),
  amount: z.coerce
    .number()
    .gt(0, { message: 'Please enter an amount greater than $0.' }),
  status: z.enum(['pending', 'paid'], {
    invalid_type_error: 'Please select an invoice status.',
  }),
  date: z.string(),
});

const CustomerSchema = z.object({
  id: z.string(),
  name: z.string().min(1, {
    message: 'Please enter a first name and a last name.',
  }),
  email: z.string().email({
    message: 'Please enter a valid email address.',
  }),
  imageUrl: z.string().url({
    message: 'Please enter a valid url.',
  }),
});

export type UserState = {
  errors?: {
    name?: string[];
    email?: string[];
    password?: string[];
  };
  message?: string | null;
};

export type InvoiceState = {
  errors?: {
    customerId?: string[];
    amount?: string[];
    status?: string[];
  };
  message?: string | null;
};

export type CustomerState = {
  errors?: {
    name?: string[];
    email?: string[];
    imageUrl?: string[];
  };
  message?: string | null;
};

const CreateInvoice = InvoiceSchema.omit({ id: true, date: true });
const CreateCustomer = CustomerSchema.omit({ id: true });
const CreateUser = UserSchema.omit({ id: true });

export async function createInvoice(
  prevState: InvoiceState,
  formData: FormData
) {
  const validatedFields = CreateInvoice.safeParse({
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

const UpdateInvoice = InvoiceSchema.omit({ id: true, date: true });
const UpdateCustomer = CustomerSchema.omit({ id: true });

export async function updateInvoice(
  id: string,
  prevState: InvoiceState,
  formData: FormData
) {
  const validatedFields = UpdateInvoice.safeParse({
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

export async function authenticate(
  prevState: string | undefined,
  formData: FormData
) {
  try {
    await signIn('credentials', formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Invalid credentials.';
        default:
          return 'Something went wrong.';
      }
    }
    throw error;
  }
}

export async function createUser(prevState: UserState, formData: FormData) {
  const validatedFields = CreateUser.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
    name: formData.get('name'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create User.',
    };
  }
  const { name, email, password } = validatedFields.data;

  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    await sql`
      INSERT INTO users (name, email, password)
      VALUES (${name}, ${email}, ${hashedPassword})
    `;
    return { message: 'User Created.' };
  } catch (error) {
    console.error(error);
    return {
      message: 'Database Error: Failed to Create User.',
    };
  }
}

export async function deleteCustomer(id: string) {
  try {
    await sql`DELETE FROM customers WHERE id = ${id}`;
  } catch (e) {
    console.error(e);
  }
  revalidatePath('/dashboard/customers');
}

export async function createCustomer(
  prevState: CustomerState,
  formData: FormData
) {
  const validatedFields = CreateCustomer.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    imageUrl: formData.get('imageUrl'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Customer.',
    };
  }

  const { name, email, imageUrl } = validatedFields.data;

  try {
    await sql`
      INSERT INTO customers (name, email, image_url)
      VALUES (${name}, ${email}, ${imageUrl})
    `;
  } catch (error) {
    console.error(error);
    return {
      message: 'Database Error: Failed to Create Customer.',
    };
  }

  revalidatePath('/dashboard/customers');
  redirect('/dashboard/customers');
}

export async function updateCustomer(
  id: string,
  prevState: CustomerState,
  formData: FormData
) {
  const validatedFields = UpdateCustomer.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    imageUrl: formData.get('imageUrl'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Update Customer.',
    };
  }

  const { name, email, imageUrl } = validatedFields.data;

  try {
    await sql`
      UPDATE customers
      SET name = ${name}, email = ${email}, image_url = ${imageUrl}
      WHERE id = ${id}
    `;
  } catch (error) {
    console.error(error);
    return { message: 'Database Error: Failed to Update Customer.' };
  }

  revalidatePath('/dashboard/customers');
  redirect('/dashboard/customers');
}
