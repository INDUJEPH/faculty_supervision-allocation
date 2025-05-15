import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Form, Input, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { classroomService } from '../../services/api';
import { useQueryClient } from '@tanstack/react-query';

interface ClassroomUploadProps {
  onUploadComplete?: () => void;
}

const ClassroomUpload: React.FC<ClassroomUploadProps> = ({ onUploadComplete }) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleUpload = async () => {
    if (!file) {
      message.error('Please select a file');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const result = await classroomService.uploadClassrooms(formData);
      
      if (result.failures && result.failures.length > 0) {
        message.warning(`Upload completed with ${result.failures.length} failures`);
        console.log('Upload failures:', result.failures);
      } else {
        message.success('Classrooms uploaded successfully');
      }

      // Invalidate and refetch the classrooms query
      queryClient.invalidateQueries({ queryKey: ['classrooms'] });
      
      // Call the onUploadComplete callback if provided, otherwise navigate
      if (onUploadComplete) {
        onUploadComplete();
      } else {
        navigate('/classrooms');
      }
    } catch (error) {
      console.error('Upload error:', error);
      message.error('Failed to upload classrooms');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="Upload Classrooms" className="max-w-2xl mx-auto">
      <Form layout="vertical">
        <Form.Item label="CSV File" required>
          <Input
            type="file"
            accept=".csv"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            icon={<UploadOutlined />}
            onClick={handleUpload}
            loading={loading}
            disabled={!file}
          >
            Upload
          </Button>
        </Form.Item>
      </Form>

      <div className="mt-4 text-sm text-gray-600">
        <p>CSV file should contain the following columns:</p>
        <ul className="list-disc pl-5 mt-2">
          <li>Name (string)</li>
          <li>Capacity (number)</li>
        </ul>
        <p className="mt-2">Example:</p>
        <pre className="bg-gray-100 p-2 rounded mt-2">
          name,capacity
          Room 101,50
          Room 102,60
          Lab 201,30
        </pre>
      </div>
    </Card>
  );
};

export default ClassroomUpload; 