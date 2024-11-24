import React, { useContext, useEffect, useState } from 'react'
import './ChatBox.css'
import assets from '../../assets/assets'
import { AppContext } from '../../context/AppContext'
import { doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore'
import { db } from '../../config/firebase'
import { arrayUnion } from 'firebase/firestore/lite'
import { toast } from 'react-toastify'
import upload from '../../lib/upload'
const ChatBox = () => {

  const {userData,messagesId,chatUser,messages,setMessages,chatVisible,setChatVisible} = useContext(AppContext);

  const [input,setInput] = useState("");

  useEffect(()=>{
    if (messagesId) {
      const unSub = onSnapshot(doc(db,'messages',messagesId),(res)=>{
        setMessages(res.data().messages.reverse())
      })
      return ()=>{
        unSub();
      }
    }
  },[messagesId, setMessages])

  const sendMessage = async () => {
    try {
      if (input && messagesId) {
        const messageRef = doc(db, 'messages', messagesId);
        const messageSnap = await getDoc(messageRef);
        const currentMessages = messageSnap.data()?.messages || [];

        const newMessage = {
          sId: userData.id,
          text: input,
          createAt: new Date(),
        };

        await updateDoc(messageRef, {
          messages: [...currentMessages, newMessage],
        });

        const userIDs = [chatUser.rId, userData.id];
  
        userIDs.forEach(async (id) => {
          const userChatsRef = doc(db, 'chats', id);
          const userChatsSnapShot = await getDoc(userChatsRef);
  
          if (userChatsSnapShot.exists()) {
            const userChatData = userChatsSnapShot.data();
            const chatIndex = userChatData.chatsData.findIndex((c) => c.messageId === messagesId);
            
            if (chatIndex !== -1) {
              userChatData.chatsData[chatIndex].lastMessage = input.slice(0, 30);
              userChatData.chatsData[chatIndex].updatedAt = new Date();
              if (userChatData.chatsData[chatIndex].rId === userData.id) {
                userChatData.chatsData[chatIndex].messageSeen = false;
              }
              
              await updateDoc(userChatsRef, {
                chatsData: userChatData.chatsData,
              });
            }
          }
        });
        setInput('');
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const sendImage = async (e) => {
    try {
      const fileUrl = await upload(e.target.files[0]);
      if (fileUrl && messagesId) {
        const messageRef = doc(db, 'messages', messagesId);
        const messageSnap = await getDoc(messageRef);
        const currentMessages = messageSnap.data()?.messages || [];

        const newMessage = {
          sId: userData.id,
          image: fileUrl,
          createAt: new Date(),
        };

        await updateDoc(messageRef, {
          messages: [...currentMessages, newMessage],
        });

        const userIDs = [chatUser.rId, userData.id];
  
        userIDs.forEach(async (id) => {
          const userChatsRef = doc(db, 'chats', id);
          const userChatsSnapShot = await getDoc(userChatsRef);
  
          if (userChatsSnapShot.exists()) {
            const userChatData = userChatsSnapShot.data();
            const chatIndex = userChatData.chatsData.findIndex((c) => c.messageId === messagesId);
            
            if (chatIndex !== -1) {
              userChatData.chatsData[chatIndex].lastMessage = "Image";
              userChatData.chatsData[chatIndex].updatedAt = new Date();
              if (userChatData.chatsData[chatIndex].rId === userData.id) {
                userChatData.chatsData[chatIndex].messageSeen = false;
              }
              
              await updateDoc(userChatsRef, {
                chatsData: userChatData.chatsData,
              });
            }
          }
        });
        setInput('');
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const convertTimeStamp = (timestamp) => {
    let date = timestamp.toDate();
    const hour = date.getHours();
    const minute = date.getMinutes();
    if (hour>12) {
      return hour-12 + ":" + minute + " PM";
    }
    else {
      return hour + ":" + minute + " AM";
    }
  }

  return chatUser ? (
    <div className={`chat-box ${chatVisible ? "" : "hidden"}`}>
      <div className="chat-user">
        <img src={chatUser.userData.avatar} alt="" />
        <p>{chatUser.userData.name}{Date.now()-chatUser.userData.lastSeen <= 70000 ? <img className='dot' src={assets.green_dot} alt="" /> : null }</p>
        <img src={assets.help_icon} className='help' alt="" />
        <img onClick={()=>setChatVisible(false)} src={assets.arrow_icon} alt="" className="arrow" />
      </div>
      <div className="chat-msg">
        {messages.map((msg,index)=>(
          <div key={index} className={msg.sId === userData.id ? "s-msg" : "r-msg"}>
            {msg["image"]
            ? <img className='msg-image' src={msg.image} alt="" />
            : <p className="msg">{msg.text}</p>
            }
          
          <div>
            <img src={msg.sId === userData.id ? userData.avatar : chatUser.userData.avatar} alt="" />
            <p>{convertTimeStamp(msg.createAt)}</p>
          </div>
        </div>
        ))}
      </div>
      <div className="chat-input">
        <input onChange={(e)=>setInput(e.target.value)} value={input} type="text" placeholder='Send a message' />
        <input onChange={sendImage} type="file" id='image' accept='image/png, image/jpeg' hidden />
        <label htmlFor="image">
          <img src={assets.gallery_icon} alt="" />
        </label>
        <img onClick={sendMessage} src={assets.send_button} alt="" />
      </div>
    </div>
  )
  :<div className={`chat-welcome ${chatVisible ? "" : "hidden"}`}>
    <img src={assets.logo_icon} alt="" />
    <p>Chat anytime, anywhere</p>
  </div>
}

export default ChatBox