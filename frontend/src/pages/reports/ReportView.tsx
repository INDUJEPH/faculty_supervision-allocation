import React from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { ReportData } from '@/lib/types';
import { format } from 'date-fns';

const ReportView: React.FC = () => {
  const { id } = useParams();
  const { toast } = useToast();

  // This is a placeholder. In a real application, you would fetch the report data
  const report: ReportData = {
    id: id || '',
    title: 'Exam Statistics Report',
    type: 'exam_stats',
    date: new Date().toISOString(),
    status: 'completed',
    downloadUrl: '#',
  };

  const handleDownload = () => {
    if (report.downloadUrl) {
      // In a real application, this would trigger a file download
      toast({
        title: 'Download Started',
        description: 'Your report download has started.',
      });
    } else {
      toast({
        title: 'Error',
        description: 'Report is not available for download',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>Report Details</CardTitle>
          <CardDescription>View and download report</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-lg font-semibold">Report Information</h3>
                <div className="mt-2 space-y-2">
                  <p><span className="font-medium">Title:</span> {report.title}</p>
                  <p><span className="font-medium">Type:</span> {report.type}</p>
                  <p>
                    <span className="font-medium">Generated On:</span>{' '}
                    {format(new Date(report.date), 'PPP')}
                  </p>
                  <p><span className="font-medium">Status:</span> {report.status}</p>
                </div>
              </div>

              <div className="flex items-start justify-end">
                <Button
                  onClick={handleDownload}
                  disabled={!report.downloadUrl || report.status !== 'completed'}
                >
                  Download Report
                </Button>
              </div>
            </div>

            {/* Placeholder for report preview */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-4">Preview</h3>
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-muted-foreground">
                  Report preview will be displayed here...
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportView;