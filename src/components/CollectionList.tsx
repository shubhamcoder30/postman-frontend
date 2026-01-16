import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Folder, ChevronRight, ChevronDown, Trash2, Edit2, Plus, Settings } from 'lucide-react';
import { type RootState, type AppDispatch } from '../store';
import type { Collection, Request } from '../types';
import { setActiveRequest, removeCollection, updateCollection, addRequest, updateRequest, removeRequest } from '../store/slices/collectionSlice';
import ConfirmModal from './ConfirmModal';
import CollectionVariablesModal from './CollectionVariablesModal';
import toast from 'react-hot-toast';

const CollectionList = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { collections, activeRequestId } = useSelector((state: RootState) => state.collections);
    const [expandedCollections, setExpandedCollections] = useState<string[]>([]);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editValue, setEditValue] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState<{ id: string, type: 'collection' | 'request' } | null>(null);
    const [variablesModalCollection, setVariablesModalCollection] = useState<any | null>(null);

    const toggleExpand = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setExpandedCollections(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleDelete = (id: string, type: 'collection' | 'request', e: React.MouseEvent) => {
        e.stopPropagation();
        setDeleteConfirm({ id, type });
    };

    const confirmDelete = async () => {
        if (deleteConfirm) {
            try {
                if (deleteConfirm.type === 'collection') {
                    await dispatch(removeCollection(deleteConfirm.id)).unwrap();
                    toast.success('Collection deleted');
                } else {
                    await dispatch(removeRequest(deleteConfirm.id)).unwrap();
                    toast.success('Request deleted');
                }
                setDeleteConfirm(null);
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
            {collections.map((collection: Collection) => (
                <div key={collection.id} className="mb-2">
                    <div className="flex items-center justify-between gap-1 px-3 py-2 hover:bg-white rounded-xl group transition-all cursor-pointer border border-transparent hover:border-slate-200 hover:shadow-sm">
                        <div
                            className="flex-1 flex items-center gap-3 text-sm text-left truncate"
                            onClick={(e) => toggleExpand(collection.id, e)}
                        >
                            <span className="text-slate-400">
                                {expandedCollections.includes(collection.id) ?
                                    <ChevronDown size={14} className="animate-in fade-in" /> :
                                    <ChevronRight size={14} className="animate-in fade-in" />
                                }
                            </span>
                            <div className="p-1.5 bg-amber-50 rounded-lg text-amber-500">
                                <Folder size={16} fill="currentColor" className="opacity-80" />
                            </div>
                            {editingId === collection.id ? (
                                <input
                                    autoFocus
                                    className="flex-1 bg-white border-2 border-blue-500 rounded-lg px-2 py-0.5 outline-none font-bold text-slate-800 shadow-lg shadow-blue-500/10"
                                    value={editValue}
                                    onChange={(e) => setEditValue(e.target.value)}
                                    onBlur={() => handleSaveEdit(collection.id, 'collection')}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit(collection.id, 'collection')}
                                    onClick={(e) => e.stopPropagation()}
                                />
                            ) : (
                                <span className="font-bold text-slate-700 truncate tracking-tight">{collection.name}</span>
                            )}
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                            <button
                                onClick={(e) => handleAddRequest(collection.id, e)}
                                className="p-1.5 hover:bg-blue-50 rounded-lg text-slate-400 hover:text-blue-600 transition-colors"
                                title="Add Request"
                            >
                                <Plus size={14} />
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setVariablesModalCollection(collection);
                                }}
                                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
                                title="Collection Variables"
                            >
                                <Settings size={14} />
                            </button>
                            <button
                                onClick={(e) => startEditing(collection.id, collection.name, e)}
                                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
                                title="Rename"
                            >
                                <Edit2 size={14} />
                            </button>
                            <button
                                onClick={(e) => handleDelete(collection.id, 'collection', e)}
                                className="p-1.5 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-500 transition-colors"
                                title="Delete Collection"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    </div>

                    {expandedCollections.includes(collection.id) && (
                        <div className="ml-6 pl-4 border-l-2 border-slate-100 mt-1 space-y-1">
                            {collection.requests.length === 0 && (
                                <div className="text-[11px] text-slate-400 py-2 pl-2 italic">No requests in this collection</div>
                            )}
                            {collection.requests.map((request: Request) => (
                                <div
                                    key={request.id}
                                    className={`group w-full flex items-center justify-between gap-3 px-3 py-2 hover:bg-white rounded-xl cursor-pointer transition-all border border-transparent hover:border-slate-100 hover:shadow-sm ${activeRequestId === request.id ? 'bg-blue-50/50 border-blue-100 shadow-sm' : ''}`}
                                    onClick={() => dispatch(setActiveRequest(request.id))}
                                >
                                    <div className="flex-1 flex items-center gap-3 truncate">
                                        <span className={`w-12 text-[10px] font-extrabold text-center rounded-lg border py-1 shadow-sm ${getMethodColor(request.method)}`}>
                                            {request.method}
                                        </span>
                                        {editingId === request.id ? (
                                            <input
                                                autoFocus
                                                className="flex-1 bg-white border-2 border-blue-500 rounded-lg px-2 py-0.5 outline-none text-xs font-bold text-slate-800"
                                                value={editValue}
                                                onChange={(e) => setEditValue(e.target.value)}
                                                onBlur={() => handleSaveEdit(request.id, 'request')}
                                                onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit(request.id, 'request')}
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                        ) : (
                                            <span className={`text-xs truncate font-semibold ${activeRequestId === request.id ? 'text-blue-700' : 'text-slate-600'}`}>
                                                {request.name}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                        <button
                                            onClick={(e) => startEditing(request.id, request.name, e)}
                                            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
                                            title="Rename"
                                        >
                                            <Edit2 size={12} />
                                        </button>
                                        <button
                                            onClick={(e) => handleDelete(request.id, 'request', e)}
                                            className="p-1.5 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-500 transition-colors"
                                            title="Delete Request"
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ))}

            <ConfirmModal
                isOpen={!!deleteConfirm}
                onClose={() => setDeleteConfirm(null)}
                onConfirm={confirmDelete}
                title={`Delete ${deleteConfirm?.type === 'collection' ? 'Collection' : 'Request'}`}
                message={`Are you sure you want to delete this ${deleteConfirm?.type}? This action cannot be undone.`}
                confirmText="Delete"
                type="danger"
            />

            {variablesModalCollection && (
                <CollectionVariablesModal
                    isOpen={!!variablesModalCollection}
                    onClose={() => setVariablesModalCollection(null)}
                    collection={variablesModalCollection}
                />
            )}
        </div>
    );
};

export default CollectionList;
