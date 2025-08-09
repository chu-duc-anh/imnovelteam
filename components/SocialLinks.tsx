
import React from 'react';

const SocialLinks: React.FC = () => {
  const iconBaseStyle = "w-12 h-12 rounded-full flex items-center justify-center text-white transition-transform duration-300 ease-in-out transform hover:-translate-y-1 shadow-lg";

  return (
    <div className="p-4">
      <h3 className="font-serif text-xl font-bold text-primary-800 dark:text-primary-100 text-center mb-4">
        Follow Us
      </h3>
      <div className="flex justify-center items-center space-x-4">
        {/* Facebook */}
        <a
          href="https://www.facebook.com/buntom.0409/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Follow us on Facebook"
          className={`${iconBaseStyle} bg-[#3b5998] hover:shadow-xl`}
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v2.385z" />
          </svg>
        </a>

        {/* Twitter */}
        <button
          disabled
          aria-label="Follow us on Twitter (coming soon)"
          className={`${iconBaseStyle} bg-[#1da1f2] cursor-not-allowed opacity-70`}
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616v.064c0 2.296 1.634 4.208 3.803 4.649-.6.164-1.248.203-1.86.084.608 1.923 2.368 3.267 4.448 3.306-1.724 1.348-3.883 2.083-6.162 2.083-.397 0-.79-.023-1.175-.068 2.226 1.433 4.872 2.274 7.748 2.274 9.294 0 14.377-7.702 14.377-14.377 0-.218-.005-.436-.014-.652.986-.712 1.836-1.604 2.518-2.61z" />
          </svg>
        </button>

        {/* Pinterest */}
        <button
          disabled
          aria-label="Follow us on Pinterest (coming soon)"
          className={`${iconBaseStyle} bg-[#bd081c] cursor-not-allowed opacity-70`}
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 2c-5.522 0-10 4.478-10 10 0 4.072 2.417 7.567 5.862 9.113.064-.469.102-1.38.258-1.956.19-.71.932-3.953.932-3.953.25-.502.155-.932-.34-1.25-1.258-.813-1.543-2.61-1.107-3.91.488-1.458 1.815-2.71 3.44-2.71 1.677 0 2.802 1.253 2.802 2.762 0 1.68-1.077 4.18-1.644 6.51-.462 1.9 1.144 3.43 3.033 3.43 3.633 0 5.882-4.524 5.882-9.458 0-4.08-3.155-7.14-7.232-7.14-5.012 0-8.24 3.784-8.24 7.954 0 1.54.544 3.17 1.233 4.058.134.172.164.248.114.432-.047.172-.153.607-.197.778-.057.21-.24.288-.45.19-1.67-1.1-2.65-3.14-2.65-5.46 0-3.9 3.32-8.48 9.38-8.48 5.12 0 8.78 3.54 8.78 7.9 0 5.25-3.23 9.17-7.74 9.17-1.54 0-3.02-.79-3.52-1.68 0 0-.78 3.13-.97 3.91-.25.98-.94 1.88-1.45 2.434.8.212 1.62.327 2.46.327 5.522 0 10-4.478 10-10s-4.478-10-10-10z" />
          </svg>
        </button>

        {/* Telegram */}
        <button
          disabled
          aria-label="Join our Telegram (coming soon)"
          className={`${iconBaseStyle} bg-[#0088cc] cursor-not-allowed opacity-70`}
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm7.653 8.875c-.244 1.137-.77 4.04-1.082 5.518-.31 1.472-.615 1.956-.916 1.986-.3.028-.66-.207-.98-.415-1.03-1.03-1.61-1.58-2.58-2.472-.97-.893-.47-1.39.29-2.23.47-.52.88-1.55 1.34-2.42.58-1.12.28-1.66-.46-1.66-1.03 0-2.31.85-3.26 1.55-1.51 1.11-2.22 1.55-2.92 1.52-.69-.03-1.78-.31-2.63-.58-.85-.27-1.53-.41-1.48-.87.05-.46.38-.91.99-1.37.95-.71 3.19-2.21 4.54-2.95 2.15-1.17 3.25-1.4 3.93-1.4.45 0 .81.14 1.02.43.21.29.23.68.16 1.14z" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default SocialLinks;
