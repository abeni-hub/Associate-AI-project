import React from 'react';
import { MetricCard } from '../../shared';

export interface ServiceStatsGridProps {
  stats: {
    total?: number;
    masterCount: number;
    subserviceCount: number;
    activeRate: number;
    officesCount: number;
  };
}

export const ServiceStatsGrid: React.FC<ServiceStatsGridProps> = ({ stats }) => {
  return (
    <div className="metric-grid">
      <MetricCard
        icon="layers"
        label="Master Categories"
        value={stats.masterCount}
        note="Top-level service domains"
        tone="teal"
      />
      <MetricCard
        icon="file"
        label="Citizen Services"
        value={stats.subserviceCount}
        note="Standard procedures"
        tone="blue"
      />
      <MetricCard
        icon="building"
        label="Delivery Offices"
        value={stats.officesCount}
        note="Active branch locations"
        tone="gold"
      />
      <MetricCard
        icon="check"
        label="Published & Active"
        value={`${stats.activeRate}%`}
        note="Operational readiness"
        tone="sage"
      />
    </div>
  );
};

export default ServiceStatsGrid;
