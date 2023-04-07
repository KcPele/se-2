import React from "react";
import { useRouter } from "next/router";
import { loader } from "../assets";
import FundCard from "./FundCard";

type Campaign = {
  pId: string;
  title: string;
  description: string;
  imageUrl: string;
  isAcive: boolean;
  targetAmount: number;
  totalAmount: number;
  backersCount: number;
  daysLeft: number;
};

type Props = {
  title: string;
  isLoading: boolean;
  campaigns: Campaign[];
};

const DisplayCampaigns: React.FC<Props> = ({ title, isLoading, campaigns }) => {
  const router = useRouter();

  const handleNavigate = (campaign: Campaign) => {
    router.push({
      pathname: `/campaigndetails/${campaign.pId}`,
    });
  };

  return (
    <div>
      <h1 className="font-epilogue font-semibold text-[18px] text-white text-left">
        {title} ({campaigns?.length})
      </h1>

      <div className="flex flex-wrap mt-[20px] gap-[26px]">
        {isLoading && <img src={loader.src} alt="loader" className="w-[100px] h-[100px] object-contain" />}

        {!isLoading && campaigns.length === 0 && (
          <p className="font-epilogue font-semibold text-[14px] leading-[30px] text-[#818183]">
            You have not created any campaigns yet
          </p>
        )}

        {!isLoading &&
          campaigns.length > 0 &&
          campaigns.map(campaign => (
            <FundCard key={campaign.pId} {...campaign} handleClick={() => handleNavigate(campaign)} />
          ))}
      </div>
    </div>
  );
};

export default DisplayCampaigns;
