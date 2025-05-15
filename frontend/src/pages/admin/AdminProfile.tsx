import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Pencil } from "lucide-react";

const AdminProfile = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Admin Profile</h1>
        <Button>
          <Pencil className="h-4 w-4 mr-2" />
          Edit Profile
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Profile Picture</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-4">
            <div className="relative">
              <Avatar className="h-32 w-32">
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback>AD</AvatarFallback>
              </Avatar>
              <Button
                size="icon"
                variant="outline"
                className="absolute bottom-0 right-0 rounded-full"
              >
                <Camera className="h-4 w-4" />
              </Button>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold">Admin User</h3>
              <p className="text-sm text-gray-500">admin@example.com</p>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" value="Admin" readOnly />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" value="User" readOnly />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value="admin@example.com" readOnly />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" type="tel" value="+1 234 567 8900" readOnly />
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Security Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input id="currentPassword" type="password" placeholder="Enter current password" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input id="newPassword" type="password" placeholder="Enter new password" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input id="confirmPassword" type="password" placeholder="Confirm new password" />
            </div>

            <Button className="w-full">Change Password</Button>
          </CardContent>
        </Card>

        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>System Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <select
                id="language"
                className="w-full rounded-md border border-input bg-background px-3 py-2"
                defaultValue="en"
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timezone">Time Zone</Label>
              <select
                id="timezone"
                className="w-full rounded-md border border-input bg-background px-3 py-2"
                defaultValue="utc"
              >
                <option value="utc">UTC</option>
                <option value="est">EST</option>
                <option value="pst">PST</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="theme">Theme</Label>
              <select
                id="theme"
                className="w-full rounded-md border border-input bg-background px-3 py-2"
                defaultValue="light"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="system">System</option>
              </select>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminProfile; 