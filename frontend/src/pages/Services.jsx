import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { servicesAPI, categoriesAPI } from '../services/api';

export default function Services() {
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category_id: '',
    q: '',
    page: 1
  });

  useEffect(() => {
    loadCategories();
    loadServices();
  }, [filters]);

  const loadCategories = async () => {
    try {
      const res = await categoriesAPI.getAll();
      setCategories(res.data);
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  const loadServices = async () => {
    try {
      setLoading(true);
      const res = await servicesAPI.getAll(filters);
      setServices(res.data.services || []);
    } catch (err) {
      console.error('Failed to load services:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value, page: 1 });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Browse Services</h1>
        <Link to="/services/new" className="btn btn-primary">
          List Your Service
        </Link>
      </div>

      {/* Filters */}
      <div className="card bg-base-100 shadow">
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Search</span>
              </label>
              <input
                type="text"
                placeholder="Search services..."
                className="input input-bordered"
                value={filters.q}
                onChange={(e) => handleFilterChange('q', e.target.value)}
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Category</span>
              </label>
              <select
                className="select select-bordered"
                value={filters.category_id}
                onChange={(e) => handleFilterChange('category_id', e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Services Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      ) : services.length === 0 ? (
        <div className="alert alert-info">
          <span>No services found. Try adjusting your filters.</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map(service => (
            <div key={service.id} className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow">
              <div className="card-body">
                <h2 className="card-title">{service.title}</h2>
                <p className="text-gray-600 line-clamp-2">{service.description}</p>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  {service.category && (
                    <span className="badge badge-outline">{service.category.name}</span>
                  )}
                  {service.provider && (
                    <span>by {service.provider.name}</span>
                  )}
                </div>
                <div className="card-actions justify-between items-center mt-4">
                  <div className="text-2xl font-bold text-primary">
                    ${service.price} <span className="text-sm font-normal text-gray-500">{service.currency}</span>
                  </div>
                  <Link to={`/services/${service.id}`} className="btn btn-primary btn-sm">
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

