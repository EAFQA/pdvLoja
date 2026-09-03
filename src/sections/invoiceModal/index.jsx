import React from 'react';
import { useInvoicePrint } from '../../contexts/invoicePrint';
import { ModalButton, ModalContainer, ModalContent, ModalQuestion } from './styles';
import {
  SalePDFPreview,
  SalePDFDownload
} from "./pdfUtils";
import { useProduct } from '../../contexts/product';
import { Button } from '@mui/material';

export const InvoiceModal = () => {
    const { showPrintModal, setShowPrintModal, invoiceToPrint, askToView, setAskToView } = useInvoicePrint();
    const { products } = useProduct();

    if (!showPrintModal || !invoiceToPrint) return (
        <></>
    );

    return (
        <ModalContainer>
            <ModalContent style={{ width: askToView ? '200px' : '600px' }}>
                {!askToView && (
                    <>
                        <SalePDFPreview
                            sale={invoiceToPrint}
                            products={products}
                        />
                        <Button 
                            variant="contained" 
                            style={{ marginTop: 16, backgroundColor: '#ed2939' }}
                            size="large"
                            onClick={() => setShowPrintModal(false)}
                        >
                            Fechar
                        </Button>
                    </>
                )}
                {askToView && (
                    <>
                        <ModalQuestion>Deseja visualizar a nota fiscal?</ModalQuestion>
                        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                            <Button 
                                variant="contained" 
                                style={{ marginTop: 16, backgroundColor: '#4CAF50' }}
                                size="large"
                                onClick={() => setAskToView(false)}
                            >
                                Visualizar
                            </Button>
                            <Button 
                                variant="contained" 
                                style={{ marginTop: 16, backgroundColor: '#ed2939' }}
                                size="large"
                                onClick={() => setShowPrintModal(false)}
                            >
                                Fechar
                            </Button>
                        </div>
                    </> 
                )}
            </ModalContent>
        </ModalContainer>
    )
};
