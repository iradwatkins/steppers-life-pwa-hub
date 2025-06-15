import { Routes, Route } from 'react-router-dom'
import EventSeatingPage from './pages/EventSeatingPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<EventSeatingPage />} />
    </Routes>
  )
}

export default App 