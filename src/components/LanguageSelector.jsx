import { useLanguage } from '@/i18n/LanguageProvider';

const LanguageSelector = () => {
  const { language, setLanguage } = useLanguage();

  const languages = [
    { code: 'pt', label: 'PT' },
    { code: 'en', label: 'EN' },
    { code: 'es', label: 'ES' }
  ];

  return (
    <div
      className="inline-flex items-center rounded-full p-0.5"
      style={{ background: '#FFFFFF', border: '1px solid rgba(15,27,42,0.10)' }}
    >
      {languages.map(lang => {
        const active = language === lang.code;
        return (
          <button
            key={lang.code}
            onClick={() => setLanguage(lang.code)}
            className="font-mono text-[11px] font-bold tracking-wider transition-colors rounded-full"
            style={{
              padding: '5px 12px',
              background: active ? '#2F5C44' : 'transparent',
              color: active ? '#FFFFFF' : '#5C6B7A',
            }}
          >
            {lang.label}
          </button>
        );
      })}
    </div>
  );
};

export default LanguageSelector;
