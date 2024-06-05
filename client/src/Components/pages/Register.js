import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import React, { useState } from 'react';
import { auth, db, storage } from '../firebaseConfig/firebaseConfig';
import profile from '../images/profile.jpg';
import { ref, getDownloadURL, uploadBytesResumable } from 'firebase/storage';
import { doc, setDoc } from "firebase/firestore";
import { Link, useNavigate } from 'react-router-dom';

const Register = ({ setUser, setAvatar }) => {
    const [err, setErr] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const navigate= useNavigate();
  
    const handleSignup = async (e) => {
      setLoading(true);
      setErr(false);
      setSuccess(false);
      e.preventDefault();
      const displayName = e.target[0].value.trim();
      const email = e.target[1].value.trim();
      const password = e.target[2].value;
      const file = e.target[3].files[0];
  
      if (!displayName || !email || !password || !file) {
        setErr('Please fill in all fields.');
        setLoading(false);
        return;
      }
      try {
        const res = await createUserWithEmailAndPassword(auth, email, password);
        const date = new Date().getTime();
        const storageRef = ref(storage, `users/${displayName + date}`);
  
        await uploadBytesResumable(storageRef, file).then(() => {
          getDownloadURL(storageRef).then(async (downloadURL) => {
            try {
              await updateProfile(res.user, {
                displayName,
                photoURL: downloadURL,
              });
          await setDoc(doc(db, "users", res.user.uid), {
          uid: res.user.uid,
          displayName,
          email,
          photoURL: downloadURL,
        });
        
        localStorage.setItem('user', JSON.stringify({
          uid: res.user.uid,
          displayName,
          email,
          photoURL: downloadURL,
        }));
      
              setUser(displayName); // Call setUser with the user's display name
              setAvatar(downloadURL); // Call setAvatar with the user's avatar URL
              setSuccess(true);
              setLoading(false);
             navigate("/")
            } catch (err) {
              console.log(err);
              setErr(true);
              setLoading(false);
            }
        
    });
  });
} catch (err) {
  setErr(true);
  setLoading(false);
}
};  
  
return (
    <div className='bg-black mx-auto p-4' style={{ marginTop: 5, minWidth: "30%", maxWidth: "90%",maxHeight:"98%", borderRadius: "8%",overflow:"auto"
    }}>
      <h1 style={{ textAlign: "center" }}>Register</h1>
      <form onSubmit={handleSignup}>
        <div className="form-group">
          <label>Name</label>
          <input
            type="text"
            className='form-control'
            placeholder='Enter your name'
          />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            className='form-control'
            placeholder='Enter your email'
          />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            className='form-control'
            placeholder='Password'
          />
        </div>

        <div className="form-group" style={{paddingBottom:"10px",paddingTop:"5px"
        }}>
          <input
            style={{ display: 'none' }}
            type='file'
            id="file"
            className='form-control'
        
          />
          <label htmlFor='file'>
            <img style={{ width: "10vw", height: "12vh", borderRadius: "50%" }} src={profile} alt='' />
            <span>Add an avatar</span>
          </label>
        </div>
    
        <button type='submit' className='btn btn-primary' disabled={loading} >
          {loading ? 'Registering...' : 'Register'}
        </button>
        {loading && "Uploading and compressing the image please wait..."}
        {err && <span>{err}</span>}
        {success && <span>Registration successful! You can now log in .</span>}
      </form>
      <p>Already have an account? <Link to='/login'>Log in</Link></p>
    
    
    </div>
  );
};

export default Register;