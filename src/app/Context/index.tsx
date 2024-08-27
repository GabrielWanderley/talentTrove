'use client';

import { createContext, ReactNode, useContext, useState } from "react";

interface UserContextInterface{
    userId : string;
    setUserId: React.Dispatch<React.SetStateAction<string>>;
    userLogin: boolean;
    setUserLogin: React.Dispatch<React.SetStateAction<boolean>>;
}

const createUserContext = createContext<UserContextInterface | undefined>(undefined)

interface userProviderInterface {
 children : ReactNode
}

export function UserProvider({children}: userProviderInterface){
    const [userId, setUserId] = useState<string>("");
    const [userLogin, setUserLogin] = useState<boolean>(false);
    return(
        <createUserContext.Provider value={{userId, setUserId, userLogin, setUserLogin}}>
            {children}
        </createUserContext.Provider>
    )
}

export function showUser():UserContextInterface{
    const context = useContext(createUserContext);
    if(!context){
        throw new Error('showUser deve ser usado dentro de um userProvider') 
    }
    return context;
}