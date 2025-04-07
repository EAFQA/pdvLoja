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
  
  return ( 
    <ActionsContext.Provider value={{ completeUpdate, actions, logAction, editingActionProducts, setEditingActionProducts, addItemsToAction, removeItemFromAction, clearEditingActionProducts  }}>
      {children}
    </ActionsContext.Provider>
  );
};



// Custom hook to use ProductContext
export const useActions = () => useContext(ActionsContext);
