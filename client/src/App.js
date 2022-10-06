import './App.css';
import { BrowserRouter as Router} from 'react-router-dom';

import { UserContext } from './utils/UserContext';
import { magic } from './utils/magic';
import { useEffect, useState } from 'react';

import Cookies from 'universal-cookie';
import AnimatedRoutes from '../src/components/AnimatedRoutes'

function App() {
  const cookie = new Cookies();
  const [user, setUser] = useState();

  async function setCredentials(userData) {
    setUser(userData);
    if (!window.localStorage.getItem("didToken")) {
      let newDidToken = await magic.user.getIdToken({lifespan: 24*60*60});
      window.localStorage.setItem("didToken", newDidToken);
    }
  }

  // If isLoggedIn is true, set the UserContext with user data
  // Otherwise, set it to {user: null}
  useEffect(() => {
    setUser({ loading: true });
    magic.user.isLoggedIn().then((isLoggedIn) => {
      return isLoggedIn
        ? magic.user.getMetadata().then((userData) => setUser(userData))
        : setUser({ user: null });
    });
  }, []);

  return (
    <div className="App">
      <UserContext.Provider value={[user, setUser]}>
        <Router>
            <AnimatedRoutes/>
        </Router>
      </UserContext.Provider>
    </div>
  );
}

export default App;
