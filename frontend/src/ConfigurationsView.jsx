// frontend/src/ConfigurationsView.jsx
import React, { useState, useEffect } from 'react';

const SettingsInput = ({ label, name, value, onChange, type = "number", step = "0.1" }) => (
    <div>
        <label htmlFor={name} className="block text-xs font-medium text-gray-500">{label}</label>
        <input type={type} id={name} name={name} value={value} onChange={onChange} step={step} className="w-full px-2 py-1 mt-1 bg-gray-100 border border-gray-300 rounded-md"/>
    </div>
);

export default function ConfigurationsView() {
    const [settings, setSettings] = useState(null);
    const [status, setStatus] = useState('');

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await fetch('http://127.0.0.1:8000/settings');
                const data = await response.json();
                setSettings(data);
            } catch (error) { setStatus('Failed to load settings.'); }
        };
        fetchSettings();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        const [section, key] = name.split('.');
        setSettings(prev => ({...prev, [section]: { ...prev[section], [key]: parseFloat(value) }}));
    };

    const handleSave = async () => {
        setStatus('Saving...');
        try {
            await fetch('http://127.0.0.1:8000/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings)
            });
            setStatus('Settings saved successfully!');
        } catch (error) { setStatus('Failed to save settings.'); }
    };

    if (!settings) return <div className="p-8">Loading configurations...</div>;

    return (
        <div className="bg-gray-100 min-h-screen p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-extrabold text-gray-900 mb-4">System Configuration Panel</h1>
                <p className="text-gray-600 mb-8">Adjust system-wide rules and default values.</p>
                <div className="bg-white p-6 rounded-lg shadow-md space-y-6">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Decision Thresholds</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <SettingsInput label="Approve Below (Probability)" name="decision_thresholds.approve_below" value={settings.decision_thresholds.approve_below} onChange={handleChange} step="0.01" />
                            <SettingsInput label="Decline Above (Probability)" name="decision_thresholds.decline_above" value={settings.decision_thresholds.decline_above} onChange={handleChange} step="0.01" />
                        </div>
                    </div>
                    <div className="border-t pt-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">System-Wide Defaults</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <SettingsInput label="Default Interest Rate (%)" name="mock_data_defaults.int_rate" value={settings.mock_data_defaults.int_rate} onChange={handleChange} />
                        </div>
                    </div>
                    <button onClick={handleSave} className="w-full mt-4 px-4 py-3 bg-indigo-600 text-white rounded-lg font-semibold">Save Configuration</button>
                    {status && <p className="text-center mt-4 text-sm text-gray-600">{status}</p>}
                </div>
            </div>
        </div>
    );
}
