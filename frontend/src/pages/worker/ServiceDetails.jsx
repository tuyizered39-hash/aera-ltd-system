import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  FaEdit, FaArrowLeft, FaPrint, FaFileWord, FaFilePdf,
  FaFileInvoice, FaUser, FaCalendarAlt, FaMoneyBillWave,
  FaReceipt, FaFileAlt, FaDownload
} from 'react-icons/fa';
import { useLanguage } from '../../context/LanguageContext';
import { serviceAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const ServiceDetails = () => {
  const { type, id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [service, setService] = useState(null);

  useEffect(() => {
    if (id) fetchService();
  }, [id]);

  const fetchService = async () => {
    try {
      setLoading(true);
      const response = await serviceAPI.getServiceById(id);
      setService(response.data.data);
    } catch (error) {
      console.error('Failed to load service:', error);
      toast.error('Failed to load service details');
      navigate(`/services/${type}`);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Export handler
  const handleExport = async (format) => {
    try {
      const response = format === 'docx'
        ? await serviceAPI.exportServiceDOCX(id)
        : await serviceAPI.exportServicePDF(id);

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `AERA-Service-${service.clientName}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success(`${format.toUpperCase()} downloaded`);
    } catch (err) {
      console.error('Export error:', err);
      toast.error(`Failed to export ${format.toUpperCase()}`);
    }
  };

  const getStatusColor = (status) => {
    if (!status) return 'bg-gray-100 text-gray-700';
    switch (status) {
      case 'PAID': return 'bg-green-100 text-green-700 border-green-300';
      case 'UNPAID': return 'bg-red-100 text-red-700 border-red-300';
      case 'PARTIAL': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getServiceStatusColor = (status) => {
    if (!status) return 'bg-gray-100 text-gray-700';
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-700';
      case 'ONGOING': return 'bg-blue-100 text-blue-700';
      case 'CANCELLED': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getServiceTypeLabel = (type) => {
    if (!type) return 'Unknown';
    return t(`services.${type.toLowerCase()}`);
  };

  const calculateTotal = (products) => {
    if (!products || products.length === 0) return 0;
    return products.reduce(
      (sum, p) => sum + (parseFloat(p.unitPrice) || 0) * (parseInt(p.quantity) || 0),
      0
    );
  };

  if (loading) return <LoadingSpinner />;
  if (!service) return null;

  const totalProducts = calculateTotal(service.products);
  const invoiceNumber = `INV-${new Date(service.createdAt).getFullYear()}-${service.id.slice(-4).toUpperCase()}`;
  const balanceDue = (service.amount || 0) - (service.amountPaid || 0);

  return (
    <div className="max-w-5xl mx-auto pb-10">
      {/* ============================================ */}
      {/* ACTION BAR */}
      {/* ============================================ */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/services/${type}`)}
            className="text-gray-600 hover:text-gray-900 transition"
          >
            <FaArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Invoice Details</h1>
            <p className="text-sm text-gray-500">
              {getServiceTypeLabel(service.serviceType)}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            to={`/services/${type}/${id}/edit`}
            className="flex items-center gap-2 bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition text-sm font-medium"
          >
            <FaEdit /> Edit
          </Link>

          <button
            onClick={() => handleExport('docx')}
            className="flex items-center gap-2 bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition text-sm font-medium"
          >
            <FaFileWord /> DOCX
          </button>

          <button
            onClick={() => handleExport('pdf')}
            className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition text-sm font-medium"
          >
            <FaFilePdf /> PDF
          </button>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition text-sm font-medium"
          >
            <FaPrint /> Print
          </button>
        </div>
      </div>

      {/* ============================================ */}
      {/* INVOICE HEADER */}
      {/* ============================================ */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
        <div className="bg-blue-900 text-white p-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-3xl font-bold">
                AERA <span className="text-yellow-400">LTD</span>
              </h2>
              <p className="text-blue-200 text-sm mt-1">
                Gakenke District, Northern Province, Rwanda
              </p>
              
            </div>
            <div className="text-right">
              <FaFileInvoice className="text-4xl text-yellow-400 mb-2 ml-auto" />
              <p className="text-sm text-blue-200 uppercase tracking-wider">Invoice</p>
              <p className="text-lg font-bold">{invoiceNumber}</p>

              {/* Payment Status Badge */}
              <span
                className={`inline-block mt-3 px-3 py-1 text-xs font-bold rounded-full border-2 ${
                  service.paymentStatus === 'PAID'
                    ? 'bg-green-500 text-white border-green-300'
                    : service.paymentStatus === 'PARTIAL'
                    ? 'bg-yellow-500 text-white border-yellow-300'
                    : 'bg-red-500 text-white border-red-300'
                }`}
              >
                {service.paymentStatus || 'UNPAID'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================ */}
      {/* CLIENT + INVOICE META */}
      {/* ============================================ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Billed To */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <FaUser className="text-blue-900" />
            <h3 className="text-lg font-semibold text-gray-800">Billed To</h3>
          </div>
          <div className="space-y-2">
            <p className="text-xl font-bold text-gray-800">
              {service.clientName || 'N/A'}
            </p>
            <p className="text-sm text-gray-500">
              Service Type: <span className="font-medium text-gray-700">{getServiceTypeLabel(service.serviceType)}</span>
            </p>
          </div>
        </div>

        {/* Invoice Details */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <FaCalendarAlt className="text-blue-900" />
            <h3 className="text-lg font-semibold text-gray-800">Invoice Details</h3>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Invoice Date:</span>
              <span className="font-semibold text-gray-800">
                {service.startDate ? new Date(service.startDate).toLocaleDateString() : 'N/A'}
              </span>
            </div>
            {service.endDate && (
              <div className="flex justify-between">
                <span className="text-gray-500">Due Date:</span>
                <span className="font-semibold text-gray-800">
                  {new Date(service.endDate).toLocaleDateString()}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-500">Created:</span>
              <span className="font-semibold text-gray-800">
                {service.createdAt ? new Date(service.createdAt).toLocaleString() : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-gray-200">
              <span className="text-gray-500">Service Status:</span>
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getServiceStatusColor(service.status)}`}>
                {service.status || 'ONGOING'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================ */}
      {/* PRODUCTS TABLE — INVOICE STYLE */}
      {/* ============================================ */}
      {service.products && service.products.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="flex items-center gap-2 p-4 border-b border-gray-200 bg-gray-50">
            <FaReceipt className="text-blue-900" />
            <h3 className="text-lg font-semibold text-gray-800">
              Products / Services
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-blue-900 text-white">
                <tr className="text-left text-sm font-semibold">
                  <th className="px-4 py-3 w-12 text-center border-r border-blue-800">#</th>
                  <th className="px-4 py-3 border-r border-blue-800">Product / Service Name</th>
                  <th className="px-4 py-3 w-40 text-right border-r border-blue-800">Unit Price (RWF)</th>
                  <th className="px-4 py-3 w-24 text-center border-r border-blue-800">Qty</th>
                  <th className="px-4 py-3 w-44 text-right">Total (RWF)</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {service.products.map((p, idx) => {
                  const lineTotal = (parseFloat(p.unitPrice) || 0) * (parseInt(p.quantity) || 0);
                  const isEven = idx % 2 === 0;
                  return (
                    <tr
                      key={idx}
                      className={`border-t border-gray-200 ${isEven ? 'bg-white' : 'bg-gray-50'}`}
                    >
                      <td className="px-4 py-3 text-center text-sm font-semibold text-gray-600 border-r border-gray-200">
                        {idx + 1}
                      </td>
                      <td className="px-4 py-3 text-gray-800 border-r border-gray-200">
                        {p.name}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-700 border-r border-gray-200">
                        {(parseFloat(p.unitPrice) || 0).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-center text-gray-700 border-r border-gray-200">
                        {p.quantity}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-gray-900">
                        {lineTotal.toLocaleString()}
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
          <div className="border-t-2 border-blue-900 bg-blue-50 p-6">
            <div className="flex flex-col items-end space-y-2">
              <div className="flex justify-between w-full max-w-md">
                <span className="text-sm text-gray-600">Subtotal:</span>
                <span className="text-sm font-semibold text-gray-800">
                  RWF {totalProducts.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between w-full max-w-md pt-2 border-t border-blue-200">
                <span className="text-base font-bold text-gray-800">GRAND TOTAL:</span>
                <span className="text-xl font-extrabold text-blue-900">
                  RWF {totalProducts.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between w-full max-w-md pt-2 border-t border-blue-200">
                <span className="text-sm text-gray-600">Amount Paid:</span>
                <span className="text-sm font-semibold text-green-700">
                  RWF {(service.amountPaid || 0).toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between w-full max-w-md pt-2 border-t border-blue-300">
                <span className="text-base font-bold text-gray-800">BALANCE DUE:</span>
                <span className={`text-lg font-extrabold ${balanceDue > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  RWF {balanceDue.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================ */}
      {/* PAYMENT INFORMATION */}
      {/* ============================================ */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <FaMoneyBillWave className="text-blue-900" />
          <h3 className="text-lg font-semibold text-gray-800">Payment Information</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Payment Status</p>
            <span className={`inline-block px-3 py-1.5 text-sm font-semibold rounded-full border ${getStatusColor(service.paymentStatus)}`}>
              {service.paymentStatus || 'UNPAID'}
            </span>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Payment Mode</p>
            <p className="text-base font-semibold text-gray-800">
              {service.paymentMode || 'CASH'}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Amount Paid</p>
            <p className="text-base font-semibold text-green-700">
              RWF {(service.amountPaid || 0).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* ============================================ */}
      {/* ADDITIONAL INFO */}
      {/* ============================================ */}
      {(service.description || service.notes || service.tentQuantity > 0) && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4"> Additional Info</h3>
          <div className="space-y-3 text-sm">
            {service.tentQuantity > 0 && (
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500">Tent Quantity:</span>
                <span className="font-semibold text-gray-800">{service.tentQuantity}</span>
              </div>
            )}
            {service.description && (
              <div>
                <p className="text-gray-500 mb-1">Description:</p>
                <p className="text-gray-800">{service.description}</p>
              </div>
            )}
            {service.notes && (
              <div>
                <p className="text-gray-500 mb-1">Notes:</p>
                <p className="text-gray-800 italic">{service.notes}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================ */}
      {/* ATTACHMENT */}
      {/* ============================================ */}
      {service.attachmentUrl && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <FaFileAlt className="text-blue-900" />
            <h3 className="text-lg font-semibold text-gray-800">Attachment</h3>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 flex items-center gap-4">
            <FaFileAlt className="text-blue-600 text-2xl" />
            <div className="flex-1">
              <p className="font-medium text-gray-800">{service.attachmentName}</p>
              <p className="text-xs text-gray-500">
                {service.attachmentType} • {((service.attachmentSize || 0) / 1024).toFixed(1)} KB
              </p>
            </div>
            <a
              href={`http://127.0.0.1:5000${service.attachmentUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              download
              className="flex items-center gap-2 bg-blue-900 text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition text-sm"
            >
              <FaDownload /> Download
            </a>
          </div>
        </div>
      )}

      {/* ============================================ */}
      {/* FOOTER NOTE */}
      {/* ============================================ */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
        <p className="text-xs text-gray-500">
          Thank you for your business! • This is a computer-generated invoice.
        </p>
        <p className="text-xs text-gray-400 mt-1">
          AERA LTD • Gakenke District • Rwanda
        </p>
      </div>
    </div>
  );
};

export default ServiceDetails;