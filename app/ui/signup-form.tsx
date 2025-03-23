'use client';

import { lusitana } from '@/app/ui/fonts';
import {
  AtSymbolIcon,
  KeyIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import { ArrowRightIcon } from '@heroicons/react/20/solid';
import { Button } from '@/app/ui/button';
import { useActionState } from 'react';
import { createUser } from '@/app/lib/actions';
import { useSearchParams } from 'next/navigation';
import { UserState } from '../lib/types';

export default function SignUpForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/login';
  const initialState: UserState = { message: null, errors: {} };
  const [state, formAction, isPending] = useActionState(
    createUser,
    initialState
  );

  return (
    <form action={formAction} className='space-y-3'>
      <div className='flex-1 rounded-lg bg-gray-50 px-6 pb-4 pt-8'>
        <h1 className={`${lusitana.className} mb-3 text-2xl`}>
          Enter your Email and Password to sign up.
        </h1>
        <div className='w-full'>
          <div>
            <label
              className='mb-3 mt-5 block text-xs font-medium text-gray-900'
              htmlFor='name'
            >
              Name
            </label>
            <div className='relative'>
              <input
                className='peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500'
                id='name'
                type='text'
                name='name'
                placeholder='Enter your Full Name'
              />
              <UserCircleIcon className='pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900' />
              {state.errors?.name &&
                state.errors.name.map((error: string) => (
                  <p className='mt-2 text-sm text-red-500' key={error}>
                    {error}
                  </p>
                ))}
            </div>
          </div>
          <div>
            <label
              className='mb-3 mt-5 block text-xs font-medium text-gray-900'
              htmlFor='email'
            >
              Email
            </label>
            <div className='relative'>
              <input
                className='peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500'
                id='email'
                type='email'
                name='email'
                placeholder='Enter your email address'
              />
              <AtSymbolIcon className='pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900' />
              {state.errors?.email &&
                state.errors.email.map((error: string) => (
                  <p className='mt-2 text-sm text-red-500' key={error}>
                    {error}
                  </p>
                ))}
            </div>
          </div>
          <div className='mt-4'>
            <label
              className='mb-3 mt-5 block text-xs font-medium text-gray-900'
              htmlFor='password'
            >
              Password
            </label>
            <div className='relative'>
              <input
                className='peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500'
                id='password'
                type='password'
                name='password'
                placeholder='Enter password'
                minLength={6}
              />
              <KeyIcon className='pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900' />
              {state.errors?.password &&
                state.errors.password.map((error: string) => (
                  <p className='mt-2 text-sm text-red-500' key={error}>
                    {error}
                  </p>
                ))}
            </div>
          </div>
        </div>
        <input type='hidden' name='redirectTo' value={callbackUrl} />
        <Button className='mt-4 w-full' aria-disabled={isPending}>
          Sign Up <ArrowRightIcon className='ml-auto h-5 w-5 text-gray-50' />
        </Button>
        <div
          className='flex h-8 items-end space-x-1'
          aria-live='polite'
          aria-atomic='true'
        >
          {state.message && (
            <p className='mt-2 text-sm text-red-500' key={state.message}>
              {state.message}
            </p>
          )}
        </div>
      </div>
    </form>
  );
}
