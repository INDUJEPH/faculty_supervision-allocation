import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { facultyService } from '@/services/api';
import { Download } from 'lucide-react';

const SupervisorUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast({
        title: 'Error',
        description: 'Please select a file to upload',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const result = await facultyService.uploadSupervisors(formData);

      if (result.failures.length > 0) {
        toast({
          title: 'Partial Success',
          description: `Successfully uploaded ${result.supervisors.length} supervisors. ${result.failures.length} failed. Check console for details.`,
          variant: 'warning',
        });
        console.error('Upload failures:', result.failures);
      } else {
        toast({
          title: 'Success',
          description: `Successfully uploaded ${result.supervisors.length} supervisors`,
        });
        navigate('/supervision');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to upload supervisors',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadSample = () => {
    const sample = `name,email,department,designation
John Doe,john.doe@example.com,Computer Science,Professor
Jane Smith,jane.smith@example.com,Electronics,Associate Professor`;

    const blob = new Blob([sample], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'supervisors_sample.csv';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Upload Supervisors</h1>
        
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <Input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="flex-1"
            />
            <Button
              onClick={handleUpload}
              disabled={!file || loading}
            >
              {loading ? 'Uploading...' : 'Upload'}
            </Button>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={downloadSample}
              className="flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Download Sample CSV</span>
            </Button>
          </div>

          <div className="bg-muted p-4 rounded-lg">
            <h2 className="font-semibold mb-2">CSV Format Requirements:</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>File must be in CSV format</li>
              <li>First row must be headers</li>
              <li>Required columns: name, email, department, designation</li>
              <li>Department must be one of: Computer Science, Electronics, Electrical, Mechanical</li>
              <li>Email must be unique</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupervisorUpload; 