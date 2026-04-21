import React from 'react';

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const FormInput: React.FC<FormInputProps> = ({ label, error, ...props }) => {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-1">{label}</label>
      <input 
        {...props}
        className={`w-full bg-white/5 border ${error ? 'border-red-500/50' : 'border-white/10'} rounded-2xl py-4 px-6 text-sm font-bold text-white focus:ring-2 ring-blue-500/20 outline-none transition-all placeholder:text-white/10`}
      />
      {error && <p className="text-[9px] font-bold text-red-500 uppercase tracking-widest ml-1">{error}</p>}
    </div>
  );
};
