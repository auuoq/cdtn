import React, { useEffect, useState } from 'react';
import HomeHeader from '../../HomePage/HomeHeader';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Link } from 'react-router-dom';
import './AllPackage.scss';
import { getAllExamPackages, getAllClinic, getAllcodesService } from '../../../services/userService';

const AllPackage = () => {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [clinics, setClinics] = useState([]);
  const [categories, setCategories] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [filters, setFilters] = useState({
    clinicId: '',
    categoryId: '',
    provinceId: '',
    minPrice: '',
    maxPrice: ''
  });

  const [priceInputs, setPriceInputs] = useState({
    minPriceDisplay: '',
    maxPriceDisplay: ''
  });

  const fetchData = async () => {
    try {
      const response = await getAllExamPackages();
      if (response && response.data) {
        setData(response.data);
      } else {
        setError('Failed to fetch data');
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchData();
    fetchFilters();
  }, []);

  const fetchFilters = async () => {
    try {
      const [clinicRes, categoryRes, provinceRes] = await Promise.all([
        getAllClinic(),
        getAllcodesService('CATEGORY'),
        getAllcodesService('PROVINCE')
      ]);

      setClinics(clinicRes.data || []);
      setCategories(categoryRes.data || []);
      setProvinces(provinceRes.data || []);
    } catch (err) {
      console.error('Lỗi fetch filter:', err);
    }
  };

  const handleInputChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleMinPriceChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    setPriceInputs(prev => ({ ...prev, minPriceDisplay: new Intl.NumberFormat('vi-VN').format(value) }));
    setFilters(prev => ({ ...prev, minPrice: value }));
  };

  const handleMaxPriceChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    setPriceInputs(prev => ({ ...prev, maxPriceDisplay: new Intl.NumberFormat('vi-VN').format(value) }));
    setFilters(prev => ({ ...prev, maxPrice: value }));
  };

  const applyFilters = (items) => {
    return items.filter(item => {
      const { clinicId, categoryId, provinceId, minPrice, maxPrice } = filters;
      const matchesClinic = clinicId ? item.clinicId === +clinicId : true;
      const matchesCategory = categoryId ? item.categoryId === categoryId : true;
      const matchesProvince = provinceId ? item.provinceId === provinceId : true;
      const matchesMinPrice = minPrice ? +item.price >= +minPrice : true;
      const matchesMaxPrice = maxPrice ? +item.price <= +maxPrice : true;
      return matchesClinic && matchesCategory && matchesProvince && matchesMinPrice && matchesMaxPrice;
    });
  };

  return (
    <div>
      <HomeHeader />
      <section className="bg-light">
        <div className="container">
          <nav aria-label="breadcrumb bg-white">
            <ol className="breadcrumb bg-transparent shadow-sm">
              <li className="breadcrumb-item"><a href="/home" style={{ color: '#707070' }}>Trang chủ</a></li>
              <li className="breadcrumb-item"><a href="#" style={{ color: '#707070' }}>Danh sách gói khám</a></li>
            </ol>
          </nav>

          {error && <div className="alert alert-danger">Lỗi: {error}</div>}

          <div className="row g-2 filter-section">
            <div className="col-sm-6 col-md-4 col-lg-2">
              <select className="form-select" value={filters.clinicId} onChange={e => handleInputChange('clinicId', e.target.value)}>
                <option value="">-- Phòng khám --</option>
                {clinics.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="col-sm-6 col-md-4 col-lg-2">
              <select className="form-select" value={filters.categoryId} onChange={e => handleInputChange('categoryId', e.target.value)}>
                <option value="">-- Chuyên mục --</option>
                {categories.map(c => <option key={c.keyMap} value={c.keyMap}>{c.valueVi}</option>)}
              </select>
            </div>
            <div className="col-sm-6 col-md-4 col-lg-2">
              <select className="form-select" value={filters.provinceId} onChange={e => handleInputChange('provinceId', e.target.value)}>
                <option value="">-- Tỉnh thành --</option>
                {provinces.map(p => <option key={p.keyMap} value={p.keyMap}>{p.valueVi}</option>)}
              </select>
            </div>
            <div className="col-sm-6 col-md-4 col-lg-2">
              <input type="text" className="form-control" placeholder="Giá từ" value={priceInputs.minPriceDisplay} onChange={handleMinPriceChange} />
            </div>
            <div className="col-sm-6 col-md-4 col-lg-2">
              <input type="text" className="form-control" placeholder="Đến" value={priceInputs.maxPriceDisplay} onChange={handleMaxPriceChange} />
            </div>
            <div className="col-sm-6 col-md-4 col-lg-2">
              <button className="btn btn-primary w-100" onClick={fetchData}>Làm mới</button>
            </div>
          </div>

          <div className="row">
            {data.length > 0 ? (
              applyFilters(data).map(pkg => (
                <Link 
                  key={pkg.id}
                  className="col-sm-6 col-md-4 mb-4"
                  to={`/detail-exam-package/${pkg.id}`}
                  style={{ textDecoration: 'none', color: 'inherit', cursor: 'pointer' }}
                >
                  <div className="card h-100 shadow-sm border-0 text-decoration-none text-reset">
                    <img
                      src={pkg.image}
                      className="card-img-top"
                      alt={pkg.name}
                      style={{ objectFit: 'cover', height: '200px' }}
                    />
                    <div className="card-body d-flex flex-column">
                      <h5 className="card-title">{pkg.name}</h5>
                      {pkg.isDepositRequired ? (
                        <>
                          <p className="card-text text-warning mb-1">
                            Cần đặt cọc trước: {pkg.depositPercent}%
                          </p>
                          <p className="card-text small text-muted">
                            Số tiền đặt cọc: {(Number(pkg.price) * pkg.depositPercent / 100).toLocaleString('vi-VN', {
                              style: 'currency', currency: 'VND',
                            })}
                          </p>
                        </>
                      ) : (
                        <p className="card-text text-success mb-1">Không cần đặt cọc trước</p>
                      )}
                      <p className="card-text text-primary fw-bold mt-auto">
                        {Number(pkg.price).toLocaleString('vi-VN', {
                          style: 'currency', currency: 'VND',
                        })}
                      </p>
                      <button className="btn btn-outline-primary btn-sm mt-2">Đặt Khám</button>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-12 text-center">Đang tải hoặc không có gói nào.</div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default AllPackage;
