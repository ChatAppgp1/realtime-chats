import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebaseConfig/firebaseConfig";
import { signOut } from 'firebase/auth';
import addpost from '../images/addpost.jpg'
import viewpost from '../images/viewpost.jpg'
import weather from '../images/weather.jpg'
import home from '../images/home.jpg'

export default function Navbar() {
    const [user] = useAuthState(auth);
    const navigate = useNavigate();

    const handleViewUserPosts = () => {
        navigate(`/post?userId=${user.uid}`);
    };

    return (
        <div>
            <nav className='navbar'>
            <div style={{padding:"5px",margin:0,
            
            flexDirection:"column",
           borderRight: '1px solid #dddddd35',
           }}>   
            <div style={{paddingTop:"20px"}}> <Link className='nav-link' to="/"><img src={home} alt='' style={{
              width: 50, 
              height: 50, 
              borderRadius: '50%', 
              objectFit: 'cover'}}/></Link></div>
                <div style={{paddingTop:"20px"}}><Link className='nav-link' to='/addpost'><img src={addpost} alt='' style={{
              width: 50, 
              height: 50, 
              borderRadius: '50%', 
              objectFit: 'cover'}}/></Link></div>
               <div style={{paddingTop:"20px"}}> <Link className='nav-link' to='/posts'><img src={viewpost} alt='' style={{
              width: 50, 
              height: 50, 
              borderRadius: '50%', 
              objectFit: 'cover'}}/></Link></div>
               <div style={{paddingTop:"20px"}}><Link className='nav-link' to='/weather'><img src={weather} alt='' style={{
              width: 50, 
              height: 50, 
              borderRadius: '50%', 
              objectFit: 'cover'}}/></Link></div></div>

                <div>
                    {
                        user && (
                            <>
                                <span className="nav-link" onClick={handleViewUserPosts} style={{ cursor: 'pointer' }}>
                                    Signed in as {user.displayName || user.email}
                                </span>
                                <button className='btn btn-primary btn-sm me-3' onClick={() => { signOut(auth) }}>
                                    Log out
                                </button>
                            </>
                        )
                    }
                </div>
            </nav>
        </div>
    )
}