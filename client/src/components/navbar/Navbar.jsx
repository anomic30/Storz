import React, { useContext, useState } from "react";
import "./Navbar.css";
import { NavLink, useNavigate } from "react-router-dom";
import app_logo from "../../assets/icons/app-logo.png";
import home_icon from "../../assets/icons/home.png";
import files_icon from "../../assets/icons/files.png";
import shared_icon from "../../assets/icons/shared.png";
import logout_icon from "../../assets/icons/logout.png";
import { UserContext } from "../../utils/UserContext";
import { magic } from "../../utils/magic";
import Cookies from "universal-cookie";
import Axios from "axios";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";

function Navbar({ setLogoutModal, logoutModal }) {
  const navigate = useNavigate();
  const cookie = new Cookies();

  const [user, setUser] = useContext(UserContext);

  const logout = () => {
    magic.user.logout().then(() => {
      setUser({ user: null });
      window.localStorage.removeItem("didToken");
      // cookie.remove("didToken");
      navigate("/");
    });
    setLogoutModal(false);
  };

  const logoutPopup = () => {
    setLogoutModal(true);
  };

  const cancelLogout = () => {
    setLogoutModal(false);
  };

  const testApi = async () => {
    Axios.post(
      `${process.env.REACT_APP_SERVER_URL}/test`,
      {},
      {
        headers: {
          Authorization: "Bearer " + window.localStorage.getItem("didToken"),
        },
      }
    )
      .then((res) => {
        alert(res.data);
      })
      .catch((err) => {
        alert(err);
      });
  };

  return (
    <nav>
      <div className="Navbar">
        <div className={`navbar-content ${logoutModal ? "bg-blur" : ""}`}>
          <div
            className="logo-box"
            onClick={() => {
              navigate("/");
            }}
          >
            <img src={app_logo} alt="" />
            <p>Storz</p>
          </div>
          <div className="right-con">
            <div className="link-box">
              <div className="link-con">
                {/* <img src={home_icon} alt="" /> */}
                <NavLink
                  to="/app/home"
                  style={({ isActive }) => ({
                    color: isActive ? "#FFFFFF" : "#C8C8C8",
                  })}
                >
                  Home
                </NavLink>
              </div>
              <div className="link-con">
                {/* <img src={files_icon} alt="" /> */}
                <NavLink
                  to="/app/myFiles"
                  style={({ isActive }) => ({
                    color: isActive ? "#FFFFFF" : "#C8C8C8",
                  })}
                >
                  Files
                </NavLink>
              </div>
              <div></div>
            </div>
            {/* <button onClick={testApi}>Test API</button> */}
            <Tippy content="Logout" placement="right">
              <div className="logout-btn" onClick={logoutPopup}>
                <img src={logout_icon} alt="" />
              </div>
            </Tippy>
          </div>
        </div>
        <div className={`${logoutModal ? "logout" : "hide"}`}>
          <p>Are you sure you want to log out?</p>
          <div>
            <button className="cancel_button" onClick={cancelLogout}>
              CANCEL
            </button>
            <button className="log-out_button" onClick={logout}>
              LOG OUT
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
