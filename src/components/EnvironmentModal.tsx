import React, { useState, useEffect } from 'react';
import { X, Save, Plus, Trash2 } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { type AppDispatch } from '../store';
import { updateEnvironment } from '../store/slices/environmentSlice';
import toast from 'react-hot-toast';

interface EnvironmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    environment: any;
}

const EnvironmentModal: React.FC<EnvironmentModalProps> = ({ isOpen, onClose, environment }) => {
    const dispatch = useDispatch<AppDispatch>();
    const [name, setName] = useState(environment?.name || '');
    const [variables, setVariables] = useState<any[]>(environment?.variables || []);

    useEffect(() => {
        if (environment) {
            setName(environment.name);
            setVariables(environment.variables || []);
        }
    }, [environment]);

    if (!isOpen || !environment) return null;

    const handleAddVariable = () => {
        setVariables([...variables, { id: Date.now(), key: '', value: '' }]);
    };

    const handleVariableChange = (id: any, field: string, value: string) => {
        setVariables(variables.map(v => v.id === id ? { ...v, [field]: value } : v));
    };

    const handleRemoveVariable = (id: any) => {
        setVariables(variables.filter(v => v.id !== id));
    };

    const handleSave = async () => {
        try {
            await dispatch(updateEnvironment({
                id: environment.id,
                name,
                variables: variables.filter(v => v.key.trim() !== '')
            })).unwrap();
            toast.success('Environment updated');
            onClose();
        } catch (error) {
            toast.error('Failed to update environment');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-200">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900">Manage Environment</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Environment Name</label>
                        <input
                            type="text"
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <label className="text-sm font-semibold text-gray-700">Variables</label>
                            <button
                                onClick={handleAddVariable}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-sm font-bold hover:bg-blue-100 transition-colors"
                            >
                                <Plus size={16} />
                                Add Variable
                            </button>
                        </div>

                        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                            <div className="grid grid-cols-[1fr,1fr,40px] gap-4 px-2">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Key</span>
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Value</span>
                                <div></div>
                            </div>

                            {variables.length === 0 ? (
                                <div className="text-center py-10 bg-gray-50 rounded-xl border-2 border-dashed border-gray-100 italic text-gray-400 text-sm">
                                    No variables added yet
                                </div>
                            ) : variables.map((variable, index) => (
                                <div key={variable.id || index} className="grid grid-cols-[1fr,1fr,40px] gap-3 items-center group">
                                    <input
                                        type="text"
                                        placeholder="Variable name"
                                        className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-mono"
                                        value={variable.key}
                                        onChange={(e) => handleVariableChange(variable.id, 'key', e.target.value)}
                                    />
                                    <input
                                        type="text"
                                        placeholder="Value"
                                        className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-mono"
                                        value={variable.value}
                                        onChange={(e) => handleVariableChange(variable.id, 'value', e.target.value)}
                                    />
                                    <button
                                        onClick={() => handleRemoveVariable(variable.id)}
                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all active:scale-95"
                    >
                        <Save size={18} />
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EnvironmentModal;
