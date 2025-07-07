
import React, { useState, useEffect, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import LoadingSpinner from '../Common/LoadingSpinner';
import './FileViewer.scss'; 
import 'react-pdf/dist/Page/AnnotationLayer.css'; 
import 'react-pdf/dist/Page/TextLayer.css'; 
import { FaSearchPlus, FaSearchMinus, FaChevronLeft, FaChevronRight, FaFileAlt, FaFilePdf, FaTimes } from 'react-icons/fa';


pdfjs.GlobalWorkerOptions.workerSrc = `${process.env.PUBLIC_URL}/pdf.worker.min.js`;

const FileViewer = ({ file, onClose }) => {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pdfError, setPdfError] = useState(null);
  const [scale, setScale] = useState(1.0); // For zoom functionality
  const [viewMode, setViewMode] = useState('single'); // 'single' or 'scroll'
  const [goToPageInput, setGoToPageInput] = useState('');

  const viewerRef = useRef(null); // for the viewer container to calculate width

  useEffect(() => {
    // Reset when a new file is selected
    setPageNumber(1);
    setNumPages(null);
    setPdfError(null);
    setScale(1.0);
    setViewMode('single'); // Reset view mode for new file
    setGoToPageInput('');
  }, [file]);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setPageNumber(1); // Always start from the first page
    if (viewerRef.current) {
      const viewerWidth = viewerRef.current.offsetWidth;
      const initialScale = viewerWidth / 612 * 0.9; 
      setScale(Math.min(initialScale, 1.0)); 
    }
  };

  const onDocumentLoadError = (error) => {
    console.error('Error loading PDF document:', error);
    setPdfError('Failed to load PDF. It might be corrupted or an unsupported format.');
  };

  const changePage = (offset) => {
    setPageNumber(prevPageNumber => Math.min(Math.max(prevPageNumber + offset, 1), numPages));
  };

  const handleZoomIn = () => setScale(prevScale => prevScale + 0.2);
  const handleZoomOut = () => setScale(prevScale => Math.max(prevScale - 0.2, 0.5)); 

  const handleGoToPage = (e) => {
    e.preventDefault();
    const page = parseInt(goToPageInput, 10);
    if (page >= 1 && page <= numPages) {
      setPageNumber(page);
    } else {
      console.warn('Invalid page number entered.');
    }
  };

  if (!file) {
    return <div className="file-viewer-placeholder">Select a file to view</div>;
  }

  return (
    <div className="file-viewer-container">
      <div className="viewer-header">
        <h3 className="file-title-display">{file.title}</h3>
        <button onClick={onClose} className="close-viewer-btn"><FaTimes /> Close</button>
      </div>

      <div className="viewer-content">
        {file.fileType === 'PDF' && (
          <div className="pdf-viewer" ref={viewerRef}>
            {pdfError ? (
              <div className="error-message">{pdfError}</div>
            ) : (
              <>
                <div className="pdf-toolbar">
                  <button onClick={() => changePage(-1)} disabled={pageNumber <= 1} className="toolbar-button">
                    <FaChevronLeft /> Prev
                  </button>
                  <input
                    type="number"
                    value={goToPageInput || pageNumber}
                    onChange={(e) => setGoToPageInput(e.target.value)}
                    onBlur={handleGoToPage}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleGoToPage(e); }}
                    className="page-input"
                    min="1"
                    max={numPages || 1}
                    aria-label="Go to page"
                  />
                  <span> / {numPages || '--'}</span>
                  <div className="toolbar-separator"></div>
                  <button onClick={handleZoomIn} className="toolbar-button"><FaSearchPlus /> Zoom In</button>
                  <button onClick={handleZoomOut} className="toolbar-button"><FaSearchMinus /> Zoom Out</button>
                  <div className="toolbar-separator"></div>
                  <button onClick={() => setViewMode(viewMode === 'single' ? 'scroll' : 'single')} className="toolbar-button">
                    {viewMode === 'single' ? <FaFilePdf /> : <FaFileAlt />}
                    {viewMode === 'single' ? 'Scroll View' : 'Single Page'}
                  </button>
                  <button onClick={() => changePage(1)} disabled={pageNumber >= numPages} className="toolbar-button">
                    Next <FaChevronRight />
                  </button>
                </div>

                <div className={`pdf-document-wrapper ${viewMode === 'scroll' ? 'scroll-view' : 'single-page-view'}`}>
                  <Document
                    file={file.fileUrl}
                    onLoadSuccess={onDocumentLoadSuccess}
                    onLoadError={onDocumentLoadError}
                    loading={<LoadingSpinner />}
                    noData={<div className="no-pdf-data">No PDF data available.</div>}
                  >
                    {viewMode === 'single' ? (
                      <Page
                        pageNumber={pageNumber}
                        scale={scale}
                        renderTextLayer={true}
                        renderAnnotationLayer={true}
                        loading={<LoadingSpinner />}
                        error={<div className="error-message">Error rendering page.</div>}
                      />
                    ) : (
                      Array.from({ length: numPages }, (el, index) => (
                        <Page
                          key={`page_${index + 1}`}
                          pageNumber={index + 1}
                          scale={scale}
                          renderTextLayer={true}
                          renderAnnotationLayer={true}
                          loading={<LoadingSpinner />}
                          error={<div className="error-message">Error rendering page.</div>}
                        />
                      ))
                    )}
                  </Document>
                </div>
              </>
            )}
          </div>
        )}

        {file.fileType === 'Image' && (
          <div className="image-viewer">
            <img src={file.fileUrl} alt={file.title} className="viewed-image" />
          </div>
        )}

        {file.fileType === 'URL' && (
          <div className="url-viewer">
            <p className="url-warning">
              Viewing external content. Content may not be fully responsive or interactive
              within this iframe due to security restrictions.
            </p>
            <iframe
              src={file.externalUrl}
              title={file.title}
              className="external-iframe"
              allowFullScreen
              sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-modals"
            ></iframe>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileViewer;
