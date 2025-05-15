import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { facultyService } from "@/services/api";
import { Faculty } from "@/lib/types";

const FacultyForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Define the initial state with all required properties
  const initialFormState: Faculty & {
    designation: string;
    experience: number;
    shift_preference: 'full' | 'half' | 'none';
    specialization: string;
  } = {
    id: "",
    name: "",
    department: "",
    email: "",
    phone: "",
    designation: "",
    experience: 0,
    shift_preference: "full",
    max_supervisions: 0,
    specialization: "",
    availability: {
      monday: false,
      tuesday: false,
      wednesday: false,
      thursday: false,
      friday: false,
      saturday: false,
    },
  };

  const [formData, setFormData] = useState<Faculty>(initialFormState);

  useEffect(() => {
    const fetchFaculty = async () => {
      if (isEditing && id) {
        try {
          setLoading(true);
          setError(null);
          const faculty = await facultyService.getById(id);
          if (faculty) {
            setFormData(faculty);
          } else {
            toast.error("Faculty not found");
            navigate("/faculty");
          }
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : "Failed to fetch faculty";
          setError(errorMessage);
          toast.error(errorMessage);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchFaculty();
  }, [id, isEditing, navigate]);

  const updateMutation = useMutation({
    mutationFn: (faculty: Faculty) => {
      return facultyService.update(faculty.id, faculty);
    },
    onSuccess: () => {
      toast.success("Faculty updated successfully");
      navigate("/faculty");
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error 
        ? error.message 
        : typeof error === 'object' && error !== null && 'message' in error
          ? String((error as {message: unknown}).message)
          : "Failed to update faculty";
      toast.error(errorMessage);
    },
  });

  const createMutation = useMutation({
    mutationFn: (faculty: Omit<Faculty, "id">) => {
      console.log('Sending data to API:', JSON.stringify(faculty, null, 2));
      return facultyService.create(faculty);
    },
    onSuccess: () => {
      toast.success("Faculty created successfully");
      navigate("/faculty");
    },
    onError: (error: unknown) => {
      console.error('Faculty creation error:', error);
      // Extract more detailed error information if available
      let errorDetails = "";
      let errorResponse = null;
      
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as any;
        errorResponse = axiosError.response?.data;
        if (errorResponse?.error) {
          errorDetails = `: ${errorResponse.error}`;
        }
        if (errorResponse?.details) {
          errorDetails += ` - ${errorResponse.details}`;
        }
      }
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : typeof error === 'object' && error !== null && 'message' in error
          ? String((error as {message: unknown}).message)
          : "Failed to create faculty";
      
      toast.error(`${errorMessage}${errorDetails}`);
      
      // Log full error details for debugging
      console.error('Full error details:', {
        errorMessage,
        errorDetails,
        errorResponse
      });
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (type === "checkbox") {
      const checkbox = e.target as HTMLInputElement;
      const day = name.split(".")[1]; // Extract day from name like "availability.monday"
      
      setFormData({
        ...formData,
        availability: {
          ...(typeof formData.availability === 'object' && !Array.isArray(formData.availability) 
            ? formData.availability as Record<string, boolean>
            : {}),
          [day]: checkbox.checked,
        },
      });
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
    
    try {
      // Validate required fields
      const requiredFields = ['name', 'department', 'designation', 'email', 'phone'];
      
      for (const field of requiredFields) {
        if (!formData[field as keyof Faculty]) {
          toast.error(`${field} is required`);
          return;
        }
      }
      
      // Convert availability object to array format the backend expects
      let availabilityArray: string[] = [];
      
      if (typeof formData.availability === 'object' && formData.availability !== null) {
        if (Array.isArray(formData.availability)) {
          availabilityArray = formData.availability;
        } else {
          availabilityArray = Object.entries(formData.availability)
            .filter(([_, value]) => value)
            .map(([day]) => day);
        }
      }
      
      console.log('Availability array:', availabilityArray);
      
      // Map department to valid backend values
      let departmentValue = formData.department.toLowerCase();
      const validDepartments = ['computer science', 'electronics', 'electrical', 'mechanical'];
      
      // If not a valid department, map to closest match
      if (!validDepartments.includes(departmentValue)) {
        if (departmentValue.includes('comp') || departmentValue.includes('it') || departmentValue.includes('ce')) {
          departmentValue = 'computer science';
        } else if (departmentValue.includes('elec') && departmentValue.includes('ron')) {
          departmentValue = 'electronics';
        } else if (departmentValue.includes('elec')) {
          departmentValue = 'electrical';
        } else if (departmentValue.includes('mech')) {
          departmentValue = 'mechanical';
        } else {
          departmentValue = 'computer science'; // Default
        }
      }
      
      // Ensure shift_preference is a valid value
      let shiftValue = formData.shift_preference as string;
      if (!['full', 'half', 'none'].includes(shiftValue)) {
        shiftValue = 'full';
      }
      
      // Stringify the availability array - make sure it's a proper JSON string
      const availabilityString = JSON.stringify(availabilityArray);
      
      // Create a new faculty object with all required fields
      const newFaculty = {
        name: formData.name,
        department: departmentValue,
        designation: formData.designation,
        email: formData.email,
        phone: formData.phone,
        // Use both field names for compatibility with different database schemas
        seniority: typeof formData.experience === 'number' ? formData.experience : 0,
        experience: typeof formData.experience === 'number' ? formData.experience : 0,
        shift_preference: shiftValue,
        max_supervisions: typeof formData.max_supervisions === 'number' ? formData.max_supervisions : 0,
        specialization: formData.specialization || '',
        // Since SQL error involves JSON, remove any potential JSON parsing issues
        availability: Array.isArray(availabilityArray) ? JSON.stringify(availabilityArray) : '[]'
      };
      
      // Create a simplified version for maximum compatibility
      const simplifiedFaculty = {
        name: formData.name,
        department: departmentValue,
        designation: formData.designation,
        email: formData.email || '',
        phone: formData.phone || '',
        experience: 0,
        shift_preference: 'full',
        max_supervisions: 1,
        specialization: '',
        availability: '[]'
      };
      
      console.log('Submitting faculty data:', newFaculty);
      
      if (isEditing && formData.id) {
        // For updates, include the ID in the faculty object
        const updateData = {
          id: formData.id,
          name: newFaculty.name,
          department: newFaculty.department,
          designation: newFaculty.designation,
          email: newFaculty.email,
          phone: newFaculty.phone,
          seniority: newFaculty.seniority,
          experience: newFaculty.experience,
          shift_preference: newFaculty.shift_preference,
          max_supervisions: newFaculty.max_supervisions,
          specialization: newFaculty.specialization,
          availability: newFaculty.availability
        };
        
        console.log('Update data:', updateData);
        updateMutation.mutate(updateData as any);
      } else {
        // For creating, we'll first try with the normal data
        console.log('Create data:', newFaculty);
        try {
          // Use "as any" to bypass type checking
          createMutation.mutate(newFaculty as any);
        } catch (err) {
          console.error('Error with regular faculty data, trying simplified version:', err);
          
          // If the regular approach fails, try the simplified version directly
          toast.info("Trying with a simplified approach...");
          
          // Use the simpler create function
          try {
            const result = await facultyService.createSimple(
              formData.name,
              departmentValue,
              formData.designation
            );
            
            console.log('Success with simplified approach:', result);
            toast.success("Faculty created successfully with simplified data");
            navigate("/faculty");
          } catch (simpleErr) {
            console.error('Even simplified creation failed:', simpleErr);
            toast.error("Failed to create faculty even with simplified data");
          }
        }
      }
    } catch (err) {
      console.error('Error in form submission:', err);
      toast.error('Form submission error: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">
        {isEditing ? "Edit Faculty" : "Add New Faculty"}
      </h1>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 mb-6">
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 text-sm text-red-600 hover:text-red-800"
          >
            Try again
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Basic Information */}
            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-medium">
                Name *
              </label>
              <input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full border rounded p-2"
                required
                disabled={updateMutation.isPending || createMutation.isPending}
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="department" className="block text-sm font-medium">
                Department *
              </label>
              <input
                id="department"
                name="department"
                value={formData.department}
                onChange={handleInputChange}
                className="w-full border rounded p-2"
                required
                disabled={updateMutation.isPending || createMutation.isPending}
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium">
                Email *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full border rounded p-2"
                required
                disabled={updateMutation.isPending || createMutation.isPending}
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="phone" className="block text-sm font-medium">
                Phone *
              </label>
              <input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full border rounded p-2"
                required
                disabled={updateMutation.isPending || createMutation.isPending}
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="designation" className="block text-sm font-medium">
                Designation *
              </label>
              <input
                id="designation"
                name="designation"
                value={formData.designation}
                onChange={handleInputChange}
                className="w-full border rounded p-2"
                required
                disabled={updateMutation.isPending || createMutation.isPending}
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="experience" className="block text-sm font-medium">
                Experience (Years) *
              </label>
              <input
                id="experience"
                name="experience"
                type="number"
                min="0"
                value={formData.experience}
                onChange={handleInputChange}
                className="w-full border rounded p-2"
                required
                disabled={updateMutation.isPending || createMutation.isPending}
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="max_supervisions" className="block text-sm font-medium">
                Max Supervisions *
              </label>
              <input
                id="max_supervisions"
                name="max_supervisions"
                type="number"
                min="0"
                value={formData.max_supervisions}
                onChange={handleInputChange}
                className="w-full border rounded p-2"
                required
                disabled={updateMutation.isPending || createMutation.isPending}
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="shift_preference" className="block text-sm font-medium">
                Shift Preference *
              </label>
              <select
                id="shift_preference"
                name="shift_preference"
                value={formData.shift_preference}
                onChange={handleInputChange}
                className="w-full border rounded p-2"
                required
                disabled={updateMutation.isPending || createMutation.isPending}
              >
                <option value="full">Full</option>
                <option value="half">Half</option>
                <option value="none">None</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="specialization" className="block text-sm font-medium">
                Specialization
              </label>
              <input
                id="specialization"
                name="specialization"
                value={formData.specialization}
                onChange={handleInputChange}
                className="w-full border rounded p-2"
                disabled={updateMutation.isPending || createMutation.isPending}
              />
            </div>
          </div>

          {/* Availability Section */}
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-4">Availability</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Object.entries(formData.availability).map(([day, checked]) => (
                <label key={day} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name={`availability.${day}`}
                    checked={checked}
                    onChange={handleInputChange}
                    disabled={updateMutation.isPending || createMutation.isPending}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm capitalize">{day}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-4 mt-6">
            <button
              type="button"
              onClick={() => navigate("/faculty")}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              disabled={updateMutation.isPending || createMutation.isPending}
            >
              Cancel
            </button>
            
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
              disabled={updateMutation.isPending || createMutation.isPending}
            >
              {updateMutation.isPending || createMutation.isPending ? (
                <span className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                  <span>{isEditing ? "Updating..." : "Creating..."}</span>
                </span>
              ) : (
                <span>{isEditing ? "Update Faculty" : "Create Faculty"}</span>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default FacultyForm;
