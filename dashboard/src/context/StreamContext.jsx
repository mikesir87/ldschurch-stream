import React, { createContext, useContext, useState } from 'react'

const StreamContext = createContext()

export const useStream = () => {
  const context = useContext(StreamContext)
  if (!context) {
    throw new Error('useStream must be used within a StreamProvider')
  }
  return context
}

export const StreamProvider = ({ children }) => {
  const [streams, setStreams] = useState([])
  const [loading, setLoading] = useState(false)

  const createStream = async (streamData) => {
    setLoading(true)
    // API call would go here
    setLoading(false)
  }

  const deleteStream = async (streamId) => {
    setLoading(true)
    // API call would go here
    setLoading(false)
  }

  const value = {
    streams,
    loading,
    createStream,
    deleteStream
  }

  return (
    <StreamContext.Provider value={value}>
      {children}
    </StreamContext.Provider>
  )
}