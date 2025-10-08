import React, { useEffect, useState } from "react";
import { Plus, Edit, Trash2, X, ChevronLeft, ChevronRight, BookOpen, FileText, Search, RefreshCw, Lightbulb, Eye,Calendar } from "lucide-react";
import { addPanicAttackTip, getAllPanicAttackTips, updatePanicAttackTip, deletePanicAttackTip } from "../services/panicAttackTipsService";
import { isAuthenticated } from "../services/authService";
import { useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';

export default function PanicAttackTipsManagement() {
  const [tips, setTips] = useState([]);
  const [filteredTips, setFilteredTips] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [order, setOrder] = useState("");
  const [editingTipId, setEditingTipId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedTip, setSelectedTip] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [itemsPerPage] = useState(5);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/");
    } else {
      fetchTips();
    }
  }, [navigate]);

  useEffect(() => {
    const filtered = tips.filter(t =>
      t && t.title && t.description &&
      (t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
       t.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredTips(filtered);
    setCurrentPage(1);
  }, [searchTerm, tips]);

  const fetchTips = async (showRefreshLoader = false) => {
    if (showRefreshLoader) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    
    try {
      const fetchedTips = await getAllPanicAttackTips();
      // Validate and filter tips to ensure they have title, description, and order
      const validTips = fetchedTips.filter(t => 
        t && typeof t.title === 'string' && typeof t.description === 'string' && t.order !== undefined
      );
      setTips(validTips);
      setFilteredTips(validTips);
      
      if (validTips.length !== fetchedTips.length) {
        console.warn(`Filtered out ${fetchedTips.length - validTips.length} invalid tips missing title, description, or order`);
      }

      if (showRefreshLoader) {
        Swal.fire({
          icon: 'success',
          title: 'Refreshed!',
          text: 'Tips refreshed successfully!',
          position: 'center',
          timer: 2000,
          showConfirmButton: false
        });
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: `Failed to fetch tips: ${error.message}`,
        position: 'center',
        confirmButtonColor: '#6366f1'
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const orderValue = parseInt(order);
      if (isNaN(orderValue)) {
        throw new Error("Order must be a valid number");
      }

      if (editingTipId) {
        await updatePanicAttackTip(editingTipId, { title, description, order: orderValue });
        Swal.fire({
          icon: 'success',
          title: 'Updated!',
          text: 'Tip updated successfully!',
          position: 'center',
          timer: 2000,
          showConfirmButton: false
        });
        setEditingTipId(null);
      } else {
        await addPanicAttackTip({ title, description, order: orderValue });
        Swal.fire({
          icon: 'success',
          title: 'Added!',
          text: 'Tip added successfully!',
          position: 'center',
          timer: 2000,
          showConfirmButton: false
        });
      }
      setTitle("");
      setDescription("");
      setOrder("");
      setIsModalOpen(false);
      setCurrentPage(1);
      fetchTips();
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: `Failed to ${editingTipId ? 'update' : 'add'} tip: ${error.message}`,
        position: 'center',
        confirmButtonColor: '#6366f1'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (t) => {
    if (!t || !t.title || !t.description || t.order === undefined) {
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'Cannot edit tip: Missing title, description, or order',
        position: 'center',
        confirmButtonColor: '#6366f1'
      });
      return;
    }
    setEditingTipId(t.id);
    setTitle(t.title);
    setDescription(t.description);
    setOrder(t.order.toString());
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      position: 'center',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        await deletePanicAttackTip(id);
        setCurrentPage(1);
        Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'Tip has been deleted successfully!',
          position: 'center',
          timer: 2000,
          showConfirmButton: false
        });
        fetchTips();
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: `Failed to delete tip: ${error.message}`,
          position: 'center',
          confirmButtonColor: '#6366f1'
        });
      }
    }
  };

  const handleView = (t) => {
    if (!t || !t.title || !t.description || t.order === undefined) {
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'Cannot view tip: Missing title, description, or order',
        position: 'center',
        confirmButtonColor: '#6366f1'
      });
      return;
    }
    setSelectedTip(t);
    setIsViewModalOpen(true);
  };

  const openModal = () => {
    setEditingTipId(null);
    setTitle("");
    setDescription("");
    setOrder("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTipId(null);
    setTitle("");
    setDescription("");
    setOrder("");
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const truncateText = (text, maxLength = 100) => {
    if (!text || typeof text !== 'string') return 'No description available';
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
  };

  // Pagination calculations
  const totalPages = Math.ceil(filteredTips.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTips = filteredTips.slice(startIndex, endIndex);

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Pagination Component
  const PaginationComponent = () => (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-gray-200 bg-gray-50">
      <div className="flex items-center gap-4">
        <p className="text-sm text-gray-600">
          Showing {startIndex + 1} to {Math.min(endIndex, filteredTips.length)} of {filteredTips.length} entries
        </p>
      </div>
      
      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          <button
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            className={`flex items-center gap-1 px-3 py-2 text-sm border rounded-md transition-colors ${
              currentPage === 1
                ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                : 'border-gray-300 text-gray-700 hover:bg-gray-100'
            }`}
          >
            <ChevronLeft size={16} />
            Previous
          </button>
          
          <div className="flex items-center gap-1 mx-2">
            {getPageNumbers().map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-3 py-2 text-sm rounded-md transition-colors ${
                  currentPage === page
                    ? 'bg-indigo-600 text-white'
                    : 'border border-gray-300 text-gray-700 hover:bg-gray-100'
                }`}
              >
                {page}
              </button>
            ))}
          </div>
          
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className={`flex items-center gap-1 px-3 py-2 text-sm border rounded-md transition-colors ${
              currentPage === totalPages
                ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                : 'border-gray-300 text-gray-700 hover:bg-gray-100'
            }`}
          >
            Next
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );

  // Card View Component (Mobile/Tablet)
  const CardView = () => (
    <div className="md:hidden">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
        {currentTips.map((t, index) => (
          t && t.title && t.description && t.order !== undefined ? (
            <div key={t.id} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="p-6">
                {/* Tip Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white flex-shrink-0">
                      <Lightbulb size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate text-sm" title={t.title}>
                        {t.title}
                      </h3>
                      <p className="text-xs text-gray-500">Order: {t.order}</p>
                    </div>
                  </div>
                  {/* Action Buttons */}
                  <div className="flex gap-1 flex-shrink-0">
                    <button
                      onClick={() => handleView(t)}
                      className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="View tip"
                    >
                      <Eye size={14} />
                    </button>
                    <button
                      onClick={() => handleEdit(t)}
                      className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      title="Edit tip"
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(t.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete tip"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                {/* Tip Description */}
                <div className="mb-4">
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {truncateText(t.description, 120)}
                  </p>
                </div>
              </div>
            </div>
          ) : null
        ))}
      </div>
      
      {/* Pagination for Cards */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <PaginationComponent />
      </div>
    </div>
  );

  // Table View Component (Desktop)
  const TableView = () => (
    <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentTips.map((t, index) => (
              t && t.title && t.description && t.order !== undefined ? (
                <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-2 whitespace-nowrap">
                    <span className="text-sm font-mono text-gray-600 bg-gray-100 px-2 py-1 rounded">
                      {startIndex + index + 1}
                    </span>
                  </td>
                  <td className="px-6 py-2 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white">
                        <Lightbulb size={16} />
                      </div>
                      <div className="max-w-48">
                        <div className="font-medium text-gray-900 truncate" title={t.title}>
                          {t.title}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-2 whitespace-nowrap">
                    <span className="text-sm text-gray-600">{t.order}</span>
                  </td>
                  <td className="px-6 py-2">
                    <div className="max-w-xs">
                      <p className="text-sm text-gray-600 truncate" title={t.description}>
                        {truncateText(t.description, 60)}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-2 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleView(t)}
                        className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => handleEdit(t)}
                        className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(t.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ) : null
            ))}
          </tbody>
        </table>
      </div>
      <PaginationComponent />
    </div>
  );

  return (
    <div className="bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="h-full overflow-y-auto mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-600 rounded-lg">
              <Lightbulb className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Panic Attack Tips Management</h1>
          </div>
          <p className="text-gray-600">Manage and organize tips for coping with panic attacks</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-100 rounded-lg">
                <FileText className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Total Tips</p>
                <p className="text-2xl font-bold text-gray-900">{tips.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <BookOpen className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Filtered Tips</p>
                <p className="text-2xl font-bold text-gray-900">{filteredTips.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Actions Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 p-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div className="relative flex-grow max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search tips by title or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => fetchTips(true)}
                disabled={isRefreshing}
                className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2.5 rounded-lg font-medium transition-colors shadow-sm disabled:opacity-50"
              >
                <RefreshCw size={18} className={isRefreshing ? 'animate-spin' : ''} />
                Refresh
              </button>
              <button
                onClick={openModal}
                disabled={isLoading}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white px-4 py-2.5 rounded-lg font-medium transition-colors shadow-sm"
              >
                <Plus size={20} />
                Add Tip
              </button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && !isRefreshing ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center gap-3">
              <RefreshCw className="w-5 h-5 animate-spin text-indigo-600" />
              <p className="text-gray-600">Loading tips...</p>
            </div>
          </div>
        ) : filteredTips.length === 0 ? (
          <div className="text-center py-12">
            <Lightbulb className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tips found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm ? 'Try adjusting your search terms.' : 'Get started by adding your first tip.'}
            </p>
            {!searchTerm && (
              <button
                onClick={openModal}
                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                <Plus size={20} />
                Add First Tip
              </button>
            )}
          </div>
        ) : (
          <>
            <CardView />
            <TableView />
          </>
        )}

        {/* Add/Edit Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 transform transition-all duration-200">
              <div className="px-6 py-4 border-b border-gray-100">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">
                      {editingTipId ? "Edit Tip" : "Add New Tip"}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {editingTipId ? "Update tip details" : "Create a new panic attack tip"}
                    </p>
                  </div>
                  <button
                    onClick={closeModal}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
              <form onSubmit={handleSubmit} className="p-6">
                <div className="space-y-4">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                      Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="title"
                      name="title"
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 text-gray-900 placeholder-gray-400"
                      placeholder="Enter tip title"
                    />
                  </div>
                  <div>
                    <label htmlFor="order" className="block text-sm font-medium text-gray-700 mb-1">
                      Order <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="order"
                      name="order"
                      type="number"
                      required
                      value={order}
                      onChange={(e) => setOrder(e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 text-gray-900 placeholder-gray-400"
                      placeholder="Enter tip order (e.g., 1, 2, 3)"
                    />
                  </div>
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                      Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      required
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 text-gray-900 placeholder-gray-400 resize-none"
                      placeholder="Share helpful panic attack tip details..."
                      rows="4"
                    />
                  </div>
                </div>
                <div className="flex space-x-3 mt-6">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 bg-indigo-600 text-white py-2.5 px-4 rounded-lg font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all duration-200 disabled:bg-indigo-300 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center">
                        <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                        {editingTipId ? 'Updating...' : 'Adding...'}
                      </span>
                    ) : (
                      editingTipId ? "Update Tip" : "Add Tip"
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 bg-gray-100 text-gray-700 py-2.5 px-4 rounded-lg font-medium hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all duration-200"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* View Modal */}
        {isViewModalOpen && selectedTip && (
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white">
                      <Lightbulb size={20} />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">Tip Details</h2>
                      <p className="text-sm text-gray-500">View complete panic attack tip information</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsViewModalOpen(false)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-2">Title</label>
                    <h3 className="text-2xl font-bold text-gray-900">{selectedTip.title || 'No title available'}</h3>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-2">Order</label>
                    <p className="text-gray-800">{selectedTip.order !== undefined ? selectedTip.order : 'No order available'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-2">Description</label>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{selectedTip.description || 'No description available'}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                    
                  </div>
                  <div className="flex gap-3 pt-6 border-t border-gray-200">
                    <button
                      onClick={() => {
                        setIsViewModalOpen(false);
                        handleEdit(selectedTip);
                      }}
                      className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 text-white py-2.5 px-4 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                    >
                      <Edit size={16} />
                      Edit Tip
                    </button>
                    <button
                      onClick={() => {
                        setIsViewModalOpen(false);
                        handleDelete(selectedTip.id);
                      }}
                      className="flex-1 flex items-center justify-center gap-2 bg-red-600 text-white py-2.5 px-4 rounded-lg font-medium hover:bg-red-700 transition-colors"
                    >
                      <Trash2 size={16} />
                      Delete Tip
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}