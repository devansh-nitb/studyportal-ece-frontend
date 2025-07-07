import React from 'react';
import { FaFilePdf, FaImage, FaLink, FaDownload } from 'react-icons/fa'; 
import './FileList.scss'; 

const FileList = ({ files, onSelectFile, selectedCategory, selectedSubject }) => { 
  const getFileIcon = (fileType) => {
    switch (fileType) {
      case 'PDF':
        return <FaFilePdf className="file-icon pdf-icon" />;
      case 'Image':
        return <FaImage className="file-icon image-icon" />;
      case 'URL':
        return <FaLink className="file-icon url-icon" />;
      default:
        return <FaFilePdf className="file-icon default-icon" />;
    }
  };

  const getDownloadUrl = (file) => {
    if (file.fileType === 'URL') {
      return file.externalUrl; 
    }
    if (file.fileUrl && file.fileUrl.includes('res.cloudinary.com')) {
      const parts = file.fileUrl.split('/upload/');
      if (parts.length === 2) {
        return `${parts[0]}/upload/fl_attachment/${parts[1]}`;
      }
    }
    return file.fileUrl; 
  };

  return (
    <div className="file-list-container">
      <h3>{selectedCategory} Materials for {selectedSubject?.name || 'Selected Subject'}</h3>
      {files.length === 0 ? (
        <p className="no-files-message">No materials found in this category yet.</p>
      ) : (
        <ul className="file-items-list">
          {files.map((file) => (
            <li key={file._id} className="file-item">
              <div className="file-info" onClick={() => onSelectFile(file)}>
                {getFileIcon(file.fileType)}
                <div className="file-details">
                  <span className="file-title">{file.title}</span>
                  <span className="file-description">
                    {selectedSubject?.code} - {file.category} ({file.fileType})
                  </span>
                </div>
              </div>
              {file.isDownloadEnabled && (
                <a
                  href={getDownloadUrl(file)}
                  target="_blank"
                  rel="noopener noreferrer"
                  download={file.fileType !== 'URL' ? file.title : null}
                  className="download-button"
                >
                  <FaDownload /> Download
                </a>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default FileList;
