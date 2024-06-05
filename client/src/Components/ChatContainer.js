


import React, { useState, useEffect, useRef } from 'react';
import { 
  doc, getDoc, setDoc, updateDoc, serverTimestamp, 
  collection, addDoc, query, orderBy, onSnapshot ,arrayUnion,arrayRemove
} from 'firebase/firestore';
import { db } from './firebaseConfig/firebaseConfig';
import io from 'socket.io-client';
import UserList from './List/UserList/UserList';
import ChatList from './ChatList';
import MessageList from './MessageList';
import InputText from './InputText';
import Register from './pages/Register';
import UserInfo from './UserInfo';
import CreateGroup from './CreateGroup';
import createGp from './images/createGroup.jpg'
import Navbar from './BlogPost/Navbar';
import { Link } from 'react-router-dom';


// Initialize Socket.IO client
const socket = io('http://localhost:5005');


export default function ChatContainer() {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}');
    } catch (error) {
      console.error("Invalid JSON in localStorage:", error);
      return {};
    }
  });
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);  // Add this line

  const [selectedUser, setSelectedUser] = useState(null);
  const [chats, setChats] = useState({});
  const [currentMessages, setCurrentMessages] = useState([]);
  const [avatar, setAvatar] = useState('');
  const  messageContainerRef= useRef(null)
  const scrollToBottom = () => {
    if (messageContainerRef.current) {
      const container = messageContainerRef.current;
      container.scrollTop = container.scrollHeight;
    }
  }    
  
  useEffect(() => {
    scrollToBottom();
  }, [currentMessages])

  useEffect(() => {
    try {
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      setUser(storedUser);
    } catch (error) {
      console.error("Invalid JSON in localStorage:", error);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('user', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    const fetchChats = async () => {
      if (user.uid) {
        const userChatsRef = doc(db, "userChats", user.uid);
        const userChatsSnap = await getDoc(userChatsRef);
        if (userChatsSnap.exists()) {
          const userChats = userChatsSnap.data().chats || [];
          const fetchedChats = {};
          for (const chatId of userChats) {
            const chatSnap = await getDoc(doc(db, "chats", chatId));
            if (chatSnap.exists()) {
              fetchedChats[chatId] = chatSnap.data();
            }
          }
          setChats(fetchedChats);
        } else {
          await setDoc(userChatsRef, { chats: [] });
          setChats({});
        }
      }
    };
    fetchChats();
  }, [user]);

  useEffect(() => {
    socket.on('connect', () => {
      console.log('Connected to server');
    });

    socket.on('chat', (chat) => {
      if (chat.chatId === getCurrentChatId()) {
        setCurrentMessages(prev => [...prev, chat.message]);
      }
    });

    return () => {
      socket.off('connect');
      socket.off('chat');
    };
  }, [selectedUser, user]);

  const getCurrentChatId = () => {
    return selectedUser ? [user.uid, selectedUser.uid].sort().join('_') : null;
  };

  const handleUserSelect = async (selectedUser) => {
    setSelectedUser(selectedUser);
    const chatId = [user.uid, selectedUser.uid].sort().join('_');
    const chatRef = doc(db, "chats", chatId);
    const chatSnap = await getDoc(chatRef);

    if (chatSnap.exists()) {
      subscribeToMessages(chatId);
    } else {
      await setDoc(chatRef, { members: [user.uid, selectedUser.uid] });
      await updateDoc(doc(db, "userChats", user.uid), { chats: [...Object.keys(chats), chatId] });
      await updateDoc(doc(db, "userChats", selectedUser.uid), { chats: [...Object.keys(chats), chatId] });
      setCurrentMessages([]);
      subscribeToMessages(chatId);
    }
    setTimeout(scrollToBottom, 100);
  };

  const subscribeToMessages = (chatId) => {
    const messagesRef = collection(doc(db, "chats", chatId), "messages");
    const q = query(messagesRef, orderBy("createdAt"));
  
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const messages = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          createdAt: data.createdAt?.toDate() || new Date()
        };
      });
  
      // Replace any local messages with their server versions
      const updatedMessages = messages.map(serverMsg => {
        const localMsg = currentMessages.find(msg => msg.id === serverMsg.id);
        return localMsg && !serverMsg.createdAt ? localMsg : serverMsg;
      });
  
      // Add any new local messages that aren't in the server list yet
      const newLocalMessages = currentMessages.filter(localMsg => 
        !messages.some(serverMsg => serverMsg.id === localMsg.id)
      );
  
      const allMessages = [...updatedMessages, ...newLocalMessages].sort((a, b) => 
        (a.createdAt || new Date(0)) - (b.createdAt || new Date(0))
      );

      setCurrentMessages(allMessages);

      setCurrentMessages(allMessages);
    }, (error) => {
      console.error("Error fetching messages:", error);
    });
  
    return unsubscribe;
  };

  useEffect(() => {
    socket.on('connect', () => {
      console.log('Connected to server');
    });

    socket.on('chat', (chat) => {
      if (chat.chatId === getCurrentChatId()) {
        setCurrentMessages(prev => [...prev, chat.message]);
       
      }
    });

    return () => {
      socket.off('connect');
      socket.off('chat');
    };
  }, [selectedUser, user]);

  const addMessage = async (newMessage) => {
    if (!selectedUser) return;

    const chatId = getCurrentChatId();
    const chatRef = doc(db, "chats", chatId);
    const messagesRef = collection(chatRef, "messages");

    const message = { 
      sender: user.uid, 
      text: newMessage.message, 
      createdAt: serverTimestamp() 
    };

    const docRef = await addDoc(messagesRef, message);
    const localMessage = {
       ...message, 
       id: docRef.id,
        createdAt: new Date() };
 
        // Optimistically add the message to the UI
//  setCurrentMessages(prev => [...prev, localMessage]);
    // Send message via Socket.IO
    // socket.emit('chat', { chatId, message: localMessage });
    
  };

  const logout = () => {
    localStorage.removeItem("user");
    setUser({});
    setSelectedUser(null);
    setChats({});
    setCurrentMessages([]);
  };

  const updateUser = (newUser) => {
    setUser(newUser);
    localStorage.setItem('user', JSON.stringify(newUser));
  };

  const addUserToChats = async (newUser, isGroup = false) => {
    const chatId = isGroup ? newUser.id : [user.uid, newUser.uid].sort().join('_');
    const chatRef = doc(db, "chats", chatId);
    const userChatsRef = doc(db, "userChats", user.uid);

    try {
      if (isGroup) {
        await setDoc(chatRef, { 
          name: newUser.name,
          members: [user.uid, ...newUser.members],
          isGroup: true,
          messages: [] 
        }, { merge: true });
      } else {
        await setDoc(chatRef, { 
          members: [user.uid, newUser.uid],
          isGroup: false,
          messages: [] 
        }, { merge: true });
      }
      await updateDoc(userChatsRef, { chats: arrayUnion(chatId) });
      setSelectedUser(newUser);
    } catch (error) {
      console.error("Error adding to chats:", error);
    }
  };
  const leaveGroup = async (groupId) => {
    try {
      const groupRef = doc(db, "chats", groupId);
      const userChatsRef = doc(db, "userChats", user.uid);

      await updateDoc(groupRef, { members: arrayRemove(user.uid) });
      await updateDoc(userChatsRef, { chats: arrayRemove(groupId) });

      if (selectedUser && selectedUser.id === groupId) {
        setSelectedUser(null);
      }
    } catch (error) {
      console.error("Error leaving group:", error);
    }
  };

  return (
    <div className='Container'>
      {user && user.uid ? 
   
      (
        <>
            <div style={{padding:"5px",margin:0,
            paddingTop:"30px",
            flexDirection:"column",
           borderRight: '1px solid #dddddd35',
           
           }}>
            <div onClick={() => setIsCreatingGroup(true)} style={{padding: 'px'}}
             ><img src={createGp} alt='' style={{
              width: 50, 
              height: 50, 
              borderRadius: '50%', 
              objectFit: 'cover'
            }}></img></div>
             <Navbar/>
              </div>
      <div style={{flex: 1,
           display: 'flex',
           flexDirection: 'column'}}>
     <div style={{ padding: '20px',
         display: 'flex',
         alignItems: 'center',
          gap: '30px',
          borderBottom: '1px solid #dddddd35',}}>
         <UserInfo user={user} />
            <p onClick={()=> logout()} style={{color:"blue", cursor:'pointer'}} >Log Out</p>

            </div>
    

        <div  style={{overflow:'auto',paddingTop:"20px"}}>
            <div>
            <UserList   currentUser={user}
            onUserSelect={handleUserSelect} 
            onUserAdd={newUser => addUserToChats(newUser, false)}  />
           
            </div></div>
           {/* <div> <ChatList  chats={chats} 
            user={user}
            onSelect={handleUserSelect}
            leaveGroup={leaveGroup} />
            </div> */}
             {isCreatingGroup && (
            <CreateGroup 
              currentUser={user}
              onGroupCreate={group => {
                addUserToChats(group, true);
                setIsCreatingGroup(false);
              }}
              onCancel={() => setIsCreatingGroup(false)}
            />
          )}
          </div>
          

          <div style={{  flex: 2,
           borderLeft: '1px solid #dddddd35',
           height: '100%',
           display: 'flex',
          flexDirection: 'column'}}>
            {selectedUser ? (
              <><div style={{ borderBottom: '1px solid #dddddd35',padding:"25px"}}>
                             <UserInfo user={selectedUser} />
                            </div>
               <div ref={messageContainerRef} className="wallpaper" style={{padding: '10px',
                  flex: 1,
                  overflow: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '20px',
                   }}>
                <MessageList messages={currentMessages} user={user} style={{maxWidth: '70%',
                 display: 'flex',
                 gap: '20px',
                  }}/>
                   
               </div>
               <div  style={{padding: '20px',
                   display: 'flex',
                   alignItems: 'center',
                   justifyContent: 'space-between',
                    borderTop: '1px solid #dddddd35',
                    gap: '20px',
                   marginTop: 'auto'}}>
                <InputText addMessage={addMessage} />
                </div>
              </>
            ): (
              <p>Select a user to start chatting</p>
            )}
          </div>
        </>
      ): (
        <Register setUser={updateUser} setAvatar={setAvatar} />
       )}
    
    </div>
  );
} 