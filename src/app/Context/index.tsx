'use client';

import { createContext, ReactNode, useContext, useState } from "react";

interface UserContextInterface{
    userId : string;
    setUserId: React.Dispatch<React.SetStateAction<string>>;
    userLogin: boolean;
    setUserLogin: React.Dispatch<React.SetStateAction<boolean>>;
}

const UserContext = createContext<UserContextInterface | undefined>(undefined)

interface userProviderInterface {
 children : ReactNode
}

export function UserProvider({children}: userProviderInterface){
    const [userId, setUserId] = useState<string>("");
    const [userLogin, setUserLogin] = useState<boolean>(false);
    return(
        <UserContext.Provider value={{userId, setUserId, userLogin, setUserLogin}}>
            {children}
        </UserContext.Provider>
    )
}

export function showUser():UserContextInterface{
    const context = useContext(UserContext);
    if(!context){
        throw new Error('showUser deve ser usado dentro de um userProvider') 
    }
    return context;
}