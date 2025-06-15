import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  fetchEventCategories,
  // createEventCategory, // Placeholder for now
  // updateEventCategory, // Placeholder for now
  // toggleEventCategoryStatus, // Placeholder for now
  type EventCategory,
} from '../services/categoryService';

// We might need components for Table, Modal, Input etc. later.

const AdminEventCategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<EventCategory[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // TODO: Add state for managing modals (e.g., add/edit category)
  // const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  // const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  // const [currentCategory, setCurrentCategory] = useState<EventCategory | null>(null);

  useEffect(() => {
    const abortController = new AbortController();
    const signal = abortController.signal;

    const loadCategories = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchEventCategories(signal);
        if (!signal.aborted) {
          setCategories(data);
        }
      } catch (err: any) {
        if (err.name === 'AbortError') {
          console.log('Fetch aborted by AbortController');
        } else if (!signal.aborted) {
          setError('Failed to fetch categories. Please try again later.');
          console.error(err);
        }
      }
      if (!signal.aborted) {
        setIsLoading(false);
      }
    };

    loadCategories();

    return () => {
      abortController.abort();
    };
  }, []);

  const handleAddCategory = () => {
    console.log('Add new category clicked');
    // TODO: Open Add Category Modal
    // setIsAddModalOpen(true);
    // setCurrentCategory(null); // Clear any current category selection
  };

  const handleEditCategory = (category: EventCategory) => {
    console.log('Edit category clicked:', category);
    // TODO: Open Edit Category Modal with selected category data
    // setCurrentCategory(category);
    // setIsEditModalOpen(true);
  };

  const handleToggleStatus = async (category: EventCategory) => {
    console.log('Toggle status for category clicked:', category);
    // TODO: Implement API call to toggle status and update UI
    // try {
    //   const updatedCategory = await toggleEventCategoryStatus(category.id, !category.is_active);
    //   setCategories(categories.map(cat => cat.id === updatedCategory.id ? updatedCategory : cat));
    // } catch (err) {
    //   setError('Failed to update category status.');
    //   console.error(err);
    // }
  };

  if (isLoading) {
    return <div className="container mx-auto p-4 text-center">Loading categories...</div>;
  }

  if (error) {
    return <div className="container mx-auto p-4 text-center text-red-500">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Manage Event Categories</h1>
        <Button onClick={handleAddCategory}>
          Add New Category
        </Button>
      </div>

      {/* TODO: Implement Add/Edit Modals here */}
      {/* Example for Add Modal (simplified):
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Add New Category</h3>
            // Add form fields here for category name
            <Button onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
            // Add Save button with handler
          </div>
        </div>
      )} 
      */}

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Name
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Status
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {categories.map((category) => (
              <tr key={category.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {category.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      category.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {category.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <Button variant="outline" size="sm" onClick={() => handleEditCategory(category)}>
                    Edit
                  </Button>
                  <Button
                    variant={category.is_active ? 'destructive' : 'outline'}
                    size="sm"
                    onClick={() => handleToggleStatus(category)}
                  >
                    {category.is_active ? 'Deactivate' : 'Reactivate'}
                  </Button>
                </td>
              </tr>
            ))}
            {categories.length === 0 && !isLoading && (
              <tr>
                <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">
                  No categories found. Click "Add New Category" to create one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminEventCategoriesPage; 