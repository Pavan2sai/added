// src/ChatList.js
import React, { useEffect, useState } from 'react'
import './ChatList.css'
import { ChatWindow, ChatBox, ChatHeader } from '../../components'
import { useUserStore } from '../../utils/userStore'
import {
    doc,
    onSnapshot,
    getDoc,
    updateDoc,
    arrayUnion,
} from 'firebase/firestore'
import { db } from '../../utils/firebase'
import { CircularProgress } from '@mui/material'
import { useChatStore } from '../../utils/useChatStore'
import { BACKEND_URL } from '../../constant'

const ChatList = () => {
    const [chat, setChat] = useState<any>([])

    const {
        currentUser,
        chatWindowTab,
        setChatWindowTab,
        isLoading,
        setSupplierName,
        productDetails,
        clearProductDetails,
    } = useUserStore()

    const { chatId, changeChat } = useChatStore()
    const { setSupplierEmail } = useUserStore()
    useEffect(() => {
        const updateChatWithProductDetails = async () => {
            if (
                productDetails !== null &&
                productDetails.ProductName !== '' &&
                productDetails.MainImage !== ''
            ) {
                console.log('RUNNN')
                await updateDoc(doc(db, 'chats', chatId), {
                    messages: arrayUnion({
                        senderId: currentUser.id,
                        productCard: true,
                        text:
                            productDetails.ProductName +
                            '\n' +
                            productDetails.Description,
                        createdAt: new Date(),
                        ...(productDetails['MainImage'] && {
                            img: `${BACKEND_URL}/images/${productDetails['MainImage']}`,
                        }),
                    }),
                })

                await updateDoc(doc(db, 'chats', chatId), {
                    messages: arrayUnion({
                        senderId: currentUser.id,
                        text: "Hi, I'm interested in this product. Is it available?",
                        createdAt: new Date(),
                    }),
                })

                clearProductDetails()
            }
        }

        const fetchChatData = async () => {
            const unsub = onSnapshot(
                doc(db, 'user-chat', currentUser.id),
                async (res: any) => {
                    const items = res.data()?.chats || [] // Ensure chats array exists

                    const promises = items.map(async (item: any) => {
                        const userDocRef = doc(db, 'users', item.receiverId)
                        const userDocSnap = await getDoc(userDocRef)

                        const user = userDocSnap.data()

                        return { ...item, ...user } // Spread item properties and user data
                    })

                    const chatData = await Promise.all(promises)

                    console.log('chatData', chatData)
                    setChat(chatData.sort((a, b) => b.updatedAt - a.updatedAt))
                }
            )

            return unsub
        }

        const fetchData = async () => {
            if (currentUser?.id) {
                await updateChatWithProductDetails()
                const unsubscribe = await fetchChatData()
                return unsubscribe
            }
        }

        const unsubscribe = fetchData()

        return () => {
            if (unsubscribe) {
                unsubscribe.then((unsub) => unsub && unsub())
            }
        }
    }, [currentUser?.id, productDetails])

    const handleSelect = async (item2: any) => {
        const userChats =
            chat &&
            chat?.map((item: any) => {
                const { user, ...rest } = item
                return rest
            })

        const chatIndex: any = userChats.findIndex(
            (item: any) => item.chatId === item2.chatId
        )

        userChats[chatIndex].isSeen = true

        const userChatsRef = doc(db, 'user-chat', currentUser.id)

        try {
            await updateDoc(userChatsRef, {
                chats: userChats,
            })
            changeChat(item2.chatId, item2.id)
        } catch (e) {
            console.log('error updating user-chat', e)
        }
    }

    const timeAgo = (timestamp: number) => {
        const now = Date.now()
        const secondsPast = (now - timestamp) / 1000

        if (secondsPast < 60) {
            return `${Math.floor(secondsPast)} sec ago`
        }
        if (secondsPast < 3600) {
            return `${Math.floor(secondsPast / 60)} min ago`
        }
        if (secondsPast < 86400) {
            return `${Math.floor(secondsPast / 3600)} hours ago`
        }
        return `${Math.floor(secondsPast / 86400)} days ago`
    }

    return (
        <div>
            {currentUser !== null ? (
                <div className="chat-list">
                    {!chatWindowTab && chat.length === 0 ? (
                        isLoading ? (
                            <CircularProgress />
                        ) : (
                            <p style={{ textAlign: 'center', color: 'black' }}>
                                No Messages
                            </p>
                        )
                    ) : (
                        !chatWindowTab &&
                        chat.map((item: any) => (
                            <div
                                className="chat-item"
                                key={item?.chatId}
                                onClick={() => {
                                    setChatWindowTab(true)
                                    handleSelect(item)
                                    setSupplierName(item.displayName)
                                    setSupplierEmail(item.email)
                                }}
                            >
                                <div className="avatar">
                                    {item?.displayName.charAt(0).toUpperCase()}
                                </div>
                                <div className="chat-details">
                                    <div className="chat-name">
                                        {item?.displayName
                                            .charAt(0)
                                            .toUpperCase() +
                                            item?.displayName.slice(1)}
                                    </div>
                                    <div
                                        className={
                                            !item?.isSeen
                                                ? 'chat-message-unread'
                                                : 'chat-message'
                                        }
                                    >
                                        {item?.lastMessage?.length > 50
                                            ? item.lastMessage.substring(
                                                  0,
                                                  50
                                              ) + '...'
                                            : item.lastMessage}
                                    </div>
                                </div>
                                <div
                                    className={
                                        !item?.isSeen
                                            ? 'chat-timestamp-unread'
                                            : 'chat-timestamp'
                                    }
                                >
                                    {timeAgo(item.updatedAt)}
                                    {!item?.isSeen && (
                                        <span className="notification-dot"></span>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                    {chatWindowTab && (
                        <>
                            <ChatHeader />
                            <ChatWindow />
                            <ChatBox />
                        </>
                    )}
                </div>
            ) : (
                <div className="login-first" style={{ textAlign: 'center' }}>
                    <p>Login First</p>
                </div>
            )}
        </div>
    )
}

export default ChatList
