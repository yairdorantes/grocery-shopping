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
import { DateTime } from "luxon";
import axios from "axios";
import ModalCheckout from "./components/ModalCheckout";
import { ToastContainer, toast } from "react-toastify";

const regexEmoji = emojiRegex();

const apiUrl = import.meta.env.VITE_API_URL;

// en-CA gives ISO-like format: YYYY-MM-DD
// "2025-07-03, 17:15:00"
const availableItems = [
  { name: "Apple", illustration: "🍎" },
  { name: "Orange", illustration: "🍊" },
  { name: "Peach", illustration: "🍑" },
  { name: "Banana", illustration: "🍌" },
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

  const [modalCheck, setModalCheck] = useState(false);

  const getItemString = (name: string) => {
    const parts = name.split(" "); //split to get the emoji (if exists)
    console.log(parts);
    const match = parts[0].match(regexEmoji);
    const hasEmoji = match != null;

    if (hasEmoji) {
      return { illustration: parts[0], name: parts[1] };
    } else {
      return { illustration: "🛒", name: name };
    }
  };
  const isSelectedItem = (id: string) => {
    return selectedItems.some((i) => i.id === id);
  };

  const getCurrentDate = () => {
    return DateTime.now().setZone("America/Mexico_City").toISO(); // returns: 2025-07-05T22:01:30.000-06:00
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
        illustration: itemString.illustration,
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
  const checkout = () => {
    const storeOldItems = localStorage.getItem("oldItems");
    if (storeOldItems) {
      localStorage.setItem(
        "oldItems",
        JSON.stringify([...JSON.parse(storeOldItems), ...allItems])
      );
    } else {
      localStorage.setItem("oldItems", JSON.stringify(allItems));
    }
    // localStorage.setItem("oldItems", JSON.stringify(allItems));
    localStorage.removeItem("allItems");
    setAllItems([]);
    setSelectedItems([]);
    setModalCheck(false);
    // TODO: implement checkout logic
  };

  const sendItemsToServer = async () => {
    const items = localStorage.getItem("oldItems");
    const itemsArray = JSON.parse(items || "[]") as Item[];
    if (itemsArray.length > 0) {
      axios
        .post(`${apiUrl}/shopping/items`, { items: itemsArray })
        .then((res) => {
          const { status, data } = res;
          if (status === 201) {
            toast.success("All items were saved successfully.");
            localStorage.removeItem("oldItems");
            setModalCheck(false);
          } else if (status === 207) {
            toast.warn("Some items couldn't be saved.");
            console.warn("Partial failure details:", data.errors);

            // Optional: Display or log detailed errors
            data.errors.forEach((err) => {
              console.warn(`Item ${err.index} failed: ${err.error}`);
            });

            // Optional: Retry only failed items, etc.
          } else {
            toast.error("Unexpected response from the server.");
            console.error("Unexpected status:", status, data);
          }
        })
        .catch((err) => {
          console.error("Couldn't send items to server", err);

          // Handle different types of errors
          if (err.response?.status === 400) {
            toast.error("Bad request: Check the item format.");
          } else if (err.response?.status === 500) {
            toast.error("Server error: Try again later.");
          } else {
            toast.error("Network or unknown error.");
          }
        });
    }
    // TODO: implement server-side logic to send the items
  };

  const form = useForm<Item>({
    mode: "controlled",
    initialValues: {
      id: "",
      name: "",
      price: undefined,
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
    // console.log(items);
  }, [items]);

  useEffect(() => {
    const itemsNames: string[] = availableItems.map((item) => {
      return `${item.illustration} ${item.name}`;
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
    sendItemsToServer();
  }, []);

  return (
    <>
      <ToastContainer />
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
                  required
                  placeholder='Price ($)'
                  min={1}
                  prefix='$'
                  className='flex-7'
                  allowNegative={false}
                  decimalSeparator='.'
                  thousandSeparator=','
                  decimalScale={2}
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
                    form.values.price === undefined ||
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

          {allItems.length > 0 && (
            <Button
              onClick={() => setModalCheck(true)}
              color='indigo'
              variant='filled'
              fullWidth
            >
              checkout
            </Button>
          )}
        </div>
      </div>
      <ModalCheckout
        opened={modalCheck}
        controlOpening={setModalCheck}
        checkout={checkout}
      />
    </>
  );
}

export default App;
