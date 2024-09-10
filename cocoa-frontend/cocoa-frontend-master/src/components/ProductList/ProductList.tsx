// src/components/ProductList/ProductList.js
import React, { useEffect, useState } from 'react'
import './ProductList.css'
import { getProducts } from '../../endpoints/endpoints'
import ProductItem from '../ProductItem/ProductItem'
import ProductModal from '../ProductList/ProductModal'
import { CircularProgress } from '@mui/material'
import { useUserStore } from '../../utils/userStore'

const ProductList = ({ searchQuery, handleTabChange }: any) => {
    const { storeProducts, products } = useUserStore()
    const [productlist, setProducts] = useState(products)
    const [loading, setLoading] = useState(false)
    const [selectedProduct, setSelectedProduct] = useState(null)
    const [filteredProducts, setFilteredProducts] = useState([])
    const [isModalOpen, setIsModalOpen] = useState(false)

    useEffect(() => {
        let isMounted = true

        const fetchProducts = async () => {
            if (products === null) {
                setLoading(true)
                const productArray = await getProducts()
                if (isMounted) {
                    setProducts(productArray)
                    storeProducts(productArray)
                    setLoading(false)

                    const filteredProducts = productArray.filter(
                        (product: any) =>
                            product.ProductName.toLowerCase().includes(
                                searchQuery.toLowerCase()
                            )
                    )

                    setFilteredProducts(filteredProducts)
                }
            } else {
                const filteredProducts = productlist.filter((product: any) =>
                    product.ProductName.toLowerCase().includes(
                        searchQuery.toLowerCase()
                    )
                )

                setFilteredProducts(filteredProducts)
            }
        }

        fetchProducts()

        return () => {
            isMounted = false
        }
    }, [searchQuery])

    const handleProductClick = (product: any) => {
        setSelectedProduct(product)
        setIsModalOpen(true)
    }

    const closeModal = () => {
        setIsModalOpen(false)
        setSelectedProduct(null)
    }

    return (
        <div className="product-list">
            {loading ? (
                <div style={{ textAlign: 'center' }}>
                    <CircularProgress />
                </div>
            ) : filteredProducts.length === 0 ? (
                'No Product Found'
            ) : (
                filteredProducts.map((product: any) => (
                    <ProductItem
                        key={product.ProductID}
                        product={product}
                        onClick={handleProductClick}
                        handleTabChange={handleTabChange}
                    />
                ))
            )}
            <ProductModal
                isOpen={isModalOpen}
                onClose={closeModal}
                product={selectedProduct}
                handleTabChange={handleTabChange}
            />
        </div>
    )
}

export default ProductList
