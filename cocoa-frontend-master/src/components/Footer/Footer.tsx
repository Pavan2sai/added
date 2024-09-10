import React from 'react'
import './Footer.css'
import facebookIcon from '../../assets/img/facebook-icon.png'
import twitterIcon from '../../assets/img/twitter-icon.png'
import linkedinIcon from '../../assets/img/linkedin-icon.png'

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-container">
                <div className="footer-column">
                    <h4>About COCOA</h4>
                    <p>
                        Revolutionize the food supply chain by providing an
                        efficient, transparent, and user-friendly platform that
                        connects suppliers directly with restaurants.
                    </p>
                </div>

                <div className="footer-column">
                    <h4>Contact Us</h4>
                    <p>Malaysia, Canada</p>
                    <p>+60152122714</p>
                    <p>
                        <a href="mailto:ctb@cocoa-app.com">ctb@cocoa-app.com</a>
                    </p>
                </div>
                <div className="footer-column">
                    <h4>Subscribe</h4>
                    <p>Follow our newsletter to stay updated about us.</p>
                    <form>
                        <input type="email" placeholder="Email Address" />
                        <button type="submit">Subscribe</button>
                    </form>
                </div>
            </div>
            <div className="footer-bottom">
                <p>&copy; 2024 COCOA - Powered by Korabyte Inc. Canada</p>
                <div className="footer-social">
                    <a href="https://www.facebook.com">
                        <img src={facebookIcon} alt="Facebook" />
                    </a>
                    <a href="https://www.twitter.com">
                        <img src={twitterIcon} alt="Twitter" />
                    </a>
                    <a href="https://www.linkedin.com">
                        <img src={linkedinIcon} alt="LinkedIn" />
                    </a>
                </div>
            </div>
        </footer>
    )
}

export default Footer
