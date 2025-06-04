import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import queryString from 'query-string';
import { getDetailInforDoctor, searchClinic } from '../../services/userService';
import { Link } from 'react-router-dom/cjs/react-router-dom.min';
import HomeHeader from '../../containers/HomePage/HomeHeader';

const SearchClinic = () => {
    const location = useLocation();
    const [clinics, setClinics] = useState([]);
    const [loading, setLoading] = useState(true);

    const { keyword } = queryString.parse(location.search);
    console.log(keyword)

    useEffect(() => {
        const fetchClinics = async () => {
            try {
                const res = await searchClinic(keyword);
                setClinics(res.data);
            } catch (err) {
                console.error("Error fetching clinics", err);
            } finally {
                setLoading(false);
            }
        };

        if (keyword) fetchClinics();
    }, [keyword]);

    return (
        <div>
            <HomeHeader/>
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
                        }}>Tìm kiếm phòng khám</a>
                    </li>

                    </ol>
                </nav>


                <div className="row">
                    {clinics.length > 0 ? (
                    clinics.map(pkg => (
                        <Link
                            key={pkg.id} className="col-sm-6 col-md-4 mb-4"
                            to={`/detail-clinic/${pkg.id}`}
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

                            </div>
                        </div>
                        </Link>
                    ))
                    ) : (
                    <div className="col-12 text-center">Không tìm thấy phòng khám nào </div>
                    )}
                </div>
                </div>
            </section>
        </div>
    );
};

export default SearchClinic;
