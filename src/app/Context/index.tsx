'use client';

import { createContext, ReactNode, useContext, useState } from "react";

interface UserContextInterface{
    userId : string;
    setUserId: React.Dispatch<React.SetStateAction<string>>;
}

const UserContext = createContext<UserContextInterface | undefined>(undefined)

interface userProviderInterface {
 children : ReactNode
}

export function UserProvider({children}: userProviderInterface){
    const [userId, setUserId] = useState<string>("");
    return(
        <UserContext.Provider value={{userId, setUserId}}>
            {children}
        </UserContext.Provider>
    )
}

export function useUser():UserContextInterface{
    const context = useContext(UserContext);
    if(!context){
        throw new Error('useUser deve ser usado dentro de um userProvider') 
    }
    return context;
}