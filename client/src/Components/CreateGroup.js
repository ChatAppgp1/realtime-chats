import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, where } from 'firebase/firestore';
import { db } from './firebaseConfig/firebaseConfig';

const CreateGroup = ({ currentUser, onGroupCreate, onCancel }) => {
  const [groupName, setGroupName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);

  useEffect(() => {
    const searchUsers = async () => {
      if (searchTerm) {
        const q = query(
          collection(db, "users"),
          where("displayName", ">=", searchTerm),
          where("displayName", "<=", searchTerm + '\uf8ff')
        );
        const querySnapshot = await getDocs(q);
        const users = querySnapshot.docs
          .map(doc => ({ ...doc.data(), id: doc.id }))
          .filter(user => user.uid !== currentUser.uid);
        setSearchResults(users);
      } else {
        setSearchResults([]);
      }
    };

    searchUsers();
  }, [searchTerm, currentUser]);

  const toggleMember = (user) => {
    setSelectedMembers(prev => 
      prev.some(m => m.uid === user.uid) 
        ? prev.filter(m => m.uid !== user.uid)
        : [...prev, user]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (groupName && selectedMembers.length > 0) {
      const group = {
        name: groupName,
        members: selectedMembers.map(m => m.uid),
        isGroup: true
      };
      onGroupCreate(group);
    }
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
      <div style={{ background: 'white', padding: '20px', borderRadius: '10px', width: '300px' }}>
        <h3>Create Group</h3>
        <form onSubmit={handleSubmit}>
          <input 
            type="text" 
            value={groupName}
            onChange={e => setGroupName(e.target.value)}
            placeholder="Group Name"
          />
          <input 
            type="text" 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search users..."
          />
          <div>
            {searchResults.map(user => (
              <div key={user.uid} onClick={() => toggleMember(user)}>
                <img src={user.photoURL} alt={user.displayName} style={{ width: '12vw', height: '15vh', borderRadius: '50%',objectFit:'cover' }} />
                <span>{user.displayName}</span>
                {selectedMembers.some(m => m.uid === user.uid) && '✓'}
              </div>
            ))}
          </div>
          <div>
            <h4>Selected Members:</h4>
            {selectedMembers.map(user => (
              <span key={user.uid}>{user.displayName}, </span>
            ))}
          </div>
          <button type="submit">Create Group</button>
          <button type="button" onClick={onCancel}>Cancel</button>
        </form>
      </div>
    </div>
  );
};

export default CreateGroup;