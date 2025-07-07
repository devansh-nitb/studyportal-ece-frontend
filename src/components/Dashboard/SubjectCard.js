import React from 'react';
import './SubjectCard.scss'; 

const SubjectCard = ({ subject, onClick }) => {
  return (
    <div className="subject-card" onClick={() => onClick(subject)}>
      <img src={subject.logoUrl} alt={`${subject.name} Logo`} className="subject-logo" onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/100x100/CCCCCC/000000?text=Logo'; }} />
      <h4 className="subject-name">{subject.name}</h4>
      <p className="subject-code">{subject.code}</p>
      <p className="subject-semester">Semester {subject.semester}</p>
    </div>
  );
};

export default SubjectCard;
