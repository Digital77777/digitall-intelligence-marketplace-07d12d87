import { useEffect, useState } from 'react';
import { Workbox } from 'workbox-window';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { RefreshCw } from 'lucide-react';

export const UpdatePrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [wb, setWb] = useState<Workbox | null>(null);

  useEffect(() => {
    // Version check - runs immediately on mount
    const checkVersion = async () => {
      try {
        const response = await fetch('/version.json?t=' + Date.now(), {
          cache: 'no-cache',
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });
        const data = await response.json();
        const currentVersion = localStorage.getItem('app_version');
        
        if (currentVersion && currentVersion !== data.version) {
          console.log('Version mismatch detected. Forcing reload...');
          localStorage.setItem('app_version', data.version);
          // Clear all caches and reload
          if ('caches' in window) {
            const cacheNames = await caches.keys();
            await Promise.all(cacheNames.map(name => caches.delete(name)));
          }
          window.location.reload();
        } else if (!currentVersion) {
          localStorage.setItem('app_version', data.version);
        }
      } catch (error) {
        console.error('Version check failed:', error);
      }
    };

    checkVersion();

    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      const workbox = new Workbox('/sw.js');

      workbox.addEventListener('waiting', () => {
        setShowPrompt(true);
        toast('New version available!', {
          description: 'Click "Update" to get the latest features and improvements.',
          duration: Infinity,
          action: {
            label: 'Update',
            onClick: () => {
              workbox.messageSkipWaiting();
              window.location.reload();
            },
          },
        });
      });

      workbox.addEventListener('controlling', () => {
        window.location.reload();
      });

      workbox.register().catch((error) => {
        console.error('Service worker registration failed:', error);
      });

      setWb(workbox);

      // Check for updates every 5 minutes
      setInterval(() => {
        workbox.update();
        checkVersion();
      }, 5 * 60 * 1000);
    }
  }, []);

  if (!showPrompt || !wb) return null;

  const handleUpdate = async () => {
    // Clear all caches before updating
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
    }
    wb.messageSkipWaiting();
    setShowPrompt(false);
  };

  return (
    <div className="fixed bottom-20 md:bottom-4 left-4 right-4 md:left-auto md:right-4 z-50 animate-in slide-in-from-bottom-4">
      <div className="bg-card border border-border rounded-lg shadow-lg p-4 max-w-md mx-auto md:mx-0">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-full bg-primary/10">
            <RefreshCw className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 space-y-2">
            <h3 className="font-semibold text-foreground">Update Available</h3>
            <p className="text-sm text-muted-foreground">
              A new version is ready. Update now to get the latest features and improvements.
            </p>
            <div className="flex gap-2 pt-1">
              <Button
                onClick={handleUpdate}
                size="sm"
                className="flex-1"
              >
                Update Now
              </Button>
              <Button
                onClick={() => setShowPrompt(false)}
                variant="outline"
                size="sm"
              >
                Later
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
