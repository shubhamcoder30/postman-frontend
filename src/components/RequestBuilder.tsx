import React, { useState, useEffect } from 'react';
import { Send } from 'lucide-react';
import KeyValueEditor from './KeyValueEditor';

interface Request {
    method: string;
    url: string;
    headers: any[];
    body: string;
    auth?: {
        type: 'none' | 'basic' | 'bearer';
        basic?: { username?: string; password?: string };
        bearer?: { token?: string };
    };
    bodyType?: 'none' | 'json' | 'form-data' | 'raw';
    id?: string;
    type: 'http' | 'websocket' | 'socketio';
    preRequestScript?: string;
}

interface RequestBuilderProps {
    request: Request;
    setRequest: (req: any) => void;
    onSend: () => void;
    isLoading: boolean;
}

const RequestBuilder: React.FC<RequestBuilderProps> = ({ request, setRequest, onSend, isLoading }) => {
    const [activeTab, setActiveTab] = useState('params');
    const [queryParams, setQueryParams] = useState<any[]>([]);
    const [headerParams, setHeaderParams] = useState<any[]>([]);
    const [formDataParams, setFormDataParams] = useState<any[]>([]);

    // Initialize states from request object when request changes
    useEffect(() => {
        if (request.headers && Array.isArray(request.headers)) {
            const hParams = request.headers.map((h: any) => ({
                id: Math.random().toString(36).substr(2, 9),
                key: h.key || '',
                value: h.value || '',
                isEnabled: h.enabled !== false
            }));
            setHeaderParams(hParams);
        } else {
            setHeaderParams([]);
        }

        // Initialize query params from URL
        try {
            if (request.url && request.url.includes('?')) {
                const urlObj = new URL(request.url.startsWith('http') ? request.url : `http://localhost/${request.url}`);
                const params: any[] = [];
                urlObj.searchParams.forEach((value, key) => {
                    params.push({ id: Math.random().toString(36).substr(2, 9), key, value, isEnabled: true });
                });
                setQueryParams(params);
            } else {
                setQueryParams([]);
            }
        } catch (e) {
            setQueryParams([]);
        }

        // Initialize form data if applicable
        if (request.bodyType === 'form-data' && request.body) {
            try {
                const data = typeof request.body === 'string' ? JSON.parse(request.body) : request.body;
                if (Array.isArray(data)) {
                    setFormDataParams(data.map((p: any) => ({
                        id: Math.random().toString(36).substr(2, 9),
                        key: p.key || '',
                        value: p.value || '',
                        isEnabled: p.enabled !== false
                    })));
                }
            } catch (e) {
                setFormDataParams([]);
            }
        } else {
            setFormDataParams([]);
        }
    }, [request.id]);

    // Sync Headers back to Request
    useEffect(() => {
        const headers = headerParams.filter(p => p.isEnabled && p.key).map(p => ({ key: p.key, value: p.value }));
        if (JSON.stringify(headers) !== JSON.stringify(request.headers || [])) {
            setRequest({ ...request, headers });
        }
    }, [headerParams]);

    // Sync FormData back to Request
    useEffect(() => {
        if (request.bodyType === 'form-data') {
            const formData = formDataParams.filter(p => p.isEnabled && p.key).map(p => ({ key: p.key, value: p.value }));
            const jsonBody = JSON.stringify(formData);
            if (request.body !== jsonBody) {
                setRequest({ ...request, body: jsonBody });
            }
        }
    }, [formDataParams, request.bodyType]);

    // Sync URL params to queryParams state on mount/URL change
    useEffect(() => {
        try {
            if (!request.url) return;
            const urlObj = new URL(request.url);
            const params: any[] = [];
            urlObj.searchParams.forEach((value, key) => {
                // Check if already exists to avoid overwrite user typing
                const exists = queryParams.find(p => p.key === key && p.value === value);
                if (!exists) {
                    params.push({ id: Date.now().toString() + Math.random(), key, value, isEnabled: true });
                }
            });
            // Simple init if we have params from URL but local is empty
            if (params.length > 0 && queryParams.length === 0) {
                setQueryParams(params);
            }
        } catch (e) { }
    }, [request.url]);

    // Sync queryParams back to URL - debounced to prevent infinite loops and UI lag
    useEffect(() => {
        const timer = setTimeout(() => {
            try {
                if (!request.url && queryParams.length === 0) return;

                let baseUrl = request.url || '';
                if (baseUrl.includes('?')) {
                    baseUrl = baseUrl.split('?')[0];
                }

                const enabledParams = queryParams.filter(p => p.isEnabled && p.key);
                if (enabledParams.length === 0 && !request.url.includes('?')) return;

                const urlParams = new URLSearchParams();
                enabledParams.forEach(p => urlParams.append(p.key, p.value));

                const queryString = urlParams.toString();
                const newUrl = queryString ? `${baseUrl}?${queryString}` : baseUrl;

                if (newUrl !== request.url) {
                    setRequest({ ...request, url: newUrl });
                }
            } catch (e) { }
        }, 100);
        return () => clearTimeout(timer);
    }, [queryParams]);


    const handleAuthChange = (type: string, key?: string, value?: string) => {
        const newAuth = { ...request.auth, type } as any;
        if (key && value !== undefined) {
            if (type === 'basic') newAuth.basic = { ...newAuth.basic, [key]: value };
            if (type === 'bearer') newAuth.bearer = { ...newAuth.bearer, [key]: value };
        }
        setRequest({ ...request, auth: newAuth });
    };

    const handleBodyTypeChange = (type: string) => {
        setRequest({ ...request, bodyType: type });
    };

    const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'];

    return (
        <div className="space-y-4">
            <div className="flex gap-2">
                {request.type === 'http' && (
                    <select
                        className="bg-white border border-gray-300 rounded-md px-3 py-2 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={request.method}
                        onChange={(e) => setRequest({ ...request, method: e.target.value })}
                    >
                        {methods.map((m) => (
                            <option key={m} value={m}>{m}</option>
                        ))}
                    </select>
                )}
                <input
                    type="text"
                    placeholder="https://api.example.com/v1/resource"
                    className="flex-1 bg-white border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={request.url}
                    onChange={(e) => setRequest({ ...request, url: e.target.value })}
                />
                <button
                    className={`px-4 py-2 text-white rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors ${request.type === 'http' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'}`}
                    onClick={onSend}
                    disabled={isLoading || !request.url}
                >
                    {isLoading ? (request.type === 'http' ? 'Sending...' : 'Connecting...') : (
                        <>
                            <span>{request.type === 'http' ? 'Send' : 'Connect'}</span>
                            <Send size={16} />
                        </>
                    )}
                </button>
            </div>

            <div className="border border-gray-300 rounded-md bg-white">
                <div className="flex border-b border-gray-300 bg-gray-50">
                    {(['params', 'headers', 'body', 'auth', 'scripts'] as const).map((tab) => (
                        <button
                            key={tab}
                            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 hover:text-blue-600 ${activeTab === tab ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600'
                                }`}
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab === 'scripts' ? 'Scripts' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>
                <div className="p-4 h-96 overflow-y-auto">
                    {activeTab === 'params' && (
                        <div>
                            <div className="mb-2 text-xs text-gray-500">Query Parameters</div>
                            <KeyValueEditor pairs={queryParams} setPairs={setQueryParams} />
                        </div>
                    )}

                    {activeTab === 'headers' && (
                        <div>
                            <div className="mb-2 text-xs text-gray-500">Headers</div>
                            <KeyValueEditor pairs={headerParams} setPairs={setHeaderParams} />
                        </div>
                    )}

                    {activeTab === 'auth' && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Authorization Type</label>
                                <select
                                    className="w-full max-w-xs bg-white border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={request.auth?.type || 'none'}
                                    onChange={(e) => handleAuthChange(e.target.value)}
                                >
                                    <option value="none">No Auth</option>
                                    <option value="basic">Basic Auth</option>
                                    <option value="bearer">Bearer Token</option>
                                </select>
                            </div>

                            {request.auth?.type === 'basic' && (
                                <div className="space-y-3 max-w-sm">
                                    <div>
                                        <input
                                            type="text"
                                            placeholder="Username"
                                            className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            value={request.auth?.basic?.username || ''}
                                            onChange={(e) => handleAuthChange('basic', 'username', e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <input
                                            type="password"
                                            placeholder="Password"
                                            className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            value={request.auth?.basic?.password || ''}
                                            onChange={(e) => handleAuthChange('basic', 'password', e.target.value)}
                                        />
                                    </div>
                                </div>
                            )}

                            {request.auth?.type === 'bearer' && (
                                <div className="max-w-md">
                                    <input
                                        type="text"
                                        placeholder="Token"
                                        className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={request.auth?.bearer?.token || ''}
                                        onChange={(e) => handleAuthChange('bearer', 'token', e.target.value)}
                                    />
                                </div>
                            )}

                            {request.auth?.type === 'none' && (
                                <p className="text-sm text-gray-500 italic">This request does not use any authorization.</p>
                            )}
                        </div>
                    )}

                    {activeTab === 'scripts' && (
                        <div className="space-y-4 h-full flex flex-col">
                            <div>
                                <h3 className="text-sm font-medium text-gray-700 mb-1">Pre-request Script</h3>
                                <p className="text-xs text-gray-500 mb-3">JavaScript code to run before the request is sent. Use <code>pm.variables.set(key, value)</code> to set variables.</p>
                                <div className="border border-gray-200 rounded p-2 bg-gray-50 h-64">
                                    <textarea
                                        className="w-full h-full bg-transparent resize-none focus:outline-none font-mono text-sm text-gray-900"
                                        placeholder="// Example: pm.variables.set('timestamp', Date.now());"
                                        value={request.preRequestScript || ''}
                                        onChange={(e) => setRequest({ ...request, preRequestScript: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                    {activeTab === 'body' && (
                        <div className="space-y-4 h-full flex flex-col">
                            <div className="flex items-center gap-4">
                                <label className="flex items-center gap-2">
                                    <input
                                        type="radio"
                                        name="bodyType"
                                        value="none"
                                        checked={!request.bodyType || request.bodyType === 'none'}
                                        onChange={() => handleBodyTypeChange('none')}
                                        className="text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-gray-700">None</span>
                                </label>
                                <label className="flex items-center gap-2">
                                    <input
                                        type="radio"
                                        name="bodyType"
                                        value="json"
                                        checked={request.bodyType === 'json'}
                                        onChange={() => handleBodyTypeChange('json')}
                                        className="text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-gray-700">JSON</span>
                                </label>
                                <label className="flex items-center gap-2">
                                    <input
                                        type="radio"
                                        name="bodyType"
                                        value="form-data"
                                        checked={request.bodyType === 'form-data'}
                                        onChange={() => handleBodyTypeChange('form-data')}
                                        className="text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-gray-700">Form Data</span>
                                </label>
                                <label className="flex items-center gap-2">
                                    <input
                                        type="radio"
                                        name="bodyType"
                                        value="raw"
                                        checked={request.bodyType === 'raw'}
                                        onChange={() => handleBodyTypeChange('raw')}
                                        className="text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-gray-700">Raw</span>
                                </label>
                            </div>

                            <div className="flex-1 border border-gray-200 rounded p-2 bg-gray-50">
                                {(!request.bodyType || request.bodyType === 'none') && (
                                    <div className="h-full flex items-center justify-center text-gray-400 text-sm italic">
                                        This request does not have a body
                                    </div>
                                )}
                                {(request.bodyType === 'json' || request.bodyType === 'raw') && (
                                    <textarea
                                        className="w-full h-full bg-transparent resize-none focus:outline-none font-mono text-sm text-gray-900"
                                        placeholder={request.bodyType === 'json' ? '{ "key": "value" }' : 'Raw content'}
                                        value={request.body}
                                        onChange={(e) => setRequest({ ...request, body: e.target.value })}
                                    />
                                )}
                                {request.bodyType === 'form-data' && (
                                    <KeyValueEditor pairs={formDataParams} setPairs={setFormDataParams} />
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RequestBuilder;
