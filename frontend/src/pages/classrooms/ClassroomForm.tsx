import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { classroomService } from '@/services/api';
import { Classroom } from '@/lib/types';

const ClassroomForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [classroom, setClassroom] = useState<Omit<Classroom, 'id'>>({
    name: '',
    building: '',
    floor: 1,
    capacity: 30,
    has_special_needs_facilities: false,
    is_accessible: true,
    preferred_seating_type: 'standard',
    maintenance_schedule: {
      last_maintenance: new Date().toISOString(),
      next_maintenance: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (id) {
        await classroomService.update(id, classroom);
        toast({
          title: 'Success',
          description: 'Classroom updated successfully',
        });
      } else {
        await classroomService.create(classroom);
        toast({
          title: 'Success',
          description: 'Classroom created successfully',
        });
      }
      navigate('/classrooms');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save classroom',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof Omit<Classroom, 'id'>, value: any) => {
    setClassroom((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>{id ? 'Edit Classroom' : 'New Classroom'}</CardTitle>
          <CardDescription>
            {id ? 'Update classroom information' : 'Add a new classroom'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={classroom.name}
                onChange={(e) => handleChange('name', e.target.value)}
                required
              />
            </div>

            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="building">Building</Label>
              <Input
                id="building"
                value={classroom.building}
                onChange={(e) => handleChange('building', e.target.value)}
                required
              />
            </div>

            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="floor">Floor</Label>
              <Input
                id="floor"
                type="number"
                value={classroom.floor}
                onChange={(e) => handleChange('floor', parseInt(e.target.value))}
                required
              />
            </div>

            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="capacity">Capacity</Label>
              <Input
                id="capacity"
                type="number"
                value={classroom.capacity}
                onChange={(e) => handleChange('capacity', parseInt(e.target.value))}
                required
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="special-needs"
                checked={classroom.has_special_needs_facilities}
                onCheckedChange={(checked) =>
                  handleChange('has_special_needs_facilities', checked)
                }
              />
              <Label htmlFor="special-needs">Special Needs Facilities</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="accessible"
                checked={classroom.is_accessible}
                onCheckedChange={(checked) => handleChange('is_accessible', checked)}
              />
              <Label htmlFor="accessible">Accessible</Label>
            </div>

            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : id ? 'Update Classroom' : 'Create Classroom'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClassroomForm; 