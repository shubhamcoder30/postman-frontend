import React from 'react';

interface AuthSectionProps {
    auth: any;
    onChange: (type: string, key?: string, value?: string) => void;
}

export const AuthSection: React.FC<AuthSectionProps> = ({ auth, onChange }) => (
    <div className="space-y-4">
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Authorization Type</label>
            <select
                className="w-full max-w-xs bg-white border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={auth?.type || 'none'}
                onChange={(e) => onChange(e.target.value)}
            >
                <option value="none">No Auth</option>
                <option value="basic">Basic Auth</option>
                <option value="bearer">Bearer Token</option>
            </select>
        </div>

        {auth?.type === 'basic' && (
            <div className="space-y-3 max-w-sm">
                <input
                    type="text"
                    placeholder="Username"
                    className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={auth?.basic?.username || ''}
                    onChange={(e) => onChange('basic', 'username', e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Password"
                    className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={auth?.basic?.password || ''}
                    onChange={(e) => onChange('basic', 'password', e.target.value)}
                />
            </div>
        )}

        {auth?.type === 'bearer' && (
            <div className="max-w-md">
                <input
                    type="text"
                    placeholder="Token"
                    className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={auth?.bearer?.token || ''}
                    onChange={(e) => onChange('bearer', 'token', e.target.value)}
                />
            </div>
        )}

        {auth?.type === 'none' && <p className="text-sm text-gray-500 italic">This request does not use any authorization.</p>}
    </div>
);
