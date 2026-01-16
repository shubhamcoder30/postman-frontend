import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import RequestBuilder from '../components/RequestBuilder';
import ResponseViewer from '../components/ResponseViewer';
import EnvironmentSwitcher from '../components/EnvironmentSwitcher';
import RequestTabs from '../components/RequestTabs';
import { substituteVariables } from '../utils/variables';
import { LogOut } from 'lucide-react';
import type { RootState, AppDispatch } from '../store';
import { fetchCollections, fetchIndependentRequests, updateRequest } from '../store/slices/collectionSlice';

const MainApp = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();
    const { collections, independentRequests, activeRequestId } = useSelector((state: RootState) => state.collections);
    const { environments, activeEnvironmentId } = useSelector((state: RootState) => state.environments);

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
    };

    const [request, setRequest] = useState(activeRequest);
    const [response, setResponse] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Sync state when active request changes (from sidebar)
    useEffect(() => {
        if (activeRequest && activeRequest.id !== (request as any).id) {
            setRequest(activeRequest);
            setResponse(null);
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
                    JSON.stringify(request.auth) !== JSON.stringify(activeRequest.auth);

                if (changed) {
                    dispatch(updateRequest(request));
                }
            }
        }, 1000); // 1s debounce

        return () => clearTimeout(timer);
    }, [request, activeRequestId, dispatch]);

    const activeEnv = environments.find((env: any) => env.id === activeEnvironmentId);

    const handleSendRequest = async () => {
        setIsLoading(true);
        setResponse(null);

        // Ensure current state is saved to backend on Send
        if (activeRequestId && request && request.id) {
            dispatch(updateRequest(request));
        }

        try {
            let finalUrl = request.url;
            let finalBody = request.body;
            let finalHeaders = [...(request.headers || [])];

            if (activeEnv) {
                finalUrl = substituteVariables(request.url, activeEnv.variables);
                if (request.body) {
                    finalBody = substituteVariables(request.body, activeEnv.variables);
                }
                finalHeaders = finalHeaders.map(h => ({
                    key: substituteVariables(h.key, activeEnv.variables),
                    value: substituteVariables(h.value, activeEnv.variables)
                }));

                // Handle Auth substitution
                if (request.auth) {
                    if (request.auth.type === 'bearer' && request.auth.bearer?.token) {
                        const token = substituteVariables(request.auth.bearer.token, activeEnv.variables);
                        finalHeaders.push({ key: 'Authorization', value: `Bearer ${token}` });
                    } else if (request.auth.type === 'basic' && request.auth.basic) {
                        const user = substituteVariables(request.auth.basic.username || '', activeEnv.variables);
                        const pass = substituteVariables(request.auth.basic.password || '', activeEnv.variables);
                        const encoded = btoa(`${user}:${pass}`);
                        finalHeaders.push({ key: 'Authorization', value: `Basic ${encoded}` });
                    }
                }
            }

            const res = await fetch('/api/proxy', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
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
        } catch (error: any) {
            setResponse({ error: error.message || 'Request failed' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', {
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
        <div className="flex h-screen bg-gray-50 text-gray-900">
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shadow-sm z-10 relative">
                    <div className="flex items-center gap-4">
                        <h1 className="text-xl font-bold text-gray-900">Postman Clone</h1>
                        <EnvironmentSwitcher />
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-600 font-medium">{user.email}</span>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-md text-sm transition-colors border border-red-200"
                        >
                            <LogOut size={16} />
                            Logout
                        </button>
                    </div>
                </header>

                <RequestTabs />

                {/* Main Content */}
                <div className="flex-1 overflow-auto p-6 bg-gray-50">
                    <div className="max-w-7xl mx-auto space-y-6">
                        {activeRequestId ? (
                            <>
                                <RequestBuilder
                                    request={request}
                                    setRequest={setRequest}
                                    onSend={handleSendRequest}
                                    isLoading={isLoading}
                                />
                                {response && <ResponseViewer response={response} />}
                            </>
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-400">
                                <p>Select a request or create a new one</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MainApp;
