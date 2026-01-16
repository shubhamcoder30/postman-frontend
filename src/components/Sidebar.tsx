import { useState } from 'react';
import toast from 'react-hot-toast';
import { Settings, Star, Download, FolderPlus, Edit2 } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import CollectionList from './CollectionList';
import ImportModal from './ImportModal';
import CreateCollectionModal from './CreateCollectionModal';
import CreateNewModal from './CreateNewModal';
import { addCollection, addRequest, setActiveRequest, updateRequest } from '../store/slices/collectionSlice';
import { parseCurl } from '../utils/curl';
import type { RootState, AppDispatch } from '../store';

const Sidebar = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { independentRequests, activeRequestId } = useSelector((state: RootState) => state.collections);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isCreateNewModalOpen, setIsCreateNewModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editValue, setEditValue] = useState('');

    const startEditing = (id: string, currentValue: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingId(id);
        setEditValue(currentValue);
    };

    const handleSaveEdit = async (id: string) => {
        if (!editValue.trim()) return;
        try {
            await dispatch(updateRequest({ id, name: editValue })).unwrap();
            setEditingId(null);
            toast.success('Renamed successfully');
        } catch (error) {
            toast.error('Failed to rename: ' + error);
        }
    };

    const handleCreateCollection = async (name: string) => {
        try {
            await dispatch(addCollection(name)).unwrap();
            setIsCreateModalOpen(false);
            toast.success('Collection created');
        } catch (error) {
            toast.error('Failed to create collection: ' + error);
        }
    };

    const handleCreateNew = async (type: 'http' | 'websocket' | 'socketio' | 'collection') => {
        if (type === 'collection') {
            setIsCreateModalOpen(true);
        } else {
            try {
                // Create independent request
                await dispatch(addRequest({ type, name: 'New Request' })).unwrap();
                toast.success('Request created');
            } catch (error) {
                toast.error('Failed to create request: ' + error);
            }
        }
    };

    const handleImport = async (content: string, type: 'json' | 'curl') => {
        if (type === 'curl') {
            const parsed = parseCurl(content);
            if (parsed) {
                try {
                    await dispatch(addRequest({
                        type: 'http',
                        name: 'Imported Request',
                        method: parsed.method,
                        url: parsed.url,
                        headers: parsed.headers,
                        body: parsed.body,
                        bodyType: parsed.bodyType,
                    })).unwrap();
                    toast.success("cURL imported as Draft");
                } catch (error) {
                    toast.error('Failed to import cURL: ' + error);
                }
            } else {
                toast.error("Invalid cURL command");
            }
        } else {
            try {
                const data = JSON.parse(content);
                // Handle Postman collection format
                if (data.info && data.item) {
                    const collectionName = data.info.name || 'Imported Collection';

                    try {
                        // Create Collection
                        const newCollection = await dispatch(addCollection(collectionName)).unwrap();

                        if (!newCollection || !newCollection.id) {
                            throw new Error('Collection was created but server did not return a valid ID.');
                        }

                        const collectionId = String(newCollection.id);

                        // Create Requests
                        for (const item of data.item) {
                            if (item.request) {
                                const reqName = item.name || 'Untitled Request';
                                const method = item.request.method || 'GET';
                                const url = item.request.url?.raw || '';
                                const headers = (item.request.header || []).map((h: any) => ({
                                    key: h.key,
                                    value: h.value,
                                    enabled: true
                                }));

                                let body = '';
                                let bodyType = 'none';

                                if (item.request.body) {
                                    bodyType = item.request.body.mode || 'none';
                                    if (bodyType === 'raw') {
                                        body = item.request.body.raw || '';
                                    } else if (bodyType === 'formdata') {
                                        body = JSON.stringify(item.request.body.formdata || []);
                                    }
                                }

                                await dispatch(addRequest({
                                    collectionId,
                                    type: 'http',
                                    name: reqName,
                                    method,
                                    url,
                                    headers,
                                    body,
                                    bodyType
                                })).unwrap();
                            }
                        }
                        toast.success(`Collection "${collectionName}" imported!`);
                    } catch (error) {
                        toast.error('Import failed: ' + error);
                    }
                } else {
                    toast.error('Invalid Postman Collection format');
                }
            } catch (e) {
                toast.error("Invalid JSON");
            }
        }
    };

    const getMethodColor = (method: string) => {
        switch (method) {
            case 'GET': return 'text-green-500';
            case 'POST': return 'text-yellow-500';
            case 'PUT': return 'text-blue-500';
            case 'DELETE': return 'text-red-500';
            default: return 'text-gray-500';
        }
    };

    return (
        <aside className="w-64 bg-white flex flex-col h-full border-r border-gray-200">
            <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="font-bold text-lg text-gray-900">Postman Clone</h1>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setIsCreateNewModalOpen(true)}
                        className="flex-1 flex items-center justify-center gap-2 px-2 py-1.5 bg-gray-100 hover:bg-gray-200 rounded text-xs font-medium text-gray-700 transition-colors"
                        title="New Collection"
                    >
                        <FolderPlus size={14} />
                        <span>New</span>
                    </button>
                    <button
                        onClick={() => setIsImportModalOpen(true)}
                        className="flex-1 flex items-center justify-center gap-2 px-2 py-1.5 bg-gray-100 hover:bg-gray-200 rounded text-xs font-medium text-gray-700 transition-colors"
                        title="Import"
                    >
                        <Download size={14} />
                        <span>Import</span>
                    </button>
                </div>
            </div>

            <nav className="flex-1 overflow-y-auto py-4">
                {independentRequests.length > 0 && (
                    <div className="px-4 mb-4">
                        <p className="text-xs font-bold text-gray-500 uppercase mb-2 tracking-wider">Drafts</p>
                        <div className="space-y-1">
                            {independentRequests.map((req: any) => (
                                <div
                                    key={req.id}
                                    onClick={() => dispatch(setActiveRequest(req.id))}
                                    className={`flex items-center justify-between gap-2 px-2 py-1.5 hover:bg-gray-100 rounded cursor-pointer group ${activeRequestId === req.id ? 'bg-blue-50' : ''}`}
                                >
                                    <div className="flex-1 flex items-center gap-2 truncate">
                                        <span className={`text-[10px] font-bold uppercase w-8 ${getMethodColor(req.method)}`}>{req.method}</span>
                                        {editingId === req.id ? (
                                            <input
                                                autoFocus
                                                className="flex-1 bg-white border border-blue-500 rounded px-1 outline-none text-xs text-gray-700"
                                                value={editValue}
                                                onChange={(e) => setEditValue(e.target.value)}
                                                onBlur={() => handleSaveEdit(req.id)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit(req.id)}
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                        ) : (
                                            <span className={`text-sm truncate ${activeRequestId === req.id ? 'text-blue-600 font-medium' : 'text-gray-700'}`}>{req.name}</span>
                                        )}
                                    </div>
                                    <button
                                        onClick={(e) => startEditing(req.id, req.name, e)}
                                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded text-gray-400 hover:text-gray-600 transition-all"
                                    >
                                        <Edit2 size={12} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="px-4 mb-4">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Collections</p>
                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded transition-colors"
                            title="Create Collection"
                        >
                            <FolderPlus size={14} />
                        </button>
                    </div>
                    <CollectionList />
                </div>
                <div className="px-4 mb-4">
                    <p className="text-xs font-bold text-gray-500 uppercase mb-2 tracking-wider">History</p>
                    <div className="space-y-1 text-sm text-gray-400 italic p-2">
                        No recent history
                    </div>
                </div>
            </nav>
            <div className="p-4 border-t border-gray-200 space-y-2">
                {/* <button className="w-full flex items-center gap-2 px-2 py-1.5 hover:bg-gray-100 rounded text-sm text-gray-600 hover:text-gray-900 transition-colors">
                    <Star size={16} />
                    <span>Favorites</span>
                </button>
                <button className="w-full flex items-center gap-2 px-2 py-1.5 hover:bg-gray-100 rounded text-sm text-gray-600 hover:text-gray-900 transition-colors">
                    <Settings size={16} />
                    <span>Settings</span>
                </button> */}
            </div>

            <ImportModal
                isOpen={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
                onImport={handleImport}
            />
            <CreateCollectionModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onCreate={handleCreateCollection}
            />
            <CreateNewModal
                isOpen={isCreateNewModalOpen}
                onClose={() => setIsCreateNewModalOpen(false)}
                onCreate={handleCreateNew}
            />
        </aside>
    );
};

export default Sidebar;
