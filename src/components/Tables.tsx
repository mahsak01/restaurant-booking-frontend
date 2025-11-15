import React, { useState, useEffect, useRef } from 'react';
import { getTables, createTable, updateTable, deleteTable, Table, CreateTableRequest } from '../services/api';
import './Tables.css';

const Tables: React.FC = () => {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const [deletingTableId, setDeletingTableId] = useState<number | null>(null);
  const [addTableLoading, setAddTableLoading] = useState(false);
  const [editTableLoading, setEditTableLoading] = useState(false);
  const [deleteTableLoading, setDeleteTableLoading] = useState(false);
  const [addTableError, setAddTableError] = useState('');
  const [editTableError, setEditTableError] = useState('');
  const [deleteTableError, setDeleteTableError] = useState('');
  const [formData, setFormData] = useState<CreateTableRequest>({
    number: 0,
    capacity: 0,
    status: 'available',
    location: '',
  });
  const hasFetched = useRef(false);

  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      fetchTables();
    }
  }, []);

  const fetchTables = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getTables();
      setTables(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در دریافت لیست میزها');
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

  const getStatusLabel = (status: string) => {
    const statusMap: { [key: string]: string } = {
      available: 'موجود',
      reserved: 'رزرو شده',
      occupied: 'اشغال شده',
      unavailable: 'غیرفعال',
    };
    return statusMap[status] || status;
  };

  const handleAddTable = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddTableError('');
    setAddTableLoading(true);

    try {
      await createTable(formData);
      setShowAddModal(false);
      setFormData({
        number: 0,
        capacity: 0,
        status: 'available',
        location: '',
      });
      fetchTables();
    } catch (err) {
      setAddTableError(err instanceof Error ? err.message : 'خطا در افزودن میز');
    } finally {
      setAddTableLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'number' || name === 'capacity' ? parseInt(value) || 0 : value,
    }));
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setFormData({
      number: 0,
      capacity: 0,
      status: 'available',
      location: '',
    });
    setAddTableError('');
    setEditTableError('');
    setEditingTable(null);
  };

  const handleEdit = (table: Table) => {
    setEditingTable(table);
    setFormData({
      number: table.number,
      capacity: table.capacity,
      status: table.status,
      location: table.location || '',
    });
    setShowEditModal(true);
  };

  const handleUpdateTable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTable) return;

    setEditTableError('');
    setEditTableLoading(true);

    try {
      await updateTable(editingTable.id, formData);
      setShowEditModal(false);
      setEditingTable(null);
      setFormData({
        number: 0,
        capacity: 0,
        status: 'available',
        location: '',
      });
      fetchTables();
    } catch (err) {
      setEditTableError(err instanceof Error ? err.message : 'خطا در ویرایش میز');
    } finally {
      setEditTableLoading(false);
    }
  };

  const handleDelete = (tableId: number) => {
    setDeletingTableId(tableId);
    setShowDeleteModal(true);
    setDeleteTableError('');
  };

  const handleConfirmDelete = async () => {
    if (!deletingTableId) return;

    setDeleteTableError('');
    setDeleteTableLoading(true);

    try {
      await deleteTable(deletingTableId);
      setShowDeleteModal(false);
      setDeletingTableId(null);
      fetchTables();
    } catch (err) {
      setDeleteTableError(err instanceof Error ? err.message : 'خطا در حذف میز');
    } finally {
      setDeleteTableLoading(false);
    }
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setDeletingTableId(null);
    setDeleteTableError('');
  };

  return (
    <div className="tables-container">
      <div className="tables-header">
        <h1>لیست میزها</h1>
        <div className="header-buttons">
          <button 
            onClick={() => setShowAddModal(true)} 
            className="add-table-button"
          >
            ➕ افزودن میز
          </button>
          <button 
            onClick={fetchTables} 
            className="refresh-button"
            disabled={loading}
          >
            🔄 {loading ? 'در حال بارگذاری...' : 'بروزرسانی'}
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading && tables.length === 0 ? (
        <div className="loading">در حال بارگذاری...</div>
      ) : (
        <div className="table-container">
          <table className="tables-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>شماره میز</th>
                <th>ظرفیت</th>
                <th>وضعیت</th>
                <th>موقعیت</th>
                <th>تاریخ ایجاد</th>
                <th>تاریخ بروزرسانی</th>
                <th>عملیات</th>
              </tr>
            </thead>
            <tbody>
              {tables.length === 0 ? (
                <tr>
                  <td colSpan={8} className="no-data">
                    هیچ میزی یافت نشد
                  </td>
                </tr>
              ) : (
                tables.map((table) => (
                  <tr key={table.id}>
                    <td>{table.id}</td>
                    <td>{table.number}</td>
                    <td>{table.capacity} نفر</td>
                    <td>
                      <span className={`status-badge status-${table.status}`}>
                        {getStatusLabel(table.status)}
                      </span>
                    </td>
                    <td>{table.location}</td>
                    <td>{formatDate(table.created_at)}</td>
                    <td>{formatDate(table.updated_at)}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="edit-button"
                          onClick={() => handleEdit(table)}
                          title="ویرایش"
                        >
                          ✏️
                        </button>
                        <button
                          className="delete-button"
                          onClick={() => handleDelete(table.id)}
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

      {/* Add Table Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>افزودن میز جدید</h2>
              <button className="close-button" onClick={handleCloseModal}>
                ✕
              </button>
            </div>
            
            <form onSubmit={handleAddTable} className="add-table-form">
              <div className="form-group">
                <label htmlFor="number">شماره میز</label>
                <input
                  type="number"
                  id="number"
                  name="number"
                  value={formData.number}
                  onChange={handleInputChange}
                  placeholder="1"
                  min="1"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="capacity">ظرفیت</label>
                <input
                  type="number"
                  id="capacity"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleInputChange}
                  placeholder="4"
                  min="1"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="status">وضعیت</label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  required
                >
                  <option value="available">موجود</option>
                  <option value="reserved">رزرو شده</option>
                  <option value="occupied">اشغال شده</option>
                  <option value="unavailable">غیرفعال</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="location">موقعیت</label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="سالن اصلی"
                  required
                />
              </div>

              {addTableError && <div className="error-message">{addTableError}</div>}

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="cancel-button"
                  disabled={addTableLoading}
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="submit-button"
                  disabled={addTableLoading}
                >
                  {addTableLoading ? 'در حال افزودن...' : 'افزودن میز'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Table Modal */}
      {showEditModal && editingTable && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>ویرایش میز</h2>
              <button className="close-button" onClick={handleCloseModal}>
                ✕
              </button>
            </div>
            
            <form onSubmit={handleUpdateTable} className="add-table-form">
              <div className="form-group">
                <label htmlFor="edit-number">شماره میز</label>
                <input
                  type="number"
                  id="edit-number"
                  name="number"
                  value={formData.number}
                  onChange={handleInputChange}
                  placeholder="1"
                  min="1"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="edit-capacity">ظرفیت</label>
                <input
                  type="number"
                  id="edit-capacity"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleInputChange}
                  placeholder="4"
                  min="1"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="edit-status">وضعیت</label>
                <select
                  id="edit-status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  required
                >
                  <option value="available">موجود</option>
                  <option value="reserved">رزرو شده</option>
                  <option value="occupied">اشغال شده</option>
                  <option value="unavailable">غیرفعال</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="edit-location">موقعیت</label>
                <input
                  type="text"
                  id="edit-location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="سالن اصلی"
                  required
                />
              </div>

              {editTableError && <div className="error-message">{editTableError}</div>}

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="cancel-button"
                  disabled={editTableLoading}
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="submit-button"
                  disabled={editTableLoading}
                >
                  {editTableLoading ? 'در حال ویرایش...' : 'ذخیره تغییرات'}
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
              <h2>حذف میز</h2>
              <button className="close-button" onClick={handleCloseDeleteModal}>
                ✕
              </button>
            </div>
            
            <div className="delete-modal-body">
              <p>آیا مطمئن هستید که می‌خواهید این میز را حذف کنید؟</p>
              <p className="delete-warning">این عمل غیرقابل بازگشت است!</p>
              
              {deleteTableError && <div className="error-message">{deleteTableError}</div>}

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={handleCloseDeleteModal}
                  className="cancel-button"
                  disabled={deleteTableLoading}
                >
                  انصراف
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="delete-confirm-button"
                  disabled={deleteTableLoading}
                >
                  {deleteTableLoading ? 'در حال حذف...' : 'حذف'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tables;

