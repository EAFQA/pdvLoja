import { createContext, use, useCallback, useContext, useEffect, useState } from "react";
import {  BaseDirectory, readTextFile, writeTextFile } from '@tauri-apps/plugin-fs';

// Create the ProductContext
const ActionsContext = createContext();

const dbName = "pdv/pdv-actions.json";

const config = {
  baseDir: BaseDirectory.Document
};


// Provider Component
export const ActionsProvider = ({ children }) => {
  const [actions, setActions] = useState([]);
  const [editingActionProducts, setEditingActionProducts] = useState([]);

  const saveData = useCallback(async (newActions) => {
    await writeTextFile(dbName, JSON.stringify(newActions), config);
  }, []);

  // Function to log an action
  const logAction = (action) => {
    const newActions = [action, ...actions];

    if (action.type === 'sale' && action.paymentType === 'dinheiro') {
      const [currentCashStock, isLocked] = getCurrentInitialValue();

      if (!isLocked) {
        newActions.unshift({
          date: new Date().toISOString(),
          type: 'cash-stock',
          products: [],
          initialValue: currentCashStock
        });
      }
    }

    setActions(newActions);
    saveData(newActions);
  };

  const loadData = useCallback(async () => {    
    try {
      const existingDB = await readTextFile(dbName, config);
  
      if (existingDB) {
        const contents = await readTextFile(dbName, config);
        
        if (contents) {
          setActions(JSON.parse(contents));
          return;
        }
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, []);

  const addItemsToAction = useCallback((itemId, name, value) => {
    const itemOnEdit = editingActionProducts.find(item => item.id === itemId);

    if (!itemOnEdit) {
      setEditingActionProducts([...editingActionProducts, { id: itemId, name, quantity: value }]);
      return;
    }

    const newEditingActionProducts = editingActionProducts.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          quantity: value
        };
      }
      return item;
    }).filter(item => item.quantity !== 0);

    setEditingActionProducts(newEditingActionProducts);
  }, [editingActionProducts]);

  const clearEditingActionProducts = useCallback(() => {
    setEditingActionProducts([]);
  }, [setEditingActionProducts]);

  const removeItemFromAction = useCallback((itemId) => {
    const newEditingActionProducts = editingActionProducts.filter(item => item.id !== itemId);
    setEditingActionProducts(newEditingActionProducts);
  }, [editingActionProducts, setEditingActionProducts]);

  const completeUpdate = useCallback(() => {
    const newActions = [{
      date: new Date().toISOString(),
      type: 'stock',
      products: editingActionProducts.map(item => ({
        id: item.id,
        quantity: item.quantity,
      })).filter(item => item.quantity !== 0)
    }, ...actions];
    setActions(newActions);
    saveData(newActions);
    clearEditingActionProducts();
  }, [actions, editingActionProducts, clearEditingActionProducts, saveData]);

  const saveCashStock = useCallback((value) => {
    const currentDate = new Date();
    
    const newValue = {
      date: currentDate.toISOString(),
      type: 'cash-stock',
      products: [],
      initialValue: value
    };

    const cashIndex = actions.findIndex(action => {
      if (action.type !== 'cash-stock') return;

      const dateOfAction = new Date(action.date);

      const dates = [
        dateOfAction,
        currentDate
      ].map(item => `${item.getDate()}-${item.getMonth()}-${item.getFullYear()}`)

      return (
        dates[1] === dates[0]
      );
    });

    const newActions = cashIndex !== -1 
      ? actions.map((item, index) => index === cashIndex ? newValue : item)
      : [newValue, ...actions];

    setActions(newActions);
    saveData(newActions);
  }, [actions, saveData]);

  const updateRetiredValue = useCallback((retiredValue, salesValue, initialValue) => {
    const currentDate = new Date();
    
    const newValue = {
      date: currentDate.toISOString(),
      type: 'cash-stock',
      products: [],
      initialValue,
      retiredValue
    };

    const cashIndex = actions.findIndex(action => {
      if (action.type !== 'cash-stock') return;

      const dateOfAction = new Date(action.date);

      const dates = [
        dateOfAction,
        currentDate
      ].map(item => `${item.getDate()}-${item.getMonth()}-${item.getFullYear()}`)

      return (
        dates[1] === dates[0]
      );
    });

    const newActions = cashIndex !== -1 
      ? actions.map((item, index) => index === cashIndex ? newValue : item)
      : [newValue, ...actions];
    
    const nextDay = new Date(currentDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const nextDayValue = {
      date: nextDay.toISOString(),
      type: 'cash-stock',
      products: [],
      initialValue: Number((salesValue - retiredValue).toFixed(2))
    };

    newActions.unshift(nextDayValue);

    setActions(newActions);
    saveData(newActions);
  }, [actions, saveData]);

  const getCurrentInitialValue = useCallback(() => {
    const currentDate = new Date();
    
    const dailyValue = actions.find(action => {
      if (action.type !== 'cash-stock') return;

      const dateOfAction = new Date(action.date);

      return (
        dateOfAction.getFullYear() === currentDate.getFullYear() &&
        dateOfAction.getMonth() === currentDate.getMonth() &&
        dateOfAction.getDate() === currentDate.getDate()
      );
    });

    if (!dailyValue) {
      const firstStock = actions.find(item => item.type === 'cash-stock');
      
      return [
        firstStock?.initialValue || 0,
        false
      ]
    }

    return [
      dailyValue?.initialValue || 0,
      true
    ];
  }, [actions]);

  const getAllStockInitialValues = useCallback(() => (
    actions.filter(item => item.type === 'cash-stock')
  ), [actions]);
  
  return ( 
    <ActionsContext.Provider value={{ 
      completeUpdate, 
      actions, 
      logAction, 
      editingActionProducts, 
      setEditingActionProducts, 
      addItemsToAction, 
      removeItemFromAction, 
      clearEditingActionProducts,
      saveCashStock,
      getCurrentInitialValue,
      getAllStockInitialValues,
      updateRetiredValue
    }}>
      {children}
    </ActionsContext.Provider>
  );
};



// Custom hook to use ProductContext
export const useActions = () => useContext(ActionsContext);
