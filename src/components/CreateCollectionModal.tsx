import React, { useState } from 'react';
import { X } from 'lucide-react';

interface CreateCollectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (name: string) => void;
}

const CreateCollectionModal: React.FC<CreateCollectionModalProps> = ({ isOpen, onClose, onCreate }) => {
    const [name, setName] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim()) {
            onCreate(name.trim());
            setName('');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-opacity">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100 bg-gray-50/50">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Create New Collection</h2>
                        <p className="text-xs text-gray-500 mt-0.5">Organize your requests in a folder</p>
                    </div>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8">
                    <div className="mb-8">
                        <label htmlFor="collectionName" className="block text-sm font-semibold text-gray-700 mb-2 ml-0.5">
                            Collection Name
                        </label>
                        <input
                            id="collectionName"
                            type="text"
                            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                            placeholder="e.g. Payments API, Auth Services..."
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            autoFocus
                        />
                    </div>

                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2.5 text-sm font-semibold text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!name.trim()}
                            className="px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-lg shadow-blue-500/30 disabled:opacity-40 disabled:shadow-none disabled:cursor-not-allowed"
                        >
                            Create Collection
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateCollectionModal;
