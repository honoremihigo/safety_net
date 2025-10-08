import React, { useEffect, useState } from "react";
import { Plus, Edit, Trash2, X, ChevronLeft, ChevronRight, BookOpen, FileText, Search, RefreshCw, Heart, Eye } from "lucide-react";
import { addSelfHarmCopingStrategy, getAllSelfHarmCopingStrategies, updateSelfHarmCopingStrategy, deleteSelfHarmCopingStrategy } from "../services/selfHarmCopingStrategiesService";
import { isAuthenticated } from "../services/authService";
import { useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';

export default function SelfHarmCopingStrategiesManagement() {
  const [strategies, setStrategies] = useState([]);
  const [filteredStrategies, setFilteredStrategies] = useState([]);
  const [category, setCategory] = useState("");
  const [color, setColor] = useState("");
  const [icon, setIcon] = useState("");
  const [tips, setTips] = useState([]);
  const [newTip, setNewTip] = useState("");
  const [editingStrategyId, setEditingStrategyId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedStrategy, setSelectedStrategy] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [itemsPerPage] = useState(5);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/");
    } else {
      fetchStrategies();
    }
  }, [navigate]);

  useEffect(() => {
    const filtered = strategies.filter(s =>
      s && s.category && s.color !== undefined && s.icon && Array.isArray(s.tips) && s.tips.length > 0 &&
      (s.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
       s.icon.toLowerCase().includes(searchTerm.toLowerCase()) ||
       s.tips.some(tip => typeof tip === 'string' && tip.toLowerCase().includes(searchTerm.toLowerCase())))
    );
    setFilteredStrategies(filtered);
    setCurrentPage(1);
  }, [searchTerm, strategies]);

  const fetchStrategies = async (showRefreshLoader = false) => {
    if (showRefreshLoader) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    
    try {
      const fetchedStrategies = await getAllSelfHarmCopingStrategies();
      const validStrategies = fetchedStrategies.filter(s => 
        s && typeof s.category === 'string' && s.color !== undefined && 
        typeof s.icon === 'string' && Array.isArray(s.tips) && s.tips.length > 0 &&
        s.tips.every(tip => typeof tip === 'string')
      );
      setStrategies(validStrategies);
      setFilteredStrategies(validStrategies);
      
      if (validStrategies.length !== fetchedStrategies.length) {
        console.warn(`Filtered out ${fetchedStrategies.length - validStrategies.length} invalid strategies missing required fields`);
      }

      if (showRefreshLoader) {
        Swal.fire({
          icon: 'success',
          title: 'Refreshed!',
          text: 'Strategies refreshed successfully!',
          position: 'center',
          timer: 1500,
          showConfirmButton: false
        });
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: `Failed to fetch strategies: ${error.message}`,
        position: 'center',
        confirmButtonColor: '#6366f1'
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleAddTip = () => {
    if (newTip.trim()) {
      setTips([...tips, newTip.trim()]);
      setNewTip("");
    }
  };

  const handleRemoveTip = (index) => {
    setTips(tips.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (tips.length === 0) {
        throw new Error("At least one tip is required");
      }
      if (editingStrategyId) {
        await updateSelfHarmCopingStrategy(editingStrategyId, { category, color, icon, tips });
        Swal.fire({
          icon: 'success',
          title: 'Updated!',
          text: 'Strategy updated successfully!',
          position: 'center',
          timer: 1500,
          showConfirmButton: false
        });
        setEditingStrategyId(null);
      } else {
        await addSelfHarmCopingStrategy({ category, color, icon, tips });
        Swal.fire({
          icon: 'success',
          title: 'Added!',
          text: 'Strategy added successfully!',
          position: 'center',
          timer: 1500,
          showConfirmButton: false
        });
      }
      setCategory("");
      setColor("");
      setIcon("");
      setTips([]);
      setNewTip("");
      setIsModalOpen(false);
      setCurrentPage(1);
      fetchStrategies();
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: `Failed to ${editingStrategyId ? 'update' : 'add'} strategy: ${error.message}`,
        position: 'center',
        confirmButtonColor: '#6366f1'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (s) => {
    if (!s || !s.category || s.color === undefined || !s.icon || !Array.isArray(s.tips) || s.tips.length === 0) {
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'Cannot edit strategy: Missing required fields',
        position: 'center',
        confirmButtonColor: '#6366f1'
      });
      return;
    }
    setEditingStrategyId(s.id);
    setCategory(s.category);
    setColor(s.color);
    setIcon(s.icon);
    setTips(s.tips);
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
        await deleteSelfHarmCopingStrategy(id);
        setCurrentPage(1);
        Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'Strategy has been deleted successfully!',
          position: 'center',
          timer: 1500,
          showConfirmButton: false
        });
        fetchStrategies();
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: `Failed to delete strategy: ${error.message}`,
          position: 'center',
          confirmButtonColor: '#6366f1'
        });
      }
    }
  };

  const handleView = (s) => {
    if (!s || !s.category || s.color === undefined || !s.icon || !Array.isArray(s.tips) || s.tips.length === 0) {
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'Cannot view strategy: Missing required fields',
        position: 'center',
        confirmButtonColor: '#6366f1'
      });
      return;
    }
    setSelectedStrategy(s);
    setIsViewModalOpen(true);
  };

  const openModal = () => {
    setEditingStrategyId(null);
    setCategory("");
    setColor("");
    setIcon("");
    setTips([]);
    setNewTip("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingStrategyId(null);
    setCategory("");
    setColor("");
    setIcon("");
    setTips([]);
    setNewTip("");
  };

  const truncateText = (text, maxLength = 80) => {
    if (!text || typeof text !== 'string') return 'No content available';
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
  };

  // Pagination calculations
  const totalPages = Math.ceil(filteredStrategies.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentStrategies = filteredStrategies.slice(startIndex, endIndex);

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
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-gray-200 bg-gray-50">
      <div className="flex items-center gap-3">
        <p className="text-xs text-gray-600">
          Showing {startIndex + 1} to {Math.min(endIndex, filteredStrategies.length)} of {filteredStrategies.length} entries
        </p>
      </div>
      
      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          <button
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            className={`flex items-center gap-1 px-2 py-1.5 text-xs border rounded-md transition-colors ${
              currentPage === 1
                ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                : 'border-gray-300 text-gray-700 hover:bg-gray-100'
            }`}
          >
            <ChevronLeft size={14} />
            Previous
          </button>
          
          <div className="flex items-center gap-1 mx-1">
            {getPageNumbers().map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-2 py-1 text-xs rounded-md transition-colors ${
                  currentPage === page
                    ? 'bg-primary-600 text-white'
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
            className={`flex items-center gap-1 px-2 py-1.5 text-xs border rounded-md transition-colors ${
              currentPage === totalPages
                ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                : 'border-gray-300 text-gray-700 hover:bg-gray-100'
            }`}
          >
            Next
            <ChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  );

  // Card View Component (Mobile/Tablet)
  const CardView = () => (
    <div className="md:hidden">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        {currentStrategies.map((s, index) => (
          s && s.category && s.color !== undefined && s.icon && Array.isArray(s.tips) && s.tips.length > 0 ? (
            <div key={s.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-2 flex-1 min-w-0">
                    <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center text-white flex-shrink-0">
                      <Heart size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate text-xs" title={s.category}>
                        {s.category}
                      </h3>
                      <p className="text-[10px] text-gray-500">Icon: {s.icon}</p>
                    </div>
                  </div>
                  <div className="flex gap-0.5 flex-shrink-0">
                    <button
                      onClick={() => handleView(s)}
                      className="p-1 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="View strategy"
                    >
                      <Eye size={12} />
                    </button>
                    <button
                      onClick={() => handleEdit(s)}
                      className="p-1 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                      title="Edit strategy"
                    >
                      <Edit size={12} />
                    </button>
                    <button
                      onClick={() => handleDelete(s.id)}
                      className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete strategy"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
                <div className="mb-3">
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {truncateText(s.tips.join(", "), 80)}
                  </p>
                </div>
              </div>
            </div>
          ) : null
        ))}
      </div>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <PaginationComponent />
      </div>
    </div>
  );

  // Table View Component (Desktop)
  const TableView = () => (
    <div className="hidden md:block bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider">#</th>
              <th className="px-4 py-2 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider">Category</th>
              <th className="px-4 py-2 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider">Icon</th>
              <th className="px-4 py-2 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider">Color</th>
              <th className="px-4 py-2 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider">Tips</th>
              <th className="px-4 py-2 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentStrategies.map((s, index) => (
              s && s.category && s.color !== undefined && s.icon && Array.isArray(s.tips) && s.tips.length > 0 ? (
                <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-1.5 whitespace-nowrap">
                    <span className="text-xs font-mono text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded">
                      {startIndex + index + 1}
                    </span>
                  </td>
                  <td className="px-4 py-1.5 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center text-white">
                        <Heart size={14} />
                      </div>
                      <div className="max-w-40">
                        <div className="font-medium text-gray-900 truncate text-xs" title={s.category}>
                          {s.category}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-1.5 whitespace-nowrap">
                    <span className="text-xs text-gray-600">{s.icon}</span>
                  </td>
                  <td className="px-4 py-1.5 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full" style={{ backgroundColor: s.color }}></div>
                      <span className="text-xs text-gray-600">{s.color}</span>
                    </div>
                  </td>
                  <td className="px-4 py-1.5">
                    <div className="max-w-xs">
                      <p className="text-xs text-gray-600 truncate" title={s.tips.join(", ")}>
                        {truncateText(s.tips.join(", "), 50)}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-1.5 whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleView(s)}
                        className="p-1 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        onClick={() => handleEdit(s)}
                        className="p-1 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(s.id)}
                        className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={14} />
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
    <div className="bg-gray-50 p-3 sm:p-4 lg:p-6">
      <div className="h-full overflow-y-auto mx-auto">
        {/* Header Section */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 bg-primary-600 rounded-lg">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Self-Harm Coping Strategies Management</h1>
          </div>
          <p className="text-sm text-gray-600">Manage and organize self-harm coping strategies</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-100 rounded-lg">
                <FileText className="h-5 w-5 text-primary-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">Total Strategies</p>
                <p className="text-xl font-bold text-gray-900">{strategies.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <BookOpen className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">Filtered Strategies</p>
                <p className="text-xl font-bold text-gray-900">{filteredStrategies.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Actions Bar */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-4 p-4">
          <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
            <div className="relative flex-grow max-w-md">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search strategies by category, icon, or tips..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-sm"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => fetchStrategies(true)}
                disabled={isRefreshing}
                className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg font-medium transition-colors shadow-sm disabled:opacity-50 text-sm"
              >
                <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
                Refresh
              </button>
              <button
                onClick={openModal}
                disabled={isLoading}
                className="flex items-center gap-1 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white px-3 py-2 rounded-lg font-medium transition-colors shadow-sm text-sm"
              >
                <Plus size={16} />
                Add Strategy
              </button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && !isRefreshing ? (
          <div className="text-center py-8">
            <div className="inline-flex items-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-primary-600" />
              <p className="text-sm text-gray-600">Loading strategies...</p>
            </div>
          </div>
        ) : filteredStrategies.length === 0 ? (
          <div className="text-center py-8">
            <Heart className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-base font-medium text-gray-900 mb-1">No strategies found</h3>
            <p className="text-sm text-gray-600 mb-3">
              {searchTerm ? 'Try adjusting your search terms.' : 'Get started by adding your first strategy.'}
            </p>
            {!searchTerm && (
              <button
                onClick={openModal}
                className="inline-flex items-center gap-1 bg-primary-600 hover:bg-primary-700 text-white px-3 py-2 rounded-lg font-medium transition-colors text-sm"
              >
                <Plus size={16} />
                Add First Strategy
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
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-3">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 transform transition-all duration-200">
              <div className="px-4 py-3 border-b border-gray-100">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">
                      {editingStrategyId ? "Edit Strategy" : "Add New Strategy"}
                    </h2>
                    <p className="text-xs text-gray-500">
                      {editingStrategyId ? "Update strategy details" : "Create a new coping strategy"}
                    </p>
                  </div>
                  <button
                    onClick={closeModal}
                    className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
              <form onSubmit={handleSubmit} className="p-4">
                <div className="space-y-3">
                  <div>
                    <label htmlFor="category" className="block text-xs font-medium text-gray-700 mb-1">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="category"
                      name="category"
                      type="text"
                      required
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 text-sm placeholder-gray-400"
                      placeholder="Enter strategy category"
                    />
                  </div>
                  <div>
                    <label htmlFor="color" className="block text-xs font-medium text-gray-700 mb-1">
                      Color <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="color"
                      name="color"
                      type="text"
                      required
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 text-sm placeholder-gray-400"
                      placeholder="Enter color (e.g., #FF0000)"
                    />
                  </div>
                  <div>
                    <label htmlFor="icon" className="block text-xs font-medium text-gray-700 mb-1">
                      Icon <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="icon"
                      name="icon"
                      type="text"
                      required
                      value={icon}
                      onChange={(e) => setIcon(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 text-sm placeholder-gray-400"
                      placeholder="Enter icon name"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Tips <span className="text-red-500">*</span>
                    </label>
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newTip}
                          onChange={(e) => setNewTip(e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 text-sm placeholder-gray-400"
                          placeholder="Enter a new tip"
                        />
                        <button
                          type="button"
                          onClick={handleAddTip}
                          disabled={!newTip.trim()}
                          className="px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-primary-300 disabled:cursor-not-allowed transition-colors text-sm"
                        >
                          Add
                        </button>
                      </div>
                      <ul className="space-y-2 max-h-32 overflow-y-auto">
                        {tips.map((tip, index) => (
                          <li key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded-lg">
                            <span className="text-xs text-gray-700">{tip}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveTip(index)}
                              className="p-1 text-red-500 hover:text-red-700"
                            >
                              <X size={14} />
                            </button>
                          </li>
                        ))}
                      </ul>
                      {tips.length === 0 && (
                        <p className="text-xs text-red-500">At least one tip is required</p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2 mt-4">
                  <button
                    type="submit"
                    disabled={isLoading || tips.length === 0}
                    className="flex-1 bg-primary-600 text-white py-2 px-3 rounded-lg font-medium hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-200 transition-all duration-200 disabled:bg-primary-300 disabled:cursor-not-allowed text-sm"
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center">
                        <RefreshCw className="w-4 h-4 animate-spin mr-1" />
                        {editingStrategyId ? 'Updating...' : 'Adding...'}
                      </span>
                    ) : (
                      editingStrategyId ? "Update Strategy" : "Add Strategy"
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 bg-gray-100 text-gray-700 py-2 px-3 rounded-lg font-medium hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all duration-200 text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* View Modal */}
        {isViewModalOpen && selectedStrategy && (
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-3">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-xl mx-4 max-h-[85vh] overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center text-white">
                      <Heart size={16} />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-gray-900">Strategy Details</h2>
                      <p className="text-xs text-gray-500">View complete coping strategy information</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsViewModalOpen(false)}
                    className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
              <div className="p-4 overflow-y-auto max-h-[calc(85vh-100px)]">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Category</label>
                    <h3 className="text-xl font-bold text-gray-900">{selectedStrategy.category || 'No category available'}</h3>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Icon</label>
                    <p className="text-sm text-gray-800">{selectedStrategy.icon || 'No icon available'}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Color</label>
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full" style={{ backgroundColor: selectedStrategy.color || '#000000' }}></div>
                      <p className="text-sm text-gray-800">{selectedStrategy.color || 'No color available'}</p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Tips</label>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <ul className="list-disc list-inside space-y-2">
                        {selectedStrategy.tips && Array.isArray(selectedStrategy.tips) && selectedStrategy.tips.length > 0 ? (
                          selectedStrategy.tips.map((tip, index) => (
                            <li key={index} className="text-sm text-gray-800">{tip}</li>
                          ))
                        ) : (
                          <p className="text-sm text-gray-800">No tips available</p>
                        )}
                      </ul>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => {
                        setIsViewModalOpen(false);
                        handleEdit(selectedStrategy);
                      }}
                      className="flex-1 flex items-center justify-center gap-1 bg-primary-600 text-white py-2 px-3 rounded-lg font-medium hover:bg-primary-700 transition-colors text-sm"
                    >
                      <Edit size={14} />
                      Edit Strategy
                    </button>
                    <button
                      onClick={() => {
                        setIsViewModalOpen(false);
                        handleDelete(selectedStrategy.id);
                      }}
                      className="flex-1 flex items-center justify-center gap-1 bg-red-600 text-white py-2 px-3 rounded-lg font-medium hover:bg-red-700 transition-colors text-sm"
                    >
                      <Trash2 size={14} />
                      Delete Strategy
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