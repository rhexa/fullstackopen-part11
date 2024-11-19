import React, { useEffect } from 'react'
import Timeout from './Timeout'

const Notification = ({ type,message,timeout,hook }) => {
  const classes = `notification ${type}`

  return (
    <Timeout delay={timeout||1} hook={hook}>
      <div className={classes}>{message}</div>
    </Timeout>
  )
}

export default Notification