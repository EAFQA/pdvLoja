import styled from 'styled-components';
import { useMemo, useState } from 'react';
import TextField from '@mui/material/TextField';
import { Autocomplete } from '@mui/material';
import { useProduct } from '../../contexts/product';
import { useActions } from '../../contexts/actions';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { DatePicker } from './styles';
import DateTimeFormats from './locale';
import { PaymentTypes } from '../../utils';

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

const tableKeys = [
    {
        title: 'Produto',
        key: 'name',
        align: 'left'
    },
    {
        title: 'Quantidade',
        key: 'quantity',
        align: 'right'
    },
    {
        title: 'Categoria',
        key: 'category',
        defaultValue: '-',
        align: 'left'
    },
    {
        title: 'Preço',
        key: 'productValue',
        bold: true,
        align: 'right'
    },
    {
        title: 'Formas de pagamento',
        key: 'paymentTypes',
        bold: false,
        defaultValue: '-',
        align: 'left'
    },
    {
        title: 'Total',
        key: 'total',
        bold: true,
        align: 'right'
    }
];

const getDefaultDate = () => {
    const start = new Date();
    const end = new Date();

    start.setHours(0);
    start.setMinutes(0);
    end.setHours(23);
    end.setMinutes(59);

    return [
        start,
        end
    ]
}

function Reports () {
    const { categoriesToSelect, products } = useProduct();
    const { actions } = useActions();
    const [categories, setCategories] = useState([]);
    const [productsToSearch, setProductsToSearch] = useState([]);
    const [paymentType, setPaymentType] = useState();
    
    const [selectionRange, setSelectionRange] = useState(getDefaultDate());

    const productsToSelect = useMemo(()=> {
        return products.map(item => ({
            label: item.name,
            value: item.id
        }));
    }, [products]);

    const reports = useMemo(() => {
        const filteredSales = paymentType ? 
            actions.filter(log => log.type === 'sale' && log.paymentType === paymentType?.value) : 
            actions.filter(log => log.type === 'sale');
        const sales = selectionRange?.length ? filteredSales.filter(item => {
            const date = new Date(item.date).getTime();
            return (selectionRange[0].getTime() <= date && date <= selectionRange[1].getTime())
        }) : filteredSales;

        const filterByCategory = (prds) => {
            return prds.filter(prd => prd.category && (categories.includes(prd.category?.label ?? prd.category)));
        }

        const filterByProduct = (prds) => {
            return prds.filter(prd => productsToSearch.some(item => item.value === prd.id));
        }

        return [
            categories.length > 0 ? filterByCategory : null,
            productsToSearch.length > 0 ? filterByProduct : null,
        ].filter(Boolean).reduce((acc, execFun) => {
            return execFun(acc);
        }, products)
        .map((curr) => {
            const productSales = sales.filter(sale => sale.products.some(item => item.id === curr.id));

            const allSales = productSales
                .map(item => item.products.filter(item => item.id === curr.id))
                .flat();

            const data = {
                quantity: allSales
                    .reduce((salesAcc, sale) => {
                        return salesAcc + sale.quantity
                    }, 0),
                productValue: curr.price || 0,
                paymentTypes: productSales.map(item => item.paymentType).sort(),
                total: allSales
                    .reduce((salesAcc, sale) => {
                        return salesAcc + sale.quantity * sale.price; 
                    }, 0)
            };

            const unity = ['litro', 'kg'].includes(curr.quantityType) ? curr.quantityType : 'un';

            const quantity = ['litro', 'kg'].includes(curr.quantityType) ? data.quantity.toFixed(2).replace('.', ',') : data.quantity;

            return {
                soldItems: data.quantity,
                quantity: `${quantity} ${unity}${data.quantity >= 2 ? 's' : ''}`,
                total: `R$${data.total.toFixed(2).replace('.', ',')}`,
                totalValue: Number(data.total.toFixed(2)),
                paymentTypes: [ ...new Set(data.paymentTypes.filter(Boolean)) ].join(', '),
                productValue: `R$${data.productValue.toFixed(2).replace('.', ',')}`,
                category: curr?.category?.label ?? curr.category,
                name: curr.name
            }
        }).filter(item => item.soldItems);
    }, [categories, productsToSearch, paymentType, selectionRange]);

    const totalReports = useMemo(() => {
        if (!reports.length) return null;

        const result = reports.reduce((acc, item) => {
            return item.totalValue + acc;
        }, 0);

        return `R$${result.toFixed(2).replace('.', ',')}`;
    }, [reports]);

    return (
        <PageContainer>
            <ProductsContainer>
                <SearchContainer>
                    <DatePicker 
                        size="lg"
                        label="Período:"
                        locale={DateTimeFormats}
                        placeholder="Dia/Mês/Ano ~ Dia/Mês/Ano"
                        onChange={(newValues) => {
                            if (!newValues) {
                                setSelectionRange([]);
                            }

                            setSelectionRange(
                                newValues.map((item, index) => {
                                    const date = new Date(item);

                                    if (index === 0) {
                                        date.setHours(0);
                                        date.setMinutes(0);
                                    } else {
                                        date.setHours(23);
                                        date.setMinutes(59);
                                    }

                                    return date;
                                })
                            )
                        }}
                        value={selectionRange}
                    />

                    <Autocomplete
                        disablePortal
                        options={productsToSelect}
                        multiple
                        limitTags={1}
                        value={productsToSearch}
                        onChange={(_event, newValue) => {
                            setProductsToSearch(newValue);
                        }}
                        sx={{ 
                            width: '25%',
                            maxHeight: 56
                        }}
                        renderInput={(params) => <TextField {...params} label="Produtos" />}
                    />

                    <Autocomplete
                        disablePortal
                        options={categoriesToSelect}
                        multiple
                        limitTags={1}
                        value={categories}
                        onChange={(_event, newValue) => {
                            setCategories(newValue);
                        }}
                        sx={{
                            width: '20%',
                            maxHeight: 56
                        }}
                        renderInput={(params) => <TextField {...params} label="Categorias" />}
                    />

                    <Autocomplete
                        disablePortal
                        options={PaymentTypes}
                        value={paymentType}
                        onChange={(_event, selected) => {
                            setPaymentType(selected);
                        }}
                        sx={{
                            width: '15%',
                            maxHeight: 56
                        }}
                        renderInput={(params) => <TextField {...params} label="Forma de Pagamento" />}
                    />
                </SearchContainer>
                <div style={{ width: '100%', height: '100%', overflowY: 'auto', padding: 16 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', padding: 16 }}>
                        <TableContainer component={Paper} sx={{ maxWidth: 800 }}>
                            <Table sx={{ maxWidth: 800 }} aria-label="simple table">
                                <TableHead>
                                    <TableRow>
                                        {
                                            tableKeys.map(item => (
                                                <TableCell align={item.align} key={item.key}>
                                                    {item.title}
                                                </TableCell>
                                            ))
                                        }
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {reports.map(item => {
                                        return (
                                            <TableRow
                                                key={item.id}
                                                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                            >
                                                {tableKeys.map(prop => {
                                                    return (
                                                        <TableCell align={prop.align} component="th" scope="row" key={prop.key} style={{ fontWeight: prop.bold ? 'bold' : ''  }}>
                                                            {item[prop.key] || prop.defaultValue}
                                                        </TableCell>
                                                    );
                                                })}
                                            </TableRow>
                                        )
                                    })}
                                    {
                                        Boolean(totalReports) && (
                                            <TableRow
                                                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                            >
                                                {tableKeys.map((prop, index) => {
                                                    return (
                                                        <TableCell align={prop.align} component="th" scope="row" key={prop.key} style={{ fontWeight: 'bold'  }}>
                                                            {index === 0 && "Total"}
                                                            {index === tableKeys.length - 1 && totalReports}
                                                        </TableCell>
                                                    );
                                                })}
                                            </TableRow>
                                        )
                                    }
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </div>
                </div>
            </ProductsContainer>
        </PageContainer>
  );
}

export default Reports;
