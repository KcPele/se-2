import React, { createContext, useContext } from "react";
// import { useContractWrite } from "@thirdweb-dev/react";
import { ethers } from "ethers";
import { useAccount, useContract, useProvider, useSigner } from "wagmi";
import { useScaffoldEventSubscriber } from "~~/hooks/scaffold-eth";
import scaffoldConfig from "~~/scaffold.config";
import { contracts } from "~~/utils/scaffold-eth/contract";

const StateContext = createContext();
export const StateContextProvider = ({ children }) => {
  const { address } = useAccount();
  const constractName = "BuidlguidlFunding";
  const provider = useProvider();
  const [refresh, setRefresh] = React.useState(false);
  const [allowLoading, setAllowLoading] = React.useState(true);
  const { data: signer } = useSigner();
  const contractData = contracts?.[scaffoldConfig.targetNetwork.id][0].contracts.BuidlguidlFunding;
  const contract = useContract({
    address: contractData.address,
    abi: contractData.abi,
    signerOrProvider: provider,
  });
  const signerContract = useContract({
    address: contractData.address,
    abi: contractData.abi,
    signerOrProvider: signer,
  });

  useScaffoldEventSubscriber({
    contractName: "BuidlguidlFunding",
    eventName: "CampaignCreated",
    listener: () => {
      setAllowLoading(false);
      setRefresh(!refresh);
    },
  });

  useScaffoldEventSubscriber({
    contractName: "BuidlguidlFunding",
    eventName: "DonationMade",
    listener: () => {
      setAllowLoading(false);
      setRefresh(!refresh);
    },
  });

  useScaffoldEventSubscriber({
    contractName: "BuidlguidlFunding",
    eventName: "CampaignEnded",
    listener: () => {
      setAllowLoading(false);
      setRefresh(!refresh);
    },
  });
  useScaffoldEventSubscriber({
    contractName: "BuidlguidlFunding",
    eventName: "RefundDonations",
    listener: () => {
      setAllowLoading(false);
      setRefresh(!refresh);
    },
  });

  const getCampaigns = async () => {
    try {
      const campaigns = await contract.getCampaigns();

      const parsedCampaings = campaigns.map((campaign, i) => ({
        owner: campaign.owner,
        title: campaign.title,
        isActive: campaign.isActive,
        description: campaign.description,
        target: ethers.utils.formatEther(campaign.target.toString()),
        deadline: campaign.deadline.toNumber(),
        amountCollected: ethers.utils.formatEther(campaign.amountCollected.toString()),
        image: campaign.image,
        pId: i,
      }));

      return parsedCampaings;
    } catch (error) {
      console.log(error);
      return [];
    }
  };

  const getCampaign = async pId => {
    try {
      const campaign = await contract.campaigns(pId);

      const parsedCampaings = {
        owner: campaign.owner,
        title: campaign.title,
        isActive: campaign.isActive,
        description: campaign.description,
        target: ethers.utils.formatEther(campaign.target.toString()),
        deadline: campaign.deadline.toNumber(),
        amountCollected: ethers.utils.formatEther(campaign.amountCollected.toString()),
        image: campaign.image,
        pId: pId,
      };

      return parsedCampaings;
    } catch (error) {
      console.log(error);
      return {};
    }
  };

  const getUserCampaigns = async () => {
    const allCampaigns = await getCampaigns();

    const filteredCampaigns = allCampaigns.filter(campaign => campaign.owner === address);

    return filteredCampaigns;
  };

  const getDonations = async pId => {
    const donations = await contract.getDonators(pId);

    const numberOfDonations = donations[0].length;

    const parsedDonations = [];

    for (let i = 0; i < numberOfDonations; i++) {
      parsedDonations.push({
        donator: donations[0][i],
        donation: ethers.utils.formatEther(donations[1][i].toString()),
      });
    }

    return parsedDonations;
  };

  return (
    <StateContext.Provider
      value={{
        address,
        contract,
        constractName,
        getCampaigns,
        signerContract,
        getUserCampaigns,
        getDonations,
        getCampaign,
        refresh,
        setRefresh,
        allowLoading,
        setAllowLoading,
      }}
    >
      {children}
    </StateContext.Provider>
  );
};

export const useStateContext = () => useContext(StateContext);
