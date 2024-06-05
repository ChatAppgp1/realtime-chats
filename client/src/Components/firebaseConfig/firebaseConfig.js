import  {initializeApp} from "firebase/app";
import { getFirestore } from 'firebase/firestore'
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getStorage } from "firebase/storage";


const firebaseConfig = {
    apiKey: "AIzaSyDGmWOXb5PXV1zO5DV5PEePrVg3vJORKKA",
    authDomain: "chat-app-ba87f.firebaseapp.com",
    projectId: "chat-app-ba87f",
    storageBucket: "chat-app-ba87f.appspot.com",
    messagingSenderId: "970749560812",
    appId: "1:970749560812:web:d0fc011753eb8a98cd62c9"
  };

  const app =initializeApp(firebaseConfig)

export default getFirestore(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth();
export const googleProvider =new GoogleAuthProvider();


