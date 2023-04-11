import React, { ReactElement } from "react";

interface Props {
  btnType: "button" | "submit";
  title: string;
  handleClick?: () => void;
  styles: string;
  isDisabled?: boolean;
}

const CustomButton = ({ btnType, title, handleClick, styles, isDisabled }: Props): ReactElement => {
  return (
    <button
      type={btnType}
      disabled={isDisabled}
      className={`font-epilogue font-semibold text-[16px] leading-[26px] text-white min-h-[52px] px-4 rounded-[10px] ${styles}`}
      {...(handleClick && { onClick: handleClick })}
    >
      {title}
    </button>
  );
};

export default CustomButton;
