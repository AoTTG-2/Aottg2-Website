import BgContainer from "../../components/BgContainer";
import Button from "../../components/Button";
import AotLogo from "../../assets/images/logo-placeholder.png";
import TeamBg from "../../assets/images/teambg.jpg";
import { useNavigate } from "react-router-dom";

const Team = () => {
  const navigate = useNavigate();

  const handleCreditsClick = () => {
    navigate("/credits");
    window.scrollTo(0, 0);
  };

  return (
    <BgContainer customSrc={TeamBg}>
      <div className="flex flex-col lg:flex-row gap-12 lg:mt-4 text-gray-100 relative justify-center">
        <div className="text-center lg:pr-4 font-primary text-2xl lg:text-4xl flex flex-col z-10 items-center gap-0">
          <span className="flex flex-row items-end justify-center">
            <h2 className="text-4xl lg:text-6xl">The Team Behind</h2>
            <img
              src={AotLogo}
              className="ml-2 lg:ml-4 h-[3rem] lg:h-[4.5rem]"
            />
          </span>
          <span className="font-secondary lg:mt-2 mb-4 lg:mb-8">
            Inspired by Feng Lee's Original Creation
          </span>
          <Button hasBg onClick={handleCreditsClick}>
            Our Contributors
          </Button>
        </div>
      </div>
    </BgContainer>
  );
};

export default Team;
