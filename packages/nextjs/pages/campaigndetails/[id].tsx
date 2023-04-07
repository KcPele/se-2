import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { loader, profile } from "../../assets";
import { CountBox, CustomButton, Loader } from "../../components";
import { useStateContext } from "../../context";
import { calculateBarPercentage, daysLeft } from "../../utils";
import { useScaffoldContractWrite } from "~~/hooks/scaffold-eth";

interface IState {
  pId: number;
  image: string;
  deadline: string;
  isActive: boolean;
  target: number;
  amountCollected: number;
  owner: string;
  description: string;
}

const CampaignDetails: React.FC = props => {
  console.log(props);
  const router = useRouter();
  const id = router.query.id as any;
  const [state, setState] = useState<IState>({
    pId: 0,
    image: "",
    deadline: "",
    isActive: false,
    target: 0,
    amountCollected: 0,
    owner: "",
    description: "",
  });
  const { getDonations, contract, address, getCampaign } = useStateContext();
  const [amount, setAmount] = useState("");
  const [donators, setDonators] = useState([]);
  const [fetchingCampaign, setFetchingCampaign] = useState(false);
  const fetchCampaign = async () => {
    setFetchingCampaign(true);
    try {
      const data = await getCampaign(id);

      if (Object.keys(data).length === 0) {
        router.push("/");
      }
      setState(data);
      setFetchingCampaign(false);
    } catch (error) {
      setFetchingCampaign(false);
    }
  };
  useEffect(() => {
    console.log(id);
    if (contract) fetchCampaign();
  }, [contract, address]);

  const remainingDays = state.deadline ? daysLeft(state.deadline) : 0;

  const fetchDonators = async () => {
    const data = await getDonations(state.pId);

    setDonators(data);
  };

  useEffect(() => {
    if (contract) fetchDonators();
  }, [contract, address]);

  const { writeAsync, isLoading } = useScaffoldContractWrite({
    contractName: "BuidlguidlFunding",
    functionName: "donateToCampaign",
    args: [id],
    value: amount,
  });
  const config = {
    gasLimit: 1000000,
  };

  const { writeAsync: handleWithdrawal, isLoading: isWithdrawing } = useScaffoldContractWrite({
    ...config,
    contractName: "BuidlguidlFunding",
    functionName: "withdrawFunds",
    args: [id],
  });

  const { writeAsync: handleRefund, isLoading: isRedunding } = useScaffoldContractWrite({
    contractName: "BuidlguidlFunding",
    functionName: "refundDonations",
    args: [id],
  });
  const { writeAsync: cancelCampaign, isLoading: isCancelling } = useScaffoldContractWrite({
    contractName: "BuidlguidlFunding",
    functionName: "endCampaign",
    args: [id],
  });

  const handleDonate = async () => {
    if (!amount) return;
    await writeAsync();
    router.push("/");
  };

  return (
    <div>
      {(isLoading || isWithdrawing || isCancelling || isRedunding) && <Loader />}
      {fetchingCampaign && <img src={loader.src} alt="loader" className="w-[100px] h-[100px] object-contain" />}

      <div className="w-full flex md:flex-row flex-col mt-10 gap-[30px]">
        <div className="flex-1 flex-col">
          <img src={state.image} alt="campaign" className="w-full h-[410px] object-cover rounded-xl" />
          <div className="relative w-full h-[5px] bg-[#3a3a43] mt-2">
            {state.isActive ? (
              <div
                className="absolute h-full bg-[#4a8ed2]"
                style={{
                  width: `${calculateBarPercentage(state.target, state.amountCollected)}%`,
                  maxWidth: "100%",
                }}
              ></div>
            ) : (
              <div
                className="absolute h-full bg-[#4a8ed2]"
                style={{
                  width: `100%`,
                  maxWidth: "100%",
                }}
              ></div>
            )}
          </div>
        </div>

        <div className="flex md:w-[150px] w-full flex-wrap justify-between gap-[30px]">
          <CountBox title="Days Left" value={Number(remainingDays)} />
          <CountBox title={`Raised of ${state.target}`} value={state.amountCollected} />
          <CountBox title="Total Backers" value={donators.length} />
        </div>
      </div>

      <div className="mt-[60px] flex lg:flex-row flex-col gap-5">
        <div className="flex-[2] flex flex-col gap-[40px]">
          <div>
            <h4 className="font-epilogue font-semibold text-[18px] text-white uppercase">Creator</h4>

            <div className="mt-[20px] flex flex-row items-center flex-wrap gap-[14px]">
              <div className="w-[52px] h-[52px] flex items-center justify-center rounded-full bg-[#2c2f32] cursor-pointer">
                <img src={profile.src} alt="user" className="w-[60%] h-[60%] object-contain" />
              </div>
              <div>
                <h4 className="font-epilogue font-semibold text-[14px] text-white break-all">{state.owner}</h4>
                <p className="mt-[4px] font-epilogue font-normal text-[12px] text-[#808191]">10 Campaigns</p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-epilogue font-semibold text-[18px] text-white uppercase">Story</h4>

            <div className="mt-[20px]">
              <p className="font-epilogue font-normal text-[16px] text-[#808191] leading-[26px] text-justify">
                {state.description}
              </p>
            </div>
          </div>
          {state.owner === address && (
            <div className="flex flex-col gap-5">
              <CustomButton
                btnType="button"
                isDisabled={isLoading || state.isActive}
                title={state.isActive ? "Can't Withdraw yet " : "Withdraw Funds"}
                styles="w-full bg-[#8c6dfd]"
                handleClick={handleWithdrawal}
              />
              <CustomButton
                btnType="button"
                isDisabled={isLoading}
                title="Cancel Campaign"
                styles="w-full bg-blue-500"
                handleClick={cancelCampaign}
              />

              <CustomButton
                btnType="button"
                isDisabled={isLoading}
                title="Refund "
                styles="w-full bg-red-500"
                handleClick={handleRefund}
              />
            </div>
          )}

          <div>
            <h4 className="font-epilogue font-semibold text-[18px] text-white uppercase">Donators</h4>

            <div className="mt-[20px] flex flex-col gap-4">
              {donators.length > 0 ? (
                donators.map((item: any, index) => (
                  <div key={`${item.donator}-${index}`} className="flex justify-between items-center gap-4">
                    <p className="font-epilogue font-normal text-[16px] text-[#b2b3bd] leading-[26px] break-ll">
                      {index + 1}. {item.donator}
                    </p>
                    <p className="font-epilogue font-normal text-[16px] text-[#808191] leading-[26px] break-ll">
                      {item.donation}
                    </p>
                  </div>
                ))
              ) : (
                <p className="font-epilogue font-normal text-[16px] text-[#808191] leading-[26px] text-justify">
                  No donators yet. Be the first one!
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1">
          <h4 className="font-epilogue font-semibold text-[18px] text-white uppercase">Fund</h4>

          <div className="mt-[20px] flex flex-col p-4 bg-[#1c1c24] rounded-[10px]">
            <p className="font-epilogue fount-medium text-[20px] leading-[30px] text-center text-[#808191]">
              {state.owner === address ? " You can't fund your campaign" : "Fund the campaign"}
            </p>
            <div className="mt-[30px]">
              <input
                type="number"
                placeholder="ETH 0.1"
                step="0.01"
                className="w-full py-[10px] sm:px-[20px] px-[15px] outline-none border-[1px] border-[#3a3a43] bg-transparent font-epilogue text-white text-[18px] leading-[30px] placeholder:text-[#4b5264] rounded-[10px]"
                value={amount}
                onChange={e => setAmount(e.target.value)}
              />

              <div className="my-[20px] p-4 bg-[#13131a] rounded-[10px]">
                <h4 className="font-epilogue font-semibold text-[14px] leading-[22px] text-white">
                  Back it because you believe in it.
                </h4>
                <p className="mt-[20px] font-epilogue font-normal leading-[22px] text-[#808191]">
                  Support the project for no reward, just because it speaks to you.
                </p>
              </div>

              <CustomButton
                btnType="button"
                isDisabled={!state.isActive}
                title={state.owner === address ? "You cant fund your campaign" : "Fund Campaign"}
                styles="w-full bg-[#8c6dfd]"
                handleClick={handleDonate}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignDetails;
