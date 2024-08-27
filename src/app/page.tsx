'use client'


import styles from "./page.module.css";
import Image from "next/image";
import start from '../Assets/imageStart.png'
import nega from '../Assets/nega.png'
import cod from '../Assets/Group 1.png'
import fis from '../Assets/Group 2 (1).png'
import psi from '../Assets/Group 3.png'
import userI from '../Assets/Pfps.jpeg'


import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import Autocomplete from '@mui/joy/Autocomplete';
import Link from "next/link";
import { useEffect, useState } from "react";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { db, storage } from "./firebase";
import { getDownloadURL, listAll, ref } from "firebase/storage";
import { Rating } from "@mui/material";


interface job {
  name: string;
  text1: string;
  text2: string;
  jobId: string;
  notas: number[]
}

interface user {
  citys: string[],
  email: string,
  jobs: [job],
  name: string,
  number: string,
  userId: string,
  imagemUrl: string
}

export default function Home() {

  const [citys, setCitys] = useState<string[]>([])
  const [selectCity, setSelectCity] = useState<string | null>(null)
  const [selectJob, setSelectJob] = useState<string | null>(null)
  const [users, setUsers] = useState<user[]>([]);
  const [filterUsers, setFilterUsers] = useState<user[]>([])
  const [jobs, setJobs] = useState<string[]>([]);


  useEffect(() => {
    const getCitys = async () => {
      const citysRef = doc(db, "cidades", "citys")
      const getDocu = await getDoc(citysRef);
      if (getDocu.exists()) {
        const citys = getDocu.data().cidades
        setCitys(citys)
      }
    }
    const getUsers = async () => {
      const usersDocs = await getDocs(collection(db, "users"));
      const docs = await usersDocs.docs.map(doc => {
        const data = doc.data();
        return {
          name: data.name,
          email: data.email,
          number: data.number,
          userId: data.userId,
          citys: data.citys,
          jobs: data.jobs
        } as user
      })
      setUsers(docs)
    }

    const getJobs = async () => {
      const jobsRef = await doc(db, 'trabalhos', 'trabalhos')
      const jobs = await getDoc(jobsRef);
      if (jobs.exists()) {
        const job = jobs.data();
        setJobs(job.trabalhos);
      }
    }
    getJobs()
    getUsers()
    getCitys()
  }, []);

              //para poder comparar as strings
              const normalizeString = (str: string) => {
                return str.trim().toLowerCase().normalize("NFD")
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/\s+/g, ''); 
            };

  useEffect(() => {
    const getJobs = async () => {
      if (users) {
        try {


          if(selectJob && selectCity){
          const usuarios = users.filter(user => user.citys.some(c => normalizeString(c) === normalizeString(selectCity))
            && user.jobs.some(c => normalizeString(c.name) === normalizeString(selectJob)));
          if (usuarios) {
            const usuariosComImagens = await Promise.all(
              usuarios.map(async user => {
                const storageRef = ref(storage, `users/${user.userId}/perfil/`);
                const listResult = await listAll(storageRef);
                const getResult = listResult.items.map(item => getDownloadURL(item));
                const imagem = await Promise.all(getResult);

                // Retorna um novo objeto de usuário com a URL da imagem adicionada
                return {
                  ...user,
                  imagemUrl: imagem[0]
                };
              })
            );
            setFilterUsers(usuariosComImagens);
          }
          }
        } catch (err) {

        }
      }
    }
    getJobs();
  }, [selectCity, selectJob, users]);

  return (
    <main className={styles.main}>
      <div className={styles.startItens}>
        <div className={styles.textStart}>
          <h1>Contrate um serviço de qualidade sem sair de casa</h1>
          <p>aqui você podera contratar pessoas de qualquer serviço do seu interesse</p>
          <button>Procurar funcionarios</button>
        </div>
        <Image src={start} alt="start" className={styles.firstImage} />
      </div>

      <div className={styles.Line}>
        <h1>Nos deixe mostrar a você os melhores funcionarios</h1>
      </div>

      <div className={styles.servicesDiv}>

        <h1>Buscamos entregar todos os tipos de serviços a você</h1>
        <p>Temos serviços de digitais, mão de obra e ate intelectuais</p>
        <div className={styles.servicesDivContent}>

          <div className={styles.servicesOne}>
            <Image src={cod} alt="image" />
            <h2>Desenvolvedores</h2>
            <p>Fornecemos uma ampla disponiblidade de desenvolvedores, que podem te ajudar a alcansar seus maiores objetivos</p>
          </div>

          <div className={styles.servicesTwo}>
            <Image src={fis} alt="image" />
            <h2>Prestadores de serviços</h2>
            <p>temos de fisioterapeutas e professores de educação fisica a pintores e pedreiros que podem te ajudar com seus serviços</p>
          </div>

          <div className={styles.servicesTree}>
            <Image src={psi} alt="image" />
            <h2>Ajuda psicologica</h2>
            <p>Conseguimos além de ajudar com sua saúde fisica também fornecemos ajuda mental</p>
          </div>

        </div>
      </div>


      <h1 style={{ fontSize: "40px", fontWeight: "600", textAlign: "center" }}>Escolha onde e qual profissional que deseja</h1>
      <div className={styles.FormDiv}>
        <div className={styles.formInputs}>
        <FormControl id="filter-demo">
          <FormLabel>Selecione a cidade</FormLabel>
          <Autocomplete
            placeholder="Escolha a cidade"
            sx={{ width: 200 }}
            className={styles.firstInput}
            options={citys}
            onChange={(e, value) => setSelectCity(value)}
          />
        </FormControl>
        <FormControl id="filter-demo">
          <FormLabel>Selecione o serviço</FormLabel>
          <Autocomplete
            placeholder="Escolha o serviço"
            sx={{ width: 300 }}
            className={styles.secondInput}
            options={jobs}
            onChange={(e, value) => setSelectJob(value)}
          />
        </FormControl>
      </div>
        <div className={styles.formResults}>
          {selectJob && selectCity ? (
            <>
              {filterUsers.length > 0 ? (
                <>
                  {filterUsers.map(user => (
                    <div key={user.userId} className={styles.worker}>
                      <Link href={`./Workers/${user.userId}/${selectJob}`}style={{ textDecoration: "none", color: "inherit", cursor:"pointer" }}>
                      {user.imagemUrl ? (
                        <Image
                          src={user.imagemUrl}
                          alt={user.userId}
                          priority
                          width={300}
                          height={300}
                          className={styles.workerImg}
                        />
                      ) : (
                        <Image src={userI} alt={user.userId} priority width={300} height={300} className={styles.workerImg} />
                      )}
                      <div className={styles.workerContent}>
                      <h1>{user.name}</h1>
                      {user.jobs.filter((job) => normalizeString(job.name) === normalizeString(selectJob)).map((job) =>{
                      const notas = job.notas?.reduce((acc, nota)=> acc + nota, 0)
                      const number = parseFloat((notas / job.notas?.length).toFixed(2))
                      return(
                      <div key={job.jobId}>
                      {number ?(
                      <Rating defaultValue={number} readOnly /> 
                      ):(<h1 >Ainda sem avaliação</h1>)}
                      </div>
                      )})}
                      </div>
                      </Link>
                    </div>
                  )
                  )}
                </>
              ) : (
                <h1>Infelizmente não achamos nenhum funcionario na sua região</h1>
              )}
            </>
          ) : (
            <h1>
              Caso não tenha sua cidade ou a profisão desejada nos ainda
              não temos funcionarios nessa area
            </h1>)}

        </div>
      </div>


      <div className={styles.aboutBack}>
        <div className={styles.aboutContent}>
          <h1>Porque contratar conosco</h1>
          <div className={styles.aboutItens}>
            <Image src={nega} alt="nega" className={styles.aboutImage} priority width={300} height={300}/>
            <div className={styles.aboutText}>
              <p>A TalentTrove é a plataforma ideal para encontrar e contratar profissionais de serviços essenciais para o seu dia a dia. Seja você proprietário de uma casa, locatário ou empresa, a TalentTrove conecta você aos melhores prestadores de serviços em diversas áreas, como pintura, encanamento, eletricidade, jardinagem, limpeza e muito mais.</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}


