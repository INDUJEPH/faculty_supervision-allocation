import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { classroomService } from '@/services/api';
import { Classroom } from '@/lib/types';

const ClassroomView: React.FC = () => {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadClassrooms();
  }, []);

  const loadClassrooms = async () => {
    try {
      const data = await classroomService.getAll();
      setClassrooms(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load classrooms',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>Classrooms</CardTitle>
          <CardDescription>View and manage classroom information</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Building</TableHead>
                <TableHead>Floor</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Special Needs</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {classrooms.map((classroom) => (
                <TableRow key={classroom.id}>
                  <TableCell>{classroom.name}</TableCell>
                  <TableCell>{classroom.building}</TableCell>
                  <TableCell>{classroom.floor}</TableCell>
                  <TableCell>{classroom.capacity}</TableCell>
                  <TableCell>{classroom.has_special_needs_facilities ? 'Yes' : 'No'}</TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClassroomView;