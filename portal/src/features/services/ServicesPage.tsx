import React from 'react';
import { PageHeading } from '../shared';
import { ServiceModal } from './components/ServiceModal';
import { ServiceStatsGrid } from './components/ServiceStatsGrid';
import { ServicesToolbar } from './components/ServicesToolbar';
import { ServicesTreeView } from './components/ServicesTreeView';
import { ServicesTableView } from './components/ServicesTableView';
import { useServices, type UseServicesProps } from './hooks/useServices';

export interface ServicesPageProps extends UseServicesProps {}

export const ServicesPage: React.FC<ServicesPageProps> = (props) => {
  const {
    authUser,
    isSuperAdmin,
    canCreate,
    canUpdate,
    canDelete,
    stats,
    search,
    setSearch,
    serviceFilter,
    setServiceFilter,
    viewMode,
    setViewMode,
    selectedOrgFilter,
    setSelectedOrgFilter,
    subcitiesList,
    bureausList,
    expandedMasterIds,
    toggleExpand,
    handleToggleExpandAll,
    filteredTreeNodes,
    filteredItems,
    isLoading,
    isModalOpen,
    setIsModalOpen,
    selectedService,
    setSelectedService,
    isCreating,
    isUpdating,
    togglingId,
    onAdd,
    onAddSubservice,
    onEdit,
    handleDelete,
    onTogglePublish,
    handleOpenRoute,
    handleSaveModal,
    apiServices,
  } = useServices(props);

  return (
    <>
      <PageHeading
        eyebrow="SERVICE MANAGEMENT"
        title="Services & standards"
        subtitle="Manage hierarchical government services, delivery branches, and citizen room navigation."
        action={canCreate ? 'Create Master Service' : undefined}
        onAction={canCreate ? onAdd : undefined}
      />

      {/* KPI Overview Stat Cards */}
      <ServiceStatsGrid stats={stats} />

      {/* Scope Indicator & Toolbar */}
      <ServicesToolbar
        search={search}
        setSearch={setSearch}
        serviceFilter={serviceFilter}
        setServiceFilter={setServiceFilter}
        viewMode={viewMode}
        setViewMode={setViewMode}
        isSuperAdmin={isSuperAdmin}
        authUser={authUser}
        selectedOrgFilter={selectedOrgFilter}
        setSelectedOrgFilter={setSelectedOrgFilter}
        subcitiesList={subcitiesList}
        bureausList={bureausList}
        expandedMasterIds={expandedMasterIds}
        handleToggleExpandAll={handleToggleExpandAll}
        totalCount={apiServices?.data?.length ?? 0}
      />

      {/* Loading Spinner */}
      {isLoading && !apiServices ? (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '48px 24px',
            gap: '12px',
          }}
        >
          <div className="loading-spinner" />
          <p style={{ margin: 0, color: '#00485a', fontWeight: 600, fontSize: '14px' }}>
            Loading government service catalog...
          </p>
          <p style={{ margin: 0, color: '#64748b', fontSize: '12px' }}>
            Resolving organizational hierarchy, documents, and room routes
          </p>
        </div>
      ) : null}

      {/* Hierarchical Tree View */}
      {viewMode === 'tree' && (
        <ServicesTreeView
          filteredTreeNodes={filteredTreeNodes}
          expandedMasterIds={expandedMasterIds}
          toggleExpand={toggleExpand}
          canCreate={canCreate}
          canUpdate={canUpdate}
          canDelete={canDelete}
          togglingId={togglingId}
          onAddSubservice={onAddSubservice}
          onEdit={onEdit}
          handleDelete={handleDelete}
          onTogglePublish={onTogglePublish}
          handleOpenRoute={handleOpenRoute}
          isLoading={isLoading}
        />
      )}

      {/* Classic List / Table View */}
      {viewMode === 'table' && (
        <ServicesTableView
          items={filteredItems}
          canUpdate={canUpdate}
          canDelete={canDelete}
          togglingId={togglingId}
          onEdit={onEdit}
          handleDelete={handleDelete}
          onTogglePublish={onTogglePublish}
          isLoading={isLoading}
        />
      )}

      {/* Master & Subservice Creation / Editing Modal */}
      <ServiceModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedService(null);
        }}
        onSave={handleSaveModal}
        service={selectedService}
        isSubmitting={isCreating || isUpdating}
      />
    </>
  );
};

export default ServicesPage;
