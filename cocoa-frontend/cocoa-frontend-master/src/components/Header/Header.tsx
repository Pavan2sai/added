import React, { useState } from 'react'
import './Header.css'
import CocoaLogo from '../../assets/img/cocoaLogo.png'
import Button from '@mui/material/Button'
import { AccountMenu } from '../../components'
import { useUserStore } from '../../utils/userStore'

const Header = ({ openModal, toggleBtn, setToggleBtn }: any) => {
    const { currentUser } = useUserStore()

    return (
        <header className="header">
            <div className="logo">
                <img src={CocoaLogo} alt="Cocoa Logo" className="cocoa-logo" />
            </div>

            <div className="headline-text">
                <h1>Digitize - Connect - Grow</h1>
            </div>
            <div className="right-section">
                {currentUser === null ? (
                    <>
                        <Button
                            variant="contained"
                            className="login"
                            onClick={() => openModal(true)}
                        >
                            Login
                        </Button>
                    </>
                ) : (
                    <AccountMenu />
                )}
                <span
                    style={{
                        textAlign: 'right',
                        fontSize: '7px',
                        marginTop: '6px',
                        cursor: 'pointer',
                    }}
                    className="toggle-btn"
                    onClick={() => setToggleBtn(!toggleBtn)}
                >
                    {!toggleBtn ? 'Visit Website' : 'Visit Shop'}
                </span>
            </div>
        </header>
    )
}

export default Header
