import React, { useRef, useState } from 'react';
import './App.css';

import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { signOut } from '@firebase/auth';

require("dotenv").config();

firebase.initializeApp({
    apiKey: process.env.REACT_APP_API_KEY,
    authDomain: process.env.REACT_APP_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_PROJECT_ID,
    storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_ID,
    measurementId: process.env.REACT_APP_MEASUREMENT_ID
})


const auth = firebase.auth();
const firestore = firebase.firestore();

function App() {

  const [user] = useAuthState(auth);

  return (
    <div className="App">
       <header>
        <h1> Chat 💬💖</h1>
        <SignOut />
      </header>

<section>
  {user ? <ChatRoom /> : <SignIn />}
</section>

    </div>
  );
}

function SignIn(){

const signInWithGoogle = () => {
const provider = new firebase.auth.GoogleAuthProvider();
auth.signInWithPopup(provider);
} 

  return(
    <>
    <button className="sign-in" onClick={signInWithGoogle}>Sign in with google</button>
    </>
  )
}

function SignOut(){
return auth.currentUser && (
  <button className="sign-out" onClick={() => auth.signOut()}>Sign Out</button>
)
}

function ChatRoom(){

  const dummy = useRef();

  const messageRef = firestore.collection('messages');
  const query = messageRef.orderBy('createdAt').limitToLast(12);

  const [messages] = useCollectionData(query, {idField: 'id'});

  const [formValue, setFormValue ] = useState('');

  const sendMessage = async(e) => {
    e.preventDefault();

    const {uid , photoURL} = auth.currentUser;

    await messageRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL
    })

   setFormValue(''); //set to empty string 
    dummy.current.scrollIntoView({ behavior: 'smooth' });
  
  }

return (
  <>
  <main>

{messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}
<span ref={dummy}></span>
 
  </main>
  <form onSubmit={sendMessage}>
    <input value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder="say something nice"/>
   

    <button type="submit" disabled={!formValue}>🕊️</button>
  </form>
  </>
)
}

function ChatMessage(props){
  const {text, uid, photoURL}= props.message;
  
  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';
  return (
    <>
    <div className={`message ${messageClass}`}>
     <img src={photoURL || 'https://firebasestorage.googleapis.com/v0/b/superchat-7e24f.appspot.com/o/whitecat.jpg?alt=media&token=9595bf52-aae6-4822-85d0-24c6857e1e97'} />
      <p>{text}</p>
    </div>
    </>
  )

}

export default App;
