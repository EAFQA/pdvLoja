import styled from 'styled-components';
import { ImCart } from "react-icons/im";
import { useCallback, useMemo } from 'react';
import { MdAddBusiness, MdDelete } from "react-icons/md";
import { ShortenText } from '../../utils';
import { Button, IconButton, Tooltip } from '@mui/material';
import { BiCartAdd } from "react-icons/bi";
import { useCart } from '../../contexts/cart';
import NumericalInput from '../numerical-input';
import { IoMdAdd } from "react-icons/io";
import { IoMdRemove } from "react-icons/io";
import { useActions } from '../../contexts/actions';
import { useProduct } from '../../contexts/product';
import { toast } from 'react-toastify';


export const ProductContainer = styled.div`
  margin-top: 16px;
  align-self: start;
  width: 100%;
  height: calc(90vh - 56px);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

export const ProductItem = styled.div`
  background: #FFFFF;
  width: 100%;
  text-align: center;
  height: 50px;
  background-color: ${(props) => props.isOdd ? '#DDDDD' : '#EEEEEE'}
`;

export const ProductImage = styled.div`
  margin-bottom: 10px;
  background-image: url(${(props) => props.src});
  background-size: 100% 100%;
  background-repeat: no-repeat;
  height: 160px;
  width: 100%;
  display: flex;
  justify-content: end;
  align-items: start;
`;

const mockProds = [
  {
    id: '12312',
    name: '123123',
    price: 19.90,
    stockQuantity: 3,
    minStockQuantity: 1,
    image: "https://cdnv2.moovin.com.br/sjo/imagens/produtos/det/-terco-de-madeira-sao-bento-759b5707fd223f32a843b70393f3564f.png",
    categories: ['style']
  }
]

function CartList() {
  const { cart, updateQuantityOnCart, removeFromCart, clearCart, buyCart } = useCart();
  const { logAction } = useActions();
  const { updateStock } = useProduct();

  const total = useMemo(() => {
    return cart.reduce((acc, curr) => {
      return acc + (curr.price * curr.quantity)
    }, 0).toFixed(2).replace('.', ',');
  }, [cart]);

  return (
    <ProductContainer>
      <div style={{ height: 'calc(90vh - 270px)', backgroundColor: '#DDDDDD', border: '4px solid black', borderRadius: '8px' }}>
        {cart.map((product) => {
            const name = product.name;

            return (
                <ProductItem key={product.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <IconButton 
                        aria-label="delete-product" 
                        style={{ fontSize: 24 }} 
                        onClick={() => {
                          if (product.quantity === 1)
                          {
                            removeFromCart(product.id);
                            return;
                          }
                          updateQuantityOnCart(product.id, product.quantity - 1);
                        }}
                      >
                          <IoMdRemove />
                      </IconButton>
                      <p style={{ margin: '0 6px' }}>{product.quantity || "1"}</p>
                      <IconButton aria-label="delete-product" style={{ fontSize: 24 }} onClick={() => updateQuantityOnCart(product.id, product.quantity + 1)}>
                          <IoMdAdd />
                      </IconButton>
                    </div>
                    <p style={{ textAlign: 'end', width: 'auto' }}>
                      {ShortenText(name, 20)} (R${(product.price || 10)?.toFixed(2).replace('.', ',')}) - 
                      R${((product.price || 10) * product.quantity)?.toFixed(2).replace('.', ',')}
                      </p>
                    <IconButton aria-label="delete-product" style={{ color: '#ed2939', fontSize: 24 }} onClick={() => removeFromCart(product.id)}>
                        <MdDelete />
                    </IconButton>
                  </div>
                </ProductItem>
            );
        })}
      </div>
      <div style={{ marginTop: 'auto', textAlign: 'end', fontSize: 22, fontWeight: 'bold' }}>
        <p>Total: R${total}</p>
        <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'space-around' }}>
        <Button 
                  variant="contained" 
                  style={{ marginTop: 16, backgroundColor: '#ed2939' }}
                  size="large"
                  onClick={() => clearCart()}
              >
                  Desfazer carrinho
              </Button>

              <Button 
                  variant="contained" 
                  style={{ marginTop: 16, backgroundColor: cart.length ? '#1DBC60' : '#d3d3d3' }}
                  size="large"
                  onClick={() => {
                    if (!cart.length) return;
                    const stockAction = cart.map(item => ({
                      id: item.id,
                      incrementQuantity: item.quantity * -1,
                    }));

                    const response = buyCart();
                    
                    if (response) {
                      toast.success('Venda efetuada com sucesso!');
                      updateStock(stockAction);
                      logAction(response);
                      clearCart();
                    }
                  }}
              >
                  Efetuar venda
              </Button>
        </div>
      </div>
    </ProductContainer>
  );
}

export default CartList;
