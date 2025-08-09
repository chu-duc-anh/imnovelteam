





import React, { useState, useEffect, useRef, useMemo } from 'react';
import LoadingSpinner from '../LoadingSpinner';
import { authService } from '../../services/authService';
import { User, SiteSetting } from '../../types';
import { toAbsoluteUrl } from '../../utils';

interface AuthViewProps {
  initialMode: 'login' | 'register' | 'forgot' | 'reset';
  resetToken?: string | null;
  onBack: () => void;
  onLoginSuccess: (user: User) => void;
  onRegisterSuccess: (user: User) => void;
  siteSettings: SiteSetting[];
}

const AuthView: React.FC<AuthViewProps> = ({ initialMode, resetToken, onBack, onLoginSuccess, onRegisterSuccess, siteSettings }) => {
  const [mode, setMode] = useState(initialMode);
  
  // Form State
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [registerUsername, setRegisterUsername] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetPasswordState, setResetPasswordState] = useState('');
  const [confirmResetPassword, setConfirmResetPassword] = useState('');

  // Shared State
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  
  // Availability check state
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'unavailable'>('idle');
  const [usernameMessage, setUsernameMessage] = useState<string | null>(null);
  const [emailStatus, setEmailStatus] = useState<'idle' | 'checking' | 'available' | 'unavailable'>('idle');
  const [emailMessage, setEmailMessage] = useState<string | null>(null);
  const debounceTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const authBackgroundUrl = useMemo(() => {
    const setting = siteSettings.find(s => s.key === 'authBackground');
    const url = setting?.value || 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?q=80&w=2670&auto=format&fit=crop';
    return toAbsoluteUrl(url);
  }, [siteSettings]);

  useEffect(() => { 
    if (resetToken) {
        setMode('reset');
    } else {
        setMode(initialMode);
    }
  }, [initialMode, resetToken]);

  useEffect(() => { 
    setError(null); 
    setInfo(null);
  }, [mode]);

  const checkAvailability = (type: 'username' | 'email', value: string) => {
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(async () => {
      if (type === 'username') {
        if (value.length < 3) { setUsernameStatus('idle'); setUsernameMessage(null); return; }
        setUsernameStatus('checking');
        const isAvailable = await authService.checkUsernameAvailability(value);
        setUsernameStatus(isAvailable ? 'available' : 'unavailable');
        setUsernameMessage(isAvailable ? 'Tên đăng nhập có sẵn!' : 'Tên đăng nhập đã được sử dụng.');
      } else { // email
         if (!/^\S+@\S+\.\S+$/.test(value)) { setEmailStatus('idle'); setEmailMessage(null); return; }
        setEmailStatus('checking');
        const isAvailable = await authService.checkEmailAvailability(value);
        setEmailStatus(isAvailable ? 'available' : 'unavailable');
        setEmailMessage(isAvailable ? 'Email có sẵn!' : 'Email đã được sử dụng.');
      }
    }, 500);
  };
  
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setIsLoading(true);
    try {
      const user = await authService.login(loginIdentifier, loginPassword);
      onLoginSuccess(user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
    } finally { setIsLoading(false); }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    if(usernameStatus !== 'available' || emailStatus !== 'available') { setError('Vui lòng sửa các lỗi trước khi gửi.'); return; }
    if (registerPassword.length < 6) { setError("Mật khẩu phải có ít nhất 6 ký tự."); return; }
    if (registerPassword !== confirmPassword) { setError("Mật khẩu không khớp."); return; }
    
    setIsLoading(true);
    try {
      const user = await authService.register(registerUsername, registerEmail, registerPassword);
      onRegisterSuccess(user);
      setMode('login');
      setLoginIdentifier(registerEmail);
      setLoginPassword('');
      setRegisterUsername('');
      setRegisterEmail('');
      setRegisterPassword('');
      setConfirmPassword('');
      setUsernameStatus('idle');
      setEmailStatus('idle');
      setUsernameMessage(null);
      setEmailMessage(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đăng ký thất bại. Vui lòng thử lại.');
    } finally { setIsLoading(false); }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setIsLoading(true);
    try {
        const response = await authService.forgotPassword(forgotEmail);
        setInfo(response.message);
    } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to send reset email.');
    } finally {
        setIsLoading(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetToken) { setError("Invalid or missing reset token."); return; }
    if (resetPasswordState.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (resetPasswordState !== confirmResetPassword) { setError("Passwords do not match."); return; }
    
    setError(null);
    setInfo(null);
    setIsLoading(true);
    try {
        const user = await authService.resetPassword(resetToken, resetPasswordState);
        onLoginSuccess(user); // Automatically log the user in
    } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to reset password.');
    } finally {
        setIsLoading(false);
    }
  };
  
  const formInputClasses = "block w-full px-4 py-3 bg-primary-100 dark:bg-primary-800 border-2 border-primary-200 dark:border-primary-700 rounded-lg text-primary-900 dark:text-primary-100 placeholder-primary-500 focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:bg-white dark:focus:bg-primary-900 transition-colors";
  const availabilityClasses = (status: 'idle' | 'checking' | 'available' | 'unavailable') => {
      switch(status) {
          case 'checking': return 'text-primary-500';
          case 'available': return 'text-green-500';
          case 'unavailable': return 'text-red-500';
          default: return 'hidden';
      }
  };

  const renderLoginRegister = () => (
    <>
      <div className="relative bg-primary-100 dark:bg-primary-800/50 rounded-lg p-1.5 flex mb-8">
        <div className="absolute bg-white dark:bg-primary-900 shadow-lg rounded-md h-[calc(100%-0.75rem)] w-[calc(50%-0.375rem)] transition-transform duration-300 ease-in-out" style={{transform: mode === 'login' ? 'translateX(0%)' : 'translateX(100%)'}}></div>
        <button onClick={() => setMode('login')} className="w-1/2 py-2.5 text-sm font-bold rounded-md transition-colors relative z-10 text-primary-700 dark:text-primary-200">Đăng nhập</button>
        <button onClick={() => setMode('register')} className="w-1/2 py-2.5 text-sm font-bold rounded-md transition-colors relative z-10 text-primary-700 dark:text-primary-200">Đăng ký</button>
      </div>
      <div className="relative h-[28rem] overflow-hidden">
        <div className={`absolute top-0 left-0 w-full transition-transform duration-500 ease-in-out ${mode === 'login' ? 'translate-x-0' : '-translate-x-full'}`}>
          <form onSubmit={handleLoginSubmit} className="space-y-5">
              <div><input type="text" value={loginIdentifier} onChange={e => setLoginIdentifier(e.target.value)} placeholder="Tên đăng nhập hoặc Email" required className={formInputClasses} /></div>
              <div className="relative"><input type={passwordVisible ? 'text' : 'password'} value={loginPassword} onChange={e => setLoginPassword(e.target.value)} placeholder="Mật khẩu" required className={`${formInputClasses} pr-12`} /><button type="button" onClick={() => setPasswordVisible(!passwordVisible)} className="absolute inset-y-0 right-0 flex items-center px-4 text-primary-500">{passwordVisible ? <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C3.732 4.943 7.523 3 10 3s6.268 1.943 9.542 7c-3.274 5.057-7.523 7-9.542 7S3.732 15.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg> : <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 8.517 16.62 7.373 14.863 6.64l-2.073-2.073a1 1 0 00-1.414 0l-1.414-1.414L6.95 3.707 3.707 2.293zM10 12a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /><path d="M10 15a5 5 0 100-10 5 5 0 000 10z" /></svg>}</button></div>
              <div className="text-right -mt-3"><button type="button" onClick={() => setMode('forgot')} className="text-xs font-semibold text-primary-500 hover:text-secondary-500">Quên mật khẩu?</button></div>
              <div><button type="submit" disabled={isLoading} className="w-full bg-secondary-500 hover:bg-secondary-600 text-white font-bold py-3.5 px-4 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-wait">{isLoading ? <LoadingSpinner size="sm" /> : 'Đăng nhập'}</button></div>
          </form>
        </div>
        <div className={`absolute top-0 left-0 w-full transition-transform duration-500 ease-in-out ${mode === 'register' ? 'translate-x-0' : 'translate-x-full'}`}>
          <form onSubmit={handleRegisterSubmit} className="space-y-5">
              <div><input type="text" value={registerUsername} onChange={e => { setRegisterUsername(e.target.value); checkAvailability('username', e.target.value); }} placeholder="Tên đăng nhập" required className={formInputClasses} /><p className={`text-xs mt-1 px-1 ${availabilityClasses(usernameStatus)}`}>{usernameStatus === 'checking' ? <LoadingSpinner size="sm" className="inline w-3 h-3 mr-1" /> : null}{usernameMessage}</p></div>
              <div><input type="email" value={registerEmail} onChange={e => { setRegisterEmail(e.target.value); checkAvailability('email', e.target.value); }} placeholder="Email" required className={formInputClasses} /><p className={`text-xs mt-1 px-1 ${availabilityClasses(emailStatus)}`}>{emailStatus === 'checking' ? <LoadingSpinner size="sm" className="inline w-3 h-3 mr-1" /> : null}{emailMessage}</p></div>
              <div className="relative"><input type={passwordVisible ? 'text' : 'password'} value={registerPassword} onChange={e => setRegisterPassword(e.target.value)} placeholder="Mật khẩu (tối thiểu 6 ký tự)" required className={`${formInputClasses} pr-12`} /><button type="button" onClick={() => setPasswordVisible(!passwordVisible)} className="absolute inset-y-0 right-0 flex items-center px-4 text-primary-500">{passwordVisible ? <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C3.732 4.943 7.523 3 10 3s6.268 1.943 9.542 7c-3.274 5.057-7.523 7-9.542 7S3.732 15.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg> : <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 8.517 16.62 7.373 14.863 6.64l-2.073-2.073a1 1 0 00-1.414 0l-1.414-1.414L6.95 3.707 3.707 2.293zM10 12a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /><path d="M10 15a5 5 0 100-10 5 5 0 000 10z" /></svg>}</button></div>
              <div><input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Xác nhận mật khẩu" required className={formInputClasses} /></div>
              <div><button type="submit" disabled={isLoading || usernameStatus !== 'available' || emailStatus !== 'available'} className="w-full bg-secondary-500 hover:bg-secondary-600 text-white font-bold py-3.5 px-4 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-wait">{isLoading ? <LoadingSpinner size="sm" /> : 'Tạo tài khoản'}</button></div>
          </form>
        </div>
      </div>
    </>
  );

  const renderForgot = () => (
     <form onSubmit={handleForgotSubmit} className="space-y-5 animate-fade-in">
        <div><input type="email" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} placeholder="Nhập địa chỉ email của bạn" required className={formInputClasses} /></div>
        <div><button type="submit" disabled={isLoading} className="w-full bg-secondary-500 hover:bg-secondary-600 text-white font-bold py-3.5 px-4 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-wait">{isLoading ? <LoadingSpinner size="sm" /> : 'Gửi liên kết đặt lại'}</button></div>
        <div className="text-center"><button type="button" onClick={() => setMode('login')} className="text-sm font-semibold text-primary-500 hover:text-secondary-500">&larr; Quay lại Đăng nhập</button></div>
    </form>
  );

  const renderReset = () => (
     <form onSubmit={handleResetSubmit} className="space-y-5 animate-fade-in">
        <div><input type="password" value={resetPasswordState} onChange={e => setResetPasswordState(e.target.value)} placeholder="Mật khẩu mới" required className={formInputClasses} /></div>
        <div><input type="password" value={confirmResetPassword} onChange={e => setConfirmResetPassword(e.target.value)} placeholder="Xác nhận mật khẩu mới" required className={formInputClasses} /></div>
        <div><button type="submit" disabled={isLoading} className="w-full bg-secondary-500 hover:bg-secondary-600 text-white font-bold py-3.5 px-4 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-wait">{isLoading ? <LoadingSpinner size="sm" /> : 'Đặt lại mật khẩu'}</button></div>
        <div className="text-center"><button type="button" onClick={() => setMode('login')} className="text-sm font-semibold text-primary-500 hover:text-secondary-500">&larr; Quay lại Đăng nhập</button></div>
    </form>
  );

  return (
    <div className="min-h-screen bg-primary-50 dark:bg-primary-950 flex animate-fade-in">
        <div className="hidden lg:flex w-1/2 bg-cover bg-center" style={{backgroundImage: `url('${authBackgroundUrl}')`}}>
            <div className="w-full h-full bg-gradient-to-br from-secondary-600/70 to-violet-800/70 backdrop-blur-sm flex flex-col justify-between p-12 text-white">
                <div>
                    <button onClick={onBack} className="font-serif font-bold text-2xl flex items-center space-x-3 group opacity-80 hover:opacity-100 transition-opacity">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 transition-transform group-hover:-translate-x-1"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6-2.292m0 0V3.75m0 16.5a8.966 8.966 0 0 1-6-2.292V3.75a8.966 8.966 0 0 1 6 2.292m0 16.5V7.5m6-3.75h-6" /></svg>
                      <span>IMnovel Team</span>
                    </button>
                </div>
                <div>
                    <h1 className="font-serif text-5xl font-extrabold leading-tight shadow-lg">Mở khóa Vũ trụ Truyện kể.</h1>
                    <p className="mt-4 text-lg text-violet-200 max-w-lg">Tham gia cộng đồng của chúng tôi để đọc và khám phá những thế giới hư cấu vô tận.</p>
                </div>
            </div>
        </div>
        
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
            <div className="w-full max-w-md">
                <div className="text-center lg:text-left mb-10">
                    <h2 className="font-serif text-4xl font-bold text-primary-800 dark:text-primary-100">
                      {mode === 'login' && 'Chào mừng trở lại'}
                      {mode === 'register' && 'Tạo một tài khoản'}
                      {mode === 'forgot' && 'Quên mật khẩu'}
                      {mode === 'reset' && 'Đặt lại mật khẩu'}
                    </h2>
                    <p className="text-primary-500 dark:text-primary-400 mt-2">
                      {mode === 'login' && 'Vui lòng đăng nhập để tiếp tục cuộc phiêu lưu của bạn.'}
                      {mode === 'register' && 'Bắt đầu trong vài giây.'}
                      {mode === 'forgot' && 'Chúng tôi sẽ gửi cho bạn một liên kết để đặt lại mật khẩu.'}
                      {mode === 'reset' && 'Vui lòng nhập mật khẩu mới của bạn.'}
                    </p>
                </div>
                
                {error && <p className="text-red-500 bg-red-100 dark:bg-red-900/50 p-3 rounded-lg text-sm text-center mb-6 w-full animate-fade-in">{error}</p>}
                {info && <p className="text-green-600 bg-green-100 dark:bg-green-900/50 p-3 rounded-lg text-sm text-center mb-6 w-full animate-fade-in">{info}</p>}

                {mode === 'login' || mode === 'register' ? renderLoginRegister() : null}
                {mode === 'forgot' && renderForgot()}
                {mode === 'reset' && renderReset()}
                
                <p className="text-center mt-8 lg:hidden">
                    <button onClick={onBack} className="text-sm font-semibold text-primary-500 hover:text-secondary-500 dark:hover:text-secondary-400 transition-colors">
                        &larr; Quay lại trang chủ
                    </button>
                </p>
            </div>
        </div>
        <style>{`
            @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
            .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
        `}</style>
    </div>
  );
};

export default AuthView;
