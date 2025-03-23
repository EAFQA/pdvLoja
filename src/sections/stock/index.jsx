import styled from 'styled-components';
import { ImCart } from "react-icons/im";
import { useCallback, useMemo, useState } from 'react';
import { MdAddBusiness, MdAddCircleOutline } from "react-icons/md";
import TextField from '@mui/material/TextField';
import { Autocomplete, FormControl, IconButton, InputLabel, MenuItem, Select, Typography } from '@mui/material';
import { IoAddCircleSharp } from "react-icons/io5";
import ProductModal from '../../components/product-modal';
import { useProduct } from '../../contexts/product';
import ProductList from '../../components/product-list';
import CartList from '../../components/invoice-list';
import ProductStockList from '../../components/product-stock-list';
import StockUpdateList from '../../components/stock-update-list';
import DeleteProductModal from '../../components/delete-product-modal';
import ProductHistoryModal from '../../components/product-history-modal';

const PageContainer = styled.div`
    display: flex;
    align-content: space-between;
    align-items: center;
    padding: 0 32px;
    width: 100%;
`;


const ProductsContainer = styled.div`
    display: flex;
    padding: 16px;
    padding-top: 0;
    flex-direction: column;
    align-content: space-between;
    align-items: center;
    height: 90vh;
    width: 70%;
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

const CartContainer = styled.div`
    display: flex;
    padding: 16px;
    padding-top: 0;
    flex-direction: column;
    align-content: space-between;
    align-items: center;
    height: 90vh;
    margin-left: 1%;
    width: 29%;
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
            return prds.filter(prd => categories.every(cat => prd.categories.includes(cat)));
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
                    style={{ width: 250 }} 
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
                        { label: 'Por menor preço' }
                    ]}
                    value={order}
                    onChange={(_event, newValue) => {
                        setOrder(newValue);
                    }}
                    sx={{ width: 200 }}
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
                        width: 300
                     }}
                     style={{ maxHeight: 56 }}
                    renderInput={(params) => <TextField {...params} label="Categorias" />}
                />
                <IconButton aria-label="new-product" style={{ color: '#6baed6', fontSize: 40 }} onClick={() => setIsProductModalOpen(true)}>
                    <IoAddCircleSharp />
                </IconButton>
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
        <CartContainer>
            <SearchContainer>
                <Typography variant='h3' style={{ textAlign: 'center', width: '100%' }}>Alteração no Estoque</Typography>
            </SearchContainer>
            <StockUpdateList />
        </CartContainer>
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
