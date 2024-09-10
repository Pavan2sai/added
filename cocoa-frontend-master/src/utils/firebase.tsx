// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app'
import { getAuth, signOut } from 'firebase/auth'
import { getStorage } from 'firebase/storage'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
    apiKey: 'AIzaSyDD-07ZMTFnqT94ZNyfMw5Id9eK4nRTeC8',
    authDomain: 'cocoa-2d172.firebaseapp.com',
    projectId: 'cocoa-2d172',
    storageBucket: 'cocoa-2d172.appspot.com',
    messagingSenderId: '83261605826',
    appId: '1:83261605826:web:da54b56e21493a64af785b',
}

// Initialize Firebase
export const app = initializeApp(firebaseConfig)
export const auth: any = getAuth()
export const db = getFirestore()
export const storage = getStorage()
export const userSignOut: any = signOut(auth)
