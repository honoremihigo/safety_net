import React, { useEffect, useState } from "react";
import { Search, Eye, ChevronLeft, ChevronRight, MessageSquare, BookOpen, FileText, X } from "lucide-react";
import { getAllCrisisMessages } from "../services/crisisMessageService";
import { isAuthenticated } from "../services/authService";
import { useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';

export default function CrisisMessagesManagement() {
  const [messages, setMessages] = useState([]);
  const [filteredMessages, setFilteredMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [itemsPerPage] = useState(5);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/");
    } else {
      fetchMessages();
    }
  }, [navigate]);

  useEffect(() => {
    const filtered = messages.filter(message =>
      message.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.message?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredMessages(filtered);
    setCurrentPage(1);
  }, [searchTerm, messages]);

  const fetchMessages = async () => {
    setIsLoading(true);
    try {
      const fetchedMessages = await getAllCrisisMessages();
      setMessages(fetchedMessages);
      setFilteredMessages(fetchedMessages);
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: `Failed to fetch messages: ${error.message}`,
        position: 'center',
        confirmButtonColor: '#6366f1'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleView = (message) => {
    setSelectedMessage(message);
    setIsViewModalOpen(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const truncateText = (text, maxLength = 100) => {
    if (!text || text.length <= maxLength) return text || '';
    return text.substr(0, maxLength) + '...';
  };

  // Pagination calculations
  const totalPages = Math.ceil(filteredMessages.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentMessages = filteredMessages.slice(startIndex, endIndex);

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
          Showing {startIndex + 1} to {Math.min(endIndex, filteredMessages.length)} of {filteredMessages.length} entries
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
        {currentMessages.map((message, index) => (
          <div key={message.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-2 flex-1 min-w-0">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center text-white flex-shrink-0">
                    <MessageSquare size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate text-xs" title={message.name}>
                      {message.isAnonymous ? 'Anonymous' : message.name}
                    </h3>
                    <p className="text-[10px] text-gray-500">{message.category}</p>
                  </div>
                </div>
                <div className="flex gap-0.5 flex-shrink-0">
                  <button
                    onClick={() => handleView(message)}
                    className="p-1 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    title="View message"
                  >
                    <Eye size={12} />
                  </button>
                </div>
              </div>
              <div className="mb-3">
                <p className="text-xs text-gray-600 leading-relaxed">
                  {truncateText(message.message, 80)}
                </p>
                <p className="text-[10px] text-gray-500 mt-0.5">
                  {formatDate(message.timestamp?.toDate?.())}
                </p>
              </div>
            </div>
          </div>
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
              <th className="px-4 py-2 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider">Category</th>
              <th className="px-4 py-2 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider">Message</th>
              <th className="px-4 py-2 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-4 py-2 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentMessages.map((message, index) => (
              <tr key={message.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-1.5 whitespace-nowrap">
                  <span className="text-xs font-mono text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded">
                    {startIndex + index + 1}
                  </span>
                </td>
                <td className="px-4 py-1.5 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center text-white">
                      <MessageSquare size={14} />
                    </div>
                    <div className="max-w-40">
                      <div className="font-medium text-gray-900 truncate text-xs" title={message.name}>
                        {message.isAnonymous ? 'Anonymous' : message.name}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-1.5 whitespace-nowrap">
                  <div className="text-xs text-gray-600 truncate" title={message.category}>
                    {message.category}
                  </div>
                </td>
                <td className="px-4 py-1.5">
                  <div className="max-w-xs">
                    <p className="text-xs text-gray-600 truncate" title={message.message}>
                      {truncateText(message.message, 40)}
                    </p>
                  </div>
                </td>
                <td className="px-4 py-1.5 whitespace-nowrap">
                  <div className="text-xs text-gray-600">
                    {formatDate(message.timestamp?.toDate?.())}
                  </div>
                </td>
                <td className="px-4 py-1.5 whitespace-nowrap">
                  <button
                    onClick={() => handleView(message)}
                    className="p-1 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    title="View Details"
                  >
                    <Eye size={14} />
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
    <div className="bg-gray-50 p-3 sm:p-4 lg:p-6">
      <div className="h-full overflow-y-auto mx-auto">
        {/* Header Section */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 bg-primary-600 rounded-lg">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Feadback Management</h1>
          </div>
          <p className="text-sm text-gray-600">View and manage crisis messages</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-100 rounded-lg">
                <FileText className="h-5 w-5 text-primary-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">Total Messages</p>
                <p className="text-xl font-bold text-gray-900">{messages.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <BookOpen className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">Filtered Messages</p>
                <p className="text-xl font-bold text-gray-900">{filteredMessages.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-4 p-4">
          <div className="relative flex-grow max-w-md">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search messages by name, category, or content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-sm"
            />
          </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="text-center py-8">
            <div className="inline-flex items-center gap-2">
              <div className="w-4 h-4 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
              <p className="text-sm text-gray-600">Loading messages...</p>
            </div>
          </div>
        ) : filteredMessages.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-base font-medium text-gray-900 mb-1">No messages found</h3>
            <p className="text-sm text-gray-600 mb-3">
              {searchTerm ? 'Try adjusting your search terms.' : 'No crisis messages available.'}
            </p>
          </div>
        ) : (
          <>
            <CardView />
            <TableView />
          </>
        )}

        {/* View Modal */}
        {isViewModalOpen && selectedMessage && (
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-3">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-xl mx-4 max-h-[85vh] overflow-hidden">
              {/* Header */}
              <div className="px-4 py-3 border-b border-gray-100">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center text-white">
                      <MessageSquare size={16} />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-gray-900">Message Details</h2>
                      <p className="text-xs text-gray-500">View complete crisis message information</p>
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

              {/* Body */}
              <div className="p-4 overflow-y-auto max-h-[calc(85vh-100px)]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Name */}
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Name</label>
                    <h3 className="text-xl font-bold text-gray-900">
                      {selectedMessage.isAnonymous ? 'Anonymous' : selectedMessage.name || 'No name available'}
                    </h3>
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Category</label>
                    <p className="text-sm text-gray-800">{selectedMessage.category || 'No category available'}</p>
                  </div>

                  {/* Date */}
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Date</label>
                    <p className="text-sm text-gray-800">
                      {selectedMessage.timestamp?.toDate ? formatDate(selectedMessage.timestamp.toDate()) : 'No date available'}
                    </p>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Email</label>
                    <p className="text-sm text-gray-800">{selectedMessage.email || 'No email available'}</p>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Phone</label>
                    <p className="text-sm text-gray-800">{selectedMessage.phone || 'No phone available'}</p>
                  </div>

                  {/* Contact */}
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Contact</label>
                    <p className="text-sm text-gray-800">{selectedMessage.contact || 'No contact available'}</p>
                  </div>

                  {/* First Name */}
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">First Name</label>
                    <p className="text-sm text-gray-800">{selectedMessage.firstName || 'No first name available'}</p>
                  </div>

                  {/* Last Name */}
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Last Name</label>
                    <p className="text-sm text-gray-800">{selectedMessage.lastName || 'No last name available'}</p>
                  </div>

                  {/* Rating */}
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Rating</label>
                    <p className="text-sm text-gray-800">{selectedMessage.rating || 'No rating available'}</p>
                  </div>

                  {/* Urgent */}
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Urgent</label>
                    <p className="text-sm text-gray-800">{selectedMessage.isUrgent ? 'Yes' : 'No'}</p>
                  </div>

                  {/* Anonymous */}
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Anonymous</label>
                    <p className="text-sm text-gray-800">{selectedMessage.isAnonymous ? 'Yes' : 'No'}</p>
                  </div>

                  {/* Message content - full width */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Message</label>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                        {selectedMessage.message || 'No message available'}
                      </p>
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