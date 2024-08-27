'use client';

import Image from "next/image"
import styles from "../styles/CreateCont.module.css"
import Fundo from "../../Assets/JEMA GER 1661-06.jpg"
import { TextField } from "@mui/material"
import { useState } from "react";

import { useCreateUserWithEmailAndPassword } from 'react-firebase-hooks/auth';

import {auth, db} from "../firebase/index.js"
import { addDoc, collection, updateDoc } from "firebase/firestore";

import { Visibility, VisibilityOff } from '@mui/icons-material';
import { toast } from "react-toastify";


export default function CreateCount (){
    const [senha, setSenha] = useState("");
    const [email, setEmail] = useState("");
    const [numero, setNumero] = useState("");
    const [nome, setNome] = useState("");

          // criar conta
          const [
            createUserWithEmailAndPassword,
            user,
            loading,
          ] = useCreateUserWithEmailAndPassword(auth);

    const createCount = async () => {
        if(!senha || !email || !numero || !nome){
            toast.warning("Porfavor preencha todos os dados")
            return;
        }
        try{

            await createUserWithEmailAndPassword(email, senha);

            const createUser = await addDoc(collection(db,'users'), {
                name: nome,
                email: email,
                number: numero,
                citys:[],
                jobs:[]
            })

            await updateDoc(createUser,{
                userId: createUser.id,
            });



            localStorage.setItem('conect', 'true');
            localStorage.setItem('userId', createUser.id);
            toast.success("Usuario foi criado com sucesso")

        }catch(error){
            toast.error("Usuario já existe ou tivemos um erro na criação");
            console.log(error)
        }
    }

    // ver a senha 

const [showPassword, setShowPassword] = useState(false);

const handleClickShowPassword = () => {
  setShowPassword(!showPassword);
};

    return(
        <div className={styles.createCount}>
            <div className={styles.countContent}>
              <Image src={Fundo} alt="fundo" className={styles.imageCount} priority/>
              <div className={styles.countInputs}>
                <h3>Crie sua conta</h3>
                    <TextField
                        label="Nome e sobrenome"
                        id="outlined-size-small-1"
                        size="small"
                        onChange={(e)=>{ setNome(e.target.value)}}
                        value={nome}
                    />

                    <TextField
                        label="Telefone"
                        id="outlined-size-small-2"
                        size="small"
                        style={{marginTop:"10px"}}
                        onChange={(e)=>{setNumero(e.target.value)}}
                        value={numero}
                    />

                    <TextField
                        label="Email"
                        id="outlined-size-small-3"
                        size="small"
                        style={{ marginTop: "10px" }}
                        onChange={(e)=>{setEmail(e.target.value)}}
                        value={email}
                    />
                    <TextField
                        id="outlined-password-input"
                        label="Senha"
                        size="small"
                        style={{ marginTop: "10px" }}
                        onChange={(e)=>{setSenha(e.target.value)}}
                        value={senha}
                        type={showPassword ? 'text' : 'password'}
                    />
            <button
              type="button"
              className={styles.passwordShow}
              onClick={handleClickShowPassword}
            >
              {showPassword ? <VisibilityOff /> : <Visibility />}
            </button>
                    <button onClick={createCount} className={styles.countContentbutton}>Cadastrar</button>
                </div>
            </div>
        </div>
    )
}