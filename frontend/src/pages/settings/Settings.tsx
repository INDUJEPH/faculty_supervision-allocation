import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Settings = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Settings</h1>
        <Button>Save Changes</Button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>System Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email Notifications</Label>
                <p className="text-sm text-gray-500">Receive email notifications for important updates</p>
              </div>
              <Switch />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Maintenance Mode</Label>
                <p className="text-sm text-gray-500">Enable maintenance mode for system updates</p>
              </div>
              <Switch />
            </div>

            <div className="space-y-2">
              <Label>Default Time Zone</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select time zone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="utc">UTC</SelectItem>
                  <SelectItem value="est">EST</SelectItem>
                  <SelectItem value="pst">PST</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Email Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>SMTP Server</Label>
              <Input placeholder="smtp.example.com" />
            </div>

            <div className="space-y-2">
              <Label>SMTP Port</Label>
              <Input placeholder="587" type="number" />
            </div>

            <div className="space-y-2">
              <Label>Email Username</Label>
              <Input placeholder="username@example.com" />
            </div>

            <div className="space-y-2">
              <Label>Email Password</Label>
              <Input placeholder="••••••••" type="password" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Backup Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Automatic Backups</Label>
                <p className="text-sm text-gray-500">Enable automatic daily backups</p>
              </div>
              <Switch />
            </div>

            <div className="space-y-2">
              <Label>Backup Location</Label>
              <Input placeholder="/path/to/backup/folder" />
            </div>

            <div className="space-y-2">
              <Label>Retention Period (days)</Label>
              <Input placeholder="30" type="number" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings; 