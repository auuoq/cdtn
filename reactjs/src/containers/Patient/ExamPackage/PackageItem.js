import React, { Component } from 'react';
import PackageSchedule from './PackageSchedule'; 
import PackageExtraInfor from './PackageExtraInfor';

class PackageItem extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedPackageId: null,
        };
    }

    componentDidMount() {
        if (this.props.detailPackage && this.props.detailPackage.id) {
            this.setState({ selectedPackageId: this.props.detailPackage.id });
        }
    }

    handleClickScheduleTime = (timeSlot) => {
        console.log('Selected time slot:', timeSlot);
    }

    render() {
        const { detailPackage } = this.props;
        const { selectedPackageId } = this.state;

        if (!detailPackage) return null;

        return (
            <div className="package-item">
                <div className="package-left">
                    <div className="package-header">
                        {detailPackage.image && (
                            <img
                                src={detailPackage.image}
                                alt={detailPackage.name}
                                className="package-image"
                            />
                        )}
                        <h3>{detailPackage.name}</h3>
                    </div>
                    <div
                        className="package-description"
                        dangerouslySetInnerHTML={{ __html: detailPackage.description || detailPackage.contentHTML }}
                    />
                </div>
                <div className="package-right">
                    <div className="package-schedule">
                        <PackageSchedule
                            packageIdFromParent={selectedPackageId}
                            handleClickScheduleTime={this.handleClickScheduleTime}
                        />
                    </div>
                    <div className="package-extra-infor">
                        <PackageExtraInfor detailPackage={detailPackage} />
                    </div>
                </div>

                <style jsx>{`
                    .package-item {
                        display: flex;
                        border: 1px solid #ccc;
                        margin-bottom: 20px;
                        padding: 15px;
                        border-radius: 8px;
                        background-color: #fff;
                    }
                    .package-left {
                        flex: 1;
                        padding-right: 20px;
                        border-right: 1px solid #eee;
                    }
                    .package-header {
                        display: flex;
                        align-items: center;
                        margin-bottom: 10px;
                    }
                    .package-image {
                        width: 60px;
                        height: 60px;
                        object-fit: cover;
                        border-radius: 8px;
                        margin-right: 15px;
                        border: 1px solid #ddd;
                    }
                    .package-left h3 {
                        margin: 0;
                        font-size: 20px;
                    }
                    .package-description {
                        color: #555;
                        font-size: 14px;
                        line-height: 1.4;
                    }
                    .package-right {
                        flex: 1;
                        padding-left: 20px;
                        display: flex;
                        flex-direction: column;
                        justify-content: space-between;
                    }
                    .package-schedule {
                        margin-bottom: 20px;
                    }
                `}</style>
            </div>
        );
    }
}

export default PackageItem;
