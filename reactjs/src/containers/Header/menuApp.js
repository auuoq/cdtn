export const adminMenu = [

    { //Quản lí người dùng
        name: 'menu.admin.manage-user',
        menus: [
            // {
            //     name: 'menu.admin.crud', link: '/system/user-manage',
            // },

            {
                name: 'menu.admin.crud-redux', link: '/system/user-redux',
            },

            {
                name: 'menu.admin.manage-doctor', link: '/system/manage-doctor',
            },
            {
                name: 'Quản lý phòng khám', link: '/system/manage-clinicManager',
            },

            // {
            //     name: 'menu.admin.manage-admin', link: '/system/user-admin',
            // },
            // { //Quản lí kế hoạch khám bệnh của bác sĩ
            //     name: 'menu.doctor.manage-schedule', link: '/doctor/manage-schedule'
            // },
        ]
    },
    { //Quản lí phòng khám
        name: 'menu.admin.clinic',
        menus: [
            {
                name: 'menu.admin.manage-clinic', link: '/system/manage-clinic',
            },
        ]
    },
    { //Quản lí chuyên khoa
        name: 'menu.admin.specialty',
        menus: [
            {
                name: 'menu.admin.manage-specialty', link: '/system/manage-specialty',
            },
        ]
    },

    { //Quản lí đặt cọc
        name: 'Báo cáo đặt cọc',
        menus: [
            {
                name: 'Báo cáo đặt cọc', link: '/system/deposit-report',
            },
        ]
    },
    
];

export const doctorMenu = [
    {
        name: 'menu.admin.manage-user',
        menus: [
            { //Quản lí kế hoạch khám bệnh của bác sĩ
                name: 'menu.doctor.manage-schedule', link: '/doctor/manage-schedule'

            },
            { //Quản lí bệnh nhân khám bệnh của bác sĩ
                name: 'menu.doctor.manage-patient', link: '/doctor/manage-patient'

            },
            { //Quản lí bệnh nhân đã khám của bác sĩ 
                name: 'menu.doctor.manage-record', link: '/doctor/manage-record'

            },

        ]

    },
    {
        name: 'Tin nhắn',
        menus: [
            {
                name: 'Tin nhắn', link: '/doctor/chat',
            },
        ]
    
    }
];

export const manager_clinicMenu = [
    {
    name: 'Quản lý lịch khám ',
    menus: [
        { //Quản lí kế hoạch khám bệnh của bác sĩ
            name: 'Đặt lịch khám bệnh nhân', link: '/manage/manage-booking'

        },
                { //Quản lí kế hoạch khám bệnh của bác sĩ
            name: 'Đặt lịch khám bác sĩ', link: '/manage/schedule-by-manager' 

        },
                        { //Quản lí kế hoạch khám bệnh của bác sĩ
            name: 'Xem lịch khám', link: '/manage/booking' 

        },

    ]
    },
    { //Quản lí phòng khám
        name: 'Quản lý phòng khám',
        menus: [
            {
                name: 'Quản lý phòng khám', link: '/manage/clinic-by-manager',
            },
        ]
    },
    // { //Quản lí kế hoạch khám bệnh của bác sĩ
    //     name: 'Quản lý đặt lịch',
    //     menus: [
    //         {
    //             name: 'Đặt lịch', link: '/manage/schedule-by-manager',
    //         },
    //     ]
    // },
    // { //Quản lí lịch hẹnhẹn
    //     name: 'Thông tin lịch khám',
    //     menus: [
    //         {
    //             name: 'Thông tin lịch khám', link: '/manage/booking',
    //         },
    //     ]
    // },
    { //Quản lí gói khám
        name: 'Gói khám',
        menus: [
            {
                name: 'Quản lý gói khám', link: '/manage/manage-package',
            },
            {
                name: 'Đặt lịch gói khám', link: '/manage/schedule-package',
            },
            {
                name: 'Xác nhận đã khám', link: '/manage/package-s2',
            },
            {
                name: 'lịch sử đã khám', link: '/manage/package-s3',
            }
        ]
    },
    { //Quản lí đặt cọc
        name: 'Báo cáo đặt cọc',
        menus: [
            {
                name: 'Báo cáo đặt cọc', link: '/manage/deposit-report',
            },
        ]
    },


];