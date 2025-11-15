import React, { useState, useEffect } from 'react';
import { getUsers, signup, deleteUser, User, SignupRequest } from '../services/api';
import './Users.css';

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingUserId, setDeletingUserId] = useState<number | null>(null);
  const [deletingUserName, setDeletingUserName] = useState<string>('');
  const [addUserLoading, setAddUserLoading] = useState(false);
  const [deleteUserLoading, setDeleteUserLoading] = useState(false);
  const [addUserError, setAddUserError] = useState('');
  const [deleteUserError, setDeleteUserError] = useState('');
  const [formData, setFormData] = useState<SignupRequest>({
    phone: '',
    password: '',
    name: '',
    role: 'customer',
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در دریافت لیست کاربران');
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

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddUserError('');
    setAddUserLoading(true);

    try {
      await signup(formData);
      setShowAddModal(false);
      setFormData({
        phone: '',
        password: '',
        name: '',
        role: 'customer',
      });
      // Refresh users list
      fetchUsers();
    } catch (err) {
      setAddUserError(err instanceof Error ? err.message : 'خطا در افزودن کاربر');
    } finally {
      setAddUserLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setFormData({
      phone: '',
      password: '',
      name: '',
      role: 'customer',
    });
    setAddUserError('');
  };

  const handleDelete = (userId: number, userName: string) => {
    setDeletingUserId(userId);
    setDeletingUserName(userName);
    setShowDeleteModal(true);
    setDeleteUserError('');
  };

  const handleConfirmDelete = async () => {
    if (!deletingUserId) return;

    setDeleteUserError('');
    setDeleteUserLoading(true);

    try {
      await deleteUser(deletingUserId);
      setShowDeleteModal(false);
      setDeletingUserId(null);
      setDeletingUserName('');
      // Refresh users list
      fetchUsers();
    } catch (err) {
      setDeleteUserError(err instanceof Error ? err.message : 'خطا در حذف کاربر');
    } finally {
      setDeleteUserLoading(false);
    }
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setDeletingUserId(null);
    setDeletingUserName('');
    setDeleteUserError('');
  };

  return (
    <div className="users-container">
      <div className="users-header">
        <h1>لیست کاربران</h1>
        <div className="header-buttons">
          <button 
            onClick={() => setShowAddModal(true)} 
            className="add-user-button"
          >
            ➕ افزودن کاربر
          </button>
          <button 
            onClick={fetchUsers} 
            className="refresh-button"
            disabled={loading}
          >
            🔄 {loading ? 'در حال بارگذاری...' : 'بروزرسانی'}
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading && users.length === 0 ? (
        <div className="loading">در حال بارگذاری...</div>
      ) : (
        <div className="table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>نام</th>
                <th>شماره تلفن</th>
                <th>نقش</th>
                <th>تاریخ ایجاد</th>
                <th>تاریخ بروزرسانی</th>
                <th>عملیات</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="no-data">
                    هیچ کاربری یافت نشد
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>{user.name}</td>
                    <td>{user.phone}</td>
                    <td>
                      <span className={`role-badge role-${user.role}`}>
                        {user.role === 'admin' ? 'مدیر' : user.role === 'customer' ? 'کاربر' : user.role}
                      </span>
                    </td>
                    <td>{formatDate(user.created_at)}</td>
                    <td>{formatDate(user.updated_at)}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="delete-button"
                          onClick={() => handleDelete(user.id, user.name)}
                          title="حذف کاربر"
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

      {/* Add User Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>افزودن کاربر جدید</h2>
              <button className="close-button" onClick={handleCloseModal}>
                ✕
              </button>
            </div>
            
            <form onSubmit={handleAddUser} className="add-user-form">
              <div className="form-group">
                <label htmlFor="name">نام</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="mahsa karimi"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">شماره تلفن</label>
                <input
                  type="text"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+989100364536"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">رمز عبور</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="رمز عبور"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="role">نقش</label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  required
                >
                  <option value="customer">کاربر</option>
                  <option value="admin">مدیر</option>
                </select>
              </div>

              {addUserError && <div className="error-message">{addUserError}</div>}

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="cancel-button"
                  disabled={addUserLoading}
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="submit-button"
                  disabled={addUserLoading}
                >
                  {addUserLoading ? 'در حال افزودن...' : 'افزودن کاربر'}
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
              <h2>حذف کاربر</h2>
              <button className="close-button" onClick={handleCloseDeleteModal}>
                ✕
              </button>
            </div>
            
            <div className="delete-modal-body">
              <p>آیا مطمئن هستید که می‌خواهید کاربر <strong>{deletingUserName}</strong> را حذف کنید؟</p>
              <p className="delete-warning">این عمل غیرقابل بازگشت است!</p>
              
              {deleteUserError && <div className="error-message">{deleteUserError}</div>}

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={handleCloseDeleteModal}
                  className="cancel-button"
                  disabled={deleteUserLoading}
                >
                  انصراف
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="delete-confirm-button"
                  disabled={deleteUserLoading}
                >
                  {deleteUserLoading ? 'در حال حذف...' : 'حذف'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;

