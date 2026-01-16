import { useState } from 'react';
import { Clock, Database, Copy, FileText, List, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

interface ResponseViewerProps {
    response: {
        status: number;
        statusText: string;
        headers: Record<string, string>;
        data: any;
        time: number;
        size: number;
        error?: string;
    };
}

const ResponseViewer: React.FC<ResponseViewerProps> = ({ response }) => {
    const [activeTab, setActiveTab] = useState<'body' | 'headers' | 'preview'>('body');
    const [bodyView, setBodyView] = useState<'pretty' | 'raw'>('pretty');

    if (response.error) {
        return (
            <div className="p-5 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-600 shadow-sm animate-in fade-in slide-in-from-top-2">
                <div className="p-2 bg-red-100 rounded-lg">
                    <span className="font-bold">Error</span>
                </div>
                <p className="text-sm font-medium">{response.error}</p>
            </div>
        );
    }

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
                    <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all" title="Save Response">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
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
