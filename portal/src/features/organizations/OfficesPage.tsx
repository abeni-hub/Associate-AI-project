import React from 'react';
import { PageHeading, Icon } from '../shared';
import { OfficeModal } from './components/OfficeModal';
import { useOffices, type UseOfficesOptions } from './hooks/useOffices';
import { OfficeMetrics } from './components/OfficeMetrics';
import { OfficeTable } from './components/OfficeTable';
import type { OfficeItem, OfficeType } from '../../types/portal.types';

export interface OfficesPageProps {
  offices?: OfficeItem[];
  officeTypes?: OfficeType[];
  role?: string;
  onAddOffice?: () => void;
  onEditOffice?: (office: OfficeItem) => void;
  search?: string;
  setSearch?: (search: string) => void;
}

export const OfficesPage: React.FC<OfficesPageProps> = (props) => {
  const {
    role,
    search,
    setSearch,
    selectedTypeId,
    setSelectedTypeId,
    selectedView,
    setSelectedView,
    isOfficeModalOpen,
    setIsOfficeModalOpen,
    selectedOfficeForEdit,
    setSelectedOfficeForEdit,
    orgsLoading,
    isSavingOrg,
    officeTypes,
    offices,
    scopedOffices,
    filtered,
    subcityCount,
    woredaCount,
    bureauCount,
    canCreate,
    canUpdate,
    canDelete,
    isSuperAdmin,
    canAccessOrganization,
    handleOpenAdd,
    handleOpenEdit,
    handleSaveOffice,
    handleDeleteOffice,
  } = useOffices({
    propOffices: props.offices,
    propOfficeTypes: props.officeTypes,
    propRole: props.role,
    onAddOffice: props.onAddOffice,
    onEditOffice: props.onEditOffice,
    propSearch: props.search,
    propSetSearch: props.setSearch,
  });

  return (
    <>
      <PageHeading
        eyebrow="PUBLIC ADMINISTRATION DIRECTORY"
        title={role === 'subcity' ? 'Bureaus & local offices' : 'Offices & administrative tree'}
        subtitle="Manage sub-cities, bureaus, and municipal branches connected to the platform."
        action={canCreate ? 'Add office' : undefined}
        onAction={canCreate ? handleOpenAdd : undefined}
        secondary="Export directory"
        onSecondary={() => window.alert('Office directory report generated.')}
      />

      <OfficeMetrics
        isLoading={orgsLoading}
        totalCount={scopedOffices.length}
        subcityCount={subcityCount}
        woredaCount={woredaCount}
        bureauCount={bureauCount}
      />

      <OfficeTable
        offices={offices}
        officeTypes={officeTypes}
        scopedOffices={scopedOffices}
        filtered={filtered}
        isLoading={orgsLoading}
        search={search}
        onSearchChange={setSearch}
        selectedTypeId={selectedTypeId}
        onSelectedTypeIdChange={setSelectedTypeId}
        selectedView={selectedView}
        onSelectedViewChange={setSelectedView}
        canUpdate={canUpdate}
        canDelete={canDelete}
        isSuperAdmin={isSuperAdmin}
        canAccessOrganization={canAccessOrganization}
        onOpenEdit={handleOpenEdit}
        onDeleteOffice={handleDeleteOffice}
      />

      <div className="tip-banner">
        <span className="tip-icon">
          <Icon name="shield" size={17} />
        </span>
        <span>
          <b>Hierarchical authorization applies automatically</b>
          <small>
            Admins assigned to a parent office can oversee and coordinate the service guides of all
            child bureaus.
          </small>
        </span>
      </div>

      <OfficeModal
        isOpen={isOfficeModalOpen}
        office={selectedOfficeForEdit}
        officeTypes={officeTypes}
        offices={offices}
        onClose={() => {
          setIsOfficeModalOpen(false);
          setSelectedOfficeForEdit(null);
        }}
        onSave={handleSaveOffice}
        isLoading={isSavingOrg}
      />
    </>
  );
};

export default OfficesPage;
