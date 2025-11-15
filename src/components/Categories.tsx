import React, { useState, useEffect, useRef } from 'react';
import { 
  getCategories, 
  createCategory, 
  updateCategory, 
  deleteCategory, 
  Category, 
  CreateCategoryRequest 
} from '../services/api';
import './Categories.css';

const Categories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategoryId, setDeletingCategoryId] = useState<number | null>(null);
  const [addCategoryLoading, setAddCategoryLoading] = useState(false);
  const [editCategoryLoading, setEditCategoryLoading] = useState(false);
  const [deleteCategoryLoading, setDeleteCategoryLoading] = useState(false);
  const [addCategoryError, setAddCategoryError] = useState('');
  const [editCategoryError, setEditCategoryError] = useState('');
  const [deleteCategoryError, setDeleteCategoryError] = useState('');
  const [formData, setFormData] = useState<CreateCategoryRequest>({
    name: '',
    display_name: '',
    description: '',
    sort_order: 0,
  });
  const hasFetched = useRef(false);

  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      fetchCategories();
    }
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در دریافت لیست دسته‌بندی‌ها');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddCategoryError('');
    setAddCategoryLoading(true);

    try {
      await createCategory(formData);
      setShowAddModal(false);
      setFormData({
        name: '',
        display_name: '',
        description: '',
        sort_order: 0,
      });
      fetchCategories();
    } catch (err) {
      setAddCategoryError(err instanceof Error ? err.message : 'خطا در افزودن دسته‌بندی');
    } finally {
      setAddCategoryLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'sort_order' ? parseInt(value) || 0 : value,
    }));
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setFormData({
      name: '',
      display_name: '',
      description: '',
      sort_order: 0,
    });
    setAddCategoryError('');
    setEditCategoryError('');
    setEditingCategory(null);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      display_name: category.display_name,
      description: category.description || '',
      sort_order: category.sort_order || 0,
    });
    setShowEditModal(true);
  };

  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;

    setEditCategoryError('');
    setEditCategoryLoading(true);

    try {
      await updateCategory(editingCategory.id, formData);
      setShowEditModal(false);
      setEditingCategory(null);
      setFormData({
        name: '',
        display_name: '',
        description: '',
        sort_order: 0,
      });
      fetchCategories();
    } catch (err) {
      setEditCategoryError(err instanceof Error ? err.message : 'خطا در ویرایش دسته‌بندی');
    } finally {
      setEditCategoryLoading(false);
    }
  };

  const handleDelete = (categoryId: number) => {
    setDeletingCategoryId(categoryId);
    setShowDeleteModal(true);
    setDeleteCategoryError('');
  };

  const handleConfirmDelete = async () => {
    if (!deletingCategoryId) return;

    setDeleteCategoryError('');
    setDeleteCategoryLoading(true);

    try {
      await deleteCategory(deletingCategoryId);
      setShowDeleteModal(false);
      setDeletingCategoryId(null);
      fetchCategories();
    } catch (err) {
      setDeleteCategoryError(err instanceof Error ? err.message : 'خطا در حذف دسته‌بندی');
    } finally {
      setDeleteCategoryLoading(false);
    }
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setDeletingCategoryId(null);
    setDeleteCategoryError('');
  };

  return (
    <div className="categories-container">
      <div className="categories-header">
        <h1>لیست دسته‌بندی‌ها</h1>
        <div className="header-buttons">
          <button 
            onClick={() => setShowAddModal(true)} 
            className="add-category-button"
          >
            ➕ افزودن دسته‌بندی
          </button>
          <button 
            onClick={fetchCategories} 
            className="refresh-button"
            disabled={loading}
          >
            🔄 {loading ? 'در حال بارگذاری...' : 'بروزرسانی'}
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading && categories.length === 0 ? (
        <div className="loading">در حال بارگذاری...</div>
      ) : (
        <div className="table-container">
          <table className="categories-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>نام</th>
                <th>نام نمایشی</th>
                <th>توضیحات</th>
                <th>ترتیب</th>
                <th>تاریخ ایجاد</th>
                <th>تاریخ بروزرسانی</th>
                <th>عملیات</th>
              </tr>
            </thead>
            <tbody>
              {categories.length === 0 ? (
                <tr>
                  <td colSpan={8} className="no-data">
                    هیچ دسته‌بندی‌ای یافت نشد
                  </td>
                </tr>
              ) : (
                categories.map((category) => (
                  <tr key={category.id}>
                    <td>{category.id}</td>
                    <td>{category.name}</td>
                    <td>{category.display_name}</td>
                    <td>{category.description || '-'}</td>
                    <td>{category.sort_order || 0}</td>
                    <td>{formatDate(category.created_at)}</td>
                    <td>{formatDate(category.updated_at)}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="edit-button"
                          onClick={() => handleEdit(category)}
                          title="ویرایش"
                        >
                          ✏️
                        </button>
                        <button
                          className="delete-button"
                          onClick={() => handleDelete(category.id)}
                          title="حذف"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Category Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>افزودن دسته‌بندی جدید</h2>
              <button className="close-button" onClick={handleCloseModal}>
                ✕
              </button>
            </div>
            
            <form onSubmit={handleAddCategory} className="add-category-form">
              <div className="form-group">
                <label htmlFor="name">نام (کد)</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="appetizer"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="display_name">نام نمایشی</label>
                <input
                  type="text"
                  id="display_name"
                  name="display_name"
                  value={formData.display_name}
                  onChange={handleInputChange}
                  placeholder="Appetizer"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">توضیحات (اختیاری)</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="دسته‌بندی پیش‌غذاها"
                  rows={3}
                />
              </div>

              <div className="form-group">
                <label htmlFor="sort_order">ترتیب (اختیاری)</label>
                <input
                  type="number"
                  id="sort_order"
                  name="sort_order"
                  value={formData.sort_order}
                  onChange={handleInputChange}
                  placeholder="0"
                  min="0"
                />
              </div>

              {addCategoryError && <div className="error-message">{addCategoryError}</div>}

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="cancel-button"
                  disabled={addCategoryLoading}
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="submit-button"
                  disabled={addCategoryLoading}
                >
                  {addCategoryLoading ? 'در حال افزودن...' : 'افزودن دسته‌بندی'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Category Modal */}
      {showEditModal && editingCategory && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>ویرایش دسته‌بندی</h2>
              <button className="close-button" onClick={handleCloseModal}>
                ✕
              </button>
            </div>
            
            <form onSubmit={handleUpdateCategory} className="add-category-form">
              <div className="form-group">
                <label htmlFor="edit-name">نام (کد)</label>
                <input
                  type="text"
                  id="edit-name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="appetizer"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="edit-display_name">نام نمایشی</label>
                <input
                  type="text"
                  id="edit-display_name"
                  name="display_name"
                  value={formData.display_name}
                  onChange={handleInputChange}
                  placeholder="Appetizer"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="edit-description">توضیحات (اختیاری)</label>
                <textarea
                  id="edit-description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="دسته‌بندی پیش‌غذاها"
                  rows={3}
                />
              </div>

              <div className="form-group">
                <label htmlFor="edit-sort_order">ترتیب (اختیاری)</label>
                <input
                  type="number"
                  id="edit-sort_order"
                  name="sort_order"
                  value={formData.sort_order}
                  onChange={handleInputChange}
                  placeholder="0"
                  min="0"
                />
              </div>

              {editCategoryError && <div className="error-message">{editCategoryError}</div>}

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="cancel-button"
                  disabled={editCategoryLoading}
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="submit-button"
                  disabled={editCategoryLoading}
                >
                  {editCategoryLoading ? 'در حال ویرایش...' : 'ذخیره تغییرات'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={handleCloseDeleteModal}>
          <div className="modal-content delete-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>حذف دسته‌بندی</h2>
              <button className="close-button" onClick={handleCloseDeleteModal}>
                ✕
              </button>
            </div>
            
            <div className="delete-modal-body">
              <p>آیا مطمئن هستید که می‌خواهید این دسته‌بندی را حذف کنید؟</p>
              <p className="delete-warning">این عمل غیرقابل بازگشت است!</p>
              
              {deleteCategoryError && <div className="error-message">{deleteCategoryError}</div>}

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={handleCloseDeleteModal}
                  className="cancel-button"
                  disabled={deleteCategoryLoading}
                >
                  انصراف
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="delete-confirm-button"
                  disabled={deleteCategoryLoading}
                >
                  {deleteCategoryLoading ? 'در حال حذف...' : 'حذف'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;
