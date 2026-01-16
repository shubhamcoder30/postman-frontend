import React from 'react';
import { Trash2, Plus } from 'lucide-react';

interface KeyValuePair {
    id: string;
    key: string;
    value: string;
    isEnabled: boolean;
}

interface KeyValueEditorProps {
    pairs: KeyValuePair[];
    setPairs: (pairs: KeyValuePair[]) => void;
}

const KeyValueEditor: React.FC<KeyValueEditorProps> = ({ pairs, setPairs }) => {
    const handleChange = (id: string, field: 'key' | 'value', value: string) => {
        const newPairs = pairs.map(pair =>
            pair.id === id ? { ...pair, [field]: value } : pair
        );
        setPairs(newPairs);
    };

    const handleRemove = (id: string) => {
        setPairs(pairs.filter(pair => pair.id !== id));
    };

    const handleAdd = () => {
        setPairs([
            ...pairs,
            { id: Date.now().toString(), key: '', value: '', isEnabled: true }
        ]);
    };

    return (
        <div className="space-y-2">
            <div className="flex font-semibold text-xs text-gray-500 uppercase px-2">
                <div className="flex-1">Key</div>
                <div className="flex-1">Value</div>
                <div className="w-8"></div>
            </div>
            {pairs.map((pair) => (
                <div key={pair.id} className="flex gap-2 group">
                    <input
                        type="text"
                        placeholder="Key"
                        className="flex-1 bg-white border border-gray-300 rounded px-2 py-1.5 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        value={pair.key}
                        onChange={(e) => handleChange(pair.id, 'key', e.target.value)}
                    />
                    <input
                        type="text"
                        placeholder="Value"
                        className="flex-1 bg-white border border-gray-300 rounded px-2 py-1.5 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        value={pair.value}
                        onChange={(e) => handleChange(pair.id, 'value', e.target.value)}
                    />
                    <button
                        onClick={() => handleRemove(pair.id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            ))}
            <button
                onClick={handleAdd}
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 font-medium px-2 py-1 rounded hover:bg-gray-100 transition-colors"
            >
                <Plus size={14} />
                <span>Add Item</span>
            </button>
        </div>
    );
};

export default KeyValueEditor;
