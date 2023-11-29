import NavbarTexture from "../../assets/images/bg-light.png";
import NavbarSvg from "../../components/NavbarSvg";

const Navbar = () => {
  return (
    <div className="absolute top-0 z-50 w-full">
      <NavbarSvg
        className="absolute top-0 w-full h-auto z-[49]"
        image={NavbarTexture}
      />
      <NavbarSvg
        color="black"
        className="w-full h-auto absolute top-3 z-[48]"
      />
    </div>
  );
};

export default Navbar;
