import { useState, useEffect } from 'react';
import { Bell, Plus } from 'lucide-react';
import API from '../services/api';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import CreateNoticeModal from '../components/modals/CreateNoticeModal';
import { useAuth } from '../contexts/AuthContext';

export default function Notices() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const { profile } = useAuth();

  useEffect(() => {
    async function fetchNotices() {
      try {
        const res = await API.get('/notices');
        setNotices(res.data);
      } catch (err) {
        console.error('Error fetching notices', err);
      } finally {
        setLoading(false);
      }
    }
    fetchNotices();
  }, []);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading Notices...
      </div>
    );

  const canCreate = ['faculty', 'clubhead', 'admin'].includes(profile?.role?.toLowerCase());

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f9f9fb] via-[#f2f2f7] to-[#e7e9ff] p-8">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Bell className="w-6 h-6 text-indigo-500" />
          Notice Board
        </h1>

        {/* ✅ Only show Create button for authorized roles */}
        {canCreate && (
          <Button
            onClick={() => setOpenModal(true)}
            className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white px-4 py-2 rounded-md hover:opacity-90 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" /> Create Notice
          </Button>
        )}
      </div>

      {/* Notices List */}
      {notices.length === 0 ? (
        <p className="text-gray-500">No notices yet.</p>
      ) : (
        <div className="grid gap-4">
          {notices.map((n) => (
            <Card key={n._id} className="p-5 hover:shadow-md transition">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium bg-gray-100 px-2 py-1 rounded capitalize">
                  {n.category || 'general'}
                </span>
                <span className="text-xs text-gray-500">
                  {new Date(n.createdAt).toLocaleDateString()}
                </span>
              </div>

              <h2 className="text-lg font-semibold">{n.title}</h2>
              <p className="text-gray-700 mt-1">{n.body}</p>

              <p className="text-sm text-gray-500 mt-2">
                Posted by {n.author?.name || 'Unknown'} •{' '}
                {n.author?.role ? n.author.role.charAt(0).toUpperCase() + n.author.role.slice(1) : ''}
              </p>
            </Card>
          ))}
        </div>
      )}

      {/* Modal for Creating Notice */}
      {canCreate && (
        <CreateNoticeModal
          open={openModal}
          onClose={() => setOpenModal(false)}
          onCreated={(newNotice) => setNotices([newNotice, ...notices])}
        />
      )}
    </div>
  );
}
