import { useEffect, useState } from "react";
import type { Item } from "./ItemCard";

interface SelectedItemsUIProps {
  items: Item[];
}
interface Summary {
  totalAmount: number;
  totalItems: number;
}
const SelectedItemsUI = ({ items }: SelectedItemsUIProps) => {
  const [summary, setSummary] = useState<Summary>({
    totalAmount: 0,
    totalItems: 0,
  });
  useEffect(() => {
    const { totalAmount, totalItems } = items.reduce(
      (acc, item) => {
        acc.totalAmount += item.quantity * item.price;
        acc.totalItems += item.quantity;
        return acc;
      },
      { totalAmount: 0, totalItems: 0 }
    );
    setSummary({ totalAmount, totalItems });
  }, [items]);
  return (
    <div className='bg-blue-900 text-white p-4 rounded-xl w-full max-w-md'>
      <div className='flex items-center gap-2 mb-4'>
        <svg
          xmlns='http://www.w3.org/2000/svg'
          className='h-5 w-5 text-white'
          viewBox='0 0 20 20'
          fill='currentColor'
        >
          <path
            fill-rule='evenodd'
            d='M16.707 5.293a1 1 0 010 1.414l-7.5 7.5a1 1 0 01-1.414 0l-3.5-3.5a1 1 0 111.414-1.414L8 11.086l6.793-6.793a1 1 0 011.414 0z'
            clip-rule='evenodd'
          />
        </svg>
        <h2 className='font-semibold text-lg'>
          Selected Items ({summary.totalItems})
        </h2>
      </div>

      <div className='space-y-4 max-h-28 overflow-y-auto'>
        {items.map((item, key) => (
          <div key={key} className='flex justify-between items-start'>
            <div>
              <div className='font-bold flex items-center gap-1'>
                {item.ilustration}
                {item.name}
              </div>
              {/* <div className='text-sm text-gray-300'>Organic</div> */}
            </div>
            <div className='text-right'>
              <div className='font-bold'>${item.price * item.quantity}</div>
              <div className='text-sm text-gray-300'>
                ${item.price} × {item.quantity}
              </div>
            </div>
          </div>
        ))}
      </div>

      <hr className='my-4 border-blue-700' />

      <div className='flex justify-between font-semibold text-lg'>
        <span>Selected Total:</span>
        <span>${summary.totalAmount}</span>
      </div>
    </div>
  );
};

export default SelectedItemsUI;
