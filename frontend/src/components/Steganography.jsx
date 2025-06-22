import React from 'react'
import Upload from './Upload';
import Extract from './Extract';

const Steganography = () => {
    return (
        <div className='stegano'>
            <div className="upload">
                <Upload />
            </div>
            <div className="extract">
                <Extract />
            </div>
        </div>
    )
}

export default Steganography
