import React from 'react'
import { useEffect, useContext } from 'react'
import { UserContext } from '../utils/UserContext'
import { magic } from '../utils/magic';
import { useNavigate, useSearchParams } from 'react-router-dom'

function Callback(props) {
  let navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [user, setUser] = useContext(UserContext);

  useEffect(() => {
    finishEmailRedirectLogin();
  },[])
  
  // `loginWithCredential()` returns a didToken for the user logging in
  const finishEmailRedirectLogin = () => {
    let magicCredential = searchParams.get('magic_credential');
    console.log(magicCredential);
    if (magicCredential)
      magic.auth.loginWithCredential().then((didToken) => authenticateWithServer(didToken));
  };

  // Send token to server to validate
  const authenticateWithServer = async (didToken) => {
    let res = await fetch(`${process.env.REACT_APP_SERVER_URL}/api/login`, {
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
      navigate('/app/home');
    }
  };

  return (
    <div>Loading</div>
  )
}

export default Callback