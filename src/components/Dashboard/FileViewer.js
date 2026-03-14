
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import LoadingSpinner from '../Common/LoadingSpinner';
import './FileViewer.scss';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { FaSearchPlus, FaSearchMinus, FaChevronLeft, FaChevronRight, FaFileAlt, FaFilePdf, FaTimes } from 'react-icons/fa';


pdfjs.GlobalWorkerOptions.workerSrc = `${process.env.PUBLIC_URL}/pdf.worker.min.js`;

const FileViewer = ({ file, onClose, apiUrl, token }) => {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pdfError, setPdfError] = useState(null);
  const [scale, setScale] = useState(1.0);
  const [viewMode, setViewMode] = useState('scroll');
  const [goToPageInput, setGoToPageInput] = useState('');
  const [watermarkedImageUrl, setWatermarkedImageUrl] = useState(null);
  const [imageLoading, setImageLoading] = useState(false);

  const viewerRef = useRef(null);
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    setPageNumber(1);
    setNumPages(null);
    setPdfError(null);
    setScale(1.0);
    setViewMode('scroll');
    setGoToPageInput('');
    setWatermarkedImageUrl(null);
    setImageLoading(false);
  }, [file]);

  // For Image type: fetch watermarked image from proxy and create a blob URL
  useEffect(() => {
    if (file && file.fileType === 'Image' && apiUrl && token) {
      setImageLoading(true);
      const proxyUrl = `${apiUrl}/materials/${file._id}/view`;
      fetch(proxyUrl, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => {
          if (!res.ok) throw new Error('Failed to load watermarked image');
          return res.blob();
        })
        .then(blob => {
          const url = URL.createObjectURL(blob);
          setWatermarkedImageUrl(url);
          setImageLoading(false);
        })
        .catch(err => {
          console.error('Error loading watermarked image:', err);
          setImageLoading(false);
        });

      return () => {
        if (watermarkedImageUrl) {
          URL.revokeObjectURL(watermarkedImageUrl);
        }
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file, apiUrl, token]);

  // Memoize the PDF source so it doesn't change on every render (prevents reload on zoom)
  const pdfSource = useMemo(() => {
    if (apiUrl && token && file && file._id) {
      return {
        url: `${apiUrl}/materials/${file._id}/view`,
        httpHeaders: { Authorization: `Bearer ${token}` }
      };
    }
    return file?.fileUrl || null;
  }, [apiUrl, token, file]);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setPageNumber(1);
  };

  const onDocumentLoadError = (error) => {
    console.error('Error loading PDF document:', error);
    setPdfError('Failed to load PDF. It might be corrupted or an unsupported format.');
  };

  const changePage = (offset) => {
    setPageNumber(prevPageNumber => Math.min(Math.max(prevPageNumber + offset, 1), numPages));
  };

  // Preserve scroll position during zoom
  const handleZoom = (zoomIn) => {
    const container = scrollContainerRef.current;
    if (container) {
      const scrollTop = container.scrollTop;
      const scrollHeight = container.scrollHeight;
      const scrollRatio = scrollHeight > 0 ? scrollTop / scrollHeight : 0;

      setScale(prevScale => {
        const newScale = zoomIn
          ? Math.min(prevScale + 0.25, 3.0)
          : Math.max(prevScale - 0.25, 0.25);

        // After React re-renders with the new scale, restore the scroll position
        requestAnimationFrame(() => {
          const newScrollHeight = container.scrollHeight;
          container.scrollTop = scrollRatio * newScrollHeight;
        });

        return newScale;
      });
    } else {
      setScale(prevScale => zoomIn
        ? Math.min(prevScale + 0.25, 3.0)
        : Math.max(prevScale - 0.25, 0.25)
      );
    }
  };

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

  const isPdf = file.fileType === 'PDF';

  return (
    <div className="file-viewer-container">
      {/* Header with title, toolbar controls (for PDF), and close button */}
      <div className="viewer-header">
        <h3 className="file-title-display">{file.title}</h3>

        {isPdf && !pdfError && (
          <div className="header-toolbar">
            {viewMode === 'single' && (
              <>
                <button onClick={() => changePage(-1)} disabled={pageNumber <= 1} className="toolbar-button">
                  <FaChevronLeft />
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
                <span className="page-count">/ {numPages || '--'}</span>
                <button onClick={() => changePage(1)} disabled={pageNumber >= numPages} className="toolbar-button">
                  <FaChevronRight />
                </button>
                <div className="toolbar-separator"></div>
              </>
            )}

            <button onClick={() => handleZoom(false)} className="toolbar-button" title="Zoom Out">
              <FaSearchMinus />
            </button>
            <span className="zoom-level">{Math.round(scale * 100)}%</span>
            <button onClick={() => handleZoom(true)} className="toolbar-button" title="Zoom In">
              <FaSearchPlus />
            </button>

            <div className="toolbar-separator"></div>
            <button onClick={() => setViewMode(viewMode === 'single' ? 'scroll' : 'single')} className="toolbar-button" title={viewMode === 'single' ? 'Switch to Scroll View' : 'Switch to Single Page'}>
              {viewMode === 'single' ? <FaFilePdf /> : <FaFileAlt />}
              {viewMode === 'single' ? ' Scroll' : ' Single'}
            </button>
          </div>
        )}

        <button onClick={onClose} className="close-viewer-btn"><FaTimes /> Close</button>
      </div>

      <div className="viewer-content">
        {isPdf && (
          <div className="pdf-viewer" ref={viewerRef}>
            {pdfError ? (
              <div className="error-message">{pdfError}</div>
            ) : (
              <div
                ref={scrollContainerRef}
                className={`pdf-document-wrapper ${viewMode === 'scroll' ? 'scroll-view' : 'single-page-view'}`}
              >
                <Document
                  file={pdfSource}
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
            )}
          </div>
        )}

        {file.fileType === 'Image' && (
          <div className="image-viewer">
            {imageLoading ? (
              <LoadingSpinner />
            ) : watermarkedImageUrl ? (
              <img src={watermarkedImageUrl} alt={file.title} className="viewed-image" />
            ) : (
              <div className="error-message">Failed to load image.</div>
            )}
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
