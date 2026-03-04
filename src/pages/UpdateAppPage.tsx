import { useState } from 'react';
import { RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SEOHead } from '@/components/SEOHead';

const UpdateAppPage = () => {
  const [updating, setUpdating] = useState(false);
  const [updated, setUpdated] = useState(false);

  const handleUpdate = async () => {
    setUpdating(true);
    try {
      // Clear all caches
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
      }

      // Unregister service workers
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map(reg => reg.unregister()));
      }

      // Update version
      try {
        const response = await fetch('/version.json?t=' + Date.now(), { cache: 'no-cache' });
        const data = await response.json();
        localStorage.setItem('app_version', data.version);
      } catch {}

      setUpdated(true);
      setTimeout(() => window.location.reload(), 1500);
    } catch (error) {
      console.error('Update failed:', error);
      setUpdating(false);
    }
  };

  return (
    <>
      <SEOHead
        title="Update App | Digital Intelligence Marketplace"
        description="Update to the latest version of Digital Intelligence Marketplace"
      />
      <div className="container mx-auto px-4 py-12 max-w-lg">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 rounded-full bg-primary/10 w-fit">
              <RefreshCw className={`h-8 w-8 text-primary ${updating ? 'animate-spin' : ''}`} />
            </div>
            <CardTitle className="text-2xl">Update App</CardTitle>
            <CardDescription>
              Get the latest features, improvements, and bug fixes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {updated ? (
              <div className="flex items-center gap-3 p-4 rounded-lg bg-primary/10 text-primary">
                <CheckCircle className="h-5 w-5 shrink-0" />
                <p className="text-sm font-medium">Updated successfully! Reloading...</p>
              </div>
            ) : (
              <>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <p>Tap the button below to check for and install the latest version. This will:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Clear cached files</li>
                    <li>Download the latest version</li>
                    <li>Reload the app automatically</li>
                  </ul>
                </div>
                <Button
                  onClick={handleUpdate}
                  disabled={updating}
                  className="w-full"
                  size="lg"
                >
                  {updating ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Update to Latest Version
                    </>
                  )}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default UpdateAppPage;
