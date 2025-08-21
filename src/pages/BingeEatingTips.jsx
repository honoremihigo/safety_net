import React, { useEffect, useState } from "react";
import { Plus, Edit, Trash2, X, ChevronLeft, ChevronRight, BookOpen, Tag, FileText } from "lucide-react";
import { addTip, getAllTips, updateTip, deleteTip } from "../services/bingeEatingTipsService";
import { isAuthenticated } from "../services/authService";
import { useNavigate } from "react-router-dom";

export default function BingeEatingTipsManagement() {
  const [tips, setTips] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [editingTipId, setEditingTipId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const tipsPerPage = 5;
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/");
    } else {
      fetchTips();
    }
  }, [navigate]);

  const fetchTips = async () => {
    try {
      const fetchedTips = await getAllTips();
      setTips(fetchedTips);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (editingTipId) {
        await updateTip(editingTipId, { title, content, category });
        setEditingTipId(null);
      } else {
        await addTip({ title, content, category });
      }
      setTitle("");
      setContent("");
      setCategory("");
      setIsModalOpen(false);
      setCurrentPage(1);
      fetchTips();
    } catch (error) {
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (tip) => {
    setEditingTipId(tip.id);
    setTitle(tip.title);
    setContent(tip.content);
    setCategory(tip.category);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this tip?")) {
      try {
        await deleteTip(id);
        setCurrentPage(1);
        fetchTips();
      } catch (error) {
        alert(error.message);
      }
    }
  };

  const openModal = () => {
    setEditingTipId(null);
    setTitle("");
    setContent("");
    setCategory("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTipId(null);
    setTitle("");
    setContent("");
    setCategory("");
  };

  // Pagination logic
  const totalPages = Math.ceil(tips.length / tipsPerPage);
  const indexOfLastTip = currentPage * tipsPerPage;
  const indexOfFirstTip = indexOfLastTip - tipsPerPage;
  const currentTips = tips.slice(indexOfFirstTip, indexOfLastTip);

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="inline-flex items-center justify-center w-10 h-10 bg-indigo-100 rounded-full mr-3">
              <BookOpen className="h-5 w-5 text-indigo-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Tips Dashboard</h1>
          </div>
          <button
            onClick={openModal}
            className="inline-flex items-center bg-indigo-600 text-white py-1.5 px-5 rounded-lg font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Tip
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <FileText className="h-5 w-5 text-indigo-600" />
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-500">Total Tips</p>
                <p className="text-lg font-bold text-gray-900">{tips.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Tag className="h-5 w-5 text-indigo-600" />
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-500">Categories</p>
                <p className="text-lg font-bold text-gray-900">
                  {[...new Set(tips.map(tip => tip.category))].length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <BookOpen className="h-5 w-5 text-indigo-600" />
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-500">Current Page</p>
                <p className="text-lg font-bold text-gray-900">{currentPage}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tips List Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900">Tips Collection</h2>
            <p className="text-sm text-gray-500">Browse your tips</p>
          </div>
          
          <div className="p-6">
            {tips.length === 0 ? (
              <div className="text-center py-10">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                  <FileText className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">No tips yet</h3>
                <p className="text-sm text-gray-500 mb-4">Add your first tip to start!</p>
                <button
                  onClick={openModal}
                  className="inline-flex items-center bg-indigo-600 text-white py-1 px-4 rounded-lg font-medium hover:bg-indigo-700 transition-colors duration-200"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add First Tip
                </button>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {currentTips.map((tip) => (
                    <div
                      key={tip.id}
                      className="group relative bg-gradient-to-r from-gray-50 to-white rounded-lg border border-gray-200 p-4 hover:shadow-md hover:border-indigo-200 transition-all duration-200"
                    >
                      <div className="absolute top-3 left-3 w-1 h-12 bg-indigo-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                      <div className="flex justify-between items-start">
                        <div className="flex-1 ml-5">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="text-base font-bold text-gray-900 group-hover:text-indigo-600 transition-colors duration-200">
                              {tip.title}
                            </h3>
                            <div className="flex items-center space-x-1 ml-3">
                              <button
                                onClick={() => handleEdit(tip)}
                                className="p-1 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-all duration-200"
                                title="Edit Tip"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(tip.id)}
                                className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-all duration-200"
                                title="Delete Tip"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                          <p className="text-sm text-gray-700 leading-relaxed mb-3">{tip.content}</p>
                          <div className="inline-flex items-center px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs font-medium rounded-full">
                            <Tag className="h-3 w-3 mr-1" />
                            {tip.category}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-8 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="flex items-center px-3 py-1 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-all duration-200 font-medium text-sm"
                      >
                        <ChevronLeft className="h-3 w-3 mr-1" />
                        Prev
                      </button>
                      
                      <div className="hidden sm:flex items-center space-x-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`px-2 py-1 rounded-lg font-medium text-sm transition-all duration-200 ${
                              currentPage === page
                                ? 'bg-indigo-600 text-white'
                                : 'text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            {page}
                          </button>
                        ))}
                      </div>
                      
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="flex items-center px-3 py-1 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-all duration-200 font-medium text-sm"
                      >
                        Next
                        <ChevronRight className="h-3 w-3 ml-1" />
                      </button>
                    </div>
                    
                    <div className="text-xs text-gray-500 bg-gray-50 px-3 py-1 rounded-lg">
                      Page <span className="font-semibold text-gray-900">{currentPage}</span> of{" "}
                      <span className="font-semibold text-gray-900">{totalPages}</span>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 transform transition-all duration-200">
              <div className="px-6 py-4 border-b border-gray-100">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">
                      {editingTipId ? "Edit Tip" : "Add Tip"}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {editingTipId ? "Update tip" : "Create new tip"}
                    </p>
                  </div>
                  <button
                    onClick={closeModal}
                    className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-all duration-200"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <label htmlFor="title" className="block text-xs font-semibold text-gray-700 mb-1">
                      Title
                    </label>
                    <input
                      id="title"
                      name="title"
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 text-sm text-gray-900 placeholder-gray-400"
                      placeholder="Enter tip title"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="content" className="block text-xs font-semibold text-gray-700 mb-1">
                      Content
                    </label>
                    <textarea
                      id="content"
                      name="content"
                      required
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 text-sm text-gray-900 placeholder-gray-400 resize-none"
                      placeholder="Share tip details..."
                      rows="4"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="category" className="block text-xs font-semibold text-gray-700 mb-1">
                      Category
                    </label>
                    <input
                      id="category"
                      name="category"
                      type="text"
                      required
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 text-sm text-gray-900 placeholder-gray-400"
                      placeholder="e.g., Nutrition, Mindfulness"
                    />
                  </div>
                </div>
                
                <div className="flex space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-lg font-medium text-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all duration-200 disabled:bg-indigo-300 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center">
                        <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-1"></div>
                        Processing...
                      </span>
                    ) : (
                      editingTipId ? "Update" : "Add"
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium text-sm hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all duration-200"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}