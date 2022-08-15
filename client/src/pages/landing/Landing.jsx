import React, { useContext,useEffect } from 'react'
import './Landing.css'
import landing_gradient from '../../assets/images/landing-gradient2.png'
import feature_gradient from '../../assets/images/landing-center.png'
import Aos from "aos"
import "aos/dist/aos.css"
import { useNavigate } from "react-router-dom";
import rings from '../../assets/images/rings.png'
import { UserContext } from '../../utils/UserContext'
import app_logo from '../../assets/icons/app-logo.png'
import sheild_gif from '../../assets/images/security.gif'
import cube_gif from '../../assets/images/fragments.gif'
import landing_left from '../../assets/images/landing-left.png'
import landing_right from '../../assets/images/landing-right.png'
import globe from '../../assets/images/new-globe.png'
import map from '../../assets/images/map.png'
import discord_logo from '../../assets/icons/discord.png'
import { motion } from 'framer-motion'



function Landing() {
    const navigate = useNavigate();
    const [user, setUser] = useContext(UserContext);
  
    useEffect(()=>{
        Aos.init({duration:1000})
    },[]);

    return (
        <motion.div className='landing-con' 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}>
            <img src={rings} alt="" className='rings' />
            <img src={landing_gradient} alt="" className='landing-gradient' />
            <img src={feature_gradient} alt="" className='landing-center' />
            <div className="landing-navbar">
                <div className="logo-box">
                    <img src={app_logo} alt="" />
                    <p>Storz</p>
                </div>
                <div className="sign-up-btn" onClick={() => { user && user.issuer ? navigate('/app/home') : navigate('/signin') }}>
                    <p>{(user && user.issuer ? "Upload files" : "Sign in")}</p>
                </div>
            </div>
            <div className="hero-con" >
                <div className="left-con">
                    <p className='hero-con-head'>The <span className='gradient-text'>Future</span> of File Sharing is Here
                    </p>
                    <p className="hero-desc">
                        Store unlimited files and share it seamlessly with anyone.
                    </p>
                    <div className="btn-con">
                        <div className="use-btn landing-btn" onClick={() => { user && user.issuer ? navigate('/app/home') : navigate('/signin') }}>
                            <span>Use Now </span>
                        </div>
                        <div className="join-btn landing-btn">
                        <a href="https://discord.gg/eMaEFEBbfN" className='join-link'  target="_blank" rel='noreferrer'>
                        Join Us  
                        </a>
                        </div>
                    </div>
                </div>
                <div className="right-con">
                    <img src={globe} alt="Globe" />
                </div>
            </div>


            <div className="feature-con"  >
                <img className="feature-img" src={sheild_gif} alt="" data-aos="zoom-in"/>

                <div className="feature-desc" data-aos="fade-up">
                    <h1> <span>Privacy</span> First.</h1>
                    <h1> Completely <span>Secured.</span></h1>
                    <p>
                        Storz uses AES-256 bit password encryption to protect your data from hackers and malicious agents. Storz will keep your data safe behind trillions of lock combinations.
                    </p>
                </div>
            </div>


            <div className="feature-con" id='spcl' >
                <div className="feature-desc" data-aos="fade-up">
                    <h1><span>Decentralized.</span> </h1>
                    <h1>Super <span>Fast</span> & <span>Reliable.</span></h1>
                    <p>
                        Storz uses InterPlanetary File System (IPFS), a high-performance, distributed server network protocol. Your data is chopped into smaller chunks of itself, then hashed and stored.                    </p>
                </div>

                <img src={feature_gradient} alt="" className='landing-center' id='hidden-gradient' />
                <img className="feature-img" src={cube_gif} alt="" data-aos="zoom-in"/>
            </div>


            <div className='joinus-con' data-aos="fade-up">
                <h1>Join Our Community!</h1>
                <p >Help us on our quest to make this product even better.</p>
                <div className="use-btn landing-btn">
                    <span> <a href="https://discord.gg/eMaEFEBbfN" className='join-link-b'  target="_blank" rel='noreferrer'>
                        Join Us  
                        </a></span>
                </div>
                <img src={map} alt="" />
            </div>


            <div className="footer-con">
                    <div className='logo-box'>
                        <img src={app_logo} alt="" />
                    </div>
                    <p>©2022 Storz</p>
                    <a href="https://discord.gg/eMaEFEBbfN" className='join-link'  target="_blank" rel='noreferrer'><img className='disc' src={discord_logo} alt="" /></a>
                    
            </div>
        </motion.div>
    )
}

export default Landing