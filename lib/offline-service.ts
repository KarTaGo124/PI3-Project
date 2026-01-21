// Offline support service for medical platform
// Stores data locally and syncs when connection is restored

interface PendingOperation {
  id: string;
  type: 'create' | 'update' | 'delete';
  resource: 'patient' | 'test' | 'referral';
  data: any;
  timestamp: number;
  synced: boolean;
}

const STORAGE_KEY_PREFIX = 'medical-platform:';
const PENDING_OPERATIONS_KEY = `${STORAGE_KEY_PREFIX}pending-operations`;
const SYNC_STATUS_KEY = `${STORAGE_KEY_PREFIX}sync-status`;

export class OfflineService {
  static isPushNotificationSupported(): boolean {
    return 'serviceWorker' in navigator && 'PushManager' in window;
  }

  static async registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('[OfflineService] Service Worker registered');
        return registration;
      } catch (error) {
        console.error('[OfflineService] Service Worker registration failed:', error);
        return null;
      }
    }
    return null;
  }

  static isOnline(): boolean {
    return navigator.onLine;
  }

  static addPendingOperation(
    type: 'create' | 'update' | 'delete',
    resource: 'patient' | 'test' | 'referral',
    data: any
  ): PendingOperation {
    const operation: PendingOperation = {
      id: `${resource}-${Date.now()}-${Math.random()}`,
      type,
      resource,
      data,
      timestamp: Date.now(),
      synced: false,
    };

    const operations = this.getPendingOperations();
    operations.push(operation);
    localStorage.setItem(PENDING_OPERATIONS_KEY, JSON.stringify(operations));

    return operation;
  }

  static getPendingOperations(): PendingOperation[] {
    const data = localStorage.getItem(PENDING_OPERATIONS_KEY);
    return data ? JSON.parse(data) : [];
  }

  static getPendingOperationsCount(): number {
    return this.getPendingOperations().filter(op => !op.synced).length;
  }

  static markOperationSynced(operationId: string): void {
    const operations = this.getPendingOperations();
    const operation = operations.find(op => op.id === operationId);
    if (operation) {
      operation.synced = true;
      localStorage.setItem(PENDING_OPERATIONS_KEY, JSON.stringify(operations));
    }
  }

  static clearSyncedOperations(): void {
    const operations = this.getPendingOperations();
    const pending = operations.filter(op => !op.synced);
    localStorage.setItem(PENDING_OPERATIONS_KEY, JSON.stringify(pending));
  }

  static setSyncStatus(status: 'syncing' | 'synced' | 'pending' | 'error'): void {
    localStorage.setItem(SYNC_STATUS_KEY, JSON.stringify({
      status,
      lastSync: Date.now(),
    }));
  }

  static getSyncStatus(): {
    status: 'syncing' | 'synced' | 'pending' | 'error';
    lastSync: number;
  } | null {
    const data = localStorage.getItem(SYNC_STATUS_KEY);
    return data ? JSON.parse(data) : null;
  }

  static async syncPendingOperations(): Promise<boolean> {
    if (!this.isOnline()) {
      console.log('[OfflineService] Offline - skipping sync');
      return false;
    }

    this.setSyncStatus('syncing');
    const operations = this.getPendingOperations();
    const pendingOps = operations.filter(op => !op.synced);

    if (pendingOps.length === 0) {
      this.setSyncStatus('synced');
      return true;
    }

    try {
      for (const operation of pendingOps) {
        // In production, send to API
        console.log('[OfflineService] Syncing operation:', operation);
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        this.markOperationSynced(operation.id);
      }

      this.setSyncStatus('synced');
      this.clearSyncedOperations();
      return true;
    } catch (error) {
      console.error('[OfflineService] Sync failed:', error);
      this.setSyncStatus('error');
      return false;
    }
  }

  static cachePatientData(patientId: number, data: any): void {
    const key = `${STORAGE_KEY_PREFIX}patient-${patientId}`;
    localStorage.setItem(key, JSON.stringify(data));
  }

  static getCachedPatientData(patientId: number): any {
    const key = `${STORAGE_KEY_PREFIX}patient-${patientId}`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  }

  static cachePatientsList(data: any): void {
    const key = `${STORAGE_KEY_PREFIX}patients-list`;
    localStorage.setItem(key, JSON.stringify(data));
  }

  static getCachedPatientsList(): any {
    const key = `${STORAGE_KEY_PREFIX}patients-list`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  }

  static getStorageUsage(): Promise<StorageEstimate> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      return navigator.storage.estimate();
    }
    return Promise.reject('Storage estimation not supported');
  }

  static clearAllCache(): void {
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(STORAGE_KEY_PREFIX)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
  }
}

// Hook for listening to online/offline status
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = window.React?.useState?.(navigator.onLine) ?? [true];

  window.React?.useEffect?.(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}
