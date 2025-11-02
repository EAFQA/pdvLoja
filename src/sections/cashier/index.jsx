import styled from 'styled-components';
import { useEffect, useMemo, useRef, useState } from 'react';
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
import { group, isNumber } from 'radash';
import { Button } from '@mui/material';
import { FormatCash } from '../../utils';
import { GiConfirmed } from "react-icons/gi";
import ConfirmModal from '../../components/confirm-modal';

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
        align: 'right',
        defaultValue: '-'
    }
];

function Cashier () {
    const { actions, getCurrentInitialValue, saveCashStock, getAllStockInitialValues, updateRetiredValue } = useActions();

    const [currentStockRetire, setCurrentStockRetire] = useState(0);

    const [initialValue, setInitialValue] = useState(0);
    const [isShowingWithdrawModal, setIsShowingWithdrawModal] = useState(false);
    const [isValueLocked, setValueLocked] = useState(false);
    
    const [selectionRange, setSelectionRange] = useState();

    useEffect(() => {
        const [
            newInitialValue,
            newIsLocked
        ] = getCurrentInitialValue();

        setInitialValue(newInitialValue);
        setValueLocked(newIsLocked);
    }, [getCurrentInitialValue]);

    const reports = useMemo(() => {
        const filteredSales = 
            actions.filter(log => log.type === 'sale' && log.paymentType === "dinheiro")

        const sales = selectionRange?.length ? filteredSales.filter(item => {
            const date = new Date(item.date).getTime();
            return (selectionRange[0].getTime() <= date && date <= selectionRange[1].getTime())
        }) : filteredSales;

        let groupedSales = sales
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .map(item => {
                const date = new Date(item.date);

                return ({
                    ...item,
                    date: `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`
                });
            })
            .reduce((acc, curItem) => {
                const total = (curItem.products || []).reduce((ac, it) => ac + it.price * it.quantity, 0)

                return {
                    ...acc,
                    [curItem.date]: total + (acc[curItem.date] ?? 0)
                }
            }, {});

        const currentDate = new Date();
        const currentDateStr = `${currentDate.getDate()}/${currentDate.getMonth() + 1}/${currentDate.getFullYear()}`

        if (typeof groupedSales[currentDateStr] !== 'number') {
            groupedSales[currentDateStr] = 0;
        }

        const cashStock = getAllStockInitialValues().map(item => {
            const date = new Date(item.date);
            
            return {
                value: item.initialValue,
                date: `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`,
                retiredValue: item.retiredValue
            };
        });

        if (!cashStock.some(item => item.date === currentDateStr)) {
            cashStock.unshift({
                date: currentDateStr,
                value: initialValue
            });
        }

        const values = Object.entries(groupedSales)
            .sort((a, b) => {
                const [aDateStr] = a;
                const [bDateStr] = b;
                const aDateParts = aDateStr.split('/').map(part => Number(part));
                const bDateParts = bDateStr.split('/').map(part => Number(part));
                const aDate = new Date(aDateParts[2], aDateParts[1] - 1, aDateParts[0]);
                const bDate = new Date(bDateParts[2], bDateParts[1] - 1, bDateParts[0]);
                return bDate - aDate;
            })
            .map(([date, sales]) => {
            const curCashStock = cashStock.find(item => item.date === date);
            const initialValue = curCashStock?.value ?? 0;

            const finalValue = curCashStock?.retiredValue;

            const retireLimit = sales;

            return {
                date: date
                    .split('/')
                    .map(item => item.length == 1 ? `0${item}`: item)
                    .join('/'),
                sales: FormatCash(sales),
                salesInput: sales,
                isRetireCompleted: typeof finalValue === 'number' && finalValue === retireLimit,
                initialValue: FormatCash(initialValue),
                initialValueInput: initialValue,
                finalValue: typeof finalValue === 'number' ? FormatCash(finalValue) : null,
                finalValueInput: (retireLimit).toFixed(2),
                color: 'black',
                retiredValue: curCashStock?.retiredValue
            };
        }).filter(item => item.date);

        if (values[0])
        {
            setCurrentStockRetire(values[0].retiredValue || values[0].finalValueInput);
        }

        return values;
    }, [selectionRange, actions, initialValue, getCurrentInitialValue, getAllStockInitialValues]);

    return (
        <>
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
                                    disabled={isValueLocked}
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
                                        disabled={isValueLocked}
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
                                        {reports.map((item, repoIndex) => {
                                            return (
                                                <TableRow
                                                    key={item.id}
                                                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                                >
                                                    {tableKeys.map((prop, index) => {
                                                        if (repoIndex === 0 && index === tableKeys.length - 1 && !item.isRetireCompleted)
                                                        {
                                                            return (
                                                                <TableCell align={prop.align} component="th" scope="row" key={prop.key} style={{ 
                                                                    fontWeight: prop.bold ? 'bold' : '',  
                                                                    color: prop.key === 'finalValue' ? item.color : 'black',
                                                                    display: 'flex', 
                                                                    alignItems: 'center'  
                                                                }}>
                                                                    <div style={{ marginLeft: 16 }}
                                                                        onClick={() => {
                                                                            const value = Number(currentStockRetire);

                                                                            if (Number.isNaN(value) || item.finalValueInput <= 0 || value > item.finalValueInput) return;

                                                                            if (isNumber(value || 0) && !Number.isNaN(value)) {
                                                                                if (value < item.finalValueInput) {
                                                                                    setIsShowingWithdrawModal(true);
                                                                                    return;
                                                                                }
                                                                                updateRetiredValue(value || 0, item.salesInput, item.initialValueInput);
                                                                            }
                                                                        }}
                                                                    >
                                                                        <GiConfirmed fontSize={24} />
                                                                    </div>
                                                                    
                                                                    <PriceInput 
                                                                        title="" 
                                                                        priceValue={currentStockRetire}
                                                                        onUpdate={(value) => {
                                                                            setCurrentStockRetire(value);
                                                                        }}
                                                                        disabled={item.finalValueInput <= 0}
                                                                        required
                                                                        width="160px"
                                                                    />
                                                                </TableCell>
                                                            );
                                                        }

                                                        return (
                                                            <TableCell align={prop.align} component="th" scope="row" key={prop.key} style={{ 
                                                                fontWeight: prop.bold ? 'bold' : '',  
                                                                color: prop.key === 'finalValue' ? item.color : 'black'   
                                                            }}>
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
            {isShowingWithdrawModal && (
                <ConfirmModal 
                    title="Confirmar sangria"
                    text="Ao confirmar a sangria sem o valor total, o restante irá automaticamente para o fundo de caixa. Deseja realmente continuar?"
                    onConfirm={() => {
                        updateRetiredValue(Number(currentStockRetire || 0), reports[0].salesInput, reports[0].initialValueInput);
                        setIsShowingWithdrawModal(false);
                    }}
                    handleClose={() => setIsShowingWithdrawModal(false)} 
                />
            )}
        </>
  );
}

export default Cashier;
