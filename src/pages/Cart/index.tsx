import React from 'react';
import {
  MdDelete,
  MdAddCircleOutline,
  MdRemoveCircleOutline,
} from 'react-icons/md';

import { useCart } from '../../hooks/useCart';
import { formatPrice } from '../../util/format';
import { Container, ProductTable, Total } from './styles';

interface Product {
  id: number;
  title: string;
  price: number;
  image: string;
  amount: number;
}

const Cart = (): JSX.Element => {
  const { cart, removeProduct, updateProductAmount } = useCart();

  const cartFormatted = cart.map(product => ({
      id: product.id,
      title: product.title,
      price: product.price,
      image: product.image,
      amount: product.amount,
  }))

  const total =
    formatPrice(
      cart.reduce((sumTotal, product) => {
        sumTotal += product.price * product.amount;

        return sumTotal;

      }, 0)
    )

  function handleProductIncrement(product: Product) {
    updateProductAmount({productId:product.id, amount:(product.amount+1)})
  }

  function handleProductDecrement(product: Product) {
    updateProductAmount({productId:product.id, amount:(product.amount-1)})
  }

  function handleRemoveProduct(productId: number) {
    removeProduct(productId)
  }

  return (
    <Container>
      <ProductTable>
      {cartFormatted.map(prod => {
        return (
          <React.Fragment key={prod.id}>
          <thead>
            <tr>
              <th aria-label="product image" />
              <th>PRODUTO</th>
              <th>QTD</th>
              <th>SUBTOTAL</th>
              <th aria-label="delete icon" />
            </tr>
          </thead>
          <tbody>
            <tr data-testid="product">
              <td>
                <img src={prod.image} alt={prod.title} />
              </td>
              <td>
                <strong>{prod.title}</strong>
                <span>{formatPrice(prod.price)}</span>
              </td>
              <td>
                <div>
                  <button
                    type="button"
                    data-testid="decrement-product"
                  disabled={prod.amount <= 1}
                  onClick={() => handleProductDecrement(prod)}
                  >
                    <MdRemoveCircleOutline size={20} />
                  </button>
                  <input
                    type="text"
                    data-testid="product-amount"
                    readOnly
                    value={prod.amount}
                  />
                  <button
                    type="button"
                    data-testid="increment-product"
                  onClick={() => handleProductIncrement(prod)}
                  >
                    <MdAddCircleOutline size={20} />
                  </button>
                </div>
              </td>
              <td>
                <strong>{formatPrice(prod.amount*prod.price)}</strong>
              </td>
              <td>
                <button
                  type="button"
                  data-testid="remove-product"
                onClick={() => handleRemoveProduct(prod.id)}
                >
                  <MdDelete size={20} />
                </button>
              </td>
            </tr>
          </tbody>
        </React.Fragment>
      )})}
      </ProductTable>

      <footer>
        <button type="button">Finalizar pedido</button>

        <Total>
          <span>TOTAL</span>
          <strong>{total}</strong>
        </Total>
      </footer>
    </Container>
  );
};

export default Cart;
