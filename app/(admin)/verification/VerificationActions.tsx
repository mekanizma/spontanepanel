'use client'

import { createServiceSupabaseClient } from '@/lib/supabaseService'
import { useState } from 'react'
import VerificationModal from './VerificationModal'

interface VerificationRequest {
  id: string
  user_id: string
  verification_type: string
  verification_data: any
  is_verified: boolean
  created_at: string
  verified_at: string | null
  users: {
    username: string
    full_name: string
    profile_image_url: string | null
  }[] | null
}

interface VerificationActionsProps {
  request: VerificationRequest
  onUpdate: () => void
}

export default function VerificationActions({ request, onUpdate }: VerificationActionsProps) {
  const [showModal, setShowModal] = useState(false)

  return (
    <>
      <div className="flex gap-2">
        <button 
          onClick={() => setShowModal(true)}
          className="btn btn-info btn-sm"
        >
          Detay
        </button>
        {!request.is_verified && (
          <span className="text-sm text-muted">
            Bekliyor
          </span>
        )}
      </div>
      
      {showModal && (
        <VerificationModal 
          request={request}
          onClose={() => setShowModal(false)}
          onUpdate={onUpdate}
        />
      )}
    </>
  )
}
