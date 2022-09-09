import CloudSyncOutlinedIcon from '@mui/icons-material/CloudSyncOutlined';
import FeedOutlinedIcon from '@mui/icons-material/FeedOutlined';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import MenuOutlinedIcon from '@mui/icons-material/MenuOutlined';
import SensorsOutlinedIcon from '@mui/icons-material/SensorsOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import React, { useState } from 'react';
import { useLocation, useNavigate, useRoutes } from 'react-router-dom';
import NavbarItem from './NavbarItem';

export const ROUTES = {
  Home: {
    title: 'Home',
    path: '/home',
    Icon: HomeOutlinedIcon,
  },
  Session: {
    title: 'Session',
    path: '/session',
    Icon: SensorsOutlinedIcon,
  },
  Records: {
    title: 'Records',
    path: '/records',
    Icon: FeedOutlinedIcon,
  },
  Offline: {
    title: 'Offline',
    path: '/offline',
    Icon: CloudSyncOutlinedIcon,
  },
  Settings: {
    title: 'Settings',
    path: '/settings',
    Icon: SettingsOutlinedIcon,
  },
}

export default function Navbar() {

  const navigate = useNavigate();
  const { pathname } = useLocation();

  const [open, setOpen] = useState(true);

  return (
    <div className='h-full shadow-lg border-r border-gray-600 flex flex-col justify-between'>
      <div>
        <NavbarItem
          open={open}
          Icon={MenuOutlinedIcon}
          title="Close"
          onClick={() => setOpen(open => !open)}
        />
        {[
          ROUTES.Home,
          ROUTES.Session,
          ROUTES.Records,
          ROUTES.Offline,
        ].map(({ title, path, Icon }) => (
          <NavbarItem
            key={path}
            open={open}
            Icon={Icon}
            title={title}
            selected={pathname.startsWith(path)}
            onClick={() => navigate(path)}
          />
        ))}
      </div>
      <div>
        <NavbarItem
          open={open}
          Icon={ROUTES.Settings.Icon}
          title={ROUTES.Settings.title}
          selected={pathname.startsWith(ROUTES.Settings.path)}
          onClick={() => navigate(ROUTES.Settings.path)}
        />
      </div>
    </div>
  )
}
