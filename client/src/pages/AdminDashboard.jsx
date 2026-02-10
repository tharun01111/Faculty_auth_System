import React from "react";
import LogoutButton from "../components/LogoutButton";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";

const AdminDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-4xl">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage the system and users.</p>
          </div>
          <LogoutButton />
        </header>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Faculty Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Add, remove, or update faculty members.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>System Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">View system activity and errors.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Configure system preferences.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
