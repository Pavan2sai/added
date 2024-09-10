import React, { useState } from 'react'
import {
    Box,
    Button,
    Modal,
    TextField,
    Typography,
    IconButton,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'

import { updatePassword } from 'firebase/auth'
import { useUserStore } from '../../utils/userStore'
import { toast } from 'react-toastify'
import { auth } from '../../utils/firebase'

const ChangePasswordModal = ({
    isOpen,
    handleClose,
    handleAvatarClose,
}: {
    isOpen: boolean
    handleClose: () => void
    handleAvatarClose: () => void
}) => {
    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const { currentUser } = useUserStore()

    const handleUpdate = () => {
        if (newPassword !== confirmPassword) {
            alert('New password and confirm password do not match')
            return
        }

        updatePassword(auth.currentUser, newPassword)
            .then(() => {
                toast.success('Password updated successfully')
                handleAvatarClose()
                handleClose()
            })
            .catch((error) => {
                toast.error('Failed to update password')
            })
    }

    const handleCancel = () => {
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
        handleClose()
        handleAvatarClose()
    }

    return (
        <Modal
            open={isOpen}
            onClose={handleClose}
            aria-labelledby="change-password-modal-title"
            aria-describedby="change-password-modal-description"
        >
            <Box
                sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 400,
                    bgcolor: 'background.paper',
                    boxShadow: 24,
                    p: 4,
                    borderRadius: 2,
                    outline: 'none',
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
                        id="change-password-modal-title"
                        variant="h6"
                        component="h2"
                    >
                        Change Password
                    </Typography>
                    <IconButton onClick={handleClose}>
                        <CloseIcon />
                    </IconButton>
                </Box>
                <TextField
                    label="Current Password"
                    type="password"
                    fullWidth
                    margin="normal"
                    value={currentPassword}
                    autoComplete="off"
                    onChange={(e) => setCurrentPassword(e.target.value)}
                />
                <TextField
                    label="New Password"
                    type="password"
                    fullWidth
                    margin="normal"
                    value={newPassword}
                    autoComplete="off"
                    onChange={(e) => setNewPassword(e.target.value)}
                />
                <TextField
                    label="Confirm New Password"
                    type="password"
                    fullWidth
                    margin="normal"
                    value={confirmPassword}
                    autoComplete="off"
                    onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <Box
                    sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}
                >
                    <Button onClick={handleCancel} sx={{ mr: 2 }}>
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleUpdate}
                    >
                        Update
                    </Button>
                </Box>
            </Box>
        </Modal>
    )
}

export default ChangePasswordModal
