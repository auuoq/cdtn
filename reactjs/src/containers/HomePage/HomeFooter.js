import React from 'react';
import './Footer.scss';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">

        <div className="footer-section">
          <h2 className="footer-title">Liên kết</h2>
          <ul className="footer-links">
            <li><a href="#">Trang chủ</a></li>
            <li><a href="#">Về chúng tôi</a></li>
            <li><a href="#">Dịch vụ</a></li>
            <li><a href="#">Liên hệ</a></li>
          </ul>
        </div>
        <div className="footer-section">
          <h2 className="footer-title">Kết nối với chúng tôi</h2>
          <div className="footer-socials">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"><i className="fab fa-facebook-f"></i></a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"><i className="fab fa-twitter"></i></a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"><i className="fab fa-instagram"></i></a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer"><i className="fab fa-linkedin-in"></i></a>
          </div>
        </div>

        <div className="footer-section">
          <h2 className="footer-title">BK Medical</h2>
          <p className="footer-desc">
            Chúng tôi cung cấp các dịch vụ y tế chất lượng cao với đội ngũ bác sĩ chuyên nghiệp. Hãy kết nối với chúng tôi qua các mạng xã hội bên dưới để cập nhật những thông tin mới nhất.
          </p>
        </div>
      </div>
      <div className="footer-bottom">
        &copy; {new Date().getFullYear()} BK Medical | All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
