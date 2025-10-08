import React, { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, BookOpen, FileText, Search, RefreshCw, Star, Eye, Calendar,X } from "lucide-react";
import { getAllTestimonials } from "../services/testimonialsService";
import { isAuthenticated } from "../services/authService";
import { useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';

export default function TestimonialsManagement() {
  const [testimonials, setTestimonials] = useState([]);
  const [filteredTestimonials, setFilteredTestimonials] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedTestimonial, setSelectedTestimonial] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [itemsPerPage] = useState(5);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/");
    } else {
      fetchTestimonials();
    }
  }, [navigate]);

  useEffect(() => {
    const filtered = testimonials.filter(t =>
      t && t.content && t.name && t.rating !== undefined && t.userId &&
      (t.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
       t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
       t.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
       String(t.rating).includes(searchTerm.toLowerCase()))
    );
    setFilteredTestimonials(filtered);
    setCurrentPage(1);
  }, [searchTerm, testimonials]);

  const fetchTestimonials = async (showRefreshLoader = false) => {
    if (showRefreshLoader) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    
    try {
      const fetchedTestimonials = await getAllTestimonials();
      // Validate and filter testimonials to ensure they have required fields
      const validTestimonials = fetchedTestimonials.filter(t => 
        t && typeof t.content === 'string' && typeof t.name === 'string' && 
        typeof t.rating === 'number' && typeof t.userId === 'string'
      );
      setTestimonials(validTestimonials);
      setFilteredTestimonials(validTestimonials);
      
      if (validTestimonials.length !== fetchedTestimonials.length) {
        console.warn(`Filtered out ${fetchedTestimonials.length - validTestimonials.length} invalid testimonials missing required fields`);
      }

      if (showRefreshLoader) {
        Swal.fire({
          icon: 'success',
          title: 'Refreshed!',
          text: 'Testimonials refreshed successfully!',
          position: 'center',
          timer: 2000,
          showConfirmButton: false
        });
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: `Failed to fetch testimonials: ${error.message}`,
        position: 'center',
        confirmButtonColor: '#6366f1'
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleView = (t) => {
    if (!t || !t.content || !t.name || t.rating === undefined || !t.userId) {
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'Cannot view testimonial: Missing required fields',
        position: 'center',
        confirmButtonColor: '#6366f1'
      });
      return;
    }
    setSelectedTestimonial(t);
    setIsViewModalOpen(true);
  };

  const formatDate = (dateField) => {
    if (!dateField) return 'Unknown';
    // Handle Firestore Timestamp
    const date = dateField.toDate ? dateField.toDate() : new Date(dateField);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const truncateText = (text, maxLength = 100) => {
    if (!text || typeof text !== 'string') return 'No content available';
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
  };

  // Pagination calculations
  const totalPages = Math.ceil(filteredTestimonials.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTestimonials = filteredTestimonials.slice(startIndex, endIndex);

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

  // Render stars for rating
  const renderStars = (rating) => {
    const stars = [];
    const maxStars = 5;
    for (let i = 1; i <= maxStars; i++) {
      stars.push(
        <Star
          key={i}
          size={16}
          className={i <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}
        />
      );
    }
    return <div className="flex gap-1">{stars}</div>;
  };

  // Pagination Component
  const PaginationComponent = () => (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-gray-200 bg-gray-50">
      <div className="flex items-center gap-4">
        <p className="text-sm text-gray-600">
          Showing {startIndex + 1} to {Math.min(endIndex, filteredTestimonials.length)} of {filteredTestimonials.length} entries
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
        {currentTestimonials.map((t, index) => (
          t && t.content && t.name && t.rating !== undefined && t.userId ? (
            <div key={t.id} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="p-6">
                {/* Testimonial Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white flex-shrink-0">
                      <Star size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate text-sm" title={t.name}>
                        {t.name}
                      </h3>
                      <div className="text-xs text-gray-500">{renderStars(t.rating)}</div>
                    </div>
                  </div>
                  {/* Action Button */}
                  <div className="flex gap-1 flex-shrink-0">
                    <button
                      onClick={() => handleView(t)}
                      className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="View testimonial"
                    >
                      <Eye size={14} />
                    </button>
                  </div>
                </div>
                {/* Testimonial Content */}
                <div className="mb-4">
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {truncateText(t.content, 120)}
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Content</th>
              {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User ID</th> */}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentTestimonials.map((t, index) => (
              t && t.content && t.name && t.rating !== undefined && t.userId ? (
                <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-2 whitespace-nowrap">
                    <span className="text-sm font-mono text-gray-600 bg-gray-100 px-2 py-1 rounded">
                      {startIndex + index + 1}
                    </span>
                  </td>
                  <td className="px-6 py-2 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white">
                        <Star size={16} />
                      </div>
                      <div className="max-w-48">
                        <div className="font-medium text-gray-900 truncate" title={t.name}>
                          {t.name}
                        </div>
                      </div>
                    </div>
                  </td>
                    {/* <td className="px-6 py-2 whitespace-nowrap">
                    <span className="text-sm text-gray-600">{t.user.email}</span>
                  </td> */}
                  <td className="px-6 py-2 whitespace-nowrap">
                    <div className="text-sm text-gray-600">{renderStars(t.rating)}</div>
                  </td>
                  <td className="px-6 py-2">
                    <div className="max-w-xs">
                      <p className="text-sm text-gray-600 truncate" title={t.content}>
                        {truncateText(t.content, 60)}
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
    <div className="bg-gray-50 p-4  sm:p-6 lg:p-8">
      <div className="h-full overflow-y-auto mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-600 rounded-lg">
              <Star className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Testimonials Management</h1>
          </div>
          <p className="text-gray-600">View and organize testimonials</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-100 rounded-lg">
                <FileText className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Total Testimonials</p>
                <p className="text-2xl font-bold text-gray-900">{testimonials.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <BookOpen className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Filtered Testimonials</p>
                <p className="text-2xl font-bold text-gray-900">{filteredTestimonials.length}</p>
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
                placeholder="Search testimonials by name, content, user ID, or rating..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => fetchTestimonials(true)}
                disabled={isRefreshing}
                className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2.5 rounded-lg font-medium transition-colors shadow-sm disabled:opacity-50"
              >
                <RefreshCw size={18} className={isRefreshing ? 'animate-spin' : ''} />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && !isRefreshing ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center gap-3">
              <RefreshCw className="w-5 h-5 animate-spin text-indigo-600" />
              <p className="text-gray-600">Loading testimonials...</p>
            </div>
          </div>
        ) : filteredTestimonials.length === 0 ? (
          <div className="text-center py-12">
            <Star className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No testimonials found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm ? 'Try adjusting your search terms.' : 'No testimonials available.'}
            </p>
          </div>
        ) : (
          <>
            <CardView />
            <TableView />
          </>
        )}

        {/* View Modal */}
        {isViewModalOpen && selectedTestimonial && (
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4 max- overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white">
                      <Star size={20} />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">Testimonial Details</h2>
                      <p className="text-sm text-gray-500">View complete testimonial information</p>
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
                    <label className="block text-sm font-medium text-gray-500 mb-2">Name</label>
                    <h3 className="text-2xl font-bold text-gray-900">{selectedTestimonial.name || 'No name available'}</h3>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-2">Rating</label>
                    <div className="text-gray-800">{renderStars(selectedTestimonial.rating)}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-2">Content</label>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{selectedTestimonial.content || 'No content available'}</p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-2">User Info</label>
                    <p className="text-gray-800 text-sm"> <span className="  text-base ">names :</span> {selectedTestimonial.user.firstName || ''} {selectedTestimonial.user.lastName || ''}</p>
                    <p className="text-gray-800 text-sm">  <span className="  text-base ">email :</span>  {selectedTestimonial.user.email || ''} </p>
                    
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Created</label>
                      <div className="flex items-center gap-2 text-gray-700">
                        <Calendar size={16} />
                        <span>{formatDate(selectedTestimonial.timestamp)}</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Last Updated</label>
                      <div className="flex items-center gap-2 text-gray-700">
                        <Calendar size={16} />
                        <span>{formatDate(selectedTestimonial.updatedAt || selectedTestimonial.timestamp)}</span>
                      </div>
                    </div>
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