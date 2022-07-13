import React from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Landing from '../pages/landing/Landing';
import { AnimatePresence } from 'framer-motion'


function AnimatedRoutes() {
    const location = useLocation();
    return (
        <AnimatePresence>
            <Routes location={location} key={location.pathname}>
                <Route path="*" element={<Error />} />
                <Route path="/" element={<Landing />} />
                <Route path="/signin" element={<Signin />} />
                <Route path="/app" element={<Main />}>
                    <Route path="/app/home" element={<Home />} />
                    <Route path="/app/myFiles" element={<MyFiles />} />
                    <Route path="/app/myFiles/desc" element={<Desc />} />
                </Route>
            </Routes>
        </AnimatePresence>
    )
}