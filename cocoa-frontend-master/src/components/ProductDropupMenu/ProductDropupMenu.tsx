// src/components/ProductDropupMenu/ProductDropupMenu.js
import React, { useEffect, useState } from 'react'
import './ProductDropupMenu.css'
import { getProducts } from '../../endpoints/endpoints'
import { CircularProgress, Tooltip } from '@mui/material'
import { BACKEND_URL } from '../../constant'
import { useUserStore } from '../../utils/userStore'
import ProductIcon from '../../assets/img/products-icon.png'
import SubmitIcon from '../../assets/img/submit-icon.png'
import SendMessage from '../../assets/img/sendMessage.png'
import DisabledSendMessage from '../../assets/img/sendMessage-disabled.png'
import AddToCart from '../../assets/img/addToCart.png'
import AddToCartDisabled from '../../assets/img/addToCartDisabled.png'
import { toast } from 'react-toastify'

const ProductDropupMenu = ({ sendProductCards }: any) => {
    const [loading, setLoading] = useState(false)
    const [selectedProducts, setSelectedProducts] = useState<any>([])
    const [isOpen, setIsOpen] = useState(false)
    const [filteredProducts, setFilteredProducts] = useState<any>([])
    const {
        supplierEmail,
        addItemToCart,
        cartItems,
        products,
        filterProducts,
    } = useUserStore()

    useEffect(() => {
        let isMounted = true

        const fetchProducts = async () => {
            if (isMounted) {
                setLoading(true)
                const products = await getProducts()
                if (isMounted) {
                    const filteredProducts = products.filter(
                        (product: any) =>
                            product.supplierEmail === supplierEmail
                    )
                    setFilteredProducts(filteredProducts)
                    // filterProducts(filteredProducts)
                    setLoading(false)
                }
            }
        }

        fetchProducts()

        return () => {
            isMounted = false
        }
    }, [])
    useEffect(() => {
        if (isOpen === false) {
            setSelectedProducts([])
        }
    }, [isOpen])

    const toggleMenu = () => {
        setIsOpen(!isOpen)
    }
    const handleCheckboxChange = (product: any) => {
        setSelectedProducts((prev: any) => {
            if (prev.includes(product)) {
                return prev.filter((p: any) => p !== product)
            } else {
                return [...prev, product]
            }
        })
    }

    const handleAddToCart = (e: any) => {
        if (cartItems.length === 0) {
            // If cart is empty, add all selected products directly
            selectedProducts.forEach((item: any) => {
                toast.success('Product added to cart!')
                addItemToCart(item)
            })
            setIsOpen(false)
            setSelectedProducts([])
        } else {
            // If cart is not empty, check for matching supplier email
            let hasMatchingSupplier = false

            selectedProducts.forEach((selectedItem: any) => {
                const existingItemWithSameSupplier = cartItems.find(
                    (cartItem: any) =>
                        cartItem.supplierEmail === selectedItem.supplierEmail
                )

                if (existingItemWithSameSupplier) {
                    toast.success('Product added to cart!')
                    addItemToCart(selectedItem)
                    hasMatchingSupplier = true
                } else {
                    toast.error(
                        'There are products in your cart from different supplier, please remove them first!'
                    )
                }
            })

            if (hasMatchingSupplier) {
                setIsOpen(false)
                setSelectedProducts([])
            }
        }

        // Implement add to cart functionality here
        console.log('cartItems', cartItems)
    }

    const handleSubmit = async () => {
        await sendProductCards(selectedProducts)

        setIsOpen(false)
        setSelectedProducts([])
    }
    return (
        <div className="dropup">
            <Tooltip title="Product List">
                <div className="products-btn" onClick={toggleMenu}>
                    <img src={ProductIcon} />
                </div>
            </Tooltip>
            {isOpen && (
                <div className="dropup-content">
                    {loading ? (
                        <CircularProgress />
                    ) : (
                        filteredProducts.map((product: any) => (
                            <div
                                key={product.ProductID}
                                className="product-item"
                            >
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={selectedProducts.includes(
                                            product
                                        )}
                                        onChange={() =>
                                            handleCheckboxChange(product)
                                        }
                                    />
                                    {product.ProductName}
                                </label>
                                <img
                                    src={`${BACKEND_URL}/images/${product.MainImage}`}
                                    alt={product.ProductName}
                                    width={50}
                                />
                            </div>
                        ))
                    )}
                    <div className="submit-btn">
                        {selectedProducts.length > 0 ? (
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'flex-end',
                                }}
                            >
                                <Tooltip title="Add Product(s) to cart!">
                                    <img
                                        onClick={handleAddToCart}
                                        style={{
                                            padding: '10px',
                                            width: '30px',
                                        }}
                                        src={AddToCart}
                                    />
                                </Tooltip>
                                <Tooltip title="Send Product(s) in message!">
                                    <img
                                        onClick={handleSubmit}
                                        style={{ padding: '10px' }}
                                        src={SendMessage}
                                    />
                                </Tooltip>
                            </div>
                        ) : (
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'flex-end',
                                }}
                            >
                                <Tooltip title="Please select products to add to cart!">
                                    <img
                                        src={AddToCartDisabled}
                                        style={{
                                            padding: '10px',
                                            width: '30px',
                                        }}
                                    />
                                </Tooltip>
                                <Tooltip title="Please select products to send as message!">
                                    <img
                                        src={DisabledSendMessage}
                                        style={{ padding: '10px' }}
                                    />
                                </Tooltip>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

export default ProductDropupMenu
