'use client';

import {
  AtSymbolIcon,
  PhotoIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { Button } from '@/app/ui/button';
import { updateCustomer } from '@/app/lib/actions';
import { useActionState } from 'react';
import { CustomerForm, CustomerState } from '@/app/lib/types';

export default function EditInvoiceForm({
  customer,
}: {
  customer: CustomerForm;
}) {
  const initialState: CustomerState = { message: null, errors: {} };
  const updateCustomerWithId = updateCustomer.bind(null, customer.id);
  const [state, formAction] = useActionState(
    updateCustomerWithId,
    initialState
  );

  return (
    <form action={formAction}>
      <div className='rounded-md bg-gray-50 p-4 md:p-6'>
        <div className='mb-4'>
          <label htmlFor='name' className='mb-2 block text-sm font-medium'>
            Modify your Name
          </label>
          <div className='relative mt-2 rounded-md'>
            <div className='relative'>
              <input
                id='name'
                name='name'
                type='text'
                placeholder='Modify your Name'
                className='peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500'
                aria-describedby='name-error'
                defaultValue={customer.name}
              />
              <UserCircleIcon className='pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900' />
            </div>
            <div id='name-error' aria-live='polite' aria-atomic='true'>
              {state.errors?.name &&
                state.errors.name.map((error: string) => (
                  <p className='mt-2 text-sm text-red-500' key={error}>
                    {error}
                  </p>
                ))}
            </div>
          </div>
          <label htmlFor='email' className='mb-2 block text-sm font-medium'>
            Modify your Email Adress
          </label>
          <div className='relative mt-2 rounded-md'>
            <div className='relative'>
              <input
                id='email'
                name='email'
                type='email'
                placeholder='Modify your Email Adress'
                className='peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500'
                aria-describedby='email-error'
                defaultValue={customer.email}
              />
              <AtSymbolIcon className='pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900' />
            </div>
            <div id='email-error' aria-live='polite' aria-atomic='true'>
              {state.errors?.email &&
                state.errors.email.map((error: string) => (
                  <p className='mt-2 text-sm text-red-500' key={error}>
                    {error}
                  </p>
                ))}
            </div>
          </div>
          <label htmlFor='imageUrl' className='mb-2 block text-sm font-medium'>
            Modify your Image URL
          </label>
          <div className='relative mt-2 rounded-md'>
            <div className='relative'>
              <input
                id='imageUrl'
                name='imageUrl'
                type='url'
                placeholder=' Modify your Image URL'
                className='peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500'
                aria-describedby='imageUrl-error'
                defaultValue={customer.image_url}
              />
              <PhotoIcon className='pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900' />
            </div>
            <div id='email-error' aria-live='polite' aria-atomic='true'>
              {state.errors?.imageUrl &&
                state.errors.imageUrl.map((error: string) => (
                  <p className='mt-2 text-sm text-red-500' key={error}>
                    {error}
                  </p>
                ))}
            </div>
          </div>
        </div>
        {state.message && (
          <p className='mt-2 text-sm text-red-500' key={state.message}>
            {state.message}
          </p>
        )}
      </div>
      <div className='mt-6 flex justify-end gap-4'>
        <Link
          href='/dashboard/customers'
          className='flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200'
        >
          Cancel
        </Link>
        <Button type='submit'>Update Customer</Button>
      </div>
    </form>
  );
}
