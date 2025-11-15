import React, { useState, useEffect, useRef } from 'react';
import { 
  getReservations, 
  getReservationStatuses, 
  updateReservationStatus, 
  cancelReservation, 
  Reservation, 
  ReservationStatus 
} from '../services/api';
import './Reservations.css';

const Reservations: React.FC = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [statuses, setStatuses] = useState<ReservationStatus[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [editingReservation, setEditingReservation] = useState<Reservation | null>(null);
  const [cancelingReservationId, setCancelingReservationId] = useState<number | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [updateStatusLoading, setUpdateStatusLoading] = useState(false);
  const [cancelReservationLoading, setCancelReservationLoading] = useState(false);
  const [updateStatusError, setUpdateStatusError] = useState('');
  const [cancelReservationError, setCancelReservationError] = useState('');
  const hasFetched = useRef(false);

  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      fetchReservations();
      fetchStatuses();
    }
  }, []);

  const fetchReservations = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getReservations();
      setReservations(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در دریافت لیست رزروها');
    } finally {
      setLoading(false);
    }
  };

  const fetchStatuses = async () => {
    try {
      const data = await getReservationStatuses();
      setStatuses(data);
    } catch (err) {
      console.error('Error fetching reservation statuses:', err);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString: string, timeString: string) => {
    // Extract time from timeString if it's in ISO format
    const time = timeString.includes('T') ? timeString.split('T')[1].substring(0, 5) : timeString;
    return `${formatDate(dateString)} - ${time}`;
  };

  const getStatusLabel = (status: string) => {
    const statusObj = statuses.find(s => s.value === status);
    return statusObj ? statusObj.label : status;
  };

  const handleStatusChange = (reservation: Reservation) => {
    setEditingReservation(reservation);
    setSelectedStatus(reservation.status);
    setShowStatusModal(true);
    setUpdateStatusError('');
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReservation) return;

    setUpdateStatusError('');
    setUpdateStatusLoading(true);

    try {
      await updateReservationStatus(editingReservation.id, selectedStatus);
      setShowStatusModal(false);
      setEditingReservation(null);
      setSelectedStatus('');
      fetchReservations();
    } catch (err) {
      setUpdateStatusError(err instanceof Error ? err.message : 'خطا در بروزرسانی وضعیت رزرو');
    } finally {
      setUpdateStatusLoading(false);
    }
  };

  const handleCloseStatusModal = () => {
    setShowStatusModal(false);
    setEditingReservation(null);
    setSelectedStatus('');
    setUpdateStatusError('');
  };

  const handleCancel = (reservationId: number) => {
    setCancelingReservationId(reservationId);
    setShowCancelModal(true);
    setCancelReservationError('');
  };

  const handleConfirmCancel = async () => {
    if (!cancelingReservationId) return;

    setCancelReservationError('');
    setCancelReservationLoading(true);

    try {
      await cancelReservation(cancelingReservationId);
      setShowCancelModal(false);
      setCancelingReservationId(null);
      fetchReservations();
    } catch (err) {
      setCancelReservationError(err instanceof Error ? err.message : 'خطا در لغو رزرو');
    } finally {
      setCancelReservationLoading(false);
    }
  };

  const handleCloseCancelModal = () => {
    setShowCancelModal(false);
    setCancelingReservationId(null);
    setCancelReservationError('');
  };

  return (
    <div className="reservations-container">
      <div className="reservations-header">
        <h1>لیست رزروها</h1>
        <button 
          onClick={fetchReservations} 
          className="refresh-button"
          disabled={loading}
        >
          🔄 {loading ? 'در حال بارگذاری...' : 'بروزرسانی'}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading && reservations.length === 0 ? (
        <div className="loading">در حال بارگذاری...</div>
      ) : (
        <div className="table-container">
          <table className="reservations-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>کاربر</th>
                <th>میز</th>
                <th>تاریخ</th>
                <th>زمان</th>
                <th>وضعیت</th>
                <th>تاریخ ایجاد</th>
                <th>عملیات</th>
              </tr>
            </thead>
            <tbody>
              {reservations.length === 0 ? (
                <tr>
                  <td colSpan={8} className="no-data">
                    هیچ رزروی یافت نشد
                  </td>
                </tr>
              ) : (
                reservations.map((reservation) => (
                  <tr key={reservation.id}>
                    <td>{reservation.id}</td>
                    <td>
                      {reservation.user ? reservation.user.name : `کاربر #${reservation.user_id}`}
                    </td>
                    <td>
                      {reservation.table ? `میز ${reservation.table.number}` : `میز #${reservation.table_id}`}
                    </td>
                    <td>{formatDate(reservation.date)}</td>
                    <td>
                      {reservation.time.includes('T') 
                        ? reservation.time.split('T')[1].substring(0, 5)
                        : reservation.time.substring(0, 5)}
                    </td>
                    <td>
                      <span className={`status-badge status-${reservation.status}`}>
                        {getStatusLabel(reservation.status)}
                      </span>
                    </td>
                    <td>{formatDate(reservation.created_at)}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="edit-button"
                          onClick={() => handleStatusChange(reservation)}
                          title="تغییر وضعیت"
                        >
                          ✏️
                        </button>
                        <button
                          className="delete-button"
                          onClick={() => handleCancel(reservation.id)}
                          title="لغو رزرو"
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

      {/* Update Status Modal */}
      {showStatusModal && editingReservation && (
        <div className="modal-overlay" onClick={handleCloseStatusModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>تغییر وضعیت رزرو</h2>
              <button className="close-button" onClick={handleCloseStatusModal}>
                ✕
              </button>
            </div>
            
            <form onSubmit={handleUpdateStatus} className="update-status-form">
              <div className="form-group">
                <label htmlFor="status">وضعیت</label>
                <select
                  id="status"
                  name="status"
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

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div className="modal-overlay" onClick={handleCloseCancelModal}>
          <div className="modal-content delete-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>لغو رزرو</h2>
              <button className="close-button" onClick={handleCloseCancelModal}>
                ✕
              </button>
            </div>
            
            <div className="delete-modal-body">
              <p>آیا مطمئن هستید که می‌خواهید این رزرو را لغو کنید؟</p>
              <p className="delete-warning">این عمل غیرقابل بازگشت است!</p>
              
              {cancelReservationError && <div className="error-message">{cancelReservationError}</div>}

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={handleCloseCancelModal}
                  className="cancel-button"
                  disabled={cancelReservationLoading}
                >
                  انصراف
                </button>
                <button
                  type="button"
                  onClick={handleConfirmCancel}
                  className="delete-confirm-button"
                  disabled={cancelReservationLoading}
                >
                  {cancelReservationLoading ? 'در حال لغو...' : 'لغو رزرو'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reservations;

