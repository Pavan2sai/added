import * as React from 'react'
import Box from '@mui/material/Box'
import Avatar from '@mui/material/Avatar'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import './AccountMenu.css'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import Logout from '@mui/icons-material/Logout'
import { Badge } from '@mui/material'
import { toast } from 'react-toastify'
import { auth } from '../../utils/firebase'
import { signOut } from 'firebase/auth'
import { useUserStore } from '../../utils/userStore'
import ShoppingCart from '../../assets/img/shopping-cart.png'
import {
    CartModal,
    ChangePasswordModal,
    OrderListModal,
} from '../../components'
import SyncLockIcon from '@mui/icons-material/SyncLock'
import Order from '../../assets/img/Order.png'

export default function AccountMenu() {
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
    const open = Boolean(anchorEl)
    const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] =
        React.useState(false)

    const handleChangePasswordClose = () => {
        setIsChangePasswordModalOpen(false)
    }

    const [isOrderListModalOpen, setOrderListModal] = React.useState(false)

    const [isCartOpen, setIsCartOpen] = React.useState(false)
    const { removeItemsFromCart, cartItems, currentUser } = useUserStore()
    const totalQuantity = cartItems.reduce(
        (total: any, item: any) => total + item.quantity,
        0
    )

    const handleOpenCart = () => {
        setIsCartOpen(true)
    }

    const handleCloseCart = () => {
        setIsCartOpen(false)
    }

    const handleConfirmOrder = () => {
        handleCloseCart()
    }

    const handleRemoveItems = (items: any) => {
        removeItemsFromCart(items)
    }

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget)
    }

    const handleClose = () => {
        setAnchorEl(null)
    }

    const handleLogout = () => {
        signOut(auth)
            .then(() => {
                toast.success('Logged out successfully')
                // Sign-out successful.
            })
            .catch((error: any) => {
                toast.error('Failed to sign out')
                // An error happened.
            })
    }

    return (
        <React.Fragment>
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    textAlign: 'center',
                }}
            >
                <Tooltip title="Your orders">
                    <Badge
                        badgeContent={totalQuantity}
                        sx={{
                            '& .MuiBadge-badge': {
                                backgroundColor: 'yellow',
                                color: 'black', // Optional: change the text color to black for better contrast
                                zIndex: 1,
                            },
                        }}
                        anchorOrigin={{
                            vertical: 'top',
                            horizontal: 'right',
                        }}
                    >
                        <img
                            src={ShoppingCart}
                            style={{ cursor: 'pointer' }}
                            className="shopping-cart"
                            onClick={handleOpenCart}
                        />
                    </Badge>
                </Tooltip>
                <CartModal isOpen={isCartOpen} onClose={handleCloseCart} />
                <Tooltip title="User profile">
                    <IconButton
                        onClick={handleClick}
                        size="large"
                        sx={{ ml: 2 }}
                        aria-controls={open ? 'account-menu' : undefined}
                        aria-haspopup="true"
                        aria-expanded={open ? 'true' : undefined}
                        style={{ padding: '0px' }}
                    >
                        <Avatar
                            sx={{
                                width: 40,
                                height: 40,
                                backgroundColor: '#5e239d',
                            }}
                        >
                            {(currentUser &&
                                currentUser?.displayName
                                    .charAt(0)
                                    .toUpperCase()) ||
                                'A'}
                        </Avatar>
                    </IconButton>
                </Tooltip>
            </Box>
            <Menu
                anchorEl={anchorEl}
                id="account-menu"
                open={open}
                onClose={handleClose}
                PaperProps={{
                    elevation: 0,
                    sx: {
                        overflow: 'visible',
                        filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                        mt: 1.5,
                        '& .MuiAvatar-root': {
                            width: 32,
                            height: 32,
                            ml: -0.5,
                            mr: 1,
                        },
                        '&::before': {
                            content: '""',
                            display: 'block',
                            position: 'absolute',
                            top: 0,
                            right: 14,
                            width: 10,
                            height: 10,
                            bgcolor: 'background.paper',
                            transform: 'translateY(-50%) rotate(45deg)',
                            zIndex: 0,
                        },
                    },
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
                <MenuItem onClick={handleClose}>
                    <Avatar
                        sx={{
                            width: 40,
                            height: 40,
                            backgroundColor: '#5e239d',
                            marginRight: '10px',
                        }}
                    >
                        {(currentUser &&
                            currentUser?.displayName.charAt(0).toUpperCase()) ||
                            'A'}
                    </Avatar>{' '}
                    Profile
                </MenuItem>

                <Divider />
                <MenuItem
                    onClick={() => {
                        setIsChangePasswordModalOpen(true)
                    }}
                >
                    <SyncLockIcon style={{ marginRight: '10px' }} /> Change
                    Password
                </MenuItem>

                <ChangePasswordModal
                    isOpen={isChangePasswordModalOpen}
                    handleClose={handleChangePasswordClose}
                    handleAvatarClose={handleClose}
                />
                <Divider />

                <MenuItem
                    onClick={() => {
                        setOrderListModal(true)
                    }}
                >
                    <img
                        src={Order}
                        height={30}
                        width={30}
                        style={{ marginRight: '10px' }}
                    />{' '}
                    Orders
                </MenuItem>
                <OrderListModal
                    style={{ height: '40vh', overflowy: 'auto' }}
                    isOpen={isOrderListModalOpen}
                    handleClose={() => setOrderListModal(false)}
                />

                <Divider />
                <MenuItem onClick={handleLogout}>
                    <Logout style={{ marginRight: '10px' }} /> Logout
                </MenuItem>
            </Menu>
        </React.Fragment>
    )
}
