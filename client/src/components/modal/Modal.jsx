import React from 'react'
import './Modal.css'

const Modal = ({header='', body, footer}) => {
    return (
        <>
            <div className="modal-backdrop"></div>
            <div className='modal-dialog'>
                <div className="modal-content">
                    {header && <div className="header">
                        {header}
                    </div>}
                    <div className="body">
                        {body}
                    </div>
                    <div className="footer">
                        {footer}
                    </div>
                </div>
            </div>
        </>
    )
}

export default Modal
