import { useState, useRef, useEffect } from 'react';
import { Clock, Database, Copy, FileText, List, Eye, Send, Terminal } from 'lucide-react';
import toast from 'react-hot-toast';

interface Message {
    type: 'sent' | 'received' | 'info' | 'error' | 'success';
    text: string;
    time: Date;
}

interface ResponseViewerProps {
    type?: 'http' | 'websocket' | 'socketio';
    response?: {
        status: number;
        statusText: string;
        headers: Record<string, string>;
        data: any;
        time: number;
        size: number;
        error?: string;
    };
    messages?: Message[];
    onSendMessage?: (msg: string) => void;
}

const ResponseViewer: React.FC<ResponseViewerProps> = ({ type = 'http', response, messages = [], onSendMessage }) => {
    const [activeTab, setActiveTab] = useState<'body' | 'headers' | 'preview' | 'messages'>('body');
    const [bodyView, setBodyView] = useState<'pretty' | 'raw'>('pretty');
    const [messageInput, setMessageInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (type !== 'http') {
            setActiveTab('messages');
        } else {
            setActiveTab('body');
        }
    }, [type]);

    useEffect(() => {
        if (activeTab === 'messages') {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, activeTab]);

    const handleSend = () => {
        if (!messageInput.trim() || !onSendMessage) return;
        onSendMessage(messageInput);
        setMessageInput('');
    };

    if (response?.error) {
        return (
            <div className="p-5 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-600 shadow-sm animate-in fade-in slide-in-from-top-2">
                <div className="p-2 bg-red-100 rounded-lg">
                    <span className="font-bold">Error</span>
                </div>
                <p className="text-sm font-medium">{response.error}</p>
            </div>
        );
    }

    if (type !== 'http') {
        return (
            <div className="flex flex-col border border-gray-200 rounded-2xl bg-white shadow-sm overflow-hidden animate-in fade-in duration-300">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                    <div className="flex items-center gap-2">
                        <Terminal size={16} className="text-blue-500" />
                        <span className="text-sm font-bold text-gray-700 capitalize">{type} Terminal</span>
                    </div>
                </div>

                <div className="flex-1 min-h-[400px] flex flex-col bg-gray-900 overflow-hidden">
                    <div className="flex-1 overflow-y-auto p-4 space-y-2 font-mono text-sm">
                        {messages.length === 0 && (
                            <div className="text-gray-500 italic text-center py-10">No messages yet. Connect to see traffic.</div>
                        )}
                        {messages.map((msg, i) => (
                            <div key={i} className={`flex flex-col ${msg.type === 'sent' ? 'items-end' : 'items-start'}`}>
                                <div className={`max-w-[80%] rounded-lg px-3 py-1.5 break-all ${msg.type === 'sent' ? 'bg-blue-600 text-white' :
                                        msg.type === 'received' ? 'bg-gray-800 text-gray-200' :
                                            msg.type === 'info' ? 'text-blue-400 text-xs italic' :
                                                msg.type === 'error' ? 'text-red-400 text-xs font-bold' :
                                                    'text-green-400 text-xs font-bold'
                                    }`}>
                                    {msg.text}
                                </div>
                                <span className="text-[10px] text-gray-600 mt-1">
                                    {msg.time.toLocaleTimeString()}
                                </span>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="p-4 border-t border-gray-800 bg-gray-950/50 flex gap-2">
                        <input
                            type="text"
                            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="Message to send..."
                            value={messageInput}
                            onChange={(e) => setMessageInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        />
                        <button
                            onClick={handleSend}
                            className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                        >
                            <Send size={18} />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!response) return null;

    const formatSize = (bytes: number) => {
        if (!bytes || isNaN(bytes)) return '0 B';
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    };

    const getStatusColor = (status: number) => {
        if (status < 300) return 'text-green-600 bg-green-50 border-green-200';
        if (status < 400) return 'text-blue-600 bg-blue-50 border-blue-200';
        if (status < 500) return 'text-orange-600 bg-orange-50 border-orange-200';
        return 'text-red-600 bg-red-50 border-red-200';
    };

    return (
        <div className="flex flex-col border border-gray-200 rounded-2xl bg-white shadow-sm overflow-hidden animate-in fade-in duration-300">
            {/* Response Header Info */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                <div className="flex items-center gap-6">
                    <div className={`px-3 py-1.5 rounded-lg border text-sm font-bold flex items-center gap-2 ${getStatusColor(response.status)} shadow-sm`}>
                        <span>{response.status}</span>
                        <span>{response.statusText}</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs font-semibold text-gray-500">
                        <div className="flex items-center gap-1.5 bg-white px-2 py-1 rounded border border-gray-100 shadow-sm">
                            <Clock size={12} className="text-blue-500" />
                            <span className="text-gray-400">Time:</span>
                            <span className="text-blue-600 font-mono italic">{response.time} ms</span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-white px-2 py-1 rounded border border-gray-100 shadow-sm">
                            <Database size={12} className="text-purple-500" />
                            <span className="text-gray-400">Size:</span>
                            <span className="text-purple-600 font-mono italic">{formatSize(response.size)}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => {
                            navigator.clipboard.writeText(JSON.stringify(response.data, null, 2));
                            toast.success('Copied to clipboard');
                        }}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        title="Copy Body"
                    >
                        <Copy size={16} />
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-100 bg-white px-4">
                <button
                    className={`flex items-center gap-2 px-5 py-3 text-sm font-bold transition-all border-b-2 capitalize ${activeTab === 'body' ? 'border-blue-600 text-blue-600 bg-blue-50/10' : 'border-transparent text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}
                    onClick={() => setActiveTab('body')}
                >
                    <FileText size={14} />
                    Body
                </button>
                <button
                    className={`flex items-center gap-2 px-5 py-3 text-sm font-bold transition-all border-b-2 capitalize ${activeTab === 'headers' ? 'border-blue-600 text-blue-600 bg-blue-50/10' : 'border-transparent text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}
                    onClick={() => setActiveTab('headers')}
                >
                    <List size={14} />
                    Headers ({Object.keys(response.headers || {}).length})
                </button>
                <button
                    className={`flex items-center gap-2 px-5 py-3 text-sm font-bold transition-all border-b-2 capitalize ${activeTab === 'preview' ? 'border-blue-600 text-blue-600 bg-blue-50/10' : 'border-transparent text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}
                    onClick={() => setActiveTab('preview')}
                >
                    <Eye size={14} />
                    Preview
                </button>
            </div>

            {/* Body Sub-tabs */}
            {activeTab === 'body' && (
                <div className="flex items-center gap-2 px-6 py-2 bg-gray-50/30 border-b border-gray-100">
                    <button
                        onClick={() => setBodyView('pretty')}
                        className={`px-3 py-1 text-[11px] font-bold rounded-md transition-all ${bodyView === 'pretty' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-200'}`}
                    >
                        Pretty
                    </button>
                    <button
                        onClick={() => setBodyView('raw')}
                        className={`px-3 py-1 text-[11px] font-bold rounded-md transition-all ${bodyView === 'raw' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-200'}`}
                    >
                        Raw
                    </button>
                </div>
            )}

            {/* Content Area */}
            <div className="p-0 overflow-hidden bg-white">
                <div className="max-h-[500px] overflow-auto">
                    {activeTab === 'body' && (
                        <div className="p-6 font-mono text-[13px] leading-relaxed select-text">
                            <pre className="text-gray-800 whitespace-pre-wrap">
                                {bodyView === 'pretty'
                                    ? JSON.stringify(response.data, null, 2)
                                    : JSON.stringify(response.data)}
                            </pre>
                        </div>
                    )}

                    {activeTab === 'headers' && (
                        <div className="p-4">
                            <table className="w-full text-sm border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 text-gray-500 text-left">
                                        <th className="px-4 py-2 font-semibold border border-gray-100">Key</th>
                                        <th className="px-4 py-2 font-semibold border border-gray-100">Value</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Object.entries(response.headers || {}).map(([key, value]) => (
                                        <tr key={key} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-4 py-2.5 font-bold text-gray-700 border border-gray-100 bg-gray-50/20">{key}</td>
                                            <td className="px-4 py-2.5 text-gray-600 font-mono text-xs border border-gray-100 break-all">{value}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === 'preview' && (
                        <div className="p-6">
                            {typeof response.data === 'object' ? (
                                <div className="text-center py-10">
                                    <p className="text-gray-400 italic">Preview not available for JSON data. Use Pretty view.</p>
                                </div>
                            ) : (
                                <div dangerouslySetInnerHTML={{ __html: response.data }} />
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Footer Status Section */}
            <div className="px-6 py-2 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-[10px] text-gray-400 font-mono">
                <span>Content-Type: {response.headers?.['content-type'] || response.headers?.['Content-Type'] || 'unknown'}</span>
                {response.size > 0 && <span>Raw size: {response.size} bytes</span>}
            </div>
        </div>
    );
};

export default ResponseViewer;
