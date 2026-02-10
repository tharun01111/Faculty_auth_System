import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../components/ui/card";

const Unauthorized = ({ userRole }) => {
  const navigate = useNavigate();

  const roleRedirect = {
    admin: "/admin/dashboard",
    faculty: "/faculty/dashboard",
    user: "/faculty/dashboard",
  };

  const handleBack = () => {
     // Default to login if role is unknown, otherwise dashboard
    const target = roleRedirect[userRole] || "/login";
    navigate(target);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md text-center border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive text-3xl">403 Unauthorized</CardTitle>
          <CardDescription>
            You do not have permission to access this page.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Please contact your administrator if you believe this is an error.
          </p>
        </CardContent>
        <CardFooter className="justify-center">
          <Button onClick={handleBack} variant="secondary">
            Go Back
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Unauthorized;
