import React from 'react';
import { useNavigate } from 'react-router-dom';
import StudentUpload from './StudentUpload';

const StudentUploadWrapper: React.FC = () => {
  const navigate = useNavigate();
  return <StudentUpload onUploadComplete={() => navigate('/students')} />;
};

export default StudentUploadWrapper; 