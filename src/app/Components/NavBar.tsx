'use client';

import Link from 'next/link';
import styles from '../styles/NavBar.module.css'
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';

import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Fade from '@mui/material/Fade';
import { useEffect, useState } from 'react';

import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import LogoutIcon from '@mui/icons-material/Logout';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import {TextField } from '@mui/material';


import { useSignInWithEmailAndPassword } from 'react-firebase-hooks/auth';
import { useSendPasswordResetEmail } from 'react-firebase-hooks/auth';

import { auth, db } from '../firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useUser } from '../Context';
import { toast } from 'react-toastify';

import { Visibility, VisibilityOff } from '@mui/icons-material';

export function NavBar(){
    //context
    const {setUserId} = useUser();

    //drop menu 

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
      setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
      setAnchorEl(null);
    };

   //Modal
   const [openM, setOpenM] = useState(false);
   const handleOpenM = () => setOpenM(true);
   const handleCloseM = () => setOpenM(false);

   //login

   const [senha, setSenha] = useState("");
   const [email, setEmail] = useState("");
   const [conect, setConect] = useState(false);

   const [
    signInWithEmailAndPassword,
    user,
    loading,
  ] = useSignInWithEmailAndPassword(auth);

 const login =async () => {
   if(!senha || !email){
    toast.warning("Porfavor preencha todos os dados")
    return;
   }
   try{

    signInWithEmailAndPassword(email, senha);
    localStorage.setItem('conect', 'true');
    setConect(true);
    toast.success("Usuario conectado com sucesso")

    const userRef = collection(db,"users");
    const q = query(userRef,where('email', '==', email));
    const pushDoc = await getDocs(q);
    pushDoc.forEach((doc) => {
      localStorage.setItem('userId', doc.id);
      setUserId(doc.id);
    })
    setOpenM(false);

   }catch{
     toast.error("Usuario não existe ou tivemos um erro no login")
   }

 };

 useEffect(() =>{
  const conected = localStorage.getItem('conect')
  const idUser = localStorage.getItem('userId')
  if(idUser){
    setUserId(idUser);
  }
  
  if(conected && conected === 'true'){
    setConect(true);
  }else{
    setConect(false);
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
 },[])

 // desconectar 

const desconect = async()=>{
    
  localStorage.removeItem('conect');
  localStorage.removeItem('userId'); 
  setUserId('')
  setConect(false);
  window.location.reload();
}

// trocar senha 
const actionCodeSettings = {
  url: 'http://localhost:3000/',
};

const [sendPasswordResetEmail, sending] = useSendPasswordResetEmail(auth);

// ver a senha 

const [showPassword, setShowPassword] = useState(false);

const handleClickShowPassword = () => {
  setShowPassword(!showPassword);
};


  return (
    <div className={styles.navbar}>
      <div className={styles.navbarContent}>
        <Link href={"/"} style={{ textDecoration: "none", color: "inherit" }}>
          <HomeIcon style={{ width: "45px", height: "45px", cursor: "pointer" }} />
        </Link>
        {conect?(
          <LogoutIcon className={styles.Icon2} onClick={desconect}/>
        ):(
          <PersonOutlineIcon className={styles.Icon} onClick={handleOpenM}/>
        )}
        <Modal
        open={openM}
        onClose={handleCloseM}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box className={styles.Modal}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
          Conecte na sua conta
          </Typography>
          <TextField
                        label="Email"
                        id="outlined-size-small"
                        size="small"
                        style={{ marginTop: "10px" }}
                        sx={{'& .MuiOutlinedInput-root': {'& fieldset': {borderColor: 'white'}, '&:hover fieldset': {borderColor: 'white'}, '&.Mui-focused fieldset': {borderColor: 'white'}}, '& .MuiInputLabel-root': {color: 'white'}, '& .MuiInputBase-input': {color: 'white'}}}
                        onChange={(e)=>{setEmail(e.target.value)}}
                        value={email}
                    />
                    <TextField
                        id="outlined-password-input"
                        label="Senha"
                        size="small"
                        type={showPassword ? 'text' : 'password'}
                        style={{ marginTop: "10px",}}
                        sx={{'& .MuiOutlinedInput-root': {'& fieldset': {borderColor: 'white'}, '&:hover fieldset': {borderColor: 'white'}, '&.Mui-focused fieldset': {borderColor: 'white'}}, '& .MuiInputLabel-root': {color: 'white'}, '& .MuiInputBase-input': {color: 'white'}}}
                        onChange={(e)=>{setSenha(e.target.value)}}
                        value={senha}
                    />
                          <button
        type="button"
        className={styles.passwordShow}
        onClick={handleClickShowPassword}
        >
              {showPassword ? <VisibilityOff /> : <Visibility />}
              </button>
                 
          <Typography id="modal-modal-description" sx={{ mt: 2 }} 
          onClick={async () => {
          const success = await sendPasswordResetEmail(
            email,
            actionCodeSettings
          );
          if (success) {
            toast.warning('Email enviado');
          }else{
            toast.warning('Email errado ou conta inexistente')
          }
        }} style={{cursor:"pointer"}}>
           Esqueci minha senha
          </Typography>

          <Link 
          onClick={handleCloseM}
          href={"/CreateCount"} 
          style={{ textDecoration: "none", color: "inherit" }}>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
           Criar uma conta
          </Typography>
          </Link>
          <button onClick={login} className={styles.Modalbutton}>Conectar</button>
        </Box>
      </Modal>

        <IconButton
          onClick={handleClick}
          aria-haspopup="true"
        >
          <MenuIcon style={{ color: "white", width: "50px", height: "50px", cursor: "pointer" }} />
        </IconButton>
        <Menu
          id="fade-menu"
          MenuListProps={{
            'aria-labelledby': 'fade-button',
          }}
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          TransitionComponent={Fade}
        >
          <Link href={"/MakeJob"} style={{ textDecoration: "none", color: "inherit" }}>
            <MenuItem onClick={handleClose}>Criar um serviço</MenuItem>
          </Link>
          <Link href={"/UpdateDoc"} style={{ textDecoration: "none", color: "inherit" }}>
            <MenuItem onClick={handleClose}>Alterar um serviço</MenuItem>
          </Link>
          <Link href={"/LocationPhoto"} style={{ textDecoration: "none", color: "inherit" }}>
            <MenuItem onClick={handleClose}>Adicionar localização ou alterar foto</MenuItem>
          </Link>
        </Menu>
      </div>
    </div>
  )
}