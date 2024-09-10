import React, { useState } from 'react'
import Modal from 'react-modal'
import './LoginModal.css'
import axios from 'axios'
import { Button, TextField } from '@mui/material'
import { CircularProgress } from '@mui/material'
import cocoaLogo from '../../assets/img/cocoaLogo.png'
import CloseIcon from '@mui/icons-material/Close'
import {
    createUserWithEmailAndPassword,
    updateProfile,
    signInWithEmailAndPassword,
} from 'firebase/auth'
import { auth, db } from '../../utils/firebase'
import { setDoc, doc } from 'firebase/firestore'
import { toast } from 'react-toastify'
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'

const LoginModal = ({ modalIsOpen, closeModal }: any) => {
    const [loading, setLoading] = useState(false)
    const [registerForm, setRegisterForm] = useState(false)
    const [passwordVisible, setPasswordVisible] = useState(false)

    const togglePasswordVisibility = () => {
        setPasswordVisible(!passwordVisible)
    }

    const handleLogin = async (e: any) => {
        e.preventDefault()
        setLoading(true) // Show loading spinner

        const email = e.target[0].value
        const password = e.target[1].value

        try {
            const response: any = await signInWithEmailAndPassword(
                auth,
                email,
                password
            )

            toast.success('Successfully Logged In')
            sessionStorage.setItem('user', JSON.stringify(response.user))

            closeModal(false)

            // onAuth({ ...response.user.uid, secret: response.user.uid })
            // await updateProfile(response.user, { displayName: username })
        } catch (err: any) {
            toast.error(err.message)
            console.log(err)
            setLoading(false)
        } finally {
            setLoading(false)
        }
    }
    const handleRegister = async (e: any) => {
        e.preventDefault()
        setLoading(true) // Show loading spinner

        const username = e.target[0].value
        const email = e.target[1].value
        const password = e.target[2].value

        try {
            const response: any = await createUserWithEmailAndPassword(
                auth,
                email,
                password
            )

            await updateProfile(response.user, {
                displayName: username,
            })

            await setDoc(doc(db, 'users', response.user.uid), {
                displayName: username,
                email,
                id: response.user.uid,
            })

            await setDoc(doc(db, 'user-chat', response.user.uid), {
                chats: [],
            })

            await signInWithEmailAndPassword(auth, email, password)

            toast.success('Successfully Created Account')
            // sessionStorage.setItem('user', JSON.stringify(response.user))
            closeModal(false)
            setLoading(false)
            // alert('Account Created Successfully')
        } catch (err: any) {
            toast.error(err.message)
            console.log(err)
            setLoading(false)
        } finally {
            setLoading(false)
        }
    }
    return !registerForm ? (
        <Modal
            isOpen={modalIsOpen}
            onRequestClose={() => {
                closeModal(false)
                setRegisterForm(false)
                setLoading(false)
            }}
            contentLabel="Login Up"
            className="Modal"
            overlayClassName="Overlay"
        >
            <div className="modal-content">
                <button
                    className="close-button"
                    onClick={() => {
                        closeModal(false)
                        setRegisterForm(false)
                        setLoading(false)
                    }}
                >
                    <CloseIcon />
                </button>
                <img src={cocoaLogo} />
                <form className="login-form" onSubmit={(e) => handleLogin(e)}>
                    <label className="label">Email</label>
                    <input
                        type="text"
                        placeholder="Email"
                        required
                        defaultValue="rizwansweets@gmail.com"
                        style={{ marginBottom: '20px' }}
                    />

                    <label className="label">Password</label>
                    <div style={{ position: 'relative', marginBottom: '20px' }}>
                        <input
                            type={passwordVisible ? 'text' : 'password'}
                            placeholder="Password"
                            name="password"
                            defaultValue="rizwansweets123"
                            required
                            style={{ paddingRight: '30px' }}
                        />
                        <button
                            type="button"
                            onClick={togglePasswordVisibility}
                            style={{
                                position: 'absolute',
                                right: '10px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                            }}
                        >
                            {passwordVisible ? (
                                <RemoveRedEyeIcon />
                            ) : (
                                <VisibilityOffIcon />
                            )}
                        </button>
                    </div>

                    <Button
                        variant="contained"
                        type="submit"
                        className="login-button"
                        style={{ backgroundColor: '#5e239d' }}
                    >
                        {loading && <CircularProgress size={20} />}
                        Login
                    </Button>
                </form>
                <p className="authentication">
                    Don't have an account?{' '}
                    <span
                        style={{
                            cursor: 'pointer',
                            color: 'blue',
                        }}
                        onClick={() => setRegisterForm(true)}
                    >
                        Register Now
                    </span>
                </p>
            </div>
        </Modal>
    ) : (
        <Modal
            isOpen={modalIsOpen}
            onRequestClose={() => {
                setRegisterForm(false)
                closeModal(false)
                setLoading(false)
            }}
            contentLabel="Register"
            className="Modal"
            overlayClassName="Overlay"
        >
            <div className="modal-content">
                <button
                    className="close-button"
                    onClick={() => {
                        setRegisterForm(false)
                        closeModal(false)
                        setLoading(false)
                    }}
                >
                    <CloseIcon />
                </button>
                <img src={cocoaLogo} />
                <form className="login-form" onSubmit={handleRegister}>
                    <label className="label">Username</label>
                    <input
                        type="text"
                        placeholder="Username"
                        name="username"
                        required
                        style={{ marginBottom: '20px' }}
                    />
                    <label className="label">Email</label>
                    <input
                        type="text"
                        placeholder="Email"
                        name="email"
                        required
                        style={{ marginBottom: '20px' }}
                    />
                    <label className="label">Password</label>
                    <div style={{ position: 'relative', marginBottom: '20px' }}>
                        <input
                            type={passwordVisible ? 'text' : 'password'}
                            placeholder="Password"
                            name="password"
                            required
                            style={{ paddingRight: '30px' }}
                        />
                        <button
                            type="button"
                            onClick={togglePasswordVisibility}
                            style={{
                                position: 'absolute',
                                right: '10px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                            }}
                        >
                            {passwordVisible ? (
                                <RemoveRedEyeIcon />
                            ) : (
                                <VisibilityOffIcon />
                            )}
                        </button>
                    </div>

                    <Button
                        variant="contained"
                        type="submit"
                        className="login-button"
                        style={{ backgroundColor: '#5e239d' }}
                    >
                        {loading && <CircularProgress size={20} />}
                        Register
                    </Button>
                </form>
                <p className="authentication">
                    Already have an account?{' '}
                    <span
                        style={{
                            cursor: 'pointer',
                            color: 'blue',
                        }}
                        onClick={() => setRegisterForm(false)}
                    >
                        Login Now
                    </span>
                </p>
            </div>
        </Modal>
    )
}

export default LoginModal
