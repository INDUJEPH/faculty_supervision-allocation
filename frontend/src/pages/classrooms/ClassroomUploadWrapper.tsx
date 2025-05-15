import React from 'react';
import { useNavigate } from 'react-router-dom';
import ClassroomUpload from './ClassroomUpload';

const ClassroomUploadWrapper: React.FC = () => {
  const navigate = useNavigate();
  return <ClassroomUpload onUploadComplete={() => navigate('/classrooms')} />;
};

export default ClassroomUploadWrapper; 