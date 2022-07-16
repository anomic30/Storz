import React, { useState, useEffect, useContext } from 'react'
import './Signin.css'
import signin_gradient from '../../assets/images/signin-gradient.png'
import email_icon from '../../assets/icons/email.png'
import user_icon from '../../assets/icons/user.png'
import { UserContext } from '../../utils/UserContext'
import { useNavigate } from 'react-router-dom'
import { magic } from '../../utils/magic';
import app_logo from '../../assets/icons/app-logo.png'
import Axios from 'axios';
import { motion } from 'framer-motion'

function Signin() {
  const navigate = useNavigate();

  const [disabled, setDisabled] = useState(false);
  const [email, setEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [newUser, setNewUser] = useState(false)
  const [user, setUser] = useContext(UserContext);

  useEffect(() => {
    user && user.issuer && navigate('/app/home');
  }, [user, navigate]);


  const handleLogin = async () => {
    try {
      setDisabled(true); // disable login button to prevent multiple emails from being triggered

      // Trigger Magic link to be sent to user
      let didToken = await magic.auth.loginWithMagicLink({
        email,
      });

      // Validate didToken with server
      const res = await fetch(`${process.env.REACT_APP_SERVER_URL}/api/user/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + didToken,
        },
      });

      if (res.status === 200) {
        // Set the UserContext to the now logged in user
        let userMetadata = await magic.user.getMetadata();
        await setUser(userMetadata);
        let newDidToken = await magic.user.getIdToken({ lifespan: 24 * 60 * 60 * 7 });
        window.localStorage.setItem("didToken", newDidToken);
        // cookie.set("didToken", newDidToken);
        await Axios.post(`${process.env.REACT_APP_SERVER_URL}/api/user/create`, { magic_id: userMetadata.issuer, user_name: userName }, { headers: { Authorization: 'Bearer ' + window.localStorage.getItem("didToken") } }).then((res) => {
          console.log(res.data);
        }).catch((err) => {
          console.log(err);
        })

        await Axios.get(`${process.env.REACT_APP_SERVER_URL}/api/user/getName/${userMetadata.issuer}`).then(res => {
          window.localStorage.setItem("userName", res.data.user_name);  
        })

        console.log(userMetadata);
        navigate('/app/home');
      }
    } catch (error) {
      setDisabled(false); // re-enable login button - user may have requested to edit their email
      console.log(error);
    }
  }

  return (
    <motion.div className='signin-con'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}>
      <img src={signin_gradient} alt="" className='signin-gradient' />
      <div className='login-storz'>
        <a href="/">
          <img id="app-logo" src={app_logo} alt="" />
          <p>Storz</p>
        </a>
      </div>

      {(!newUser) ? <>
        <div className="signin-box">
          <div id="box-mid">
            <h2>Login</h2>
            <p>Login with your email</p>
          </div>
          <div className="inp-box">
            <img src={email_icon} alt="" />
            <input type="text" placeholder="Email" onChange={(e) => { setEmail(e.target.value) }} />
          </div>

          {!disabled && <div className="signin-btn" onClick={handleLogin}>Login</div>}
        </div>
      </> : <>
        <div className="signin-box">
          <div id="box-mid">
            <h2>Sign Up</h2>
            <p>Create a new account with your email</p>
          </div>
          <br />
          <div className="inp-box">
            <img src={user_icon} alt="" />
            <input type="text" placeholder="Name" onChange={(e) => { setUserName(e.target.value) }} />
          </div>
          <div className="inp-box">
            <img src={email_icon} alt="" />
            <input type="text" placeholder="Email" onChange={(e) => { setEmail(e.target.value) }} />
          </div>
          <br />
          {!disabled && <div className="signin-btn" onClick={handleLogin}>Sign Up</div>}
        </div>
      </>}
      {(!newUser) ? <>
        <div className='signup-alt'>Don't have an account yet? <span id="go-green" onClick={() => {
          setNewUser(true);
        }}>Sign Up</span>
        </div>
      </> : <>
        <div className='signup-alt'>Already have an account? <span id="go-green" onClick={() => {
          setNewUser(false);
        }}>Login</span>
        </div>
      </>}
      <footer>
        ©2022 Storz
      </footer>
    </motion.div>
  )
}

export default Signin