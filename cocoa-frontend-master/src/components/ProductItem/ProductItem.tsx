// src/components/ProductItem/ProductItem.js
import React, { useState } from 'react'
import './ProductItem.css'
import { Button, Tooltip } from '@mui/material'
import { BACKEND_URL } from '../../constant'
import SupplierIcon from '../../assets/img/supplier.png'
import DisabledSupplierIcon from '../../assets/img/disabled_supplier.png'
import { grey } from '@mui/material/colors'
import { useUserStore } from '../../utils/userStore'
import { AddchartTwoTone } from '@mui/icons-material'
import {
    collection,
    serverTimestamp,
    setDoc,
    doc,
    updateDoc,
    arrayUnion,
    query,
    where,
    getDocs,
    getDoc,
} from 'firebase/firestore'
import { db } from '../../utils/firebase'
import { useChatStore } from '../../utils/useChatStore'

const ProductItem = ({ product, onClick, handleTabChange }: any) => {
    const {
        currentUser,
        setChatWindowTab,
        setSupplierName,
        setSupplierEmail,
        setProductCard,
    } = useUserStore()
    const { changeChat } = useChatStore()
    const [user, setUser] = useState<any>(null)

    const capitalizeWords = (inputText: any) => {
        return inputText.replace(
            /\b\w+\b/g,
            (word: any) =>
                word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        )
    }

    const processText = (inputText: any) => {
        let capitalizedText = capitalizeWords(inputText)
        if (capitalizedText.length > 27) {
            return capitalizedText.slice(0, -3) + '...'
        }
        return capitalizedText
    }

    const addChat = async () => {
        const chatRef = collection(db, 'chats') // Reference to the 'chats' collection
        const userChatsRef = collection(db, 'user-chat') // Reference to the 'user-chat' collection (inbox)
        const newChatRef = doc(chatRef) // Create a new document reference in 'chats'

        try {
            // Reference to the 'users' collection
            const userRef = collection(db, 'users')

            // Query to find the supplier by email
            const q = query(
                userRef,
                where('email', '==', product.supplierEmail)
            )

            // Reference to the current user's 'user-chat' document
            const chatdocRef = doc(db, 'user-chat', currentUser.id)
            const chatdocSnap = await getDoc(chatdocRef)

            // Execute the query to find the supplier
            const querySnapShot = await getDocs(q)
            console.log('chatdocSnap :', chatdocSnap)

            // Check if the query returned any results
            let supplierData: any = null
            if (!querySnapShot.empty) {
                supplierData = querySnapShot.docs[0].data()
                supplierData.id = querySnapShot.docs[0].id // Ensure we have the supplier's ID
                setUser(supplierData)
            } else {
                // Handle case where supplier does not exist in users collection
                // Create a new supplier data object
                supplierData = {
                    id: newChatRef.id, // Use the new chat ID as the supplier ID for now
                    email: product.supplierEmail,
                    displayName: product.supplierName,
                }
                setUser(supplierData)

                // Add the new supplier to the users collection
                await setDoc(doc(userRef, supplierData.id), supplierData)
            }

            let existingChat = null

            // Check if there is already a chat with the supplier
            if (chatdocSnap.exists()) {
                existingChat = chatdocSnap
                    .data()
                    ?.chats.find(
                        (item: any) => item.receiverId === supplierData.id
                    )
            }

            let chatId = null

            if (existingChat) {
                // If chat already exists, reuse the existing chat ID
                chatId = existingChat.chatId
            } else {
                // Create a new chat if no existing chat is found
                chatId = newChatRef.id // Generate a unique chat ID

                await setDoc(newChatRef, {
                    createdAt: serverTimestamp(),
                    messages: [],
                    chatId: chatId, // Store the chat ID in the chat document
                })

                // Update the supplier's 'user-chat' document
                const supplierChatRef = doc(userChatsRef, supplierData.id)
                const supplierChatSnap = await getDoc(supplierChatRef)
                if (supplierChatSnap.exists()) {
                    await updateDoc(supplierChatRef, {
                        chats: arrayUnion({
                            chatId,
                            lastMessage: '',
                            receiverId: currentUser.id,
                            updatedAt: Date.now(),
                        }),
                    })
                } else {
                    await setDoc(supplierChatRef, {
                        chats: [
                            {
                                chatId,
                                lastMessage: '',
                                receiverId: currentUser.id,
                                updatedAt: Date.now(),
                            },
                        ],
                    })
                }

                // Update the current user's 'user-chat' document
                if (chatdocSnap.exists()) {
                    await updateDoc(chatdocRef, {
                        chats: arrayUnion({
                            chatId,
                            lastMessage: '',
                            receiverId: supplierData.id,
                            updatedAt: Date.now(),
                        }),
                    })
                } else {
                    await setDoc(chatdocRef, {
                        chats: [
                            {
                                chatId,
                                lastMessage: '',
                                receiverId: supplierData.id,
                                updatedAt: Date.now(),
                            },
                        ],
                    })
                }
            }

            // Ensure chat messages are scoped to the correct chat
            changeChat(chatId, currentUser.id)
            setProductCard(product)
            setChatWindowTab(true)
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <div className="product-item">
            <img
                src={`${BACKEND_URL}/images/` + product.MainImage}
                alt="Product"
                onClick={() => onClick(product)}
            />

            <div
                className="chat-details"
                onClick={() => onClick(product)}
                style={{ cursor: 'pointer' }}
            >
                <div className="chat-name">{product.ProductName}</div>
                <div className="chat-message">
                    {product.Description?.length > 25
                        ? product.Description.substring(0, 25) + '...'
                        : product.Description}
                </div>
            </div>

            <div className="chatWithSupplier">
                {currentUser !== null ? (
                    <Tooltip title="Chat With Supplier">
                        <img
                            src={SupplierIcon}
                            alt="Supplier Icon"
                            className="supplier-icon"
                            onClick={(e) => {
                                handleTabChange(e, 1)
                                setChatWindowTab(true)
                                setSupplierName(product.supplierName)
                                setSupplierEmail(product.supplierEmail)
                                addChat()
                            }}
                        />
                    </Tooltip>
                ) : (
                    <Tooltip title="Need to login first to chat with supplier">
                        <img
                            src={DisabledSupplierIcon}
                            alt="Supplier Icon"
                            className="supplier-icon"
                        />
                    </Tooltip>
                )}
            </div>
        </div>
    )
}

export default ProductItem
