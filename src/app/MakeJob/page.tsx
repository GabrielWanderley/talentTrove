'use client'

import  styles from '../styles/MakeJob.module.css'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { TextField } from '@mui/material'
import { showUser } from '../Context'
import { arrayUnion, doc, getDoc, updateDoc } from 'firebase/firestore'
import { db, storage } from '../firebase'
import { toast } from 'react-toastify'
import { ref, uploadBytes } from 'firebase/storage'
import 'react-toastify/dist/ReactToastify.css';



interface comentario{
  avaliacao:string,
  nota: number,
  comentario:string
  userId:string
}

interface job {
  name: string;
  text1: string;
  text2: string;
  jobId: string;
  comentarios:[comentario],
  notas: number[]
}

interface user{
    citys:string[];
    email:string;
    jobs:[job];
    name:string;
    number:string;
    userId: string;
}

export default function MakeJob(){
    //context
    const {userId}= showUser()

    //states

    const [prof , setProf] = useState<string>("")
    const [jobs , setJobs] = useState<string[]>([])
    const [text1, setText1] = useState("");
    const [text2, setText2] = useState("");
    const [image, setImage] = useState<File | null>(null);
    const [video, setVideo] = useState<File | null>(null);
    const [user, setUser] = useState<user | null>(null);
    const [atul, setAtul] = useState(0);

    //mostruario
    const [image1, setImage1] = useState("");
    const handleImageChange = (event:any) => {
        setImage(event.target.files[0]);
        setImage1(URL.createObjectURL(event.target.files[0]));
    };

    const [video1, setVideo1] = useState("");
    const handleVideoChange = (event:any) => {
        setVideo(event.target.files[0]);
        setVideo1(URL.createObjectURL(event.target.files[0]));
    };

useEffect(()=>{
  const getUser = async ()=>{
    if(userId){
    const docRef = doc(db, 'users', String(userId))
    const getDocu = await getDoc(docRef);
    if(getDocu.exists()){
    const usuario = getDocu.data() as user;
    setUser(usuario);
    console.log("carregou");
    }else{
    }
  }
}
  const getJobs = async ()=>{
    const jobsRef = await doc(db, 'trabalhos', 'trabalhos')
    const jobs = await getDoc(jobsRef);
    if(jobs.exists()){
     const job = jobs.data();
     setJobs(job.trabalhos);
    }
    
  };
  getJobs();
  getUser();
},[userId,atul]);


    const handleEnviar = async() => {
    if(prof && text1 && text2 && image){
      try{
        //para poder comparar as strings
        const normalizeString = (str: string) => {
          return str.trim().toLowerCase().normalize("NFD")
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/\s+/g, ''); 
      };
      
      const jobExists = user?.jobs.some(job => normalizeString(job.name) === normalizeString(prof));
      const jobRegister = jobs.some(job=>normalizeString(job) === normalizeString(prof))

      console.log("oi",jobExists)
        const jobId = String(Math.random() + prof);
      if(!jobExists){
            const docRef = doc(db, 'users', String(userId))
            await updateDoc(docRef,{
                jobs:arrayUnion(
                   {
                     name: prof,
                     text1: text1,
                     text2: text2,
                     jobId: jobId,
                     notas:[],
                     comentarios:[],
                   }
                )
            })
            if(image){
              const imageRef = ref(storage,`users/${userId}/jobs/${jobId}/image/image`)
              uploadBytes(imageRef, image).then(()=>{
                  console.log("upload Image")
                }).catch((error)=>{
                  toast.error("Error ao enviar Imagem")
                })
          }
          if(video){
              const videoRef = ref(storage,`users/${userId}/jobs/${jobId}/video/video`)
              uploadBytes(videoRef, video).then(()=>{
                  console.log("upload video")
                }).catch((error)=>{
                  toast.error("Error ao enviar video")
                })
          }
           //cadastrar a profissão
           if(jobRegister)
            {
             console.log("Já tem no banco");
            }else{
              const jobsRef = await doc(db, 'trabalhos', 'trabalhos')
              await updateDoc(jobsRef,{
                trabalhos: arrayUnion(prof)
              })
              console.log("Não tem");
            }

                setText1("")
                setText2("")
                setProf("")
                setImage(null)
                setVideo(null)
                setImage1("")
                setVideo1("")
                toast.success("Trabalho criado com sucesso")
                const atl = atul + 1
                setAtul(atl)
          }else{
            toast.warning("Você já cadastrou essa profissão")
          }

      }catch{
       toast.error("Erro ao enviar arquivos");
      }

    }else{
      toast.warning("Preencha todos os campos de texto, e escolha uma foto");
    }

    }

    useEffect(() => {console.log(jobs);},[jobs]);
    
    return(
        <div className={styles.MakeJob}>
            
          {userId?(
            <>           

            <div className={styles.FormJob}>
              <div className={styles.FormJobContent}>
                <h1>Preencha os dados do seu trabalho ou serviço</h1>
                <div>
                <div className={styles.inputMakeJob}>
                <TextField
                        label="Escreva seu serviço"
                        id="outlined-size-small-1"
                        size="small"
                        onChange={(e)=>{ setProf(e.target.value)}}
                        sx={{ width: 300 }}
                        className={styles.inputJob}
                        value={prof}
                    />                     
                </div>
                </div>
                <textarea
                 onChange={(e)=> setText1(e.target.value)}
                 value={text1}
                /> <br/>
                <input 
                type='file' 
                accept="image/png, image/jpeg" 
                onChange={handleImageChange}
                />
                <br/>
                <textarea 
                    onChange={(e)=> setText2(e.target.value)}
                    value={text2}
                />
                <br/>
                <input 
                type='file' 
                accept="video/*" 
                onChange={handleVideoChange}
                />
                <br/>
                <button className={styles.button1} onClick={handleEnviar}>Enviar trabalho</button>
                <h1>Veja como sua pagina ficara logo a abaixo</h1>
            </div>
            </div>

            <div className={styles.work}>
            <div className={styles.workContent}>
                <h1>{prof}</h1>
                <p>
                 {text1}
                </p>
                {image1 &&(
                <Image src={image1} alt='tete' className={styles.image1} width={100} height={50}/>
                 )}
                <p>
                 {text2}
                </p>

                {video1 &&(
                <video className={styles.video} controls>
                <source src={video1} type="video/mp4" />
                Your browser does not support the video tag.
                </video>
                )}
             </div>   
            </div>
            </>
        ):(<><h1>Porvafor se conect</h1></>)}
        </div>
    )
}