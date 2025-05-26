import React, { useEffect, useState } from 'react';
import HomeHeader from '../../HomePage/HomeHeader';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Link } from 'react-router-dom';
import ChatBox from '../../../components/chatbox';



const AllPackage = () => {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [showChatbox, setShowChatbox] = useState(false);
  const toggleChatbox = () => {
    setShowChatbox(prev => !prev);
  };

  const fetchData = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/get-all-exam-packages');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      setData(result.data);
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  console.log('data', data);
  const handleDetail = (id) =>{
    
  }

  return (
    <div>
      <HomeHeader />
      <section className="bg-light ">

        <div className="container">
          {/* Breadcrumb navigation */}
          <nav aria-label="breadcrumb bg-white ">
            <ol className="breadcrumb bg-transparent shadow-sm">
              <li className="breadcrumb-item" >
                <a href="/" style={{
                    color :"#707070"
                }}>Trang chủ</a>
              </li>
              <li className="breadcrumb-item">
                <a href="#"  style={{
                    color :"#707070"
                }}>Danh sách gói khám</a>
              </li>

            </ol>
          </nav>

          {error && <div className="alert alert-danger">Lỗi: {error}</div>}
          <div className="row">
            {data.length > 0 ? (
              data.map(pkg => (
                <Link 
                    key={pkg.id} className="col-sm-6 col-md-4 mb-4"
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
                      <p className="card-text text-primary fw-bold mt-auto">
                        {Number(pkg.price).toLocaleString('vi-VN', {
                          style: 'currency',
                          currency: 'VND',
                        })}
                      </p>
                      <button className="btn btn-outline-primary btn-sm mt-2">
                        Đặt Khám
                      </button>
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
      {/* Nút mở chatbox */}
      <div
        onClick={toggleChatbox}
        style={{
          position: 'fixed',
          bottom: '10px',
          right: '20px',
          width: '50px',
          height: '50px',
          borderRadius: '50%',
          backgroundColor: '#007bff',
          color: 'white',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          cursor: 'pointer',
          zIndex: 1001,
          boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
          fontSize: '24px',
        }}
        title="Nhắn tin với bác sĩ"
      >
        💬
      </div>

      {/* ChatBox hiển thị khi bật */}
      {showChatbox && (
        <div
          style={{
            position: 'fixed',
            bottom: '100px',
            right: '20px',
            zIndex: 1000,
            width: '320px',
            maxHeight: '500px',
            background: 'white',
            boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
            borderRadius: '8px',
            overflow: 'hidden',
          }}
        >
          <ChatBox />
        </div>
      )}

    </div>
  );
};

export default AllPackage;
