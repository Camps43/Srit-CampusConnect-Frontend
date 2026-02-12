import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Avatar from './ui/Avatar';
import { useAuth } from '../contexts/AuthContext';
import Button from './ui/Button';


export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth() || {};

  // Hide navbar on auth pages
  if (
    location.pathname === '/' ||
    location.pathname === '/login' ||
    location.pathname === '/register'
  ) {
    return null;
  }

  const logout = () => {
    signOut();
    navigate('/');
  };

  return (
    <nav className="bg-white border-b sticky top-0 z-40">
      <div className="container px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to="/dashboard"
            className="font-bold text-lg text-primary"
          >
            Srit CampusConnect
          </Link>

          <Link to="/clubs" className="text-sm text-gray-600">
            Clubs
          </Link>
          <Link to="/events" className="text-sm text-gray-600">
            Events
          </Link>
          <Link to="/notices" className="text-sm text-gray-600">
            Notices
          </Link>
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link to="/chat" className="text-sm text-gray-600">
                Chat
              </Link>

              <div className="flex items-center gap-2">
                <Avatar
                  name={user.name}
                  src={profile?.avatarUrl}
                  size={36}
                />

                <div className="text-sm">
                  <div className="font-medium">{user.name}</div>
                  <div className="text-xs text-gray-500">
                    {profile?.role}
                  </div>
                </div>

                <Button variant="ghost" onClick={logout}>
                  Logout
                </Button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm text-gray-600">
                Login
              </Link>
              <Link to="/register" className="text-sm text-gray-600">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
