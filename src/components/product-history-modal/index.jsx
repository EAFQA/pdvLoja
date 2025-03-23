import styled from 'styled-components';
import { useCallback, useMemo, useState } from 'react';
import { Autocomplete, TextField, Typography, Button, IconButton } from '@mui/material';
import PriceInput from '../price-input';
import NumericalInput from '../numerical-input';
import { MdDelete } from "react-icons/md";
import { useProduct } from '../../contexts/product';
import { toast } from 'react-toastify';
import { useActions } from '../../contexts/actions';

const Container = styled.div`
    display: flex;
    padding: 16px;
    flex-direction: column;
    align-content: space-between;
    align-items: center;
    background-color: #FFFFFF;
    border-radius: 8px;
    width: 600px;
`;

const Modal = styled.div`
    display: flex;
    flex-direction: column;
    top: 0;
    left: 0;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.5);
    position: absolute;
    width: 100%;
    height: 100%;
    z-index: 10;
`;

const FlexContainer = styled.div`
    display: flex;
    justify-content: space-between;
    width: 100%;
`;

// create a div that will be used to display the product history and it should show the <p> between grey and white background
const ProductHistoryList = styled.div`
    width: 100%;
    background-color: #FFFFFF;
    border: 2px solid black;
`;

const ProductHistoryText = styled.p`
    margin: 0;
    padding: 8px;
    font-size: 16px; 
    text-align: start;
`;

function ProductHistoryModal({ product, handleClose }) {
    const { actions } = useActions();

    console.log(actions);

    const logs = useMemo(() => {
        const filteredLogs = actions.filter(action => action.products.find(p => p.id === product.id));
        return filteredLogs.map(log => {
            const productLog = log.products.find(p => p.id === product.id);

            const dateTime = new Date(log.date).toLocaleTimeString();

            const dateStrWithoutSeconds = dateTime.split(':').slice(0, 2).join(':');

            const dateString = `${new Date(log.date).toLocaleDateString()} ${dateStrWithoutSeconds}: `;
            
            const isPlural = productLog.quantity > 1 || productLog.quantity < -1;

            if (log.type === 'sale')
            {
                const total = productLog.quantity * product.price;
                return `${dateString}Venda de ${productLog.quantity} unidade${isPlural ? 's' : ''} por R$${total.toFixed(2).replace('.', ',')}`;
            }

            if (log.type === 'stock')
            {
                return `${dateString}${productLog.quantity > 0 ? 'Adição' : 'Remoção'} de ${Math.abs(productLog.quantity)} unidade${isPlural ? 's' : ''} manualmente`;
            }

            return "";
        }).filter(Boolean);
    }, [actions, product]);

  return (
    <Modal>
        <Container>
            <Typography variant="h4" style={{ fontWeight: '400', fontSize: 28, marginBottom: 16 }}>
                Histórico de Estoque - {product.name}
            </Typography>

            <ProductHistoryList>
                {logs.map((log, index) => (
                    <ProductHistoryText key={index} style={{ backgroundColor: index % 2 === 0 ? '#EEEEEE' : '#FFFFFF' }}>
                        {log}
                    </ProductHistoryText>
                ))}
                {logs.length === 0 && (
                    <ProductHistoryText style={{ backgroundColor: '#FFFFFF' }}>
                        Nenhuma alteração de estoque registrada
                    </ProductHistoryText>
                )}
            </ProductHistoryList>

            <FlexContainer style={{ marginTop: 'auto', justifyContent: 'center' }}>
                <Button 
                    variant="contained" 
                    style={{ marginTop: 16, backgroundColor: '#ed2939' }}
                    size="large"
                    onClick={handleClose}
                >
                    Fechar
                </Button>
            </FlexContainer>
        </Container>
    </Modal>
  );
}

export default ProductHistoryModal;
