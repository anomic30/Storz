import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import Landing from "../pages/landing/Landing";
import Signin from "../pages/signin/Signin";
import Main from "../pages/main/Main";
import Home from "../pages/home/Home";
import MyFiles from "../pages/myFiles/MyFiles";
import Callback from "../pages/Callback";
import Error from "../pages/error/Error";
import Desc from "../components/file-desc/Desc";
import { AnimatePresence } from "framer-motion";

function AnimatedRoutes() {
  const location = useLocation();
  const [logoutModal, setLogoutModal] = useState(false);

  return (
    <AnimatePresence exitBeforeEnter>
      <Routes location={location} key={location.pathname}>
        <Route path="*" element={<Error />} />
        <Route path="/" element={<Landing />} />
        <Route path="/signin" element={<Signin />} />
        <Route path="/callback" element={<Callback />} />
        <Route path="/app" element={<Main setLogoutModal={setLogoutModal} logoutModal={logoutModal} />} >
          <Route path="/app/home" element={<Home logoutModal={logoutModal} />} />
          <Route path="/app/myFiles" element={<MyFiles logoutModal={logoutModal} />} />
          <Route path="/app/myFiles/desc" element={<Desc />} />
        </Route>
      </Routes>
    </AnimatePresence>
  );
}

export default AnimatedRoutes;