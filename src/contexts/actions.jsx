import { createContext, use, useCallback, useContext, useEffect, useState } from "react";
import {  BaseDirectory, readTextFile, writeTextFile } from '@tauri-apps/plugin-fs';

// Create the ProductContext
const ActionsContext = createContext();

const getDbName = async () => {
  return "pdv-actions.json";
}

const config = {
  baseDir: BaseDirectory.Document
};


// Provider Component
export const ActionsProvider = ({ children }) => {
  const [actions, setActions] = useState([]);
  const [editingActionProducts, setEditingActionProducts] = useState([]);

  const saveData = useCallback(async (newActions) => {
    const dbName = await getDbName();

    await writeTextFile(dbName, JSON.stringify(newActions), config);
    console.log('done');
  }, []);

  // Function to log an action
  const logAction = (action) => {
    const newActions = [action, ...actions];
    setActions(newActions);
    console.log(newActions);
    saveData(newActions);
  };

  const loadData = useCallback(async () => {
    const dbName = await getDbName();
    
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

    const type = value < 0 ? 'decrease' : 'add';

    if (!itemOnEdit) {
      setEditingActionProducts([...editingActionProducts, { id: itemId, name, quantity: Math.abs(value), type }]);
      return;
    }

    const newEditingActionProducts = editingActionProducts.map(item => {
      if (item.id === itemId) {
        if (item.quantity === 1 && ((item.type === 'decrease' && value > 0) || (item.type === 'add' && value < 0))) {
          return { 
            id: itemId,
            name,
            quantity: Math.abs(value), 
            type: value < 0 ? 'decrease' : 'add' 
          };
        }

        if (type !== item.type) {
          return {
            ...item,
            quantity: item.quantity - Math.abs(value),
          };
        }

        return {
          ...item,
          quantity: item.quantity + Math.abs(value)
        };
      }
      return item;
    });

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
        quantity: item.type === 'add' ? item.quantity : item.quantity * -1,
      }))
    }, ...actions];
    setActions(newActions);
    saveData(newActions);
    clearEditingActionProducts();
  }, [actions, editingActionProducts, clearEditingActionProducts, saveData]);
  
  return ( 
    <ActionsContext.Provider value={{ completeUpdate, actions, logAction, editingActionProducts, setEditingActionProducts, addItemsToAction, removeItemFromAction, clearEditingActionProducts  }}>
      {children}
    </ActionsContext.Provider>
  );
};



// Custom hook to use ProductContext
export const useActions = () => useContext(ActionsContext);
