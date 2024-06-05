import { Timestamp, addDoc, collection } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { useState } from 'react';
import { auth, db, storage } from '../firebaseConfig/firebaseConfig';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';

export default function AddPost() {
    const [user] = useAuthState(auth);
    const [formdata, setFormdata] = useState({
        title: "",
        description: "",
        image: "",
        CreatedAt: Timestamp.now().toDate(),
    });

    const [progress, setProgress] = useState(0);

    const handleChange=(e)=>{
      setFormdata({ ...formdata, [e.target.name]: e.target.value});
    };
    const handleImageChange=(e)=>{
      setFormdata({ ...formdata, image: e.target.files[0] });
    };
    const handlePost=()=>{
        if(!formdata.title || !formdata.description || !formdata.image){
            alert('Please fill all the fields');
            return;
        }

        const storageRef = ref(storage, `/images/${Date.now()}${formdata.image.name}`);

        const uploadImage = uploadBytesResumable(storageRef, formdata.image);
        uploadImage.on("state_changed", (snapshot)=>{
           const progressPercent = Math.round((snapshot.bytesTransferred /snapshot.totalBytes) * 100);
        setProgress(progressPercent);
        },
        (err)=>{
            console.log(err);
        } ,
    ()=>{
        setFormdata({
            title: "",
            description: "",
            image: "",
        });

        getDownloadURL(uploadImage.snapshot.ref)
        .then((url)=>{
            const postRef = collection(db, "Posts");
            addDoc(postRef, {
                title: formdata.title,
                description: formdata.description,
                imageUrl: url,
                CreatedAt: Timestamp.now().toDate(),
                createdBy: user.displayName,
                userId:user.uid,
                likes:[],
                comments: [],
            })
            .then(()=>{
                toast("Post added successfully",{type: "success"});
                setProgress(0);
            })
            .catch((err)=>{
                toast("Error adding post", {type: "error"});
            });
        });
    }
    );
    };
  return (
    
    <div className="border p-3 mt-3 bg-light" style={{position:"fixed",color:"black"}}>
       {
        user?(
        <>
        <h2>Create Post</h2>
       <label htmlFor="" >Title</label> 
       <input type="text" name="title" className="form-control" value={formdata.title} onChange={(e)=>handleChange(e)}/>

       {/*description*/}
       <label htmlFor="">Description</label> 
       <textarea name="description" className="form-control" value={formdata.description} onChange={(e)=>handleChange(e)}/>

       {/* image */}
       <label htmlFor=''>Image</label>
       <input type="file" name="image" accept="image/*" className="form-control" onChange={(e)=>handleImageChange(e)} />

       {progress === 0 ? null :(
       <div className="progress">
         <div className="progress-bar progress-bar-striped mt-2" style={{ width:`${progress}%` }}>
         {`uploading image ${progress}%`}

         </div>
       </div>
       )}
       <Link to="/post">
       <button className="form-control mt-2" style={{backgroundColor:"cyan",fontWeight:"bold"}} onClick={handlePost}>Post</button>
       </Link>
        </>
        ):(
            <p>Sorry you are not eligable to post</p>
        )
       }
       </div>
    );
}
