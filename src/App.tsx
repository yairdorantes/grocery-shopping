import {
  Autocomplete,
  Badge,
  Button,
  Checkbox,
  Input,
  NumberInput,
} from "@mantine/core";
import "./App.css";
import { BsCart3 } from "react-icons/bs";

import ItemCard from "./components/ItemCard";
import { useEffect, useState } from "react";
import type { Item } from "./components/ItemCard";
import { useForm } from "@mantine/form";
import { FaDollarSign } from "react-icons/fa";
import { HiOutlineShoppingCart } from "react-icons/hi";
import { CgNotes } from "react-icons/cg";
import { LuSearch } from "react-icons/lu";
import emojiRegex from "emoji-regex";
import SelectedItemsUI from "./components/SelectedItemsUI";
import { v4 as uuidv4 } from "uuid";

const regexEmoji = emojiRegex();

const dateOptions: Intl.DateTimeFormatOptions = {
  timeZone: "America/Mexico_City",
  hour12: false,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
};

// en-CA gives ISO-like format: YYYY-MM-DD
// "2025-07-03, 17:15:00"
const availableItems = [
  { name: "Apple", ilustration: "🍎" },
  { name: "Orange", ilustration: "🍊" },
  { name: "Peach", ilustration: "🍑" },
  { name: "Banana", ilustration: "🍌" },
];
function App() {
  const [items, setItems] = useState<Item[]>(() => {
    const saved = localStorage.getItem("allItems");
    return saved ? JSON.parse(saved) : [];
  });
  const [total, setTotal] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [allItems, setAllItems] = useState<Item[]>(() => {
    const saved = localStorage.getItem("allItems");
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedItems, setSelectedItems] = useState<Item[]>([]);

  const [searchKey, setSearchKey] = useState("");

  const [autoOptions, setAutoOptions] = useState<string[]>([]);

  const getItemString = (name: string) => {
    const parts = name.split(" "); //split to get the emoji (if exists)
    console.log(parts);
    const match = parts[0].match(regexEmoji);
    const hasEmoji = match != null;

    if (hasEmoji) {
      return { ilustration: parts[0], name: parts[1] };
    } else {
      return { ilustration: "🛒", name: name };
    }
  };
  const isSelectedItem = (id: string) => {
    return selectedItems.some((i) => i.id === id);
  };

  const getCurrentDate = () => {
    const dateInMexico = new Intl.DateTimeFormat("en-CA", dateOptions).format(
      new Date()
    );
    return dateInMexico;
  };
  const addItem = (item: Item) => {
    if (item.price > 0) {
      const itemString = getItemString(item.name);
      const itemId = uuidv4();
      const newItem = {
        ...item,
        id: itemId,
        name: itemString.name,
        price: parseFloat(item.price),
        quantity: 1,
        ilustration: itemString.ilustration,
        creationDate: getCurrentDate(),
      };
      setItems([newItem, ...items]);
      setAllItems([newItem, ...allItems]);

      console.log(itemId);
      // console.log("new Item", newItem);
    }
  };

  const updateQuantity = (id: string, delta: number) => {
    const update = (list: Item[]) =>
      list.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      );

    setAllItems(update);
    setSelectedItems(update);
  };

  const removeItem = (id: string) => {
    setAllItems((prevItems) => prevItems.filter((item) => item.id !== id));
    setSelectedItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  const onCheck = (item: Item, checked: boolean) => {
    setSelectedItems((prev) => {
      if (checked) {
        // Add item if it doesn't already exist
        const alreadyExists = prev.some((i) => i.id === item.id);
        if (!alreadyExists) {
          return [...prev, item];
        }
        return prev;
      } else {
        // Remove item by id
        return prev.filter((i) => i.id !== item.id);
      }
    });
  };

  const form = useForm<Item>({
    mode: "controlled",
    initialValues: {
      name: "",
      price: "",
      notes: "",
      quantity: 1,
    },
  });

  useEffect(() => {
    const { totalAmount, totalItems } = allItems.reduce(
      (acc, item) => {
        acc.totalAmount += item.quantity * item.price;
        acc.totalItems += item.quantity;
        return acc;
      },
      { totalAmount: 0, totalItems: 0 }
    );

    setTotal(totalAmount);
    setTotalItems(totalItems);
    console.log(items);
  }, [items]);

  useEffect(() => {
    const itemsNames: string[] = availableItems.map((item) => {
      return `${item.ilustration} ${item.name}`;
    });
    setAutoOptions(itemsNames);
  }, []);

  useEffect(() => {
    if (searchKey.length >= 2) {
      const lowerSearch = searchKey.toLowerCase();
      setItems(
        allItems.filter((item) => item.name.toLowerCase().includes(lowerSearch))
      );
    } else {
      setItems(allItems);
    }
  }, [searchKey, allItems]);

  useEffect(() => {
    localStorage.setItem("allItems", JSON.stringify(allItems));
  }, [allItems]);

  useEffect(() => {
    const savedAllItems = localStorage.getItem("allItems");
    if (savedAllItems) {
      setAllItems(JSON.parse(savedAllItems));
      setItems(JSON.parse(savedAllItems)); // initial items list = all items
    }
  }, []);

  return (
    <>
      <div className='text-white min-h-screen flex  p-2 justify-center '>
        <div className='w-full max-w-md space-y-6'>
          <div className='bg-green-700 rounded-xl p-4 '>
            <div className='flex justify-between'>
              <div className='flex capitalize font-semibold  items-center  gap-2 text-xl'>
                <BsCart3 />
                shopping list
              </div>
              <div>
                <Badge variant='light' color='lime' radius='md'>
                  <span className='text-white'>{totalItems} items</span>
                </Badge>
              </div>
            </div>
            <div className='text-center'>
              <div className='font-bold text-3xl flex items-center justify-center text-white mt-4'>
                <FaDollarSign className='' />{" "}
                {total.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
              <small>Total amount</small>
            </div>
          </div>

          <form
            onSubmit={form.onSubmit((values) => {
              // sendData(values);
              // console.log(values);
              addItem(values);
              form.reset();
            })}
          >
            <div className='bg-gray-800 rounded-xl p-4 space-y-3'>
              <h3 className='font-semibold '>+ Add New Item</h3>
              <div className=''>
                <Autocomplete
                  placeholder='Item (e.g. Cocos, Watermelon, Milk)'
                  data={autoOptions}
                  clearable
                  leftSection={<HiOutlineShoppingCart />}
                  key={form.key("name")}
                  {...form.getInputProps("name")}
                />
              </div>
              <div className='flex space-x-2'>
                <NumberInput
                  size='md'
                  leftSection={<FaDollarSign />}
                  radius='md'
                  placeholder='Price ($)'
                  min={1}
                  prefix='$'
                  className='flex-7'
                  allowNegative={false}
                  decimalSeparator='.'
                  thousandSeparator=','
                  // thousandSeparator=','
                  // onChange={(e) => {
                  //   const val = parseFloat(e.target.value);
                  //   setPrice(isNaN(val) ? "" : parseFloat(val.toFixed(2)));
                  // }}
                  key={form.key("price")}
                  {...form.getInputProps("price")}
                />
                {/* ADD buton */}
                <Button
                  className='flex-2'
                  variant='filled'
                  color='green'
                  size='md'
                  radius='md'
                  type='submit'
                  // onClick={() => addItem()}
                  disabled={
                    form.values.price <= 0 ||
                    form.values.price === "" ||
                    form.values.name === ""
                  }
                >
                  Add
                </Button>
              </div>
              <Input
                size='md'
                radius='md'
                leftSection={<CgNotes />}
                placeholder='Notes (e.g, 3kg, 100ml, brand X)'
                // onChange={(e) => setNotes(e.target.value)}
                key={form.key("notes")}
                {...form.getInputProps("notes")}
              />
            </div>
          </form>
          {selectedItems.length > 0 && (
            <SelectedItemsUI items={selectedItems} />
          )}

          <div className='bg-gray-800 rounded-xl p-4 max-h-[48vh]   overflow-y-auto space-y-4'>
            <div className='flex items-center justify-between gap-2'>
              <h3 className='flex items-center ml-1 gap-1 font-semibold'>
                <Checkbox
                  onClick={(e) => {
                    if (e.currentTarget.checked) {
                      setSelectedItems(allItems);
                    } else {
                      setSelectedItems([]);
                    }
                  }}
                  defaultChecked={false}
                  checked={selectedItems.length > 0}
                  variant='outline'
                  color='green'
                  radius='xl'
                />
                Your Items
              </h3>
              <Input
                className='w-[65%] '
                leftSection={<LuSearch />}
                radius='xl'
                placeholder='Search for an item'
                value={searchKey}
                rightSectionPointerEvents='all'
                rightSection={
                  searchKey !== "" ? (
                    <Input.ClearButton
                      cria-label='Clear input'
                      onClick={() => setSearchKey("")}
                    />
                  ) : undefined
                }
                onChange={(e) => setSearchKey(e.target.value)}
              />
            </div>
            <div className='max-h-[45%] '>
              {items.length === 0 ? (
                <div className='flex m-10 items-center gap-2 justify-center flex-col'>
                  <BsCart3 size={40} />

                  <div className='text-md'>Your shopping list is empty</div>
                  <small>Add items above to get started</small>
                </div>
              ) : (
                items.map((item, key) => (
                  <ItemCard
                    key={key}
                    item={item}
                    isSelected={isSelectedItem(item.id)}
                    onIncrement={() => updateQuantity(item.id, 1)}
                    onDecrement={() => updateQuantity(item.id, -1)}
                    onRemove={removeItem}
                    onCheck={onCheck}
                  />
                ))
              )}
            </div>
          </div>

          {/* <div className='flex justify-between space-x-2'>
            <button className='w-full'>Clear All</button>
            <button className='w-full'>Checkout</button>
          </div> */}
        </div>
      </div>
    </>
  );
}

export default App;
