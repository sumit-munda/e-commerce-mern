import { useRating } from "6pp";
import { FaRegStar, FaStar } from "react-icons/fa";

interface RatingsProps {
  value?:number
}

const RatingsComponent = ({ value = 0 }: RatingsProps) => {
  const { Ratings } = useRating({
    IconFilled: <FaStar />,
    IconOutline: <FaRegStar />,
    value,
    styles: {
      fontSize: "1.5rem",
      color: "coral",
      justifyContent :"flex-start"
    },
  });
  return <Ratings />;
};

export default RatingsComponent;
