import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FaPlus, FaTrash, FaFileUpload, FaFileAlt, FaTimes,
  FaSave, FaArrowLeft, FaFileInvoice, FaUser, FaCalendarAlt,
  FaMoneyBillWave, FaReceipt
} from 'react-icons/fa';
import { useLanguage } from '../../context/LanguageContext';
import { serviceAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const ServiceForm = () => {
  const { type, id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [attachment, setAttachment] = useState(null);
  const [existingAttachment, setExistingAttachment] = useState(null);

  const [products, setProducts] = useState([
    { name: '', unitPrice: 0, quantity: 1 },
  ]);

  const [formData, setFormData] = useState({
    clientName: '',
    amountPaid: '',
    paymentStatus: 'UNPAID',
    paymentMode: 'CASH',
    description: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    tentQuantity: '',
    notes: '',
  });

  const serviceTypes = {
    it: 'IT_MAINTENANCE',
    electrical: 'ELECTRICAL_INSTALLATION',
    construction: 'CONSTRUCTION',
    generator: 'GENERATOR_REPAIR',
    stationary: 'OFFICE_STATIONARY',
    decoration: 'DECORATION_SOUND',
  };

  const serviceType = serviceTypes[type];
  const isEdit = !!id;

  // ✅ Auto-calculated totals
  const subtotal = products.reduce(
    (sum, p) => sum + (parseFloat(p.unitPrice) || 0) * (parseInt(p.quantity) || 0),
    0
  );
  const totalAmount = subtotal; // Can add tax/discount later

  // ✅ Invoice number (generated once)
  const [invoiceNumber] = useState(
    () => `INV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`
  );

  useEffect(() => {
    if (isEdit && serviceType) fetchService();
  }, [id, serviceType]);

  const fetchService = async () => {
    try {
      setLoading(true);
      const response = await serviceAPI.getServiceById(id);
      const data = response.data.data;

      setFormData({
        clientName: data.clientName || '',
        amountPaid: data.amountPaid?.toString() || '',
        paymentStatus: data.paymentStatus || 'UNPAID',
        paymentMode: data.paymentMode || 'CASH',
        description: data.description || '',
        startDate: data.startDate ? new Date(data.startDate).toISOString().split('T')[0] : '',
        endDate: data.endDate ? new Date(data.endDate).toISOString().split('T')[0] : '',
        tentQuantity: data.tentQuantity?.toString() || '',
        notes: data.notes || '',
      });

      if (data.products && Array.isArray(data.products) && data.products.length > 0) {
        setProducts(data.products);
      }

      if (data.attachmentUrl) {
        setExistingAttachment({
          url: data.attachmentUrl,
          name: data.attachmentName,
          type: data.attachmentType,
          size: data.attachmentSize,
        });
      }
    } catch (error) {
      console.error('Fetch service error:', error);
      toast.error('Failed to load service');
      navigate(`/services/${type}`);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleProductChange = (index, field, value) => {
    const updated = [...products];
    updated[index][field] = value;
    setProducts(updated);
  };

  const addProduct = () => {
    setProducts([...products, { name: '', unitPrice: 0, quantity: 1 }]);
  };

  const removeProduct = (index) => {
    if (products.length === 1) {
      toast.error('At least one product is required');
      return;
    }
    setProducts(products.filter((_, i) => i !== index));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File too large. Max 10MB.');
      return;
    }
    setAttachment(file);
  };

  const removeAttachment = () => {
    setAttachment(null);
    setExistingAttachment(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (!formData.clientName.trim()) {
        toast.error('Client name is required');
        setSubmitting(false);
        return;
      }

      if (totalAmount <= 0) {
        toast.error('Total amount must be greater than 0');
        setSubmitting(false);
        return;
      }

      const hasEmptyNames = products.some(p => !p.name.trim());
      if (hasEmptyNames) {
        toast.error('All products must have a name');
        setSubmitting(false);
        return;
      }

      const data = new FormData();
      data.append('serviceType', serviceType);
      data.append('clientName', formData.clientName.trim());
      data.append('amount', totalAmount);
      data.append('amountPaid', formData.amountPaid ? parseFloat(formData.amountPaid) : '');
      data.append('paymentStatus', formData.paymentStatus || 'UNPAID');
      data.append('paymentMode', formData.paymentMode || 'CASH');
      data.append('description', formData.description?.trim() || '');
      data.append('startDate', new Date(formData.startDate).toISOString());
      data.append('endDate', formData.endDate ? new Date(formData.endDate).toISOString() : '');
      data.append('tentQuantity', formData.tentQuantity || '');
      data.append('notes', formData.notes?.trim() || '');
      data.append('products', JSON.stringify(products));

      if (attachment) data.append('attachment', attachment);

      if (isEdit) {
        await serviceAPI.updateService(id, data);
        toast.success('Service updated successfully');
      } else {
        await serviceAPI.createService(data);
        toast.success('Service created successfully');
      }
      navigate(`/services/${type}`);
    } catch (error) {
      console.error('Service error:', error.response?.data || error.message);
      const errors = error.response?.data?.errors;
      if (errors && Array.isArray(errors)) {
        errors.forEach(err => toast.error(`${err.field}: ${err.message}`));
      } else {
        toast.error(error.response?.data?.message || 'Failed to save service');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!serviceType) return null;

  return (
    <div className="max-w-5xl mx-auto pb-10">
      {/* ============================================ */}
      {/* HEADER */}
      {/* ============================================ */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate(`/services/${type}`)}
          className="text-gray-600 hover:text-gray-900 transition"
        >
          <FaArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            {isEdit ? 'Edit' : 'New'} Invoice
          </h1>
          <p className="text-sm text-gray-500">
            {serviceType.replace(/_/g, ' ')}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ============================================ */}
        {/* INVOICE HEADER */}
        {/* ============================================ */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-blue-900 text-white p-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-bold">
                  AERA <span className="text-yellow-400">LTD</span>
                </h2>
                <p className="text-blue-200 text-sm mt-1">
                  Gakenke District, Northern Province, Rwanda
                </p>
              </div>
              <div className="text-right">
                <FaFileInvoice className="text-4xl text-yellow-400 mb-2" />
                <p className="text-sm text-blue-200 uppercase tracking-wider">Invoice</p>
                <p className="text-lg font-bold">{invoiceNumber}</p>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================ */}
        {/* CLIENT INFO + INVOICE META */}
        {/* ============================================ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Client Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <FaUser className="text-blue-900" />
              <h3 className="text-lg font-semibold text-gray-800">Billed To</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                  Client Name *
                </label>
                <input
                  type="text"
                  name="clientName"
                  value={formData.clientName}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Gakenke Hospital"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Invoice Meta */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <FaCalendarAlt className="text-blue-900" />
              <h3 className="text-lg font-semibold text-gray-800">Invoice Details</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                  Date *
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ============================================ */}
        {/* PRODUCTS TABLE — INVOICE STYLE */}
        {/* ============================================ */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center gap-2">
              <FaReceipt className="text-blue-900" />
              <h3 className="text-lg font-semibold text-gray-800">
                Products / Services
              </h3>
            </div>
            <button
              type="button"
              onClick={addProduct}
              className="flex items-center gap-2 bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 transition text-sm font-medium"
            >
              <FaPlus size={12} /> Add Item
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-blue-900 text-white">
                <tr className="text-left text-sm font-semibold">
                  <th className="px-4 py-3 w-12 text-center border-r border-blue-800">#</th>
                  <th className="px-4 py-3 border-r border-blue-800">Product or Service Name</th>
                  <th className="px-4 py-3 w-40 text-right border-r border-blue-800">Unit Price (RWF)</th>
                  <th className="px-4 py-3 w-24 text-center border-r border-blue-800">Qty</th>
                  <th className="px-4 py-3 w-44 text-right border-r border-blue-800">Total (RWF)</th>
                  <th className="px-4 py-3 w-16 text-center"></th>
                </tr>
              </thead>
              <tbody>
                {products.map((p, index) => {
                  const lineTotal = (parseFloat(p.unitPrice) || 0) * (parseInt(p.quantity) || 0);
                  const isEven = index % 2 === 0;
                  return (
                    <tr
                      key={index}
                      className={`border-t border-gray-200 ${isEven ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition`}
                    >
                      <td className="px-4 py-3 text-center text-sm font-semibold text-gray-600 border-r border-gray-200">
                        {index + 1}
                      </td>
                      <td className="px-4 py-3 border-r border-gray-200">
                        <input
                          type="text"
                          value={p.name}
                          onChange={(e) => handleProductChange(index, 'name', e.target.value)}
                          placeholder="e.g. Generator repair, Tente 10x20"
                          className="w-full px-2 py-1.5 border border-gray-200 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          required
                        />
                      </td>
                      <td className="px-4 py-3 border-r border-gray-200">
                        <input
                          type="number"
                          value={p.unitPrice}
                          onChange={(e) => handleProductChange(index, 'unitPrice', e.target.value)}
                          min="0"
                          step="0.01"
                          placeholder="0"
                          className="w-full px-2 py-1.5 border border-gray-200 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-right"
                          required
                        />
                      </td>
                      <td className="px-4 py-3 border-r border-gray-200">
                        <input
                          type="number"
                          value={p.quantity}
                          onChange={(e) => handleProductChange(index, 'quantity', e.target.value)}
                          min="1"
                          className="w-full px-2 py-1.5 border border-gray-200 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-center"
                          required
                        />
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-bold text-gray-800 border-r border-gray-200">
                        {lineTotal.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          type="button"
                          onClick={() => removeProduct(index)}
                          className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition"
                          title="Remove"
                        >
                          <FaTrash size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* ============================================ */}
          {/* TOTALS SUMMARY */}
          {/* ============================================ */}
          <div className="border-t-2 border-blue-900 bg-blue-50">
            <div className="flex flex-col items-end p-4 space-y-2">
              <div className="flex justify-between w-full max-w-sm">
                <span className="text-sm text-gray-600">Subtotal:</span>
                <span className="text-sm font-semibold text-gray-800">
                  RWF {subtotal.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between w-full max-w-sm pt-2 border-t border-blue-200">
                <span className="text-lg font-bold text-gray-800">GRAND TOTAL:</span>
                <span className="text-2xl font-extrabold text-blue-900">
                  RWF {totalAmount.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================ */}
        {/* PAYMENT INFORMATION */}
        {/* ============================================ */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <FaMoneyBillWave className="text-blue-900" />
            <h3 className="text-lg font-semibold text-gray-800">Payment Information</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                Amount Paid (RWF)
              </label>
              <input
                type="number"
                name="amountPaid"
                value={formData.amountPaid}
                onChange={handleChange}
                placeholder="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                Payment Status
              </label>
              <select
                name="paymentStatus"
                value={formData.paymentStatus}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="PAID">Paid</option>
                <option value="UNPAID">Unpaid</option>
                <option value="PARTIAL">Partial</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                Payment Mode
              </label>
              <select
                name="paymentMode"
                value={formData.paymentMode}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="CASH">Cash</option>
                <option value="MTN">MTN</option>
                <option value="BANK">Bank</option>
              </select>
            </div>
          </div>
        </div>

        {/* ============================================ */}
        {/* FILE UPLOAD */}
        {/* ============================================ */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <FaFileUpload className="text-blue-900" />
            <h3 className="text-lg font-semibold text-gray-800">Attach Document (Optional)</h3>
          </div>

          {existingAttachment && !attachment && (
            <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg mb-3">
              <FaFileAlt className="text-blue-600 text-xl" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">{existingAttachment.name}</p>
                <p className="text-xs text-gray-500">
                  {((existingAttachment.size || 0) / 1024).toFixed(1)} KB
                </p>
              </div>
              <button
                type="button"
                onClick={removeAttachment}
                className="text-red-500 hover:text-red-700"
              >
                <FaTimes />
              </button>
            </div>
          )}

          {attachment && (
            <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg mb-3">
              <FaFileAlt className="text-green-600 text-xl" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">{attachment.name}</p>
                <p className="text-xs text-gray-500">
                  {(attachment.size / 1024).toFixed(1)} KB
                </p>
              </div>
              <button
                type="button"
                onClick={removeAttachment}
                className="text-red-500 hover:text-red-700"
              >
                <FaTimes />
              </button>
            </div>
          )}

          <label className="flex items-center justify-center gap-2 w-full px-4 py-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition">
            <FaFileUpload className="text-gray-500" />
            <span className="text-sm text-gray-600">
              {attachment ? 'Change file' : 'Click to upload a document'}
            </span>
            <input
              type="file"
              className="hidden"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,image/*"
              onChange={handleFileChange}
            />
          </label>
          <p className="text-xs text-gray-400 mt-2">
            Max size: 10MB. Allowed: PDF, Word, Excel, PowerPoint, Images
          </p>
        </div>

        {/* ============================================ */}
        {/* NOTES */}
        {/* ============================================ */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Additional Notes</h3>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows="3"
            placeholder="Any additional information about this service..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* ============================================ */}
        {/* SUBMIT BUTTONS */}
        {/* ============================================ */}
        <div className="flex flex-wrap gap-3 pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 bg-blue-900 text-white px-8 py-3 rounded-lg hover:bg-blue-800 transition disabled:opacity-50 font-semibold shadow-md hover:shadow-lg"
          >
            <FaSave />
            {submitting ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Invoice'}
          </button>
          <button
            type="button"
            onClick={() => navigate(`/services/${type}`)}
            className="px-8 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default ServiceForm;