import './App.css';
import {
  Route,
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
} from 'react-router-dom';
import MapExample from './components/mapbox-exmaple';
import DraggableMap from './components/draggableMap';
import DraggableMapWithPoints from './components/draggableMapWithPoints';
import Building from './components/Building';

function App() {
  const router = createBrowserRouter(
    createRoutesFromElements([
      <Route path="/" element={<MapExample />}></Route>,
      <Route
        path="/map"
        element={<DraggableMap mapImageUrl="src/assets/landmark.jpg" />}
      ></Route>,
      <Route
        path="/map-with-points"
        element={
          <DraggableMapWithPoints mapImageUrl="src/assets/landmark.jpg" />
        }
      ></Route>,
      <Route path="/3d" element={<Building />}></Route>,
    ])
  );

  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}

export default App;
