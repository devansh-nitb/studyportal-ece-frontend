import React from 'react';
import { FaFolderOpen } from 'react-icons/fa'; 
import './FolderList.scss'; 

const FolderList = ({ onSelectFolder }) => {
  const categories = ['Notes', 'Books', 'PYQs', 'Syllabus']; 

  return (
    <div className="folder-list-container">
      <h3>Select a Category</h3>
      <div className="folders-grid">
        {categories.map((category) => (
          <div key={category} className="folder-card" onClick={() => onSelectFolder(category)}>
            <FaFolderOpen className="folder-icon" />
            <span className="folder-name">{category}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FolderList;
