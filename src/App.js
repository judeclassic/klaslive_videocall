import {Route, Routes, BrowserRouter} from 'react-router-dom';
import Starter from './pages/Starter';
import CreateRoom from "./routes/CreateRoom";
import Room from "./routes/Room";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path= '/instruct' element={<Starter/>} />
        <Route path="/" exact element={<CreateRoom/>} />
        <Route path="/room/:roomID" element={<Room/>} />
      </Routes >
    </BrowserRouter>
  )
}

export default App;