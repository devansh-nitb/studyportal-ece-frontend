import React from 'react';
import './HtmlViewer.scss';
import { FaChevronLeft } from 'react-icons/fa';

const HtmlViewer = ({ title, src, onBack }) => {
  return (
    <div className="html-viewer-container">
      <div className="html-viewer-header">
        <button onClick={onBack} className="back-button">
          <FaChevronLeft /> Back
        </button>
        <h3>{title}</h3>
      </div>
      <div className="html-viewer-content">
        <iframe
          src={src}
          title={title}
          className="html-iframe"
          allowFullScreen

          sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
        ></iframe>
      </div>
    </div>
  );
};

export default HtmlViewer;
