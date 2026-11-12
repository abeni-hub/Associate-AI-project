import React from 'react';
import { Icon } from '../../shared';

export interface ServiceStatsGridProps {
  stats: {
    total: number;
    masterCount: number;
    subserviceCount: number;
    activeRate: number;
    officesCount: number;
  };
}

export const ServiceStatsGrid: React.FC<ServiceStatsGridProps> = ({ stats }) => {
  return (
    <div className="service-stats-grid">
      <div className="service-stat-card">
        <div className="service-stat-icon">
          <Icon name="layers" size={20} />
        </div>
        <div className="service-stat-info">
          <b>{stats.masterCount}</b>
          <small>Master Categories</small>
        </div>
      </div>
      <div className="service-stat-card">
        <div className="service-stat-icon">
          <Icon name="file" size={20} />
        </div>
        <div className="service-stat-info">
          <b>{stats.subserviceCount}</b>
          <small>Citizen Subservices</small>
        </div>
      </div>
      <div className="service-stat-card">
        <div className="service-stat-icon">
          <Icon name="building" size={20} />
        </div>
        <div className="service-stat-info">
          <b>{stats.officesCount}</b>
          <small>Delivery Offices</small>
        </div>
      </div>
      <div className="service-stat-card">
        <div className="service-stat-icon">
          <Icon name="check" size={20} />
        </div>
        <div className="service-stat-info">
          <b>{stats.activeRate}%</b>
          <small>Active & Published</small>
        </div>
      </div>
    </div>
  );
};

export default ServiceStatsGrid;

