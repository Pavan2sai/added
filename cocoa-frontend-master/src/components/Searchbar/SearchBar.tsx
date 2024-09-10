// src/components/SearchBar.js
import React from 'react'
import './SearchBar.css'

const SearchBar = ({ onSearch }: any) => {
    const handleInputChange = (e: any) => {
        onSearch(e.target.value)
    }

    return (
        <div className="search-bar">
            <input
                type="text"
                placeholder="Search your product here"
                onChange={handleInputChange}
                autoComplete="off"
            />
        </div>
    )
}

export default SearchBar
