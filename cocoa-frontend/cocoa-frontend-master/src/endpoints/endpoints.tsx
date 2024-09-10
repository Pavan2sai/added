import { BACKEND_URL } from '../constant'
import axios from 'axios'

function arrayBufferToBase64(buffer: any) {
    // Create a Uint8Array from the ArrayBuffer
    const uint8Array = new Uint8Array(buffer)

    // Convert the Uint8Array to a binary string
    let binaryString = ''
    for (let i = 0; i < uint8Array.length; i++) {
        binaryString += String.fromCharCode(uint8Array[i])
    }

    return binaryString
}

export const getProducts = async () => {
    try {
        // Fetch products
        const productResponse = await axios.get(`${BACKEND_URL}/getProducts`)
        let products = productResponse.data

        // Fetch suppliers
        const supplierResponse = await axios.get(`${BACKEND_URL}/getSuppliers`)
        const suppliers = supplierResponse.data

        // Map through products and add supplierEmail
        products = products.map((product: any) => {
            const supplier = suppliers.find(
                (supplier: any) => supplier.SupplierID === product.SupplierID
            )
            if (supplier) {
                product.supplierEmail = supplier.Email
                product.supplierName = supplier.CompanyName
            }
            return product
        })

        // Convert MainImage if necessary
        products.forEach((item: any) => {
            if (item.MainImage && item.MainImage.type === 'Buffer') {
                const base64String = arrayBufferToBase64(item.MainImage.data)
                item.MainImage = base64String
            }
        })

        return products
    } catch (error) {
        console.error('Error fetching products:', error)
        throw error // Propagate the error so it can be handled by the caller
    }
}

export const getOrders = async () => {
    try {
        // Fetch products
        const orderResponse = await axios.get(`${BACKEND_URL}/getOrders`)
        let orders = orderResponse.data

        return orders
    } catch (error) {
        console.error('Error fetching orders:', error)
        throw error // Propagate the error so it can be handled by the caller
    }
}

export const cancelOrder = async (Id: any) => {
    try {
        // Fetch products
        const orderResponse = axios.post(`${BACKEND_URL}/cancelOrder`, {
            orderID: Id,
        })

        return orderResponse
    } catch (error) {
        console.error('Error fetching orders:', error)
        throw error // Propagate the error so it can be handled by the caller
    }
}

export const completeOrder = async (Id: any) => {
    try {
        // Fetch products
        const orderResponse = axios.post(`${BACKEND_URL}/completeOrder`, {
            orderID: Id,
        })

        return orderResponse
    } catch (error) {
        console.error('Error fetching orders:', error)
        throw error // Propagate the error so it can be handled by the caller
    }
}

export const getOrderDetail = async () => {
    try {
        // Fetch products
        const orderResponse = await axios.get(`${BACKEND_URL}/getOrderDetail`)
        let orders = orderResponse.data

        return orders
    } catch (error) {
        console.error('Error fetching orders:', error)
        throw error // Propagate the error so it can be handled by the caller
    }
}

export const getRestaurants = async () => {
    try {
        // Fetch products
        const restaurantsList = await axios.get(
            `${BACKEND_URL}/getRestaurantList`
        )
        let restaurants = restaurantsList.data

        return restaurants
    } catch (error) {
        console.error('Error fetching restaurants:', error)
        throw error // Propagate the error so it can be handled by the caller
    }
}
