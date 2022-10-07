import React, { useState, useEffect, useContext, useRef } from "react";
import "./Signin.css";
import signin_gradient from "../../assets/images/signin-gradient.png";
import email_icon from "../../assets/icons/email.png";
import user_icon from "../../assets/icons/user.png";
import { UserContext } from "../../utils/UserContext";
import { useNavigate } from "react-router-dom";
import { magic } from "../../utils/magic";
import app_logo from "../../assets/icons/app-logo.png";
import Axios from "axios";
import { motion } from "framer-motion";
import loadingg from "../../assets/images/loadingg.svg";
import toast, { Toaster } from "react-hot-toast";

function Signin() {
  const navigate = useNavigate();
  const inpRef = useRef(null);

  const [disabled, setDisabled] = useState(false);
  const [email, setEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [newUser, setNewUser] = useState(false);
  const [user, setUser] = useContext(UserContext);

  useEffect(() => {
    user && user.issuer && navigate("/app/home");
  }, [user, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    document.activeElement.blur();

    if (email === "") {
      toast((t) => <span>Please fill all the fields!</span>, {
        icon: "❌",
        style: {
          borderRadius: "5px",
          background: "#333",
          color: "#c8c8c8",
        },
      });
      return;
    }
    try {
      setDisabled(true); // disable login button to prevent multiple emails from being triggered

      if (!newUser) {
        const check = await Axios.post(
          `${process.env.REACT_APP_SERVER_URL}/api/user/check`,
          { email }
        );
        console.log(check.data.message);
        if (check.data.message === "user_not_found") {
          toast((t) => <span>Please Sign Up first!</span>, {
            icon: "⚠️",
            style: {
              borderRadius: "5px",
              background: "#333",
              color: "#c8c8c8",
            },
          });
          inpRef.current.value = "";
          setDisabled(false);
          return;
        }
      }

      // Trigger Magic link to be sent to user
      let didToken = await magic.auth.loginWithMagicLink({
        email,
      });

      // Validate didToken with server
      const res = await fetch(
        `${process.env.REACT_APP_SERVER_URL}/api/user/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + didToken,
          },
        }
      );

      if (res.status === 200) {
        // Set the UserContext to the now logged in user
        let userMetadata = await magic.user.getMetadata();
        await setUser(userMetadata);
        let newDidToken = await magic.user.getIdToken({
          lifespan: 24 * 60 * 60 * 7,
        });
        window.localStorage.setItem("didToken", newDidToken);
        // cookie.set("didToken", newDidToken);
        await Axios.post(
          `${process.env.REACT_APP_SERVER_URL}/api/user/create`,
          { magic_id: userMetadata.issuer, user_name: userName, email: email },
          {
            headers: {
              Authorization:
                "Bearer " + window.localStorage.getItem("didToken"),
            },
          }
        )
          .then((res) => {
            console.log(res.data);
          })
          .catch((err) => {
            console.log(err);
          });

        await Axios.get(
          `${process.env.REACT_APP_SERVER_URL}/api/user/getName/${userMetadata.issuer}`
        ).then((res) => {
          window.localStorage.setItem("userName", res.data.user_name);
        });

        console.log(userMetadata);
        navigate("/app/home");
      }
    } catch (error) {
      setDisabled(false); // re-enable login button - user may have requested to edit their email
      console.log(error);
    }
  };

  return (
    <motion.div
      className="signin-con"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Toaster />
      <img src={signin_gradient} alt="" className="signin-gradient" />
      <div className="login-storz">
        <div onClick={() => navigate("/")}>
          <img id="app-logo" src={app_logo} alt="" />
          <p>Storz</p>
        </div>
      </div>

      {!newUser ? (
        <>
          <form className="signin-box" onSubmit={handleLogin}>
            <div id="box-mid">
              <h2>Login</h2>
              <p>Login with your email</p>
            </div>

            {disabled && (
              <img src={loadingg} alt="Loading" className="loadingg" />
            )}

            <div className="inp-box">
              <img src={email_icon} alt="" />
              <input
                ref={inpRef}
                type="text"
                placeholder="Email"
                onChange={(e) => {
                  setEmail(e.target.value);
                }}
              />
            </div>

            {!disabled && (
              <button type="submit" className="signin-btn">
                Login
              </button>
            )}
          </form>
        </>
      ) : (
        <>
          <form className="signin-box" onSubmit={handleLogin}>
            <div id="box-mid">
              <h2>Sign Up</h2>
              <p>Create a new account with your email</p>
            </div>
            <br />
            <div className="inp-box">
              <img src={user_icon} alt="" />
              <input
                type="text"
                placeholder="Name"
                onChange={(e) => {
                  setUserName(e.target.value);
                }}
              />
            </div>
            <div className="inp-box">
              <img src={email_icon} alt="" />
              <input
                type="text"
                defaultValue={email}
                placeholder="Email"
                onChange={(e) => {
                  setEmail(e.target.value);
                }}
              />
            </div>
            <br />
            {!disabled && (
              <button type="submit" className="signin-btn">
                Sign Up
              </button>
            )}
          </form>
        </>
      )}
      {!newUser ? (
        <>
          <div className="signup-alt">
            Don't have an account yet?{" "}
            <span
              id="go-green"
              onClick={() => {
                setNewUser(true);
              }}
            >
              Sign Up
            </span>
          </div>
        </>
      ) : (
        <>
          <div className="signup-alt">
            Already have an account?{" "}
            <span
              id="go-green"
              onClick={() => {
                setNewUser(false);
              }}
            >
              Login
            </span>
          </div>
        </>
      )}
      <footer>©2022 Storz</footer>
    </motion.div>
  );
}

export default Signin;
