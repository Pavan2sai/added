import React, { useState, useEffect } from 'react'
import {
    Modal,
    Box,
    Button,
    IconButton,
    Card,
    CardContent,
    CardMedia,
    Typography,
    TextField,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    FormControl,
    RadioGroup,
    FormControlLabel,
    FormLabel,
    Radio,
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import { BACKEND_URL } from '../../constant'
import { useUserStore } from '../../utils/userStore'
import { useChatStore } from '../../utils/useChatStore'
import { toast } from 'react-toastify'
import {
    HorizontalStepper,
    PurchaseOrder,
    SuccessModal,
    GRNPdf,
} from '../../components' // Make sure the path is correct
import axios from 'axios'
import { getOrders, getRestaurants } from '../../endpoints/endpoints'
import { pdf } from '@react-pdf/renderer'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { db } from '../../utils/firebase'

const GRNModal = ({ isOpen, onClose, purchaseOrderDetail }: any) => {
    const {
        cartItems,
        removeItemsFromCart,
        setCartItems,
        currentUser,
        emptyCartList,
        setPurchaseOrder,
        purchaseDetail,
        handleAccept,
        setDeliveryOrder,
        requestDO,
        requestGRN,
        deliveryOrder,
    } = useUserStore()
    const { chatId } = useChatStore()

    const [dialogOpen, setDialogOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [orders, setOrders] = useState()
    const [itemToRemove, setItemToRemove] = useState<number | null>(null)
    const [totalPrice, setTotalPrice] = useState<any>(0)
    const [activeStep, setActiveStep] = useState(0)
    const [orderCartItems, setOrderCartItems] = useState(
        purchaseOrderDetail.cartItems
    )
    const [paymentMethod, setPaymentMethod] = useState('creditCard')
    const [orderDetailCounter, setOrderDetailCounter] = useState(1)
    const [order, setOrder] = useState()
    const [restaurant, setRestaurant] = useState()
    const [prices, setPrices] = useState(
        orderCartItems.reduce((acc: any, item: any) => {
            acc[item.ProductID] = item.UnitPrice
            return acc
        }, {})
    )

    console.log('Purchase Order in DO: ', purchaseOrderDetail)

    useEffect(() => {
        setPrices(
            orderCartItems.reduce((acc: any, item: any) => {
                acc[item.ProductID] = item.UnitPrice
                return acc
            }, {})
        )
    }, [orderCartItems])
    const [openSuccessModal, setOpenSuccessModal] = useState(false)

    const handleSuccessModalOpen = () => setOpenSuccessModal(true)
    const handleSuccessModalClose = () => {
        setOpenSuccessModal(false)
        emptyCartList()
    }

    useEffect(() => {
        let isMounted = true

        const fetchOrders = async () => {
            if (isMounted) {
                const orderlist = await getOrders()
                if (isMounted) {
                    console.log('Orders', orderlist)
                    setOrders(orders)
                }
            }
        }

        fetchOrders()

        return () => {
            isMounted = false
        }
    }, [])

    const handleRemoveItemClick = (productId: any) => {
        setItemToRemove(productId)
        setDialogOpen(true)
    }

    const handleDialogClose = () => {
        setDialogOpen(false)

        setItemToRemove(null)
    }

    useEffect(() => {
        const calculateTotalPrice = () => {
            const total = orderCartItems.reduce(
                (acc: number, item: any) =>
                    acc + prices[item.ProductID] * item.quantity,
                0
            )

            setTotalPrice(total)
        }
        calculateTotalPrice()
    }, [orderCartItems, isOpen, onClose])

    const handleDialogConfirm = () => {
        if (itemToRemove !== null) {
            removeItemsFromCart(itemToRemove)
        }
        setDialogOpen(false)
        setItemToRemove(null)
        toast.success('Item removed from cart')
        if (orderCartItems.length === 0) {
            onClose()
        }
    }

    const handleIncrement = (productId: string) => {
        const updatedCartItems = orderCartItems.map((item: any) => {
            if (item.ProductID === productId) {
                return { ...item, quantity: item.quantity + 1 }
            }
            return item
        })

        setOrderCartItems(updatedCartItems)
        setCartItems(updatedCartItems)
    }

    const handleDecrement = (productId: string) => {
        const updatedCartItems = orderCartItems.map((item: any) => {
            if (item.ProductID === productId && item.quantity > 1) {
                return { ...item, quantity: item.quantity - 1 }
            }
            return item
        })
        setOrderCartItems(updatedCartItems)
        setCartItems(updatedCartItems)
    }

    const generateGRN = async () => {
        requestGRN()
        onClose()
        setDeliveryOrder(orderCartItems)

        console.log('orderCartItems', orderCartItems)

        const chatDocRef = doc(db, 'chats', chatId)
        const chatDocSnapshot = await getDoc(chatDocRef)

        // if (chatDocSnapshot.exists()) {
        //     const chatData = chatDocSnapshot.data()
        //     const messages = chatData.messages

        //     // Now set the message to generate the delivery order
        //     const updatedMessages = messages.map((message: any) => {
        //         if (message.purchaseId === purchaseDetail.purchaseId) {
        //             return {
        //                 ...message,
        //                 generateGRN: true, // Set generateDO to true
        //             }
        //         }
        //         return message
        //     })

        //     // Update the document in Firestore again
        //     await updateDoc(chatDocRef, { messages: updatedMessages })
        // }

        const pdfBlobGRN = await pdf(
            <GRNPdf
                cartItems={purchaseDetail.cartItems}
                orderData={purchaseDetail.orderData}
                restaurant={purchaseDetail.restaurant}
            />
        ).toBlob()
        const pdfUrlGRN = URL.createObjectURL(pdfBlobGRN)

        axios
            .put(`${BACKEND_URL}/addGRN`, {
                orderData: purchaseDetail.orderData,
                pdfUrl: pdfUrlGRN,
            })
            .then((response: any) => {
                console.log('GRN uploaded:', response.data)
            })
            .catch((error: any) => {
                console.error('Error uploading GRN order:', error)
            })
    }

    return (
        <>
            <Modal open={isOpen} onClose={onClose}>
                <Box
                    sx={{
                        ...modalStyle,
                        width: 800,
                        backgroundColor: '#e5dff8',
                        overflowY: 'auto',
                        maxHeight: '80vh',
                    }}
                >
                    <>
                        <Box>
                            <Typography
                                variant="h6"
                                style={{ marginBottom: '15px' }}
                            >
                                Order List
                            </Typography>
                            <Box
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 2,
                                }}
                            >
                                {orderCartItems.map((item: any) => (
                                    <Card
                                        key={item.ProductID}
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            padding: 2,
                                            position: 'relative',
                                            height: 90,
                                        }}
                                    >
                                        <CardMedia
                                            component="img"
                                            sx={{
                                                width: 65,
                                                height: 'auto',
                                                borderRadius: 1,
                                            }}
                                            image={`${BACKEND_URL}/images/${item.MainImage}`}
                                            alt="Product"
                                        />
                                        <CardContent
                                            sx={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                flex: 1,
                                            }}
                                        >
                                            <Typography variant="h6">
                                                {item.ProductName}
                                            </Typography>
                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                            >
                                                {item.Description}
                                            </Typography>
                                        </CardContent>
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'flex-end',
                                                justifyContent: 'center',
                                                position: 'absolute',
                                                top: 8,
                                                right: 8,
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    flexDirection: 'row',
                                                    marginBottom: '8px',
                                                }}
                                            >
                                                {/* <Typography
                                                        variant="body2"
                                                        sx={{ mt: 1.5 }} // Added margin-bottom for spacing
                                                    >
                                                        Subtotal: $
                                                        {(
                                                            item.quantity *
                                                            prices[
                                                                item.ProductID
                                                            ]
                                                        ).toFixed(2)}
                                                    </Typography> */}
                                                <IconButton
                                                    onClick={() =>
                                                        handleRemoveItemClick(
                                                            item.ProductID
                                                        )
                                                    }
                                                    color="error"
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            </Box>

                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    flexDirection: 'row',
                                                    alignItems: 'center',
                                                    mt: 1,
                                                }}
                                            >
                                                <Button
                                                    variant="contained"
                                                    color="primary"
                                                    size="small"
                                                    onClick={() =>
                                                        handleDecrement(
                                                            item.ProductID
                                                        )
                                                    }
                                                    sx={{
                                                        mt: 1,
                                                        marginRight: '10px',
                                                        fontSize: '16px',
                                                        backgroundColor:
                                                            '#5e239d',
                                                    }}
                                                >
                                                    -
                                                </Button>
                                                <TextField
                                                    label="Qty"
                                                    variant="outlined"
                                                    size="small"
                                                    sx={{
                                                        width: 60,
                                                        mt: 1,
                                                    }}
                                                    value={item.quantity}
                                                    defaultValue={item.quantity}
                                                    InputProps={{
                                                        readOnly: true,
                                                    }}
                                                    type="number"
                                                />
                                                <Button
                                                    variant="contained"
                                                    color="primary"
                                                    size="small"
                                                    onClick={() =>
                                                        handleIncrement(
                                                            item.ProductID
                                                        )
                                                    }
                                                    sx={{
                                                        mt: 1,
                                                        marginLeft: '10px',
                                                        marginRight: '10px',
                                                        fontSize: '16px',
                                                        backgroundColor:
                                                            '#5e239d',
                                                    }}
                                                >
                                                    +
                                                </Button>
                                                {/* <TextField
                                                        label="Price"
                                                        variant="outlined"
                                                        size="small"
                                                        sx={{
                                                            width: 100,
                                                            mt: 1,
                                                        }}
                                                        value={
                                                            prices[
                                                                item.ProductID
                                                            ]
                                                        }
                                                        onChange={(e) =>
                                                            handlePriceChange(
                                                                e,
                                                                item.ProductID
                                                            )
                                                        }
                                                        type="number"
                                                    /> */}
                                            </Box>
                                        </Box>
                                    </Card>
                                ))}
                            </Box>
                            <Box
                                display="flex"
                                justifyContent="flex-end"
                                mt={2}
                            >
                                {/* <Typography
                                    variant="h6"
                                    style={{ display: 'none' }}
                                >
                                    Total Order Amount: ${totalPrice.toFixed(2)}
                                </Typography> */}
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={generateGRN}
                                    style={{
                                        backgroundColor: '#5e239d',
                                    }}
                                >
                                    Generate GRN
                                </Button>
                            </Box>
                        </Box>
                    </>
                </Box>
            </Modal>
            <Dialog open={dialogOpen} onClose={handleDialogClose}>
                <DialogTitle>Remove Item</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to remove this item from your
                        cart?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDialogClose} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleDialogConfirm} color="primary">
                        Remove
                    </Button>
                </DialogActions>
            </Dialog>

            <SuccessModal
                restaurant={restaurant}
                orderData={order}
                open={openSuccessModal}
                handleClose={handleSuccessModalClose}
            />
        </>
    )
}

export default GRNModal

const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
}
