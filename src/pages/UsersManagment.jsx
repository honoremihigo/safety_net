import React, { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, BookOpen, Tag, FileText } from "lucide-react";
import { getAllUsers } from "../services/usersServices";
import { isAuthenticated } from "../services/authService";
import { useNavigate } from "react-router-dom";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 5;
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/");
    } else {
      fetchUsers();
    }
  }, [navigate]);

  const fetchUsers = async () => {
    try {
      const fetchedUsers = await getAllUsers();
      setUsers(fetchedUsers);
    } catch (error) {
      alert(error.message);
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(users.length / usersPerPage);
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);

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
            <h1 className="text-2xl font-bold text-gray-900">Users Dashboard</h1>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <FileText className="h-5 w-5 text-indigo-600" />
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-500">Total Users</p>
                <p className="text-lg font-bold text-gray-900">{users.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Tag className="h-5 w-5 text-indigo-600" />
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-500">Unique Last Names</p>
                <p className="text-lg font-bold text-gray-900">
                  {[...new Set(users.map(user => user.lastName))].length}
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

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900">Users Collection</h2>
            <p className="text-sm text-gray-500">Browse your users</p>
          </div>
          
          <div className="p-6">
            {users.length === 0 ? (
              <div className="text-center py-10">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                  <FileText className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">No users yet</h3>
                <p className="text-sm text-gray-500 mb-4">No users available to display.</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">First Name</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Name</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {currentUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50 transition-colors duration-200">
                          <td className="px-4 py-3 text-sm text-gray-900">{user.email}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{user.firstName}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{user.lastName}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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
      </div>
    </div>
  );
}