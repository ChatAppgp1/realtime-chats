import React from 'react';

const UserInfo = ({ user }) => {
  if (!user || !user.photoURL || !user.displayName) {
    return <div>Loading user information...</div>;
  }

  return (
    <div style={{margin:0,display:'flex', gap:"5px"}}>
      <img 
        src={user.photoURL} 
        alt={user.displayName} 
        style={{
          width: 50, 
          height: 50, 
          borderRadius: '50%', 
          objectFit: 'cover'
        }}
      />
        <h4>{user.displayName}</h4>
      </div>
  );
};

export default UserInfo;