// // UserList.js
// import React, { useEffect, useState } from 'react';
// import { collection, query, getDocs } from 'firebase/firestore';
// import { db } from '../../firebaseConfig/firebaseConfig';

// const UserList = ({ currentUser, onUserSelect }) => {
//   const [users, setUsers] = useState([]);

//   useEffect(() => {
//     const fetchUsers = async () => {
//       try {
//         const q = query(collection(db, "users"));
//         const querySnapshot = await getDocs(q);
//         const userList = querySnapshot.docs
//           .map(doc => ({ ...doc.data(), id: doc.id }))
//           .filter(user => user.uid !== currentUser.uid);
//         setUsers(userList);
//       } catch (error) {
//         console.error("Error fetching users:", error);
//       }
//     };

//     if (currentUser && currentUser.uid) {
//       fetchUsers();
//     }
//   }, [currentUser]);

//   if (!currentUser || !currentUser.uid) {
//     return null;
//   }

//   return (
//     <div>
//       <h3>Add User</h3>
//       {users.length > 0 ? (
//         users.map(user => (
//           <div key={user.id} onClick={() => onUserSelect(user)} style={{cursor: 'pointer'}}>
//             <img 
//               src={user.photoURL} 
//               alt={user.displayName} 
//               style={{width: 50, height: 50, borderRadius: '50%'}}
//             />
//             <p>{user.displayName}</p>
//           </div>
//         ))
//       ) : (
//         <p>No users available to add</p>
//       )}
//     </div>
//   );
// };

// export default UserList;

import React, { useEffect, useState } from 'react';
import { collection, query, getDocs, where } from 'firebase/firestore';
import { db } from '../../firebaseConfig/firebaseConfig';

const UserList = ({ currentUser, onUserSelect, onUserAdd }) => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const q = query(collection(db, "users"));
        const querySnapshot = await getDocs(q);
        const userList = querySnapshot.docs
          .map(doc => ({ ...doc.data(), id: doc.id }))
          .filter(user => user.uid !== currentUser.uid);
        setUsers(userList);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    if (currentUser && currentUser.uid) {
      fetchUsers();
    }
  }, [currentUser]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm) {
        const q = query(
          collection(db, "users"),
          where("displayName", ">=", searchTerm),
          where("displayName", "<=", searchTerm + '\uf8ff')
        );
        getDocs(q).then(querySnapshot => {
          const results = querySnapshot.docs
            .map(doc => ({ ...doc.data(), id: doc.id }))
            .filter(user => user.uid !== currentUser.uid);
          setSearchResults(results);
        });
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, currentUser]);

  

  if (!currentUser || !currentUser.uid) {
    return null;
  }

  const displayedUsers = searchTerm ? searchResults : users;

  return (
    <div>
      <h3 style={{borderBottom:'1px solid #dddddd35',color:"turquoise",fontFamily:"initial",fontStyle:"italic"}}>Users</h3>
     {displayedUsers.length > 0 ? (
        displayedUsers.map(user => (
          <div 
            key={user.id} 
            onClick={() => onUserSelect(user)} 
            style={{
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px',
              borderBottom: '1px solid #dddddd35'
            }}
          >
            <img
              src={user.photoURL}
              alt={user.displayName}
              style={{width: 50, height: 50, borderRadius: '50%', objectFit: 'cover'}}
            />
            <p style={{ margin: 0 }}>{user.displayName}</p>
          </div>
        ))
      ) : (
        
        <p>No users available to add</p>
        
      )}
    </div>
  );
};

export default UserList;