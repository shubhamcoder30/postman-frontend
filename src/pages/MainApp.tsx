import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import RequestBuilder from '../components/RequestBuilder';
import ResponseViewer from '../components/ResponseViewer';
import EnvironmentSwitcher from '../components/EnvironmentSwitcher';
import RequestTabs from '../components/RequestTabs';
import { LogOut, Send, Zap, ShieldCheck } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { fetchCollections, fetchIndependentRequests, updateRequest } from '../store/slices/collectionSlice';
import { API_BASE_URL } from '../api/config';
import { substituteVariables } from '../utils/variables';
import { runPreRequestScript } from '../utils/scripts';
import axios from 'axios';
import { io, Socket } from 'socket.io-client';

const MainApp = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { collections, independentRequests, activeRequestId } = useAppSelector((state: any) => state.collections);
    const { environments, activeEnvironmentId } = useAppSelector((state: any) => state.environments);

    useEffect(() => {
        dispatch(fetchCollections());
        dispatch(fetchIndependentRequests());
    }, [dispatch]);

    const activeRequest: any = [...(independentRequests || []), ...(collections || []).flatMap((c: any) => [...(c.requests || []), ...(c.folders || []).flatMap((f: any) => f.requests || [])])]
        .find((r: any) => r.id === activeRequestId) || {
        method: 'GET',
        url: '',
        headers: [],
        body: '',
        type: 'http'
    };

    const [request, setRequest] = useState(activeRequest);
    const [response, setResponse] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [wsMessages, setWsMessages] = useState<any[]>([]);
    const sockets = useRef<Map<string, WebSocket | Socket>>(new Map());

    useEffect(() => {
        if (activeRequest && activeRequest.id !== (request as any).id) {
            setRequest(activeRequest);
            setResponse(null);
            setWsMessages([]);
        }
    }, [activeRequest.id]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (activeRequestId && request && request.id) {
                const changed =
                    request.url !== activeRequest.url ||
                    request.method !== activeRequest.method ||
                    JSON.stringify(request.headers) !== JSON.stringify(activeRequest.headers) ||
                    request.body !== activeRequest.body ||
                    request.bodyType !== activeRequest.bodyType ||
                    request.type !== activeRequest.type ||
                    request.preRequestScript !== activeRequest.preRequestScript ||
                    JSON.stringify(request.auth) !== JSON.stringify(activeRequest.auth);

                if (changed) {
                    dispatch(updateRequest(request));
                }
            }
        }, 1000);

        return () => clearTimeout(timer);
    }, [request, activeRequestId, dispatch, activeRequest]);

    const activeEnv = environments.find((env: any) => env.id === activeEnvironmentId);

    const handleSendRequest = async () => {
        setIsLoading(true);
        setResponse(null);

        if (activeRequestId && request && request.id) {
            dispatch(updateRequest(request));
        }

        try {
            const collection = collections.find((c: any) =>
                (c.requests || []).some((r: any) => r.id === request.id) ||
                (c.folders || []).some((f: any) => (f.requests || []).some((r: any) => r.id === request.id))
            );

            let currentVars = [
                ...(collection?.variables || []),
                ...(activeEnv?.variables || [])
            ];

            let currentHeaders = [...(request.headers || [])];

            // HTTP Request Logic
            if (request.type === 'http' || !request.type) {
                // Run Pre-request Script
                if (request.preRequestScript) {
                    const result = runPreRequestScript(request.preRequestScript, currentVars, currentHeaders);
                    currentVars = result.variables;
                    currentHeaders = result.headers;
                }

                const substitutedUrl = substituteVariables(request.url, currentVars);
                const substitutedBody = substituteVariables(request.body, currentVars);
                const substitutedHeaders = (currentHeaders || []).map((h: any) => ({
                    ...h,
                    key: substituteVariables(h.key, currentVars),
                    value: substituteVariables(h.value, currentVars)
                }));

                const startTime = Date.now();
                const res = await axios.post(`${API_BASE_URL}/proxy`, {
                    url: substitutedUrl,
                    method: request.method,
                    headers: substitutedHeaders.reduce((acc: any, h: any) => ({ ...acc, [h.key]: h.value }), {}),
                    data: request.method !== 'GET' ? substitutedBody : undefined,
                    auth: request.auth
                }, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('authToken')}`
                    }
                });

                setResponse({
                    ...res.data,
                    time: Date.now() - startTime
                });
            }
            // WebSocket Logic
            else if (request.type === 'websocket') {
                const substitutedUrl = substituteVariables(request.url, currentVars);
                const ws = new WebSocket(substitutedUrl);
                sockets.current.set(request.id, ws);

                ws.onopen = () => {
                    setWsMessages(prev => [...prev, { type: 'system', text: 'Connected to ' + substitutedUrl, time: new Date() }]);
                };
                ws.onmessage = (event) => {
                    setWsMessages(prev => [...prev, { type: 'received', text: event.data, time: new Date() }]);
                };
                ws.onerror = () => {
                    setWsMessages(prev => [...prev, { type: 'error', text: 'WebSocket Error', time: new Date() }]);
                };
            }
            // Socket.IO Logic
            else if (request.type === 'socketio') {
                const substitutedUrl = substituteVariables(request.url, currentVars);
                const socket = io(substitutedUrl);
                sockets.current.set(request.id, socket);

                socket.on('connect', () => {
                    setWsMessages(prev => [...prev, { type: 'system', text: 'Socket.IO Connected', time: new Date() }]);
                });
                socket.onAny((event, ...args) => {
                    setWsMessages(prev => [...prev, { type: 'received', text: `${event}: ${JSON.stringify(args)}`, time: new Date() }]);
                });
            }
        } catch (e: any) {
            setResponse({
                status: e.response?.status || 500,
                data: e.response?.data || { error: e.message }
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendMessage = (text: string) => {
        const socket = sockets.current.get(request.id);
        if (socket) {
            if (socket instanceof WebSocket) {
                if (socket.readyState === WebSocket.OPEN) {
                    socket.send(text);
                    setWsMessages(prev => [...prev, { type: 'sent', text, time: new Date() }]);
                }
            } else {
                (socket as any).emit('message', text); // Or use custom events
                setWsMessages(prev => [...prev, { type: 'sent', text, time: new Date() }]);
            }
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <div className="flex h-screen bg-slate-50/50">
            <Sidebar />

            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-6 shrink-0 relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-lg text-blue-600">
                            <Zap size={18} className="fill-blue-600" />
                            <span className="font-black text-sm tracking-tight uppercase">Postman Clone</span>
                        </div>
                        <div className="h-4 w-px bg-slate-200" />
                        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest truncate max-w-[200px]">
                            {activeRequest?.id ? activeRequest.name : 'Dashboard'}
                        </h2>
                    </div>

                    <div className="flex items-center gap-6">
                        <EnvironmentSwitcher />
                        <div className="h-8 w-px bg-slate-200" />
                        <div className="flex items-center gap-3">
                            <div className="text-right hidden sm:block">
                                <p className="text-xs font-bold text-slate-900 leading-none mb-1">
                                    {(JSON.parse(localStorage.getItem('user') || '{}').email || 'User').split('@')[0]}
                                </p>
                                <p className="text-[10px] font-medium text-slate-400 uppercase tracking-tighter leading-none">
                                    Free Plan
                                </p>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                title="Sign Out"
                            >
                                <LogOut size={20} />
                            </button>
                        </div>
                    </div>
                </header>

                <main className="flex-1 flex flex-col overflow-hidden relative">
                    <RequestTabs />
                    <div className="flex-1 overflow-y-auto custom-scrollbar bg-white/50">
                        {activeRequestId ? (
                            <div className="max-w-[1400px] mx-auto p-8">
                                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <RequestBuilder
                                        request={request}
                                        setRequest={setRequest}
                                        onSend={handleSendRequest}
                                        isLoading={isLoading}
                                    />
                                    <ResponseViewer
                                        type={request.type}
                                        response={response}
                                        messages={wsMessages}
                                        onSendMessage={handleSendMessage}
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center p-12 text-center">
                                <div className="w-24 h-24 bg-slate-100 rounded-[2.5rem] flex items-center justify-center mb-8 animate-bounce transition-all duration-1000">
                                    <Send size={40} className="text-slate-300" />
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">Ready to test?</h3>
                                <p className="text-slate-500 max-w-sm mb-10 font-medium leading-relaxed">
                                    Select a request from the sidebar or click <span className="text-blue-600 font-bold">New Request</span> to get started. 🚀
                                </p>
                                <div className="grid grid-cols-2 gap-4 max-w-md w-full">
                                    <div className="p-6 rounded-2xl border border-slate-100 bg-white shadow-sm hover:border-blue-200 transition-all group">
                                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                            <Zap size={20} />
                                        </div>
                                        <p className="font-bold text-sm text-slate-900 mb-1">Fast Execution</p>
                                        <p className="text-xs text-slate-400">Tested and optimized for speed</p>
                                    </div>
                                    <div className="p-6 rounded-2xl border border-slate-100 bg-white shadow-sm hover:border-purple-200 transition-all group">
                                        <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                            <ShieldCheck size={20} />
                                        </div>
                                        <p className="font-bold text-sm text-slate-900 mb-1">Secure Auth</p>
                                        <p className="text-xs text-slate-400">Bearer, Basic and more</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default MainApp;
