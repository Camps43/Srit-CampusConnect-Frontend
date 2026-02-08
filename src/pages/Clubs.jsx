import React, { useEffect, useState } from 'react'
import API from '../services/api'
import Card from '../components/ui/Card'

export default function Clubs(){
  const [clubs, setClubs] = useState([])

  useEffect(()=> { API.get('/clubs').then(r=>setClubs(r.data)).catch(()=>{}) },[])

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Clubs</h2>
      <div className="grid md:grid-cols-3 gap-4">
        {clubs.map(c => (
          <Card key={c._id}>
            <div className="font-medium">{c.name}</div>
            <div className="text-sm text-gray-600">{c.description}</div>
            <div className="mt-3">
              <button onClick={()=>API.post(`/clubs/${c._id}/join`).then(()=>alert('Joined'))} className="bg-primary text-white px-3 py-1 rounded">Join</button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
