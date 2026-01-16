export interface Request {
    id: string;
    name: string;
    method: string;
    url: string;
    headers: any[];
    body: string;
    bodyType?: 'none' | 'json' | 'form-data' | 'raw';
    type: 'http' | 'websocket' | 'socketio';
    preRequestScript?: string;
    collectionId?: string | number | null;
    auth?: {
        type: 'none' | 'basic' | 'bearer';
        basic?: { username?: string; password?: string };
        bearer?: { token?: string };
    };
}

export interface Folder {
    id: string;
    name: string;
    requests: Request[];
}

export interface Collection {
    id: string;
    name: string;
    folders: Folder[];
    requests: Request[];
    variables?: any[];
}

export interface CollectionState {
    collections: Collection[];
    independentRequests: Request[];
    activeRequestId: string | null;
    openRequests: string[];
    loading: boolean;
    error: string | null;
}

export interface Environment {
    id: string;
    name: string;
    variables: any[];
}

export interface EnvironmentState {
    environments: Environment[];
    activeEnvironmentId: string | null;
    loading: boolean;
    error: string | null;
}
