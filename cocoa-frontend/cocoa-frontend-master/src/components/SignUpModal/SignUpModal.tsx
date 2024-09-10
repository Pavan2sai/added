import React from 'react'
import Modal from 'react-modal'
import './SignUpModal.css'

const SignUpModal = ({ modalIsOpen, closeModal }: any) => {
    return (
        <Modal
            isOpen={modalIsOpen}
            onRequestClose={closeModal}
            contentLabel="Sign Up"
            className="Modal"
            overlayClassName="Overlay"
        >
            <div className="modal-content">
                <h2>Be one of us!</h2>
                <h3>SIGN UP</h3>
                <form className="signup-form">
                    <input type="text" placeholder="First Name" required />
                    <input type="text" placeholder="Last Name" required />
                    <input type="password" placeholder="Password" required />
                    <input
                        type="password"
                        placeholder="Confirm Password"
                        required
                    />
                    <input type="email" placeholder="Email id" required />
                    <input type="text" placeholder="Code" required />
                    <label className="terms">
                        <input type="checkbox" required /> Hereby, I agree to
                        the Terms & Conditions and Privacy Policy
                    </label>
                    <button type="submit" className="register-button">
                        Register
                    </button>
                </form>
                <p>
                    Already have an account? <a href="#">Login now</a>
                </p>
            </div>
        </Modal>
    )
}

export default SignUpModal
