import { createContext, useCallback, useContext, useState } from "react";
import { toast } from "react-toastify";

const InvoicePrintContext = createContext();

export const InvoicePrintProvider = ({ children }) => {
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [invoiceToPrint, setInvoiceToPrint] = useState(null);
  const [askToView, setAskToView] = useState(false);
  
  const openPrintModal = useCallback((invoice, askToView = false) => {
    setInvoiceToPrint(invoice);
    setAskToView(askToView);
    setShowPrintModal(true);
  }, []);

  return (
    <InvoicePrintContext.Provider 
      value={{ 
        openPrintModal,
        showPrintModal,
        setShowPrintModal,
        invoiceToPrint,
        askToView,
        setAskToView
      }}
    >
      {children}
    </InvoicePrintContext.Provider>
  );
};

// Custom hook to use ProductContext
export const useInvoicePrint = () => useContext(InvoicePrintContext);