import React, { useEffect, useState } from 'react';
import API from '../../services/api';
import Button from '../ui/Button';
import { useAuth } from '../../contexts/AuthContext';

export default function ProjectProgressPanel({ projectId }) {
  const { profile } = useAuth();

  const [progress, setProgress] = useState(0);
  const [text, setText] = useState('');
  const [mediaFiles, setMediaFiles] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load progress history
  useEffect(() => {
    async function loadProgress() {
      const res = await API.get(`/projects/${projectId}/progress`);
      setHistory(res.data || []);
    }
    loadProgress();
  }, [projectId]);

  // Submit progress + media
  async function submitProgress() {
    if (!progress || !text) {
      return alert('Enter progress and description');
    }

    try {
      setLoading(true);

      // 1️⃣ Create progress entry
      const res = await API.post(`/projects/${projectId}/progress`, {
        progressPercent: progress,
        updateText: text,
      });

      const progressId = res.data._id;

      // 2️⃣ Upload media (if any)
      if (mediaFiles.length > 0) {
        const formData = new FormData();
        mediaFiles.forEach(file => formData.append('media', file));

        await API.post(
          `/projects/progress/${progressId}/media`,
          formData
        );
      }

      // Reload progress
      const updated = await API.get(`/projects/${projectId}/progress`);
      setHistory(updated.data);

      setProgress(0);
      setText('');
      setMediaFiles([]);
    } catch {
      alert('Failed to submit progress');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">

      {/* STUDENT INPUT */}
      {profile?.role === 'student' && (
        <div className="bg-purple-50 border rounded-xl p-5">
          <h3 className="font-semibold mb-3">Student Progress</h3>

          <input
            type="range"
            min="0"
            max="100"
            value={progress}
            onChange={e => setProgress(Number(e.target.value))}
            className="w-full"
          />

          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Describe your progress..."
            className="w-full mt-3 p-2 border rounded"
          />

          <input
            type="file"
            multiple
            accept="image/*,video/*"
            onChange={e => setMediaFiles([...e.target.files])}
            className="mt-2"
          />

          <Button
            onClick={submitProgress}
            disabled={loading}
            className="mt-4 bg-purple-600 text-white w-full"
          >
            Submit for Approval
          </Button>
        </div>
      )}

      {/* PROGRESS HISTORY */}
      {history.map(item => (
        <div key={item._id} className="border rounded p-4">
          <div className="flex justify-between">
            <span>{item.student?.name}</span>
            <span className="text-xs">{item.status}</span>
          </div>

          <p className="mt-2">{item.updateText}</p>

          {/* MEDIA DISPLAY */}
          {item.media?.length > 0 && (
            <div className="grid grid-cols-2 gap-2 mt-3">
              {item.media.map((url, i) =>
                url.includes('video') ? (
                  <video key={i} controls className="w-full rounded">
                    <source src={url} />
                  </video>
                ) : (
                  <img key={i} src={url} className="w-full rounded" />
                )
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
