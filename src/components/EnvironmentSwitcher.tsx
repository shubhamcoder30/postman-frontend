import { useDispatch, useSelector } from 'react-redux';
import { Globe, Plus, Settings } from 'lucide-react';
import { type RootState, type AppDispatch } from '../store';
import { setActiveEnvironment, fetchEnvironments, createEnvironment } from '../store/slices/environmentSlice';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import EnvironmentModal from './EnvironmentModal';

interface Environment {
    id: string;
    name: string;
    variables: { key: string; value: string }[];
}

const EnvironmentSwitcher = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { environments, activeEnvironmentId, status } = useSelector((state: RootState) => state.environments as any);
    const [isAdding, setIsAdding] = useState(false);
    const [newEnvName, setNewEnvName] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        if (status === 'idle') {
            dispatch(fetchEnvironments());
        }
    }, [status, dispatch]);

    const handleCreate = async () => {
        if (!newEnvName.trim()) return;
        try {
            await dispatch(createEnvironment(newEnvName)).unwrap();
            setNewEnvName('');
            setIsAdding(false);
            toast.success('Environment created');
        } catch (error) {
            toast.error('Failed to create environment');
        }
    };

    const activeEnv = environments.find((env: Environment) => env.id === activeEnvironmentId);

    return (
        <div className="flex items-center gap-2">
            <Globe size={16} className="text-gray-500" />
            <select
                className="bg-gray-100 border border-gray-300 rounded px-2 py-1 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500 min-w-[120px]"
                value={activeEnvironmentId || ''}
                onChange={(e) => dispatch(setActiveEnvironment(e.target.value || null))}
            >
                <option value="">No Environment</option>
                {environments.map((env: Environment) => (
                    <option key={env.id} value={env.id}>{env.name}</option>
                ))}
            </select>

            {!isAdding ? (
                <button
                    onClick={() => setIsAdding(true)}
                    className="p-1 hover:bg-gray-200 rounded border border-gray-300 text-gray-600 transition-colors"
                >
                    <Plus size={14} />
                </button>
            ) : (
                <div className="flex items-center gap-1">
                    <input
                        autoFocus
                        type="text"
                        className="bg-white border border-gray-300 rounded px-2 py-1 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500 w-24"
                        placeholder="Name..."
                        value={newEnvName}
                        onChange={(e) => setNewEnvName(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleCreate();
                            if (e.key === 'Escape') setIsAdding(false);
                        }}
                    />
                </div>
            )}

            <button
                onClick={() => setIsModalOpen(true)}
                disabled={!activeEnvironmentId}
                className="p-1 hover:bg-gray-200 rounded border border-gray-300 text-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <Settings size={14} />
            </button>

            {activeEnv && (
                <EnvironmentModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    environment={activeEnv}
                />
            )}
        </div>
    );
};

export default EnvironmentSwitcher;
