import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Icon } from '../components/Icon';
import { usePortal } from '../hooks/usePortal';
import { useLanguage, getLocalizedText, type SupportedLanguage } from '../i18n';
import type { RoleKey } from '../../../types/portal.types';

export interface TopbarProps {
  role?: RoleKey | string;
  onMenu?: () => void;
  onLogout?: () => void;
  onOpenMobile?: () => void;
}

const LANGUAGES: Array<{ code: SupportedLanguage; label: string; nativeName: string }> = [
  { code: 'en', label: 'English', nativeName: 'English' },
  { code: 'am', label: 'Amharic', nativeName: 'አማርኛ' },
  { code: 'om', label: 'Afaan Oromoo', nativeName: 'Oromoo' },
];

export const Topbar: React.FC<TopbarProps> = ({
  role: propRole,
  onMenu: propOnMenu,
  onLogout: propOnLogout,
  onOpenMobile,
}) => {
  const portal = usePortal();
  const location = useLocation();
  const { language, setLanguage, t } = useLanguage();
  const [profileOpen, setProfileOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
        setLangMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const role = (propRole || portal.role || 'super') as RoleKey;
  const onMenu = onOpenMobile || propOnMenu || (() => portal.setMobileOpen(true));
  const onLogout = propOnLogout || portal.signOut;

  const pathSegment = location.pathname.split('/')[1] || 'overview';
  const breadcrumbTitle = t(`nav.${pathSegment}`, pathSegment.charAt(0).toUpperCase() + pathSegment.slice(1));

  const user = portal.session?.user || portal.authUser;
  const displayName = (typeof user?.name === 'string' ? user.name : getLocalizedText(user?.name, language)) || 'Administrator';
  const displayOrg = (typeof user?.organization?.name === 'string' ? user.organization.name : getLocalizedText(user?.organization?.name, language)) || 'CivicLink Ethiopia';
  const displayRole = useMemo(() => {
    const localizedRoleName = getLocalizedText(user?.role?.name, language) || (typeof user?.role?.name === 'string' ? user?.role?.name : '');
    const rawRole =
      localizedRoleName ||
      (role === 'super' ? 'Super Admin' : role === 'subcity' ? 'Sub-City Admin' : 'Bureau Admin');
    const lower = String(rawRole).toLowerCase();
    if (lower.includes('super')) return t('roles.superAdmin', 'Super Admin');
    if (lower.includes('subcity') || lower.includes('sub-city')) return t('roles.subcityAdmin', 'Sub-city Admin');
    if (lower.includes('bureau')) return t('roles.bureauAdmin', 'Bureau Admin');
    return rawRole;
  }, [user, role, t, language]);

  const initials = displayName
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'AD';

  const currentLangObj = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];

  return (
    <header className="topbar" ref={headerRef}>
      <div className="topbar-left" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button className="mobile-menu" onClick={onMenu} type="button" aria-label="Open navigation">
          <Icon name="menu" />
        </button>
        <div className="breadcrumb">
          <span>{displayOrg.split(' · ')[0]}</span>
          <Icon name="chevron" size={13} />
          <b>{breadcrumbTitle}</b>
        </div>
      </div>

      <div className="topbar-tools" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {/* Language Switcher Dropdown */}
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
            <Icon name="world" size={14} />
            <span>{currentLangObj.nativeName}</span>
            <Icon name="chevron" size={13} />
          </button>

          {langMenuOpen && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 6px)',
                right: 0,
                background: '#ffffff',
                border: '1px solid #dce7e3',
                borderRadius: '8px',
                boxShadow: '0 8px 24px rgba(7, 83, 99, 0.12)',
                padding: '4px',
                minWidth: '150px',
                zIndex: 60,
              }}
            >
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => {
                    setLanguage(lang.code);
                    setLangMenuOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    padding: '8px 10px',
                    border: 'none',
                    borderRadius: '5px',
                    background: language === lang.code ? '#eef5f2' : 'transparent',
                    color: language === lang.code ? '#075363' : '#334155',
                    fontSize: '12px',
                    fontWeight: language === lang.code ? 700 : 500,
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <span>{lang.nativeName} ({lang.code.toUpperCase()})</span>
                  {language === lang.code && <Icon name="check" size={13} />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Profile Popover */}
        <div className="profile-anchor">
          <button
            className="top-profile"
            onClick={() => setProfileOpen(!profileOpen)}
            type="button"
          >
            <span className="avatar small-avatar">{initials}</span>
            <span>
              <b>{displayName}</b>
              <small>{displayRole}</small>
            </span>
            <Icon name="chevron" size={14} />
          </button>
          {profileOpen && (
            <div className="popover profile-popover">
              <div className="profile-popover-heading">
                <span className="avatar">{initials}</span>
                <span>
                  <b>{displayName}</b>
                  <small>{displayOrg}</small>
                </span>
              </div>
              <button
                className="popover-link"
                onClick={() => {
                  setProfileOpen(false);
                  onLogout();
                }}
                type="button"
              >
                <Icon name="logout" size={15} /> {t('nav.signOut', 'Sign out')}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Topbar;
