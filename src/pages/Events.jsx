import React, { useEffect, useState } from 'react'
import API from '../services/api'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import { Calendar, Plus } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

export default function Events() {
  const { profile } = useAuth()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [openModal, setOpenModal] = useState(false)

  useEffect(() => {
    load()
  }, [])

  async function load() {
    try {
      const r = await API.get('/events')
      setEvents(Array.isArray(r.data) ? r.data : r.data.events || [])
    } catch (err) {
      console.error('Error loading events', err)
    } finally {
      setLoading(false)
    }
  }

  const canCreate = ['faculty', 'clubhead', 'admin'].includes(profile?.role?.toLowerCase())
  const isStudent = profile?.role?.toLowerCase() === 'student'

  const handleRegister = async (eventId) => {
    try {
      const res = await API.post(`/events/${eventId}/register`)
      alert('Registered successfully!')
      const updated = events.map(ev => (ev._id === eventId ? res.data.event : ev))
      setEvents(updated)
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to register')
    }
  }

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading Events...
      </div>
    )

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f9f9fb] via-[#f2f2f7] to-[#e7e9ff] p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Calendar className="w-6 h-6 text-indigo-500" />
          Events
        </h1>

        {canCreate && (
          <Button
            onClick={() => setOpenModal(true)}
            className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white px-4 py-2 rounded-md hover:opacity-90 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" /> Create Event
          </Button>
        )}
      </div>

      {/* Event List */}
      {events.length === 0 ? (
        <p className="text-gray-500">No events available.</p>
      ) : (
        <div className="grid gap-4">
          {events.map((e) => {
            const isFull = e.maxParticipants > 0 && e.participants?.length >= e.maxParticipants
            return (
              <Card key={e._id} className="p-5 hover:shadow-md transition">
                <div className="flex justify-between items-center mb-1">
                  <h2 className="text-lg font-semibold">{e.title}</h2>
                  <span className="text-xs text-gray-500">
                    {e.startsAt ? new Date(e.startsAt).toLocaleString() : 'TBA'}
                  </span>
                </div>
                <p className="text-gray-700 mb-1">{e.location || 'Location: TBA'}</p>
                <p className="text-sm text-gray-600">{e.description}</p>

                {/* Participants */}
                <div className="mt-4 border-t pt-3">
                  <p className="text-sm font-semibold text-gray-700 mb-1">
                    Participants ({e.participants?.length || 0}/{e.maxParticipants || '∞'})
                  </p>
                  <ul className="text-sm text-gray-600 space-y-1 max-h-32 overflow-y-auto">
                    {e.participants?.map((p) => (
                      <li key={p._id} className="flex items-center gap-2">
                        👤 {p.name}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Register Button (Only for Students) */}
                {isStudent && (
                  <div className="mt-3">
                    <Button
                      disabled={isFull}
                      onClick={() => handleRegister(e._id)}
                      className={`px-3 py-1 rounded ${
                        isFull
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-indigo-600 text-white hover:opacity-90'
                      }`}
                    >
                      {isFull ? 'Full' : 'Register'}
                    </Button>
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      )}

      {/* Modal */}
      {canCreate && (
        <CreateEventModal
          open={openModal}
          onClose={() => setOpenModal(false)}
          onCreated={(newEvent) => setEvents([newEvent, ...events])}
        />
      )}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*                              CREATE EVENT MODAL                            */
/* -------------------------------------------------------------------------- */

function CreateEventModal({ open, onClose, onCreated }) {
  const [form, setForm] = useState({
    title: '',
    clubName: '',
    startsAt: '',
    location: '',
    maxParticipants: '',
    description: '',
  })
  const [loading, setLoading] = useState(false)

  if (!open) return null

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title) return alert('Please enter an event title')
    try {
      setLoading(true)
      const res = await API.post('/events', form)
      onCreated(res.data)
      onClose()
    } catch (err) {
      console.error('Error creating event', err)
      alert('Failed to create event')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 animate-scale">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Create New Event</h2>
          <button className="text-gray-500 hover:text-gray-700" onClick={onClose}>
            ✕
          </button>
        </div>

        <p className="text-gray-500 mb-4">Create an exciting event for your club</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Event Title" name="title" value={form.title} onChange={handleChange} placeholder="Event title" />
          <Input label="Club Name" name="clubName" value={form.clubName} onChange={handleChange} placeholder="Club name" />
          <Input label="Event Date & Time" type="datetime-local" name="startsAt" value={form.startsAt} onChange={handleChange} />
          <Input label="Location" name="location" value={form.location} onChange={handleChange} placeholder="Event location" />
          <Input
            label="Max Participants (Optional)"
            type="number"
            name="maxParticipants"
            value={form.maxParticipants}
            onChange={handleChange}
            placeholder="Leave empty for unlimited"
          />
          <div>
            <label className="block text-sm font-medium">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Event details..."
              className="w-full border rounded-md px-3 py-2"
              rows="3"
            ></textarea>
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white">
              {loading ? 'Creating...' : 'Create Event'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* Helper Input Component */
function Input({ label, ...props }) {
  return (
    <div>
      <label className="block text-sm font-medium">{label}</label>
      <input {...props} className="w-full border rounded-md px-3 py-2" />
    </div>
  )
}
