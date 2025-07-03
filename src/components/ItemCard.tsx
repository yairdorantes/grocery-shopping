import { FiMinus } from "react-icons/fi";
import { IoAddSharp } from "react-icons/io5";
import { FaDollarSign, FaRegTrashAlt } from "react-icons/fa";
import { Button, Checkbox } from "@mantine/core";

export interface Item {
  id: string;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
  ilustration?: string;
  creartionDate?: string;
}

interface ItemCardProps {
  item: Item;
  onIncrement: () => void;
  onDecrement: () => void;
  onRemove: (id: string) => void;
  onCheck: (item: Item, checked: boolean) => void;
  isSelected: boolean;
}
const ItemCard = ({
  item,
  onIncrement,
  onDecrement,
  onRemove,
  onCheck,
  isSelected,
}: ItemCardProps) => {
  return (
    <div className='flex relative justify-between mb-2 items-center bg-gray-900 rounded-md p-2'>
      <div className='absolute top-1 left-1'>
        <Checkbox
          onClick={(e) => onCheck(item, e.currentTarget.checked)}
          defaultChecked={false}
          checked={isSelected}
          color='green'
          radius='xl'
        />
      </div>
      <div className='flex'>
        <div className='p-4 text-4xl flex items-center'>{item.ilustration}</div>
        <div className='flex flex-col space-y-4'>
          <div>
            <p className='font-semibold text-lg '>{item.name}</p>
            <p className='font-semibold text-gray-400 '>{item.notes}</p>
          </div>
          <p className='font-semibold  flex text-green-400'>
            <FaDollarSign size={14} className='mt-1' />
            {(item.quantity * item.price).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
        </div>
      </div>

      <div className='flex flex-col items-end gap-3'>
        <Button
          p={8}
          onClick={() => onRemove(item.id)}
          variant='light'
          radius={"xl"}
          size='xs'
          color='red'
        >
          <FaRegTrashAlt />
        </Button>
        <div>
          <Button.Group>
            <Button variant='default' radius='md' p={12} onClick={onDecrement}>
              <FiMinus />
            </Button>
            <Button.GroupSection variant='default' bg='gray' w={1}>
              {item.quantity}
            </Button.GroupSection>
            <Button p={12} variant='default' radius='md' onClick={onIncrement}>
              <IoAddSharp />
            </Button>
          </Button.Group>
          <p className='text-sm  flex justify-center items-center text-gray-400'>
            <FaDollarSign size={12} className='' />
            {item.price.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
            each
          </p>
        </div>
      </div>
    </div>
  );
};

export default ItemCard;
