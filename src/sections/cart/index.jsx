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

function Cart () {
    const { products } = useProduct();
    const [order, setOrder] = useState();
    const [categories, setCategories] = useState([]);
    const [selectedProduct, _setSelectedProduct] = useState();
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);

    const filteredProducts = useMemo(() => {
        return products.filter(prd => !prd.isDeleted);
    }, [products, order ,categories]);

    return (
    <PageContainer>
        <ProductsContainer>
            <SearchContainer>
                <TextField style={{ width: 250 }} id="search-by-name" label="Nome do Produto" variant="outlined" />
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
                    options={[{ label: 'test' }, {label: 'test2'}]}
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

            <ProductList products={filteredProducts} />
        </ProductsContainer>
        <CartContainer>
            <SearchContainer>
                <Typography variant='h3' style={{ textAlign: 'center', width: '100%' }}>Resumo</Typography>
            </SearchContainer>
            <CartList />
        </CartContainer>
        {
            isProductModalOpen && 
            (
                <ProductModal 
                    product={selectedProduct} 
                    handleClose={() => {
                        setIsProductModalOpen(false);
                    }} 
                />
            )
        }
    </PageContainer>
  );
}

export default Cart;
