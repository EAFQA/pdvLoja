import styled from 'styled-components';
import { useCallback, useMemo, useState } from 'react';
import { Autocomplete, TextField, Typography, Button, IconButton, Tooltip } from '@mui/material';
import PriceInput from '../price-input';
import NumericalInput from '../numerical-input';
import { MdCategory, MdDelete } from "react-icons/md";
import { useProduct } from '../../contexts/product';
import { toast } from 'react-toastify';
import { useActions } from '../../contexts/actions';
import { useCart } from '../../contexts/cart';
import { BsBoxes } from 'react-icons/bs';
import NewCategoryModal from '../new-category-modal';

const Container = styled.div`
    display: flex;
    padding: 16px;
    flex-direction: column;
    align-content: space-between;
    align-items: center;
    background-color: #FFFFFF;
    border-radius: 8px;
    height: 500px;
    overflow: auto;
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

const ImageUploadContainer = styled.div`
    display: flex;
    width: 100%;
    align-items: center;
    margin-bottom: 16px;
    max-height: 40px;
    justify-content: center;
`;

function ProductModal({ product, handleClose }) {
    const { addProduct, updateProduct, categoriesToSelect } = useProduct();
    const { updateCartByUpdate } = useCart();
    const { logAction } = useActions();
    const [formValue, setFormValue] = useState(product || {
        name: '',
        price: null,
        stockQuantity: 1,
        minStockQuantity: null,
        maxStockQuantity: null,
        image: null,
        categories: [],
        quantityType: 'unidade'
    });
    const [createCategoryModal, setCreateCategoryModal] = useState(false);
    
    const handleImageChange = useCallback((e) => {
        if (!e?.target.files[0].type.includes('image')) {
            setFormValue({...formValue, image: undefined, imageUrl: undefined });
            return;
        }
        setFormValue({
            ...formValue, 
            image: e.target.files[0],
            imageUrl: URL.createObjectURL(e.target.files[0])
        });
    }, [formValue]);

    const isValidForSave = useMemo(() => {
        return formValue.name && formValue.price && formValue.stockQuantity;
    }, [formValue]);

    const handleSave = useCallback(async () => {
        if (isValidForSave) {
            formValue.stockQuantity = Number(formValue.stockQuantity);
            formValue.price = Number(formValue.price);
            formValue.minStockQuantity = Number(formValue.minStockQuantity);

            const newId = Date.now().toString(36);
            
            if (formValue.id) {
                await updateProduct(formValue);
                updateCartByUpdate(formValue);
                toast.success("Produto atualizado com sucesso!");
            } else {
                await addProduct({
                    id: newId,
                    ...formValue
                });
                toast.success("Produto adicionado com sucesso!");
            }

            if (formValue.stockQuantity && !formValue.id) {
                logAction({
                    date: new Date(),
                    type: 'stock',
                    products: [{
                        id: formValue.id || newId,
                        quantity: formValue.stockQuantity,
                    }]
                });
            }

            if (formValue.id && formValue.stockQuantity !== product.stockQuantity) {
                logAction({
                    date: new Date(),
                    type: 'stock',
                    products: [{
                        id: formValue.id,
                        quantity: formValue.stockQuantity - product.stockQuantity,
                    }]
                });
            }

            handleClose();
        }
    }, [formValue, logAction]);

  return (
    <>
        <Modal>
            <Container>
                <Typography variant="h4" style={{ fontWeight: '300', fontSize: 28, marginBottom: 16 }}>
                    {product ? 'Editar Produto' : 'Adicionar Produto'}
                </Typography>

                <ImageUploadContainer>
                    <Button
                        variant="outlined"
                        color="#6baed6"
                        component="label"
                        onChange={handleImageChange}
                        style={{ marginRight: 16 }}
                    >
                        Upload File
                        <input
                            type="file"
                            hidden
                        />
                    </Button>

                    <div>
                        {Boolean(formValue.imageUrl) && (
                            <IconButton aria-label="delete-product" style={{ color: '#ed2939', fontSize: 40 }} onClick={() => handleImageChange(null)}>
                                <MdDelete />
                            </IconButton>
                        )}
                    </div>
                </ImageUploadContainer>

                <img src={formValue.imageUrl} style={{ maxHeight: 200, maxWidth: 600, marginBottom: 16 }} />

                <TextField 
                    id="name" 
                    label="Nome" 
                    variant="outlined" 
                    value={formValue.name} 
                    onChange={(event) => {
                        if (event.target.value?.length > 70) {
                            event.target.value = formValue.name;
                            return;
                        }
                        setFormValue({
                            ...formValue,
                            name: event.target.value
                        });
                    }}
                    fullWidth
                    style={{ marginBottom: 16 }}
                    required
                />

                <div style={{ display: 'flex', width: '100%', alignItems: 'center', marginBottom: 16 }}>
                    <div style={{ height: 56, width: 'calc(100% - 40px)' }}>
                        <Autocomplete
                            disablePortal
                            options={categoriesToSelect}
                            fullWidth
                            freeSolo
                            value={formValue.category}
                            onChange={(_event, value) => {
                                setFormValue({
                                    ...formValue,
                                    category: value
                                });
                            }}
                            renderInput={(params) => <TextField {...params} fullWidth label="Categoria" />}
                        />
                    </div>

                    <Tooltip title="Criar nova categoria">
                        <IconButton aria-label="new-category" style={{ color: '#6baed6', fontSize: 26 }} onClick={() => setCreateCategoryModal(true)}>
                            <MdCategory />
                        </IconButton>
                    </Tooltip>
                </div>

                
                <FlexContainer>
                    <Autocomplete
                        disablePortal
                        options={['unidade', 'kg', 'litro']}
                        sx={{ 
                            width: '45%'
                        }}
                        style={{ marginBottom: 16 }}
                        value={formValue.quantityType}
                        onChange={(_event, value) => {
                            setFormValue({
                                ...formValue,
                                quantityType: value
                            });
                        }}
                        renderInput={(params) => <TextField {...params} fullWidth label="Tipo de Estoque" />}
                    />

                    <NumericalInput 
                        title="Quantidade em Estoque" 
                        quantityValue={formValue.stockQuantity}
                        onUpdate={(value) => {
                            setFormValue({
                                ...formValue,
                                stockQuantity: value
                            });
                        }}
                        required
                        width='45%'
                        allowFloat={['kg', 'litro'].includes(formValue.quantityType)}
                    />
                    
                </FlexContainer>

                <FlexContainer>
                    <NumericalInput 
                        title="Quantidade Mínima em Estoque" 
                        quantityValue={formValue.minStockQuantity}
                        onUpdate={(value) => {
                            setFormValue({
                                ...formValue,
                                minStockQuantity: value
                            });
                        }}
                        allowFloat={['kg', 'litro'].includes(formValue.quantityType)}
                    />

                    <PriceInput 
                        title="Preço" 
                        priceValue={formValue.price}
                        onUpdate={(value) => {
                            setFormValue({
                                ...formValue,
                                price: value
                            });
                        }}
                        required
                    />
                </FlexContainer>

                <FlexContainer style={{ marginTop: 'auto', justifyContent: 'space-around' }}>
                    <Button 
                        variant="contained" 
                        style={{ marginTop: 16, backgroundColor: '#ed2939' }}
                        size="large"
                        onClick={handleClose}
                    >
                        Cancelar
                    </Button>

                    <Button 
                        variant="contained" 
                        style={{ marginTop: 16, backgroundColor: isValidForSave ? '#6baed6' : '#d3d3d3' }}
                        size="large"
                        onClick={handleSave}
                    >
                        Salvar
                    </Button>
                </FlexContainer>
            </Container>
        </Modal>
        {createCategoryModal && (
            <NewCategoryModal 
                handleClose={() => {
                    setCreateCategoryModal(false);
                }} 
            />
        )}
    </>
  );
}

export default ProductModal;
