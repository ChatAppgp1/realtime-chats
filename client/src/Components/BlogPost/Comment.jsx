import { arrayUnion, doc, onSnapshot, updateDoc } from 'firebase/firestore'
import React, { useEffect, useState } from 'react'
import { auth, db } from '../firebaseConfig/firebaseConfig'
import { useAuthState } from 'react-firebase-hooks/auth';
import {v4 as uuidv4} from 'uuid';

export default function Comment({id}) {
    const [comment, setComment] = useState("");
    const [comments, setComments] = useState([]);
    const [currentlyLoggedinUser] = useAuthState(auth);
    const commentRef = doc(db,"Posts",id);
    useEffect(()=>{
   const docRef = doc(db,"Posts",id);
   onSnapshot(docRef, (snapshot)=>{
    setComments(snapshot.data().comments);
   });
    }, []);

    const handleChangeComment= (e)=>{
        if(e.key === "Enter"){
            updateDoc(commentRef, {
            comments: arrayUnion({
                user: currentlyLoggedinUser.uid,
                userName: currentlyLoggedinUser.displayName,
                comment: comment,
                CreatedAt: new Date(),
                commentId: uuidv4(),
            })
            }).then(()=>{
                setComment("");
            })
        }
    }
    //delete comment function
    const handleDeleteComment=(comment)=>{
        console.log(comment);

    };
  return (
    <div>
        <div className='container' style={{backgroundImage:'none',color:'black'}}>
{
    comments !== null &&
    comments.map(({commentId, user, comment, userName,CreatedAt})=>(
        <div key={commentId}>
        <div className="border p-2 mt-2 row">
            <div className="col-11">
                <span className={`badge ${
                   user === currentlyLoggedinUser.uid
                   ? "bg-success"
                   : "bg-primary" 
                }`}>{userName}</span>
                {comment}
            </div>
            <div className="col-1">
                {
                     user === currentlyLoggedinUser.uid && (
                        <i className='fa fa-times' style={{cursor:"pointer"}}
                        onClick={handleDeleteComment({commentId, user, comment, userName,CreatedAt})}
                    ></i> )
                }
                </div>
            </div>
        </div>
     ))}
     {
        currentlyLoggedinUser &&  (
            <input type='text' className='form-control mt-4 mb-5' value={comment} 
            onChange={(e)=>{setComment(e.target.value);}} 
            placeholder='Add a comment'
            onKeyUp={(e)=>{handleChangeComment(e)}}/>
        )
     }
        </div>
    </div>
  );
}
