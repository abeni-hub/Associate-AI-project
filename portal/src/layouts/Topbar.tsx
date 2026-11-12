import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Menu, ChevronRight, ChevronDown, Globe, LogOut, Check } from 'lucide-react';
import { usePortal } from '../context';
import { useLanguage } from '../i18n/i18nContext';
import type { SupportedLanguage } from '../i18n/utils/getLocalized';

export interface TopbarProps {
  onOpenMobile: () => void;
}

const LANGUAGES: Array<{ code: SupportedLanguage; label: string; nativeName: string }> = [
  { code: 'en', label: 'English', nativeName: 'English' },
  { code: 'am', label: 'Amharic', nativeName: 'አማርኛ' },
  { code: 'om', label: 'Afaan Oromoo', nativeName: 'Oromoo' },
];

export const Topbar: React.FC<TopbarProps> = ({ onOpenMobile }) => {
  const portal = usePortal();
  const location = useLocation();
  const { language, setLanguage, t } = useLanguage();
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  // Compute clean breadcrumb from route path
  const pathSegment = location.pathname.split('/')[1] || 'overview';
  const breadcrumbTitle = t(`nav.${pathSegment}`, pathSegment.charAt(0).toUpperCase() + pathSegment.slice(1));

  const user = portal.session?.user || portal.authUser;
  const userName = user?.name || 'System Administrator';
  const userRole = React.useMemo(() => {
    const rawRole = user?.role?.name || (portal.role === 'super' ? 'Super Admin' : portal.role === 'subcity' ? 'Sub-city Admin' : 'Bureau Admin');
    const lower = String(rawRole).toLowerCase();
    if (lower.includes('super')) return t('roles.superAdmin', 'Super Admin');
    if (lower.includes('subcity') || lower.includes('sub-city')) return t('roles.subcityAdmin', 'Sub-city Admin');
    if (lower.includes('bureau')) return t('roles.bureauAdmin', 'Bureau Admin');
    return rawRole;
  }, [user, portal.role, t]);
  const userInitials = userName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'SA';

  const currentLangObj = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];

  return (
    <header className="topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          className="mobile-menu"
          type="button"
          aria-label="Open navigation"
          onClick={onOpenMobile}
        >
          <Menu />
        </button>

        <div className="breadcrumbs">
          <span>{t('common.appTitle', 'CivicLink Ethiopia')}</span>
          <ChevronRight />
          <strong>{breadcrumbTitle}</strong>
        </div>
      </div>

      <div className="topbar-actions" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {/* Language Switcher Pill */}
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={() => setLangMenuOpen((prev) => !prev)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '7px',
              background: '#f0f5f3',
              border: '1px solid #dce7e3',
              color: '#075363',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            <Globe style={{ width: '14px', height: '14px' }} />
            <span>{currentLangObj.nativeName}</span>
            <ChevronDown style={{ width: '13px', height: '13px', opacity: 0.7 }} />
          </button>

          {langMenuOpen && (
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: 'calc(100% + 6px)',
                background: '#ffffff',
                border: '1px solid #dce7e3',
                borderRadius: '8px',
                boxShadow: '0 8px 24px rgba(7, 60, 69, 0.12)',
                padding: '6px',
                minWidth: '150px',
                zIndex: 40,
                display: 'flex',
                flexDirection: 'column',
                gap: '2px',
              }}
            >
              {LANGUAGES.map((l) => {
                const isSelected = l.code === language;
                return (
                  <button
                    key={l.code}
                    type="button"
                    onClick={() => {
                      setLanguage(l.code);
                      setLangMenuOpen(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 10px',
                      borderRadius: '5px',
                      background: isSelected ? '#edf5f2' : 'transparent',
                      color: isSelected ? '#075363' : '#334155',
                      border: 0,
                      fontSize: '12px',
                      fontWeight: isSelected ? 700 : 500,
                      cursor: 'pointer',
                      textAlign: 'left',
                      width: '100%',
                    }}
                  >
                    <span>{l.nativeName} ({l.code.toUpperCase()})</span>
                    {isSelected && <Check style={{ width: '13px', height: '13px', color: '#075363' }} />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Profile Card */}
        <div style={{ position: 'relative' }}>
          <button
            className="profile"
            type="button"
            onClick={() => setProfileMenuOpen((prev) => !prev)}
            aria-label="User menu"
          >
            <span className="avatar">{userInitials}</span>
            <span>
              <b>{userName}</b>
              <small>{userRole}</small>
            </span>
            <ChevronDown />
          </button>

          {profileMenuOpen && (
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: 'calc(100% + 6px)',
                background: '#ffffff',
                border: '1px solid #dce7e3',
                borderRadius: '8px',
                boxShadow: '0 8px 24px rgba(7, 60, 69, 0.12)',
                padding: '8px 10px',
                minWidth: '180px',
                zIndex: 40,
              }}
            >
              <div style={{ paddingBottom: '8px', marginBottom: '6px', borderBottom: '1px solid #edf1ef' }}>
                <b style={{ display: 'block', fontSize: '12px', color: '#123f46' }}>{userName}</b>
                <small style={{ color: '#7c8e89', fontSize: '10.5px' }}>{user?.email || 'officer@government.et'}</small>
              </div>
              <button
                type="button"
                onClick={() => {
                  setProfileMenuOpen(false);
                  portal.signOut();
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  width: '100%',
                  padding: '7px 8px',
                  borderRadius: '5px',
                  border: 0,
                  background: 'transparent',
                  color: '#991b1b',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <LogOut style={{ width: '14px', height: '14px' }} />
                <span>{t('nav.signOut', 'Sign out')}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

