import { useSelector, useDispatch } from 'react-redux';
import { X, Plus } from 'lucide-react';
import type { RootState } from '../store';
import { setActiveRequest, closeRequest } from '../store/slices/collectionSlice';

const RequestTabs = () => {
    const dispatch = useDispatch();
    const { collections, independentRequests, openRequests, activeRequestId } = useSelector((state: RootState) => state.collections);

    // Helper to find request details by ID
    const getRequestDetails = (id: string) => {
        // Search in collections
        for (const collection of collections) {
            const req = collection.requests.find(r => r.id === id);
            if (req) return req;
            for (const folder of collection.folders) {
                const freq = folder.requests.find(r => r.id === id);
                if (freq) return freq;
            }
        }
        // Search in independent requests
        return independentRequests.find(r => r.id === id) || null;
    };

    if (openRequests.length === 0) return null;

    return (
        <div className="flex items-center bg-gray-100 border-b border-gray-200 overflow-x-auto no-scrollbar">
            {openRequests.map(id => {
                const req = getRequestDetails(id);
                if (!req) return null;

                const isActive = activeRequestId === id;

                return (
                    <div
                        key={id}
                        onClick={() => dispatch(setActiveRequest(id))}
                        className={`flex items-center gap-2 px-4 py-2 text-sm max-w-[200px] border-r border-gray-200 cursor-pointer select-none transition-colors group ${isActive ? 'bg-white text-gray-900 border-t-2 border-t-blue-500' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                            }`}
                        title={req.name}
                    >
                        <span className={`text-[10px] font-bold ${req.method === 'GET' ? 'text-green-600' :
                            req.method === 'POST' ? 'text-blue-600' :
                                req.method === 'DELETE' ? 'text-red-600' :
                                    req.method === 'PATCH' ? 'text-purple-600' :
                                        'text-yellow-600'
                            }`}>
                            {req.method}
                        </span>
                        <span className="truncate flex-1">{req.name || 'Untitled Request'}</span>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                dispatch(closeRequest(id));
                            }}
                            className={`p-0.5 rounded-full hover:bg-gray-300 ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                        >
                            <X size={12} />
                        </button>
                    </div>
                );
            })}
            <button className="px-3 text-gray-400 hover:text-gray-600 transition-colors">
                <Plus size={16} />
            </button>
        </div>
    );
};

export default RequestTabs;
