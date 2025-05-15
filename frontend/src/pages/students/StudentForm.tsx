import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { studentService } from "@/services/api";
import { Student } from "@/lib/types";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Save, 
  User, 
  Hash, 
  School, 
  Layers, 
  Users, 
  BookOpen,
  XCircle 
} from "lucide-react";
import { Form } from 'antd';
import { Select } from 'antd';
import { message } from 'antd';

const { Option } = Select;

interface StudentFormValues {
  name: string;
  rollNumber: string;
  department: string;
  semester: number;
  section: string;
  electiveSubjects?: string;
}

const StudentForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  // Initial state with required fields
  const initialFormState: Student = {
    id: "",
    name: "",
    roll_number: "",
    department: "",
    semester: 1,
    section: "A",
    elective_subjects: [],
  };

  const [formData, setFormData] = useState<Student>(initialFormState);
  const [electivesInput, setElectivesInput] = useState<string>("");

  useEffect(() => {
    const fetchStudent = async () => {
      if (isEditing && id) {
        try {
          setLoading(true);
          setError(null);
          const student = await studentService.getById(id);
          if (student) {
            setFormData(student);
            // Set form values
            form.setFieldsValue({
              name: student.name,
              rollNumber: student.roll_number,
              department: student.department,
              semester: student.semester,
              section: student.section,
              electiveSubjects: student.elective_subjects.join(", ")
            });
            // Convert array to comma-separated string for the input field
            setElectivesInput(student.elective_subjects.join(", "));
          } else {
            toast.error("Student not found");
            navigate("/students");
          }
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : "Failed to fetch student";
          setError(errorMessage);
          toast.error(errorMessage);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchStudent();
  }, [id, isEditing, navigate, form]);

  const updateMutation = useMutation({
    mutationFn: (student: Student) => {
      return studentService.update(student.id, student);
    },
    onSuccess: () => {
      toast.success("Student updated successfully");
      navigate("/students");
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : "Failed to update student";
      toast.error(errorMessage);
    },
  });

  const createMutation = useMutation({
    mutationFn: (student: Omit<Student, "id">) => {
      console.log('Creating student with data:', student);
      return studentService.create(student);
    },
    onSuccess: (data) => {
      console.log('Student created successfully:', data);
      toast.success("Student created successfully");
      navigate("/students");
    },
    onError: (error) => {
      console.error('Error creating student:', error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : typeof error === 'object' && error !== null && 'message' in error
          ? String(error.message)
          : "Failed to create student";
      toast.error(errorMessage);
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (name === "electivesInput") {
      setElectivesInput(value);
    } else if (type === "number") {
      setFormData({
        ...formData,
        [name]: parseInt(value, 10),
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Parse electives from the comma-separated string
    const elective_subjects = electivesInput
      ? electivesInput.split(",").map(item => item.trim()).filter(Boolean)
      : [];
    
    const updatedFormData = {
      ...formData,
      elective_subjects,
    };
    
    console.log('Submitting form data:', updatedFormData);
    
    if (isEditing) {
      updateMutation.mutate(updatedFormData);
    } else {
      // For creating, we omit the id as it will be generated
      const { id, ...newStudent } = updatedFormData;
      createMutation.mutate(newStudent as Omit<Student, "id">);
    }
  };

  const onFinish = async (values: StudentFormValues) => {
    try {
      // Convert elective subjects string to array
      const electiveSubjects = values.electiveSubjects
        ? values.electiveSubjects.split(',').map((subject: string) => subject.trim())
        : [];

      // Log the form values to debug
      console.log('Form Values:', values);

      const studentData: Omit<Student, 'id'> = {
        name: values.name,
        roll_number: values.rollNumber, // Map from rollNumber to roll_number
        department: values.department,
        semester: values.semester,
        section: values.section,
        elective_subjects: electiveSubjects // Map from electiveSubjects to elective_subjects
      };

      console.log('Sending student data:', studentData);
      
      if (isEditing && id) {
        await studentService.update(id, studentData);
        message.success('Student updated successfully');
      } else {
        await studentService.create(studentData);
        message.success('Student added successfully');
      }
      
      queryClient.invalidateQueries({ queryKey: ['students'] });
      navigate('/students');
    } catch (error) {
      console.error('Error saving student:', error);
      message.error('Failed to save student');
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/students")}
          className="p-2 h-auto rounded-full bg-white border border-gray-200 shadow-sm hover:bg-gray-50"
        >
          <ArrowLeft size={16} className="text-gray-600" />
        </Button>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 text-transparent bg-clip-text">
          {isEditing ? "Edit Student" : "Add New Student"}
        </h1>
      </div>

      <Card className="border-primary/20 shadow-md overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-primary/20 to-primary/5 p-6 border-b border-primary/10">
          <div className="flex items-center gap-3">
            <div className="bg-white/80 p-2 rounded-full shadow-sm">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Student Information</h2>
              <p className="text-sm text-gray-500">Enter the student's personal and academic details</p>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-6">
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            initialValues={{
              name: "",
              rollNumber: "",
              department: "computer science",
              semester: 1,
              section: "A",
              electiveSubjects: ""
            }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Form.Item
                label="Full Name"
                name="name"
                rules={[{ required: true, message: 'Please enter student name' }]}
              >
                <Input placeholder="Enter student's full name" />
              </Form.Item>
              
              <Form.Item
                label="Roll Number"
                name="rollNumber"
                rules={[{ required: true, message: 'Please enter roll number' }]}
              >
                <Input placeholder="Enter unique roll number" />
              </Form.Item>
              
              <Form.Item
                label="Department"
                name="department"
                rules={[{ required: true, message: 'Please select department' }]}
              >
                <Select placeholder="Select department">
                  <Option value="computer science">Computer Science</Option>
                  <Option value="electronics">Electronics</Option>
                  <Option value="electrical">Electrical</Option>
                  <Option value="mechanical">Mechanical</Option>
                </Select>
              </Form.Item>
              
              <Form.Item
                label="Semester"
                name="semester"
                rules={[{ required: true, message: 'Please select semester' }]}
              >
                <Select placeholder="Select semester">
                  <Option value={1}>1</Option>
                  <Option value={2}>2</Option>
                  <Option value={3}>3</Option>
                  <Option value={4}>4</Option>
                  <Option value={5}>5</Option>
                  <Option value={6}>6</Option>
                  <Option value={7}>7</Option>
                  <Option value={8}>8</Option>
                </Select>
              </Form.Item>
              
              <Form.Item
                label="Section"
                name="section"
                rules={[{ required: true, message: 'Please select section' }]}
              >
                <Select placeholder="Select section">
                  <Option value="A">A</Option>
                  <Option value="B">B</Option>
                  <Option value="C">C</Option>
                </Select>
              </Form.Item>
              
              <Form.Item
                label="Elective Subjects"
                name="electiveSubjects"
                tooltip="Separate multiple subjects with commas"
              >
                <Input placeholder="e.g. Machine Learning, Cloud Computing" />
              </Form.Item>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 mt-6">
              <h3 className="font-medium flex items-center gap-2 mb-3">
                <BookOpen className="h-4 w-4 text-primary" />
                Elective Subjects Preview
              </h3>
              
              {electivesInput ? (
                <div className="flex flex-wrap gap-2">
                  {electivesInput.split(',').map((subject, index) => {
                    const trimmedSubject = subject.trim();
                    if (!trimmedSubject) return null;
                    
                    return (
                      <Badge 
                        key={index} 
                        className="bg-primary/10 text-primary border-primary/20 px-2.5 py-1 flex items-center gap-1"
                      >
                        <BookOpen className="h-3 w-3" />
                        {trimmedSubject}
                      </Badge>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-500 text-sm italic">No elective subjects added</p>
              )}
            </div>
            
            <div className="flex justify-between items-center pt-4 border-t border-gray-100">
              <Button
                type="button"
                onClick={() => navigate("/students")}
                variant="outline"
                className="border-gray-300 text-gray-700 hover:bg-gray-100 flex items-center gap-2"
              >
                <XCircle className="h-4 w-4" />
                Cancel
              </Button>
              
              <Button
                type="submit"
                className="bg-gradient-to-r from-primary to-primary/80 text-white shadow-md hover:shadow-lg transition-all gap-2"
              >
                <Save className="h-4 w-4" />
                {isEditing ? "Update Student" : "Add Student"}
              </Button>
            </div>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentForm;
