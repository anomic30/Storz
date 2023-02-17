import React, { useContext } from 'react'
import './Main.css'
import { Outlet, useNavigate } from 'react-router-dom'
import Navbar from '../../components/navbar/Navbar'
import { UserContext } from '../../utils/UserContext'
import { useEffect } from 'react'

function Main({ setLogoutModal, logoutModal }) {
  const navigate = useNavigate();
  const [user] = useContext(UserContext);

  useEffect(() => {
    if (!user) {
      navigate("/signin");
    }
  }, [navigate, user]);

  return (
    <div className="Main">
      <Navbar setLogoutModal={setLogoutModal} logoutModal={logoutModal} />
      <Outlet />
    </div>
  );
}

export default Main