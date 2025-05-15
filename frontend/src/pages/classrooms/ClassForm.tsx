import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { classroomService } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Classroom } from "@/lib/types";

const ClassroomForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initialFormState: Classroom = {
    id: "",
    name: "",
    building: "",
    floor: 0,
    capacity: 0,
    hasProjector: false,
    isComputerLab: false,
  };

  const [formData, setFormData] = useState<Classroom>(initialFormState);

  useEffect(() => {
    const fetchClassroom = async () => {
      if (isEditing && id) {
        try {
          setLoading(true);
          setError(null);
          const classroom = await classroomService.getById(id);
          if (classroom) {
            setFormData(classroom);
          } else {
            toast.error("Classroom not found");
            navigate("/classrooms");
          }
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : "Failed to fetch classroom";
          setError(errorMessage);
          toast.error(errorMessage);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchClassroom();
  }, [id, isEditing, navigate]);

  const updateMutation = useMutation({
    mutationFn: (classroom: Classroom) => {
      return classroomService.update(classroom.id, classroom);
    },
    onSuccess: () => {
      toast.success("Classroom updated successfully");
      navigate("/classrooms");
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : "Failed to update classroom";
      toast.error(errorMessage);
    },
  });

  const createMutation = useMutation({
    mutationFn: (classroom: Omit<Classroom, "id">) => {
      return classroomService.create(classroom);
    },
    onSuccess: () => {
      toast.success("Classroom created successfully");
      navigate("/classrooms");
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : "Failed to create classroom";
      toast.error(errorMessage);
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    
    setFormData({
      ...formData,
      [name]: type === "number" ? parseInt(value, 10) : value,
    });
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData({
      ...formData,
      [name]: checked,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isEditing) {
      updateMutation.mutate(formData);
    } else {
      // For creating, we omit the id as it will be generated
      const { id, ...newClassroom } = formData;
      createMutation.mutate(newClassroom as Omit<Classroom, "id">);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">
        {isEditing ? "Edit Classroom" : "Add New Classroom"}
      </h1>
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Classroom Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="building">Building *</Label>
                <Input
                  id="building"
                  name="building"
                  value={formData.building}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="floor">Floor *</Label>
                <Input
                  id="floor"
                  name="floor"
                  type="number"
                  min="0"
                  value={formData.floor}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="capacity">Capacity *</Label>
                <Input
                  id="capacity"
                  name="capacity"
                  type="number"
                  min="1"
                  value={formData.capacity}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <Label htmlFor="hasProjector" className="cursor-pointer">Has Projector</Label>
                <Switch
                  id="hasProjector"
                  checked={formData.hasProjector}
                  onCheckedChange={(checked) => handleSwitchChange("hasProjector", checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="isComputerLab" className="cursor-pointer">Is Computer Lab</Label>
                <Switch
                  id="isComputerLab"
                  checked={formData.isComputerLab}
                  onCheckedChange={(checked) => handleSwitchChange("isComputerLab", checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="isActive" className="cursor-pointer">Active Status</Label>
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => handleSwitchChange("isActive", checked)}
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/classrooms")}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updateMutation.isPending || createMutation.isPending}
              >
                {updateMutation.isPending || createMutation.isPending
                  ? "Saving..."
                  : isEditing
                  ? "Update Classroom"
                  : "Add Classroom"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClassroomForm;
