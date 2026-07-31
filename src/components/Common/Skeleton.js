import React from 'react';
import { FaSearchPlus, FaSearchMinus, FaFileAlt, FaTimes } from 'react-icons/fa';
import './Skeleton.scss';

// ── Generic shimmer block ──────────────────────────────────────────
export const SkeletonBlock = ({ className = '', style = {} }) => (
  <div className={`skeleton-block ${className}`} style={style} />
);

// ── Subject card skeleton (matches SubjectCard layout) ─────────────
export const SubjectCardSkeleton = () => (
  <div className="subject-card-skeleton">
    <SkeletonBlock className="skeleton-image" />
    <SkeletonBlock className="skeleton-title" style={{ width: '70%' }} />
    <SkeletonBlock className="skeleton-text-sm" style={{ width: '45%' }} />
    <SkeletonBlock className="skeleton-text-sm" style={{ width: '55%' }} />
  </div>
);

// ── Grid of subject card skeletons ─────────────────────────────────
export const SubjectsGridSkeleton = ({ count = 6 }) => (
  <div className="dashboard-skeleton">
    <div className="dashboard-skeleton-header">
      <SkeletonBlock style={{ height: 28, width: 260 }} />
    </div>
    <div className="subjects-skeleton-grid">
      {Array.from({ length: count }).map((_, i) => (
        <SubjectCardSkeleton key={i} />
      ))}
    </div>
  </div>
);

// ── Folder grid skeleton (matches FolderList layout) ───────────────
export const FolderListSkeleton = () => (
  <div style={{
    marginTop: 24,
    padding: 32,
    borderRadius: 12,
    border: '1px solid var(--border-color)',
    background: 'var(--card-background)',
    textAlign: 'center'
  }}>
    <SkeletonBlock style={{ height: 24, width: 200, margin: '0 auto 28px' }} />
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
      gap: 20
    }}>
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="folder-card-skeleton">
          <SkeletonBlock className="skeleton-circle" style={{ width: 48, height: 48 }} />
          <SkeletonBlock style={{ height: 18, width: '65%' }} />
        </div>
      ))}
    </div>
  </div>
);

// ── File list skeleton (matches FileList layout) ───────────────────
export const FileListSkeleton = ({ count = 5 }) => (
  <div style={{
    marginTop: 24,
    padding: 32,
    borderRadius: 12,
    border: '1px solid var(--border-color)',
    background: 'var(--card-background)'
  }}>
    <SkeletonBlock style={{ height: 24, width: 280, margin: '0 auto 24px' }} />
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="file-row-skeleton">
          <SkeletonBlock className="skeleton-circle" style={{ width: 40, height: 40 }} />
          <div className="file-row-skeleton-details">
            <SkeletonBlock style={{ height: 15, width: `${55 + (i % 3) * 15}%` }} />
            <SkeletonBlock style={{ height: 12, width: `${30 + (i % 2) * 20}%` }} />
          </div>
          <SkeletonBlock className="skeleton-btn" />
        </div>
      ))}
    </div>
  </div>
);

export default SkeletonBlock;


// ── Material detail skeleton ───────────────────────────────────────
// Real header (title + live controls) + shimmer body.
// `title`   — string, shown in the header exactly like the real viewer
// `type`    — 'pdf' | 'image', controls which body skeleton to show
// `onClose` — optional, wires up the Close button even during loading
export const MaterialDetailSkeleton = ({ title = '', type = 'pdf', onClose }) => (
  <div className="material-detail-skeleton">

    {/* ── Real header — identical markup & classes to FileViewer ── */}
    <div className="viewer-header">
      <h3 className="file-title-display" style={{ color: 'var(--primary-color)' }}>
        {title || <SkeletonBlock style={{ height: 20, width: 220, display: 'inline-block' }} />}
      </h3>

      {/* Toolbar — disabled buttons so layout matches exactly */}
      {type !== 'image' && (
        <div className="header-toolbar">
          <button className="toolbar-button" disabled title="Zoom Out">
            <FaSearchMinus />
          </button>
          <span className="zoom-level">100%</span>
          <button className="toolbar-button" disabled title="Zoom In">
            <FaSearchPlus />
          </button>
          <div className="toolbar-separator" />
          <button className="toolbar-button" disabled>
            <FaFileAlt /> Single
          </button>
        </div>
      )}

      {/* Close button — functional if onClose is provided */}
      <button
        className="close-viewer-btn"
        onClick={onClose || undefined}
        disabled={!onClose}
        style={{ opacity: onClose ? 1 : 0.5 }}
      >
        <FaTimes /> Close
      </button>
    </div>

    {/* ── Shimmer body ─────────────────────────────────────────── */}
    <div className="viewer-body-skeleton">
      {type === 'image' ? (
        <SkeletonBlock className="image-skeleton" />
      ) : (
        <>
          <div className="pdf-page-skeleton" />
          <div className="pdf-page-skeleton" />
        </>
      )}
    </div>

  </div>
);

// ── Per-page skeleton inside react-pdf ────────────────────────────
export const PdfPageSkeleton = () => (
  <div className="pdf-page-loading-skeleton" />
);
