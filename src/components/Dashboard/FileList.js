import React from 'react';
import { FaFilePdf, FaImage, FaLink, FaDownload } from 'react-icons/fa';
import './FileList.scss';

const FileList = ({ files, onSelectFile, selectedCategory, selectedSubject, apiUrl, token }) => {
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

  /**
   * Handle download via the watermark proxy.
   * Fetches the watermarked file with auth headers and triggers a browser download.
   */
  const handleDownload = async (file) => {
    if (file.fileType === 'URL') {
      // External URLs open in a new tab directly
      window.open(file.externalUrl, '_blank', 'noopener,noreferrer');
      return;
    }

    try {
      const proxyUrl = `${apiUrl}/materials/${file._id}/view`;
      const response = await fetch(proxyUrl, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Download failed');

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      // Set filename based on file type
      const ext = file.fileType === 'PDF' ? '.pdf' : '.png';
      link.download = `${file.title}${ext}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download error:', err);
      alert('Failed to download file. Please try again.');
    }
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
                <button
                  onClick={() => handleDownload(file)}
                  className="download-button"
                >
                  <FaDownload /> Download
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default FileList;
