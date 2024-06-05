import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../Components/firebaseConfig/firebaseConfig';

const IndividualChatList = ({ chats, user, onSelect }) => {
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
    if (!user || !user.uid || !Array.isArray(members)) return null;
    const otherUserId = members.find(id => id !== user.uid);
    return allUsers.find(u => u.uid === otherUserId);
  };

  const getLastMessage = (messages) => {
    if (!Array.isArray(messages) || messages.length === 0) return 'No messages yet';
    const lastMsg = messages[messages.length - 1];
    return lastMsg ? lastMsg.text : 'No messages yet';
  };

  const formatTime = (timestamp) => {
    if (!timestamp || !timestamp.toDate) return '';
    const date = timestamp.toDate();
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!user || !user.uid) return <p>Loading chats...</p>;

  const individualChats = Object.entries(chats)
    .filter(([_, chat]) => !chat.isGroup);

  return (
    <div>
      <h3>Individual Chats</h3>
      {individualChats.length > 0 ? (
        individualChats.map(([chatId, chat]) => {
          const otherUser = getOtherUser(chat.members);
          const displayName = otherUser?.displayName || 'Unknown User';
          const photoURL = otherUser?.photoURL || 'path/to/default/avatar.png';

          return (
            <div
              key={chatId}
              style={{ display: 'flex', alignItems: 'center', padding: '10px', cursor: 'pointer' }}
              onClick={() => onSelect(otherUser)}
            >
              <img src={photoURL} alt={displayName} style={{ width: '8vw', height: '15vh', borderRadius: '50%', objectFit: "cover" }} />
              <div style={{ flex: 1, marginLeft: '10px' }}>
                <p style={{ margin: 0, fontWeight: 'bold' }}>{displayName}</p>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#aaa' }}>
                  {getLastMessage(chat.messages || [])}
                </p>
              </div>
              <small style={{ color: '#999', fontSize: '0.7rem', marginLeft: '10px' }}>
                {formatTime((chat.messages || [])[chat.messages?.length - 1]?.createdAt)}
              </small>
            </div>
          );
        })
      ) : (
        <p>No individual chats available</p>
      )}
    </div>
  );
};

export default IndividualChatList;