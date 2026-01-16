import React, { useState } from 'react';
import { X, Upload, Terminal } from 'lucide-react';

interface ImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onImport: (data: any, type: 'json' | 'curl') => void;
}

const ImportModal: React.FC<ImportModalProps> = ({ isOpen, onClose, onImport }) => {
    const [activeTab, setActiveTab] = useState<'json' | 'curl'>('json');
    const [content, setContent] = useState('');

    if (!isOpen) return null;

    const handleImport = () => {
        onImport(content, activeTab);
        setContent('');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-opacity">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden transform transition-all animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100 bg-gray-50/50">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Import Data</h2>
                        <p className="text-xs text-gray-500 mt-0.5">Import Postman collections or cURL commands</p>
                    </div>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex border-b border-gray-100 px-8 bg-white">
                    <button
                        className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold transition-all border-b-2 ${activeTab === 'json' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                        onClick={() => setActiveTab('json')}
                    >
                        <Upload size={16} />
                        Postman JSON
                    </button>
                    <button
                        className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold transition-all border-b-2 ${activeTab === 'curl' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                        onClick={() => setActiveTab('curl')}
                    >
                        <Terminal size={16} />
                        cURL Command
                    </button>
                </div>

                <div className="p-8">
                    <textarea
                        className="w-full h-80 p-5 bg-gray-50 border border-gray-200 rounded-xl font-mono text-xs text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all shadow-inner resize-none leading-relaxed"
                        placeholder={activeTab === 'json' ? '{\n  "info": {\n    "name": "My Collection",\n    ...\n  }\n}' : 'curl --location --request GET "https://api.example.com"'}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        autoFocus
                    />
                </div>

                <div className="px-8 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 text-sm font-semibold text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-xl transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleImport}
                        disabled={!content.trim()}
                        className="px-8 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-lg shadow-blue-500/30 disabled:opacity-40 disabled:shadow-none disabled:cursor-not-allowed"
                    >
                        Perform Import
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ImportModal;
