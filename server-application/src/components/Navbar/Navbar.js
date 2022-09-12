import CloudSyncOutlinedIcon from '@mui/icons-material/CloudSyncOutlined';
import FeedOutlinedIcon from '@mui/icons-material/FeedOutlined';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import MenuOutlinedIcon from '@mui/icons-material/MenuOutlined';
import SensorsOutlinedIcon from '@mui/icons-material/SensorsOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import React, { useState } from 'react';
import { useLocation, useNavigate, useRoutes } from 'react-router-dom';
import { useSessionContext } from '../../contexts/SessionContext';
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
  const { sessionStarted } = useSessionContext();

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
        <NavbarItem
          open={open}
          Icon={ROUTES.Home.Icon}
          title={ROUTES.Home.title}
          selected={pathname.startsWith(ROUTES.Home.path)}
          onClick={() => navigate(ROUTES.Home.path)}
        /><NavbarItem
          open={open}
          Icon={ROUTES.Session.Icon}
          title={ROUTES.Session.title}
          subsection={sessionStarted ? <div className='h-2 w-2 border bg-green-600 rounded-full'/> : null}
          selected={pathname.startsWith(ROUTES.Session.path)}
          onClick={() => navigate(ROUTES.Session.path)}
        /><NavbarItem
          open={open}
          Icon={ROUTES.Records.Icon}
          title={ROUTES.Records.title}
          selected={pathname.startsWith(ROUTES.Records.path)}
          onClick={() => navigate(ROUTES.Records.path)}
        /><NavbarItem
          open={open}
          Icon={ROUTES.Offline.Icon}
          title={ROUTES.Offline.title}
          selected={pathname.startsWith(ROUTES.Offline.path)}
          onClick={() => navigate(ROUTES.Offline.path)}
        />
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
