import React, { useState, useEffect, useRef, useMemo, useCallback, useContext } from 'react';
import axios from 'axios';
import { Document, Page, pdfjs } from 'react-pdf';
import { PdfPageSkeleton } from '../Common/Skeleton';
import '../Common/Skeleton.scss';
import './FileViewer.scss';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { AuthContext } from '../../context/AuthContext';
import {
  FaSearchPlus, FaSearchMinus, FaChevronLeft, FaChevronRight,
  FaFileAlt, FaFilePdf, FaTimes, FaExternalLinkAlt, FaLink, FaExclamationTriangle, FaDownload, FaLock
} from 'react-icons/fa';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

// ── FadePage ────────────────────────────────────────────────────────
// Wraps each react-pdf <Page> so it starts invisible and fades in once
// the canvas has actually painted — eliminating the skeleton→page snap.
const FadePage = ({ pageNumber, scale, renderTextLayer, renderAnnotationLayer }) => {
  const [visible, setVisible] = useState(false);

  const handleRenderSuccess = useCallback(() => {
    // Give the browser one extra frame to composite the canvas before fading in
    requestAnimationFrame(() => setVisible(true));
  }, []);

  return (
    <div style={{ position: 'relative' }}>
      {/* Skeleton sits behind the page until the page is ready */}
      <div style={{
        position: 'absolute',
        inset: 0,
        opacity: visible ? 0 : 1,
        transition: 'opacity 0.3s ease',
        pointerEvents: 'none',
        zIndex: 1,
      }}>
        <PdfPageSkeleton />
      </div>

      {/* Page fades in over the skeleton */}
      <div style={{
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.3s ease',
        position: 'relative',
        zIndex: 2,
      }}>
        <Page
          pageNumber={pageNumber}
          scale={scale}
          renderTextLayer={renderTextLayer}
          renderAnnotationLayer={renderAnnotationLayer}
          onRenderSuccess={handleRenderSuccess}
          loading={null}
          error={<div className="error-message">Error rendering page.</div>}
        />
      </div>
    </div>
  );
};

// ── Image skeleton ──────────────────────────────────────────────────
const ImageLoadingSkeleton = () => (
  <div className="skeleton-block" style={{ width: 'min(680px, 90%)', height: '560px', borderRadius: 10 }} />
);

// ── UrlViewer ───────────────────────────────────────────────────────
// The ONLY reliable solution for URL materials:
//
// 1. Ask our backend to HEAD-request the URL and read its response
//    headers (X-Frame-Options, CSP frame-ancestors). The backend can
//    do this because it is not subject to browser CORS/SOP restrictions.
//
// 2. If embeddable → show an iframe with a topbar.
//    If blocked     → show a clean card with "Open in new tab".
//    While checking → show a loading state.
//
// Why not just try the iframe and catch onError?
//   Because browsers NEVER fire onError for X-Frame-Options/CSP blocks.
//   They either show a blank white frame or Chrome's own "blocked" page.
//   There is no JavaScript API to detect this from the parent page.

const UrlViewer = ({ url, title, apiUrl, token }) => {
  // 'checking' | 'embeddable' | 'blocked'
  const [status, setStatus] = useState('checking');
  const [iframeVisible, setIframeVisible] = useState(false);

  const displayUrl = url
    ? url.replace(/^https?:\/\//, '').replace(/\/$/, '')
    : '';

  const origin = (() => {
    try { return new URL(url).origin; }
    catch { return null; }
  })();

  const faviconUrl = origin ? `${origin}/favicon.ico` : null;

  useEffect(() => {
    if (!url || !apiUrl || !token) return;
    setStatus('checking');
    setIframeVisible(false);

    const controller = new AbortController();

    axios.get(
      `${apiUrl}/proxy/check-url?url=${encodeURIComponent(url)}`,
      {
        headers: { Authorization: `Bearer ${token}` },
        signal: controller.signal,
      }
    )
      .then(res => {
        if (res.data.success) {
          setStatus(res.data.embeddable ? 'embeddable' : 'blocked');
        } else {
          setStatus('blocked');
        }
      })
      .catch(() => setStatus('blocked')); // Network error → treat as blocked

    return () => controller.abort();
  }, [url, apiUrl, token]);

  // ── Shared link card (used in both blocked and embeddable views) ──
  const LinkCard = () => (
    <div className="url-link-card">
      {faviconUrl && (
        <img
          src={faviconUrl}
          alt=""
          className="url-favicon"
          onError={(e) => { e.target.style.display = 'none'; }}
        />
      )}
      <div className="url-link-info">
        <span className="url-link-title">{title}</span>
        <span className="url-link-domain">{displayUrl}</span>
      </div>
      <a href={url} target="_blank" rel="noopener noreferrer" className="url-open-btn">
        <FaExternalLinkAlt /> Open in new tab
      </a>
    </div>
  );

  // ── Checking ──────────────────────────────────────────────────────
  if (status === 'checking') {
    return (
      <div className="url-viewer">
        <div className="url-blocked-card">
          <div className="url-checking-spinner" />
          <p style={{ color: 'var(--secondary-color)', marginTop: 16 }}>
            Checking if this link can be previewed…
          </p>
          <LinkCard />
        </div>
      </div>
    );
  }

  // ── Blocked ───────────────────────────────────────────────────────
  if (status === 'blocked') {
    return (
      <div className="url-viewer">
        <div className="url-blocked-card">
          <div className="url-blocked-icon"><FaExclamationTriangle /></div>
          <h3>Cannot preview this link</h3>
          <p>
            <strong>{displayUrl}</strong> has blocked embedding for security
            reasons — this is enforced by the website itself and cannot be bypassed
            by any viewer.
          </p>
          <LinkCard />
          <p className="url-hint">
            Tip: Download the file and upload it as a PDF or image for the best experience.
          </p>
        </div>
      </div>
    );
  }

  // ── Embeddable ────────────────────────────────────────────────────
  return (
    <div className="url-viewer">
      <div className="url-topbar">
        <FaLink style={{ flexShrink: 0, color: 'var(--secondary-color)' }} />
        <span className="url-topbar-domain">{displayUrl}</span>
        <a href={url} target="_blank" rel="noopener noreferrer" className="url-topbar-link">
          <FaExternalLinkAlt /> Open in new tab
        </a>
      </div>
      <iframe
        key={url}
        src={url}
        title={title}
        className={`external-iframe ${iframeVisible ? 'iframe-loaded' : ''}`}
        allowFullScreen
        onLoad={() => setIframeVisible(true)}
      />
    </div>
  );
};

// ── FileViewer ──────────────────────────────────────────────────────
const FileViewer = ({ file, onClose, apiUrl, token }) => {
  const { user, premiumEnabled } = useContext(AuthContext);
  const canDownload = user && (user.isAdmin || (premiumEnabled && user.isPremium));

  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pdfError, setPdfError] = useState(null);
  const [scale, setScale] = useState(1.0);
  const [viewMode, setViewMode] = useState('scroll');
  const [goToPageInput, setGoToPageInput] = useState('');
  const [watermarkedImageUrl, setWatermarkedImageUrl] = useState(null);
  const [imageLoading, setImageLoading] = useState(false);
  // True when the currently displayed file came from the service worker's
  // offline cache (no live network round-trip) rather than a fresh fetch.
  const [servedFromOfflineCache, setServedFromOfflineCache] = useState(false);
  // Tracks which page numbers have finished rendering (for single-page mode)
  const [renderedPages, setRenderedPages] = useState({});

  const viewerRef = useRef(null);
  const scrollContainerRef = useRef(null);

  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    if (!file || !apiUrl || !token) return;
    setIsDownloading(true);
    try {
      const response = await fetch(`${apiUrl}/materials/${file._id}/download`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Download failed');
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${file.title}.${file.fileType === 'PDF' ? 'pdf' : 'png'}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download error:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  useEffect(() => {
    setNumPages(null);
    setPdfError(null);
    setScale(1.0);
    setViewMode('scroll');
    setGoToPageInput('');
    setWatermarkedImageUrl(null);
    setImageLoading(false);
    setRenderedPages({});
    setServedFromOfflineCache(false);
  }, [file]);

  // Reset rendered state when page changes in single-page mode
  useEffect(() => {
    setRenderedPages({});
  }, [pageNumber, scale]);

  useEffect(() => {
    if (file && file.fileType === 'Image' && apiUrl && token) {
      setImageLoading(true);
      const proxyUrl = `${apiUrl}/materials/${file._id}/view`;
      fetch(proxyUrl, { headers: { Authorization: `Bearer ${token}` } })
        .then(res => {
          if (!res.ok) throw new Error('Failed to load watermarked image');
          setServedFromOfflineCache(res.headers.get('x-sw-offline-fallback') === '1');
          return res.blob();
        })
        .then(blob => {
          setWatermarkedImageUrl(URL.createObjectURL(blob));
          setImageLoading(false);
        })
        .catch(err => {
          console.error('Error loading watermarked image:', err);
          setImageLoading(false);
        });

      return () => {
        if (watermarkedImageUrl) URL.revokeObjectURL(watermarkedImageUrl);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file, apiUrl, token]);

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
    setPageNumber(prev => Math.min(Math.max(prev + offset, 1), numPages));
  };

  const handleZoom = (zoomIn) => {
    const container = scrollContainerRef.current;
    if (container) {
      const scrollRatio = container.scrollHeight > 0
        ? container.scrollTop / container.scrollHeight : 0;
      setScale(prev => {
        const next = zoomIn ? Math.min(prev + 0.25, 3.0) : Math.max(prev - 0.25, 0.25);
        requestAnimationFrame(() => {
          container.scrollTop = scrollRatio * container.scrollHeight;
        });
        return next;
      });
    } else {
      setScale(prev => zoomIn
        ? Math.min(prev + 0.25, 3.0)
        : Math.max(prev - 0.25, 0.25));
    }
  };

  const handleGoToPage = (e) => {
    e.preventDefault();
    const page = parseInt(goToPageInput, 10);
    if (page >= 1 && page <= numPages) setPageNumber(page);
  };

  if (!file) return <div className="file-viewer-placeholder">Select a file to view</div>;

  const isPdf = file.fileType === 'PDF';

  return (
    <div className="file-viewer-container">

      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="viewer-header">
        <h3 className="file-title-display">
          {file.title}
          {servedFromOfflineCache && (
            <span className="offline-copy-badge" title="Showing the last copy saved on this device — you're offline">
              Offline copy
            </span>
          )}
        </h3>

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
                <div className="toolbar-separator" />
              </>
            )}
            <button onClick={() => handleZoom(false)} className="toolbar-button" title="Zoom Out">
              <FaSearchMinus />
            </button>
            <span className="zoom-level">{Math.round(scale * 100)}%</span>
            <button onClick={() => handleZoom(true)} className="toolbar-button" title="Zoom In">
              <FaSearchPlus />
            </button>
            <div className="toolbar-separator" />
            <button
              onClick={() => setViewMode(viewMode === 'single' ? 'scroll' : 'single')}
              className="toolbar-button"
              title={viewMode === 'single' ? 'Switch to Scroll View' : 'Switch to Single Page'}
            >
              {viewMode === 'single' ? <FaFilePdf /> : <FaFileAlt />}
              {viewMode === 'single' ? ' Scroll' : ' Single'}
            </button>
          </div>
        )}

        {(file.fileType === 'PDF' || file.fileType === 'Image') && (
          canDownload ? (
            <button
              onClick={handleDownload}
              className="toolbar-button download-btn"
              title="Download"
              disabled={isDownloading}
            >
              <FaDownload /> {isDownloading ? 'Downloading…' : 'Download'}
            </button>
          ) : (
            <span className="toolbar-button download-btn download-locked" title="Premium feature">
              <FaLock /> Premium
            </span>
          )
        )}
        <button onClick={onClose} className="close-viewer-btn"><FaTimes /> Close</button>
      </div>

      {/* ── Content ─────────────────────────────────────────────── */}
      <div className="viewer-content">

        {/* PDF */}
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
                  loading={<PdfPageSkeleton />}
                  noData={<div className="no-pdf-data">No PDF data available.</div>}
                >
                  {viewMode === 'single' ? (
                    <FadePage
                      pageNumber={pageNumber}
                      scale={scale}
                      renderTextLayer={true}
                      renderAnnotationLayer={true}
                    />
                  ) : (
                    Array.from({ length: numPages }, (_, index) => (
                      <FadePage
                        key={`page_${index + 1}`}
                        pageNumber={index + 1}
                        scale={scale}
                        renderTextLayer={true}
                        renderAnnotationLayer={true}
                      />
                    ))
                  )}
                </Document>
              </div>
            )}
          </div>
        )}

        {/* Image */}
        {file.fileType === 'Image' && (
          <div className="image-viewer">
            {imageLoading ? (
              <ImageLoadingSkeleton />
            ) : watermarkedImageUrl ? (
              <img
                src={watermarkedImageUrl}
                alt={file.title}
                className="viewed-image"
                style={{ animation: 'mdp-fadein 0.35s ease' }}
              />
            ) : (
              <div className="error-message">Failed to load image.</div>
            )}
          </div>
        )}

        {/* URL viewer */}
        {file.fileType === 'URL' && (
          <UrlViewer url={file.externalUrl} title={file.title} apiUrl={apiUrl} token={token} />
        )}

      </div>
    </div>
  );
};

export default FileViewer;
