import styled from 'styled-components';
import { useMemo, useState } from 'react';
import TextField from '@mui/material/TextField';
import { IconButton, Tooltip } from '@mui/material';
import { useProduct } from '../../contexts/product';
import NewCategoryModal from '../../components/new-category-modal';
import ConfirmModal from '../../components/confirm-modal';
import { MdCategory, MdDelete, MdEdit } from "react-icons/md";

const PageContainer = styled.div`
    display: flex;
    align-content: space-between;
    align-items: center;
    padding: 0 16px;
    width: calc(100vw - 144px);
`;

const ProductsContainer = styled.div`
    display: flex;
    padding: 16px;
    padding-top: 0;
    flex-direction: column;
    align-content: space-between;
    align-items: center;
    height: 93vh;
    width: 100%;
    background: #FFFFFF;
`;

const SearchContainer = styled.div`
    display: flex;
    padding: 16px;
    border-bottom: 1px solid #D8D8D6;
    width: 100%;
    justify-content: space-between;
    align-items: center;
    min-height: 56px;
`;

function Categories () {
    const { categoriesToSelect, deleteCategory } = useProduct();
    const [categoryModalOpen, setCategoryModalOpen] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState();
    const [categoryToUpdate, setCategoryToUpdate] = useState();
    const [searchName, setSearchName] = useState('');

    const filteredCategories = useMemo(() => {
        const filterByName = (prds) => {
            const searchParam = searchName.toLowerCase();
            return prds.filter(prd => prd.toLowerCase().includes(searchParam));
        }

        return [
            searchName ? filterByName : null,
        ].filter(Boolean).reduce((acc, execFun) => {
            return execFun(acc);
        }, categoriesToSelect).sort();
    }, [categoriesToSelect, searchName]);

    return (
        <>
            <PageContainer>
                <ProductsContainer>
                    <SearchContainer>
                        <TextField 
                            style={{ width: '50%' }} 
                            value={searchName} 
                            onChange={(e) => setSearchName(e.target.value)}
                            id="search-by-name" 
                            label="Nome da Categoria" 
                            variant="outlined"
                            autoComplete='off'
                            type="search"
                        />
                        
                        <Tooltip title="Criar nova categoria">
                            <IconButton aria-label="new-category" style={{ color: '#6baed6', fontSize: 40 }} onClick={() => setCategoryModalOpen(true)}>
                                <MdCategory />
                            </IconButton>
                        </Tooltip>
                    </SearchContainer>
                    <div style={{ width: '100%', height: '100%', overflowY: 'auto', padding: 16 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', maxWidth: 500, padding: 16 }}>
                            {Boolean(filteredCategories.length) && filteredCategories.map((category) => {
                                return (
                                    <div key={category} style={{ padding: 8, alignItems: 'center', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #D8D8D6', width: '100%' }}>
                                        <p style={{ textAlign: 'start' }}>{category}</p>
                                        <div style={{ display: 'flex' }}>
                                            <Tooltip title="Editar categoria">
                                                <IconButton 
                                                    aria-label="update-category" 
                                                    style={{ color: '#6baed6', fontSize: 24 }} 
                                                    onClick={() => {
                                                        setCategoryToUpdate(category);
                                                        setCategoryModalOpen(true);
                                                    }}
                                                >
                                                    <MdEdit />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Deletar categoria">
                                                <IconButton aria-label="delete-category" style={{ color: '#ed2939', fontSize: 24 }} onClick={() => setCategoryToDelete(category)}>
                                                    <MdDelete />
                                                </IconButton>
                                            </Tooltip>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                </ProductsContainer>
            </PageContainer>
            {categoryModalOpen && (
                <NewCategoryModal 
                    handleClose={(newValue) => {
                        setCategoryModalOpen(false);
                        setCategoryToUpdate(null);
                        if (newValue) {
                            setSearchName('');
                        }
                    }}
                    categoryValue={categoryToUpdate}
                />
            )}
            {categoryToDelete && (
                <ConfirmModal 
                    title="Deletar categoria"
                    text="Você tem certeza que deseja deletar essa categoria?"
                    onConfirm={() => {
                        deleteCategory(categoryToDelete);
                        setCategoryToDelete(null);
                    }}
                    handleClose={() => setCategoryToDelete(null)} 
                />
            )}
        </>
  );
}

export default Categories;
