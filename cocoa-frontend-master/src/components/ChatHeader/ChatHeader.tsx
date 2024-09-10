import React from 'react'
import './ChatHeader.css'
import { useUserStore } from '../../utils/userStore'

function ChatHeader() {
    const { setChatWindowTab, supplierName } = useUserStore()
    return (
        <div className="chat-header">
            <div className="avatar">{supplierName.charAt(0).toUpperCase()}</div>
            <div className="chat-header-details">
                <div className="chat-header-name">
                    {supplierName.charAt(0).toUpperCase() +
                        supplierName.slice(1)}
                </div>
            </div>
            <div
                className="chat-cancel"
                onClick={() => {
                    setChatWindowTab(false)
                }}
            >
                X
            </div>
        </div>
    )
}

export default ChatHeader
