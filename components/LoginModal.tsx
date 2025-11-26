import React, { useState, useEffect } from 'react';
import { User } from '../types';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: User) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLogin }) => {
  const [activeTab, setActiveTab] = useState<'PHONE' | 'WECHAT'>('PHONE');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [code, setCode] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [qrScanned, setQrScanned] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Reset state when opening
      setPhoneNumber('');
      setCode('');
      setCountdown(0);
      setQrScanned(false);
      setActiveTab('PHONE');
    }
  }, [isOpen]);

  useEffect(() => {
    let timer: number;
    if (countdown > 0) {
      timer = window.setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  // Simulate WeChat QR Scan
  useEffect(() => {
    let timer: number;
    if (isOpen && activeTab === 'WECHAT' && !qrScanned) {
      // Simulate scan after 3 seconds
      timer = window.setTimeout(() => {
        setQrScanned(true);
        // Auto login after scan
        setTimeout(() => {
             const mockUser: User = {
                name: "微信用户_" + Math.floor(Math.random() * 1000),
                avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
             };
             onLogin(mockUser);
        }, 1500);
      }, 3000);
    }
    return () => clearTimeout(timer);
  }, [isOpen, activeTab, qrScanned, onLogin]);

  if (!isOpen) return null;

  const handleSendCode = () => {
    if (!phoneNumber || phoneNumber.length !== 11) {
      alert("请输入有效的11位手机号");
      return;
    }
    setCountdown(60);
    // Simulate SMS sent
    alert("验证码已发送: 123456");
  };

  const handlePhoneLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber || !code) return;
    
    if (code !== '123456') {
      alert("验证码错误 (测试码: 123456)");
      return;
    }

    const mockUser: User = {
      name: `用户_${phoneNumber.substring(7)}`,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${phoneNumber}`
    };
    onLogin(mockUser);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fadeInScale">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="p-8">
           <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-white mb-8">
             登录 Nicole单词通
           </h2>

           {/* Tabs */}
           <div className="flex border-b border-gray-200 dark:border-gray-700 mb-8">
             <button
               className={`flex-1 pb-4 text-sm font-medium transition-all ${
                 activeTab === 'PHONE' 
                   ? 'text-primary dark:text-indigo-400 border-b-2 border-primary dark:border-indigo-400' 
                   : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
               }`}
               onClick={() => setActiveTab('PHONE')}
             >
               手机验证码
             </button>
             <button
               className={`flex-1 pb-4 text-sm font-medium transition-all ${
                 activeTab === 'WECHAT' 
                   ? 'text-green-600 dark:text-green-400 border-b-2 border-green-600 dark:border-green-400' 
                   : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
               }`}
               onClick={() => setActiveTab('WECHAT')}
             >
               微信扫码
             </button>
           </div>

           {/* Phone Login Form */}
           {activeTab === 'PHONE' && (
             <form onSubmit={handlePhoneLogin} className="space-y-5">
               <div>
                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">手机号</label>
                 <div className="relative">
                   <span className="absolute left-3 top-3 text-gray-500">+86</span>
                   <input
                     type="tel"
                     className="w-full pl-12 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary dark:bg-gray-700 dark:text-white transition-all"
                     placeholder="请输入手机号"
                     value={phoneNumber}
                     onChange={(e) => setPhoneNumber(e.target.value)}
                     maxLength={11}
                   />
                 </div>
               </div>

               <div>
                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">验证码</label>
                 <div className="flex gap-3">
                   <input
                     type="text"
                     className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary dark:bg-gray-700 dark:text-white transition-all"
                     placeholder="测试码: 123456"
                     value={code}
                     onChange={(e) => setCode(e.target.value)}
                     maxLength={6}
                   />
                   <button
                     type="button"
                     disabled={countdown > 0}
                     onClick={handleSendCode}
                     className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                       countdown > 0
                         ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                         : 'bg-primary/10 text-primary dark:text-indigo-400 hover:bg-primary/20'
                     }`}
                   >
                     {countdown > 0 ? `${countdown}s 后重发` : '获取验证码'}
                   </button>
                 </div>
               </div>

               <button
                 type="submit"
                 className="w-full py-3 bg-primary dark:bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-500 shadow-md hover:shadow-lg transition-all active:scale-95 mt-4"
               >
                 登 录
               </button>
             </form>
           )}

           {/* WeChat Login */}
           {activeTab === 'WECHAT' && (
             <div className="flex flex-col items-center justify-center py-4">
               {!qrScanned ? (
                 <>
                   <div className="w-48 h-48 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center mb-4 border-2 border-gray-200 dark:border-gray-600 relative overflow-hidden group">
                      {/* Simulated QR Code Pattern */}
                      <svg className="w-40 h-40 text-gray-800 dark:text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M3 3h6v6H3V3zm2 2v2h2V5H5zm8-2h6v6h-6V3zm2 2v2h2V5H5zm-2 8h6v6h-6v-6zm2 2v2h2v-2h-2zM3 13h6v6H3v-6zm2 2v2h2v-2H5z" />
                          <path d="M10 3h2v2h-2V3zm0 4h2v2h-2V7zm-2 4h2v2H8v-2zm4 0h2v2h-2v-2zm-4 4h2v2H8v-2zm4 0h2v2h-2v-2z" opacity="0.5" />
                      </svg>
                      {/* Scan Line Animation */}
                      <div className="absolute top-0 left-0 w-full h-1 bg-green-500 shadow-[0_0_10px_#10B981] animate-[scan_2s_linear_infinite]"></div>
                   </div>
                   <p className="text-sm text-gray-500 dark:text-gray-400">
                     请使用微信扫一扫登录 <br/> (模拟: 3秒后自动登录)
                   </p>
                 </>
               ) : (
                 <div className="flex flex-col items-center animate-fade-in">
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600 dark:text-green-400 mb-4">
                       <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                       </svg>
                    </div>
                    <p className="font-bold text-gray-800 dark:text-white text-lg">扫描成功</p>
                    <p className="text-sm text-gray-500">正在进入...</p>
                 </div>
               )}
             </div>
           )}
        </div>
      </div>
      
      <style>{`
        @keyframes scan {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}</style>
    </div>
  );
};