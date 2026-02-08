import { useState } from 'react';
import API from '../../services/api';
import { X } from 'lucide-react';

export default function CreateNoticeModal({ open, onClose, onCreated }) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('General');
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await API.post('/notices', { title, category, body });
      onCreated(res.data.notice);
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating notice');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-lg animate-scale">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Create New Notice</h2>
          <button onClick={onClose}><X className="w-5 h-5 text-gray-600" /></button>
        </div>
        <p className="text-gray-500 mb-4">Post an important announcement for the campus</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Notice title"
              className="w-full border rounded-md px-3 py-2 mt-1 focus:ring-2 focus:ring-indigo-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border rounded-md px-3 py-2 mt-1 focus:ring-2 focus:ring-indigo-500"
            >
              <option>General</option>
              <option>Academic</option>
              <option>Exam</option>
              <option>Event</option>
              <option>Urgent</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Content</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Notice details..."
              className="w-full border rounded-md px-3 py-2 mt-1 h-28 focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-md hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-md text-white bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600"
            >
              {loading ? 'Creating...' : 'Create Notice'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
