const repo = require('../repo/attendance.repo')
const { hoursToMinutes } = require('date-fns')
const REST_START = hoursToMinutes(12) // 12:00
const REST_END = hoursToMinutes(13.5) // 13:30

const getAttendancesByDate = (date) => {
  console.log(`Query attendance records of ${date}`)
  return repo.getByDate(date)
}

const generateAttendanceResponse = (attendances) => {
  return attendances.map(attendance => {

    const clockIn = timeStringToMinutes(attendance.clock_in)
    const clockOut = timeStringToMinutes(attendance.clock_out)

    const restTime = calculateRestTime(clockIn, clockOut)

    return {
      employeeNum: attendance.employee_num,
      clockIn: attendance.clock_in,
      clockOut: attendance.clock_out,
      restTime,
      workTime: calculateWorkTime(restTime, clockIn, clockOut),
    }
  })
}

const calculateRestTime = (clockIn, clockOut) => {
  if (clockIn === null || clockOut === null) return null

  // clock in after lunch or clock out before lunch
  if (clockIn > REST_END || clockOut < REST_START) return 0

  // clock in during lunch
  if (REST_START < clockIn && clockIn < REST_END) return (REST_END - clockIn) / 60

  // clock out during lunch
  if (REST_START < clockOut && clockOut < REST_END) return (clockOut - REST_START) / 60

  // normal clock in/out time
  return (REST_END - REST_START) / 60
}

const calculateWorkTime = (restTime, clockIn, clockOut) => {
  if (clockIn === null || clockOut === null) return null

  const inOutDiff = (clockOut - clockIn) / 60
  return restTime === null ? inOutDiff : inOutDiff - restTime
}

const timeStringToMinutes = (timeString) => {
  return timeString === null ? null : parseInt(timeString.split(':')[0]) * 60 + parseInt(timeString.split(':')[1])
}

module.exports = {
  getAttendancesByDate,
  generateAttendanceResponse,
  calculateRestTime,
  calculateWorkTime
}
