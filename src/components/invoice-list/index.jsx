import styled from 'styled-components';
import { ImCart } from "react-icons/im";
import { useCallback, useMemo, useState } from 'react';
import { MdAddBusiness, MdCheck, MdDelete, MdEdit } from "react-icons/md";
import { ShortenText } from '../../utils';
import { Button, IconButton, TextField, Tooltip } from '@mui/material';
import { BiCartAdd, BiEdit } from "react-icons/bi";
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
  const [editingProduct, setEditingProduct] = useState(null);

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

            const unityToShow = ['litro', 'kg'].includes(product.quantityType) ? product.quantityType : 'un';

            const unityLabel = product.quantity >= 2 ? `${unityToShow}s` : unityToShow;

            const showDecimal = (value) => {
              if (product.quantityType === 'kg' || product.quantityType === 'litro') {
                  return value.toFixed(2);
              }
              return value;
          }

            const stockQuantity = product.quantity ? `${showDecimal(product.quantity)}`.replace('.', ',') : 0;

            return (
                <ProductItem key={product.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', width: 148 }}>
                          {(editingProduct?.id !== product.id) ? 
                            (
                              <>
                                <IconButton 
                                  aria-label="edit-product" 
                                  style={{ fontSize: 24, width: 48 }} 
                                  onClick={() => {
                                    setEditingProduct(product);
                                  }}
                                >
                                    <MdEdit />
                                </IconButton>
                                <p style={{ width: 100}}>{stockQuantity} {unityLabel}</p>
                              </>
                          ) :
                          (
                            <>
                              <IconButton 
                                aria-label="edit-product" 
                                style={{ fontSize: 24, width: 48 }} 
                                onClick={() => {
                                  setEditingProduct(null);

                                  if (editingProduct.quantity <= 0 || isNaN(editingProduct.quantity)) {
                                    removeFromCart(editingProduct.id);
                                    return;
                                  }

                                  updateQuantityOnCart(editingProduct.id, Number(editingProduct.quantity));
                                }}
                              >
                                  <MdCheck />
                              </IconButton>
                              <TextField 
                                variant="standard"
                                value={editingProduct.quantity}
                                style={{ width: 70 }}
                                onChange={(event) => {
                                  const allowFloat = ['litro', 'kg'].includes(product.quantityType);
                                  const value = event.target.value;
                                  
                                  if (!isNaN(value) && value >= 0 && (allowFloat || (!value.includes('e') && !value.includes('.')))) {
                                      setEditingProduct({ ...editingProduct, quantity: value })
                                  } else {
                                      event.target.value = quantityValue;
                                  }
                                }}
                                type='number'
                              />
                            </>
                          )}
                      </div>
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
