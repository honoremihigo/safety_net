import React, { useEffect, useState } from "react";
import { Plus, Edit, Trash2, X, ChevronLeft, ChevronRight, BookOpen, FileText, Search, RefreshCw, Phone, Eye } from "lucide-react";
import { addCrisisContact, getAllCrisisContacts, updateCrisisContact, deleteCrisisContact } from "../services/crisisContactsService";
import { isAuthenticated } from "../services/authService";
import { useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';

export default function CrisisContactsManagement() {
  const [contacts, setContacts] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [description, setDescription] = useState("");
  const [editingContactId, setEditingContactId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [itemsPerPage] = useState(5);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/");
    } else {
      fetchContacts();
    }
  }, [navigate]);

  useEffect(() => {
    const filtered = contacts.filter(c =>
      c && c.name && c.phone && c.description &&
      (c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
       c.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
       c.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredContacts(filtered);
    setCurrentPage(1);
  }, [searchTerm, contacts]);

  const fetchContacts = async (showRefreshLoader = false) => {
    if (showRefreshLoader) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    
    try {
      const fetchedContacts = await getAllCrisisContacts();
      const validContacts = fetchedContacts.filter(c => 
        c && typeof c.name === 'string' && typeof c.phone === 'string' && typeof c.description === 'string'
      );
      setContacts(validContacts);
      setFilteredContacts(validContacts);
      
      if (validContacts.length !== fetchedContacts.length) {
        console.warn(`Filtered out ${fetchedContacts.length - validContacts.length} invalid contacts missing name, phone, or description`);
      }

      if (showRefreshLoader) {
        Swal.fire({
          icon: 'success',
          title: 'Refreshed!',
          text: 'Contacts refreshed successfully!',
          position: 'center',
          timer: 2000,
          showConfirmButton: false
        });
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: `Failed to fetch contacts: ${error.message}`,
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
      if (editingContactId) {
        await updateCrisisContact(editingContactId, { name, phone, description });
        Swal.fire({
          icon: 'success',
          title: 'Updated!',
          text: 'Contact updated successfully!',
          position: 'center',
          timer: 2000,
          showConfirmButton: false
        });
        setEditingContactId(null);
      } else {
        await addCrisisContact({ name, phone, description });
        Swal.fire({
          icon: 'success',
          title: 'Added!',
          text: 'Contact added successfully!',
          position: 'center',
          timer: 2000,
          showConfirmButton: false
        });
      }
      setName("");
      setPhone("");
      setDescription("");
      setIsModalOpen(false);
      setCurrentPage(1);
      fetchContacts();
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: `Failed to ${editingContactId ? 'update' : 'add'} contact: ${error.message}`,
        position: 'center',
        confirmButtonColor: '#6366f1'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (c) => {
    if (!c || !c.name || !c.phone || !c.description) {
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'Cannot edit contact: Missing name, phone, or description',
        position: 'center',
        confirmButtonColor: '#6366f1'
      });
      return;
    }
    setEditingContactId(c.id);
    setName(c.name);
    setPhone(c.phone);
    setDescription(c.description);
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
        await deleteCrisisContact(id);
        setCurrentPage(1);
        Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'Contact has been deleted successfully!',
          position: 'center',
          timer: 2000,
          showConfirmButton: false
        });
        fetchContacts();
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: `Failed to delete contact: ${error.message}`,
          position: 'center',
          confirmButtonColor: '#6366f1'
        });
      }
    }
  };

  const handleView = (c) => {
    if (!c || !c.name || !c.phone || !c.description) {
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'Cannot view contact: Missing name, phone, or description',
        position: 'center',
        confirmButtonColor: '#6366f1'
      });
      return;
    }
    setSelectedContact(c);
    setIsViewModalOpen(true);
  };

  const openModal = () => {
    setEditingContactId(null);
    setName("");
    setPhone("");
    setDescription("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingContactId(null);
    setName("");
    setPhone("");
    setDescription("");
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
  const totalPages = Math.ceil(filteredContacts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentContacts = filteredContacts.slice(startIndex, endIndex);

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
          Showing {startIndex + 1} to {Math.min(endIndex, filteredContacts.length)} of {filteredContacts.length} entries
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
        {currentContacts.map((c, index) => (
          c && c.name && c.phone && c.description ? (
            <div key={c.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="p-4">
                {/* Contact Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-2 flex-1 min-w-0">
                    <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center text-white flex-shrink-0">
                      <Phone size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate text-xs" title={c.name}>
                        {c.name}
                      </h3>
                      <p className="text-[10px] text-gray-500">{c.phone}</p>
                    </div>
                  </div>
                  {/* Action Buttons */}
                  <div className="flex gap-0.5 flex-shrink-0">
                    <button
                      onClick={() => handleView(c)}
                      className="p-1 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="View contact"
                    >
                      <Eye size={12} />
                    </button>
                    <button
                      onClick={() => handleEdit(c)}
                      className="p-1 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                      title="Edit contact"
                    >
                      <Edit size={12} />
                    </button>
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete contact"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
                {/* Contact Description */}
                <div className="mb-3">
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {truncateText(c.description, 80)}
                  </p>
                </div>
              </div>
            </div>
          ) : null
        ))}
      </div>
      
      {/* Pagination for Cards */}
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
              <th className="px-4 py-2 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider">Phone</th>
              <th className="px-4 py-2 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th className="px-4 py-2 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentContacts.map((c, index) => (
              c && c.name && c.phone && c.description ? (
                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-1.5 whitespace-nowrap">
                    <span className="text-xs font-mono text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded">
                      {startIndex + index + 1}
                    </span>
                  </td>
                  <td className="px-4 py-1.5 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center text-white">
                        <Phone size={14} />
                      </div>
                      <div className="max-w-40">
                        <div className="font-medium text-gray-900 truncate text-xs" title={c.name}>
                          {c.name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-1.5 whitespace-nowrap">
                    <span className="text-xs text-gray-600">{c.phone}</span>
                  </td>
                  <td className="px-4 py-1.5">
                    <div className="max-w-xs">
                      <p className="text-xs text-gray-600 truncate" title={c.description}>
                        {truncateText(c.description, 50)}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-1.5 whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleView(c)}
                        className="p-1 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        onClick={() => handleEdit(c)}
                        className="p-1 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(c.id)}
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
              <Phone className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Crisis Contacts Management</h1>
          </div>
          <p className="text-sm text-gray-600">Manage and organize crisis contact information</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-100 rounded-lg">
                <FileText className="h-5 w-5 text-primary-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">Total Contacts</p>
                <p className="text-xl font-bold text-gray-900">{contacts.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <BookOpen className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">Filtered Contacts</p>
                <p className="text-xl font-bold text-gray-900">{filteredContacts.length}</p>
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
                placeholder="Search contacts by name, phone, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-sm"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => fetchContacts(true)}
                disabled={isRefreshing}
                className="flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm disabled:opacity-50"
              >
                <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
                Refresh
              </button>
              <button
                onClick={openModal}
                disabled={isLoading}
                className="flex items-center gap-1.5 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
              >
                <Plus size={16} />
                Add Contact
              </button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && !isRefreshing ? (
          <div className="text-center py-8">
            <div className="inline-flex items-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-primary-600" />
              <p className="text-sm text-gray-600">Loading contacts...</p>
            </div>
          </div>
        ) : filteredContacts.length === 0 ? (
          <div className="text-center py-8">
            <Phone className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-base font-medium text-gray-900 mb-1">No contacts found</h3>
            <p className="text-sm text-gray-600 mb-3">
              {searchTerm ? 'Try adjusting your search terms.' : 'Get started by adding your first contact.'}
            </p>
            {!searchTerm && (
              <button
                onClick={openModal}
                className="inline-flex items-center gap-1.5 bg-primary-600 hover:bg-primary-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                <Plus size={16} />
                Add First Contact
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
            <div className="bg-white rounded-lg shadow-xl w-full max-w-sm mx-4 transform transition-all duration-200">
              <div className="px-4 py-3 border-b border-gray-100">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-base font-bold text-gray-900">
                      {editingContactId ? "Edit Contact" : "Add New Contact"}
                    </h2>
                    <p className="text-xs text-gray-500">
                      {editingContactId ? "Update contact details" : "Create a new crisis contact"}
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
                    <label htmlFor="name" className="block text-xs font-medium text-gray-700 mb-0.5">
                      Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 text-sm placeholder-gray-400"
                      placeholder="Enter contact name"
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-xs font-medium text-gray-700 mb-0.5">
                      Phone <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="text"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 text-sm placeholder-gray-400"
                      placeholder="Enter contact phone number"
                    />
                  </div>
                  <div>
                    <label htmlFor="description" className="block text-xs font-medium text-gray-700 mb-0.5">
                      Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      required
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 text-sm placeholder-gray-400 resize-none"
                      placeholder="Enter contact description..."
                      rows="3"
                    />
                  </div>
                </div>
                <div className="flex space-x-2 mt-4">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 bg-primary-600 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-200 transition-all duration-200 disabled:bg-primary-300 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center">
                        <RefreshCw className="w-3 h-3 animate-spin mr-1" />
                        {editingContactId ? 'Updating...' : 'Adding...'}
                      </span>
                    ) : (
                      editingContactId ? "Update Contact" : "Add Contact"
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 bg-gray-100 text-gray-700 py-2 px-3 rounded-lg text-sm font-medium hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all duration-200"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* View Modal */}
        {isViewModalOpen && selectedContact && (
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-3">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 max-h-[85vh] overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center text-white">
                      <Phone size={16} />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-gray-900">Contact Details</h2>
                      <p className="text-xs text-gray-500">View complete crisis contact information</p>
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
                    <h3 className="text-xl font-bold text-gray-900">{selectedContact.name || 'No name available'}</h3>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Phone</label>
                    <p className="text-sm text-gray-800">{selectedContact.phone || 'No phone available'}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">{selectedContact.description || 'No description available'}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => {
                        setIsViewModalOpen(false);
                        handleEdit(selectedContact);
                      }}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-primary-600 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
                    >
                      <Edit size={14} />
                      Edit Contact
                    </button>
                    <button
                      onClick={() => {
                        setIsViewModalOpen(false);
                        handleDelete(selectedContact.id);
                      }}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-red-600 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
                    >
                      <Trash2 size={14} />
                      Delete Contact
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