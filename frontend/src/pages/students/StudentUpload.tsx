import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Form, Input, Select, message, Modal, Table } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { studentService } from '../../services/api';
import { useQueryClient } from '@tanstack/react-query';
import { StudentUploadResult } from '../../lib/types';

const { Option } = Select;

interface StudentUploadProps {
  onUploadComplete?: () => void;
}

const StudentUpload: React.FC<StudentUploadProps> = ({ onUploadComplete }) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [department, setDepartment] = useState<string>('computer science');
  const [failures, setFailures] = useState<Array<any>>([]);
  const [showFailuresModal, setShowFailuresModal] = useState(false);
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
      formData.append('department', department);

      const result = await studentService.uploadStudents(formData);
      
      if (result.failures && result.failures.length > 0) {
        message.warning(`Upload completed with ${result.failures.length} failures`);
        console.log('Upload failures:', result.failures);
        setFailures(result.failures);
        setShowFailuresModal(true);
      } else {
        message.success('Students uploaded successfully');
      }

      // Invalidate and refetch the students query
      queryClient.invalidateQueries({ queryKey: ['students'] });
      
      // Call the onUploadComplete callback if provided, otherwise navigate
      if (onUploadComplete) {
        onUploadComplete();
      } else {
        navigate('/students');
      }
    } catch (error) {
      console.error('Upload error:', error);
      message.error('Failed to upload students');
    } finally {
      setLoading(false);
    }
  };

  const downloadErrorReport = () => {
    if (!failures || failures.length === 0) return;
    
    // Prepare CSV content
    let csvContent = "Name,Roll Number,Error\n";
    failures.forEach(failure => {
      const name = failure.student?.name || 'Unknown';
      const rollNumber = failure.student?.roll_number || '-'; 
      const error = failure.error || 'Unknown error';
      
      // Escape quotes in fields and enclose in quotes
      const escapedName = `"${name.replace(/"/g, '""')}"`;
      const escapedRollNumber = `"${rollNumber.replace(/"/g, '""')}"`;
      const escapedError = `"${error.replace(/"/g, '""')}"`;
      
      csvContent += `${escapedName},${escapedRollNumber},${escapedError}\n`;
    });
    
    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'student_upload_errors.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const failureColumns = [
    {
      title: 'Row',
      dataIndex: ['student', 'name'],
      key: 'name',
      render: (text: string, record: any) => record.student?.name || 'Unknown student'
    },
    {
      title: 'Roll Number',
      dataIndex: ['student', 'roll_number'],
      key: 'roll_number',
      render: (text: string, record: any) => record.student?.roll_number || '-'
    },
    {
      title: 'Error',
      dataIndex: 'error',
      key: 'error',
    }
  ];

  return (
    <>
      <Card title="Upload Students" className="max-w-2xl mx-auto">
        <Form layout="vertical">
          <Form.Item label="Department" required>
            <Select
              value={department}
              onChange={setDepartment}
              placeholder="Select department"
            >
              <Option value="computer science">Computer Science</Option>
              <Option value="electronics">Electronics</Option>
              <Option value="electrical">Electrical</Option>
              <Option value="mechanical">Mechanical</Option>
            </Select>
          </Form.Item>

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
            <li>Name</li>
            <li>Roll Number</li>
            <li>Semester (1-8)</li>
            <li>Section (A, B, C)</li>
            <li>Elective Subjects (comma-separated)</li>
          </ul>
          <p className="mt-2">Note: The department will be set based on your selection above.</p>
          
          <div className="mt-4 bg-blue-50 p-3 rounded">
            <h4 className="font-semibold">Common Upload Errors</h4>
            <ul className="list-disc pl-5 mt-2">
              <li><strong>Missing required fields</strong>: Ensure name, roll number, and semester are provided for each student.</li>
              <li><strong>Invalid semester</strong>: Semester must be a number between 1 and 8.</li>
              <li><strong>Duplicate roll number</strong>: Each student must have a unique roll number.</li>
              <li><strong>CSV format issues</strong>: Make sure your CSV uses commas as separators and follows the header format.</li>
            </ul>
            <p className="mt-2">Example of a valid row:</p>
            <pre className="bg-white p-2 rounded text-xs">
              John Doe,CS2023001,4,B,Data Science;Computer Networks
            </pre>
          </div>
        </div>
      </Card>

      <Modal
        title="Upload Failures"
        open={showFailuresModal}
        onCancel={() => setShowFailuresModal(false)}
        footer={[
          <Button key="download" type="primary" onClick={downloadErrorReport}>
            Download Error Report
          </Button>,
          <Button key="close" onClick={() => setShowFailuresModal(false)}>
            Close
          </Button>
        ]}
        width={800}
      >
        <p>The following students could not be uploaded:</p>
        <Table 
          dataSource={failures} 
          columns={failureColumns} 
          rowKey={(record, index) => index?.toString() || '0'} 
          pagination={false}
        />
      </Modal>
    </>
  );
};

export default StudentUpload; 