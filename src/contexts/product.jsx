import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { exists, BaseDirectory, readFile, readTextFile, writeTextFile, writeFile, mkdir } from '@tauri-apps/plugin-fs';
import * as path from '@tauri-apps/api/path';
import { Buffer } from "buffer";
import { map } from 'radash';
//onst { exists, BaseDirectory } = window.__TAURI__.fs;

// Create the ProductContext
const ProductContext = createContext();

const getDbName = async () => {
  return "pdv-produtos.json";
}
const imagePath = "pdv-images/";

const config = {
  baseDir: BaseDirectory.Document
};

// Provider Component
export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const activeProducts = useMemo(() => {
      return products.filter(prd => !prd.isDeleted);
  }, [products]);

  const categoriesToSelect = useMemo(() => {
      return activeProducts.reduce((acc, prd) => {
          prd.categories.forEach(cat => {
              if (!acc.includes(cat)) {
                  acc.push(cat);
              }
          });
          return acc;
      }, []);
  }, [products]);

  const loadData = useCallback(async () => {
    const dbName = await getDbName();
    
    try {
      const existingDB = await readTextFile(dbName, config);
  
      if (existingDB) {
        const contents = await readTextFile(dbName, config);
        console.log(contents);
  
        if (contents) {
          console.log('test');
          const items = await map(JSON.parse(contents),
            async item => {
              try {
                if (!item.image) return item;
                const imageFile = await readFile(item.image, config);
                
                return {
                  ...item,
                  imageUrl: URL.createObjectURL(
                    new Blob([imageFile.buffer], { type: 'image/png' })
                  )                  
                }
              } catch (err) {
                console.error(err);
              }
              return item;
            }
          );

          console.log(items);
          setProducts(items);
          return;
        }
      }
    } catch (err) {
      console.error(err);
      // await writeTextFile(dbName, "[]", config);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, []);

  const saveDataImage = useCallback(async (newProduct, ref) => {
    try {
        console.log(newProduct);
        if (!newProduct.image) return;
    
        const path = ref;

        console.log(path);
    
        const existingDB = await exists(imagePath, config);
    
        console.log(existingDB);
        if (!existingDB) {
          await mkdir(imagePath, config);
        }

        const buffer = await new Promise((resolve, reject) => {
          const reader = new FileReader();
  
          reader.onloadend = async () => {
            const arrayBuffer = reader.result;
            const buffer = new Uint8Array(arrayBuffer);
  
            try {
              resolve(buffer);
            } catch (err) {
              console.error(err);
              reject(err)
            }
          };
  
          reader.readAsArrayBuffer(newProduct.image);
        });

        console.log(buffer);
    
        await writeFile(path, buffer, config);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const saveData = useCallback(async (newProducts) => {
    const dbName = await getDbName();

    await writeTextFile(dbName, JSON.stringify(newProducts), config);
  }, []);

  // Function to add a product
  const addProduct = async (product) => {
    const newProd = {
      ...product,
      image: product.image && typeof product.image === 'object' ? `${imagePath}${product.id}.${product.image.type.split('/')[1]}` : product.image
    };

    const newList = [...products, newProd];
    setProducts(newList);
    await saveDataImage(product, newProd.image);
    saveData(newList.map(item => ({
      ...item,
      imageUrl: undefined,
      image: item.image
    })));
  };

  const updateProduct = async (product) => {
    const newProd = {
      ...product,
      image: product.image && typeof product.image === 'object' ? `${imagePath}${product.id}.${product.image.type.split('/')[1]}` : product.image
    };

    const newList = products.map(item => 
      {
        if (item.id === product.id) {
          return newProd;
        }
        return item;
      }
    );
    setProducts(newList);
    await saveDataImage(product, newProd.image);
    saveData(newList.map(item => ({
      ...item,
      imageUrl: undefined,
      image: item.image
    })));
  };

  // Function to remove a product
  const removeProduct = (productId) => {
    const newList = products.map((product) => {
      if (product.id === productId) {
        return {
          ...product,
          isDeleted: true
        };
      }
      return product;
    });
    setProducts(newList);
    saveData(newList);
  };

  const selectProduct = (product) => {
    setSelectedProduct(product);
  };

  const updateStock = async (productsToUpdate) => {
    const newProducts = products.map(product => {
      const productOnList = productsToUpdate.find(item => item.id === product.id);
      if (productOnList) {
        return {
          ...product,
          stockQuantity: product.stockQuantity + productOnList.incrementQuantity
        };
      }
      return product;
    });

    setProducts(newProducts);
    saveData(newProducts);
  };

  return (
    <ProductContext.Provider 
      value={{
        products : activeProducts, 
        addProduct, 
        removeProduct, 
        selectedProduct, 
        selectProduct, 
        updateStock,
        updateProduct,
        categoriesToSelect
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

// Custom hook to use ProductContext
export const useProduct = () => {
  return useContext(ProductContext);
};
