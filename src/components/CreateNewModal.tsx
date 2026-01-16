import React, { useState } from 'react';
import { X, Globe, Wifi, Zap, Folder } from 'lucide-react';

interface CreateNewModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (type: 'http' | 'websocket' | 'socketio' | 'collection') => void;
}

const CreateNewModal: React.FC<CreateNewModalProps> = ({ isOpen, onClose, onCreate }) => {
    const [selected, setSelected] = useState<'http' | 'websocket' | 'socketio' | 'collection' | null>('http');

    if (!isOpen) return null;

    const handleSelect = (type: 'http' | 'websocket' | 'socketio' | 'collection') => {
        setSelected(type);
    };

    const handleCreate = () => {
        if (selected) {
            onCreate(selected);
            onClose();
        }
    };

    const options = [
        { id: 'http', label: 'HTTP Request', icon: Globe, description: 'Send any web request like GET, POST, or PUT to a server' },
        { id: 'websocket', label: 'WebSocket', icon: Wifi, description: 'Establish a persistent two-way connection for real-time data' },
        { id: 'socketio', label: 'Socket.IO', icon: Zap, description: 'Connect using the robust and popular Socket.IO framework' },
        { id: 'collection', label: 'Collection', icon: Folder, description: 'Group related requests together for better organization' },
    ] as const;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-opacity">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden transform transition-all animate-in fade-in zoom-in duration-200 flex flex-col h-[520px]">
                <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100 bg-gray-50/50">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Create New</h2>
                        <p className="text-xs text-gray-500 mt-0.5">Select the type of resource you want to build</p>
                    </div>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 p-8 bg-white overflow-y-auto">
                    <div className="grid grid-cols-2 gap-4">
                        {options.map((opt) => (
                            <button
                                key={opt.id}
                                className={`flex items-start gap-4 p-5 rounded-2xl border-2 transition-all text-left ${selected === opt.id
                                    ? 'border-blue-500 bg-blue-50/50 ring-4 ring-blue-500/10'
                                    : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                                    }`}
                                onClick={() => handleSelect(opt.id)}
                                onDoubleClick={() => {
                                    handleSelect(opt.id);
                                    handleCreate();
                                }}
                            >
                                <div className={`p-3 rounded-xl ${selected === opt.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'bg-gray-100 text-gray-500'}`}>
                                    <opt.icon size={24} />
                                </div>
                                <div className="flex-1">
                                    <h3 className={`font-bold text-sm ${selected === opt.id ? 'text-blue-900' : 'text-gray-700'}`}>{opt.label}</h3>
                                    <p className={`text-xs mt-1 leading-relaxed ${selected === opt.id ? 'text-blue-700' : 'text-gray-500'}`}>{opt.description}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="px-8 py-6 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                        <kbd className="px-2 py-1 bg-white border border-gray-200 rounded-md font-sans">Enter</kbd>
                        <span>to create</span>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="px-6 py-2.5 text-sm font-semibold text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-xl transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleCreate}
                            disabled={!selected}
                            className="px-8 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-lg shadow-blue-500/30 disabled:opacity-40 disabled:shadow-none disabled:cursor-not-allowed"
                        >
                            Next Step
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateNewModal;
