import { z } from 'zod';

const UserSchema = z.object({
  id: z.string(),
  name: z.string().min(1, {
    message: 'Please enter your full name.',
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
    message: 'Please enter your full name.',
  }),
  email: z.string().email({
    message: 'Please enter a valid email address.',
  }),
  imageUrl: z.string().url({
    message: 'Please enter a valid url.',
  }),
});

export const CreateInvoiceSchema = InvoiceSchema.omit({ id: true, date: true });
export const CreateCustomerSchema = CustomerSchema.omit({ id: true });
export const CreateUserSchema = UserSchema.omit({ id: true });

export const UpdateInvoiceSchema = InvoiceSchema.omit({ id: true, date: true });
export const UpdateCustomerSchema = CustomerSchema.omit({ id: true });
