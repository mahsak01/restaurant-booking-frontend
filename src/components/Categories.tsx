import React, { useState, useEffect, useRef } from 'react';
import { getCategoriesOptions, CategoryOption } from '../services/api';
import './Categories.css';

const Categories: React.FC = () => {
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
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
      const data = await getCategoriesOptions();
      setCategories(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در دریافت لیست دسته‌بندی‌ها');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="categories-container">
      <div className="categories-header">
        <h1>لیست دسته‌بندی‌ها</h1>
        <button 
          onClick={fetchCategories} 
          className="refresh-button"
          disabled={loading}
        >
          🔄 {loading ? 'در حال بارگذاری...' : 'بروزرسانی'}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading && categories.length === 0 ? (
        <div className="loading">در حال بارگذاری...</div>
      ) : (
        <div className="table-container">
          <table className="categories-table">
            <thead>
              <tr>
                <th>ردیف</th>
                <th>نام دسته‌بندی</th>
                <th>کد دسته‌بندی</th>
              </tr>
            </thead>
            <tbody>
              {categories.length === 0 ? (
                <tr>
                  <td colSpan={3} className="no-data">
                    هیچ دسته‌بندی‌ای یافت نشد
                  </td>
                </tr>
              ) : (
                categories.map((category, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{category.label}</td>
                    <td>{category.value}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Categories;

