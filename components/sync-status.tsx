'use client';

import { useEffect, useState } from 'react';
import { Cloud, CloudOff, AlertTriangle } from 'lucide-react';
import { OfflineService } from '@/lib/offline-service';

export function SyncStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [syncStatus, setSyncStatus] = useState<'syncing' | 'synced' | 'pending' | 'error' | null>(null);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    // Check initial status
    setIsOnline(navigator.onLine);
    
    const status = OfflineService.getSyncStatus();
    if (status) {
      setSyncStatus(status.status);
    }
    
    setPendingCount(OfflineService.getPendingOperationsCount());

    // Listen for online/offline
    const handleOnline = () => {
      setIsOnline(true);
      OfflineService.syncPendingOperations();
    };

    const handleOffline = () => {
      setIsOnline(false);
      setSyncStatus('pending');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline && (!syncStatus || syncStatus === 'synced') && pendingCount === 0) {
    return null;
  }

  if (!isOnline) {
    return (
      <div className="fixed bottom-4 right-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-center gap-2 shadow-md">
        <CloudOff className="w-4 h-4 text-yellow-600" />
        <div className="text-sm">
          <p className="font-medium text-yellow-900">Modo offline</p>
          <p className="text-xs text-yellow-800">Los cambios se sincronizarán cuando estés online</p>
        </div>
      </div>
    );
  }

  if (syncStatus === 'syncing' || pendingCount > 0) {
    return (
      <div className="fixed bottom-4 right-4 bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center gap-2 shadow-md animate-pulse">
        <Cloud className="w-4 h-4 text-blue-600" />
        <div className="text-sm">
          <p className="font-medium text-blue-900">Sincronizando...</p>
          {pendingCount > 0 && (
            <p className="text-xs text-blue-800">
              {pendingCount} cambio{pendingCount !== 1 ? 's' : ''} pendiente{pendingCount !== 1 ? 's' : ''}
            </p>
          )}
        </div>
      </div>
    );
  }

  if (syncStatus === 'error') {
    return (
      <div className="fixed bottom-4 right-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2 shadow-md">
        <AlertTriangle className="w-4 h-4 text-red-600" />
        <div className="text-sm">
          <p className="font-medium text-red-900">Error de sincronización</p>
          <p className="text-xs text-red-800">Intenta de nuevo más tarde</p>
        </div>
      </div>
    );
  }

  return null;
}
