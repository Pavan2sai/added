import React, { useEffect, useState } from 'react'
import { Header, HomeBody, LoginModal, Notification } from '../../components'
import { ProductSection } from '../../screens'
import './Home.css'
import { onAuthStateChanged } from 'firebase/auth'
import { auth, db } from '../../utils/firebase'
import { useUserStore } from '../../utils/userStore'

function MainScreen() {
    const [modalIsOpen, setModalIsOpen] = useState(false)
    const [toggleBtn, setToggleBtn] = useState(false)
    // const [user, setUser] = useState<any>(null)

    const { currentUser, isLoading, fetchUserInfo } = useUserStore()

    useEffect(() => {
        const unSub = onAuthStateChanged(auth, async (user: any) => {
            const storedUser = sessionStorage.getItem('user')

            fetchUserInfo(user && user.uid)
            // setUser(user)
        })

        return () => {
            unSub()
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fetchUserInfo])

    const openModal = () => {
        setModalIsOpen(true)
    }

    const closeModal = () => {
        setModalIsOpen(false)
    }

    return (
        <div className="app">
            <Notification />
            <Header
                openModal={openModal}
                toggleBtn={toggleBtn}
                setToggleBtn={setToggleBtn}
            />
            <LoginModal modalIsOpen={modalIsOpen} closeModal={closeModal} />
            <main className="mobile">
                {toggleBtn ? (
                    <HomeBody
                        openModal={openModal}
                        toggleBtn={toggleBtn}
                        setToggleBtn={setToggleBtn}
                    />
                ) : (
                    <ProductSection />
                )}
            </main>
            <main className="desktop">
                <HomeBody
                    openModal={openModal}
                    toggleBtn={toggleBtn}
                    setToggleBtn={setToggleBtn}
                />
                <ProductSection />
            </main>
        </div>
    )
}

export default MainScreen
