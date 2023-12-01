/// <reference types="vite-plugin-svgr/client" />
import Feature from "./screens/Feature";
import Landing from "./screens/Landing";
import Navbar from "./screens/Navbar";
import News from "./screens/News";

function App() {
  return (
    <>
      <Navbar />
      <Landing />
      <News />
      <Feature />
      <div className="w-full h-[300vh] bg-white" />
    </>
  );
}

export default App;
