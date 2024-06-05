import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { auth, db } from "../firebaseConfig/firebaseConfig";
import DeletePost from "./DeletePost";
import { useAuthState } from "react-firebase-hooks/auth";
import LikePost from "./LikePost";
import { Link } from "react-router-dom";


export default function Posts() {
    const [user] = useAuthState(auth);
    const [posts, setPosts] = useState([]);
    useEffect(()=>{
     const postRef = collection(db, "Posts");
     const q = query(postRef, orderBy("CreatedAt", "desc"));
     onSnapshot(q,(snapshot)=>{
        const posts = snapshot.docs.map((doc)=>({
            id: doc.id,
            ...doc.data(),
        }));
        setPosts(posts);
        console.log(posts);
     });
    },[]);
  return (
    <div style={{color:"black",display:"grid",gridTemplateColumns: "repeat(auto-fill,minmax(700px,1fr))",gap:"4px"}}>
        {
            posts.length === 0 ? (
                <p>No posts found!</p>
            ):(
                posts.map(({id,title,description,imageUrl,CreatedAt,createdBy,userId,likes,comments})=>(
                <div className="border mt-3 p-3 bg-light" key={id} style={{textAlign:"left",}}>
                    <div className="row">
                        <div className="col-3">
                            <img src = {imageUrl} alt = 'title' style= {{height:200,width:200,paddingBottom: 6,}} />
                        </div>
                        <div className="col-9 ps-5" >
                            <div className="row">
                                <div className="col-6">
                                {
                              createdBy &&   (
                                <span className="badge bg-primary">{createdBy}</span>
                              )}
                                </div>
                                <div className="col-6 d-flex flex-row-reverse">
                                    {
                                        user && user.uid === userId && (
                                        <DeletePost id={id} imageUrl={imageUrl} />

                                        )
                                    }
                                </div>
                     </div>
                            <h3>{title}</h3>
                            <p>{CreatedAt.toDate().toDateString()}</p>
                            <h5>{description}</h5>
                            <div className="d-flex flex-row-reverse">
                                {user && <LikePost id={id} likes={likes}/> }
                                <div className="pe-2">
                                    <p>{likes?.length} likes</p>
                                </div>
                                { 
                                    comments && comments.length > 0 && (
                                        <div className="pe-2">
                                            <p>{comments?.length} comments  </p>
                                        </div>
                                    )
                                }
                                </div>
                                <Link className="nav-link" to={`/post/${id}`} style={{textAlign:"right",color:"black"}}>Comment</Link>
                        </div>
                    </div>
                </div>
            ))
            )}
    </div>
  );
}
