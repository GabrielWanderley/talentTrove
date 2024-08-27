'use client'
import Image from 'next/image';
import styles from '../../../styles/workers.module.css';
import '../../../styles/workers.module.css';
import userI from "../../../../Assets/Pfps.jpeg"
import DeleteIcon from '@mui/icons-material/Delete';


import { useEffect, useState } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db, storage } from '@/app/firebase';
import { getDownloadURL, listAll, ref } from 'firebase/storage';
import { toast } from 'react-toastify';
import { TextField } from '@mui/material';
import Rating from '@mui/material/Rating';
import StarIcon from '@mui/icons-material/Star';
import { showUser } from '@/app/Context';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';


interface Props{
    params:{userId:string, job:string}
}

interface comentario{
    avaliacao:string,
    nota: number,
    comentario:string
    userId:string
    perfil:string
    name:string
}

interface job {
    name: string;
    text1: string;
    text2: string;
    jobId: string;
    comentarios:[comentario],
    notas: number[]
  }
  
  interface user {
    citys: string[],
    email: string,
    jobs: [job],
    name: string,
    number: string,
    userId: string,
  }
  
export default function works({params}:Props) {

    const {userId} = showUser()

const [user, setUser] = useState<user | null>(null);
const [userC, setUserC] = useState<user | null>(null);

const [job, setJob] = useState<job | null>(null);
const [coments, setComents] = useState<comentario[] | null>(null);
const [comentsI, setComentsI] = useState<comentario[] | null>(null);
const [notas, setNotas] = useState<number[] | null>(null);
const [nota, setNota] = useState<number | null>(null);


const [perfilP, setPerfilP] = useState("");
const [selectJob, setSelectJob] =useState("")
const [selectJobId, setSelectJobId] =useState("")

const [newRating, setRating] = useState<number | null>(0);
const [caracter, setCaracter] = useState("");
const [coment, setComent] = useState("");


const [image, setImage] = useState("");
const [video, setVideo] = useState("")



useEffect(() => {
   const getUser = async () =>{
       try{
        const userDocR = doc(db, "users", params.userId);
        const userDocIten = await getDoc(userDocR)
        const userPerfilR = ref(storage, `users/${params.userId}/perfil/`);
        const listResult = await listAll(userPerfilR);
        const getResult = listResult.items.map(item => getDownloadURL(item));
        const imagem = await Promise.all(getResult);
        setPerfilP(imagem[0]) 
        setSelectJob(params.job)
        if(userDocIten.exists()){
            const user = userDocIten.data() as user; 
            setUser(user)
        }
        if(userId){
            const docRef = doc(db, 'users', String(userId))
            const getDocu = await getDoc(docRef);
            if(getDocu.exists()){
            const usuario = getDocu.data() as user;
            setUserC(usuario);
            console.log("carregou");
            }
        }

       }catch{
         toast.error("Error ao pegar usuario")
       }
   }
   getUser()
},[userId])

            //para poder comparar as strings
            const normalizeString = (str: string) => {
                return str.trim().toLowerCase().normalize("NFD")
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/\s+/g, ''); 
            };

useEffect(() =>{
    const getJob = async () =>{
       const trabalho = user?.jobs.filter(job => normalizeString(job.name) === normalizeString(selectJob))
       if(trabalho){
        const jobe = trabalho[0] as job;
         setJob(jobe)
         setSelectJobId(jobe.jobId)
         setNotas(jobe.notas);
         setComents(jobe.comentarios)
        }

       const storageRefI = ref(storage,`users/${user?.userId}/jobs/${selectJobId}/image/`)
       const imageListResult = await listAll(storageRefI);
       const resultImages = await imageListResult.items.map(item => getDownloadURL(item));
       const image = await Promise.all(resultImages)
       setImage(image[0])
       
       const storageRefV = ref(storage,`users/${user?.userId}/jobs/${selectJobId}/video/`)
       const videoListResult = await listAll(storageRefV);
       const resultVideos = await videoListResult.items.map(item => getDownloadURL(item));
       const video = await Promise.all(resultVideos);
       setVideo(video[0])

       
    }
    getJob();
},[selectJob, selectJobId])

useEffect(() =>{
    const getCometsImg = async() =>{
    if(coments){
        const comentsImage = await Promise.all(
        coments.map(async (coment) =>{
            const storageRef = ref(storage, `users/${coment.userId}/perfil/`);
            const listResult = await listAll(storageRef);
            const getResult = listResult.items.map(item => getDownloadURL(item));
            const imagem = await Promise.all(getResult);
            return{
                ...coment,
                perfil: imagem[0]
            }
        }))
        
         setComentsI(comentsImage)
     }
    }
    getCometsImg()
},[coments])

const handleJobClick = (jobId:string, jobName:string)=>{
   setSelectJob(jobName)
   setSelectJobId(jobId)
   setVideo("")
}

const handleRatingChange = (event: React.ChangeEvent<{}>, newValue: number | null) => {
    setRating(newValue); 
  };

const handleComent = async ()=>{
    if(caracter && newRating && coment){
   try{
    if(userId){
    //pega os cometarios 
    const idComente = user?.jobs.filter(jobs => jobs.name === selectJob)

    if(idComente){
            const getComents = idComente[0] as job
            const getComent = getComents.comentarios.map(job => job.userId)
  // checa se comentou pelo id
    if(getComent?.includes(userId)){
        toast.warning("Você já comentou nesse trabalho")
    }else{
        const getUserRef = doc(db, "users", params.userId)
        const newJob = user?.jobs.map(job => job.name === selectJob ?
            {...job,notas:[...job.notas, newRating], 
             comentarios:[...job.comentarios, 
            {avaliacao : caracter, nota:newRating, comentario: coment, 
             userId: userId, name:userC?.name }]} : job
      );
      console.log(newJob, userC?.name)
      await updateDoc(getUserRef,{
        jobs: newJob
    });
    setCaracter('')
    setComent('')
    setRating(0)
    toast.success("Comentario enviado")
}
}
}else{
    toast.warning("Porfavor se conect")

}
}catch(error){
    toast.error("Erro ao enviar seu comentario")
    console.log(error)
}
    }else{
        toast.warning("Preencha todos os dados")
    }
}

useEffect(()=>{
    if(notas){    
        const total = notas?.reduce((acc, nota)=> acc + nota, 0)
        const number = parseFloat((total / notas?.length).toFixed(2))
        setNota(number)
     }
},[notas])

 const handleDeleteComent= async( userId : string, notaU : number)=>{
    try{
       
        const userDocR = doc(db, "users", params.userId);
        const getcoments = user?.jobs.filter(job => job.name === selectJob)
        if(getcoments){
           const coments = getcoments[0]
           const updatedComent = coments.comentarios.filter(com => com.userId !== userId)
           
           const updatedNotas = coments.notas.filter(notas => notas !== notaU)

           const updatedJobs = user?.jobs.map(job => {
            if (normalizeString(job.name) === normalizeString(selectJob)) {
                return {
                    ...job,
                    notas: updatedNotas,
                    comentarios: updatedComent
                };
            }
            return job;
        });
        await updateDoc(userDocR, {
            jobs: updatedJobs
        });
        toast.success("Comentario deletado com sucesso!");
        }
    }catch{
        toast.error("Erro ao deletar seu  comentario")
    } }

    return (

        <div className={styles.containerWorks}>   
        {user ?(<>
            <div className={styles.Worker}>
                <div className={styles.workerContent}>
                {perfilP ? (
                        <Image
                          src={perfilP}
                          alt={"perfil"}
                          priority
                          width={300}
                          height={300}
                          className={styles.userImage}
                        />
                      ) : (
                        <Image src={userI} alt={"perfil"} priority width={300} height={300} className={styles.userImage}/>
                      )}
                    <div className={styles.userText}>
                        <h1>{user?.name}</h1>
                        <h3>Avaliação como {selectJob}</h3>
                        {nota ?(
                        <Rating defaultValue={nota} readOnly/>
                        ):(<h3>Sem avaliação</h3>)}
                        <br />
                        <button>Ver analises</button>
                        {/* icone de whats e email */}
                    </div>
                </div>
            </div>

            <div className={styles.workers}>
                {user?.jobs.map((job) =>{
                const isSelect = normalizeString(job.name) === normalizeString(selectJob);
                if(selectJob === ""){
                    setSelectJob(user?.jobs[0].name)
                }
                    return(
                <h3 
                key={job.jobId}
                onClick={e=> handleJobClick(job.jobId, job.name)}
                style={{boxShadow: isSelect ? '0 2px rgba(0, 0, 0, 0.801)' : '4px 4px rgba(0, 0, 0, 0.801)'}}
                >{job.name}</h3>
                )})}
            </div>
            <div className={styles.work}>
                <div className={styles.workContent}>
                <h1>{job?.name}</h1>
                <p>
                 {job?.text1}
                </p>
                {image ?(
                <Image 
                src={image} 
                alt='tete' 
                className={styles.image1} 
                priority width={300} height={300} />
                ):(<></>)}
                <p>
                 {job?.text2}
                </p>
                {video &&(
                <video className={styles.video} controls>
                <source src={video} type="video/mp4" />
                Your browser does not support the video tag.
                </video>
                )}
                </div>
            </div>
            {userId?(<>
            {userId === params.userId ?(<></>):(<>
            <h1 style={{ textAlign: "center", marginTop: "30px" }}>Deixe seu comentarios</h1>
            <div className={styles.comentDiv}>
                <div>
                    <TextField
                        label="Avaliação"
                        id="outlined-size-small-1"
                        size="small"
                        sx={{ width: 300 }}
                        className={styles.inputJob}
                        value={caracter}
                        onChange={e => setCaracter(e.target.value)}
                    />
                    <br/>     
                    <Rating name="size-large" 
                    defaultValue={0}
                    emptyIcon={<StarIcon style={{ color:"white"}} />}
                    onChange={handleRatingChange}
                    />                    
                    <br/>
                    <textarea
                    placeholder='Comentario'
                    value={coment}
                    onChange={e => setComent(e.target.value)}
                    /> 
                    <br/>
                    <button onClick={handleComent}>Enviar comentario</button>
                </div>
            </div>
            </>)}
            </>):(
                <h1 style={{ textAlign: "center", marginTop: "30px" }}>Se conect para deixar um comentario</h1>
                )}
            <div className={styles.comentContainer}>
            
            {comentsI && comentsI.length > 0 ?(
                <>
            <h1 style={{ textAlign: "center", marginTop: "30px" }}>Comentarios</h1>
                {comentsI?.map(coment =>(
                <div className={styles.coment} key={coment.userId}>
                 <div className={styles.comentContent} key={coment.userId}>
                 {userId === coment.userId ?(<>
                  <DeleteIcon className={styles.deleteIcon} onClick={e => handleDeleteComent(coment.userId, coment.nota)}/>
                  </>):(<></>)}
                <div style={{display:"flex",alignItems: "center", textAlign:"center", justifyContent: "center"}}>
                    {coment.perfil ?(
                    <Image src={coment.perfil} alt='image' className={styles.userImageClient} priority width={300} height={300}/>
                    ):( 
                    <Image src={userI} className={styles.userImageClient} alt={coment.userId} priority width={300} height={300} />
                    )}
                    
                    <h3>{coment.name}</h3>
                </div>
                        <h3>{coment.avaliacao}</h3>
                        <Rating defaultValue={coment.nota} readOnly/>
                        <p>{coment.comentario}</p>
                 </div>
                </div>
                ))}
            </>
           ):( 
           <h1 style={{ textAlign: "center", marginTop: "30px" }}>Ainda sem comentarios</h1>
           )}
            </div>
           </>):(     
            <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center',
                alignItems: 'center',      
                height: '100vh',   
                textAlign: 'center'        
            }}>
             <CircularProgress sx={{ 
                               width: '80px !important',
                               height: '80px !important'
             }} />
           </Box>
        )}
        </div>
    )
}