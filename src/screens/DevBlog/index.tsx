import BgContainer from "../../components/BgContainer";

const DevBlog = () => {
  return (
    <>
      <BgContainer title="Latest Devblog" isDark shouldShowCrack={false}>
        <div className="relative w-full pt-[56.25%]">
          <iframe
            src="https://www.youtube.com/embed/xXX0lk-z2F0"
            className="absolute top-0 left-0 w-full h-full"
            allowFullScreen
          ></iframe>
        </div>
      </BgContainer>
    </>
  );
};

export default DevBlog;
