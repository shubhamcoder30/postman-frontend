import React, { useState, useEffect } from 'react';
import KeyValueEditor from '../KeyValueEditor';
import { UrlBar } from './UrlBar';
import { AuthSection } from './AuthSection';
import { BodySection } from './BodySection';
import type { Request } from '../../types';

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

    useEffect(() => {
        setHeaderParams((request.headers || []).map((h: any) => ({
            id: Math.random().toString(36).slice(2, 11),
            key: h.key || '', value: h.value || '', isEnabled: h.enabled !== false
        })));

        if (request.url?.includes('?')) {
            try {
                const urlObj = new URL(request.url.startsWith('http') ? request.url : `http://localhost/${request.url.startsWith('/') ? request.url.slice(1) : request.url}`);
                const params: any[] = [];
                urlObj.searchParams.forEach((value, key) => params.push({ id: Math.random().toString(36).slice(2, 11), key, value, isEnabled: true }));
                setQueryParams(params);
            } catch (e) {
                setQueryParams([]);
            }
        } else {
            setQueryParams([]);
        }

        if (request.bodyType === 'form-data' && request.body) {
            try {
                const data = typeof request.body === 'string' ? JSON.parse(request.body) : request.body;
                if (Array.isArray(data)) {
                    setFormDataParams(data.map((p: any) => ({
                        id: Math.random().toString(36).slice(2, 11),
                        key: p.key || '', value: p.value || '', isEnabled: p.enabled !== false
                    })));
                }
            } catch (e) { setFormDataParams([]); }
        } else {
            setFormDataParams([]);
        }
    }, [request.id]);

    useEffect(() => {
        const headers = headerParams.filter(p => p.isEnabled && p.key).map(p => ({ key: p.key, value: p.value }));
        if (JSON.stringify(headers) !== JSON.stringify(request.headers || [])) {
            setRequest({ ...request, headers });
        }
    }, [headerParams]);

    useEffect(() => {
        if (request.bodyType === 'form-data') {
            const formData = formDataParams.filter(p => p.isEnabled && p.key).map(p => ({ key: p.key, value: p.value }));
            const jsonBody = JSON.stringify(formData);
            if (request.body !== jsonBody) {
                setRequest({ ...request, body: jsonBody });
            }
        }
    }, [formDataParams, request.bodyType]);

    useEffect(() => {
        const timer = setTimeout(() => {
            try {
                if (!request.url && queryParams.length === 0) return;
                const baseUrl = request.url?.split('?')[0] || '';
                const enabledParams = queryParams.filter(p => p.isEnabled && p.key);
                const urlParams = new URLSearchParams();
                enabledParams.forEach(p => urlParams.append(p.key, p.value));
                const queryString = urlParams.toString();
                const newUrl = queryString ? `${baseUrl}?${queryString}` : baseUrl;
                if (newUrl !== request.url) {
                    setRequest({ ...request, url: newUrl });
                }
            } catch (e) { }
        }, 150);
        return () => clearTimeout(timer);
    }, [queryParams]);

    const handleAuthChange = (type: string, key?: string, value?: string) => {
        const newAuth = { ...(request.auth || {}), type: type as any };
        if (key && value !== undefined) {
            if (type === 'basic') newAuth.basic = { ...(newAuth.basic || {}), [key]: value };
            if (type === 'bearer') newAuth.bearer = { ...(newAuth.bearer || {}), [key]: value };
        }
        setRequest({ ...request, auth: newAuth });
    };

    return (
        <div className="space-y-6">
            <UrlBar
                method={request.method}
                url={request.url}
                type={request.type}
                isLoading={isLoading}
                onUrlChange={(url) => setRequest({ ...request, url })}
                onMethodChange={(method) => setRequest({ ...request, method })}
                onSend={onSend}
            />

            <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                <div className="flex border-b border-slate-100 bg-slate-50/50 px-2">
                    {['params', 'headers', 'body', 'auth', 'scripts'].map((tab) => (
                        <button key={tab} className={`px-6 py-3 text-xs font-bold uppercase tracking-wider transition-all relative ${activeTab === tab ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`} onClick={() => setActiveTab(tab)}>
                            {tab}{activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />}
                        </button>
                    ))}
                </div>
                <div className="p-4 h-96 overflow-y-auto custom-scrollbar">
                    {activeTab === 'params' && (
                        <div>
                            <div className="mb-2 text-xs font-bold text-slate-400 uppercase tracking-tight">Query Parameters</div>
                            <KeyValueEditor pairs={queryParams} setPairs={setQueryParams} />
                        </div>
                    )}
                    {activeTab === 'headers' && (
                        <div>
                            <div className="mb-2 text-xs font-bold text-slate-400 uppercase tracking-tight">Headers</div>
                            <KeyValueEditor pairs={headerParams} setPairs={setHeaderParams} />
                        </div>
                    )}
                    {activeTab === 'auth' && <AuthSection auth={request.auth} onChange={handleAuthChange} />}
                    {activeTab === 'scripts' && (
                        <div className="space-y-4">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-tight">Pre-request Script</h3>
                            <div className="border border-slate-200 rounded-xl p-3 bg-slate-50 h-64">
                                <textarea
                                    className="w-full h-full bg-transparent resize-none focus:outline-none font-mono text-sm text-slate-700"
                                    placeholder="// e.g., pm.variables.set('timestamp', Date.now());"
                                    value={request.preRequestScript || ''}
                                    onChange={(e) => setRequest({ ...request, preRequestScript: e.target.value })}
                                />
                            </div>
                        </div>
                    )}
                    {activeTab === 'body' && (
                        <BodySection
                            body={request.body}
                            bodyType={request.bodyType || 'none'}
                            formDataParams={formDataParams}
                            onBodyChange={(body) => setRequest({ ...request, body })}
                            onBodyTypeChange={(type) => setRequest({ ...request, bodyType: type as any })}
                            setFormDataParams={setFormDataParams}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default RequestBuilder;
