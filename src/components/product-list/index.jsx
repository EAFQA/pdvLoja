import styled from 'styled-components';
import { ImCart } from "react-icons/im";
import { useCallback, useMemo } from 'react';
import { MdAddBusiness } from "react-icons/md";
import { ShortenText } from '../../utils';
import { Button, IconButton, Tooltip } from '@mui/material';
import { BiCartAdd } from "react-icons/bi";
import { useCart } from '../../contexts/cart';

const Container = styled.div`
    display: flex;
    padding: 16px;
    flex-direction: column;
    align-content: space-between;
    align-items: center;
    margin-top: 16px;
`;

const MenuItem = styled.div`
    cursor: pointer;
    width: 80px;
    height: 40px;
    align-items: center;
    margin-bottom: 60px;
`;

const inactiveColor = '#808080';
const activeColor = '#6baed6';

export const ProductContainer = styled.div`
  margin-top: 16px;
  align-self: start;
  padding: 15px;
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  overflow: auto;
`;

export const ProductItem = styled.div`
  background: #FFFFF;
  padding: 16px;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 4px 4px 4px 6px rgba(0, 0, 0, 0.1);
  width: 140px;
  cursor: pointer;
  height: 210px;
  text-align: center;
  display: flex;
  flex-direction: column;

  &:hover {
    box-shadow: 4px 4px 4px 6px rgba(0, 0, 0, 0.2);
  }
`;

export const ProductImage = styled.div`
  margin-bottom: 10px;
  background-image: url(${(props) => props.src});
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center center;
  background-repeat: no-repeat;
  height: 160px;
  width: 100%;
  display: flex;
  justify-content: end;
  align-items: start;
`;

function ProductList({ products }) {
  const { addToCart } = useCart();
  return (
    <ProductContainer>
        {products.map((product) => {
            const name = ShortenText(product.name || "Test with 150 characters", 14);
            const showTooltip = product.name?.length > 10;

            const unityToShow = ['litro', 'kg'].includes(product.quantityType) ? product.quantityType : 'un';

            const unityLabel = product.stockQuantity >= 2 ? `${unityToShow}s` : unityToShow;

            const showDecimal = (value) => {
              if (product.quantityType === 'kg' || product.quantityType === 'litro') {
                  return value.toFixed(2);
              }
              return value;
          }

            const stockQuantity = product.stockQuantity ? `${showDecimal(product.stockQuantity)}`.replace('.', ',') : 0;

            return (
                <ProductItem key={product.id} onClick={() => addToCart(product)}>
                    <ProductImage src={product.imageUrl}>
                    </ProductImage>
                    <div style={{ marginTop: 'auto', textAlign: 'left' }}>
                        {showTooltip ? (
                            <Tooltip title={product.name}>
                                <p>{name}</p>
                            </Tooltip>
                        ) : (
                            <p>{name}</p>
                        )}
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                            <p>{stockQuantity} {unityLabel}</p>
                            <p>R${(product.price)?.toFixed(2).replace('.', ',')}</p>
                        </div>
                    </div>
                </ProductItem>
            );
        })}
        
    </ProductContainer>
  );
}

export default ProductList;
