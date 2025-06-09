import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button'; // Assuming Button component exists
import { Globe } from 'lucide-react'; // Optional: for an icon

const languages = [
  { code: 'en', name: 'English' },
  { code: 'my', name: 'မြန်မာ' }, // Burmese
];

const LanguageSwitcher: React.FC = () => {
  const { i18n, t } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="flex items-center space-x-1">
      {/* Optional: Icon for language switcher */}
      {/* <Globe className="w-5 h-5 text-muted-foreground" /> */}

      {languages.map((lang) => (
        <Button
          key={lang.code}
          variant={i18n.resolvedLanguage === lang.code ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => changeLanguage(lang.code)}
          className={`font-medium ${i18n.resolvedLanguage === lang.code ? 'ring-2 ring-primary ring-offset-background ring-offset-2' : ''}`}
          aria-current={i18n.resolvedLanguage === lang.code ? 'page' : undefined}
        >
          {/* Display native name for selection, or use t(lang.code) if you have keys for language names */}
          {lang.name}
        </Button>
      ))}
    </div>
  );
};

export default LanguageSwitcher;
