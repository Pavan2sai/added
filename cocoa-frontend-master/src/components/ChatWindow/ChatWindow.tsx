import {
    onSnapshot,
    doc,
    updateDoc,
    arrayUnion,
    getDoc,
} from 'firebase/firestore'
import React, { useRef, useEffect, useState } from 'react'
import { db } from '../../utils/firebase'
import { useChatStore } from '../../utils/useChatStore'
import { useUserStore } from '../../utils/userStore'
import { Box, Button, CircularProgress } from '@mui/material'
import {
    DeliveryOrderModal,
    PurchaseOrder,
    ViewModalPopup,
    DeliveryOrder,
    GRNModal,
    Invoice,
} from '../../components'
import { pdf } from '@react-pdf/renderer'
import axios from 'axios'
import { BACKEND_URL } from '../../constant'
import { cancelOrder, completeOrder } from '../../endpoints/endpoints'

function ChatWindow() {
    const messagesEndRef = useRef<any>(null)
    const [chat, setChat] = useState<any>()
    const { chatId, img } = useChatStore()
    const {
        currentUser,
        productDetails,
        generateDO,
        handleDecline,
        decline,
        accept,
        clearDecline,
        clearAccept,
        clearPreview,
        preview,
        purchaseOrder,
        deliveryOrder,
        handleAccept,
        purchaseOrderId,
        purchaseDetail,
        requestDO,
        clearRequestDO,
        setAcceptDO,
        clearAcceptDO,
        acceptDO,
        requestGRN,
        GRNRequest,
        clearRequestGRN,
        DeclineDO,
        setDeclineDO,
    } = useUserStore()
    const [displayChat, setDisplayChat] = useState(false)
    const [openModal, setOpenModal] = useState(false)
    const [selectedImageUrl, setSelectedImageUrl] = useState('')
    const [POFromOrder, setPOFromOrder] = useState()
    const [isGRNAccepted, setGRNAccepted] = useState(false)
    const [isInvoiceNeeded, setInvoiceNeeded] = useState(false)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    const handlePreview = (pdfUrl: any) => {
        window.open(`${BACKEND_URL}/PDF/purchase-order-${pdfUrl}.pdf`, '_blank')
    }
    useEffect(() => {
        scrollToBottom()
    }, [chat?.messages, img.url, chatId, chat])

    useEffect(() => {
        scrollToBottom()
    }, [])

    //First Purchase Order
    useEffect(() => {
        const updateChat = async () => {
            if (decline) {
                const chatDocRef = doc(db, 'chats', chatId)
                const chatDocSnapshot = await getDoc(chatDocRef)

                if (chatDocSnapshot.exists()) {
                    const chatData = chatDocSnapshot.data()
                    const messages = chatData.messages

                    // Find the message to update
                    const updatedMessages = messages.map((message: any) => {
                        if (message.purchaseId === purchaseOrderId) {
                            return {
                                ...message,
                                acceptOrDeclined: true, // Update the field
                            }
                        }
                        return message
                    })

                    await updateDoc(chatDocRef, { messages: updatedMessages })

                    // Add the new message with purchaseAcceptOrder: true

                    await updateDoc(doc(db, 'chats', chatId), {
                        messages: arrayUnion({
                            senderId: currentUser.id,
                            text: `The Purchase Order ${purchaseOrderId} has been declined!`,
                            createdAt: new Date(),
                        }),
                    })

                    // Update the document in Firestore

                    await cancelOrder(purchaseDetail.orderData.OrderID)

                    clearDecline() // Clear the decline state
                }
            } else if (accept) {
                const chatDocRef = doc(db, 'chats', chatId)
                const chatDocSnapshot = await getDoc(chatDocRef)

                if (chatDocSnapshot.exists()) {
                    const chatData = chatDocSnapshot.data()
                    const messages = chatData.messages

                    // Find the message to update
                    const updatedMessages = messages.map((message: any) => {
                        if (message.purchaseId === purchaseOrderId) {
                            return {
                                ...message,
                                acceptOrDeclined: true, // Update the field
                            }
                        }
                        return message
                    })

                    // Add the new message with purchaseAcceptOrder: true
                    updatedMessages.push({
                        senderId: currentUser.id,
                        purchaseAcceptOrder: true,
                        text: `The Purchase Order ${purchaseOrderId} has been accepted!`,
                        createdAt: new Date(),
                        purchaseDetail: purchaseDetail,
                        generateDO: false,
                    })

                    // Update the document in Firestore
                    await updateDoc(chatDocRef, { messages: updatedMessages })

                    clearAccept() // Clear the accept state
                }
            } else if (preview) {
                // window.open(PurchaseOrder, '_blank')
                clearPreview()
            }
        }

        const timer = setTimeout(updateChat, 100)

        // Cleanup function to clear the timeout if the component unmounts
        return () => clearTimeout(timer)
    }, [accept, decline, preview])

    //DO Acceptance
    useEffect(() => {
        const updateChat = async () => {
            if (decline) {
                await updateDoc(doc(db, 'chats', chatId), {
                    messages: arrayUnion({
                        senderId: currentUser.id,
                        text: `The Purchase Order ${purchaseOrderId} has been declined!`,
                        createdAt: new Date(),
                    }),
                })

                clearDecline()
            } else if (acceptDO) {
                const chatDocRef = doc(db, 'chats', chatId)
                const chatDocSnapshot = await getDoc(chatDocRef)

                if (chatDocSnapshot.exists()) {
                    const chatData = chatDocSnapshot.data()
                    const messages = chatData.messages

                    // Find the message to update
                    const updatedMessages = messages.map((message: any) => {
                        if (
                            message.deliveryId ===
                            purchaseOrderId.replace('PO, DO')
                        ) {
                            return {
                                ...message,
                                acceptOrDecline: true, // Update the field
                            }
                        }
                        return message
                    })
                    await updateDoc(chatDocRef, {
                        messages: updatedMessages,
                    })

                    //Delivery Acceptance

                    await updateDoc(doc(db, 'chats', chatId), {
                        messages: arrayUnion({
                            senderId: currentUser.id,
                            DeliveryAcceptOrder: true,
                            //add delivery ID here
                            text: `The Delivery Order ${purchaseOrderId} has been accepted!`,
                            createdAt: new Date(),
                            purchaseDetail: purchaseDetail,
                            GenerateGRN: false,
                        }),
                    })

                    clearAcceptDO()
                }
            }
        }

        const timer = setTimeout(updateChat, 100)

        // Cleanup function to clear the timeout if the component unmounts
        return () => clearTimeout(timer)
    }, [acceptDO])

    //Generate GRN
    useEffect(() => {
        const updateChat = async () => {
            if (GRNRequest) {
                //Delivery Acceptance
                await updateDoc(doc(db, 'chats', chatId), {
                    messages: arrayUnion({
                        senderId: currentUser.id,
                        GRNRequest: true,
                        //add delivery ID here
                        text: `The GRN ${purchaseOrderId.replace(
                            'DO',
                            'GRN'
                        )} against Delivery Order ${purchaseOrderId} has been generated!`,
                        createdAt: new Date(),
                        purchaseDetail: purchaseDetail,
                        GRNId: purchaseOrderId.replace('DO', 'GRN'),
                        acceptOrDeclineGRN: 'none',
                    }),
                })

                clearRequestGRN()
            }
        }

        const timer = setTimeout(updateChat, 100)

        // Cleanup function to clear the timeout if the component unmounts
        return () => clearTimeout(timer)
    }, [GRNRequest])

    //Generate DO
    //Working on this

    const declineDO = async (Id: any) => {
        await updateDoc(doc(db, 'chats', chatId), {
            messages: arrayUnion({
                senderId: currentUser.id,
                text: `The Delivery Order ${Id} against Purchase Order ${Id.replace(
                    'DO',
                    'PO'
                )} has been declined!`,
                createdAt: new Date(),
            }),
        })
        await cancelOrder(Id.replace('DO', 'PO'))

        const chatDocRef = doc(db, 'chats', chatId)
        const chatDocSnapshot = await getDoc(chatDocRef)

        if (chatDocSnapshot.exists()) {
            const chatData = chatDocSnapshot.data()
            const messages = chatData.messages

            const updatedMessages = messages.map((message: any) => {
                if (message.deliveryId === Id) {
                    return {
                        ...message,
                        acceptOrDecline: true, // Update the field
                    }
                }
                return message
            })
            await updateDoc(chatDocRef, {
                messages: updatedMessages,
            })
        }
    }
    useEffect(() => {
        const updateChat = async () => {
            if (requestDO) {
                const pdfBlobDO = await pdf(
                    <DeliveryOrder
                        cartItems={deliveryOrder.cartItems}
                        orderData={deliveryOrder.orderData}
                        restaurant={deliveryOrder.restaurant}
                    />
                ).toBlob()
                const pdfUrlDO = URL.createObjectURL(pdfBlobDO)

                await updateDoc(doc(db, 'chats', chatId), {
                    messages: arrayUnion({
                        senderId: currentUser.id,
                        deliveryOrder: true,
                        text: `The Delivery Order ${purchaseOrderId.replace(
                            'PO',
                            'DO'
                        )} against Purchase Order ${purchaseOrderId} has been generated!`,
                        createdAt: new Date(),
                        deliveryOrderId: pdfUrlDO,
                        deliveryId: purchaseOrderId.replace('PO', 'DO'),
                        // purchaseOrder: purchaseOrder,
                        acceptOrDecline: false,
                    }),
                })

                axios
                    .put(`${BACKEND_URL}/addDeliveryOrder`, {
                        orderData: purchaseDetail.orderData,
                        pdfUrl: pdfUrlDO,
                    })
                    .then((response: any) => {
                        console.log('Delivery order uploaded:', response.data)
                    })
                    .catch((error: any) => {
                        console.error('Error uploading delivery order:', error)
                    })
                clearRequestDO()
            } else if (preview) {
                // window.open(PurchaseOrder, '_blank')
                clearPreview()
            }
        }

        const timer = setTimeout(updateChat, 100)

        // Cleanup function to clear the timeout if the component unmounts
        return () => clearTimeout(timer)
    }, [requestDO])

    useEffect(() => {
        if (chatId !== null) {
            const unSub = onSnapshot(doc(db, 'chats', chatId), (res: any) => {
                setChat(res.data())
                setDisplayChat(true)
            })
            return () => {
                unSub()
            }
        }
    }, [chatId, productDetails])

    const handleImageClick = (url: string) => {
        setSelectedImageUrl(url)
        setOpenModal(true)
    }

    useEffect(() => {
        // Delay the display of chat by 3 seconds
        const timer = setTimeout(() => {
            setDisplayChat(true)
            scrollToBottom()
        }, 4500)

        return () => clearTimeout(timer)
    }, [])

    const generateDeliveryOrder = (purchaseDetail: any) => {
        setDeliveryOpen(true)
        setPurchaseOrderDetailInfo(purchaseDetail)
        clearAccept()
    }

    const generateGRN = (purchaseDetail: any) => {
        setGRNOpen(true)
        setPurchaseOrderDetailInfo(purchaseDetail)
        clearAccept()
    }

    const handleAcceptGRN = async (GRNId: any) => {
        const chatDocRef = doc(db, 'chats', chatId)
        const chatDocSnapshot = await getDoc(chatDocRef)

        if (chatDocSnapshot.exists()) {
            const chatData = chatDocSnapshot.data()
            const messages = chatData.messages

            // Now set the message to generate the delivery order

            console.log('Purchase Detail :', purchaseDetail)
            const updatedMessages = messages.map((message: any) => {
                if (message.GRNId === GRNId) {
                    if (message.acceptOrDeclineGRN === 'accept') {
                        return {
                            ...message,
                            acceptOrDeclineGRN: 'invoice', // Set generateDO to true
                        }
                    } else {
                        return {
                            ...message,
                            acceptOrDeclineGRN: 'accept', // Set generateDO to true
                        }
                    }
                }
                return message
            })

            // Update the document in Firestore again
            await updateDoc(chatDocRef, { messages: updatedMessages })
        }

        // //change this to GRN update in option, in obj
        // await updateDoc(doc(db, 'chats', chatId), {
        //     [`GRNStatus.${message.deliveryId}`]: 'accepted', // Setting status to accepted
        // })

        await updateDoc(doc(db, 'chats', chatId), {
            messages: arrayUnion({
                senderId: currentUser.id,
                acceptanceGRN: true,
                text: `The GRN ${GRNId} has been accpeted!`,
                createdAt: new Date(),
                purchaseOrder: purchaseOrder,
            }),
        })

        // Disable the accept button (this will be managed in your UI based on the status)
        setGRNAccepted(true)
    }

    const handleDeclineGRN = async (message: any) => {
        const { GRNId, purchaseDetail } = message
        const chatDocRef = doc(db, 'chats', chatId)
        const chatDocSnapshot = await getDoc(chatDocRef)

        const pdfBlobInvoice = await pdf(
            //This cartItems should be taken from GRN
            <Invoice
                cartItems={purchaseDetail.cartItems}
                orderData={purchaseDetail.orderData}
                restaurant={purchaseDetail.restaurant}
            />
        ).toBlob()
        const pdfUrlInvoice = URL.createObjectURL(pdfBlobInvoice)

        if (chatDocSnapshot.exists()) {
            const chatData = chatDocSnapshot.data()
            const messages = chatData.messages

            // Generate Invoice PDF
            try {
                const response = await axios.put(`${BACKEND_URL}/addInvoice`, {
                    orderData: purchaseDetail.orderData,
                    pdfUrl: pdfUrlInvoice,
                })
                console.log('Delivery order uploaded:', response.data)
            } catch (error) {
                console.error('Error uploading delivery order:', error)
            }

            const updatedMessages = await Promise.all(
                messages.map(async (message: any) => {
                    if (message.GRNId === GRNId) {
                        if (message.acceptOrDeclineGRN === 'accept') {
                            await completeOrder(
                                purchaseDetail.orderData.OrderID
                            )

                            await updateDoc(doc(db, 'chats', chatId), {
                                messages: arrayUnion({
                                    senderId: currentUser.id,
                                    generateInvoice: true,
                                    text: `The ${message.GRNId.replace(
                                        'GRN',
                                        'PO'
                                    )} process has been completed. The Sales Invoice ${message.GRNId.replace(
                                        'GRN',
                                        'PO'
                                    )} is here.`,
                                    createdAt: new Date(),
                                    purchaseOrder: purchaseOrder,
                                    InvoicePDF: pdfUrlInvoice,
                                }),
                            })

                            // return {
                            //     ...message,
                            //     acceptOrDeclineGRN: 'invoice',
                            // }
                        } else {
                            await updateDoc(doc(db, 'chats', chatId), {
                                messages: arrayUnion({
                                    senderId: currentUser.id,
                                    text: `The GRN ${message.GRNId} has been declined.`,
                                }),
                            })

                            return {
                                ...message,
                                acceptOrDeclineGRN: 'decline',
                            }
                        }
                    }
                    return message
                })
            )

            // Update the document in Firestore again
            await updateDoc(chatDocRef, { messages: updatedMessages })
        }
    }

    const [isDeliveryOpen, setDeliveryOpen] = useState(false)
    const [isGRNOpen, setGRNOpen] = useState(false)
    const [purchaseOrderDetailInfo, setPurchaseOrderDetailInfo] = useState()

    return (
        <>
            {isDeliveryOpen && (
                <DeliveryOrderModal
                    isOpen={isDeliveryOpen}
                    onClose={() => setDeliveryOpen(false)}
                    purchaseOrderDetail={purchaseOrderDetailInfo}
                />
            )}

            {isGRNOpen && (
                <GRNModal
                    isOpen={isGRNOpen}
                    onClose={() => setGRNOpen(false)}
                    purchaseOrderDetail={purchaseOrderDetailInfo}
                />
            )}
            {!displayChat && (
                <p
                    style={{
                        textAlign: 'center',
                        marginTop: '10px',
                        color: 'black',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                >
                    Loading Messages...
                </p>
            )}
            {displayChat && (
                <div className="chat-messages">
                    {chatId &&
                        chat?.messages?.map((message: any) => (
                            <div
                                key={message?.createdAt}
                                className={
                                    message.purchaseAcceptOrder
                                        ? 'message purchaseAcceptOrder'
                                        : message.DeliveryAcceptOrder
                                        ? 'message DeliveryAcceptOrder'
                                        : message.GRNRequest
                                        ? 'message GRNRequest'
                                        : message.acceptanceGRN
                                        ? 'message acceptanceGRN'
                                        : message.generateInvoice
                                        ? 'message generateInvoice'
                                        : message.purchaseOrder
                                        ? 'message purchaseOrder'
                                        : message.deliveryOrder
                                        ? 'message deliveryOrder'
                                        : message.senderId === currentUser?.id
                                        ? message.productCard
                                            ? 'message productCard'
                                            : 'message own'
                                        : message.productCard
                                        ? 'message productCard'
                                        : 'message'
                                }
                            >
                                <div className="texts">
                                    {message.img && (
                                        <img
                                            src={message.img}
                                            width={70}
                                            height={70}
                                            alt=""
                                            onClick={() =>
                                                handleImageClick(message.img)
                                            }
                                            style={{
                                                cursor: 'pointer',
                                                objectFit: 'cover',
                                            }}
                                        />
                                    )}
                                    <p>
                                        {message.text &&
                                            message.text
                                                .split('/n')
                                                .map(
                                                    (line: any, index: any) => (
                                                        <React.Fragment
                                                            key={index}
                                                        >
                                                            {index === 0 &&
                                                            message.text.split(
                                                                '/n'
                                                            ).length > 1 ? (
                                                                <strong>
                                                                    {line}
                                                                </strong>
                                                            ) : (
                                                                line
                                                            )}
                                                            <br />
                                                        </React.Fragment>
                                                    )
                                                )}
                                    </p>

                                    {/* Starting of invoice */}
                                    {message.purchaseOrder && (
                                        <div className="purchaseOrder">
                                            <Box
                                                display="flex"
                                                gap={2}
                                                className="buttons"
                                            >
                                                <Button
                                                    variant="outlined"
                                                    style={{
                                                        backgroundColor:
                                                            'white',
                                                    }}
                                                    onClick={() =>
                                                        handlePreview(
                                                            message.purchaseId
                                                        )
                                                    }
                                                >
                                                    Preview
                                                </Button>
                                                <Button
                                                    variant="contained"
                                                    color="success"
                                                    style={{
                                                        display:
                                                            message.senderId !==
                                                            currentUser.id
                                                                ? 'block'
                                                                : 'none',
                                                    }}
                                                    disabled={
                                                        message.acceptOrDeclined
                                                    }
                                                    onClick={() =>
                                                        handleAccept(
                                                            message.purchaseId,
                                                            message.purchaseDetail
                                                        )
                                                    }
                                                >
                                                    Accept
                                                </Button>
                                                <Button
                                                    variant="contained"
                                                    color="error"
                                                    style={{
                                                        display:
                                                            message.senderId !==
                                                            currentUser.id
                                                                ? 'block'
                                                                : 'none',
                                                    }}
                                                    onClick={() =>
                                                        handleDecline(
                                                            message.purchaseId,
                                                            message.purchaseDetail
                                                        )
                                                    }
                                                    disabled={
                                                        message.acceptOrDeclined
                                                    }
                                                >
                                                    Decline
                                                </Button>
                                            </Box>
                                        </div>
                                    )}

                                    {/* purchase acceptance */}
                                    {message.senderId === currentUser.id &&
                                        message.purchaseAcceptOrder && (
                                            <div className="purchaseOrder">
                                                <Box
                                                    display="flex"
                                                    gap={2}
                                                    className="buttons"
                                                >
                                                    <Button
                                                        variant="contained"
                                                        style={{
                                                            backgroundColor:
                                                                message.generateDO
                                                                    ? '#0000001f'
                                                                    : '#5E239D',
                                                            display:
                                                                message.senderId ===
                                                                currentUser.id
                                                                    ? 'block'
                                                                    : 'none',
                                                            marginTop:
                                                                message.senderId ===
                                                                currentUser.id
                                                                    ? '13px'
                                                                    : '0px',
                                                        }}
                                                        disabled={
                                                            message.generateDO
                                                        }
                                                        onClick={() =>
                                                            generateDeliveryOrder(
                                                                message.purchaseDetail
                                                            )
                                                        }
                                                    >
                                                        Generate DO
                                                    </Button>
                                                </Box>
                                            </div>
                                        )}

                                    {/* delivery order preview */}
                                    {message.deliveryOrder && (
                                        <div className="DeliveryOrder">
                                            <Box
                                                display="flex"
                                                gap={2}
                                                className="buttons"
                                            >
                                                <Button
                                                    variant="outlined"
                                                    style={{
                                                        backgroundColor:
                                                            'white',
                                                    }}
                                                    onClick={() =>
                                                        handlePreview(
                                                            message.deliveryOrderId
                                                        )
                                                    }
                                                >
                                                    Preview
                                                </Button>
                                                <Button
                                                    variant="contained"
                                                    color="success"
                                                    style={{
                                                        display:
                                                            message.senderId !==
                                                            currentUser.id
                                                                ? 'block'
                                                                : 'none',
                                                    }}
                                                    onClick={() =>
                                                        setAcceptDO(
                                                            message.deliveryId
                                                        )
                                                    }
                                                    disabled={
                                                        message.acceptOrDecline
                                                    }
                                                >
                                                    Accept
                                                </Button>
                                                <Button
                                                    variant="contained"
                                                    color="error"
                                                    style={{
                                                        display:
                                                            message.senderId !==
                                                            currentUser.id
                                                                ? 'block'
                                                                : 'none',
                                                    }}
                                                    onClick={() =>
                                                        declineDO(
                                                            message.deliveryId
                                                        )
                                                    }
                                                    disabled={
                                                        message.acceptOrDecline
                                                    }
                                                >
                                                    Decline
                                                </Button>
                                            </Box>
                                        </div>
                                    )}

                                    {/* Delivery Accept Order */}
                                    {message.DeliveryAcceptOrder && (
                                        <div className="purchaseOrder">
                                            <Box
                                                display="flex"
                                                gap={2}
                                                className="buttons"
                                            >
                                                <Button
                                                    variant="contained"
                                                    style={{
                                                        backgroundColor:
                                                            message.generateGRN
                                                                ? '#0000001f'
                                                                : '#5E239D',
                                                        display:
                                                            message.senderId ===
                                                            currentUser.id
                                                                ? 'block'
                                                                : 'none',
                                                    }}
                                                    onClick={() =>
                                                        generateGRN(
                                                            message.purchaseDetail
                                                        )
                                                    }
                                                    disabled={
                                                        message.generateGRN
                                                    }
                                                >
                                                    Generate GRN
                                                </Button>
                                            </Box>
                                        </div>
                                    )}

                                    {/* GRN Request */}
                                    {message.GRNRequest && (
                                        <div className="DeliveryOrder">
                                            <Box
                                                display="flex"
                                                gap={2}
                                                className="buttons"
                                                marginTop={'15px'}
                                            >
                                                <Button
                                                    variant="outlined"
                                                    style={{
                                                        backgroundColor:
                                                            'white',
                                                    }}
                                                    onClick={() =>
                                                        handlePreview(
                                                            message.deliveryOrderId
                                                        )
                                                    }
                                                >
                                                    Preview
                                                </Button>
                                                <Button
                                                    variant="contained"
                                                    color="success"
                                                    disabled={
                                                        message.acceptOrDeclineGRN ===
                                                            'accept' ||
                                                        message.acceptOrDeclineGRN ===
                                                            'invoice'
                                                            ? true
                                                            : false
                                                    }
                                                    onClick={() =>
                                                        handleAcceptGRN(
                                                            message.GRNId
                                                        )
                                                    }
                                                    style={{
                                                        display:
                                                            message.senderId !==
                                                            currentUser.id
                                                                ? 'block'
                                                                : 'none',
                                                    }}
                                                >
                                                    Accept
                                                </Button>
                                                <Button
                                                    variant="contained"
                                                    color="error"
                                                    onClick={() =>
                                                        handleDeclineGRN(
                                                            message
                                                        )
                                                    }
                                                    style={{
                                                        display:
                                                            message.senderId !==
                                                            currentUser.id
                                                                ? 'block'
                                                                : 'none',
                                                    }}
                                                    disabled={
                                                        message.acceptOrDeclineGRN ===
                                                            'invoice' ||
                                                        message.acceptOrDeclineGRN ===
                                                            'decline'
                                                    }
                                                >
                                                    {message.acceptOrDeclineGRN ===
                                                        'accept' ||
                                                    message.acceptOrDeclineGRN ===
                                                        'invoice'
                                                        ? 'Generate Invoice'
                                                        : 'Decline'}
                                                </Button>
                                            </Box>
                                        </div>
                                    )}

                                    {/* Invoice  */}
                                    {message.generateInvoice && (
                                        <div className="purchaseOrder">
                                            <Box
                                                display="flex"
                                                gap={2}
                                                className="buttons"
                                            >
                                                <Button
                                                    variant="outlined"
                                                    style={{
                                                        backgroundColor:
                                                            'white',
                                                    }}
                                                    onClick={() =>
                                                        handlePreview(
                                                            message.InvoicePDF
                                                        )
                                                    }
                                                >
                                                    Preview
                                                </Button>
                                            </Box>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    {img.url && (
                        <div className="message own">
                            <div className="texts">
                                <img
                                    src={img.url}
                                    width={70}
                                    height={70}
                                    alt=""
                                    onClick={() => handleImageClick(img.url)}
                                    style={{
                                        cursor: 'pointer',
                                        objectFit: 'cover',
                                    }}
                                />
                            </div>
                        </div>
                    )}
                </div>
            )}
            <div ref={messagesEndRef}></div>
            <ViewModalPopup
                open={openModal}
                handleClose={() => setOpenModal(false)}
                imageUrl={selectedImageUrl}
            />
        </>
    )
}

export default ChatWindow
