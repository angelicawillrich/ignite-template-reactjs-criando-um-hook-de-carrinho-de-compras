import { createContext, ReactNode, useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product, Stock } from '../types';

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem('@RocketShoes:cart');

    if (storagedCart) {
      return JSON.parse(storagedCart);
    }

    return [];
  });

  const addProduct = async (productId: number) => {
    try {
      // to get the available product amount in Stock
      const stockInfo = await api.get(`/stock/${productId}`);
      const availableProductAmount = stockInfo.data.amount;

      // to check if the product is in the cart
      const productCart = cart.find(product => product.id === productId);

      if (productCart) {
        // if there's no available product in stock, throw an error and return
        if (availableProductAmount < productCart.amount+1) {
          toast.error('Quantidade solicitada fora de estoque');
          return;
        }

        const newProductAmount = cart.map(item => {
          if (item.id !== productId) return item;
          return {
            ...item,
            amount: item.amount += 1,
          }
        })

        setCart(newProductAmount);
        localStorage.setItem('@RocketShoes:cart', JSON.stringify(newProductAmount));
        
  
      } else {
        // if there's no available product in stock, throw an error and return
        if (availableProductAmount < 1) {
          toast.error('Quantidade solicitada fora de estoque');
          return;
        }

        const productInfo = await api.get(`/products/${productId}`);
        const productData = productInfo.data;
        const newProduct = {
          ...productData,
          amount: 1,
        }

        const newCartContent = [
          ...cart,
          newProduct
        ];
        setCart(newCartContent);
        localStorage.setItem('@RocketShoes:cart', JSON.stringify(newCartContent));
        
      }

    } catch {
      toast.error('Erro na adição do produto');
    }
  };

  const removeProduct = (productId: number) => {
    try {
      // to check if the product exists
      const product = cart.filter(item => item.id === productId);

      if (product.length > 0) {
        const newCartContent = cart.filter(item => item.id !== productId);
        localStorage.setItem('@RocketShoes:cart', JSON.stringify(newCartContent));
        setCart(newCartContent);
  
      } else {
        toast.error('Erro na remoção do produto');
      }

    } catch {
      toast.error('Erro na remoção do produto');
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      if (amount < 1) {
        toast.error('Erro na alteração de quantidade do produto');
        return;
      }

      // to get the available product amount in Stock
      const stockInfo = await api.get(`/stock/${productId}`);
      const availableProductAmount = stockInfo.data.amount;
      if (availableProductAmount < amount) {
        toast.error('Quantidade solicitada fora de estoque');
        return;
      }

      const newProductAmount = cart.map(item => {
        if (item.id !== productId) return item;
        return {
          ...item,
          amount: amount,
        }
      })

      localStorage.setItem('@RocketShoes:cart', JSON.stringify(newProductAmount));
      setCart(newProductAmount);

    } catch {
      toast.error('Erro na alteração de quantidade do produto');
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
