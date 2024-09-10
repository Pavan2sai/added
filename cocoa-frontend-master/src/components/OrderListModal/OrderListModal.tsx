import React, { useState, useEffect } from 'react'
import {
    Box,
    Modal,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Collapse,
    Typography,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import VisibilityIcon from '@mui/icons-material/Visibility'
import GetAppIcon from '@mui/icons-material/GetApp'
import {
    getOrderDetail,
    getOrders,
    getProducts,
} from '../../endpoints/endpoints'
import { useUserStore } from '../../utils/userStore'
import { BACKEND_URL } from '../../constant'

const statusColors: any = {
    Completed: 'green',
    'In Progress': 'orange',
    Cancelled: 'red',
}

function createData(
    OrderID: any,
    RestaurantID: any,
    OrderDate: any,
    TotalAmount: any,
    PaymentStatus: any,
    ShippingStatus: any,
    ShippingAddress: any,
    history: any
) {
    return {
        OrderID,
        RestaurantID,
        OrderDate,
        TotalAmount,
        PaymentStatus,
        ShippingStatus,
        ShippingAddress,
        history,
    }
}

const dummyData = [
    createData(
        '12345',
        'R1',
        '2022-06-01',
        150,
        'Paid',
        'Delivered',
        '123 Street, City',
        [
            { date: '2022-06-01', detail: 'Order placed' },
            { date: '2022-06-02', detail: 'Order shipped' },
        ]
    ),
    createData(
        '67890',
        'R2',
        '2022-06-10',
        200,
        'Pending',
        'Pending',
        '456 Avenue, City',
        [{ date: '2022-06-10', detail: 'Order placed' }]
    ),
]

const Row = (props: any) => {
    const { row, orderDetail, products } = props
    const [open, setOpen] = useState(false)
    const { currentUser } = useUserStore()

    const filteredOrderDetail = orderDetail.filter(
        (detail: any) => detail.OrderID === row.OrderID
    )

    const getProductImage = (productId: any) => {
        const product: any = products.find(
            (prod: any) => prod.ProductID === productId
        )
        return product ? `${BACKEND_URL}/images/${product.MainImage}` : ''
    }

    const handlePreview = (blob: any) => {
        window.open(`${BACKEND_URL}/PDF/${blob}`, '_blank')

        // Logic to preview the purchase order blob
    }

    const handleDownload = (blob: any) => {
        // Logic to download the purchase order blob
    }

    return (
        <React.Fragment>
            <TableRow
                sx={{
                    '& > *': { borderBottom: 'unset' },
                }}
            >
                <TableCell>
                    <IconButton
                        aria-label="expand row"
                        size="small"
                        onClick={() => setOpen(!open)}
                    >
                        {open ? (
                            <KeyboardArrowUpIcon />
                        ) : (
                            <KeyboardArrowDownIcon />
                        )}
                    </IconButton>
                </TableCell>
                <TableCell>{row.OrderID}</TableCell>
                <TableCell>{row.SupplierName}</TableCell>
                <TableCell>{row.OrderDate}</TableCell>
                <TableCell>${row.TotalAmount}</TableCell>
                <TableCell>{row.PaymentStatus}</TableCell>
                <TableCell>
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                        }}
                    >
                        <Box
                            sx={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                backgroundColor:
                                    statusColors[row.ShippingStatus],
                                mr: 1,
                            }}
                        />
                        {row.ShippingStatus}
                    </Box>
                </TableCell>
                <TableCell>{row.ShippingAddress}</TableCell>
                <TableCell>
                    <IconButton
                        onClick={() => handlePreview(row.PurchaseOrder)}
                        aria-label="preview"
                    >
                        <VisibilityIcon />
                    </IconButton>
                </TableCell>
                <TableCell>
                    <IconButton
                        onClick={() => handlePreview(row.DeliveryOrder)}
                        aria-label="preview"
                    >
                        <VisibilityIcon />
                    </IconButton>
                </TableCell>
                <TableCell>
                    <IconButton
                        onClick={() => handlePreview(row.GoodsReceiveNote)}
                        aria-label="preview"
                    >
                        <VisibilityIcon />
                    </IconButton>
                </TableCell>
                <TableCell>
                    <IconButton
                        onClick={() => handlePreview(row.Invoice)}
                        aria-label="preview"
                    >
                        <VisibilityIcon />
                    </IconButton>
                </TableCell>
            </TableRow>
            <TableRow>
                <TableCell
                    style={{
                        paddingBottom: 0,
                        paddingTop: 0,
                    }}
                    colSpan={9}
                >
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box sx={{ margin: 1 }}>
                            <Typography
                                variant="h6"
                                gutterBottom
                                component="div"
                            >
                                Order Details
                            </Typography>
                            <Table size="small" aria-label="purchases">
                                <TableHead>
                                    <TableRow>
                                        {/* <TableCell>OrderDetailID</TableCell>
                                        <TableCell>OrderID</TableCell> */}
                                        <TableCell>Product</TableCell>
                                        <TableCell>Quantity</TableCell>
                                        <TableCell>UnitPrice</TableCell>
                                        <TableCell>SubTotal</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filteredOrderDetail.map(
                                        (item: any, index: any) => (
                                            <TableRow key={index}>
                                                {/* <TableCell>
                                                    {item.OrderDetailID}
                                                </TableCell>
                                                <TableCell>
                                                    {item.OrderID}
                                                </TableCell> */}
                                                <TableCell>
                                                    <img
                                                        src={getProductImage(
                                                            item.ProductID
                                                        )}
                                                        style={{
                                                            borderRadius:
                                                                '10px',
                                                        }}
                                                        height={40}
                                                        // width={40}
                                                        alt={item.ProductName}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    {item.Quantity}
                                                </TableCell>
                                                <TableCell>
                                                    {item.UnitPrice}
                                                </TableCell>
                                                <TableCell>
                                                    {item.UnitPrice *
                                                        item.Quantity}
                                                </TableCell>
                                            </TableRow>
                                        )
                                    )}
                                </TableBody>
                            </Table>
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
        </React.Fragment>
    )
}

const OrderTableModal = ({ isOpen, handleClose }: any) => {
    const [orderlist, setOrderlist] = useState(dummyData)
    const [orderDetail, setOrderDetail] = useState([])
    const { products, currentUser } = useUserStore()
    useEffect(() => {
        const fetchOrders = async () => {
            const orders = await getOrders()
            const orderDetail = await getOrderDetail()

            // const updatedOrders =
            //     orders &&
            //     orders.filter(
            //         (item: any) =>
            //             item.SupplierName ===
            //             currentUser?.displayName.charAt(0).toUpperCase() +
            //                 currentUser.displayName.slice(1)
            //     )

            setOrderlist(orders)
            setOrderDetail(orderDetail)
        }

        fetchOrders()
    }, [])

    return (
        <Modal
            open={isOpen}
            onClose={handleClose}
            aria-labelledby="order-table-modal-title"
            aria-describedby="order-table-modal-description"
        >
            <Box
                sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '80%',
                    bgcolor: 'background.paper',
                    boxShadow: 24,
                    p: 4,
                    borderRadius: 2,
                    outline: 'none',
                    height: '80vh',
                    overflowY: 'auto',
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        mb: 2,
                    }}
                >
                    <Typography
                        variant="h6"
                        style={{ marginBottom: '15px', textAlign: 'center' }}
                    >
                        Orders
                    </Typography>{' '}
                    <IconButton onClick={handleClose}>
                        <CloseIcon />
                    </IconButton>
                </Box>
                {orderlist.length > 0 ? (
                    <TableContainer component={Paper}>
                        <Table aria-label="order table">
                            <TableHead>
                                <TableRow>
                                    <TableCell />
                                    <TableCell>Order ID</TableCell>
                                    <TableCell>Supplier Name</TableCell>
                                    <TableCell>Order Date</TableCell>
                                    <TableCell>Total Amount</TableCell>
                                    <TableCell>Payment Status</TableCell>
                                    <TableCell>Shipping Status</TableCell>
                                    <TableCell>Shipping Address</TableCell>
                                    <TableCell>Purchase Order</TableCell>
                                    <TableCell>Delivery Order</TableCell>
                                    <TableCell>Goods Received Note</TableCell>
                                    <TableCell>Invoice</TableCell>
                                    {/* <TableCell>Actions</TableCell> */}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {orderlist.map((order, index) => (
                                    <Row
                                        key={index}
                                        row={order}
                                        orderDetail={orderDetail}
                                        products={products}
                                    />
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                ) : (
                    <Typography
                        variant="h6"
                        style={{ marginBottom: '15px', textAlign: 'center' }}
                    >
                        You have no orders.
                    </Typography>
                )}
            </Box>
        </Modal>
    )
}

export default OrderTableModal
