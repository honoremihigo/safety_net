import React, { useEffect, useState } from "react";
import { Search, Eye, ChevronLeft, ChevronRight, Calendar, BookOpen, FileText, X } from "lucide-react";
import { getAllTherapyBookings } from "../services/therapyBookingService";
import { isAuthenticated } from "../services/authService";
import { useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';

export default function TherapyBookingsManagement() {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
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
      booking.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.service?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.therapist?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredBookings(filtered);
    setCurrentPage(1);
  }, [searchTerm, bookings]);

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      const fetchedBookings = await getAllTherapyBookings();
      setBookings(fetchedBookings);
      setFilteredBookings(fetchedBookings);
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
    }
  };

  const handleView = (booking) => {
    setSelectedBooking(booking);
    setIsViewModalOpen(true);
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
    if (!text || text.length <= maxLength) return text || '';
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
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-gray-200 bg-gray-50">
      <div className="flex items-center gap-4">
        <p className="text-sm text-gray-600">
          Showing {startIndex + 1} to {Math.min(endIndex, filteredBookings.length)} of {filteredBookings.length} entries
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
        {currentBookings.map((booking, index) => (
          <div key={booking.id} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white flex-shrink-0">
                    <Calendar size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate text-sm" title={booking.name}>
                      {booking.name}
                    </h3>
                    <p className="text-xs text-gray-500">{booking.service}</p>
                  </div>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button
                    onClick={() => handleView(booking)}
                    className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    title="View booking"
                  >
                    <Eye size={14} />
                  </button>
                </div>
              </div>
              <div className="mb-4">
                <p className="text-sm text-gray-600 leading-relaxed">
                  {formatDate(booking.date)} • {booking.time}
                </p>
                <p className="text-sm text-gray-600">{truncateText(booking.notes, 120)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Therapist</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentBookings.map((booking, index) => (
              <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-2 whitespace-nowrap">
                  <span className="text-sm font-mono text-gray-600 bg-gray-100 px-2 py-1 rounded">
                    {startIndex + index + 1}
                  </span>
                </td>
                <td className="px-6 py-2 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white">
                      <Calendar size={16} />
                    </div>
                    <div className="max-w-48">
                      <div className="font-medium text-gray-900 truncate" title={booking.name}>
                        {booking.name}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-2 whitespace-nowrap">
                  <div className="text-sm text-gray-600 truncate" title={booking.service}>
                    {booking.service}
                  </div>
                </td>
                <td className="px-6 py-2 whitespace-nowrap">
                  <div className="text-sm text-gray-600">
                    {formatDate(booking.date)} {booking.time}
                  </div>
                </td>
                <td className="px-6 py-2 whitespace-nowrap">
                  <div className="text-sm text-gray-600 truncate" title={booking.therapist}>
                    {booking.therapist}
                  </div>
                </td>
                <td className="px-6 py-2 whitespace-nowrap">
                  <button
                    onClick={() => handleView(booking)}
                    className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    title="View Details"
                  >
                    <Eye size={16} />
                  </button>
                </td>
              </tr>
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
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Therapy Bookings Management</h1>
          </div>
          <p className="text-gray-600">View and manage therapy session bookings</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-100 rounded-lg">
                <FileText className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Total Bookings</p>
                <p className="text-2xl font-bold text-gray-900">{bookings.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <BookOpen className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Filtered Bookings</p>
                <p className="text-2xl font-bold text-gray-900">{filteredBookings.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 p-6">
          <div className="relative flex-grow max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search bookings by name, service, or therapist..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            />
          </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center gap-3">
              <div className="w-5 h-5 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
              <p className="text-gray-600">Loading bookings...</p>
            </div>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
            <p className="text-gray-600 mb-4">
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
  <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl mx-4 max-h-[90vh] overflow-hidden">
      
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white">
              <Calendar size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Booking Details</h2>
              <p className="text-sm text-gray-500">View complete therapy booking information</p>
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

      {/* Body */}
      <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-2">Name</label>
            <h3 className="text-2xl font-bold text-gray-900">{selectedBooking.name || 'No name available'}</h3>
          </div>

          {/* Service */}
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-2">Service</label>
            <p className="text-gray-800">{selectedBooking.service || 'No service available'}</p>
          </div>

          {/* Therapist */}
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-2">Therapist</label>
            <p className="text-gray-800">{selectedBooking.therapist || 'No therapist available'}</p>
          </div>

          {/* Date & Time */}
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-2">Date & Time</label>
            <p className="text-gray-800">
              {selectedBooking.date
                ? new Date(selectedBooking.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })
                : 'No date available'}{' '}
              {selectedBooking.time || ''}
            </p>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-2">Duration</label>
            <p className="text-gray-800">{selectedBooking.duration ? `${selectedBooking.duration} minutes` : 'No duration available'}</p>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-2">Email</label>
            <p className="text-gray-800">{selectedBooking.email || 'No email available'}</p>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-2">Phone</label>
            <p className="text-gray-800">{selectedBooking.phone || 'No phone available'}</p>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-2">Status</label>
            <p className="text-gray-800">{selectedBooking.status || 'No status available'}</p>
          </div>

          {/* Urgent */}
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-2">Urgent</label>
            <p className="text-gray-800">{selectedBooking.isUrgent ? 'Yes' : 'No'}</p>
          </div>

          {/* Notes - full width */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-500 mb-2">Notes</label>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{selectedBooking.notes || 'No notes available'}</p>
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