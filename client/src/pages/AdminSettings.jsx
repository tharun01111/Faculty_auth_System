import { useState, useEffect } from "react";
import AdminLayout from "../components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Palette, Upload, Check, RefreshCcw } from "lucide-react";
import api from "../services/api";
import { toast } from "sonner";

const AdminSettings = () => {
  const [loading, setLoading] = useState(false);
  const [branding, setBranding] = useState({
    logo: "",
    primaryColor: "#6366f1",
  });

  useEffect(() => {
    const fetchBranding = async () => {
      try {
        const res = await api.get("/admin/branding");
        if (res.data) setBranding(res.data);
      } catch (_err) {
        console.error("Failed to fetch branding:", err);
      }
    };
    fetchBranding();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      await api.patch("/admin/branding", branding);
      toast.success("Settings saved successfully!");
      // Trigger theme update
      document.documentElement.style.setProperty("--primary", branding.primaryColor);
    } catch (err) {
      toast.error("Failed to save settings.");
    } finally {
      setLoading(false);
    }
  };

  const resetToDefault = () => {
    setBranding({
      logo: "",
      primaryColor: "#6366f1",
    });
  };

  return (
    <AdminLayout pageTitle="Settings">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <div className="mb-8">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">System Settings</h2>
          <p className="text-sm text-muted-foreground">Customize your institution's branding and application theme.</p>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-primary" />
                <CardTitle>Branding & Theme</CardTitle>
              </div>
              <CardDescription>Update your logo and primary color to match your institution's identity.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="primaryColor">Primary Theme Color</Label>
                  <div className="flex gap-3">
                    <Input
                      id="primaryColor"
                      type="color"
                      value={branding.primaryColor}
                      onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
                      className="h-10 w-20 p-1 cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={branding.primaryColor}
                      onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
                      className="flex-1 font-mono"
                      placeholder="#000000"
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground">Select a hex color code for your main theme buttons and accents.</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="logo">Institution Logo (URL)</Label>
                  <div className="flex gap-2">
                    <Input
                      id="logo"
                      type="text"
                      value={branding.logo}
                      onChange={(e) => setBranding({ ...branding, logo: e.target.value })}
                      placeholder="https://example.com/logo.png"
                      className="flex-1"
                    />
                    <Button variant="outline" size="icon">
                      <Upload className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-[10px] text-muted-foreground">Publicly accessible URL to your logo image.</p>
                </div>
              </div>

              {/* Preview Area */}
              <div className="rounded-xl border border-dashed border-border bg-muted/30 p-8 text-center">
                <p className="mb-4 text-xs font-medium uppercase tracking-widest text-muted-foreground">Live Preview</p>
                <div className="flex flex-col items-center gap-4">
                  {branding.logo ? (
                    <img src={branding.logo} alt="Institution Logo" className="h-12 w-auto object-contain" />
                  ) : (
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                      <Palette className="h-6 w-6" />
                    </div>
                  )}
                  <Button style={{ backgroundColor: branding.primaryColor }}>
                    <Check className="mr-2 h-4 w-4" />
                    Mock Action Button
                  </Button>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="ghost" onClick={resetToDefault} disabled={loading}>
                  <RefreshCcw className="mr-2 h-4 w-4" />
                  Reset to Default
                </Button>
                <Button onClick={handleSave} disabled={loading}>
                  {loading ? "Saving..." : "Save Branding"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
