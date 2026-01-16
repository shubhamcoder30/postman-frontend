import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Save } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { type AppDispatch } from '../store';
import { updateCollection } from '../store/slices/collectionSlice';
import toast from 'react-hot-toast';

interface Variable {
    key: string;
    value: string;
}

interface CollectionVariablesModalProps {
    isOpen: boolean;
    onClose: () => void;
    collection: {
        id: string;
        name: string;
        variables?: Variable[];
    };
}

const CollectionVariablesModal: React.FC<CollectionVariablesModalProps> = ({ isOpen, onClose, collection }) => {
    const dispatch = useDispatch<AppDispatch>();
    const [variables, setVariables] = useState<Variable[]>([]);

    useEffect(() => {
        if (collection.variables && collection.variables.length > 0) {
            setVariables(collection.variables.map(v => ({ ...v })));
        } else {
            setVariables([{ key: '', value: '' }]);
        }
    }, [collection, isOpen]);

    if (!isOpen) return null;

    const handleAddVariable = () => {
        setVariables([...variables, { key: '', value: '' }]);
    };

    const handleRemoveVariable = (index: number) => {
        setVariables(variables.filter((_, i) => i !== index));
    };

    const handleVariableChange = (index: number, field: 'key' | 'value', value: string) => {
        const newVars = [...variables];
        newVars[index][field] = value;
        setVariables(newVars);
    };

    const handleSave = async () => {
        const filteredVars = variables.filter(v => v.key.trim() !== '');
        try {
            await dispatch(updateCollection({
                id: collection.id,
                variables: filteredVars
            })).unwrap();
            toast.success('Collection variables saved');
            onClose();
        } catch (error) {
            toast.error('Failed to save variables');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">Variables: {collection.name}</h2>
                        <p className="text-xs text-gray-500">Variables defined here can be used in any request within this collection using {'{{key}}'} syntax.</p>
                    </div>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 max-h-[60vh] overflow-y-auto">
                    <div className="space-y-3">
                        {variables.length === 0 && (
                            <div className="text-center py-8 text-gray-400">
                                <p className="text-sm">No variables defined yet.</p>
                            </div>
                        )}
                        {variables.map((variable, index) => (
                            <div key={index} className="flex gap-2 items-center">
                                <input
                                    type="text"
                                    placeholder="Variable Key"
                                    className="flex-1 px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none font-mono"
                                    value={variable.key}
                                    onChange={(e) => handleVariableChange(index, 'key', e.target.value)}
                                />
                                <input
                                    type="text"
                                    placeholder="Value"
                                    className="flex-[2] px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none font-mono"
                                    value={variable.value}
                                    onChange={(e) => handleVariableChange(index, 'value', e.target.value)}
                                />
                                <button
                                    onClick={() => handleRemoveVariable(index)}
                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={handleAddVariable}
                        className="mt-4 flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                        <Plus size={16} />
                        Add Variable
                    </button>
                </div>

                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded-lg"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="flex items-center gap-2 px-6 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-lg shadow-blue-500/30"
                    >
                        <Save size={16} />
                        Save Variables
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CollectionVariablesModal;
