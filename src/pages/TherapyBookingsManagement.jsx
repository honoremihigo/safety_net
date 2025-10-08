import React, { useEffect, useState } from "react";
import { Search, Eye, ChevronLeft, ChevronRight, RefreshCw,Calendar, BookOpen, FileText, X } from "lucide-react";
import { getAllTherapyBookings } from "../services/therapyBookingService";
import { isAuthenticated } from "../services/authService";
import { useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';

export default function TherapyBookingsManagement() {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [itemsPerPage] = useState(5);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/");
    } else {
      fetchBookings();
    }
  }, [navigate]);

  useEffect(() => {
    const filtered = bookings.filter(booking =>
      booking && booking.name && booking.service && booking.therapist &&
      (booking.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
       booking.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
       booking.therapist.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredBookings(filtered);
    setCurrentPage(1);
  }, [searchTerm, bookings]);

  const fetchBookings = async (showRefreshLoader = false) => {
    if (showRefreshLoader) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    
    try {
      const fetchedBookings = await getAllTherapyBookings();
      const validBookings = fetchedBookings.filter(b => 
        b && typeof b.name === 'string' && typeof b.service === 'string' && 
        typeof b.therapist === 'string' && b.date && b.time
      );
      setBookings(validBookings);
      setFilteredBookings(validBookings);
      
      if (validBookings.length !== fetchedBookings.length) {
        console.warn(`Filtered out ${fetchedBookings.length - validBookings.length} invalid bookings missing required fields`);
      }

      if (showRefreshLoader) {
        Swal.fire({
          icon: 'success',
          title: 'Refreshed!',
          text: 'Bookings refreshed successfully!',
          position: 'center',
          timer: 1500,
          showConfirmButton: false
        });
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: `Failed to fetch bookings: ${error.message}`,
        position: 'center',
        confirmButtonColor: '#6366f1'
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleView = (booking) => {
    if (!booking || !booking.name || !booking.service || !booking.therapist || !booking.date || !booking.time) {
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'Cannot view booking: Missing required fields',
        position: 'center',
        confirmButtonColor: '#6366f1'
      });
      return;
    }
    setSelectedBooking(booking);
    setIsViewModalOpen(true);
  };

  const formatDate = (dateField) => {
    if (!dateField) return 'Unknown';
    const date = dateField.toDate ? dateField.toDate() : new Date(dateField);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const truncateText = (text, maxLength = 80) => {
    if (!text || typeof text !== 'string') return 'No content available';
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
  };

  // Pagination calculations
  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentBookings = filteredBookings.slice(startIndex, endIndex);

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
          Showing {startIndex + 1} to {Math.min(endIndex, filteredBookings.length)} of {filteredBookings.length} entries
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
        {currentBookings.map((booking, index) => (
          booking && booking.name && booking.service && booking.therapist && booking.date && booking.time ? (
            <div key={booking.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-2 flex-1 min-w-0">
                    <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center text-white flex-shrink-0">
                      <Calendar size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate text-xs" title={booking.name}>
                        {booking.name}
                      </h3>
                      <p className="text-[10px] text-gray-500">{booking.service}</p>
                    </div>
                  </div>
                  <div className="flex gap-0.5 flex-shrink-0">
                    <button
                      onClick={() => handleView(booking)}
                      className="p-1 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="View booking"
                    >
                      <Eye size={12} />
                    </button>
                  </div>
                </div>
                <div className="mb-3">
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {formatDate(booking.date)} • {booking.time}
                  </p>
                  <p className="text-xs text-gray-600">{truncateText(booking.notes, 80)}</p>
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
              <th className="px-4 py-2 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-4 py-2 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider">Service</th>
              <th className="px-4 py-2 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
              <th className="px-4 py-2 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider">Therapist</th>
              <th className="px-4 py-2 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentBookings.map((booking, index) => (
              booking && booking.name && booking.service && booking.therapist && booking.date && booking.time ? (
                <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-1.5 whitespace-nowrap">
                    <span className="text-xs font-mono text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded">
                      {startIndex + index + 1}
                    </span>
                  </td>
                  <td className="px-4 py-1.5 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center text-white">
                        <Calendar size={14} />
                      </div>
                      <div className="max-w-40">
                        <div className="font-medium text-gray-900 truncate text-xs" title={booking.name}>
                          {booking.name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-1.5 whitespace-nowrap">
                    <div className="text-xs text-gray-600 truncate" title={booking.service}>
                      {booking.service}
                    </div>
                  </td>
                  <td className="px-4 py-1.5 whitespace-nowrap">
                    <div className="text-xs text-gray-600">
                      {formatDate(booking.date)} {booking.time}
                    </div>
                  </td>
                  <td className="px-4 py-1.5 whitespace-nowrap">
                    <div className="text-xs text-gray-600 truncate" title={booking.therapist}>
                      {booking.therapist}
                    </div>
                  </td>
                  <td className="px-4 py-1.5 whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleView(booking)}
                        className="p-1 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye size={14} />
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
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Therapy Bookings Management</h1>
          </div>
          <p className="text-sm text-gray-600">View and manage therapy session bookings</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-100 rounded-lg">
                <FileText className="h-5 w-5 text-primary-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">Total Bookings</p>
                <p className="text-xl font-bold text-gray-900">{bookings.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <BookOpen className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">Filtered Bookings</p>
                <p className="text-xl font-bold text-gray-900">{filteredBookings.length}</p>
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
                placeholder="Search bookings by name, service, or therapist..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-sm"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => fetchBookings(true)}
                disabled={isRefreshing}
                className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg font-medium transition-colors shadow-sm disabled:opacity-50 text-sm"
              >
                <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && !isRefreshing ? (
          <div className="text-center py-8">
            <div className="inline-flex items-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-primary-600" />
              <p className="text-sm text-gray-600">Loading bookings...</p>
            </div>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-base font-medium text-gray-900 mb-1">No bookings found</h3>
            <p className="text-sm text-gray-600 mb-3">
              {searchTerm ? 'Try adjusting your search terms.' : 'No therapy bookings available.'}
            </p>
          </div>
        ) : (
          <>
            <CardView />
            <TableView />
          </>
        )}

        {/* View Modal */}
        {isViewModalOpen && selectedBooking && (
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-3">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-xl mx-4 max-h-[85vh] overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center text-white">
                      <Calendar size={16} />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-gray-900">Booking Details</h2>
                      <p className="text-xs text-gray-500">View complete therapy booking information</p>
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
                    <label className="block text-xs font-medium text-gray-500 mb-1">Name</label>
                    <h3 className="text-xl font-bold text-gray-900">{selectedBooking.name || 'No name available'}</h3>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Service</label>
                    <p className="text-sm text-gray-800">{selectedBooking.service || 'No service available'}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Therapist</label>
                    <p className="text-sm text-gray-800">{selectedBooking.therapist || 'No therapist available'}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Date & Time</label>
                    <p className="text-sm text-gray-800">
                      {formatDate(selectedBooking.date)} {selectedBooking.time || ''}
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Duration</label>
                    <p className="text-sm text-gray-800">{selectedBooking.duration ? `${selectedBooking.duration} minutes` : 'No duration available'}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Email</label>
                    <p className="text-sm text-gray-800">{selectedBooking.email || 'No email available'}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Phone</label>
                    <p className="text-sm text-gray-800">{selectedBooking.phone || 'No phone available'}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
                    <p className="text-sm text-gray-800">{selectedBooking.status || 'No status available'}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Urgent</label>
                    <p className="text-sm text-gray-800">{selectedBooking.isUrgent ? 'Yes' : 'No'}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Notes</label>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">{selectedBooking.notes || 'No notes available'}</p>
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