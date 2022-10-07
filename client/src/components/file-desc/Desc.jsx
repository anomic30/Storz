import React, { useState, useEffect } from 'react'
import './Desc.css'
import ipfs_logo from '../../assets/icons/ipfs.png'
import diamond_logo from '../../assets/icons/diamond.png'
import delete_icon from '../../assets/icons/delete.png'
import share_icon from '../../assets/icons/share.png'
import download_icon from '../../assets/icons/download.png'
import arrow_icon from '../../assets/icons/arrow.png'
import { useLocation, useNavigate } from 'react-router-dom'
import Axios from 'axios'
import Tippy from '@tippyjs/react'
import 'tippy.js/dist/tippy.css'
import { formatBytes } from '../../utils/formatBytes'
import { saveAs } from 'file-saver';
import { motion } from 'framer-motion'
import { CopyToClipboard } from 'react-copy-to-clipboard';
import copy_icon from '../../assets/icons/copy.png'
import copy_icon_solid from '../../assets/icons/copy-solid.png'
import toast, { Toaster } from 'react-hot-toast';
import { formatDateAndTime } from '../../utils/formatDates';

function Desc() {
  const navigate = useNavigate();
  const location = useLocation();

  const [copied, setCopied] = useState(false);

  const owner = location?.state?.owner;
  const file = location?.state?.val;

  const [showPublicUrl, setShowPublicUrl] = useState(file?.public);

  function copi() {
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 500);
  }

  function makePublic() {
    Axios.patch(`${process.env.REACT_APP_SERVER_URL}/api/user/makePublic/${file?.cid}`, {state: !showPublicUrl}, { headers: { Authorization: 'Bearer ' + window.localStorage.getItem("didToken") } }).then(res => {
      console.log(res.data.message);
      // alert(res.data.message);
      toast(res.data.message, {
        icon: '✅',
        style: {
          borderRadius: '5px',
          background: '#333',
          color: '#c8c8c8',
        },
      });
      setShowPublicUrl(!showPublicUrl);
    }).catch(err => {
      console.log(err);
      toast(err.response.data.message, {
        icon: '❌',
        style: {
          borderRadius: '5px',
          background: '#333',
          color: '#c8c8c8',
        },
      });
    })
  }

  function deletePrompt() {
    toast((t) => (
      <span>
        Deleting this file will remove it <b>permanently.</b>
        <button className='toast-button' onClick={() => { deleteFile(t) }}>
          Delete
        </button>
        <button className='toast-button' onClick={() => { toast.dismiss(t.id) }}>
          Cancel
        </button>
      </span>
    ), {
      icon: '⚠️',
      style: {
        borderRadius: '5px',
        background: '#333',
        color: '#c8c8c8',
      },
    });
  }

  function deleteFile(t) {
    toast.dismiss(t.id);
    Axios.patch(`${process.env.REACT_APP_SERVER_URL}/api/user/deleteFile/${file?.cid}`, {}, { headers: { Authorization: 'Bearer ' + window.localStorage.getItem("didToken") } }).then(res => {
      console.log(res.data.message);
      toast(res.data.message, {
        icon: '✅',
        style: {
          borderRadius: '5px',
          background: '#333',
          color: '#c8c8c8',
        },
      });
      setTimeout(() => {
        navigate("../myFiles")
      }, 2000);
    }).catch(err => {
      console.log(err);
      toast(err.response.data.message, {
        icon: '❌',
        style: {
          borderRadius: '5px',
          background: '#333',
          color: '#c8c8c8',
        },
      });
    })
  }

  async function downloadFile() {
    const toastId = toast((t) => (
      <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
        <img src="https://user-images.githubusercontent.com/63467479/178494249-9a432f70-12be-4e18-a633-8a64f4c8e163.svg" alt="⏳" />
        Decrypting your file and downloading.
      </span>
    ), {
      style: {
        borderRadius: '5px',
        background: '#333',
        color: '#c8c8c8',
      },
      duration: 10000,
    });

    Axios({
      method: "get",
      url: `${process.env.REACT_APP_SERVER_URL}/api/download/secure/${file?.cid}/${window.localStorage.getItem("didToken")}`,
      responseType: "arraybuffer"
    })
      .then((response) => {
        var link = document.createElement("a");
        link.href = window.URL.createObjectURL(
          new Blob([response.data],
            { type: "application/octet-stream" })
        );
        link.download = `${file?.file_name}`;
        document.body.appendChild(link);
        link.click();
        toast.dismiss(toastId);
        setTimeout(function () {
          window.URL.revokeObjectURL(link);
        }, 200);
      })
      .catch((error) => { });
  }

  return (
    <motion.div className="large-description"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}>
      <Toaster />
      <div className="butter-bar">
        <p id="back" onClick={() => navigate("../myFiles")}>File</p>
        <img src={arrow_icon} alt=">" />
        <p>{file?.file_name}</p>
      </div>
      <div className="glass-desc-con">
        <div className="glass-file-desc">
          <div className="glass-file-box">
            <p className='file-name'>
              {file?.file_name}
            </p>
            <div className="img-link">
              <div className='img-link-con'>
                {showPublicUrl ? <img src={diamond_logo} alt="logo" /> : null}
                <img src={ipfs_logo} alt="ipfs logo" />
              </div>
              <div className='links-container'>
                {showPublicUrl ?
                  <div className="link-con">
                    <input readOnly className="link" value={`${process.env.REACT_APP_SERVER_URL}/api/download/${file?.cid}`} />

                    <CopyToClipboard text={`${process.env.REACT_APP_SERVER_URL}/api/download/${file?.cid}`}>
                      
                        {(copied ? <img src={copy_icon_solid} alt="copied" /> :
                          <img src={copy_icon} id="copy" alt="not copied" onClick={() => copi()} />)}
                      
                    </CopyToClipboard>

                  </div> : <></>}
                {/* <p className="gen-link">
                  <a href={`http://localhost:8080/api/download/${file?.cid}`} target="_blank" rel='noreferrer'>{`http://localhost:8080/api/download/${file?.cid}`}</a>
                </p> */}
                <a href={`https://ipfs.io/ipfs/${file?.cid}`} className='verify-ipfs' target="_blank" rel='noreferrer'>
                  Verify on IPFS
                </a>
              </div>
            </div>
          </div>
        </div>
        <div className="outline-con">
          <div className="outline-head">
            <div>File Information</div>
            <div className='file-actions'>
              <Tippy content="Share">
                <button onClick={() => makePublic()}> <img src={share_icon} alt="" /> </button>
              </Tippy>
              <Tippy content="Download">
                <button onClick={() => downloadFile()}><img src={download_icon} alt="" /></button>
              </Tippy >
              <Tippy content="Delete">
                <button onClick={() => deletePrompt()}><img src={delete_icon} alt="" /></button>
              </Tippy>
            </div>
          </div>
          <div className="outline-desc">
            <div className="outline-desc-key">
              <p className="keys">
                Name:
              </p>
              <p className="keys">
                Owner:
              </p>
              <p className="keys">
                Created:
              </p>
              <p className="keys">
                Size:
              </p>
              <p className="keys">
                CID:
              </p>

            </div>
            <div className="outline-desc-desc">
              <p className="key-desc">
                {file?.file_name}
              </p>
              <p className="key-desc">
                {owner}
              </p>
              <p className="key-desc">
                {formatDateAndTime(file?.file_creationDate)}
              </p>
              <p className="key-desc">
                {formatBytes(file?.file_size)}
              </p>
              <p className="key-desc">
                {file?.cid}
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default Desc