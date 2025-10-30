import styled from 'styled-components';
import { ImCart } from "react-icons/im";
import { useCallback, useMemo, useState } from 'react';
import { MdAddBusiness, MdAddCircleOutline, MdCreate } from "react-icons/md";
import TextField from '@mui/material/TextField';
import { Autocomplete, FormControl, IconButton, InputLabel, MenuItem, Select, Tooltip, Typography } from '@mui/material';
import { IoAddCircleSharp } from "react-icons/io5";
import ProductModal from '../../components/product-modal';
import { useProduct } from '../../contexts/product';
import ProductList from '../../components/product-list';
import CartList from '../../components/invoice-list';
import ProductStockList from '../../components/product-stock-list';
import StockUpdateList from '../../components/stock-update-list';
import DeleteProductModal from '../../components/delete-product-modal';
import ProductHistoryModal from '../../components/product-history-modal';
import { AiFillProduct } from 'react-icons/ai';
import { CgGift } from "react-icons/cg";
import { BsBoxes } from 'react-icons/bs';

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
    width: 60%;
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

const StockContainer = styled.div`
    display: flex;
    padding: 16px;
    padding-top: 0;
    flex-direction: column;
    align-content: space-between;
    align-items: center;
    height: 93vh;
    margin-left: 1%;
    width: calc(39% - 32px);
    background: #FFFFFF;
`;


function Stock () {
    const { products, categoriesToSelect } = useProduct();
    const [order, setOrder] = useState();
    const [categories, setCategories] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState();
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [isProductHistoryModalOpen, setIsProductHistoryModalOpen] = useState(false);
    const [searchName, setSearchName] = useState('');

    const filteredProducts = useMemo(() => {
        const filterByCategory = (prds) => {
            return prds.filter(prd => prd.category && categories.includes(prd.category));
        }

        const filterByName = (prds) => {
            const searchParam = searchName.toLowerCase();
            return prds.filter(prd => prd.name.toLowerCase().includes(searchParam));
        }

        const orderBy = (prds) => {
            return prds.sort((prd1, prd2) => {
                if (order.label === 'Por maior preço') {
                    return prd2.price - prd1.price;
                }

                if (order?.label === 'Por ordem alfabética') {
                    const nameA = prd1.name.toUpperCase();
                    const nameB = prd2.name.toUpperCase();

                    return nameA.localeCompare(nameB);
                }
                
                return prd1.price - prd2.price;
            });
        };

        return [
            categories.length > 0 ? filterByCategory : null,
            searchName ? filterByName : null,
            order ? orderBy : null
        ].filter(Boolean).reduce((acc, execFun) => {
            return execFun(acc);
        }, products);
    }, [products, order ,categories, searchName]);

    return (
    <PageContainer>
        <ProductsContainer>
            <SearchContainer>
                <TextField 
                    style={{ width: '25%' }} 
                    value={searchName} 
                    onChange={(e) => setSearchName(e.target.value)} 
                    id="search-by-name" 
                    label="Nome do Produto" 
                    variant="outlined" 
                />
                <Autocomplete
                    disablePortal
                    options={[
                        { label: 'Por maior preço' }, 
                        { label: 'Por menor preço' },
                        { label: 'Por ordem alfabética' }
                    ]}
                    value={order}
                    onChange={(_event, newValue) => {
                        setOrder(newValue);
                    }}
                    sx={{ width: '30%', maxWidth: 200 }}
                    renderInput={(params) => <TextField {...params} label="Ordem" />}
                />
                <Autocomplete
                    disablePortal
                    options={categoriesToSelect}
                    multiple
                    value={categories}
                    onChange={(_event, newValue) => {
                        setCategories(newValue);
                    }}
                    sx={{ 
                        width: '30%',
                        maxHeight: 56
                    }}
                    renderInput={(params) => <TextField {...params} label="Categorias" />}
                />
                <Tooltip title="Criar novo produto">
                    <IconButton aria-label="new-product" style={{ color: '#6baed6', fontSize: 40 }} onClick={() => setIsProductModalOpen(true)}>
                        <BsBoxes />
                    </IconButton>
                </Tooltip>
            </SearchContainer>

            <ProductStockList 
                products={filteredProducts} 
                onEditProduct={(product) => {
                    setSelectedProduct(product);
                    setIsProductModalOpen(true);
                }} 
                onDeleteProduct={ (product) => {
                    setSelectedProduct(product);
                    setIsDeleteModalOpen(true);
                }} 
                onShowProductHistory={(product) => {
                    setSelectedProduct(product);
                    setIsProductHistoryModalOpen(true);
                }}
            />
        </ProductsContainer>
        <StockContainer>
            <SearchContainer>
                <Typography variant='h4' style={{ textAlign: 'center', width: '100%' }}>Editar Vários Produtos</Typography>
            </SearchContainer>
            <StockUpdateList />
        </StockContainer>
        {
            isProductModalOpen && 
            (
                <ProductModal 
                    product={selectedProduct} 
                    handleClose={() => {
                        setIsProductModalOpen(false);
                        setSelectedProduct();
                    }} 
                />
            )
        }
        {
            isDeleteModalOpen && 
            (
                <DeleteProductModal 
                    product={selectedProduct} 
                    handleClose={() => {
                        setIsDeleteModalOpen(false);
                        setSelectedProduct();
                    }} 
                />
            )
        }
        {
            isProductHistoryModalOpen && (
                <ProductHistoryModal
                    product={selectedProduct}
                    handleClose={() => {
                        setIsProductHistoryModalOpen(false);
                        setSelectedProduct();
                    }}
                />
            )
        }
    </PageContainer>
  );
}

export default Stock;
