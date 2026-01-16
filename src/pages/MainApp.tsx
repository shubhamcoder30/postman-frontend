import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import RequestBuilder from '../components/RequestBuilder';
import ResponseViewer from '../components/ResponseViewer';
import EnvironmentSwitcher from '../components/EnvironmentSwitcher';
import { API_BASE_URL } from '../api/config';
import RequestTabs from '../components/RequestTabs';
import { substituteVariables } from '../utils/variables';
import { LogOut, Send } from 'lucide-react';
import { runPreRequestScript } from '../utils/scripts';
import { io, Socket } from 'socket.io-client';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { fetchCollections, fetchIndependentRequests, updateRequest } from '../store/slices/collectionSlice';

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

    // Sync state when active request changes (from sidebar)
    useEffect(() => {
        if (activeRequest && activeRequest.id !== (request as any).id) {
            setRequest(activeRequest);
            setResponse(null);
            setWsMessages([]);
        }
    }, [activeRequest.id]);

    // Auto-save changes to the backend
    useEffect(() => {
        const timer = setTimeout(() => {
            if (activeRequestId && request && request.id) {
                // Only save if meaningful properties changed
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
        }, 1000); // 1s debounce

        return () => clearTimeout(timer);
    }, [request, activeRequestId, dispatch, activeRequest]);

    const activeEnv = environments.find((env: any) => env.id === activeEnvironmentId);

    const handleSendRequest = async () => {
        setIsLoading(true);
        setResponse(null);

        // Ensure current state is saved to backend on Send
        if (activeRequestId && request && request.id) {
            dispatch(updateRequest(request));
        }

        try {
            // Resolve variables: Collection level first, then Environment (env overrides collection)
            const collection = collections.find((c: any) =>
                c.requests.some((r: any) => r.id === request.id) ||
                c.folders.some((f: any) => f.requests.some((r: any) => r.id === request.id))
            );

            let currentVars = [
                ...(collection?.variables || []),
                ...(activeEnv?.variables || [])
            ];
            let currentHeaders = [...(request.headers || [])];

            // 1. Run Pre-request Script if exists
            if (request.preRequestScript) {
                try {
                    const result = runPreRequestScript(request.preRequestScript, currentVars, currentHeaders);
                    currentVars = result.variables;
                    currentHeaders = result.headers;
                } catch (err: any) {
                    setResponse({ error: `Script Error: ${err.message}` });
                    setIsLoading(false);
                    return;
                }
            }

            let finalUrl = substituteVariables(request.url, currentVars);
            let finalBody = request.body ? substituteVariables(request.body, currentVars) : request.body;
            let finalHeaders = currentHeaders
                .filter(h => h.enabled !== false)
                .map((h: any) => ({
                    key: substituteVariables(h.key, currentVars),
                    value: substituteVariables(h.value, currentVars)
                }));

            // Handle Auth substitution
            if (request.auth) {
                if (request.auth.type === 'bearer' && request.auth.bearer?.token) {
                    const token = substituteVariables(request.auth.bearer.token, currentVars);
                    finalHeaders.push({ key: 'Authorization', value: `Bearer ${token}` });
                } else if (request.auth.type === 'basic' && request.auth.basic) {
                    const user = substituteVariables(request.auth.basic.username || '', currentVars);
                    const pass = substituteVariables(request.auth.basic.password || '', currentVars);
                    const encoded = btoa(`${user}:${pass}`);
                    finalHeaders.push({ key: 'Authorization', value: `Basic ${encoded}` });
                }
            }

            // 2. Handle based on request type
            if (request.type === 'http' || !request.type) {
                const res = await fetch(`${API_BASE_URL}/proxy`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                    },
                    body: JSON.stringify({
                        url: finalUrl,
                        method: request.method,
                        headers: finalHeaders,
                        body: finalBody,
                    }),
                });

                const data = await res.json();
                if (data.success) {
                    setResponse(data.data);
                } else {
                    setResponse({ error: data.message || 'Request failed' });
                }
            } else if (request.type === 'websocket') {
                handleWebSocketConnect(finalUrl);
            } else if (request.type === 'socketio') {
                handleSocketIOConnect(finalUrl);
            }
        } catch (error: any) {
            setResponse({ error: error.message || 'Request failed' });
        } finally {
            if (request.type === 'http' || !request.type) {
                setIsLoading(false);
            }
        }
    };

    const handleWebSocketConnect = (url: string) => {
        if (sockets.current.has(request.id)) {
            const existing = sockets.current.get(request.id) as WebSocket;
            existing.close();
            sockets.current.delete(request.id);
        }

        try {
            const ws = new WebSocket(url);
            setWsMessages([{ type: 'info', text: `Connecting to ${url}...`, time: new Date() }]);

            ws.onopen = () => {
                setWsMessages(prev => [...prev, { type: 'success', text: 'Connected!', time: new Date() }]);
                setIsLoading(false);
            };
            ws.onmessage = (event) => {
                setWsMessages(prev => [...prev, { type: 'received', text: event.data, time: new Date() }]);
            };
            ws.onclose = () => {
                setWsMessages(prev => [...prev, { type: 'info', text: 'Disconnected', time: new Date() }]);
                sockets.current.delete(request.id);
                setIsLoading(false);
            };
            ws.onerror = () => {
                setWsMessages(prev => [...prev, { type: 'error', text: 'WebSocket Error', time: new Date() }]);
                setIsLoading(false);
            };

            sockets.current.set(request.id, ws);
        } catch (error: any) {
            setResponse({ error: error.message });
            setIsLoading(false);
        }
    };

    const handleSocketIOConnect = (url: string) => {
        if (sockets.current.has(request.id)) {
            const existing = sockets.current.get(request.id) as Socket;
            existing.disconnect();
            sockets.current.delete(request.id);
        }

        try {
            const socket = io(url);
            setWsMessages([{ type: 'info', text: `Socket.io Connecting to ${url}...`, time: new Date() }]);

            socket.on('connect', () => {
                setWsMessages(prev => [...prev, { type: 'success', text: 'Socket.io Connected!', time: new Date() }]);
                setIsLoading(false);
            });
            socket.onAny((event, ...args) => {
                setWsMessages(prev => [...prev, { type: 'received', text: `${event}: ${JSON.stringify(args)}`, time: new Date() }]);
            });
            socket.on('disconnect', () => {
                setWsMessages(prev => [...prev, { type: 'info', text: 'Socket.io Disconnected', time: new Date() }]);
                sockets.current.delete(request.id);
                setIsLoading(false);
            });
            socket.on('connect_error', (err) => {
                setWsMessages(prev => [...prev, { type: 'error', text: `Connection Error: ${err.message}`, time: new Date() }]);
                setIsLoading(false);
            });

            sockets.current.set(request.id, socket);
        } catch (error: any) {
            setResponse({ error: error.message });
            setIsLoading(false);
        }
    };

    const handleSendMessage = (message: string) => {
        const socket = sockets.current.get(request.id);
        if (!socket) return;

        if (socket instanceof WebSocket) {
            if (socket.readyState === WebSocket.OPEN) {
                socket.send(message);
                setWsMessages(prev => [...prev, { type: 'sent', text: message, time: new Date() }]);
            }
        } else {
            // Socket.io
            socket.emit('message', message);
            setWsMessages(prev => [...prev, { type: 'sent', text: message, time: new Date() }]);
        }
    };

    const handleLogout = async () => {
        try {
            await fetch(`${API_BASE_URL}/auth/logout`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            });
        } catch (error) {
            console.error('Logout failed:', error);
        } finally {
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            navigate('/login');
        }
    };

    const user = JSON.parse(localStorage.getItem('user') || '{}');

    return (
        <div className="flex h-screen bg-slate-100/50 text-slate-900 overflow-hidden font-sans pb-12">
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0 bg-white/40 backdrop-blur-xl">
                {/* Header */}
                <header className="h-16 flex items-center justify-between px-8 bg-white/80 border-b border-slate-200 backdrop-blur-lg z-10 shadow-sm">
                    <div className="flex items-center gap-6 flex-1 min-w-0">
                        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight shrink-0">Postman Clone</h1>
                        <div className="h-6 w-[1px] bg-slate-200 hidden md:block" />
                        <EnvironmentSwitcher />
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex flex-col items-end hidden sm:flex">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Authenticated as</span>
                            <span className="text-sm font-semibold text-slate-700">{user.email}</span>
                        </div>
                        <div className="h-8 w-[1px] bg-slate-200 mx-2 hidden sm:block" />
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all font-semibold active:scale-95"
                        >
                            <LogOut size={18} />
                            <span>Logout</span>
                        </button>
                    </div>
                </header>

                <RequestTabs />

                {/* Main Content */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    <div className="max-w-6xl mx-auto space-y-8 pb-12">
                        {activeRequestId ? (
                            <>
                                <section className="premium-card p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Request Configuration</h2>
                                    <RequestBuilder
                                        request={request}
                                        setRequest={setRequest}
                                        onSend={handleSendRequest}
                                        isLoading={isLoading}
                                    />
                                </section>

                                {(response || wsMessages.length > 0) && (
                                    <section className="animate-in fade-in slide-in-from-bottom-6 duration-700">
                                        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Response Viewer</h2>
                                        <ResponseViewer
                                            type={request.type}
                                            response={response}
                                            messages={wsMessages}
                                            onSendMessage={handleSendMessage}
                                        />
                                    </section>
                                )}
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-[60vh] text-slate-300 animate-in fade-in zoom-in duration-500">
                                <div className="p-8 bg-white rounded-3xl shadow-xl shadow-slate-200/50 mb-6 border border-slate-100">
                                    <Send size={64} className="text-blue-500/20" />
                                </div>
                                <h3 className="text-2xl font-bold text-slate-800 mb-3">Ready to explore?</h3>
                                <p className="max-w-xs text-center text-slate-500 font-medium leading-relaxed">
                                    Select a request from the sidebar or click <span className="text-blue-600 font-bold">"New"</span> to start testing your APIs with Postman Clone.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MainApp;
