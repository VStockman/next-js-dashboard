import { BanknotesIcon } from '@heroicons/react/24/outline';
import { lusitana } from '@/app/ui/fonts';

export default function VStockmanLogo() {
  return (
    <div
      className={`${lusitana.className} flex flex-row items-center leading-none text-white`}
    >
      <BanknotesIcon className='h-12 w-12 rotate-[15deg]' />
      <p className='text-[44px]'>VStockman</p>
    </div>
  );
}
