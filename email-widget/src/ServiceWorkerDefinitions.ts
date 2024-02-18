export interface PeriodicSyncManager {
    getTags(): Promise<string[]>;
    register(tag: string, options: object): Promise<undefined>;
    unregister(tag: string): Promise<undefined>;
}

export interface ServiceWorkerRegistration {
    periodicSync: PeriodicSyncManager;
}