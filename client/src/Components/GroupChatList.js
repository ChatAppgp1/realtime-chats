import React from 'react';

const GroupChatList = ({ chats, user, onSelect, leaveGroup, showMembers }) => {
  if (!user || !user.uid) return <p>Loading group chats...</p>;

  const groupChats = Object.entries(chats)
    .filter(([_, chat]) => chat.isGroup && chat.members.includes(user.uid));

  return (
    <div>
      <h3>Group Chats</h3>
      {groupChats.length > 0 ? (
        groupChats.map(([chatId, chat]) => (
          <div
            key={chatId}
            style={{ display: 'flex', alignItems: 'center', padding: '10px', cursor: 'pointer' }}
          >
            <img src="path/to/group/avatar.png" alt={chat.name} style={{ width: '8vw', height: '15vh', borderRadius: '50%', objectFit: "cover" }} />
            <div
              style={{ flex: 1, marginLeft: '10px' }}
              onClick={() => onSelect({ ...chat, id: chatId })}
            >
              <p style={{ margin: 0, fontWeight: 'bold' }}>{chat.name}</p>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#aaa' }}>
                {chat.members.length} members
              </p>
            </div>
            <button onClick={() => showMembers(chat)} style={{ fontSize: '0.8rem', marginRight: '10px' }}>
              Members
            </button>
            <button onClick={() => leaveGroup(chatId)} style={{ fontSize: '0.8rem' }}>
              Leave
            </button>
          </div>
        ))
      ) : (
        <p>No group chats available</p>
      )}
    </div>
  );
};

export default GroupChatList;