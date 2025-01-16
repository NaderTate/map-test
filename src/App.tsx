import "./App.css";
import {
  Route,
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
} from "react-router-dom";
import MapExample from "./components/mapbox-exmaple";

function App() {
  const router = createBrowserRouter(
    createRoutesFromElements(<Route path="/" element={<MapExample />}></Route>)
  );

  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}

export default App;
