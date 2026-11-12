import React from 'react';
import { PageHeading } from '../shared';
import { LevelModal } from './components/LevelModal';
import { useLevels } from './hooks/useLevels';
import { LevelMetrics } from './components/LevelMetrics';
import { LevelTable } from './components/LevelTable';

export const LevelsPage: React.FC = () => {
  const {
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    rootFilter,
    setRootFilter,
    isLoading,
    isSubmitting,
    isUpdating,
    canCreate,
    canUpdate,
    canDelete,
    levels,
    filteredLevels,
    rootCount,
    activeCount,
    isModalOpen,
    setIsModalOpen,
    selectedLevel,
    setSelectedLevel,
    handleOpenAdd,
    handleOpenEdit,
    handleSave,
    handleDelete,
    handleMoveRank,
  } = useLevels();

  return (
    <>
      <PageHeading
        eyebrow="SUPER ADMIN · HIERARCHY STRUCTURE"
        title="Organization levels"
        subtitle="Manage the hierarchy ranks and classification tiers (Sub-City, Woreda, Bureau, etc.) used when registering offices."
        action={canCreate ? 'Add tier level' : undefined}
        onAction={canCreate ? handleOpenAdd : undefined}
      />

      <LevelMetrics
        isLoading={isLoading}
        totalCount={levels.length}
        rootCount={rootCount}
        activeCount={activeCount}
      />

      <LevelTable
        levels={levels}
        filteredLevels={filteredLevels}
        isLoading={isLoading}
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        rootFilter={rootFilter}
        onRootFilterChange={setRootFilter}
        canUpdate={canUpdate}
        canDelete={canDelete}
        isUpdating={isUpdating}
        onMoveRank={handleMoveRank}
        onOpenEdit={handleOpenEdit}
        onDelete={handleDelete}
      />

      <LevelModal
        isOpen={isModalOpen}
        level={selectedLevel}
        existingLevels={levels}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedLevel(null);
        }}
        onSave={handleSave}
        isLoading={isSubmitting}
      />
    </>
  );
};

export default LevelsPage;
