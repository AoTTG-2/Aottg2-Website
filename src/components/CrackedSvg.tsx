interface CrackedSvgProps {
  color?: string;
  className?: string;
  image?: string | null;
}

const CrackedSvg = ({
  color = "white",
  className = "",
  image = null,
}: CrackedSvgProps) => {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 100 1469 132"
      fill="none"
    >
      <defs>
        <clipPath id="shape">
          <path d="M108.5 125L0 132V0.5H1469V132L1247.5 125L1181 132L973.5 125L782.5 132L697 125L491 132L344.5 125L169.5 132L108.5 125Z" />
        </clipPath>
      </defs>
      {image ? (
        <image clipPath="url(#shape)" width="100%" xlinkHref={image}></image>
      ) : (
        <path
          d="M108.5 125L0 132V0.5H1469V132L1247.5 125L1181 132L973.5 125L782.5 132L697 125L491 132L344.5 125L169.5 132L108.5 125Z"
          fill={color}
        />
      )}
    </svg>
  );
};

export default CrackedSvg;
