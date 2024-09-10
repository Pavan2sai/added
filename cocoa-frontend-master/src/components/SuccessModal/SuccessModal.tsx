import React, { useState } from 'react'
import { Modal, Box, Typography, Button, IconButton } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { PDFDownloadLink, pdf } from '@react-pdf/renderer'
import { PurchaseOrder } from '../../components'
import { useUserStore } from '../../utils/userStore'
import { BACKEND_URL } from '../../constant'
import axios from 'axios'

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
    textAlign: 'center',
    borderRadius: 2,
}

const SuccessModal = ({ restaurant, orderData, open, handleClose }: any) => {
    const { cartItems } = useUserStore()

    const openPDF = async () => {
        // Create a PDF Blob
        const pdfBlob = await pdf(
            <PurchaseOrder
                cartItems={cartItems}
                orderData={orderData}
                restaurant={restaurant}
            />
        ).toBlob()
        const pdfUrl = URL.createObjectURL(pdfBlob)

        // Open the PDF in a new tab
        window.open(pdfUrl, '_blank')
    }

    return (
        <Modal
            open={open}
            onClose={handleClose}
            aria-labelledby="modal-title"
            aria-describedby="modal-description"
        >
            <Box sx={style}>
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        mb: 2,
                    }}
                >
                    <IconButton onClick={handleClose}>
                        <CloseIcon />
                    </IconButton>
                </Box>
                <Typography
                    id="modal-description"
                    sx={{ mt: 1, mb: 1, fontSize: '20px' }}
                >
                    Thanks for using COCOA
                </Typography>
                {orderData && (
                    <Typography id="modal-title" variant="h6" component="h2">
                        Your Purchase Order {orderData.OrderID} has been placed
                        successfully!
                    </Typography>
                )}
                <Box mt={3}>
                    <Button
                        variant="contained"
                        color="primary"
                        sx={{ mr: 2, backgroundColor: '#5e239d' }}
                        onClick={openPDF}
                    >
                        View P.O.
                    </Button>
                    <Button
                        variant="outlined"
                        color="primary"
                        sx={{ color: '#5e239d' }}
                    >
                        <PDFDownloadLink
                            document={
                                <PurchaseOrder
                                    cartItems={cartItems}
                                    orderData={orderData}
                                    restaurant={restaurant}
                                />
                            }
                            fileName="purchase_order.pdf"
                        >
                            Download P.O.
                        </PDFDownloadLink>
                    </Button>
                </Box>
            </Box>
        </Modal>
    )
}

export default SuccessModal
