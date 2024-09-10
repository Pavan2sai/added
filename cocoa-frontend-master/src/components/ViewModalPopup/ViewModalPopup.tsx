import React from 'react'
import { Modal, Box, IconButton } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import DownloadIcon from '@mui/icons-material/Download'

interface ImageModalProps {
    open: boolean
    handleClose: () => void
    imageUrl: string
}

const style = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
}

const ViewModalPopup: React.FC<ImageModalProps> = ({
    open,
    handleClose,
    imageUrl,
}) => {
    const downloadImage = () => {
        const link = document.createElement('a')
        link.href = imageUrl
        link.download = 'image.jpg'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    return (
        <Modal open={open} onClose={handleClose}>
            <Box sx={style}>
                <IconButton
                    aria-label="close"
                    onClick={handleClose}
                    sx={{ position: 'absolute', top: 8, right: 8, p: 1 }}
                >
                    <CloseIcon />
                </IconButton>
                <img
                    src={imageUrl}
                    alt="Chat"
                    style={{ maxWidth: '100%', maxHeight: '80vh' }}
                />
                <IconButton
                    aria-label="download"
                    onClick={downloadImage}
                    sx={{ mt: 2 }}
                >
                    <DownloadIcon />
                </IconButton>
            </Box>
        </Modal>
    )
}

export default ViewModalPopup
