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
                name: 'Quản lý gói khám', link: '/system/manage-clinicManager',
            },

            // {
            //     name: 'menu.admin.manage-admin', link: '/system/user-admin',
            // },
            { //Quản lí kế hoạch khám bệnh của bác sĩ
                name: 'menu.doctor.manage-schedule', link: '/doctor/manage-schedule'
            },
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
    }
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
    }
];

export const manager_clinicMenu = [
    {
    name: 'menu.admin.manage',
    menus: [
        { //Quản lí kế hoạch khám bệnh của bác sĩ
            name: 'menu.manage.manage-booking', link: '/manage/manage-booking'

        },

    ]
    },
    { //Quản lí phòng khám
        name: 'menu.manage.clinic',
        menus: [
            {
                name: 'menu.manage.manage-clinic', link: '/manage/clinic-by-manager',
            },
        ]
    },
    { //Quản lí kế hoạch khám bệnh của bác sĩ
        name: 'menu.manage.schedule',
        menus: [
            {
                name: 'menu.manage.manage-schedule', link: '/manage/schedule-by-manager',
            },
        ]
    },
    { //Quản lí lịch hẹnhẹn
        name: 'menu.manage.bookingbooking',
        menus: [
            {
                name: 'menu.manage.manage-bookingbooking', link: '/manage/booking',
            },
        ]
    },
    { //Quản lí gói khám
        name: 'menu.manage.manage-package',
        menus: [
            {
                name: 'menu.manage.manage-package', link: '/manage/manage-package',
            },
        ]
    }

];