import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Users, ArrowRight, Building2 } from 'lucide-react';
import { t, getSavedLang, saveLang, LANGUAGES } from '@/lib/translations';

/**
 * PortalSelect — Role selection screen.
 * Stored in sessionStorage so it clears when the browser tab closes.
 * Choosing one role automatically removes any existing session for the other (mutual exclusion).
 */
export default function PortalSelect() {
  const navigate = useNavigate();
  const [lang, setLang] = React.useState(getSavedLang);

  const handleLangChange = (code) => {
    saveLang(code);
    setLang(code);
  };

  const selectRole = (role) => {
    // Mutual exclusion: clear previous role before setting new one
    sessionStorage.removeItem('yces_portal_role');
    sessionStorage.setItem('yces_portal_role', role);
    navigate(role === 'admin' ? '/admin' : '/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Language Switcher */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center bg-white/10 rounded-lg p-1 gap-1">
            {LANGUAGES.map(({ code, label }) => (
              <button
                key={code}
                onClick={() => handleLangChange(code)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                  lang === code
                    ? 'bg-white text-slate-900'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500 rounded-2xl mb-4 shadow-lg">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">{t('appName', lang)}</h1>
          <p className="text-blue-300 text-sm mt-1">{t('appFull', lang)}</p>
          <div className="mt-3 h-px bg-white/10 mx-8" />
          <p className="text-white/50 text-xs mt-3 uppercase tracking-widest">{t('selectPortal', lang)}</p>
        </div>

        {/* Portal Cards */}
        <div className="space-y-4">
          {/* Citizen Portal */}
          <button
            onClick={() => selectRole('citizen')}
            className="w-full group bg-white/5 hover:bg-blue-500/20 border border-white/10 hover:border-blue-400/50 rounded-2xl p-5 text-left transition-all duration-200"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-500/20 group-hover:bg-blue-500/40 rounded-xl flex items-center justify-center transition-colors">
                  <Users className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-white font-semibold text-base">{t('citizenPortal', lang)}</h2>
                  <p className="text-white/50 text-xs mt-0.5">{t('citizenPortalDesc', lang)}</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-white/30 group-hover:text-blue-400 transition-colors" />
            </div>
          </button>

          {/* Admin Portal */}
          <button
            onClick={() => selectRole('admin')}
            className="w-full group bg-white/5 hover:bg-amber-500/20 border border-white/10 hover:border-amber-400/50 rounded-2xl p-5 text-left transition-all duration-200"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-amber-500/20 group-hover:bg-amber-500/40 rounded-xl flex items-center justify-center transition-colors">
                  <Shield className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <h2 className="text-white font-semibold text-base">{t('adminPortal', lang)}</h2>
                  <p className="text-white/50 text-xs mt-0.5">{t('adminPortalDesc', lang)}</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-white/30 group-hover:text-amber-400 transition-colors" />
            </div>
          </button>
        </div>

        <p className="text-center text-white/25 text-[11px] mt-8">
          {t('oneSessionNote', lang)}
        </p>
      </div>
    </div>
  );
}
