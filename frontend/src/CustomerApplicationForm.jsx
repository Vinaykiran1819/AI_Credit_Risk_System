import React, { useState, useMemo } from 'react';

// --- (All helper components and data remain the same) ---
const usStates = ["Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming"];
const loanPurposes = [{ value: 'debt_consolidation', label: 'Debt Consolidation' }, { value: 'credit_card', label: 'Credit Card Refinancing' }, { value: 'home_improvement', label: 'Home Improvement' }, { value: 'major_purchase', label: 'Major Purchase' }, { value: 'other', label: 'Other' }];
const UserIcon = () => <svg xmlns="http://www.w.org/2000/svg" className="h-6 w-6 mr-3 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
const BriefcaseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
const CashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
const DocumentIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01. seventh.293l5.414 5.414a1 1 0 01.293. seventhV19a2 2 0 01-2 2z" /></svg>;
const CheckCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-green-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const FormInput = ({ label, name, type = "text", value, onChange, required = true, pattern, title, placeholder, optional = false, maxLength }) => ( <div className="mb-6"> <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1"> {label} {optional && <span className="text-gray-500">(Optional)</span>} </label> <input type={type} id={name} name={name} value={value} onChange={onChange} required={required && !optional} pattern={pattern} title={title} placeholder={placeholder} maxLength={maxLength} className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out" /> </div> );
const FormSelect = ({ label, name, value, onChange, options, required = true }) => ( <div className="mb-6"> <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label}</label> <select id={name} name={name} value={value} onChange={onChange} required={required} className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out" > <option value="">Select an option</option> {options.map(option => ( <option key={option.value || option} value={option.value || option}> {option.label || option} </option> ))} </select> </div> );

export default function CustomerApplicationForm({ onApplicationSubmit }) {
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        // --- 1. ADDED ssn_last4 to the initial state ---
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
            
            // This now triggers the parent component's handler which should
            // now navigate to the inbox or a processing view.
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
                            {currentStep === 1 && ( <div> <FormInput label="Full Name" name="applicant_name" value={formData.applicant_name} onChange={handleChange} placeholder="e.g., Jane Doe" /> <FormInput label="Date of Birth" name="dob" type="date" value={formData.dob} onChange={handleChange} /> <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6"> <FormInput label="Street Address" name="address_street" value={formData.address_street} onChange={handleChange} placeholder="123 Main St" /> <FormInput label="Apt, Suite, etc." name="address_apt" value={formData.address_apt} onChange={handleChange} placeholder="Unit 7" optional={true} /> </div> <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6"> <FormInput label="City" name="address_city" value={formData.address_city} onChange={handleChange} placeholder="Anytown" /> <FormInput label="County" name="address_county" value={formData.address_county} onChange={handleChange} placeholder="Fairfield" /> </div> <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6"> <FormSelect label="State" name="address_state" value={formData.address_state} onChange={handleChange} options={usStates} /> <FormInput label="ZIP Code" name="address_zip" value={formData.address_zip} onChange={handleChange} placeholder="12345" pattern="\d{5}" title="Enter a 5-digit ZIP code" /> </div> </div> )}
                            
                            {currentStep === 2 && ( 
                                <div> 
                                    <FormSelect label="Employment Status" name="employment_status" value={formData.employment_status} onChange={handleChange} options={['Employed', 'Self-Employed', 'Unemployed', 'Student', 'Retired']} />
                                    
                                    {/* --- 2. ADDED the SSN input field here --- */}
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
                                    />

                                    {isEmployed && ( <div className="mt-6 border-t pt-6 border-gray-200"> <FormInput label="Current Employer / Company Name" name="employer" value={formData.employer} onChange={handleChange} placeholder="ABC Corporation" required={isEmployed} /> <FormSelect label="Length of Employment" name="emp_length" value={formData.emp_length} onChange={handleChange} options={['< 1 year', '1 year', '2 years', '3 years', '4 years', '5 years', '6 years', '7 years', '8 years', '9 years', '10+ years']} required={isEmployed} /> <FormInput label="Employer Address" name="employer_address" value={formData.employer_address} onChange={handleChange} placeholder="456 Business Rd, Suite 100" required={isEmployed} /> </div> )}
                                    {isUnemployed && ( <div className="mt-6 border-t pt-6 border-gray-200"> <FormSelect label="Previous Length of Employment" name="emp_length" value={formData.emp_length} onChange={handleChange} options={['< 1 year', '1 year', '2 years', '3 years', '4 years', '5 years', '6 years', '7 years', '8 years', '9 years', '10+ years']} required={isUnemployed} /> </div> )}
                                    
                                    <FormInput label="Gross Annual Income ($)" name="annual_inc" type="number" value={formData.annual_inc} onChange={handleChange} placeholder="85000" /> 
                                    <FormInput label="Total Existing Monthly Debt Payments ($)" name="existing_monthly_debt" type="number" value={formData.existing_monthly_debt} onChange={handleChange} placeholder="e.g., Rent, Car Payments" /> 
                                </div> 
                            )}

                            {currentStep === 3 && ( <div> <FormInput label="Loan Amount ($)" name="loan_amnt" type="number" value={formData.loan_amnt} onChange={handleChange} placeholder="10000" /> <FormSelect label="Loan Term" name="term" value={formData.term} onChange={handleChange} options={['36 months', '60 months']} /> <FormSelect label="Purpose of Loan" name="purpose" value={formData.purpose} onChange={handleChange} options={loanPurposes} /> <FormSelect label="Home Ownership Status" name="home_ownership" value={formData.home_ownership} onChange={handleChange} options={['RENT', 'OWN', 'MORTGAGE']} /> </div> )}
                            {currentStep === 4 && ( <div> <div className="mb-4 p-4 border-dashed border-2 border-gray-300 rounded-lg text-center"> <label htmlFor="documents" className="cursor-pointer block text-sm font-medium text-indigo-600 mb-1">Click to select files</label> <p className="text-xs text-gray-500 mb-2">Please upload payslips, tax returns, etc. (PDF, PNG, JPG).</p> <input type="file" id="documents" name="documents" onChange={handleFileChange} multiple required={documents.length === 0} className="sr-only" /> </div> {documents.length > 0 && ( <div className="mt-6 border-t pt-4"> <p className="text-sm font-medium text-gray-800 mb-2">Selected files:</p> <ul className="space-y-2"> {documents.map((file, index) => ( <li key={index} className="flex justify-between items-center bg-gray-100 p-3 rounded-lg"> <span className="text-sm text-gray-800 truncate pr-2">{file.name}</span> <button type="button" onClick={() => handleRemoveFile(index)} className="text-red-600 hover:text-red-800 font-bold text-lg">&times;</button> </li> ))} </ul> </div> )} </div> )}
                            
                            {submissionStatus.type === 'error' && (
                                <div className="p-4 rounded-md text-center my-4 bg-red-100 text-red-800">
                                    {submissionStatus.message}
                                </div>
                            )}

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
}