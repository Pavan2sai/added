import './ProductModal.css'
import { BACKEND_URL } from '../../constant'
import { Button } from '@mui/material'
import { useUserStore } from '../../utils/userStore'

const ProductModal = ({ isOpen, onClose, product, handleTabChange }: any) => {
    const { setProductCard, setChatWindowTab } = useUserStore()

    const { currentUser } = useUserStore()
    if (!isOpen) return null

    const handleChat = (e: any) => {
        onClose()
        setProductCard(product)
        setChatWindowTab(true)
        handleTabChange(e, 1)
    }

    return (
        <div className="modal-overlay">
            <div className="modal-content-product">
                <button className="modal-close" onClick={onClose}>
                    X
                </button>
                <div className="modal-body">
                    <div className="modal-left">
                        <img
                            src={`${BACKEND_URL}/images/` + product.MainImage}
                            alt="Product"
                            className="modal-image"
                        />
                    </div>
                    <div className="modal-right">
                        <h2>{product.ProductName}</h2>
                        <p>{product.Description}</p>
                        <p>
                            <strong>Price:</strong> {product.UnitPrice}/
                            {product.UOM}
                        </p>

                        <Button
                            variant="contained"
                            className="chatWithSupplier-btn"
                            onClick={(e) => handleChat(e)}
                            disabled={currentUser !== null ? false : true}
                        >
                            Chat with supplier
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ProductModal
