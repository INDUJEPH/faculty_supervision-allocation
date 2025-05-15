import React from 'react';
import { useNavigate } from 'react-router-dom';
import FacultyUpload from './FacultyUpload';

const FacultyUploadWrapper: React.FC = () => {
  const navigate = useNavigate();
  return <FacultyUpload onUploadComplete={() => navigate('/faculty')} />;
};

export default FacultyUploadWrapper; 