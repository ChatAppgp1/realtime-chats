// import React, { useEffect, useState } from 'react';
// import { collection, getDocs } from 'firebase/firestore';
// import { db } from '../Components/firebaseConfig/firebaseConfig';

// const ChatList = ({ chats,user, onSelect }) => {
//   const [allUsers, setAllUsers] = useState([]);

//   useEffect(() => {
//     const fetchAllUsers = async () => {
//       try {
//         const querySnapshot = await getDocs(collection(db, "users"));
//         const users = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
//         setAllUsers(users);
//       } catch (error) {
//         console.error("Error fetching users:", error);
//       }
//     };

//     fetchAllUsers();
//   }, []);

//   const getOtherUser = (members) => {
//     const otherUserId = members.find(id => id !==user.uid);
//     return allUsers.find(u => u.uid === otherUserId);
//   };

//   const getLastMessage = (messages) => {
//     const lastMsg = messages[messages.length - 1];
//     return lastMsg ? lastMsg.text : 'No messages yet';
//   };

//   const formatTime = (timestamp) => {
//     if (!timestamp || !timestamp.toDate) return '';
//     const date = timestamp.toDate();
//     return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
//   };

//   return (
//     <div>
//       <h3>Chats</h3>
//       {Object.entries(chats).length > 0 ? (
//         Object.entries(chats).map(([chatId, chat]) => {
//           const otherUser = getOtherUser(chat.members);
//           if (!otherUser) return null;

//           return (
//             <div 
//               key={chatId} 
//               onClick={() => onSelect(otherUser)}
//               style={{
//                 display: 'flex',
//                 alignItems: 'center',
//                 gap: '10px',
//                 padding: '10px',
//                 cursor: 'pointer',
//                 borderBottom: '1px solid #dddddd35',
//               }}
//             >
//               <img 
//                 src={otherUser.photoURL} 
//                 alt={otherUser.displayName} 
//                 style={{
//                   width: 40, 
//                   height: 40, 
//                   borderRadius: '50%', 
//                   objectFit: 'cover'
//                 }}
//               />
//               <div style={{ flex: 1 }}>
//                 <p style={{ margin: 0, fontWeight: 'bold' }}>{otherUser.displayName}</p>
//                 <p style={{ margin: 0, fontSize: '0.8rem', color: '#aaa' }}>
//                   {getLastMessage(chat.messages)}
//                 </p>
//               </div>
//               <small style={{ color: '#999', fontSize: '0.7rem' }}>
//                 {formatTime(chat.messages[chat.messages.length - 1]?.createdAt)}
//               </small>
//             </div>
//           );
//         })
//       ) : (
//         <p>No chats available</p>
//       )}
//     </div>
//   );
// };

// export default ChatList;

import React, { useEffect, useState } from 'react';
import { collection, getDocs} from 'firebase/firestore';
import { db } from '../Components/firebaseConfig/firebaseConfig';

const ChatList = ({ chats,user, onSelect, leaveGroup }) => {
  const [allUsers, setAllUsers] = useState([]);

  useEffect(() => {
    const fetchAllUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "users"));
        const users = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
        setAllUsers(users);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchAllUsers();
  }, []);

  const getOtherUser = (members) => {
    if (!user || !user.uid || !Array.isArray(members)) {
      return null;
    }
    const otherUserId = members.find(id => id !== user.uid);
    return allUsers.find(u => u.uid === otherUserId);
  };

  const getLastMessage = (messages) => {
    if (!Array.isArray(messages) || messages.length === 0) {
      return 'No messages yet';
    }
    const lastMsg = messages[messages.length - 1];
    return lastMsg ? lastMsg.text : 'No messages yet';
  };


  const formatTime = (timestamp) => {
    if (!timestamp || !timestamp.toDate) return '';
    const date = timestamp.toDate();
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!user || !user.uid) {
    return <p>Loading chats...</p>;
  }

  return (
    <div>
      <h3>Chats</h3>
      {Object.entries(chats).length > 0 ? (
        Object.entries(chats).map(([chatId, chat]) => {
          const isGroup = chat.isGroup;
          const otherUser = isGroup ? null : getOtherUser(chat.members);
          const displayName = isGroup ? chat.name : otherUser?.displayName || 'Unknown User';
          const photoURL = isGroup ? 'path/to/group/avatar.png' : otherUser?.photoURL || 'path/to/default/avatar.png';

          return (
            <div
              key={chatId}
              style={{ display: 'flex', alignItems: 'center', padding: '10px', cursor: 'pointer' }}
            >
              <img src={photoURL} alt={displayName} style={{ width: 50, height: 50, borderRadius: '50%',objectFit:"cover"}} />
              <div 
                style={{ flex: 1, marginLeft: '10px' }} 
                onClick={() => onSelect(isGroup ? { ...chat, id: chatId } : otherUser)}
              >
                <p style={{ margin: 0, fontWeight: 'bold' }}>{displayName}</p>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#aaa' }}>
                  {getLastMessage(chat.messages || [])}
                </p>
              </div>
              {isGroup && (
                <button onClick={() => leaveGroup(chatId)} style={{ fontSize: '0.8rem' }}>Leave</button>
              )}
              <small style={{ color: '#999', fontSize: '0.7rem', marginLeft: '10px' }}>
                {formatTime((chat.messages || [])[chat.messages?.length - 1]?.createdAt)}
              </small>
            </div>
          );
        })
      ) : (
        <p>No chats available</p>
      )}
    </div>
  );
};

export default ChatList;