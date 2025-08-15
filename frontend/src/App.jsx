import React, { useState, useMemo, useEffect, useCallback } from 'react';

// --- (Helper components like usStates, Icons, FormInput, etc. remain the same) ---
const usStates = ["Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming"];
const loanPurposes = [{ value: 'debt_consolidation', label: 'Debt Consolidation' }, { value: 'credit_card', label: 'Credit Card Refinancing' }, { value: 'home_improvement', label: 'Home Improvement' }, { value: 'major_purchase', label: 'Major Purchase' }, { value: 'other', label: 'Other' }];
const UserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
const BriefcaseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
const CashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
const DocumentIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
const CheckCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-green-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const InboxIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" /><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" /></svg>;
const BackIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" /></svg>;
const ApproveIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>;
const DeclineIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>;
const FlagIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6z" clipRule="evenodd" /></svg>;

// --- Reusable Form & UI Components ---
const FormInput = ({ label, name, type = "text", value, onChange, required = true, pattern, title, placeholder, optional = false, maxLength }) => ( <div className="mb-6"> <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1"> {label} {optional && <span className="text-gray-500">(Optional)</span>} </label> <input type={type} id={name} name={name} value={value} onChange={onChange} required={required && !optional} pattern={pattern} title={title} placeholder={placeholder} maxLength={maxLength} className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out" /> </div> );
const FormSelect = ({ label, name, value, onChange, options, required = true }) => ( <div className="mb-6"> <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label}</label> <select id={name} name={name} value={value} onChange={onChange} required={required} className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out" > <option value="">Select an option</option> {options.map(option => ( <option key={option.value || option} value={option.value || option}> {option.label || option} </option> ))} </select> </div> );
const SettingsInput = ({ label, name, value, onChange, type = "number", step = "0.1" }) => ( <div> <label htmlFor={name} className="block text-xs font-medium text-gray-500">{label}</label> <input type={type} id={name} name={name} value={value || ''} onChange={onChange} step={step} className="w-full px-2 py-1 mt-1 bg-gray-100 border border-gray-300 rounded-md"/> </div> );
const TabButton = ({ active, onClick, children }) => ( <button onClick={onClick} className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${ active ? 'bg-indigo-600 text-white shadow' : 'text-gray-600 hover:bg-gray-200' }`} > {children} </button> );
const DetailRow = ({ label, value }) => ( <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4"> <dt className="text-sm font-medium text-gray-500">{label}</dt> <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{String(value)}</dd> </div> );
const ProcessingScreen = ({ message }) => ( <div className="flex flex-col items-center justify-center h-screen bg-gray-50"> <div className="text-center"> <svg className="animate-spin h-10 w-10 text-indigo-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"> <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle> <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path> </svg> <h2 className="text-2xl font-semibold text-gray-700">{message}</h2> </div> </div> );

// --- Visual Dashboard Components ---
const RiskGauge = ({ score }) => {
    const percentage = score * 100;
    let colorClass = 'text-green-500';
    if (percentage > 30) colorClass = 'text-yellow-500';
    if (percentage > 60) colorClass = 'text-red-500';

    return (
        <div className="relative w-56 h-28 mx-auto">
            <svg className="w-full h-full" viewBox="0 0 100 50">
                <path d="M10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#e5e7eb" strokeWidth="12" />
                <path d="M10 50 A 40 40 0 0 1 90 50" fill="none" stroke="currentColor" strokeWidth="12"
                    className={colorClass}
                    strokeDasharray="125.6"
                    strokeDashoffset={125.6 - (percentage / 100) * 125.6}
                />
            </svg>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center">
                <span className={`text-2xl font-bold ${colorClass}`}>{(percentage).toFixed(2)}%</span>
                <p className="text-xs text-gray-500 mt-1">Probability of Default</p>
            </div>
        </div>
    );
};

const FactorsChart = ({ title, factors, colorClass }) => (
    <div>
        <h4 className="text-md font-semibold text-gray-700 mb-3">{title}</h4>
        <div className="space-y-3">
            {factors.map((item, index) => (
                <div key={index} className="w-full">
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>{item.factor}</span>
                        <span>{item.impact.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className={`${colorClass} h-2.5 rounded-full`} style={{ width: `${item.impact * 1.5}%` }}></div>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

const DataCard = ({ title, data }) => (
    <div className="bg-white shadow-md rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 border-b pb-3 mb-4">{title}</h3>
        <dl className="divide-y divide-gray-100">
            {Object.entries(data).map(([key, value]) => (
                <DetailRow key={key} label={key} value={value} />
            ))}
        </dl>
    </div>
);

// --- Main View Components ---

const CustomerApplicationForm = ({ onApplicationSubmit }) => {
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        applicant_name: '', dob: '', ssn_last4: '',
        address_street: '', address_apt: '', address_city: '', address_county: '', address_state: '', address_zip: '',
        employment_status: '', employer: '', emp_length: '10+ years', annual_inc: '85000', employer_address: '', existing_monthly_debt: '500',
        loan_amnt: '10000', term: '36 months', purpose: 'debt_consolidation', home_ownership: 'RENT',
        int_rate: '11.89', installment: '331.67', grade: 'B', verification_status: 'Verified', dti: '19.48', open_acc: '10', pub_rec: '0', revol_bal: '15686', revol_util: '58.3', total_acc: '25',
    });
    const [documents, setDocuments] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submissionStatus, setSubmissionStatus] = useState({ message: '', type: '' });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => setDocuments(prevDocs => [...prevDocs, ...Array.from(e.target.files)]);
    const handleRemoveFile = (indexToRemove) => setDocuments(prevDocs => prevDocs.filter((_, index) => index !== indexToRemove));

    const nextStep = () => setCurrentStep(prev => prev + 1);
    const prevStep = () => setCurrentStep(prev => prev - 1);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmissionStatus({ message: '', type: '' });
        const { applicant_name, ...application_data } = formData;
        const submissionData = new FormData();
        submissionData.append('applicant_name', applicant_name);
        submissionData.append('application_data_json', JSON.stringify(application_data));
        documents.forEach(doc => submissionData.append('documents', doc));
        try {
            const response = await fetch('http://127.0.0.1:8000/applications/submit', { method: 'POST', body: submissionData });
            const result = await response.json();
            if (!response.ok) throw new Error(result.detail || 'An unknown error occurred.');
            onApplicationSubmit(result.application_id); 
        } catch (error) {
            setSubmissionStatus({ message: `Submission failed: ${error.message}`, type: 'error' });
            setIsSubmitting(false);
        }
    };
    
    const progress = useMemo(() => ((currentStep - 1) / 4) * 100, [currentStep]);
    const stepTitles = [ { title: 'Personal Information', icon: <UserIcon /> }, { title: 'Employment & Income', icon: <BriefcaseIcon /> }, { title: 'Loan Details', icon: <CashIcon /> }, { title: 'Upload Documents', icon: <DocumentIcon /> }, ];
    const isEmployed = formData.employment_status === 'Employed' || formData.employment_status === 'Self-Employed';
    const isUnemployed = formData.employment_status === 'Unemployed';
    
    return (
        <div className="bg-gray-50 min-h-screen flex items-center justify-center font-sans p-4 antialiased">
            <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl p-8 md:p-12">
                {currentStep < 5 ? (
                    <>
                        <div className="text-center mb-10">
                            <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-2 tracking-tight">Loan Application</h1>
                            <p className="text-gray-500">A secure and straightforward path to your financial goals.</p>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full" style={{ width: `${progress}%`, transition: 'width 0.5s ease-in-out' }}></div>
                        </div>
                        <div className="flex items-center justify-center text-xl font-semibold text-gray-700 mb-8">
                            {stepTitles[currentStep - 1].icon}
                            <span>{stepTitles[currentStep - 1].title}</span>
                        </div>
                        <form onSubmit={handleSubmit}>
                            {currentStep === 1 && (
                                <div>
                                    <FormInput label="Full Name" name="applicant_name" value={formData.applicant_name} onChange={handleChange} placeholder="e.g., Jane Doe" required={true} />
                                    <FormInput label="Date of Birth" name="dob" type="date" value={formData.dob} onChange={handleChange} required={true} />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                                        <FormInput label="Street Address" name="address_street" value={formData.address_street} onChange={handleChange} placeholder="123 Main St" required={true} />
                                        <FormInput label="Apt, Suite, etc." name="address_apt" value={formData.address_apt} onChange={handleChange} placeholder="Unit 7" optional={true} />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                                        <FormInput label="City" name="address_city" value={formData.address_city} onChange={handleChange} placeholder="Anytown" required={true} />
                                        <FormInput label="County" name="address_county" value={formData.address_county} onChange={handleChange} placeholder="Fairfield" required={true} />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                                        <FormSelect label="State" name="address_state" value={formData.address_state} onChange={handleChange} options={usStates} required={true} />
                                        <FormInput label="ZIP Code" name="address_zip" value={formData.address_zip} onChange={handleChange} placeholder="12345" pattern="\d{5}" title="Enter a 5-digit ZIP code" required={true} />
                                    </div>
                                </div>
                            )}
                            {currentStep === 2 && (
                                <div>
                                    <FormSelect label="Employment Status" name="employment_status" value={formData.employment_status} onChange={handleChange} options={['Employed', 'Self-Employed', 'Unemployed', 'Student', 'Retired']} required={true} />
                                    <FormInput 
                                        label="Last 4 Digits of SSN" 
                                        name="ssn_last4" 
                                        type="text" 
                                        value={formData.ssn_last4} 
                                        onChange={handleChange} 
                                        placeholder="1234" 
                                        pattern="\d{4}" 
                                        title="Enter the last 4 digits of your SSN." 
                                        maxLength="4"
                                        required={true}
                                    />
                                    {isEmployed && ( <div className="mt-6 border-t pt-6 border-gray-200"> <FormInput label="Current Employer / Company Name" name="employer" value={formData.employer} onChange={handleChange} placeholder="ABC Corporation" required={isEmployed} /> <FormSelect label="Length of Employment" name="emp_length" value={formData.emp_length} onChange={handleChange} options={['< 1 year', '1 year', '2 years', '3 years', '4 years', '5 years', '6 years', '7 years', '8 years', '9 years', '10+ years']} required={isEmployed} /> <FormInput label="Employer Address" name="employer_address" value={formData.employer_address} onChange={handleChange} placeholder="456 Business Rd, Suite 100" required={isEmployed} /> </div> )}
                                    {isUnemployed && ( <div className="mt-6 border-t pt-6 border-gray-200"> <FormSelect label="Previous Length of Employment" name="emp_length" value={formData.emp_length} onChange={handleChange} options={['< 1 year', '1 year', '2 years', '3 years', '4 years', '5 years', '6 years', '7 years', '8 years', '9 years', '10+ years']} required={isUnemployed} /> </div> )}
                                    <FormInput label="Gross Annual Income ($)" name="annual_inc" type="number" value={formData.annual_inc} onChange={handleChange} placeholder="85000" required={true} /> 
                                    <FormInput label="Total Existing Monthly Debt Payments ($)" name="existing_monthly_debt" type="number" value={formData.existing_monthly_debt} onChange={handleChange} placeholder="e.g., Rent, Car Payments" required={true} /> 
                                </div> 
                            )}
                            {currentStep === 3 && ( 
                                <div> 
                                    <FormInput label="Loan Amount ($)" name="loan_amnt" type="number" value={formData.loan_amnt} onChange={handleChange} placeholder="10000" required={true} /> 
                                    <FormSelect label="Loan Term" name="term" value={formData.term} onChange={handleChange} options={['36 months', '60 months']} required={true} /> 
                                    <FormSelect label="Purpose of Loan" name="purpose" value={formData.purpose} onChange={handleChange} options={loanPurposes} required={true} /> 
                                    <FormSelect label="Home Ownership Status" name="home_ownership" value={formData.home_ownership} onChange={handleChange} options={['RENT', 'OWN', 'MORTGAGE']} required={true} /> 
                                </div> 
                            )}
                            {currentStep === 4 && ( <div> <div className="mb-4 p-4 border-dashed border-2 border-gray-300 rounded-lg text-center"> <label htmlFor="documents" className="cursor-pointer block text-sm font-medium text-indigo-600 mb-1">Click to select files</label> <p className="text-xs text-gray-500 mb-2">Please upload payslips, tax returns, etc. (PDF, PNG, JPG).</p> <input type="file" id="documents" name="documents" onChange={handleFileChange} multiple required={documents.length === 0} className="sr-only" /> </div> {documents.length > 0 && ( <div className="mt-6 border-t pt-4"> <p className="text-sm font-medium text-gray-800 mb-2">Selected files:</p> <ul className="space-y-2"> {documents.map((file, index) => ( <li key={index} className="flex justify-between items-center bg-gray-100 p-3 rounded-lg"> <span className="text-sm text-gray-800 truncate pr-2">{file.name}</span> <button type="button" onClick={() => handleRemoveFile(index)} className="text-red-600 hover:text-red-800 font-bold text-lg">&times;</button> </li> ))} </ul> </div> )} </div> )}
                            
                            <div className="mt-10 flex justify-between items-center">
                                {currentStep > 1 ? (<button type="button" onClick={prevStep} className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-colors">Back</button>) : <div></div>}
                                {currentStep < 4 && (<button type="button" onClick={nextStep} className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:opacity-90 shadow-lg transition-all transform hover:scale-105">Next</button>)}
                                {currentStep === 4 && (<button type="submit" disabled={isSubmitting || documents.length === 0} className="px-8 py-3 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-lg font-semibold hover:opacity-90 shadow-lg disabled:bg-gray-400 disabled:shadow-none disabled:from-gray-400 disabled:to-gray-400 transition-all transform hover:scale-105">{isSubmitting ? 'Submitting...' : 'Submit Application'}</button>)}
                            </div>
                        </form>
                    </>
                ) : (
                    <div className="text-center py-8">
                        {submissionStatus.type === 'success' ? (
                            <>
                                <CheckCircleIcon />
                                <h2 className="text-2xl font-bold text-gray-800 mb-2">Application Received!</h2>
                                <p className="text-gray-600">{submissionStatus.message}</p>
                            </>
                        ) : (
                            <div className="p-4 rounded-md bg-red-100 text-red-800">
                                <h2 className="font-bold mb-2">Submission Failed</h2>
                                <p>{submissionStatus.message}</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

const ConfigurationsView = ({ onSwitchView }) => {
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
        const parsedValue = name.includes('grade') || name.includes('verification_status') ? value : parseFloat(value);
        setSettings(prev => ({...prev, [section]: { ...prev[section], [key]: parsedValue }}));
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
                            <SettingsInput label="Approve Below (Probability)" name="decision_thresholds.approve_below" value={settings.decision_thresholds?.approve_below} onChange={handleChange} step="0.01" />
                            <SettingsInput label="Decline Above (Probability)" name="decision_thresholds.decline_above" value={settings.decision_thresholds?.decline_above} onChange={handleChange} step="0.01" />
                        </div>
                    </div>
                    <div className="border-t pt-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">System-Wide Defaults</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <SettingsInput label="Default Interest Rate (%)" name="mock_data_defaults.int_rate" value={settings.mock_data_defaults?.int_rate} onChange={handleChange} />
                        </div>
                    </div>
                    <button onClick={handleSave} className="w-full mt-4 px-4 py-3 bg-indigo-600 text-white rounded-lg font-semibold">Save Configuration</button>
                    {status && <p className="text-center mt-4 text-sm text-gray-600">{status}</p>}
                </div>
            </div>
        </div>
    );
};

const UnderwriterDashboard = () => {
    const [selectedApplicationId, setSelectedApplicationId] = useState(null);
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchApps = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch('http://127.0.0.1:8000/applications/inbox');
            if (!response.ok) throw new Error('Network response was not ok.');
            const data = await response.json();
            setApplications(data);
        } catch (error) {
            setError('Connection failed. Please ensure the backend API server is running.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchApps();
    }, [fetchApps]);

    const handleBackAndRefresh = () => {
        setSelectedApplicationId(null);
        fetchApps(); 
    };

    if (loading) return <div className="text-center p-8">Loading Dashboard...</div>;
    if (error) return <div className="text-center p-8 text-red-600">Error: {error}</div>;

    return (
        <div className="bg-gray-100 min-h-screen font-sans p-8">
            <div className="max-w-7xl mx-auto">
                <header className="mb-8">
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Underwriter Dashboard</h1>
                    <p className="text-gray-500 mt-2">Review and process incoming loan applications.</p>
                </header>
                <main>
                    {selectedApplicationId ? (
                        <ApplicationDetail applicationId={selectedApplicationId} onBack={handleBackAndRefresh} />
                    ) : (
                        <ApplicationInbox onSelectApplication={setSelectedApplicationId} applications={applications} />
                    )}
                </main>
            </div>
        </div>
    );
};

const ApplicationInbox = ({ onSelectApplication, applications }) => {
    const [activeTab, setActiveTab] = useState('review');
    
    const filteredApps = {
        review: applications.filter(app => app.status === 'Pending Manual Review' || app.status === 'Error during AI Processing' || app.status === 'Submitted'),
        approved: applications.filter(app => app.decision === 'Approved'),
        declined: applications.filter(app => app.decision === 'Rejected'),
        completed: applications.filter(app => app.status && app.status.startsWith('Completed')),
    };

    const ReferralFlag = ({ source }) => {
        if (!source) return null;
        const isFromApproval = source.includes('Approved');
        const colorClasses = isFromApproval ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800";
        return <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-md ${colorClasses}`}>{source}</span>;
    };

    const renderTable = (apps) => {
        if (!apps || apps.length === 0) {
            return <div className="text-center p-8 bg-white shadow-md rounded-lg">No applications in this queue.</div>;
        }
        return (
            <div className="bg-white shadow-md rounded-lg overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applicant Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted At</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {apps.map(app => (
                            <tr key={app.id} onClick={() => onSelectApplication(app.id)} className="hover:bg-gray-100 cursor-pointer">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{app.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{app.applicant_name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{new Date(app.submitted_at).toLocaleString('en-US', { timeZone: 'America/New_York', dateStyle: 'short', timeStyle: 'short' })}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                        app.status === 'Pending Manual Review' ? 'bg-orange-100 text-orange-800' :
                                        app.status.includes('Approved') ? 'bg-green-100 text-green-800' : 
                                        app.status.includes('Declined') || app.status.includes('Rejected') ? 'bg-red-100 text-red-800' : 
                                        'bg-yellow-100 text-yellow-800'}`
                                    }>{app.status}</span>
                                    <ReferralFlag source={app.referral_source} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center"><InboxIcon /> Application Inbox</h2>
            <div className="border-b border-gray-200 mb-4">
                <nav className="flex flex-wrap space-x-2" aria-label="Tabs">
                    <TabButton active={activeTab === 'review'} onClick={() => setActiveTab('review')}>Needs Review ({filteredApps.review.length})</TabButton>
                    <TabButton active={activeTab === 'approved'} onClick={() => setActiveTab('approved')}>AI Approved ({filteredApps.approved.length})</TabButton>
                    <TabButton active={activeTab === 'declined'} onClick={() => setActiveTab('declined')}>AI Declined ({filteredApps.declined.length})</TabButton>
                    <TabButton active={activeTab === 'completed'} onClick={() => setActiveTab('completed')}>Completed ({filteredApps.completed.length})</TabButton>
                </nav>
            </div>
            {renderTable(filteredApps[activeTab])}
        </div>
    );
};


// In src/App.jsx, replace the entire ApplicationDetail component with this:

const ApplicationDetail = ({ applicationId, onBack }) => {
    const [application, setApplication] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('ai_analysis');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchDetails = async () => {
            setLoading(true);
            try {
                const response = await fetch(`http://127.0.0.1:8000/applications/${applicationId}`);
                if (!response.ok) throw new Error('Failed to fetch application details.');
                const data = await response.json();
                setApplication(data);
            } catch (err) {
                setError('Connection failed. Please ensure the backend API server is running.');
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [applicationId]);

    const handleReviewSubmit = async (decision) => {
        setIsSubmitting(true);
        try {
            await fetch(`http://127.0.0.1:8000/applications/${applicationId}/review?final_decision=${decision}`, { method: 'POST' });
            onBack();
        } catch (err) {
            alert(`Failed to submit review: ${err.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handleSendToReview = async () => {
        setIsSubmitting(true);
        try {
            const source = application.decision;
            await fetch(`http://127.0.0.1:8000/applications/${applicationId}/request_manual_review?source=${source}`, { method: 'POST' });
            onBack();
        } catch (err) { 
            alert(`Failed to move to review queue: ${err.message}`);
        } finally { 
            setIsSubmitting(false); 
        }
    };

    const explanationData = useMemo(() => {
        if (!application || !application.explanation) {
            return { error: "Explanation data is not available yet. The AI might still be processing." };
        }
        try {
            return typeof application.explanation === 'string' 
                ? JSON.parse(application.explanation) 
                : application.explanation;
        } catch (e) {
            return { error: "Failed to parse the explanation data from the server." };
        }
    }, [application]);

    const groupedData = useMemo(() => {
        if (!application || !application.application_data) return {};
        
        const allData = application.application_data;
        
        const applicant = {
            "DOB": allData.dob || 'N/A',
            "SSN (Last 4)": allData.ssn_last4 || 'N/A',
            "Address": `${allData.address_street || ''}, ${allData.address_city || ''}, ${allData.address_state || ''} ${allData.address_zip || ''}`,
            "Home Ownership": allData.home_ownership || 'N/A',
        };
        
        const employment = {
            "Status": allData.employment_status || 'N/A',
            "Employer": allData.employer || 'N/A',
            "Length": allData.emp_length || 'N/A',
            "Annual Income": `$${Number(allData.annual_inc || 0).toLocaleString()}`,
        };
        
        const creditBureau = {
            "FICO Score Range": `${allData.fico_range_low || 'N/A'} - ${allData.fico_range_high || 'N/A'}`,
            "Inquiries (6m)": allData.inquiries_6m ?? 'N/A',
            "Revolving Balance": `$${Number(allData.revolving_balance || allData.revol_bal || 0).toLocaleString()}`,
            "Revolving Utilization": `${allData.revolving_utilization || allData.revol_util || 0}%`,
            "Delinquencies (2y)": allData.delinquencies_2y ?? 'N/A',
            "Bankruptcies": allData.public_record_bankruptcies ?? 'N/A',
        };
        
        const loanDetails = {
            "Requested Amount": `$${Number(allData.loan_amnt || 0).toLocaleString()}`,
            "Term": allData.term || 'N/A',
            "Purpose": allData.purpose || 'N/A',
            "Calculated DTI": `${allData.dti || 0}%`,
            "Calculated Installment": `$${allData.installment || 0}`,
        };
        
        return { applicant, employment, creditBureau, loanDetails };
    }, [application]);

    if (loading) return <div className="text-center p-8">Loading application details...</div>;
    if (error) return <div className="text-center p-8 text-red-600">Error: {error}</div>;
    if (!application) return null;

    const isFinalDecisionMade = application.status && application.status.startsWith('Completed');
    const aiDecision = application.decision;
    
    const getRecommendationStyle = (label = "") => {
        if (label.includes('Approved')) return 'bg-green-100 text-green-800';
        if (label.includes('Rejected')) return 'bg-red-100 text-red-800';
        if (label.includes('Leaning Approve')) return 'bg-green-100 text-green-700 border border-green-300';
        if (label.includes('Leaning Decline')) return 'bg-red-100 text-red-700 border border-red-300';
        return 'bg-yellow-100 text-yellow-800';
    };

    return (
        <div>
            <button onClick={onBack} className="mb-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"><BackIcon /> Back to Inbox</button>
            <h2 className="text-3xl font-bold text-gray-800">Application #{application.id} - {application.applicant_name}</h2>
            <p className="text-gray-500 mt-1">Submitted: {new Date(application.submitted_at).toLocaleString('en-US', { timeZone: 'America/New_York', dateStyle: 'medium', timeStyle: 'short' })}</p>
            <div className="mt-6 border-b border-gray-200">
                <nav className="flex space-x-2" aria-label="Tabs"><TabButton active={activeTab === 'ai_analysis'} onClick={() => setActiveTab('ai_analysis')}>AI Analysis</TabButton><TabButton active={activeTab === 'applicant_data'} onClick={() => setActiveTab('applicant_data')}>Applicant Data</TabButton><TabButton active={activeTab === 'documents'} onClick={() => setActiveTab('documents')}>Documents</TabButton></nav>
            </div>
            <div className="mt-6">
                {activeTab === 'ai_analysis' && (
                    <div className="bg-white shadow-md rounded-lg p-8">
                        {explanationData && !explanationData.error ? (
                            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                                <div className="lg:col-span-2 flex flex-col items-center justify-center p-6 lg:border-r border-gray-200">
                                    <h3 className="text-xl font-semibold text-gray-800 mb-2">AI Recommendation</h3>
                                    <div className={`px-6 py-2 rounded-full text-xl font-bold mb-8 ${getRecommendationStyle(explanationData.recommendation_label)}`}>
                                        {explanationData.recommendation_label || 'Processing...'}
                                    </div>
                                    <RiskGauge score={explanationData.risk_score} />
                                </div>
                                <div className="lg:col-span-3 p-6">
                                    <h3 className="text-xl font-semibold text-gray-800 mb-4">AI Narrative Summary</h3>
                                    <p className="text-sm text-gray-600 mb-8 leading-relaxed" dangerouslySetInnerHTML={{ __html: (explanationData.summary || "").replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}></p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <FactorsChart title="Factors Increasing Risk" factors={explanationData.positive_factors} colorClass="bg-red-400" />
                                        <FactorsChart title="Factors Decreasing Risk" factors={explanationData.negative_factors} colorClass="bg-green-400" />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center p-8 text-gray-600">
                                <h3 className="font-bold text-lg mb-2">Analysis Not Available</h3>
                                <p>{explanationData?.error || "The AI analysis could not be displayed."}</p>
                            </div>
                        )}
                        <div className="mt-8 pt-6 border-t flex justify-end space-x-3">
                            {isFinalDecisionMade ? (
                                <button disabled={true} className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-500 bg-gray-100">Decision Submitted</button>
                            ) : (
                                <>
                                    {aiDecision === 'Approved' && (
                                        <>
                                            <button onClick={handleSendToReview} disabled={isSubmitting} className="inline-flex items-center px-4 py-2 border border-yellow-300 text-sm font-medium rounded-md text-yellow-800 bg-white hover:bg-yellow-50 disabled:opacity-50"><FlagIcon /> Send to Manual Review</button>
                                            <button onClick={() => handleReviewSubmit('Approved')} disabled={isSubmitting} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"><ApproveIcon /> Approve Loan</button>
                                        </>
                                    )}
                                    {aiDecision === 'Rejected' && (
                                        <>
                                            <button onClick={handleSendToReview} disabled={isSubmitting} className="inline-flex items-center px-4 py-2 border border-yellow-300 text-sm font-medium rounded-md text-yellow-800 bg-white hover:bg-yellow-50 disabled:opacity-50"><FlagIcon /> Send to Manual Review</button>
                                            <button onClick={() => handleReviewSubmit('Declined')} disabled={isSubmitting} className="inline-flex items-center px-4 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 disabled:opacity-50"><DeclineIcon /> Decline Loan</button>
                                        </>
                                    )}
                                    {aiDecision === 'Manual Review' && (
                                        <>
                                            <button onClick={() => handleReviewSubmit('Declined')} disabled={isSubmitting} className="inline-flex items-center px-4 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 disabled:opacity-50"><DeclineIcon /> Decline Loan</button>
                                            <button onClick={() => handleReviewSubmit('Approved')} disabled={isSubmitting} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"><ApproveIcon /> Approve Loan</button>
                                        </>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                )}
                {activeTab === 'applicant_data' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <DataCard title="Applicant Details" data={groupedData.applicant} />
                        <DataCard title="Employment & Income" data={groupedData.employment} />
                        <DataCard title="Credit Bureau Data" data={groupedData.creditBureau} />
                        <DataCard title="Loan Details & Calculated Metrics" data={groupedData.loanDetails} />
                    </div>
                )}
                {activeTab === 'documents' && (<div className="bg-white shadow-md rounded-lg p-6"><h3 className="text-lg font-medium text-gray-900 mb-4">Uploaded Documents</h3>{application.document_urls && application.document_urls.length > 0 ? <ul className="divide-y divide-gray-200">{application.document_urls.map((url, index) => (<li key={index} className="py-3"><a href={url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800 hover:underline">{url.split('/').pop().substring(37)}</a></li>))}</ul> : <p>No documents uploaded.</p>}</div>)}
            </div>
        </div>
    );
};



// --- Main App Component (View Switcher) ---
export default function App() {
    const [view, setView] = useState('customer');
    const [viewMessage, setViewMessage] = useState('');

    const handleApplicationSubmit = async (appId) => {
        setView('processing');
        setViewMessage('Application submitted. Running AI analysis...');
        
        try {
            const response = await fetch(`http://127.0.0.1:8000/applications/${appId}/process`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.detail || 'AI processing failed on the backend.');
            }

            setViewMessage('AI analysis complete. Loading dashboard...');
            setTimeout(() => {
                setView('underwriter');
            }, 1500);

        } catch (error) {
            alert(`An error occurred during processing: ${error.message}`);
            setView('underwriter');
        }
    };
    
    const renderView = () => {
        switch (view) {
            case 'customer':
                return <CustomerApplicationForm onApplicationSubmit={handleApplicationSubmit} />;
            case 'configurations':
                return <ConfigurationsView />;
            case 'processing':
                return <ProcessingScreen message={viewMessage} />;
            case 'underwriter':
                return <UnderwriterDashboard />;
            default:
                return <CustomerApplicationForm onApplicationSubmit={handleApplicationSubmit} />;
        }
    };

    return (
        <div>
            <div className="bg-gray-800 text-white p-2 text-center text-xs shadow-md">
                <span className="font-bold">DEV TOGGLE:</span>
                <button onClick={() => setView('customer')} className={`mx-2 px-2 py-1 rounded ${view === 'customer' ? 'bg-indigo-500' : 'bg-gray-600'}`}>Customer</button>
                <button onClick={() => setView('configurations')} className={`mx-2 px-2 py-1 rounded ${view === 'configurations' ? 'bg-indigo-500' : 'bg-gray-600'}`}>Config</button>
                <button onClick={() => setView('underwriter')} className={`mx-2 px-2 py-1 rounded ${view === 'underwriter' ? 'bg-indigo-500' : 'bg-gray-600'}`}>Underwriter</button>
            </div>
            {renderView()}
        </div>
    );
}