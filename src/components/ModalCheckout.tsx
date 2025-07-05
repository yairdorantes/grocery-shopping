import { Avatar, Badge, Button, Indicator, Modal } from "@mantine/core";
import type { Dispatch, SetStateAction } from "react";
import { MdShoppingCartCheckout } from "react-icons/md";
interface ModalCheckoutProps {
  opened: boolean;
  controlOpening: Dispatch<SetStateAction<boolean>>;
  checkout: () => void; // Define the type of data you expect to receive from your API
}

const ModalCheckout = ({
  opened,
  controlOpening,
  checkout,
}: ModalCheckoutProps) => {
  return (
    <div>
      <Modal opened={opened} onClose={() => controlOpening(false)}>
        <div className='flex gap-3 items-center mb-10'>
          <MdShoppingCartCheckout className='text-teal-300' size={20} />
          <div className='font-bold text-white text-sm'>Shopping List</div>
          <Badge size='sm' color='black'>
            2 items{" "}
          </Badge>
        </div>
        <div className='w-fit mx-auto mt-2'>
          <Indicator offset={7} inline position='top-end' label='10' size={12}>
            <Avatar color='teal' size='lg' radius='xl'>
              <MdShoppingCartCheckout size={25} />
            </Avatar>
          </Indicator>
        </div>
        <div className='my-5'>
          <div className='w-1/2 font-bold'>Complete your shopping?</div>
          <div className='w-3/4 text-xs'>
            {" "}
            You have 2 items in your cart. Are you ready to finish shopping and
            proceed?
          </div>
        </div>

        <div className='flex justify-end gap-2 mt-2'>
          <Button color='black' onClick={() => controlOpening(false)}>
            Continue shopping
          </Button>
          <Button onClick={checkout} color='green'>
            Yes, I'm Done
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default ModalCheckout;
