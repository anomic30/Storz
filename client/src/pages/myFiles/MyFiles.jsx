import React, { useEffect, useState } from 'react'
import './MyFiles.css'
import search_icon from '../../assets/icons/search.png'
import Axios from 'axios'
import Tippy from '@tippyjs/react'
import 'tippy.js/dist/tippy.css'
import file_icon from '../../assets/icons/file-icons/normal-file.png'
import spinner from '../../assets/images/loading.svg'
import eye_icon from '../../assets/icons/eye.png'
import { useNavigate } from 'react-router-dom'
import { formatBytes } from '../../utils/formatBytes'
import { formatDates } from '../../utils/formatDates';
import ReactPaginate from "react-paginate";
import { motion } from 'framer-motion'
import arrow_icon from '../../assets/icons/arrow.png'

const tableHeaders = [
  '', 'Name', '', 'Size', 'Date'
]

function MyFiles() {
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [owner, setOwner] = useState("");

  const fetchFiles = async () => {
    try {
      setIsLoading(true);
      const res = await Axios.post(`${process.env.REACT_APP_SERVER_URL}/api/user/files`, {}, { headers: { Authorization: 'Bearer ' + window.localStorage.getItem("didToken") } });
      setOwner(res.data.owner);
      setFiles(res.data.files);
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
      console.log(err);
    }
  }

  useEffect(() => {
    fetchFiles();
  }, [])

  return (
    <motion.div className='MyFiles'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}>
      <div>
        <div className="file-header">
          <p>
            My Files
          </p>
          <div className='file-desc'>View all of your uploaded files here.</div>
        </div>
        <div className="search-con">
          <div className="search-inp">
            <img src={search_icon} alt="" />
            <input type="text" placeholder="Search" onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>
        {isLoading ?
          <div className='spinner-con'>
            <img src={spinner} alt="Loading..." />
          </div> :
          <PagignatedFiles
            files={files}
            owner={owner}
            search={search}
            itemsPerPage={8}
          />
        }
      </div>
    </motion.div>)
}
const PagignatedFiles = ({ files, owner, search, itemsPerPage }) => {

  const navigate = useNavigate();
  const [currentItems, setCurrentItems] = useState([]);
  const [pageCount, setPageCount] = useState(0);
  const [itemOffset, setItemOffset] = useState(0);
  useEffect(() => {
    const endOffset = itemOffset + itemsPerPage;
    setCurrentItems(files.slice(itemOffset, endOffset));
    setPageCount(Math.ceil(files.length / itemsPerPage));
  }, [itemOffset, itemsPerPage]);

  const handlePageClick = (event) => {
    const newOffset = (event.selected * itemsPerPage) % files.length;
    setItemOffset(newOffset);
  };

  return (
    <div className="table-con">
      <div className="table-glass">
        <table>
          <thead>
            <tr >
              {tableHeaders.map((val, idx) => {
                return <th className='file-row' key={idx}>{val}</th>
              })}
            </tr>
          </thead>
          <tbody>
            {currentItems.length > 0 && currentItems.filter(val => {
              return val.file_name.toLowerCase().includes(search.toLowerCase());
            }).map((val, idx) => {
              return (
                <tr className='file-row' key={idx} onClick={() => navigate("/app/myFiles/desc", { state: { val, owner } })}>
                  <td><img src={file_icon} alt="" /></td>
                  <td id='first-col'>{val.file_name ? val.file_name : "test.png"}</td>
                  <td>{val.public ? <Tippy content="Public" placement='left'><img className="visible" src={eye_icon} alt="public" /></Tippy> : ''}</td>
                  <td>{val.file_size ? formatBytes(val.file_size) : "69"}</td>
                  <td>{val.file_creationDate ? formatDates(val.file_creationDate) : "2045/08/30"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {files.length > 8 &&
          <ReactPaginate
            breakLabel="..."
            onPageChange={handlePageClick}
            pageRangeDisplayed={files.length}
            pageCount={pageCount}
            renderOnZeroPageCount={null}
            className="pagignation"
            pageClassName="li"
            activeClassName="active-page"
            previousLabel={'ㅤ'}
            nextLabel = {'ㅤ'}
            previousClassName = {'prevarrow'}
            nextClassName = {'nextarrow'}
          />
        }
      </div>
    </div>
  );
}
export default MyFiles