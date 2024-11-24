import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { createUserWithEmailAndPassword, getAuth, sendPasswordResetEmail, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { collection, doc, getDoc, getDocs, getFirestore, query, setDoc, where } from "firebase/firestore";
import { toast } from "react-toastify";


const firebaseConfig = {
  apiKey: "AIzaSyCwAGJKJPdSxR1MKTiYilzh7_ikaiLIiKk",
  authDomain: "chat-app-gs-4eaa6.firebaseapp.com",
  projectId: "chat-app-gs-4eaa6",
  storageBucket: "chat-app-gs-4eaa6.appspot.com",
  messagingSenderId: "354548759564",
  appId: "1:354548759564:web:c7b0e7cc83436f2d730229",
  measurementId: "G-9HN90WC2W1"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

const signup = async (username,email,password) => {
    try {
        const res = await createUserWithEmailAndPassword(auth,email,password);
        const user = res.user;
        await setDoc(doc(db,"users",user.uid),{
            id:user.uid,
            username:username.toLowerCase(),
            email,
            name:"",
            avatar:"",
            bio:"Hey, There i am usig chat app",
            lastSeen:Date.now(),
        })
        await setDoc(doc(db,"chats",user.uid),{
            chatData:[],
        })
    } catch (error) {
        console.error(error)
        toast.error(error.code.split('/')[1].split('-').join(" "));
    }
}

const login = async (email,password) => {
    try {
        await signInWithEmailAndPassword(auth,email,password);
    } catch (error) {
        console.error(error);
        toast.error(error.code.split('/')[1].split('-').join(" "));
    }
}

const logout = async () => {
    try {
        await signOut(auth)
    } catch (error) {
        console.error(error);
        toast.error(error.code.split('/')[1].split('-').join(" "));
    }
}

const resetPassword = async (email) => {
    if (!email) {
        toast.error("Enter Your Email");
        return null;
    }
    try {
        const userRef = collection(db,'users');
        const q = query(userRef,where("email","==",email));
        const querySnap = await getDocs(q);
        if (!querySnap.empty) {
            await sendPasswordResetEmail(auth,email);
            toast.success("Reset Email Sent")
        }
        else {
            toast.error("Email doesn't exixts")
        }
    } catch (error) {
        console.error(error);
        toast.error(error.message)
    }
}

export {signup,login,logout,auth,db,resetPassword}