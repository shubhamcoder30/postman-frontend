import React from 'react';
import KeyValueEditor from '../KeyValueEditor';

interface BodySectionProps {
    body: string;
    bodyType: string;
    formDataParams: any[];
    onBodyChange: (body: string) => void;
    onBodyTypeChange: (type: string) => void;
    setFormDataParams: (params: any[]) => void;
}

export const BodySection: React.FC<BodySectionProps> = ({ body, bodyType, formDataParams, onBodyChange, onBodyTypeChange, setFormDataParams }) => (
    <div className="space-y-4 h-full flex flex-col">
        <div className="flex items-center gap-4">
            {['none', 'json', 'form-data', 'raw'].map((type) => (
                <label key={type} className="flex items-center gap-2">
                    <input
                        type="radio"
                        name="bodyType"
                        value={type}
                        checked={bodyType === type || (type === 'none' && !bodyType)}
                        onChange={() => onBodyTypeChange(type)}
                        className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 capitalize">{type.replace('-', ' ')}</span>
                </label>
            ))}
        </div>

        <div className="flex-1 border border-gray-200 rounded p-2 bg-gray-50 min-h-[200px]">
            {(!bodyType || bodyType === 'none') && (
                <div className="h-full flex items-center justify-center text-gray-400 text-sm italic">
                    This request does not have a body
                </div>
            )}
            {(bodyType === 'json' || bodyType === 'raw') && (
                <textarea
                    className="w-full h-full bg-transparent resize-none focus:outline-none font-mono text-sm text-gray-900"
                    placeholder={bodyType === 'json' ? '{ "key": "value" }' : 'Raw content'}
                    value={body}
                    onChange={(e) => onBodyChange(e.target.value)}
                />
            )}
            {bodyType === 'form-data' && (
                <KeyValueEditor pairs={formDataParams} setPairs={setFormDataParams} />
            )}
        </div>
    </div>
);
