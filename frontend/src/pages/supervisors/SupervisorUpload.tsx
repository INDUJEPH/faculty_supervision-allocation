import React, { useState } from 'react';
import { Button, message, Form, Input, Select, DatePicker, TimePicker } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { uploadSupervisors, allocateSupervisors } from '../../services/api';
import dayjs from 'dayjs';

const { Option } = Select;

const SupervisorUpload: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      message.error('Please select a file first');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const result = await uploadSupervisors(formData);
      
      if (result.success) {
        message.success(`Successfully uploaded supervisors`);
      }
      
      if (result.failures && result.failures.length > 0) {
        message.warning(`${result.failures.length} supervisors failed to upload. Check console for details.`);
        console.error('Upload failures:', result.failures);
      }
    } catch (error) {
      message.error('Failed to upload supervisors');
      console.error('Upload error:', error);
    } finally {
      setLoading(false);
      setFile(null);
    }
  };

  const handleAllocate = async (values: any) => {
    try {
      const result = await allocateSupervisors({
        examId: values.examId,
        date: values.date.format('YYYY-MM-DD'),
        startTime: values.startTime.format('HH:mm:ss'),
        endTime: values.endTime.format('HH:mm:ss'),
        examType: values.examType,
        requiredSupervisors: values.requiredSupervisors
      });

      message.success(result.message);
      console.log('Allocations:', result.allocations);
    } catch (error) {
      message.error('Failed to allocate supervisors');
      console.error('Allocation error:', error);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Supervisor Management</h2>
      
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4">Upload Supervisors</h3>
        <div className="mb-4">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="mb-4"
          />
          
          <Button
            type="primary"
            icon={<UploadOutlined />}
            onClick={handleUpload}
            loading={loading}
            disabled={!file}
          >
            Upload Supervisors
          </Button>
        </div>

        <div className="bg-gray-100 p-4 rounded">
          <h4 className="font-bold mb-2">CSV Format Requirements:</h4>
          <p>Your CSV file should have the following columns in order:</p>
          <ol className="list-decimal pl-5 mt-2">
            <li>name (string)</li>
            <li>department (computer science, electronics, electrical, or mechanical)</li>
            <li>email (string)</li>
            <li>phone (string)</li>
            <li>experience (number of years)</li>
            <li>shift_preference (morning, afternoon, or full_day)</li>
            <li>max_supervisions (maximum number of supervisions per day)</li>
            <li>preferred_exam_types (semicolon-separated list of exam types)</li>
          </ol>
          <p className="mt-2">Example:</p>
          <pre className="bg-white p-2 rounded mt-2">
            name,department,email,phone,experience,shift_preference,max_supervisions,preferred_exam_types
            John Doe,Computer Science,john@example.com,1234567890,5,morning,3,Regular;Backlog
            Jane Smith,Electronics,jane@example.com,0987654321,3,full_day,2,Regular
          </pre>
        </div>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-4">Allocate Supervisors</h3>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAllocate}
          className="max-w-md"
        >
          <Form.Item
            name="examId"
            label="Exam ID"
            rules={[{ required: true, message: 'Please enter the exam ID' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="date"
            label="Exam Date"
            rules={[{ required: true, message: 'Please select the exam date' }]}
          >
            <DatePicker className="w-full" />
          </Form.Item>

          <Form.Item
            name="startTime"
            label="Start Time"
            rules={[{ required: true, message: 'Please select the start time' }]}
          >
            <TimePicker format="HH:mm" className="w-full" />
          </Form.Item>

          <Form.Item
            name="endTime"
            label="End Time"
            rules={[{ required: true, message: 'Please select the end time' }]}
          >
            <TimePicker format="HH:mm" className="w-full" />
          </Form.Item>

          <Form.Item
            name="examType"
            label="Exam Type"
            rules={[{ required: true, message: 'Please select the exam type' }]}
          >
            <Select>
              <Option value="Regular">Regular</Option>
              <Option value="Backlog">Backlog</Option>
              <Option value="Special">Special</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="requiredSupervisors"
            label="Required Supervisors"
            rules={[{ required: true, message: 'Please enter the number of required supervisors' }]}
          >
            <Input type="number" min={1} />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              Allocate Supervisors
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default SupervisorUpload; 