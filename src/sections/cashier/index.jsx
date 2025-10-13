import styled from 'styled-components';
import { useEffect, useMemo, useState } from 'react';
import { useActions } from '../../contexts/actions';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { CashStockSC, DatePicker } from './styles';
import DateTimeFormats from './locale';
import PriceInput from '../../components/price-input';
import { isNumber } from 'radash';
import { Button } from '@mui/material';

const PageContainer = styled.div`
    display: flex;
    align-content: space-between;
    align-items: center;
    padding: 0 16px;
    width: calc(100vw - 144px);
    justify-content: space-between;
`;

const ReportContainer = styled.div`
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
    align-items: center;
    justify-content: space-between;
    min-height: 56px;
`;

const tableKeys = [
    {
        title: 'Data',
        key: 'date',
        align: 'left'
    },
    {
        title: 'Caixa Inicial',
        key: 'initialValue',
        bold: true,
        align: 'right'
    },
    {
        title: 'Vendas Totais',
        key: 'sales',
        bold: true,
        align: 'right'
    },
    {
        title: 'Sangria',
        key: 'finalValue',
        bold: true,
        align: 'right'
    }
];

function Cashier () {
    const { actions, getCurrentInitialValue, saveCashStock, getAllStockInitialValues } = useActions();

    const [initialValue, setInitialValue] = useState(getCurrentInitialValue());
    
    const [selectionRange, setSelectionRange] = useState();

    useEffect(() => {
        setInitialValue(getCurrentInitialValue());
    }, [getCurrentInitialValue]);

    const reports = useMemo(() => {
        const filteredSales = 
            actions.filter(log => log.type === 'sale' && log.paymentType === "dinheiro")

        const sales = selectionRange?.length ? filteredSales.filter(item => {
            const date = new Date(item.date).getTime();
            return (selectionRange[0].getTime() <= date && date <= selectionRange[1].getTime())
        }) : filteredSales;

        const groupedSales = sales
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .map(item => {
                const date = new Date(item.date);

                return ({
                    ...item,
                    date: `${date.getDate()}/${date.getMonth()}/${date.getFullYear()}`
                });
            })
            .reduce((acc, curItem) => {
                const total = (curItem.products || []).reduce((ac, it) => ac + it.price * it.quantity, 0)

                return {
                    ...acc,
                    [curItem.date]: total + (acc[curItem.date] ?? 0)
                }
            }, {});

        const cashStock = getAllStockInitialValues().map(item => {
            const date = new Date(item.date);
            
            return {
                value: item.initialValue,
                date: `${date.getDate()}/${date.getMonth()}/${date.getFullYear()}`
            };
        });

        return Object.entries(groupedSales).map(([date, sales]) => {
            const initialValue = cashStock.find(item => item.date === date)?.value ?? 0;

            return {
                date: date
                    .split('/')
                    .map(item => item.length == 1 ? `0${item}`: item)
                    .join('/'),
                sales: (sales).toFixed(2).replace('.', ','),
                initialValue: (initialValue).toFixed(2).replace('.', ','),
                finalValue: (initialValue + sales).toFixed(2).replace('.', ',')
            };
        }).filter(item => item.date);
    }, [selectionRange, actions]);

    return (
        <PageContainer>
            <ReportContainer>
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

                    <div>
                        <CashStockSC>
                            <PriceInput 
                                title="Fundo de Caixa diário" 
                                priceValue={initialValue}
                                onUpdate={(value) => {
                                    setInitialValue(value);
                                }}
                                required
                                width="160px"
                            />

                            <div style={{ marginLeft: 16 }}>
                                <Button 
                                    variant="contained" 
                                    size="large"
                                    onClick={() => {
                                        const value = Number(initialValue);
                                        if (isNumber(value || 0) && !Number.isNaN(value))
                                            saveCashStock(value || 0);
                                    }}
                                    style={{ marginTop: -16 }}
                                >
                                    Atualizar caixa diário
                                </Button>
                            </div>
                        </CashStockSC>
                    </div>
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
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </div>
                </div>
            </ReportContainer>
        </PageContainer>
  );
}

export default Cashier;
