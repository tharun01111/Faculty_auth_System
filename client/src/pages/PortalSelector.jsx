import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "../components/ui/card";
import { Button } from "../components/ui/button";

const PortalSelector = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome</CardTitle>
          <CardDescription>Select your portal to continue</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Button 
            variant="outline" 
            className="h-20 text-lg" 
            onClick={() => navigate("/admin/login")}
          >
            Admin Portal
          </Button>
          <Button 
            className="h-20 text-lg" 
            onClick={() => navigate("/faculty/login")}
          >
            Faculty Portal
          </Button>
        </CardContent>
        <CardFooter className="justify-center">
          <p className="text-xs text-muted-foreground">© 2026 Faculty System</p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default PortalSelector;
