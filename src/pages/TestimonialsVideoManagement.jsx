import React, { useEffect, useState } from "react";
import { Plus, Edit, Trash2, X, ChevronLeft, ChevronRight, Video, Search, RefreshCw, Eye, Play, Grid, List } from "lucide-react";
import { addTestimonialVideo, getAllTestimonialVideos, updateTestimonialVideo, deleteTestimonialVideo } from "../services/testimonialVideoService";
import { isAuthenticated } from "../services/authService";
import { useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';

export default function TestimonialVideoManagement() {
  const [videos, setVideos] = useState([]);
  const [filteprimaryVideos, setFilteprimaryVideos] = useState([]);
  const [title, setTitle] = useState("");
  const [videoLink, setVideoLink] = useState("");
  const [editingVideoId, setEditingVideoId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [itemsPerPage] = useState(6);
  const [previewUrl, setPreviewUrl] = useState("");
  const [viewMode, setViewMode] = useState('table'); // 'card' or 'table'
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/");
    } else {
      fetchVideos();
    }
  }, [navigate]);

  useEffect(() => {
    const filteprimary = videos.filter(video =>
      video && video.title &&
      video.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteprimaryVideos(filteprimary);
    setCurrentPage(1);
  }, [searchTerm, videos]);

  // Extract YouTube video ID from various URL formats
  const extractYouTubeId = (url) => {
    if (!url) return null;
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7].length === 11) ? match[7] : null;
  };

  // Generate YouTube embed URL
  const getEmbedUrl = (url) => {
    const videoId = extractYouTubeId(url);
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  };

  // Update preview when video link changes
  useEffect(() => {
    if (videoLink) {
      const embedUrl = getEmbedUrl(videoLink);
      setPreviewUrl(embedUrl || "");
    } else {
      setPreviewUrl("");
    }
  }, [videoLink]);

  const fetchVideos = async (showRefreshLoader = false) => {
    if (showRefreshLoader) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    
    try {
      const fetchedVideos = await getAllTestimonialVideos();
      const validVideos = fetchedVideos.filter(video => 
        video && typeof video.title === 'string' && typeof video.video_link === 'string'
      );
      setVideos(validVideos);
      setFilteprimaryVideos(validVideos);
      
      if (showRefreshLoader) {
        Swal.fire({
          icon: 'success',
          title: 'Refreshed!',
          text: 'Videos refreshed successfully!',
          position: 'center',
          timer: 1500,
          showConfirmButton: false
        });
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: `Failed to fetch videos: ${error.message}`,
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
    
    // Validate YouTube link
    if (!getEmbedUrl(videoLink)) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Link!',
        text: 'Please enter a valid YouTube video URL',
        position: 'center',
        confirmButtonColor: '#6366f1'
      });
      return;
    }

    setIsLoading(true);

    try {
      if (editingVideoId) {
        await updateTestimonialVideo(editingVideoId, { title, video_link: videoLink });
        Swal.fire({
          icon: 'success',
          title: 'Updated!',
          text: 'Video updated successfully!',
          position: 'center',
          timer: 1500,
          showConfirmButton: false
        });
        setEditingVideoId(null);
      } else {
        await addTestimonialVideo({ title, video_link: videoLink });
        Swal.fire({
          icon: 'success',
          title: 'Added!',
          text: 'Video added successfully!',
          position: 'center',
          timer: 1500,
          showConfirmButton: false
        });
      }
      setTitle("");
      setVideoLink("");
      setPreviewUrl("");
      setIsModalOpen(false);
      setCurrentPage(1);
      fetchVideos();
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: `Failed to ${editingVideoId ? 'update' : 'add'} video: ${error.message}`,
        position: 'center',
        confirmButtonColor: '#6366f1'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (video) => {
    if (!video || !video.title || !video.video_link) {
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'Cannot edit video: Missing title or link',
        position: 'center',
        confirmButtonColor: '#6366f1'
      });
      return;
    }
    setEditingVideoId(video.id);
    setTitle(video.title);
    setVideoLink(video.video_link);
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
        await deleteTestimonialVideo(id);
        setCurrentPage(1);
        Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'Video has been deleted successfully!',
          position: 'center',
          timer: 1500,
          showConfirmButton: false
        });
        fetchVideos();
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: `Failed to delete video: ${error.message}`,
          position: 'center',
          confirmButtonColor: '#6366f1'
        });
      }
    }
  };

  const handleView = (video) => {
    if (!video || !video.title || !video.video_link) {
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'Cannot view video: Missing title or link',
        position: 'center',
        confirmButtonColor: '#6366f1'
      });
      return;
    }
    setSelectedVideo(video);
    setIsViewModalOpen(true);
  };

  const openModal = () => {
    setEditingVideoId(null);
    setTitle("");
    setVideoLink("");
    setPreviewUrl("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingVideoId(null);
    setTitle("");
    setVideoLink("");
    setPreviewUrl("");
  };

  const truncateText = (text, maxLength = 50) => {
    if (!text || typeof text !== 'string') return 'No title available';
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
  };

  // Pagination calculations
  const totalPages = Math.ceil(filteprimaryVideos.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentVideos = filteprimaryVideos.slice(startIndex, endIndex);

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
          Showing {startIndex + 1} to {Math.min(endIndex, filteprimaryVideos.length)} of {filteprimaryVideos.length} entries
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

  // Card Grid View
  const CardGridView = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
      {currentVideos.map((video) => (
        video && video.title && video.video_link ? (
          <div key={video.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all overflow-hidden group">
            <div className="relative aspect-video bg-gray-100">
              {getEmbedUrl(video.video_link) ? (
                <div className="absolute inset-0">
                  <img 
                    src={`https://img.youtube.com/vi/${extractYouTubeId(video.video_link)}/maxresdefault.jpg`}
                    alt={video.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = `https://img.youtube.com/vi/${extractYouTubeId(video.video_link)}/hqdefault.jpg`;
                    }}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
                    <Play className="text-white opacity-0 group-hover:opacity-100 transition-opacity" size={48} />
                  </div>
                </div>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Video className="text-gray-400" size={48} />
                </div>
              )}
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 text-sm mb-3 line-clamp-2" title={video.title}>
                {video.title}
              </h3>
              <div className="flex gap-1">
                <button
                  onClick={() => handleView(video)}
                  className="flex-1 flex items-center justify-center gap-1 p-2 text-xs text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                  title="View video"
                >
                  <Eye size={14} />
                  View
                </button>
                {/* <button
                  onClick={() => handleEdit(video)}
                  className="flex-1 flex items-center justify-center gap-1 p-2 text-xs text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                  title="Edit video"
                >
                  <Edit size={14} />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(video.id)}
                  className="flex-1 flex items-center justify-center gap-1 p-2 text-xs text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                  title="Delete video"
                >
                  <Trash2 size={14} />
                  Delete
                </button> */}
              </div>
            </div>
          </div>
        ) : null
      ))}
    </div>
  );

  // Table View Component
  const TableView = () => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-4">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider">#</th>
              <th className="px-4 py-3 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider">Preview</th>
              <th className="px-4 py-3 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider">Title</th>
              <th className="px-4 py-3 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider">Video Link</th>
              <th className="px-4 py-3 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentVideos.map((video, index) => (
              video && video.title && video.video_link ? (
                <tr key={video.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-2 whitespace-nowrap">
                    <span className="text-xs font-mono text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded">
                      {startIndex + index + 1}
                    </span>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    <div className="w-20 h-12 rounded overflow-hidden bg-gray-100 relative group cursor-pointer" onClick={() => handleView(video)}>
                      {getEmbedUrl(video.video_link) ? (
                        <>
                          <img 
                            src={`https://img.youtube.com/vi/${extractYouTubeId(video.video_link)}/default.jpg`}
                            alt={video.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center">
                            <Play className="text-white opacity-0 group-hover:opacity-100 transition-opacity" size={20} />
                          </div>
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Video className="text-gray-400" size={20} />
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-2">
                    <div className="max-w-xs">
                      <p className="font-medium text-gray-900 text-xs truncate" title={video.title}>
                        {video.title}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-2">
                    <a 
                      href={video.video_link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:text-blue-800 hover:underline truncate max-w-xs block"
                      title={video.video_link}
                    >
                      {truncateText(video.video_link, 40)}
                    </a>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleView(video)}
                        className="p-1 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye size={14} />
                      </button>
                      {/* <button
                        onClick={() => handleEdit(video)}
                        className="p-1 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(video.id)}
                        className="p-1 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button> */}
                    </div>
                  </td>
                </tr>
              ) : null
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="bg-gray-50 p-3 sm:p-4 lg:p-6">
      <div className="h-full overflow-y-auto mx-auto">
        {/* Header Section */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 bg-primary-600 rounded-lg">
              <Video className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Testimonial Videos</h1>
          </div>
          <p className="text-sm text-gray-600">Manage customer testimonial videos from YouTube</p>
        </div>

        {/* Stats Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-100 rounded-lg">
              <Video className="h-5 w-5 text-primary-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">Total Videos</p>
              <p className="text-xl font-bold text-gray-900">{videos.length}</p>
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
                placeholder="Search videos by title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-sm"
              />
            </div>
            <div className="flex gap-2 items-center">
              {/* View Mode Toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('card')}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-md transition-all text-xs font-medium ${
                    viewMode === 'card'
                      ? 'bg-white text-primary-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  title="Card View"
                >
                  <Grid size={14} />
                  Card
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-md transition-all text-xs font-medium ${
                    viewMode === 'table'
                      ? 'bg-white text-primary-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  title="Table View"
                >
                  <List size={14} />
                  Table
                </button>
              </div>
              <button
                onClick={() => fetchVideos(true)}
                disabled={isRefreshing}
                className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg font-medium transition-colors shadow-sm disabled:opacity-50 text-sm"
              >
                <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
                Refresh
              </button>
              {/* <button
                onClick={openModal}
                disabled={isLoading}
                className="flex items-center gap-1 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white px-3 py-2 rounded-lg font-medium transition-colors shadow-sm text-sm"
              >
                <Plus size={16} />
                Add Video
              </button> */}
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && !isRefreshing ? (
          <div className="text-center py-8">
            <div className="inline-flex items-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-primary-600" />
              <p className="text-sm text-gray-600">Loading videos...</p>
            </div>
          </div>
        ) : filteprimaryVideos.length === 0 ? (
          <div className="text-center py-8">
            <Video className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-base font-medium text-gray-900 mb-1">No videos found</h3>
            <p className="text-sm text-gray-600 mb-3">
              {searchTerm ? 'Try adjusting your search terms.' : 'Get started by adding your first testimonial video.'}
            </p>
            {!searchTerm && (
              <button
                onClick={openModal}
                className="inline-flex items-center gap-1 bg-primary-600 hover:bg-primary-700 text-white px-3 py-2 rounded-lg font-medium transition-colors text-sm"
              >
                <Plus size={16} />
                Add First Video
              </button>
            )}
          </div>
        ) : (
          <>
            {viewMode === 'card' ? <CardGridView /> : <TableView />}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <PaginationComponent />
            </div>
          </>
        )}

        {/* Add/Edit Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-3">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 transform transition-all duration-200 max-h-[90vh] overflow-y-auto">
              <div className="px-4 py-3 border-b border-gray-100 sticky top-0 bg-white z-10">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">
                      {editingVideoId ? "Edit Video" : "Add New Video"}
                    </h2>
                    <p className="text-xs text-gray-500">
                      {editingVideoId ? "Update video details" : "Add a new testimonial video from YouTube"}
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
                <div className="space-y-4">
                  <div>
                    <label htmlFor="title" className="block text-xs font-medium text-gray-700 mb-1">
                      Video Title <span className="text-primary-500">*</span>
                    </label>
                    <input
                      id="title"
                      name="title"
                      type="text"
                      requiprimary
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 text-sm placeholder-gray-400"
                      placeholder="Enter video title"
                    />
                  </div>
                  <div>
                    <label htmlFor="videoLink" className="block text-xs font-medium text-gray-700 mb-1">
                      YouTube Video Link <span className="text-primary-500">*</span>
                    </label>
                    <input
                      id="videoLink"
                      name="videoLink"
                      type="url"
                      requiprimary
                      value={videoLink}
                      onChange={(e) => setVideoLink(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 text-sm placeholder-gray-400"
                      placeholder="https://www.youtube.com/watch?v=..."
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Paste a YouTube video URL (e.g., https://www.youtube.com/watch?v=dQw4w9WgXcQ)
                    </p>
                  </div>
                  
                  {/* Video Preview */}
                  {previewUrl && (
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-2">
                        Video Preview
                      </label>
                      <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
                        <iframe
                          src={previewUrl}
                          title="Video Preview"
                          className="w-full h-full"
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        ></iframe>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex space-x-2 mt-6">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 bg-primary-600 text-white py-2 px-3 rounded-lg font-medium hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-200 transition-all duration-200 disabled:bg-primary-300 disabled:cursor-not-allowed text-sm"
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center">
                        <RefreshCw className="w-4 h-4 animate-spin mr-1" />
                        {editingVideoId ? 'Updating...' : 'Adding...'}
                      </span>
                    ) : (
                      editingVideoId ? "Update Video" : "Add Video"
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
        {isViewModalOpen && selectedVideo && (
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-3">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center text-white">
                      <Video size={16} />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-gray-900">Video Details</h2>
                      <p className="text-xs text-gray-500">View testimonial video</p>
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
              <div className="p-4 overflow-y-auto max-h-[calc(90vh-100px)]">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Title</label>
                    <h3 className="text-xl font-bold text-gray-900">{selectedVideo.title || 'No title available'}</h3>
                  </div>
                  
                  {/* Video Player */}
                  {getEmbedUrl(selectedVideo.video_link) && (
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-2">Video</label>
                      <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
                        <iframe
                          src={getEmbedUrl(selectedVideo.video_link)}
                          title={selectedVideo.title}
                          className="w-full h-full"
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        ></iframe>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Video Link</label>
                    <a 
                      href={selectedVideo.video_link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-800 hover:underline break-all"
                    >
                      {selectedVideo.video_link}
                    </a>
                  </div>
                  
                  {/* <div className="flex gap-2 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => {
                        setIsViewModalOpen(false);
                        handleEdit(selectedVideo);
                      }}
                      className="flex-1 flex items-center justify-center gap-1 bg-primary-600 text-white py-2 px-3 rounded-lg font-medium hover:bg-primary-700 transition-colors text-sm"
                    >
                      <Edit size={14} />
                      Edit Video
                    </button>
                    <button
                      onClick={() => {
                        setIsViewModalOpen(false);
                        handleDelete(selectedVideo.id);
                      }}
                      className="flex-1 flex items-center justify-center gap-1 bg-gray-600 text-white py-2 px-3 rounded-lg font-medium hover:bg-gray-700 transition-colors text-sm"
                    >
                      <Trash2 size={14} />
                      Delete Video
                    </button>
                  </div> */}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}