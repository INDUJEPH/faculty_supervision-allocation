import { useState } from 'react';
import { Button, Select, Form, InputNumber, message } from 'antd';
import { examService, allocateSupervisors } from '../services/api';
import { useQuery } from '@tanstack/react-query';
import { Exam } from '../lib/types';

interface AssignSupervisorsProps {
  examId: string;
  onSuccess?: () => void;
}

// Create a type that includes both camelCase and snake_case fields
// to handle possible API inconsistencies
interface ExamWithMixedCase extends Exam {
  start_time?: string;
  end_time?: string;
}

const AssignSupervisors = ({ examId, onSuccess }: AssignSupervisorsProps) => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const { data: exam, isLoading: examLoading } = useQuery({
    queryKey: ['exam', examId],
    queryFn: () => examService.getById(examId),
    enabled: !!examId
  });

  // Handle the form initialization when exam data is loaded
  if (exam && form.getFieldValue('examType') === undefined) {
    console.log('Exam data loaded:', exam);
    form.setFieldsValue({
      requiredSupervisors: Math.ceil((exam.student_ids?.length || 30) / 30),
      examType: exam.exam_type || 'Regular',
    });
  }

  const handleAutoAssign = async (values: any) => {
    if (!exam) return;
    
    setLoading(true);
    try {
      // Handle potential field name differences between frontend and backend
      // Use type assertion to handle both camelCase and snake_case properties
      const examData = exam as ExamWithMixedCase;
      const startTime = examData.start_time || examData.startTime;
      const endTime = examData.end_time || examData.endTime;
      
      console.log('Submitting allocation request with data:', {
        examId,
        date: examData.date,
        startTime,
        endTime,
        examType: values.examType,
        requiredSupervisors: values.requiredSupervisors
      });
      
      const result = await allocateSupervisors({
        examId,
        date: examData.date,
        startTime,
        endTime,
        examType: values.examType,
        requiredSupervisors: values.requiredSupervisors
      });

      console.log('Allocation result:', result);

      if (result.success) {
        message.success(result.message);
        if (onSuccess) onSuccess();
      } else {
        message.error(result.message || 'Failed to assign supervisors');
      }
      
      console.log('Allocations:', result.allocations);
    } catch (error) {
      console.error('Error assigning supervisors:', error);
      message.error('Failed to assign supervisors');
    } finally {
      setLoading(false);
    }
  };

  if (examLoading) {
    return <div>Loading exam details...</div>;
  }

  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-4">Auto-Assign Supervisors</h3>
      
      <Form
        form={form}
        layout="vertical"
        onFinish={handleAutoAssign}
      >
        <Form.Item
          name="examType"
          label="Exam Type"
          rules={[{ required: true, message: 'Please select the exam type' }]}
        >
          <Select>
            <Select.Option value="Regular">Regular</Select.Option>
            <Select.Option value="Backlog">Backlog</Select.Option>
            <Select.Option value="Special">Special</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="requiredSupervisors"
          label="Required Supervisors"
          rules={[{ required: true, message: 'Please enter the number of required supervisors' }]}
        >
          <InputNumber min={1} />
        </Form.Item>

        <Form.Item>
          <Button 
            type="primary" 
            htmlType="submit" 
            loading={loading}
          >
            Auto-Assign
          </Button>
        </Form.Item>
      </Form>
      
      {/* Display allocation results if available */}
      <div className="mt-4">
        {/* Will be populated after allocation */}
      </div>
    </div>
  );
};

export default AssignSupervisors; 