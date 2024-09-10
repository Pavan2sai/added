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
import { toast } from 'react-toastify'
import {
    HorizontalStepper,
    PurchaseOrder,
    SuccessModal,
} from '../../components' // Make sure the path is correct
import axios from 'axios'
import { getOrders, getRestaurants } from '../../endpoints/endpoints'
import { pdf } from '@react-pdf/renderer'
import upload from '../../utils/upload'

const CartModal = ({ isOpen, onClose }: any) => {
    const {
        cartItems,
        removeItemsFromCart,
        setCartItems,
        currentUser,
        emptyCartList,
        setPurchaseOrder,
        setPurchaseDetail,
    } = useUserStore()
    const [dialogOpen, setDialogOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [orders, setOrders] = useState()
    const [itemToRemove, setItemToRemove] = useState<number | null>(null)
    const [totalPrice, setTotalPrice] = useState<any>(0)
    const [activeStep, setActiveStep] = useState(0)
    const [paymentMethod, setPaymentMethod] = useState('creditCard')
    const [orderDetailCounter, setOrderDetailCounter] = useState(1)
    const [order, setOrder] = useState()
    const [restaurant, setRestaurant] = useState()
    const [prices, setPrices] = useState(
        cartItems.reduce((acc: any, item: any) => {
            acc[item.ProductID] = item.UnitPrice
            return acc
        }, {})
    )

    useEffect(() => {
        setPrices(
            cartItems.reduce((acc: any, item: any) => {
                acc[item.ProductID] = item.UnitPrice
                return acc
            }, {})
        )
    }, [cartItems])
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

    const handlePriceChange = (e: any, productId: any) => {
        const newPrice = parseFloat(e.target.value)
        setPrices((prevPrices: any) => ({
            ...prevPrices,
            [productId]: newPrice,
        }))

        const updatedCartItems = cartItems.map((item: any) => {
            if (item.ProductID === productId) {
                return { ...item, UnitPrice: newPrice }
            }
            return item
        })
        setCartItems(updatedCartItems)
    }

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
            const total = cartItems.reduce(
                (acc: number, item: any) =>
                    acc + prices[item.ProductID] * item.quantity,
                0
            )

            setTotalPrice(total)
        }
        calculateTotalPrice()
    }, [cartItems, isOpen, onClose, prices])

    const handleDialogConfirm = () => {
        if (itemToRemove !== null) {
            removeItemsFromCart(itemToRemove)
        }
        setDialogOpen(false)
        setItemToRemove(null)
        toast.success('Item removed from cart')
        if (cartItems.length === 0) {
            onClose()
        }
    }

    const handleIncrement = (productId: string) => {
        const updatedCartItems = cartItems.map((item: any) => {
            if (item.ProductID === productId) {
                return { ...item, quantity: item.quantity + 1 }
            }
            return item
        })
        setCartItems(updatedCartItems)
    }

    const handleDecrement = (productId: string) => {
        const updatedCartItems = cartItems.map((item: any) => {
            if (item.ProductID === productId && item.quantity > 1) {
                return { ...item, quantity: item.quantity - 1 }
            }
            return item
        })
        setCartItems(updatedCartItems)
    }

    const handleNext = () => {
        setActiveStep((prevActiveStep) => prevActiveStep + 1)
    }

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1)
    }

    const handleReset = () => {
        setActiveStep(0)
    }

    const handlePaymentMethodChange = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        setPaymentMethod((event.target as HTMLInputElement).value)
    }

    const generateOrderID = (counter: any) => {
        const currentDate = new Date()
        const year = currentDate.getFullYear()
        const month = String(currentDate.getMonth() + 1).padStart(2, '0') // Months are zero-based
        const day = String(currentDate.getDate()).padStart(2, '0')
        const dateStr = `${year}${month}${day}`
        counter++
        const paddedCounter = counter.toString().padStart(4, '0')
        const orderID = `${dateStr}PO${paddedCounter}`
        // Increment the counter for next order (you might want to save this in a persistent storage)
        console.log('Order ID: ' + orderID)
        setOrderDetailCounter(orderDetailCounter + 1)

        return orderID
    }

    function currentDate() {
        const currentDate = new Date()
        const year = currentDate.getFullYear()
        const month = String(currentDate.getMonth() + 1).padStart(2, '0') // Months are zero-based
        const day = String(currentDate.getDate()).padStart(2, '0')
        const dateStr = `${year}${month}${day}`
        return dateStr
    }

    async function uploadPDF(pdfBlob: any, orderData: any) {
        const formData = new FormData()
        formData.append(
            'uploadPDF',
            pdfBlob,
            `purchase-order-${orderData.OrderID}.pdf`
        )
        formData.append('orderData', JSON.stringify(orderData))

        const response = await axios.post(
            `${BACKEND_URL}/addPurchaseOrder`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        )

        const pdfUrl = response.data.fileUrl // Adjust according to your server's response
        return pdfUrl
    }

    const confirmOrder = async () => {
        setLoading(true)
        const orderlist = await getOrders()
        const restaurantslist = await getRestaurants()
        console.log('Orders', orderlist)

        const restaurant = restaurantslist.find(
            (r: any) => r.Email === currentUser.email
        )

        setRestaurant(restaurant)

        console.log('Cart List : ', cartItems)

        setOrders(orders)

        const supplierName = cartItems[0].supplierName

        let counter = orderlist.length

        const orderData: any = {
            OrderID: generateOrderID(counter),
            SupplierName: supplierName,
            RestaurantID: restaurant.RestaurantID,
            OrderDate: currentDate(),
            TotalAmount: totalPrice,
            PaymentStatus: 'Not Paid',
            ShippingStatus: 'In Progress',
            ShippingAddress: restaurant.Address,
        }

        setOrder(orderData)
        const orderDetailsData = {
            OrderID: generateOrderID(counter),
            cartItems: cartItems,
        }

        axios
            .post(`${BACKEND_URL}/addOrder`, orderData)
            .then((response: any) => {
                axios
                    .post(`${BACKEND_URL}/addOrderDetail`, orderDetailsData)
                    .then((response: any) => {
                        toast.success('Order placed successfully')
                        // emptyCartList()

                        const uploadPurchaseOrder = async () => {
                            // Create a PDF Blob
                            const pdfBlob = await pdf(
                                <PurchaseOrder
                                    cartItems={cartItems}
                                    orderData={orderData}
                                    restaurant={restaurant}
                                />
                            ).toBlob()

                            const purchaseDetail = {
                                cartItems: cartItems,
                                orderData: orderData,
                                restaurant: restaurant,
                            }

                            console.log('pdf blob: ' + pdfBlob)

                            const pdfUrl = URL.createObjectURL(pdfBlob)
                            await uploadPDF(pdfBlob, orderData)

                            console.log('pdf url: ' + pdfUrl)

                            setPurchaseDetail(purchaseDetail)
                            setPurchaseOrder(pdfUrl)

                            // await =upload(pdfUrl)

                            // axios
                            //     .put(`${BACKEND_URL}/addPurchaseOrder`, {
                            //         orderData,
                            //         pdfUrl,
                            //     })
                            //     .then((response: any) => {
                            //         console.log(
                            //             'Purchase order uploaded:',
                            //             response.data
                            //         )
                            //     })
                            //     .catch((error: any) => {
                            //         console.error(
                            //             'Error uploading purchase order:',
                            //             error
                            //         )
                            //     })
                        }

                        uploadPurchaseOrder()

                        onClose()
                        setOpenSuccessModal(true)
                        setActiveStep(0)
                    })
                    .catch((error: any) => {
                        toast.error('Order creation failed')
                        console.log('error: ', error)
                    })
            })
            .catch((error: any) => {
                toast.error('Order creation failed')
                console.log('error: ', error)
            })

        setLoading(false)
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
                    {cartItems.length > 0 ? (
                        <>
                            <HorizontalStepper
                                activeStep={activeStep}
                                handleNext={handleNext}
                                handleBack={handleBack}
                                handleReset={handleReset}
                            />
                            {activeStep === 0 && (
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
                                        {cartItems.map((item: any) => (
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
                                                        justifyContent:
                                                            'center',
                                                        position: 'absolute',
                                                        top: 8,
                                                        right: 8,
                                                    }}
                                                >
                                                    <Box
                                                        sx={{
                                                            display: 'flex',
                                                            flexDirection:
                                                                'row',
                                                            marginBottom: '8px',
                                                        }}
                                                    >
                                                        <Typography
                                                            variant="body2"
                                                            sx={{ mt: 1.5 }} // Added margin-bottom for spacing
                                                        >
                                                            Subtotal: $
                                                            {(
                                                                item.quantity *
                                                                prices[
                                                                    item
                                                                        .ProductID
                                                                ]
                                                            ).toFixed(2)}
                                                        </Typography>
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
                                                            flexDirection:
                                                                'row',
                                                            alignItems:
                                                                'center',
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
                                                                marginRight:
                                                                    '10px',
                                                                fontSize:
                                                                    '16px',
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
                                                            value={
                                                                item.quantity
                                                            }
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
                                                                marginLeft:
                                                                    '10px',
                                                                marginRight:
                                                                    '10px',
                                                                fontSize:
                                                                    '16px',
                                                                backgroundColor:
                                                                    '#5e239d',
                                                            }}
                                                        >
                                                            +
                                                        </Button>
                                                        <TextField
                                                            label="Price"
                                                            variant="outlined"
                                                            size="small"
                                                            sx={{
                                                                width: 100,
                                                                mt: 1,
                                                            }}
                                                            value={
                                                                prices[
                                                                    item
                                                                        .ProductID
                                                                ]
                                                            }
                                                            defaultValue={
                                                                item.UnitPrice
                                                            }
                                                            onChange={(e) =>
                                                                handlePriceChange(
                                                                    e,
                                                                    item.ProductID
                                                                )
                                                            }
                                                            type="number"
                                                        />
                                                    </Box>
                                                </Box>
                                            </Card>
                                        ))}
                                    </Box>
                                    <Box
                                        display="flex"
                                        justifyContent="space-between"
                                        mt={2}
                                    >
                                        <Typography variant="h6">
                                            Total Order Amount: $
                                            {totalPrice.toFixed(2)}
                                        </Typography>
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            onClick={handleNext}
                                            style={{
                                                backgroundColor: '#5e239d',
                                            }}
                                        >
                                            Next
                                        </Button>
                                    </Box>
                                </Box>
                            )}

                            {activeStep === 1 && (
                                <Box>
                                    <Typography variant="h6">
                                        Select your payment method
                                    </Typography>
                                    <FormControl
                                        component="fieldset"
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'row',
                                        }}
                                    >
                                        <RadioGroup
                                            aria-label="payment method"
                                            name="paymentMethod"
                                            value={paymentMethod}
                                            onChange={handlePaymentMethodChange}
                                        >
                                            <FormControlLabel
                                                value="creditCard"
                                                control={<Radio />}
                                                label="Credit/Debit Card"
                                            />
                                            <FormControlLabel
                                                value="cash"
                                                control={<Radio />}
                                                label="Cash On Delivery"
                                            />
                                            <FormControlLabel
                                                value="paypal"
                                                control={<Radio />}
                                                label="Paypal"
                                            />
                                            <FormControlLabel
                                                value="amazonPay"
                                                control={<Radio />}
                                                label="Amazon Pay"
                                            />
                                            <FormControlLabel
                                                value="googlePay"
                                                control={<Radio />}
                                                label="Google Pay"
                                            />
                                            <FormControlLabel
                                                value="applePay"
                                                control={<Radio />}
                                                label="Apple Pay"
                                            />
                                            <FormControlLabel
                                                value="aliPay"
                                                control={<Radio />}
                                                label="Ali Pay"
                                            />
                                        </RadioGroup>
                                    </FormControl>
                                    <Box
                                        display="flex"
                                        justifyContent="space-between"
                                        mt={2}
                                    >
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            onClick={handleBack}
                                            style={{
                                                color: '#5e239d',
                                                backgroundColor: 'white',
                                                borderColor:
                                                    '1px solid #5e239d !important',
                                            }}
                                        >
                                            Back
                                        </Button>
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            onClick={handleNext}
                                            style={{
                                                backgroundColor: '#5e239d',
                                            }}
                                        >
                                            Next
                                        </Button>
                                    </Box>
                                </Box>
                            )}
                            {activeStep === 2 && (
                                <Box>
                                    <Typography
                                        variant="h6"
                                        style={{ marginBottom: '15px' }}
                                    >
                                        Review your order{' '}
                                    </Typography>
                                    {cartItems.length > 0 && (
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                justifyContent: 'space-between',
                                                gap: 2,
                                            }}
                                        >
                                            {cartItems.map((item: any) => (
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
                                                            flexDirection:
                                                                'column',
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
                                                            flexDirection:
                                                                'column',
                                                            alignItems:
                                                                'flex-end',
                                                            justifyContent:
                                                                'center',
                                                            position:
                                                                'absolute',
                                                            top: 8,
                                                            right: 8,
                                                        }}
                                                    >
                                                        <Box
                                                            sx={{
                                                                display: 'flex',
                                                                flexDirection:
                                                                    'row',
                                                                marginBottom:
                                                                    '8px',
                                                            }}
                                                        >
                                                            <Box
                                                                sx={{
                                                                    display:
                                                                        'flex',
                                                                    flexDirection:
                                                                        'column',
                                                                    alignItems:
                                                                        'left',
                                                                    padding: 1,
                                                                    paddingRight:
                                                                        '2rem',
                                                                    marginTop:
                                                                        '10px',
                                                                }}
                                                            >
                                                                <Typography
                                                                    variant="body2"
                                                                    color="text.secondary"
                                                                    font-weight="bold"
                                                                >
                                                                    Quantity:{' '}
                                                                    {
                                                                        item.quantity
                                                                    }
                                                                </Typography>

                                                                <Typography
                                                                    variant="body2"
                                                                    color="text.secondary"
                                                                    font-weight="bold"
                                                                >
                                                                    Unit Price:
                                                                    $
                                                                    {
                                                                        prices[
                                                                            item
                                                                                .ProductID
                                                                        ]
                                                                    }
                                                                </Typography>
                                                                <Typography
                                                                    variant="body2"
                                                                    color="text.secondary"
                                                                    font-weight="bold"
                                                                >
                                                                    Total: $
                                                                    {(
                                                                        prices[
                                                                            item
                                                                                .ProductID
                                                                        ] *
                                                                        item.quantity
                                                                    ).toFixed(
                                                                        2
                                                                    )}
                                                                </Typography>
                                                            </Box>
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
                                                    </Box>
                                                </Card>
                                            ))}
                                            <Typography
                                                variant="h6"
                                                style={{ marginTop: '15px' }}
                                            >
                                                Total Order Amount: $
                                                {totalPrice.toFixed(2)}
                                            </Typography>
                                            <Box
                                                display="flex"
                                                justifyContent="space-between"
                                                mt={2}
                                            >
                                                <Button
                                                    variant="contained"
                                                    color="primary"
                                                    onClick={handleBack}
                                                    style={{
                                                        color: '#5e239d',
                                                        backgroundColor:
                                                            'white',
                                                        borderColor:
                                                            '1px solid #5e239d !important',
                                                    }}
                                                >
                                                    Back
                                                </Button>
                                                <Button
                                                    variant="contained"
                                                    color="primary"
                                                    onClick={confirmOrder}
                                                    style={{
                                                        backgroundColor:
                                                            '#5e239d',
                                                        color: loading
                                                            ? 'white'
                                                            : 'white',
                                                        cursor: loading
                                                            ? 'not-allowed'
                                                            : 'pointer',
                                                    }}
                                                    disabled={loading}
                                                >
                                                    {loading
                                                        ? 'Placing your order...'
                                                        : 'Confirm Order'}
                                                </Button>
                                            </Box>
                                        </Box>
                                    )}
                                </Box>
                            )}
                        </>
                    ) : (
                        <Box
                            sx={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                height: '30vh',
                            }}
                        >
                            <Typography variant="h6">
                                Your cart is empty
                            </Typography>
                        </Box>
                    )}
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

export default CartModal

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
