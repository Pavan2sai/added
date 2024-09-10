// src/components/ProductSection.js
import React, { useState } from 'react'
import { SearchBar, ProductList, Tabs, ChatList } from '../../components'
import './ProductSection.css'
import { useUserStore } from '../../utils/userStore'

const ProductSection = () => {
    const [searchQuery, setSearchQuery] = useState('')
    const [value, setValue] = React.useState(0)

    const { setChatWindowTab } = useUserStore()

    const handleTabChange = (event: any, newValue: any) => {
        setValue(newValue)
        if (newValue === 0) {
            setChatWindowTab(false)
        }
    }

    const handleSearch = (query: any) => {
        setSearchQuery(query)
    }
    return (
        <div className="product-section">
            <SearchBar onSearch={handleSearch} />

            <div className="product-list-container">
                <Tabs
                    className="homepage-tabs"
                    value={value}
                    handleTabChange={handleTabChange}
                >
                    <ProductList
                        searchQuery={searchQuery}
                        handleTabChange={handleTabChange}
                    />
                    <ChatList />
                </Tabs>
            </div>
        </div>
    )
}

export default ProductSection
