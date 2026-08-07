import { useState, useEffect, useCallback } from 'react';
import { serviceAPI } from '../services/api';
import toast from 'react-hot-toast';

export const useServices = (serviceType, initialFilters = {}) => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 0 });
  const [filters, setFilters] = useState(initialFilters);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchServices = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        serviceType,
        page: pagination.page,
        limit: 10,
        clientName: searchTerm || undefined,
        ...filters,
      };
      const response = await serviceAPI.getServices(params);
      setServices(response.data.data);
      setPagination({
        page: response.data.pagination.page,
        total: response.data.pagination.total,
        pages: response.data.pagination.pages,
      });
    } catch (error) {
      console.error('Failed to fetch services:', error);
      toast.error('Failed to load services');
    } finally {
      setLoading(false);
    }
  }, [serviceType, pagination.page, searchTerm, filters]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const createService = async (data) => {
    try {
      const response = await serviceAPI.createService(data);
      toast.success('Service created successfully');
      fetchServices();
      return response.data;
    } catch (error) {
      toast.error('Failed to create service');
      throw error;
    }
  };

  const updateService = async (id, data) => {
    try {
      const response = await serviceAPI.updateService(id, data);
      toast.success('Service updated successfully');
      fetchServices();
      return response.data;
    } catch (error) {
      toast.error('Failed to update service');
      throw error;
    }
  };

  const deleteService = async (id) => {
    if (!confirm('Are you sure you want to delete this service?')) return;
    try {
      await serviceAPI.deleteService(id);
      toast.success('Service deleted successfully');
      fetchServices();
    } catch (error) {
      toast.error('Failed to delete service');
      throw error;
    }
  };

  const getService = async (id) => {
    try {
      const response = await serviceAPI.getServiceById(id);
      return response.data.data;
    } catch (error) {
      toast.error('Failed to load service');
      throw error;
    }
  };

  const updateFilters = (newFilters) => {
    setFilters(newFilters);
    setPagination({ ...pagination, page: 1 });
  };

  const search = (term) => {
    setSearchTerm(term);
    setPagination({ ...pagination, page: 1 });
  };

  const goToPage = (page) => {
    setPagination({ ...pagination, page });
  };

  return {
    services,
    loading,
    pagination,
    filters,
    searchTerm,
    createService,
    updateService,
    deleteService,
    getService,
    updateFilters,
    search,
    goToPage,
    refresh: fetchServices,
  };
};

export default useServices;