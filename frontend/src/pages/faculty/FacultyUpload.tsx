import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Form, Input, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { facultyService } from '../../services/api';
import { useQueryClient } from '@tanstack/react-query';

interface FacultyUploadProps {
  onUploadComplete?: () => void;
}

const FacultyUpload: React.FC<FacultyUploadProps> = ({ onUploadComplete }) => {
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

      const result = await facultyService.uploadFaculty(formData);
      
      if (result.failures && result.failures.length > 0) {
        message.warning(`Upload completed with ${result.failures.length} failures`);
        console.log('Upload failures:', result.failures);
      } else {
        message.success('Faculty members uploaded successfully');
      }

      // Invalidate and refetch the faculty query
      queryClient.invalidateQueries({ queryKey: ['faculty'] });
      
      // Call the onUploadComplete callback if provided, otherwise navigate
      if (onUploadComplete) {
        onUploadComplete();
      } else {
        navigate('/faculty');
      }
    } catch (error) {
      console.error('Upload error:', error);
      message.error('Failed to upload faculty members');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="Upload Faculty" className="max-w-2xl mx-auto">
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
          <li>name (string)</li>
          <li>department (computer science, electronics, electrical, or mechanical)</li>
          <li>designation (string)</li>
          <li>email (string)</li>
          <li>phone (string)</li>
          <li>experience (number of years)</li>
          <li>shift_preference (full, half, or none)</li>
          <li>max_supervisions (maximum number of supervisions per day)</li>
        </ul>
        <p className="mt-2">Example:</p>
        <pre className="bg-gray-100 p-2 rounded mt-2">
          name,department,designation,email,phone,experience,shift_preference,max_supervisions
          Dr. John Doe,computer science,Professor,john@example.com,1234567890,5,full,3
          Dr. Jane Smith,electronics,Associate Professor,jane@example.com,0987654321,3,half,2
        </pre>
      </div>
    </Card>
  );
};

export default FacultyUpload; 