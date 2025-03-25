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

function StockUpdateList() {
  const { completeUpdate, editingActionProducts, removeItemFromAction, clearEditingActionProducts } = useActions();
  const { updateStock } = useProduct();
  const { updateCartByStockAction } = useCart();

  return (
    <ProductContainer>
      <div style={{ height: 'calc(90vh - 270px)', backgroundColor: '#DDDDDD', border: '4px solid black', borderRadius: '8px' }}>
        {editingActionProducts.map((product) => {
            const name = product.name;

            return (
                <ProductItem key={product.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <p style={{ margin: '0 6px' }}>{product.type === 'add' ? '+' : '-'}{product.quantity || "1"}</p>
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
        <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'space-around' }}>
        <Button 
                  variant="contained" 
                  style={{ marginTop: 16, backgroundColor: '#ed2939' }}
                  size="large"
                  onClick={() => clearEditingActionProducts()}
              >
                  Desfazer alterações
              </Button>

              <Button 
                  variant="contained" 
                  style={{ marginTop: 16, backgroundColor: editingActionProducts.length ? '#1DBC60' : '#d3d3d3' }}
                  size="large"
                  onClick={() => {
                    const stockAction = editingActionProducts.map(item => ({
                      id: item.id,
                      incrementQuantity: item.type === 'add' ? item.quantity : item.quantity * -1,
                    }));
                    updateStock(stockAction);
                    updateCartByStockAction(stockAction);
                    toast.success('Estoque atualizado com sucesso!');
                    completeUpdate();
                  }}
              >
                  Efetuar alterações
              </Button>
        </div>
      </div>
    </ProductContainer>
  );
}

export default StockUpdateList;
