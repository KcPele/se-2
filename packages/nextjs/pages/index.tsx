import React, { useEffect, useState } from "react";
import { DisplayCampaigns } from "../components";
import { useStateContext } from "../context";

const Home = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [campaigns, setCampaigns] = useState([]);

  const { address, contract, getCampaigns, refresh, allowLoading } = useStateContext();

  const fetchCampaigns = async () => {
    if (allowLoading) setIsLoading(true);
    const data = await getCampaigns();
    setCampaigns(data);
    setIsLoading(false);
  };

  useEffect(() => {
    if (contract) fetchCampaigns();
  }, [address, contract, refresh]);

  return <DisplayCampaigns title="All Campaigns" isLoading={isLoading} campaigns={campaigns} />;
};

export default Home;
