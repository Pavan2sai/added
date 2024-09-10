// src/components/HomeBody.js
import React from 'react'
import './HomeBody.css'
import HeaderImage from '../../assets/img/header2.png'
import BusinessModalImage from '../../assets/img/home1.png'
import Restaurant from '../../assets/img/restaurant.png'
import Supplier from '../../assets/img/supplier.png'
import Competitor from '../../assets/img/competitors.png'
import KeySuppliers from '../../assets/img/keySuppliers.png'
import MarketSize from '../../assets/img/marketSize.png'
import Trend from '../../assets/img/trend.png'
import CEO from '../../assets/img/Ceo.png'
import CTO from '../../assets/img/cto.png'
import EngineeringHead from '../../assets/img/engineeringHead.png'
import OperationsHead from '../../assets/img/operationsHead.png'
import GraphicsDesigner from '../../assets/img/Designer.png'
import Footer from '../Footer/Footer'

const HomeBody = ({ openModal, toggleBtn, setToggleBtn }: any) => {
    return (
        <div className="main-content">
            <section className="hero">
                <div className="hero-text">
                    <p>
                        COCOA, A project of Korabyte Technologies, is a
                        groundbreaking eCommerce platform designed to streamline
                        the supply chain between suppliers and restaurants. By
                        leveraging advanced technology, COCOA aims to reduce
                        costs, improve efficiency, and enhance the quality of
                        service in the food industry.
                    </p>
                    <div className="hero-buttons">
                        <button
                            className="supplier-btn"
                            onClick={() => openModal()}
                        >
                            Supplier
                        </button>
                        <button
                            onClick={() => openModal()}
                            className="restaurant-btn"
                        >
                            Restaurant
                        </button>
                    </div>
                </div>
                <div className="hero-image-container">
                    <img
                        src={HeaderImage}
                        alt="Hero Illustration"
                        className="hero-image"
                    />
                </div>
            </section>
            <section className="business-model">
                <div className="business-content">
                    <div className="business-image">
                        <img
                            src={BusinessModalImage}
                            alt="Business Model"
                            className="section-image"
                        />
                    </div>
                    <div className="business-text">
                        <h2>Business Model</h2>
                        <p>
                            COCOA operates as a B2B marketplace where suppliers
                            list their products and restaurants place orders. It
                            generates revenue through transaction fees,
                            subscription models, and premium services.
                        </p>
                        <div className="value-propositions">
                            <h3>Unique Value Propositions</h3>
                            <ul>
                                <li>
                                    <strong>For Suppliers:</strong> Increased
                                    market reach, streamlined order management,
                                    and data analytics for demand forecasting.
                                </li>
                                <li>
                                    <strong>For Customers:</strong> Access to a
                                    wide range of suppliers, competitive
                                    pricing, and simplified procurement
                                    processes.
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            <section className="financial-implication">
                <h2>Financial Implication</h2>

                <div className="financial-stats">
                    <div>
                        <h3>133</h3>
                        <p>Acquired LOIs</p>
                    </div>
                    <div>
                        <h3>$500K</h3>
                        <p>Fund Required</p>
                    </div>
                    <div>
                        <h3>$1M</h3>
                        <p>1st Year Rev. Projection</p>
                    </div>
                    <div>
                        <h3>$5M</h3>
                        <p>2nd Year Rev. Projection</p>
                    </div>
                    <div>
                        <h3>$3M</h3>
                        <p>3rd Year Rev. Projection</p>
                    </div>
                </div>
            </section>
            <section className="targeted-market">
                <h2>Targeted Market</h2>
                <div className="market-segments">
                    <div className="market-segment">
                        <img
                            src={Supplier}
                            alt="Suppliers"
                            className="segment-image"
                        />
                        <h3>Suppliers</h3>
                        <p>
                            Local market, distributors, general traders,
                            importers, wholesalers, and manufacturers of food
                            products.
                        </p>
                    </div>
                    <div className="market-segment">
                        <img
                            src={Restaurant}
                            alt="Restaurants"
                            className="segment-image"
                        />
                        <h3>Restaurants</h3>
                        <p>
                            Independent restaurants, small anchors, and food
                            services businesses across Canada.
                        </p>
                    </div>
                    <div className="market-segment">
                        <img
                            src={MarketSize}
                            alt="Market Size"
                            className="segment-image"
                        />
                        <h3>Market Size</h3>
                        <p>
                            The Canadian food service industry is valued at over
                            $90 billion annually, with a significant portion
                            spent on supplies.
                        </p>
                    </div>
                    <div className="market-segment">
                        <img
                            src={KeySuppliers}
                            alt="Key Competitors"
                            className="segment-image"
                        />
                        <h3>Key Competitors</h3>
                        <p>
                            Traditional distributors, wholesalers, and other
                            eCommerce platforms targeting HORECA industry.
                        </p>
                    </div>
                    <div className="market-segment">
                        <img
                            src={Competitor}
                            alt="Competitive Advantage"
                            className="segment-image"
                        />
                        <h3>Competitive Advantage</h3>
                        <p>
                            Real-time inventory management, focus on local
                            suppliers and sustainable practices, robust customer
                            support.
                        </p>
                    </div>
                    <div className="market-segment">
                        <img
                            src={Trend}
                            alt="Trends & Opportunities"
                            className="segment-image"
                        />
                        <h3>Trends & Opportunities</h3>
                        <p>
                            Growing demand for sustainable products, increasing
                            adoption of technology to reduce food wastage.
                        </p>
                    </div>
                </div>
            </section>
            <section className="management-team">
                <h2>LEADERSHIP</h2>
                <div className="leaders">
                    <div className="leader">
                        <img src={CEO} alt="Leader 1" />
                        <p style={{ fontWeight: 600 }}>Syed Ibn-e-Ali</p>
                        <p>CEO</p>
                    </div>
                    <div className="leader">
                        <img src={CTO} alt="Leader 2" />
                        <p style={{ fontWeight: 600 }}>S. Majid Ul Hassan</p>
                        <p>CTO</p>
                    </div>
                </div>
                <h2>TEAM</h2>
                <div className="team">
                    <div className="team-member">
                        <img src={EngineeringHead} alt="Member 1" />
                        <p style={{ fontWeight: 600 }}>Bilal Arif Siddiqui</p>
                        <p>Engineering Head</p>
                    </div>
                    <div className="team-member">
                        <img src={OperationsHead} alt="Member 2" />
                        <p style={{ fontWeight: 600 }}>Syeda Sakina Ali</p>
                        <p>Operations Head</p>
                    </div>
                    <div className="team-member">
                        <img src={GraphicsDesigner} alt="Member 3" />
                        <p style={{ fontWeight: 600 }}>Hassan Zubair</p>
                        <p>Graphic Designer</p>
                    </div>
                </div>
            </section>
            <Footer />
        </div>
    )
}

export default HomeBody
