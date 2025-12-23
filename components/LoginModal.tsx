
import React, { useState } from 'react';
import { Lock, X, ArrowRight } from 'lucide-react';

interface LoginModalProps {
    onSuccess: () => void;
    onCancel: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ onSuccess, onCancel }) => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Using Salted Base64 for obfuscation. 
    // This hides the password from plain text search in source code
    // and works in ALL environments (including HTTP/Local Network) where crypto.subtle fails.
    
    // Logic: btoa("EASTIN_SALT_")
    // Result: "RUFTVElOX1NBTFRfYTEyMzQ1Njc="
    const TARGET_TOKEN = "RUFTVElOX1NBTFRfYTEyMzQ1Njc=";

    const checkPassword = (input: string): boolean => {
        try {
            // 1. Add Salt
            const salted = "EASTIN_SALT_" + input;
            // 2. Convert to Base64
            const encoded = btoa(salted);
            // 3. Compare
            return encoded === TARGET_TOKEN;
        } catch (e) {
            return false;
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        // Simulate network delay for better UX feeling
        setTimeout(() => {
            if (checkPassword(password)) {
                onSuccess();
            } else {
                setError('密碼錯誤 (Incorrect Password)');
                setPassword('');
            }
            setIsLoading(false);
        }, 500);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 relative">
                 <button 
                    onClick={onCancel}
                    className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                >
                    <X className="w-6 h-6" />
                </button>

                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Lock className="w-8 h-8 text-blue-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800">員工登入</h2>
                    <p className="text-gray-500 text-sm mt-1">Staff Access Verification</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <input
                            type="password"
                            autoFocus
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                setError('');
                            }}
                            className={`w-full text-center text-2xl tracking-widest p-4 border-2 rounded-xl outline-none focus:ring-4 transition-all ${error ? 'border-red-300 focus:ring-red-100 bg-red-50' : 'border-gray-200 focus:border-blue-500 focus:ring-blue-100'}`}
                            placeholder="••••••••"
                            disabled={isLoading}
                        />
                        {error && <p className="text-center text-red-500 font-bold mt-2 text-sm animate-pulse">{error}</p>}
                    </div>

                    <button 
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold text-lg hover:bg-black transform transition-all active:scale-95 flex items-center justify-center disabled:opacity-50"
                    >
                        {isLoading ? '驗證中...' : (
                            <>解鎖 (Unlock) <ArrowRight className="w-5 h-5 ml-2" /></>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginModal;
