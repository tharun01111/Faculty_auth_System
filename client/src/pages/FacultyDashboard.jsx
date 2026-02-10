import React from "react";
import LogoutButton from "../components/LogoutButton";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";

const FacultyDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-4xl">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Faculty Dashboard</h1>
            <p className="text-muted-foreground">Welcome back to the portal.</p>
          </div>
          <LogoutButton />
        </header>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>My Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">No classes scheduled for today.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Students</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">View and manage student details.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Generate performance reports.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FacultyDashboard;