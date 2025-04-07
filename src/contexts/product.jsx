import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { exists, BaseDirectory, readFile, readTextFile, writeTextFile, writeFile, mkdir } from '@tauri-apps/plugin-fs';
import { map, unique } from 'radash';

// Create the ProductContext
const ProductContext = createContext();

const dbName = "pdv/pdv-produtos.json";
const imagePath = "pdv/pdv-images/";

const config = {
  baseDir: BaseDirectory.Document
};

// Provider Component
export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([]);

  const activeProducts = useMemo(() => {
      return products.filter(prd => !prd.isDeleted);
  }, [products]);

  const categoriesToSelect = useMemo(() => {
      return products.find(item => item.id === "product-categories")?.categories || [];
  }, [products]);

  const loadData = useCallback(async () => {    
    try {
      const existingDB = await readTextFile(dbName, config);
  
      if (existingDB) {
        const contents = await readTextFile(dbName, config);
  
        if (contents) {
          const items = await map(JSON.parse(contents),
            async item => {
              try {
                if (!item.image) return item;
                let currImagePath = item.image;

                if (!currImagePath.includes(imagePath)) {
                  currImagePath = `pdv/${currImagePath}`;
                }

                const imageFile = await readFile(currImagePath, config);
                
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

          const updatedProducts = items.map(currItem => {
            if (currItem.id === "product-categories") return currItem;
            return {
              ...currItem,
              category: currItem.category || currItem.categories?.[0] || null,
            }
          });

          setProducts(updatedProducts);
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

  const saveDataImage = useCallback(async (newProduct, ref) => {
    try {
        if (!newProduct.image) return;
    
        const path = ref;
    
        const existingDB = await exists(imagePath, config);
    
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
    
        await writeFile(path, buffer, config);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const saveData = useCallback(async (newProducts) => {
    await writeTextFile(dbName, JSON.stringify(newProducts), config);
  }, []);

  // Function to add a product
  const addProduct = useCallback(async (product) => {
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
  }, [saveData, saveDataImage, products]);

  const updateProduct = useCallback(async (product) => {
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
  }, [saveData, saveDataImage, products]);

  // Function to remove a product
  const removeProduct = useCallback((productId) => {
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
  }, [products, saveData]);

  const updateStock = useCallback(async (productsToUpdate) => {
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
  }, [products, saveData]);

  const addCategory = useCallback(async (category) => {
    const product = products.find(item => item.id === "product-categories");

    if (!product) {
      const previousProductsCategories = 
        products
          .filter(item => item.id !== "product-categories")
          .map(item => {
            const value = item.categories;

            if (typeof value === 'string') {
              return value;
            }
            
            if (typeof value === 'object') {
              return Object.values(value || {})?.[0];
            }
          })
          .filter(item => typeof item === 'string')
          .flat();

      const newProduct = {
        id: "product-categories",
        name: "Categorias",
        categories: unique([category, ...previousProductsCategories]),
        stockQuantity: 0,
        price: 0,
        image: null,
        isDeleted: true,
        isHidden: true
      };
      const newProducts = [newProduct, ...products];
      setProducts(newProducts);
      await saveData(newProducts);
      
      return;
    };

    const newProducts = products.map(item => {
      if (item.id === product.id) {
        return {
          ...item,
          categories: [category, ...item.categories]
        };
      }
      return item;
    });

    setProducts(newProducts);
    await saveData(newProducts);
  }, [products, saveData]);

  const deleteCategory = useCallback(async (category) => {
    const product = products.find(item => item.id === "product-categories");

    if (!product) return;

    const newProducts = products.map(item => {
      if (item.id === product.id) {
        return {
          ...item,
          categories: item.categories.filter(cat => cat !== category)
        };
      }

      if (item.category === category) {
        return {
          ...item,
          category: null
        };
      }

      return item;
    });

    setProducts(newProducts);
    await saveData(newProducts);
  }, [products, saveData]);

  const updateCategory = useCallback(async (previousCategory, newCategory) => {
    const product = products.find(item => item.id === "product-categories");

    if (!product) return;

    const newProducts = products.map(item => {
      if (item.id === product.id) {
        return {
          ...item,
          categories: item.categories.map(cat => cat === previousCategory ? newCategory : cat)
        };
      }

      if (item.category === previousCategory) {
        return {
          ...item,
          category: newCategory
        };
      }

      return item;
    });

    setProducts(newProducts);
    await saveData(newProducts);
  }, [products, saveData]);

  const valueMemo = useMemo(() => {
    return {
      products: activeProducts, 
      addProduct, 
      removeProduct, 
      updateStock,
      updateProduct,
      categoriesToSelect,
      addCategory,
      deleteCategory,
      updateCategory
    };
  }, [
    activeProducts, 
    addProduct, 
    removeProduct, 
    updateStock,
    updateProduct,
    categoriesToSelect,
    addCategory,
    deleteCategory,
    updateCategory
  ])

  return (
    <ProductContext.Provider 
      value={valueMemo}
    >
      {children}
    </ProductContext.Provider>
  );
};

// Custom hook to use ProductContext
export const useProduct = () => {
  return useContext(ProductContext);
};
