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
import ConfirmModal from '../confirm-modal';

export const ProductContainer = styled.div`
  margin-top: 16px;
  align-self: start;
  width: 100%;
  height: calc(90vh - 56px);
  overflow: auto;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

export const ProductItem = styled.div`
  background: #FFFFF;
  width: 100%;
  text-align: center;
  min-height: 55px;
  display: flex;
  align-items: center;
  background-color: ${(props) => props.isOdd ? '#DDDDD' : '#EEEEEE'}
`;

function CartList() {
  const { cart, updateQuantityOnCart, removeFromCart, clearCart, buyCart } = useCart();
  const { logAction } = useActions();
  const { updateStock } = useProduct();
  const [editingProduct, setEditingProduct] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const total = useMemo(() => {
    return cart.reduce((acc, curr) => {
      return acc + (curr.price * curr.quantity)
    }, 0).toFixed(2).replace('.', ',');
  }, [cart]);


  return (
    <ProductContainer>
      <div style={{ height: 'calc(90vh - 270px)', overflow: 'auto', backgroundColor: '#DDDDDD', border: '4px solid black', borderRadius: '8px' }}>
        {cart.map((product, index) => {
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
                <ProductItem key={product.id} isOdd={index % 2}>
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
                                  
                                  if (!isNaN(value) && value >= 0 && value < 10000000 && (allowFloat || (!value.includes('e') && !value.includes('.')))) {
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
        <div style={{ marginTop: '10px', height: 80, display: 'flex', justifyContent: 'space-around' }}>
          <Button 
              variant="contained" 
              style={{ marginTop: 16, backgroundColor: '#ed2939' }}
              size="large"
              onClick={() => {
                if (cart.length) {
                  setShowDeleteModal(true);
                }
              }}
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
      {showDeleteModal && (
        <ConfirmModal 
          title="Desfazer carrinho"
          text="Ao desfazer o carrinho, toda a lista de produtos atuais será apagada."
          onConfirm={() => {
            clearCart();
            setShowDeleteModal(false);
          }}
          handleClose={() => setShowDeleteModal(false)}
        />
      )}
    </ProductContainer>
  );
}

export default CartList;
