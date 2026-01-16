import React from 'react';
import { Send } from 'lucide-react';

interface UrlBarProps {
    method: string;
    url: string;
    type: 'http' | 'websocket' | 'socketio';
    isLoading: boolean;
    onUrlChange: (url: string) => void;
    onMethodChange: (method: string) => void;
    onSend: () => void;
}

const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'];

export const UrlBar: React.FC<UrlBarProps> = ({ method, url, type, isLoading, onUrlChange, onMethodChange, onSend }) => (
    <div className="flex gap-3">
        {type === 'http' && (
            <div className="relative group">
                <select
                    className="appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 pr-10 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer transition-all hover:bg-white"
                    value={method}
                    onChange={(e) => onMethodChange(e.target.value)}
                >
                    {methods.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                </div>
            </div>
        )}
        <div className="flex-1 relative group">
            <input
                type="text"
                placeholder="https://api.example.com/v1/resource"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all group-hover:bg-white font-medium"
                value={url}
                onChange={(e) => onUrlChange(e.target.value)}
            />
        </div>
        <button
            className={`btn px-8 flex items-center gap-2 ${type === 'http' ? 'btn-primary' : 'bg-green-600 text-white hover:bg-green-700 shadow-green-500/20'}`}
            onClick={onSend}
            disabled={isLoading || !url}
        >
            {isLoading ? (
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>{type === 'http' ? 'Sending' : 'Connecting'}</span>
                </div>
            ) : (
                <>
                    <span>{type === 'http' ? 'Send' : 'Connect'}</span>
                    <Send size={18} />
                </>
            )}
        </button>
    </div>
);
