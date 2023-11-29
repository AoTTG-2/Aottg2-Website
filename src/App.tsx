/// <reference types="vite-plugin-svgr/client" />
import Landing from "./screens/Landing";
import Navbar from "./screens/Navbar";

function App() {
  return (
    <>
      <Navbar />
      <Landing />
      <div className="w-full h-[300vh] bg-white" />
    </>
  );
}

export default App;
