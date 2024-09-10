import { doc, getDoc } from 'firebase/firestore'
import { db } from './firebase'
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware';
import { useUserStore } from './userStore';




// Create the Zustand store with type definitions
export const useChatStore = create<any>(
    persist(
      (set) => ({
        chatId: null,
        user: null,
        img : {
            file : null,
            url : ''
        },
        changeChat : (chatId:any, user:any)=>{
            return set({ chatId, user})
        },
        uploadImg: (event: any) => {
            return set({
                img: {
                    file: event.target.files[0],
                    url: URL.createObjectURL(event.target.files[0]),
                }
            });
        },
        clearImg : () =>{
            return set({
                img: {
                    file : null,
                    url: ""
                }
            })
        }
       

      }),
      {
        name: 'chat-window', // Unique name for storage
        storage: createJSONStorage(() => sessionStorage), // You can change this to localStorage if needed
      }
    )
  );