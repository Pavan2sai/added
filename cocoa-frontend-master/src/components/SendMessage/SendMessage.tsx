// src/components/MessageSend.js
import React, { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons'
import './SendMessage.css'

const MessageSend = ({ onSend }: any) => {
    const [message, setMessage] = useState('')

    const handleSendMessage = () => {
        if (message.trim()) {
            onSend(message)
            setMessage('') // Clear the message input
        }
    }

    return (
        <div className="message-send">
            <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message"
            />
            <button onClick={handleSendMessage}>
                <FontAwesomeIcon icon={faPaperPlane} />
            </button>
        </div>
    )
}

export default MessageSend
