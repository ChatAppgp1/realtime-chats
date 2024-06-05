import { 
    signInWithEmailAndPassword, 
    signInWithPopup, 
    GoogleAuthProvider 
  } from 'firebase/auth';
  import { doc, getDoc, setDoc } from 'firebase/firestore';
  import { auth, db } from '../firebaseConfig/firebaseConfig';
  import GoogleButton from 'react-google-button';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
  
  const googleProvider = new GoogleAuthProvider();
  googleProvider.setCustomParameters({
    prompt: 'select_account'
  });

  export default function Login() {
    const [err, setErr] = useState(false);
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const navigate = useNavigate();
  
    const handleGoogleLogin = async () => {
      setIsLoggingIn(true);
      setErr(null);
      try {
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;
  
        if (user) {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          let userData;
  
          if (userDoc.exists()) {
            userData = userDoc.data();
          } else {
            // First-time Google sign-in, create a new user document
            userData = {
              uid: user.uid,
              displayName: user.displayName,
              email: user.email,
              photoURL: user.photoURL,
            };
            await setDoc(doc(db, "users", user.uid), userData);
            await setDoc(doc(db, "userChats", user.uid), { chats: [] });
          }
  
          localStorage.setItem('user', JSON.stringify(userData));
          navigate('/');
        } else {
          throw new Error('No user data available');
        }
      } catch (error) {
        console.error(error);
        if (error.code === 'auth/popup-closed-by-user') {
          setErr('Google sign-in was cancelled');
        } else if (error.code === 'auth/network-request-failed') {
          setErr('Network error. Please check your connection.');
        } else {
          setErr(error.message || 'An error occurred during Google sign-in');
        }
      }
      setIsLoggingIn(false);
    };
  
    const handleLogin = async (e) => {
      e.preventDefault();
      setIsLoggingIn(true);
      setErr(null);
      const email = e.currentTarget[0].value;
      const password = e.currentTarget[1].value;
  
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
  
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          localStorage.setItem('user', JSON.stringify({
            uid: user.uid,
            displayName: userData.displayName,
            email: userData.email,
            photoURL: userData.photoURL,
          }));
  
          navigate('/');
        } else {
          console.error('User data not found');
          setErr('User data not found. Please try again or contact support.');
        }
      } catch (err) {
        console.error(err);
        if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
          setErr('Invalid email or password');
        } else if (err.code === 'auth/too-many-requests') {
          setErr('Too many attempts. Please try again later.');
        } else {
          setErr('An error occurred. Please try again.');
        }
      }
      setIsLoggingIn(false);
    };
  
    return (
      <div className='bg-black mx-auto p-3 pt-4' style={{minWidth:"60%", maxWidth:"100%", borderRadius:"8%"}}>
        <h1 style={{textAlign:"center"}}>Log in</h1>
        <form onSubmit={handleLogin}>
          <br/>
          <div className="form-group" style={{textAlign:'left'}}>
            <label>Email</label>
            <input
              type="email"
              className='form-control'
              placeholder='Enter your email'
              required
            />
          </div>
          <br/>
          <div className="form-group" style={{textAlign:'left'}}>
            <label>Password</label>
            <input
              type="password"
              className='form-control'
              placeholder='Password'
              required
            />
          </div>
          <br/>
          <button 
            className='btn btn-primary' 
            type='submit' 
            disabled={isLoggingIn}
          >
            {isLoggingIn ? 'Logging in...' : 'Log in'}
          </button>
        </form>
        {err && <span style={{color: 'red'}}>{err}</span>}
        <p>Don't have an account? <Link to='/register'>Sign up</Link></p>
  
        <div style={{paddingTop: 20, display: 'flex', justifyContent: 'center'}}>
          <GoogleButton
            onClick={handleGoogleLogin}
            disabled={isLoggingIn}
            label={isLoggingIn ? 'Signing in...' : 'Sign in with Google'}
          />
        </div>
      </div>
    );
  }