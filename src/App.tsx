import './App.css';
import {
  Route,
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
} from 'react-router-dom';
import DraggableMap from './components/draggableMap';
import Building from './components/Building';
import DigitalTwinViewer from './components/digital-twin-viewer';

function App() {
  const router = createBrowserRouter(
    createRoutesFromElements([
      // <Route path="/" element={<MapExample />}></Route>,
      <Route
        path="/"
        element={
          <DraggableMap mapImageUrl="https://images4.imagebam.com/f4/e0/5d/MEZ040L_o.jpg" />
        }
      ></Route>,
      <Route path="/3d" element={<Building />}></Route>,
      <Route path="dt" element={<DigitalTwinViewer />}></Route>,
      // <Route
      //   path="/map-with-points"
      //   element={
      //     <DraggableMapWithPoints mapImageUrl="src/assets/landmark.jpg" />
      //   }
      // ></Route>,
    ])
  );

  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}

export default App;
