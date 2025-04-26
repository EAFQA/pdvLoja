import styled from 'styled-components';
import { useCallback, useMemo, useState } from 'react';
import { TextField, Typography, Button } from '@mui/material';
import { toast } from 'react-toastify';
import { useProduct } from '../../contexts/product';

const Container = styled.div`
    display: flex;
    padding: 16px;
    flex-direction: column;
    align-content: space-between;
    align-items: center;
    background-color: #FFFFFF;
    border-radius: 8px;
    overflow: auto;
    width: 300px;
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
    z-index: 15;
`;

const FlexContainer = styled.div`
    display: flex;
    justify-content: space-between;
    width: 100%;
`;

function NewCategoryModal({ handleClose, categoryValue }) {
    const { addCategory, updateCategory, categoriesToSelect } = useProduct();
    const [categoryName, setCategoryName] = useState(categoryValue || '');

    const canSave = useMemo(() => categoryName.trim(), [categoryName]);

    const handleSave = useCallback(async () => {
        if (!categoryName.trim()) {
            toast.error('Por favor, preencha o nome da categoria');
            return;
        }

        if (categoryName === categoryValue) {
            handleClose();
            return;
        }

        const categoryExists = categoriesToSelect.includes(categoryName);

        if (categoriesToSelect.length && categoryExists) {
            toast.error('Categoria já existe! Escolha outro nome.');
            return;
        }

        if (categoryValue) {
            await updateCategory(categoryValue, categoryName);
        } else {
            await addCategory(categoryName);
        }

        try {
            toast.success(`Categoria ${categoryValue ? 'atualizada' : 'criada'} com sucesso!`);
            handleClose(categoryName);
        } catch (err) {
            console.error(err);
            handleClose();
        }

    }, [categoryName, handleClose, categoryValue, addCategory]);

  return (
    <Modal>
        <Container>
            <Typography variant="h4" style={{ fontWeight: '300', fontSize: 24, marginBottom: 16 }}>
                {categoryValue ? 'Editar' : 'Adicionar'} Categoria
            </Typography>

            <TextField 
                id="modal-category-new-name" 
                label="Nome" 
                variant="outlined" 
                value={categoryName} 
                onChange={(event) => {
                    if (event.target.value?.length > 70) {
                        event.target.value = categoryName;
                        return;
                    }
                    setCategoryName(event.target.value);
                }}
                fullWidth
                style={{ marginBottom: 16 }}
                required
                type="search"
                autoComplete='off'
            />

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
                    style={{ marginTop: 16, backgroundColor: canSave  ? '#6baed6' : '#d3d3d3' }}
                    size="large"
                    onClick={handleSave}
                >
                    {categoryValue ? 'Salvar' : 'Criar'}
                </Button>
            </FlexContainer>
        </Container>
    </Modal>
  );
}

export default NewCategoryModal;
