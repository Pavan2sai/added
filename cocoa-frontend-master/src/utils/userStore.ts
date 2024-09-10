import { doc, getDoc } from 'firebase/firestore'
import { db } from './firebase'
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware';
import { PurchaseOrder } from '../components';
import { Preview } from '@mui/icons-material';


// Define the types for the state and actions

// Create the Zustand store with type definitions
export const useUserStore = create<any>(
    persist(
      (set) => ({
        currentUser: null,
        isLoading: true,
        chatWindowTab: false,
        supplierName: '',
        productDetails : null,
        preview: false,
        decline : false,
        accept: false,
        purchaseOrder : null,
        products : null,
        cartItems: [],
        purchaseDetail : null,
        deliveryOrder : null,
        purchaseOrderId : null,
        requestDO : false,
        acceptDO : false,
        GRNAccept : false,
        GRNRequest : false,
        DeclineDO : false,
                fetchUserInfo: async (uid: string | null) => {
          if (!uid) {
            return set({ currentUser: null, isLoading: false });
          }
  
          try {
            const docRef = doc(db, 'users', uid);
            const docSnap = await getDoc(docRef);
  
            if (docSnap.exists()) {
              set({ currentUser: docSnap.data(), isLoading: false });
            } else {
              set({ currentUser: null, isLoading: false });
            }
          } catch (e) {
            set({ currentUser: null, isLoading: false });
          }
        },
        setChatWindowTab: (value:any) => set((state:any) => ({ chatWindowTab: value, isLoading: false })),
        setSupplierName: (value:any) => set((state:any) => ({ supplierName: value })),
        setAcceptDO: (value:any) => set((state:any) => ({ acceptDO: true, purchaseOrderId : value })),
        clearAcceptDO: (value:any) => set((state:any) => ({ acceptDO: null })),
        setSupplierEmail: (value:any) => set((state:any) => ({ supplierEmail: value })),
        setProductCard: (value:any) => set((state:any) => ({ productDetails: value })),
        clearProductDetails: (value:any) => set((state:any) => ({ productDetails: null })),
        setRequestDO: (item:any) => set((state:any) => ({ requestDO: true })),
        requestGRN: (item:any) => set((state:any) => ({ GRNRequest: true })),
        clearRequestGRN: (item:any) => set((state:any) => ({ GRNRequest: false })),
        clearRequestDO: (item:any) => set((state:any) => ({ requestDO: false })),
        fetchCartItems: (value:any) => set((state:any) => ({ cartItems: state.cartItems })),
        addItemToCart: (product:any) => set((state:any) => {
          const existingProductIndex = state.cartItems.findIndex((item:any) => item.ProductID === product.ProductID)
          if (existingProductIndex > -1) {
              const newCartItems = [...state.cartItems]
              newCartItems[existingProductIndex].quantity += 1
              return { cartItems: newCartItems }
          } else {
              return { cartItems: [...state.cartItems, { ...product, quantity: 1 }] }
          }
      }),
      storeProducts: (value:any) => set((state:any) => ({ products: value })),
      filterProducts: (value:any) => set((state:any) => ({ products: value })),
      removeItemsFromCart: (itemId: string) => set((state:any) => ({
          cartItems: state.cartItems.filter((item:any)=> item.ProductID !== itemId)
      })),
      setCartItems: (products: any) => set((state:any) => ({ cartItems: products })),
      emptyCartList: (products: any) => set((state:any) => ({ cartItems: [] })),
      // handlePreview: (products: any) => set((state:any) => ({ preview: products})),
      handleAccept: (item: any, purchaseDetail:any) => set((state:any) => ({ accept: true, decline: false, preview: false, purchaseOrderId : item, purchaseDetail: purchaseDetail })),
      handleDecline: (item: any, purchaseDetail:any) => set((state:any) => ({ decline: true , accept: false, purchaseOrderId : item, purchaseDetail: purchaseDetail})),
      clearDecline: (products: any) => set((state:any) => ({ decline: false, access: false, preview: false})),
      clearAccept: (products: any) => set((state:any) => ({ accpet: false, accept: false, preview: false})),
      clearPreview: (products: any) => set((state:any) => ({ decline: false, accept: false, preview: false})),
      setPurchaseOrder: (item: any) => set((state:any) => ({ purchaseOrder: item })),
      setDeclineDO: (item: any) => set((state:any) => ({ DeclineDO: true })),
      setPurchaseDetail: (item: any) => set((state:any) => ({ purchaseDetail: item })),
      clearPurchaseOrder: (item: any) => set((state:any) => ({ purchaseOrder: null })),
      setDeliveryOrder: (item: any) => set((state:any) => ({ deliveryOrder: item })),


      }),
      {
        name: 'user', // Unique name for storage
        storage: createJSONStorage(() => sessionStorage), // You can change this to localStorage if needed
      }
    )
  );