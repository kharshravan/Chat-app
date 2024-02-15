// import React, { useState } from 'react'

// import UserContext from './UserContext'

// const UserContextProvider = ({children}) => {
//     const [user, setUser] = useState('');
//     // const [room, setRoom] = useState('');
//   return (
//     <UserContext.Provider value={{user,setUser}}>
//         {children}
//     </UserContext.Provider>
//   )
// }

// export default UserContextProvider
import React, { useState } from 'react';
import UserContext from './UserContext';

const UserContextProvider = ({ children }) => {
    const [user, setUser] = useState({ username: '', room: '' });

    return (
        <UserContext.Provider value={{ user, setUser }}>
            {children}
        </UserContext.Provider>
    );
};

export default UserContextProvider;
