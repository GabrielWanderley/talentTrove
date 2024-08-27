'use client'

import styles from '../styles/UpdateDoc.module.css'
import DeleteIcon from '@mui/icons-material/Delete';
import { TextField } from '@mui/material';
import { useEffect, useState } from 'react';
import { showUser } from '../Context';
import { arrayRemove, arrayUnion, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db, storage } from '../firebase';
import 'react-toastify/dist/ReactToastify.css';
import { deleteObject, getDownloadURL, listAll, ref, uploadBytes } from 'firebase/storage';
import Image from 'next/image';
import { toast } from 'react-toastify';




interface job{
    name: string;
    text1: string;
    text2: string;
    jobId: string;
}

interface user{
    citys:string[];
    email:string;
    jobs:[job];
    name:string;
    number:string;
    userId: string;
}

export default function UpadateDoc(){
   //context
    const {userId} = showUser()

  //states
    const [user, setUser] = useState<user | null>(null);
    const [jobs , setJobs] = useState<string[]>([])
    const [jobSelect, setJob] =useState("")
    const [jobData,setJobData] = useState<job | null>(null);

    const [prof, setProf] = useState("")
    const [text1, setText1] = useState("")
    const [text2, setText2] = useState("")
    const [jobId, setjobId] = useState("")

    const [image1, setImage1] = useState<string[]>([]);
    const [video1, setVideo1] = useState<string[]>([]);

    const [NImage, setNImage] = useState<File|null>(null);
    const [NVideo, setNVideo] = useState<File|null>(null);
    
    const [atl, setAtl] = useState(0)

  //getUser
    useEffect(()=>{
        const getDados = async()=>{
            try{
            if(userId){
           const getUserRef = doc(db, "users", userId)
           const getDocu = await getDoc(getUserRef)
           if(getDocu.exists()){
              setUser(getDocu.data() as user)
           }
        }
        
            const jobsRef = await doc(db, 'trabalhos', 'trabalhos')
            const jobs = await getDoc(jobsRef);
            if(jobs.exists()){
             const job = jobs.data();
             setJobs(job.trabalhos);
            }
        
    }catch(error){ console.log(error)}
        }
        getDados();
    },[userId, atl]);

    //setJob

    const handleJobClick = (jobName : string, jobId : string) => {
        setJob(jobName);
        setjobId(jobId);
        setVideo1([])
      };

 // get Job

 useEffect(()=>{
    const getDados = async()=>{
      try{

             const rJob = user?.jobs.filter(job => job.name === jobSelect);
            
             if (rJob && rJob.length > 0) {
                setJobData(rJob[0]);
                setProf(rJob[0].name);
                setText1(rJob[0].text1)
                setText2(rJob[0].text2)
                setjobId(rJob[0].jobId)
            }
 
            const storageImgRef = ref(storage,`users/${userId}/jobs/${jobId}/image/`)
            const listResult = await listAll(storageImgRef);
            const result = await listResult.items.map(item => getDownloadURL(item))
            const image = await Promise.all(result)
            setImage1(image);

            const storageVideoRef = ref(storage,`users/${userId}/jobs/${jobId}/video/`)
            const listResultV = await listAll(storageVideoRef);
            const resultV = await listResultV.items.map(item => getDownloadURL(item))
            const video = await Promise.all(resultV)
            setVideo1(video)
      }catch{

      }
    }
    getDados()
 },[jobSelect]);

 //alterar trabalho

 const handleAlterJob = async ()=>{
   
    if(prof && text1 && text2){
        try{
            
            //para poder comparar as strings
            const normalizeString = (str: string) => {
                return str.trim().toLowerCase().normalize("NFD")
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/\s+/g, ''); 
            };
            
            const jobRegister = jobs.some(job=>normalizeString(job) === normalizeString(prof))

            const getUserRef = doc(db, "users", userId)
            const newJob = user?.jobs.map(job => job.name === jobSelect ?
                  {...job, name: prof, text1: text1, text2:text2, jobId : job.jobId} : job
            );
            await updateDoc(getUserRef,{
                jobs: newJob
            });


           if(NImage){
             const newStorageRefImg = ref(storage,`users/${userId}/jobs/${jobId}/image/image`)
             uploadBytes(newStorageRefImg, NImage).then(()=>{
                console.log("upload Image")
              }).catch((error)=>{
                toast.error("Error ao enviar Imagem")
              })
            }              
            
            if(NVideo){
                const newStorageRefImg = ref(storage,`users/${userId}/jobs/${jobId}/video/video`)
                uploadBytes(newStorageRefImg, NVideo).then(()=>{
                   console.log("upload Video")
                 }).catch((error)=>{
                   toast.error("Error ao enviar Video")
                 })
                }

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
            
          setJob("")
          toast.success("Alterado com sucesso!");
        }catch(error){
            toast.error("Erro ao atualizar seus dados");
            console.log(error);
        }

    }else{
        toast.warning("Perfavor matenha tudo preenchido")
    }
 }


const deleteJob = async() => {
 try{
    const getUserRef = doc(db, "users", userId)
    const jobsN = user?.jobs.filter(job => job.jobId !== jobId)

    await updateDoc(getUserRef,{
        jobs: jobsN
    })

    const storageRefI = ref(storage,`users/${userId}/jobs/${jobId}/image/image`)
    const storageRefV = ref(storage,`users/${userId}/jobs/${jobId}/video/video`)
    
    console.log(jobId);

    deleteObject(storageRefI).then(() => {console.log("deletado")}).catch(() => {console.log("erro")});
    deleteObject(storageRefV).then(() => {console.log("deletado")}).catch(() => {console.log("erro")});
    
    const atlu = atl + 1;
    setAtl(atlu)
      setJob("")

   toast.success("Deletado com sucesso")
 }catch(error){
    console.log(error);
 }

};

    return(
        <div className={styles.updateDoc}>

            <h1>Edite ou delete suas profissões</h1>

            <div className={styles.workers}>
                {user?.jobs.map(job => {
                    const isSelect = job.name === jobSelect;
                    if(jobSelect === ""){
                        setJob(user?.jobs[0].name);
                        setjobId(user?.jobs[0].jobId);
                    }
                    return (
                        <h3
                            key={job.jobId}
                            onClick={(e) => handleJobClick(job.name, job.jobId)}
                            style={{boxShadow: isSelect ? '0 2px rgba(0, 0, 0, 0.801)' : '4px 4px rgba(0, 0, 0, 0.801)'
                            }}
                        >{job.name}</h3>
                    )
                })}
            </div>
            {jobData ?(
    <>

            <div className={styles.FormJob}>
                <DeleteIcon className={styles.DeleteIcon} onClick={e =>deleteJob()} />
                <div className={styles.FormJobContent}>
                    <h1>{jobData.name}</h1>
                    <h1>Altere os dados nescessarios</h1>
                    <div>
                        <div className={styles.inputMakeJob}>
                            <TextField
                                label="Nome do seu trabalho"
                                id="outlined-size-small-1"
                                size="small"
                                sx={{ width: 300 }}
                                className={styles.inputJob}
                                value={prof}
                                onChange={e => setProf(e.target.value)}
                            />
                        </div>

                    </div>
                    <textarea
                    value={text1}
                    onChange={e => setText1(e.target.value)}
                    /> <br />
                    <h3>Altere sua imagem</h3>
            {image1[0]?.length > 0 && (
            <Image src={image1[0]} alt="perfil" className={styles.photo} priority width={300} height={300}/>
            )}          
                   <br />
                    <input
                        type='file'
                        accept="image/png, image/jpeg"
                        onChange={e => {
                            const fileList = e.target.files;
                            setNImage(fileList && fileList.length > 0 ? fileList[0] : null)}}
                    />
                    <br />
                    <textarea
                    value={text2}
                    onChange={e => setText2(e.target.value)}                    
                    />
                    <br />
                    <h3>Envie ou altere seu video</h3>
                    {video1[0] &&(
                <video className={styles.video} controls>
                <source src={video1[0]} type="video/mp4" />
                Your browser does not support the video tag.
                </video>
                )}
                    <input
                        type='file'
                        accept="video/*"
                        onChange={e => {
                            const fileList = e.target.files;
                            setNVideo(fileList && fileList.length > 0 ? fileList[0] : null)}}
                    />
                    <br />
                    <button className={styles.button1} onClick={handleAlterJob}>Alterar trabalho</button>
                </div>
        </div>
        </>       ):(
    <>
    <h1>Cadastre um tranbalho para poder editalo</h1>
    </>
)}
    
        </div>
    )
}