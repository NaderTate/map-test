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
import CanvasPropertyMask from './components/master-plan-canvas';
import AppLayout from './components/AppLayout';

function App() {
  const router = createBrowserRouter(
    createRoutesFromElements([
      <Route path="/" element={<AppLayout />}>
        <Route
          path="/"
          element={<DraggableMap mapImageUrl="map.png" />}
        ></Route>
        <Route path="/3d" element={<Building />}></Route>
        <Route path="/dt" element={<DigitalTwinViewer />}></Route>
        <Route
          path="/master-plan-canvas"
          element={<CanvasPropertyMask />}
        ></Route>
      </Route>,
    ])
  );

  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}

export default App;
