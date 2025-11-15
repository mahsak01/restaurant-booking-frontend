import React, { useState, useEffect, useRef } from 'react';
import { 
  getOrders, 
  getOrderStatuses, 
  updateOrderStatus, 
  createOrder,
  getUsers,
  getMenus,
  Order, 
  OrderStatus,
  CreateOrderItemRequest,
  User,
  Menu
} from '../services/api';
import './Orders.css';

interface OrderItemForm {
  menu_item_id: number;
  quantity: number;
  notes: string;
}

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [statuses, setStatuses] = useState<OrderStatus[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [createOrderLoading, setCreateOrderLoading] = useState(false);
  const [updateStatusLoading, setUpdateStatusLoading] = useState(false);
  const [createOrderError, setCreateOrderError] = useState('');
  const [updateStatusError, setUpdateStatusError] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<number>(0);
  const [orderItems, setOrderItems] = useState<OrderItemForm[]>([]);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      fetchOrders();
      fetchStatuses();
      fetchUsers();
      fetchMenus();
    }
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getOrders();
      setOrders(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در دریافت لیست سفارش‌ها');
    } finally {
      setLoading(false);
    }
  };

  const fetchStatuses = async () => {
    try {
      const data = await getOrderStatuses();
      setStatuses(data);
    } catch (err) {
      console.error('Error fetching order statuses:', err);
    }
  };

  const fetchUsers = async () => {
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const fetchMenus = async () => {
    try {
      const data = await getMenus();
      setMenus(data);
    } catch (err) {
      console.error('Error fetching menus:', err);
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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fa-IR').format(price) + ' تومان';
  };

  const getStatusLabel = (status: string) => {
    const statusObj = statuses.find(s => s.value === status);
    return statusObj ? statusObj.label : status;
  };

  const handleAddOrderItem = () => {
    setOrderItems([...orderItems, { menu_item_id: 0, quantity: 1, notes: '' }]);
  };

  const handleRemoveOrderItem = (index: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const handleOrderItemChange = (index: number, field: keyof OrderItemForm, value: number | string) => {
    const updated = [...orderItems];
    updated[index] = { ...updated[index], [field]: value };
    setOrderItems(updated);
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId || orderItems.length === 0) {
      setCreateOrderError('لطفاً کاربر و حداقل یک آیتم را انتخاب کنید');
      return;
    }

    setCreateOrderError('');
    setCreateOrderLoading(true);

    try {
      const orderItemsData: CreateOrderItemRequest[] = orderItems.map(item => ({
        menu_item_id: item.menu_item_id,
        quantity: item.quantity,
        notes: item.notes || undefined,
      }));

      await createOrder({
        user_id: selectedUserId,
        order_items: orderItemsData,
      });
      
      setShowCreateModal(false);
      setSelectedUserId(0);
      setOrderItems([]);
      fetchOrders();
    } catch (err) {
      setCreateOrderError(err instanceof Error ? err.message : 'خطا در ایجاد سفارش');
    } finally {
      setCreateOrderLoading(false);
    }
  };

  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
    setSelectedUserId(0);
    setOrderItems([]);
    setCreateOrderError('');
  };

  const handleStatusChange = (order: Order) => {
    setEditingOrder(order);
    setSelectedStatus(order.status);
    setShowStatusModal(true);
    setUpdateStatusError('');
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrder) return;

    setUpdateStatusError('');
    setUpdateStatusLoading(true);

    try {
      await updateOrderStatus(editingOrder.id, selectedStatus);
      setShowStatusModal(false);
      setEditingOrder(null);
      setSelectedStatus('');
      fetchOrders();
    } catch (err) {
      setUpdateStatusError(err instanceof Error ? err.message : 'خطا در بروزرسانی وضعیت سفارش');
    } finally {
      setUpdateStatusLoading(false);
    }
  };

  const handleCloseStatusModal = () => {
    setShowStatusModal(false);
    setEditingOrder(null);
    setSelectedStatus('');
    setUpdateStatusError('');
  };

  return (
    <div className="orders-container">
      <div className="orders-header">
        <h1>لیست سفارش‌ها</h1>
        <div className="header-buttons">
          <button 
            onClick={() => setShowCreateModal(true)} 
            className="add-order-button"
          >
            ➕ ایجاد سفارش جدید
          </button>
          <button 
            onClick={fetchOrders} 
            className="refresh-button"
            disabled={loading}
          >
            🔄 {loading ? 'در حال بارگذاری...' : 'بروزرسانی'}
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading && orders.length === 0 ? (
        <div className="loading">در حال بارگذاری...</div>
      ) : (
        <div className="table-container">
          <table className="orders-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>کاربر</th>
                <th>وضعیت</th>
                <th>مبلغ کل</th>
                <th>تعداد آیتم‌ها</th>
                <th>تاریخ ایجاد</th>
                <th>عملیات</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="no-data">
                    هیچ سفارشی یافت نشد
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id}>
                    <td>{order.id}</td>
                    <td>
                      {order.user ? order.user.name : `کاربر #${order.user_id}`}
                    </td>
                    <td>
                      <span className={`status-badge status-${order.status}`}>
                        {getStatusLabel(order.status)}
                      </span>
                    </td>
                    <td>{formatPrice(order.total_price)}</td>
                    <td>{order.order_items?.length || 0}</td>
                    <td>{formatDate(order.created_at)}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="edit-button"
                          onClick={() => handleStatusChange(order)}
                          title="تغییر وضعیت"
                        >
                          ✏️
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

      {/* Create Order Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={handleCloseCreateModal}>
          <div className="modal-content create-order-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>ایجاد سفارش جدید</h2>
              <button className="close-button" onClick={handleCloseCreateModal}>
                ✕
              </button>
            </div>
            
            <form onSubmit={handleCreateOrder} className="create-order-form">
              <div className="form-group">
                <label htmlFor="user_id">کاربر</label>
                <select
                  id="user_id"
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(parseInt(e.target.value))}
                  required
                >
                  <option value="0">انتخاب کاربر</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.phone})
                    </option>
                  ))}
                </select>
              </div>

              <div className="order-items-section">
                <div className="section-header">
                  <h3>آیتم‌های سفارش</h3>
                  <button
                    type="button"
                    onClick={handleAddOrderItem}
                    className="add-item-button"
                  >
                    ➕ افزودن آیتم
                  </button>
                </div>

                {orderItems.length === 0 ? (
                  <p className="no-items-message">هیچ آیتمی اضافه نشده است</p>
                ) : (
                  orderItems.map((item, index) => (
                    <div key={index} className="order-item-form">
                      <div className="form-group">
                        <label>غذا</label>
                        <select
                          value={item.menu_item_id}
                          onChange={(e) => handleOrderItemChange(index, 'menu_item_id', parseInt(e.target.value))}
                          required
                        >
                          <option value="0">انتخاب غذا</option>
                          {menus.map((menu) => (
                            <option key={menu.id} value={menu.id}>
                              {menu.name} - {formatPrice(menu.price || 0)}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="form-group">
                        <label>تعداد</label>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleOrderItemChange(index, 'quantity', parseInt(e.target.value) || 1)}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>توضیحات (اختیاری)</label>
                        <input
                          type="text"
                          value={item.notes}
                          onChange={(e) => handleOrderItemChange(index, 'notes', e.target.value)}
                          placeholder="مثلاً: بدون پیاز"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveOrderItem(index)}
                        className="remove-item-button"
                      >
                        🗑️ حذف
                      </button>
                    </div>
                  ))
                )}
              </div>

              {createOrderError && <div className="error-message">{createOrderError}</div>}

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={handleCloseCreateModal}
                  className="cancel-button"
                  disabled={createOrderLoading}
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="submit-button"
                  disabled={createOrderLoading || orderItems.length === 0}
                >
                  {createOrderLoading ? 'در حال ایجاد...' : 'ایجاد سفارش'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Update Status Modal */}
      {showStatusModal && editingOrder && (
        <div className="modal-overlay" onClick={handleCloseStatusModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>تغییر وضعیت سفارش</h2>
              <button className="close-button" onClick={handleCloseStatusModal}>
                ✕
              </button>
            </div>
            
            <form onSubmit={handleUpdateStatus} className="update-status-form">
              <div className="form-group">
                <label htmlFor="status">وضعیت</label>
                <select
                  id="status"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  required
                >
                  {statuses.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>

              {updateStatusError && <div className="error-message">{updateStatusError}</div>}

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={handleCloseStatusModal}
                  className="cancel-button"
                  disabled={updateStatusLoading}
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="submit-button"
                  disabled={updateStatusLoading}
                >
                  {updateStatusLoading ? 'در حال بروزرسانی...' : 'ذخیره تغییرات'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;

