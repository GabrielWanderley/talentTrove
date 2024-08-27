'use client';

import 'react-toastify/dist/ReactToastify.css';

import styles from "../styles/locationPhoto.module.css"
import ClearIcon from '@mui/icons-material/Clear';
import Image from "next/image";


import foto from "../../Assets/Pfps.jpeg"
import { db, storage } from "../firebase";
import { useEffect, useState } from "react";
import { arrayRemove, arrayUnion, doc, getDoc, updateDoc } from "firebase/firestore";
import {TextField } from "@mui/material";
import { showUser } from "../Context";
import { toast } from "react-toastify";
import { deleteObject, getDownloadURL, listAll, ref, uploadBytes } from 'firebase/storage';



interface cidades{
    cidades: string[];
    docId: string;
}

interface user{
    citys:string[];
    email:string;
    jobs:[];
    name:string;
    number:string;
    userId: string;
}

export default function LocationPhoto(){

    //context 

    const {userId}= showUser()
    //atualizar 
    const [atualizar, setAtualizar]=useState(0);
    //cidades, usuario e imagem
    const [citys, setCitys]=useState<cidades | null>(null);
    const [user, setUser] = useState<user | null>(null);
    const [imagemUrl, setImgUrl]=useState<string[]>([])
    const [image, setImage] = useState<File | null>();

  useEffect(() =>{
          const getCitys = async ()=>{
            const getCityRef = doc(db, 'cidades', 'citys');
            const getDocuCity = await getDoc(getCityRef)
            if(getDocuCity.exists()){
                const cidades = getDocuCity.data() as cidades
                setCitys(cidades)
            }
          }
         const getUser = async ()=>{
            if(userId){
            const docRef = doc(db, 'users', String(userId))
            const getDocu = await getDoc(docRef);
            if(getDocu.exists()){
            const usuario = getDocu.data() as user;
            setUser(usuario);
            }else{

            }
}
         }
         const getImage = async ()=>{
          const storageRef = ref(storage,`users/${userId}/perfil/`)
          const listResult = await listAll(storageRef)
          const getResult = await listResult.items.map(item => getDownloadURL(item))
          const imagem = await Promise.all(getResult)
          setImgUrl(imagem)
         }

         getImage();
          getUser();
          getCitys();
  },[userId,atualizar])

  //ataualizar ou criar uma cidade
  const [selectd, setSelectd]=useState("");

  const updateCity= async()=>{
    if(userId == ''|| selectd == ''){
      toast.warning('Por favor preencha o campo');
    }else{
        //para poder comparar as strings
        const normalizeString = (str: string) => {
          return str.trim().toLowerCase().normalize("NFD")
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/\s+/g, ''); 
      };
        
         const cityRegister = citys?.cidades.some(city => normalizeString(city) === normalizeString(selectd))
         const userCityRegister = user?.citys.some((e)=>  normalizeString(e) ==  normalizeString(selectd))
       if(!userCityRegister){
        try{

         const userRef = doc(db, 'users',String(userId))
         await updateDoc(userRef,{
          citys:arrayUnion(selectd)
         });

         if(!cityRegister){
        const cityRef = doc(db, 'cidades', 'citys')
         await updateDoc(cityRef,{
          cidades:arrayUnion(selectd)
         });
         }


         toast.success("Cidade cadastrada com sucesso");

         const atl = atualizar + 1;
         setAtualizar(atl);
        }catch{
         toast.error("Erro inesperado ao fazer cadastro")
        }         
           } else{
           toast.warning("Você já cadastrou essa cidade");
       }
    }
  }

  const RemoveCity= async(idUser : string,cidade : string)=>{
    try{    
    const userRef = doc(db, 'users', idUser);
    await updateDoc(userRef,{
      citys : arrayRemove(cidade)
    })
    toast.success("Cidade Removida com sucesso");
    const atl = atualizar + 1;
    setAtualizar(atl);
  }catch{
    toast.error("algo deu errado")
  }
  }

  const HandleSendPh = async ()=>{
    if(image == null){
      toast.warning("coloque uma imagem");
    }else{
      try{
        const storageRef = ref(storage,`users/${userId}/perfil/${image}`)
        deleteObject(storageRef).then(()=>{
          console.log("delete")
        }).catch((error)=>{
          console.log(error);
        })
        uploadBytes(storageRef, image).then(()=>{
          console.log("upload")
        }).catch((error)=>{
          console.log(error);
        })
       toast.success("Imagem enviada com sucesso");
      }catch{
     toast.error("erro ao enviar imagem")
      }
    }
  }

    return(
        <div className={styles.locationPhoto}>

          {userId?(
            <>
           <h1>Escolha os locais que podera atuar e também a sua foto</h1>
            <div className={styles.locateDiv}>

                <div className={styles.selectCityDiv}>
                <TextField
                        label="Nome da sua cidade"
                        id="outlined-size-small-1"
                        size="small"
                        onChange={(e)=>{ setSelectd(e.target.value)}}
                        value={selectd}
                        sx={{ width: 300 }}
                    />    

                 <button className={styles.button1} onClick={updateCity}>enviar</button>
                </div>
                  {user?.citys[0] ?(
                    <>
                 <div className={styles.locateCityDiv}>
                 {user?.citys.map((city)=>(
                  <div className={styles.city} key={city}>
                  <ClearIcon style={{cursor:"pointer"}} onClick={(e) =>RemoveCity(user.userId, city)}/>
                  <h3>{city}</h3>
                 </div>
                 ))}
                 </div>
                 </>
                 ):(<h3>Você não cadastrou nenhuma cidade</h3>)}
            </div>
            
            <div className={styles.photoDiv}>
                <h1>sua foto atual</h1>
                 {imagemUrl.length > 0 ?(
                  <>
                  <Image src={imagemUrl[0]} alt="perfil"  className={styles.photo} priority width={300} height={300}/>
                  </>
                 ):(<><Image src={foto} alt="perfil"  className={styles.photo} priority/></>)}
                    <input 
                    type='file' 
                    accept="image/png, image/jpeg" 
                    onChange={(event) => {
                      const fileList = event.target.files;
                      // Verifica se fileList não é null e contém arquivos
                      setImage(fileList && fileList.length > 0 ? fileList[0] : null);
                    }}
                    />
                    <br/>
                    <button onClick={HandleSendPh}>Mudar foto</button>
            </div>
            </>
          ):(<><h1>Porvafor se conect</h1></>)}
        </div>
    )
}