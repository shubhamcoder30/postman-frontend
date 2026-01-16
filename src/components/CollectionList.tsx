import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Folder, ChevronRight, ChevronDown, Trash2, Edit2, Plus } from 'lucide-react';
import { type RootState, type AppDispatch } from '../store';
import { setActiveRequest, removeCollection, updateCollection, addRequest, updateRequest } from '../store/slices/collectionSlice';
import ConfirmModal from './ConfirmModal';
import toast from 'react-hot-toast';

const CollectionList = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { collections, activeRequestId } = useSelector((state: RootState) => state.collections);
    const [expandedCollections, setExpandedCollections] = useState<string[]>([]);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editValue, setEditValue] = useState('');
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

    const toggleExpand = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setExpandedCollections(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleDelete = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setDeleteConfirmId(id);
    };

    const confirmDelete = async () => {
        if (deleteConfirmId) {
            try {
                await dispatch(removeCollection(deleteConfirmId)).unwrap();
                toast.success('Collection deleted');
            } catch (error) {
                toast.error('Failed to delete: ' + error);
            }
        }
    };

    const startEditing = (id: string, currentValue: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingId(id);
        setEditValue(currentValue);
    };

    const handleSaveEdit = async (id: string, type: 'collection' | 'request') => {
        if (!editValue.trim()) return;
        try {
            if (type === 'collection') {
                await dispatch(updateCollection({ id, name: editValue })).unwrap();
            } else {
                await dispatch(updateRequest({ id, name: editValue })).unwrap();
            }
            setEditingId(null);
            toast.success('Renamed successfully');
        } catch (error) {
            toast.error('Failed to rename: ' + error);
        }
    };

    const handleAddRequest = async (collectionId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            await dispatch(addRequest({ collectionId, type: 'http', name: 'New Request' })).unwrap();
            if (!expandedCollections.includes(collectionId)) {
                setExpandedCollections(prev => [...prev, collectionId]);
            }
            toast.success('Request added');
        } catch (error) {
            toast.error('Failed to add request: ' + error);
        }
    };

    const getMethodColor = (method: string) => {
        switch (method) {
            case 'GET': return 'text-green-600 border-green-200 bg-green-50';
            case 'POST': return 'text-yellow-600 border-yellow-200 bg-yellow-50';
            case 'PUT': return 'text-blue-600 border-blue-200 bg-blue-50';
            case 'PATCH': return 'text-purple-600 border-purple-200 bg-purple-50';
            case 'DELETE': return 'text-red-600 border-red-200 bg-red-50';
            default: return 'text-gray-600 border-gray-200 bg-gray-50';
        }
    };

    return (
        <div className="space-y-1">
            {collections.map(collection => (
                <div key={collection.id}>
                    <div className="flex items-center justify-between gap-1 px-2 py-1.5 hover:bg-gray-100 rounded group transition-colors cursor-pointer">
                        <div
                            className="flex-1 flex items-center gap-2 text-sm text-left truncate"
                            onClick={(e) => toggleExpand(collection.id, e)}
                        >
                            <span className="text-gray-400">
                                {expandedCollections.includes(collection.id) ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                            </span>
                            <Folder size={16} className="text-yellow-500 min-w-[16px]" />
                            {editingId === collection.id ? (
                                <input
                                    autoFocus
                                    className="flex-1 bg-white border border-blue-500 rounded px-1 outline-none font-medium text-gray-700"
                                    value={editValue}
                                    onChange={(e) => setEditValue(e.target.value)}
                                    onBlur={() => handleSaveEdit(collection.id, 'collection')}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit(collection.id, 'collection')}
                                    onClick={(e) => e.stopPropagation()}
                                />
                            ) : (
                                <span className="font-medium text-gray-700 truncate">{collection.name}</span>
                            )}
                        </div>
                        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-all">
                            <button
                                onClick={(e) => handleAddRequest(collection.id, e)}
                                className="p-1 hover:bg-gray-200 rounded text-gray-400 hover:text-blue-500"
                                title="Add Request"
                            >
                                <Plus size={14} />
                            </button>
                            <button
                                onClick={(e) => startEditing(collection.id, collection.name, e)}
                                className="p-1 hover:bg-gray-200 rounded text-gray-400 hover:text-gray-600"
                                title="Rename"
                            >
                                <Edit2 size={14} />
                            </button>
                            <button
                                onClick={(e) => handleDelete(collection.id, e)}
                                className="p-1 hover:bg-gray-200 rounded text-gray-400 hover:text-red-500"
                                title="Delete Collection"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    </div>

                    {expandedCollections.includes(collection.id) && (
                        <div className="ml-4 pl-2 border-l border-gray-200 mt-1 space-y-0.5">
                            {collection.requests.length === 0 && (
                                <div className="text-[11px] text-gray-400 py-1 pl-2">No requests</div>
                            )}
                            {collection.requests.map(request => (
                                <div
                                    key={request.id}
                                    className={`group w-full flex items-center justify-between gap-2 px-2 py-1 hover:bg-gray-100 rounded cursor-pointer transition-colors ${activeRequestId === request.id ? 'bg-blue-50' : ''}`}
                                    onClick={() => dispatch(setActiveRequest(request.id))}
                                >
                                    <div className="flex-1 flex items-center gap-2 truncate">
                                        <span className={`w-10 text-[9px] font-bold text-center rounded border py-0.5 ${getMethodColor(request.method)}`}>
                                            {request.method}
                                        </span>
                                        {editingId === request.id ? (
                                            <input
                                                autoFocus
                                                className="flex-1 bg-white border border-blue-500 rounded px-1 outline-none text-xs text-gray-700"
                                                value={editValue}
                                                onChange={(e) => setEditValue(e.target.value)}
                                                onBlur={() => handleSaveEdit(request.id, 'request')}
                                                onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit(request.id, 'request')}
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                        ) : (
                                            <span className={`text-xs truncate ${activeRequestId === request.id ? 'text-blue-600 font-medium' : 'text-gray-600'}`}>
                                                {request.name}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-all">
                                        <button
                                            onClick={(e) => startEditing(request.id, request.name, e)}
                                            className="p-1 hover:bg-gray-200 rounded text-gray-400 hover:text-gray-600"
                                        >
                                            <Edit2 size={12} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ))}

            <ConfirmModal
                isOpen={!!deleteConfirmId}
                onClose={() => setDeleteConfirmId(null)}
                onConfirm={confirmDelete}
                title="Delete Collection"
                message="Are you sure you want to delete this collection? This action cannot be undone."
                confirmText="Delete"
                type="danger"
            />
        </div>
    );
};

export default CollectionList;
