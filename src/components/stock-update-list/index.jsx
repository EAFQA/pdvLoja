import styled from 'styled-components';
import { useState } from 'react';
import { MdCheck, MdDelete, MdEdit } from "react-icons/md";
import { ShortenText } from '../../utils';
import { Button, IconButton, TextField } from '@mui/material';
import { BiCartAdd } from "react-icons/bi";
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
  background-color: ${(props) => props.isOdd ? '#EEEEEE' : '#DDDDD'}
`;

function StockUpdateList() {
  const { completeUpdate, editingActionProducts, removeItemFromAction, addItemsToAction, clearEditingActionProducts } = useActions();
  const { updateStock, products } = useProduct();
  const { updateCartByStockAction } = useCart();
  const [editingProduct, setEditingProduct] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  return (
    <ProductContainer>
      <div style={{ height: 'calc(90vh - 270px)', overflow: 'auto', backgroundColor: '#DDDDDD', border: '4px solid black', borderRadius: '8px' }}>
        {editingActionProducts.map((product, index) => {
            const prd = products.find(p => p.id === product.id);
            const name = prd.name;
            const unityToShow = ['litro', 'kg'].includes(prd.quantityType) ? prd.quantityType : 'un';

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
                              <p style={{ width: 100 }}>{stockQuantity} {unityLabel}</p>
                            </>
                        ) :
                        (
                          <>
                            <IconButton 
                              aria-label="edit-product" 
                              style={{ fontSize: 24, width: 48 }} 
                              onClick={() => {
                                setEditingProduct(null);

                                if (editingProduct.quantity === 0 || isNaN(editingProduct.quantity)) {
                                  removeFromCart(editingProduct.id);
                                  return;
                                }

                                const newQuantity = Number(editingProduct.quantity);

                                if (newQuantity < 0 && Math.abs(newQuantity) > prd.stockQuantity) {
                                  toast.error("Não é possível remover mais itens do que o disponível no estoque");
                                  return;
                                }

                                addItemsToAction(editingProduct.id, product.name, Number(editingProduct.quantity));
                              }}
                            >
                                <MdCheck />
                            </IconButton>
                            <TextField 
                              variant="standard"
                              value={editingProduct.quantity}
                              style={{ width: 70 }}
                              onChange={(event) => {
                                const allowFloat = ['kg', 'litro'].includes(product.quantityType);
                                const value = event.target.value;
                                
                                if (!isNaN(value) && (allowFloat || (!value.includes('e') && !value.includes('.')))) {
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
                    <p style={{ textAlign: 'end', width: 'auto' }}>
                      {ShortenText(name, 40)}
                    </p>
                    <IconButton aria-label="delete-product" style={{ color: '#ed2939', fontSize: 24 }} onClick={() => removeItemFromAction(product.id)}>
                        <MdDelete />
                    </IconButton>
                  </div>
                </ProductItem>
            );
        })}
      </div>
      <div style={{ marginTop: 'auto', textAlign: 'end', fontSize: 22, fontWeight: 'bold' }}>
        <div style={{ marginTop: '10px', height: 80, display: 'flex', justifyContent: 'space-around' }}>
          <Button 
              variant="contained" 
              style={{ marginTop: 16, backgroundColor: '#ed2939' }}
              size="large"
              onClick={() => {
                if (editingActionProducts.length) { 
                  setShowDeleteModal(true); 
                }
              }}
          >
              Desfazer alterações
          </Button>

          <Button 
              variant="contained" 
              style={{ marginTop: 16, backgroundColor: editingActionProducts.length ? '#1DBC60' : '#d3d3d3' }}
              size="large"
              onClick={() => {
                if (!editingActionProducts.length) return;

                const stockAction = editingActionProducts.map(item => ({
                  id: item.id,
                  incrementQuantity: item.quantity
                }));
                updateStock(stockAction);
                updateCartByStockAction(stockAction);
                toast.success('Estoque atualizado com sucesso!');
                completeUpdate();
              }}
          >
              Salvar
          </Button>
        </div>
      </div>
      {showDeleteModal && (
        <ConfirmModal 
          title="Desfazer alterações"
          text="Ao desfazer as alterações, todas as alterações de produtos atuais serão apagadas."
          onConfirm={() => {
            clearEditingActionProducts();
            setShowDeleteModal(false);
          }}
          handleClose={() => setShowDeleteModal(false)}
        />
      )}
    </ProductContainer>
  );
}

export default StockUpdateList;
