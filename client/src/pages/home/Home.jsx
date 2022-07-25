import React, { useState } from 'react'
import './Home.css'
import upload_icon from '../../assets/icons/upload.png'
import { useDropzone } from 'react-dropzone'
import cross from '../../assets/icons/cross.png'
import uploading_spinner from '../../assets/images/encryption.gif'
import success_spinner from '../../assets/images/success.gif'
import Axios from 'axios';
import { formatBytes } from '../../utils/formatBytes';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion'
import gradient_triangle from '../../assets/images/gradient-triangle.png'
import right_gradient_triangle from '../../assets/images/right-gradient-triangle.png'
import glass_triangle from '../../assets/images/glass-triangle.svg'
import right_glass_triangle from '../../assets/images/right-glass-triangle.svg'
import toast, { Toaster } from 'react-hot-toast';


function Home() {
  const userName = window.localStorage.getItem('userName');
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [success, setSuccess] = useState(false);
 
  const { getRootProps, getInputProps } = useDropzone({
    onDrop: (acceptedFiles) => {
      setFiles(acceptedFiles);
      console.log(acceptedFiles);
    }
  })

  function handleDelete(index) {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
  }

  //function to create form data from files
  function createFormData(files) {
    setIsUploading(true);
    const formData = new FormData();
    files.forEach(file => {
      formData.append(`files`, file);
    });
    // console.log(formData);

    //upload files to server
    Axios.post(`${process.env.REACT_APP_SERVER_URL}/api/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': 'Bearer ' + window.localStorage.getItem("didToken")
      }
    })
      .then(res => {
        setFiles([]);
        setTimeout(() => {
          setIsUploading(false);
          setSuccess(true);
          console.log(res.data);

        }, 4000);
      })
      .catch(err => {
        setIsUploading(false);
        toast(err.response.data.message, {
          icon: '❌',
          style: {
            borderRadius: '5px',
            background: '#333',
            color: '#c8c8c8',
          },
          duration: 3000
          });
        console.log(err);
      })
  }

  return (
    <motion.div className='Home' initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}>
      <Toaster/>
      <img src={gradient_triangle} alt="" className='gradient-triangle' />
      <img src={glass_triangle} alt="" className='glass-triangle' />
      <img src={right_gradient_triangle} alt="" className='right-gradient-triangle' />
      <img src={right_glass_triangle} alt="" className='right-glass-triangle' />
      <div className="home-header">
        <p>
          Welcome <span>{userName}</span>
        </p>
        <div className='home-desc'>
          {isUploading ? "Uploading your files to our IPFS network..."
            : success ? "All your files have been encrypted and uploaded to our IPFS network successfully!"
              : "Upload your files securely to our IPFS network"}
        </div>
      </div>

      {!isUploading && !success ? <div className="upload-box-con">
        <div className="upload-box" {...getRootProps()}>
          <input {...getInputProps()} />
          <img src={upload_icon} alt="upload icon" />
          Drop your files here
        </div>
        <div className="glass-row-con">
          {files?.map((file, idx) => {
            return <div className="glass-row" key={idx}>
              <div className='glass-file-name'>{file.name}</div>
              <div className="right">
                <div className="size">
                  {formatBytes(file.size)}
                </div>
                <img src={cross} alt="Delete" className="cross" onClick={() => handleDelete(idx)} />
              </div>
            </div>
          })}
        </div>
      </div> : !success ?
        <div className='upload-spinner-con'>
          <img src={uploading_spinner} alt="uploading spinner" />
        </div> : <div className='upload-success-con'>
          <img src={success_spinner} alt="success spinner" />
          <div className="upload-btn" onClick={() => setSuccess(false)}>
            Upload more files?
          </div>

          <div className="upload-btn" onClick={() => navigate("/app/myFiles")}>
            Go to My Files
          </div>
        </div>
      }


      {!isUploading && !success && files && files.length > 0 ? <div className="upload-btn" onClick={() => createFormData(files)}>
        <p>Upload</p>
      </div> : <></>}


    </motion.div>
  )
}

export default Home