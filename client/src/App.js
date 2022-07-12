import React from 'react'
import './App.css';
import { BrowserRouter as Router } from 'react-router-dom';


const App = () => {
  return (
    <div className='App'>
      <Router>
        <AnimatedRoutes />
      </Router>
    </div>
  )
}

export default App