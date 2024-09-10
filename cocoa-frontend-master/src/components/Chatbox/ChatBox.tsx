// src/components/ChatBox/ChatBox.js
import React, { useCallback, useEffect, useState } from 'react'
import './ChatBox.css'
import { useChatStore } from '../../utils/useChatStore'
import {
    arrayUnion,
    doc,
    getDoc,
    onSnapshot,
    updateDoc,
} from 'firebase/firestore'
import { db } from '../../utils/firebase'
import { useUserStore } from '../../utils/userStore'
import upload from '../../utils/upload'
import Attachment from '../../assets/img/attachment.png'
import DisabledSendMessage from '../../assets/img/sendMessage-disabled.png'
import SendMessage from '../../assets/img/sendMessage.png'
import { ProductDropupMenu } from '../../components'
import { BACKEND_URL } from '../../constant'
import { Tooltip } from '@mui/material'
import { getOrders } from '../../endpoints/endpoints'
import { toast } from 'react-toastify'

const ChatBox = () => {
    const [text, setText] = useState('')
    const [orderlist, setOrderlist] = useState()
    const [hasRun, setHasRun] = useState(false)
    const [img, setImg] = useState({
        file: null,
        url: '',
    })
    const {
        currentUser,
        productDetails,
        clearProductDetails,
        preview,
        accept,
        decline,
        clearDecline,
        clearAccept,
        clearPreview,
        purchaseOrder,
        purchaseDetail,
        clearPurchaseOrder,
    } = useUserStore()
    const { chatId, user, uploadImg, clearImg } = useChatStore()
    console.log('Chatbox counter: ', currentUser)

    const handleImage = async (e: any) => {
        uploadImg(e)
        if (e.target.files[0]) {
            setImg({
                file: e.target.files[0],
                url: URL.createObjectURL(e.target.files[0]),
            })
        }

        await handleSend(text, img)
        clearImg()
    }

    useEffect(() => {
        const fetchOrders = async () => {
            const orderlisting = await getOrders()
            setOrderlist(orderlisting)
        }

        fetchOrders()
    }, [])

    useEffect(() => {
        const updateChat = async () => {
            if (purchaseOrder !== null) {
                const unSub = onSnapshot(
                    doc(db, 'chats', chatId),
                    async (res) => {
                        const data = res.data()
                        if (!data) return // Ensure data is not undefined
                        console.log('Purchase Order :', purchaseOrder)

                        const findPO =
                            data &&
                            data.messages?.find(
                                (p: any) => p.purchaseOrderId === purchaseOrder
                            )

                        if (findPO === undefined) {
                            if (!hasRun) {
                                console.log(
                                    'purchaseDetail.orderData.orderID',
                                    purchaseDetail.orderData.orderID
                                )
                                setHasRun(true) // Ensure it only runs once
                                await updateDoc(doc(db, 'chats', chatId), {
                                    messages: arrayUnion({
                                        senderId: currentUser.id,
                                        purchaseOrder: true,
                                        text:
                                            'Thanks for using COCOA' +
                                            '/n' +
                                            `The Purchase Order ${purchaseDetail.orderData.OrderID} has been placed successfully!`,
                                        createdAt: new Date(),
                                        purchaseOrderId: purchaseOrder,
                                        purchaseDetail: purchaseDetail,
                                        purchaseId:
                                            purchaseDetail.orderData.OrderID,
                                        acceptOrDeclined: false,
                                    }),
                                })

                                const userIDs = [currentUser.id, user]

                                userIDs.forEach(async (id) => {
                                    const userChatsRef = doc(
                                        db,
                                        'user-chat',
                                        id
                                    )
                                    const userChatsSnapshot = await getDoc(
                                        userChatsRef
                                    )
                                    if (userChatsSnapshot.exists()) {
                                        const userChatsData =
                                            userChatsSnapshot.data()

                                        const chatIndex =
                                            userChatsData.chats.findIndex(
                                                (c: any) => c.chatId === chatId
                                            )

                                        if (chatIndex !== -1) {
                                            userChatsData.chats[
                                                chatIndex
                                            ].lastMessage = `The Purchase Order ${purchaseDetail.orderData.OrderID} has been placed successfully!`

                                            userChatsData.chats[
                                                chatIndex
                                            ].isSeen =
                                                id === currentUser.id
                                                    ? true
                                                    : false
                                            userChatsData.chats[
                                                chatIndex
                                            ].updatedAt = Date.now()

                                            await updateDoc(userChatsRef, {
                                                chats: userChatsData.chats,
                                            })
                                        }
                                    }
                                })
                                // clearPurchaseOrder()
                            }
                        }
                        setHasRun(false)
                        // clearPurchaseOrder()
                    }
                )

                // Cleanup function to unsubscribe from the snapshot listener
                return () => unSub()
            }
        }

        updateChat()
    }, [purchaseOrder])

    const handleSend = async (text: any, img: any) => {
        if (text === '' && img['file'] === null && img['url'] === '') return

        let imgUrl = null

        try {
            if (img.file) {
                imgUrl = await upload(img.file)
            } else if (img.url) {
                imgUrl = img.url
            }

            if (text !== '' && img['url'] !== '') {
                await updateDoc(doc(db, 'chats', chatId), {
                    messages: arrayUnion({
                        senderId: currentUser.id,
                        productCard: true,
                        text,
                        createdAt: new Date(),
                        ...(imgUrl && { img: imgUrl }),
                    }),
                })
            } else {
                await updateDoc(doc(db, 'chats', chatId), {
                    messages: arrayUnion({
                        senderId: currentUser.id,
                        text,
                        createdAt: new Date(),
                        ...(imgUrl && { img: imgUrl }),
                    }),
                })
            }

            const userIDs = [currentUser.id, user]

            userIDs.forEach(async (id) => {
                const userChatsRef = doc(db, 'user-chat', id)
                const userChatsSnapshot = await getDoc(userChatsRef)
                if (userChatsSnapshot.exists()) {
                    const userChatsData = userChatsSnapshot.data()

                    const chatIndex = userChatsData.chats.findIndex(
                        (c: any) => c.chatId === chatId
                    )

                    if (chatIndex !== -1) {
                        userChatsData.chats[chatIndex].lastMessage = text
                        if (text !== '' && img['url'] !== '') {
                            userChatsData.chats[chatIndex].productCard = true
                        }
                        userChatsData.chats[chatIndex].isSeen =
                            id === currentUser.id ? true : false
                        userChatsData.chats[chatIndex].updatedAt = Date.now()

                        await updateDoc(userChatsRef, {
                            chats: userChatsData.chats,
                        })
                    }
                }
            })
        } catch (e) {
            console.log(e)
        }

        setImg({
            file: null,
            url: '',
        })

        setText('')
    }

    const handleKeyPress = (event: any) => {
        if (event.key === 'Enter' && text !== '') {
            handleSend(text, img)
        }
    }

    const sendProductCards = async (products: any) => {
        for (const product of products) {
            const text = `${product.ProductName}./n${product.Description}`
            const img = {
                file: null,
                url: `${BACKEND_URL}/images/${product.MainImage}`,
            }
            await handleSend(text, img)
        }
    }

    return (
        <div className="message-input">
            <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type your message"
                onKeyPress={handleKeyPress}
            />
            <ProductDropupMenu sendProductCards={sendProductCards} />

            <label htmlFor="file" className="uploadImgIcon">
                <Tooltip title="Upload Attachment">
                    <img src={Attachment} alt="" />
                </Tooltip>
            </label>
            <input
                type="file"
                id="file"
                style={{ display: 'none' }}
                accept="multiple"
                onChange={handleImage}
            />
            <div className="sent-btn" onClick={() => handleSend(text, img)}>
                <Tooltip title="Send Message">
                    {text === '' && img['file'] === null ? (
                        <img src={DisabledSendMessage} />
                    ) : (
                        <img src={SendMessage} />
                    )}
                </Tooltip>
            </div>
        </div>
    )
}

export default ChatBox
