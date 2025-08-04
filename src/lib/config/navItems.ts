const navItems = {
    superAdmin: [
        {
            label: 'Dashboard',
            path: '/dashboard',
            icon: '/svg/dashboard.svg'
        },
        {
            label: 'User Management',
            path: '/users',
            icon: '/icons/users.png'
        },
        {
            label: 'Settings',
            path: '/settings',
            icon: '/icons/settings.png'
        }
    ],
    admin: [
        {
            label: 'Dashboard',
            path: 'LandingPage',
            icon: '/svg/dashboard.svg'
        },
        {
            label: 'Create Events',
            path: 'CreateEvent',
            icon: '/svg/create-event.svg'
        },
        {
            label: 'Event Promocodes',
            path: 'CreateEvent',
            icon: '/svg/create-event.svg'
        },
        {
            label: 'Profile',
            path: 'CreateEvent',
            icon: '/svg/create-event.svg'
        },
        {
            label: 'Logout',
            path: 'Login',
            icon: '/svg/bulk-add.svg'
        }

    ],
    user: [
        {
            label: 'Home',
            path: '/',
            icon: '/icons/home.png'
        },
        {
            label: 'Profile',
            path: '/profile',
            icon: '/icons/profile.png'
        }
    ]
};

export default navItems;
