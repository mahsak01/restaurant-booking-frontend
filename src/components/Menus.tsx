import React, { useState, useEffect, useRef } from 'react';
import { getMenus, createMenu, updateMenu, deleteMenu, getCategoriesOptions, Menu, CategoryOption, CreateMenuRequest } from '../services/api';
import './Menus.css';

const Menus: React.FC = () => {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingMenu, setEditingMenu] = useState<Menu | null>(null);
  const [deletingMenuId, setDeletingMenuId] = useState<number | null>(null);
  const [addMenuLoading, setAddMenuLoading] = useState(false);
  const [editMenuLoading, setEditMenuLoading] = useState(false);
  const [deleteMenuLoading, setDeleteMenuLoading] = useState(false);
  const [addMenuError, setAddMenuError] = useState('');
  const [editMenuError, setEditMenuError] = useState('');
  const [deleteMenuError, setDeleteMenuError] = useState('');
  const [formData, setFormData] = useState<CreateMenuRequest>({
    name: '',
    description: '',
    price: 0,
    category: '',
  });
  const hasFetched = useRef(false);

  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      fetchMenus();
      fetchCategories();
    }
  }, []);

  const fetchMenus = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getMenus();
      setMenus(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در دریافت لیست منوها');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await getCategoriesOptions();
      setCategories(data);
    } catch (err) {
      console.error('Error fetching categories:', err);
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

  const formatPrice = (price?: number) => {
    if (price === undefined || price === null) return '-';
    return new Intl.NumberFormat('fa-IR').format(price) + ' تومان';
  };

  const handleAddMenu = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddMenuError('');
    setAddMenuLoading(true);

    try {
      await createMenu(formData);
      setShowAddModal(false);
      setFormData({
        name: '',
        description: '',
        price: 0,
        category: '',
      });
      // Refresh menus list
      fetchMenus();
    } catch (err) {
      setAddMenuError(err instanceof Error ? err.message : 'خطا در افزودن آیتم به منو');
    } finally {
      setAddMenuLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'price' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setFormData({
      name: '',
      description: '',
      price: 0,
      category: '',
    });
    setAddMenuError('');
    setEditMenuError('');
    setEditingMenu(null);
  };

  const handleEdit = (menu: Menu) => {
    setEditingMenu(menu);
    setFormData({
      name: menu.name,
      description: menu.description || '',
      price: menu.price || 0,
      category: menu.category || '',
    });
    setShowEditModal(true);
  };

  const handleUpdateMenu = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMenu) return;

    setEditMenuError('');
    setEditMenuLoading(true);

    try {
      await updateMenu(editingMenu.id, formData);
      setShowEditModal(false);
      setEditingMenu(null);
      setFormData({
        name: '',
        description: '',
        price: 0,
        category: '',
      });
      // Refresh menus list
      fetchMenus();
    } catch (err) {
      setEditMenuError(err instanceof Error ? err.message : 'خطا در ویرایش آیتم منو');
    } finally {
      setEditMenuLoading(false);
    }
  };

  const handleDelete = (menuId: number) => {
    setDeletingMenuId(menuId);
    setShowDeleteModal(true);
    setDeleteMenuError('');
  };

  const handleConfirmDelete = async () => {
    if (!deletingMenuId) return;

    setDeleteMenuError('');
    setDeleteMenuLoading(true);

    try {
      await deleteMenu(deletingMenuId);
      setShowDeleteModal(false);
      setDeletingMenuId(null);
      // Refresh menus list
      fetchMenus();
    } catch (err) {
      setDeleteMenuError(err instanceof Error ? err.message : 'خطا در حذف آیتم منو');
    } finally {
      setDeleteMenuLoading(false);
    }
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setDeletingMenuId(null);
    setDeleteMenuError('');
  };

  return (
    <div className="menus-container">
      <div className="menus-header">
        <h1>لیست منوها</h1>
        <div className="header-buttons">
          <button 
            onClick={() => setShowAddModal(true)} 
            className="add-menu-button"
          >
            ➕ افزودن آیتم به منو
          </button>
          <button 
            onClick={fetchMenus} 
            className="refresh-button"
            disabled={loading}
          >
            🔄 {loading ? 'در حال بارگذاری...' : 'بروزرسانی'}
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading && menus.length === 0 ? (
        <div className="loading">در حال بارگذاری...</div>
      ) : (
        <div className="table-container">
          <table className="menus-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>نام</th>
                <th>توضیحات</th>
                <th>دسته‌بندی</th>
                <th>قیمت</th>
                <th>تاریخ ایجاد</th>
                <th>تاریخ بروزرسانی</th>
                <th>عملیات</th>
              </tr>
            </thead>
            <tbody>
              {menus.length === 0 ? (
                <tr>
                  <td colSpan={9} className="no-data">
                    هیچ منویی یافت نشد
                  </td>
                </tr>
              ) : (
                menus.map((menu) => (
                  <tr key={menu.id}>
                    <td>{menu.id}</td>
                    <td>{menu.name}</td>
                    <td>{menu.description || '-'}</td>
                    <td>{menu.category || '-'}</td>
                    <td>{formatPrice(menu.price)}</td>
                  
                    <td>{formatDate(menu.created_at)}</td>
                    <td>{formatDate(menu.updated_at)}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="edit-button"
                          onClick={() => handleEdit(menu)}
                          title="ویرایش"
                        >
                          ✏️
                        </button>
                        <button
                          className="delete-button"
                          onClick={() => handleDelete(menu.id)}
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

      {/* Add Menu Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>افزودن آیتم به منو</h2>
              <button className="close-button" onClick={handleCloseModal}>
                ✕
              </button>
            </div>
            
            <form onSubmit={handleAddMenu} className="add-menu-form">
              <div className="form-group">
                <label htmlFor="name">نام</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="pizza"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">توضیحات</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="meat and cheese"
                  required
                  rows={3}
                />
              </div>

              <div className="form-group">
                <label htmlFor="price">قیمت</label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="150000"
                  min="0"
                  step="1000"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="category">دسته‌بندی</label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">انتخاب دسته‌بندی</option>
                  {categories.map((category, index) => (
                    <option key={index} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>

              {addMenuError && <div className="error-message">{addMenuError}</div>}

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="cancel-button"
                  disabled={addMenuLoading}
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="submit-button"
                  disabled={addMenuLoading}
                >
                  {addMenuLoading ? 'در حال افزودن...' : 'افزودن آیتم'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Menu Modal */}
      {showEditModal && editingMenu && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>ویرایش آیتم منو</h2>
              <button className="close-button" onClick={handleCloseModal}>
                ✕
              </button>
            </div>
            
            <form onSubmit={handleUpdateMenu} className="add-menu-form">
              <div className="form-group">
                <label htmlFor="edit-name">نام</label>
                <input
                  type="text"
                  id="edit-name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="pizza"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="edit-description">توضیحات</label>
                <textarea
                  id="edit-description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="meat and cheese"
                  required
                  rows={3}
                />
              </div>

              <div className="form-group">
                <label htmlFor="edit-price">قیمت</label>
                <input
                  type="number"
                  id="edit-price"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="150000"
                  min="0"
                  step="1000"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="edit-category">دسته‌بندی</label>
                <select
                  id="edit-category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">انتخاب دسته‌بندی</option>
                  {categories.map((category, index) => (
                    <option key={index} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>

              {editMenuError && <div className="error-message">{editMenuError}</div>}

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="cancel-button"
                  disabled={editMenuLoading}
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="submit-button"
                  disabled={editMenuLoading}
                >
                  {editMenuLoading ? 'در حال ویرایش...' : 'ذخیره تغییرات'}
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
              <h2>حذف آیتم منو</h2>
              <button className="close-button" onClick={handleCloseDeleteModal}>
                ✕
              </button>
            </div>
            
            <div className="delete-modal-body">
              <p>آیا مطمئن هستید که می‌خواهید این آیتم را حذف کنید؟</p>
              <p className="delete-warning">این عمل غیرقابل بازگشت است!</p>
              
              {deleteMenuError && <div className="error-message">{deleteMenuError}</div>}

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={handleCloseDeleteModal}
                  className="cancel-button"
                  disabled={deleteMenuLoading}
                >
                  انصراف
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="delete-confirm-button"
                  disabled={deleteMenuLoading}
                >
                  {deleteMenuLoading ? 'در حال حذف...' : 'حذف'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Menus;

