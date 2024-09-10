import React from 'react'
import {
    Page,
    Text,
    View,
    Document,
    StyleSheet,
    Font,
} from '@react-pdf/renderer'
import { useUserStore } from '../../utils/userStore'
import './PurchaseOrder.css'

// Register fonts
Font.register({
    family: 'Helvetica',
    src: 'https://fonts.gstatic.com/s/helvetica/v6/7cHlr2EbQJq10pFw0WbCsgLUuEpTyoUstqEm5AMlJo4.woff2',
})

const styles = StyleSheet.create({
    page: {
        padding: 30,
        fontFamily: 'Helvetica',
        fontSize: 12,
    },
    section: {
        marginBottom: 10,
    },
    header: {
        textAlign: 'center',
        marginBottom: 20,
    },
    poInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    table: {
        display: 'flex',
        flexDirection: 'column',
        border: '1px solid #000',
    },
    tableRow: {
        flexDirection: 'row',
    },
    tableCol: {
        width: '25%',
        borderStyle: 'solid',
        borderColor: '#000',
        borderWidth: 1,
        padding: 5,
    },
    tableCell: {
        margin: 'auto',
        marginTop: 5,
        fontSize: 10,
    },
    footer: {
        textAlign: 'center',
        fontSize: 10,
        marginTop: 20,
    },
})

// Create Document Component
const PurchaseOrder = (props: any) => {
    const products = props.cartItems.map((item: any) => {
        return {
            product: item.ProductName,
            quantity: item.quantity,
            price: item.UnitPrice,
            amount: `$ ${item.quantity * item.UnitPrice}`,
        }
    })

    const {
        OrderDate,
        OrderID,
        PaymentStatus,
        RestaurantID,
        ShippingAddress,
        ShippingStatus,
        TotalAmount,
    } = props.orderData

    const { CompanyName, FocalPersonHp } = props.restaurant

    // Extract year, month, and day
    const year = OrderDate.slice(0, 4)
    const month = OrderDate.slice(4, 6)
    let day = OrderDate.slice(6, 8)
    let delieveryDay = day + 5

    // Format as DD/MM/YYYY
    const formattedDate = `${day}/${month}/${year}`
    const delieveryDate = `${delieveryDay}/${month}/${year}`
    const orderDetails = {
        customerCompany: 'COCOA',

        poNumber: OrderID,
        poDate: formattedDate,
        deliveryDate: delieveryDate,
        supplierCompany: CompanyName,
        supplierContact: FocalPersonHp,
        supplierAddress: ShippingAddress,

        descriptionDetails: products,
        total: TotalAmount,
        paymentDetails: [
            {
                date: formattedDate,
                gateway: 'Cash on Delivery',
                transactionId: '-',
                amount: TotalAmount,
            },
        ],
    }

    return (
        <Document>
            <Page style={styles.page}>
                <View style={styles.header}>
                    <Text>{orderDetails.customerCompany}</Text>
                </View>
                <View style={styles.poInfo}>
                    <View>
                        <Text>P.O. #: {orderDetails.poNumber}</Text>
                        <Text>P.O. Date: {orderDetails.poDate}</Text>
                        <Text>Delivery Date: {orderDetails.deliveryDate}</Text>
                    </View>
                    <View>
                        <Text>To:</Text>
                        <Text>{orderDetails.supplierCompany}</Text>
                        <Text>{orderDetails.supplierContact}</Text>
                        <Text>{orderDetails.supplierAddress}</Text>
                    </View>
                </View>
                <View style={styles.section}>
                    <Text>Order Details</Text>
                    <View style={styles.table}>
                        <View style={styles.tableRow}>
                            <View style={styles.tableCol}>
                                <Text style={styles.tableCell}>Product</Text>
                            </View>
                            <View style={styles.tableCol}>
                                <Text style={styles.tableCell}>Quantity</Text>
                            </View>
                            <View style={styles.tableCol}>
                                <Text style={styles.tableCell}>Price</Text>
                            </View>
                            <View style={styles.tableCol}>
                                <Text style={styles.tableCell}>Amount</Text>
                            </View>
                        </View>
                        {orderDetails.descriptionDetails.map(
                            (payment: any, index: any) => (
                                <View style={styles.tableRow} key={index}>
                                    <View style={styles.tableCol}>
                                        <Text style={styles.tableCell}>
                                            {payment.product}
                                        </Text>
                                    </View>
                                    <View style={styles.tableCol}>
                                        <Text style={styles.tableCell}>
                                            {payment.quantity}
                                        </Text>
                                    </View>
                                    <View style={styles.tableCol}>
                                        <Text style={styles.tableCell}>
                                            {payment.price}
                                        </Text>
                                    </View>
                                    <View style={styles.tableCol}>
                                        <Text style={styles.tableCell}>
                                            {payment.amount}
                                        </Text>
                                    </View>
                                </View>
                            )
                        )}
                    </View>
                </View>

                <View style={styles.section}>
                    <Text>Payment Details:</Text>
                    <View style={styles.table}>
                        <View style={styles.tableRow}>
                            <View style={styles.tableCol}>
                                <Text style={styles.tableCell}>
                                    Transaction Date
                                </Text>
                            </View>
                            <View style={styles.tableCol}>
                                <Text style={styles.tableCell}>Gateway</Text>
                            </View>
                            <View style={styles.tableCol}>
                                <Text style={styles.tableCell}>
                                    Transaction ID
                                </Text>
                            </View>
                            <View style={styles.tableCol}>
                                <Text style={styles.tableCell}>
                                    Total Amount
                                </Text>
                            </View>
                        </View>
                        {orderDetails.paymentDetails.map((payment, index) => (
                            <View style={styles.tableRow} key={index}>
                                <View style={styles.tableCol}>
                                    <Text style={styles.tableCell}>
                                        {payment.date}
                                    </Text>
                                </View>
                                <View style={styles.tableCol}>
                                    <Text style={styles.tableCell}>
                                        {payment.gateway}
                                    </Text>
                                </View>
                                <View style={styles.tableCol}>
                                    <Text style={styles.tableCell}>
                                        {payment.transactionId}
                                    </Text>
                                </View>
                                <View style={styles.tableCol}>
                                    <Text style={styles.tableCell}>
                                        $ {payment.amount}
                                    </Text>
                                </View>
                            </View>
                        ))}
                    </View>
                </View>

                <View style={styles.footer}>
                    <Text>
                        PDF Generated on {new Date().toLocaleDateString()}
                    </Text>
                </View>
            </Page>
        </Document>
    )
}

export default PurchaseOrder
