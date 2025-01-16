import './App.css';
import {
  Route,
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
} from 'react-router-dom';
import MapExample from './components/mapbox-exmaple';
import DraggableMap from './components/draggableMap';

function App() {
  const router = createBrowserRouter(
    createRoutesFromElements([
      <Route path="/" element={<MapExample />}></Route>,
      <Route
        path="/map"
        element={<DraggableMap mapImageUrl="src/assets/landmark.jpg" />}
      ></Route>,
    ])
  );

  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}

export default App;
