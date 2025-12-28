import React, { createContext, useContext, useState } from 'react'

const AttendanceContext = createContext()

export const useAttendance = () => {
  const context = useContext(AttendanceContext)
  if (!context) {
    throw new Error('useAttendance must be used within an AttendanceProvider')
  }
  return context
}

export const AttendanceProvider = ({ children }) => {
  const [attendance, setAttendance] = useState(null)
  const [loading, setLoading] = useState(false)

  const submitAttendance = async (attendanceData) => {
    setLoading(true)
    // API call would go here
    setAttendance(attendanceData)
    setLoading(false)
  }

  const value = {
    attendance,
    loading,
    submitAttendance
  }

  return (
    <AttendanceContext.Provider value={value}>
      {children}
    </AttendanceContext.Provider>
  )
}