import { ethers } from "hardhat";
import { expect } from "chai";
import { BuidlguidlFunding } from "../typechain-types";

describe("BuidlguidlFunding - createCampaign", function () {
  let buidlguidlFunding: BuidlguidlFunding;

  // let campaignId: number;
  beforeEach(async function () {
    const [owner] = await ethers.getSigners();
    const BuidlguidlFundingFactory = await ethers.getContractFactory("BuidlguidlFunding");
    buidlguidlFunding = (await BuidlguidlFundingFactory.deploy(owner.address)) as BuidlguidlFunding;
    await buidlguidlFunding.deployed();
  });
  //   before(async () => {
  //     const BuidlguidlFundingFactory = await ethers.getContractFactory("YourContract");
  //     buidlguidlFunding = (await BuidlguidlFundingFactory.deploy()) as BuidlguidlFunding;
  //     await buidlguidlFunding.deployed();
  //   });

  it("should create a new campaign", async function () {
    const [owner, donator1] = await ethers.getSigners();
    console.log(donator1);
    const target = ethers.utils.parseEther("1");
    const deadline = Math.floor(Date.now() / 1000) + 3600; // set deadline to 1 hour from now
    const image = "https://example.com/image.jpg";
    const expectedTitle = "New Campaign";
    const expectedDescription = "This is a new campaign";

    const result = await buidlguidlFunding.createCampaign(
      owner.address,
      expectedTitle,
      expectedDescription,
      target,
      deadline,
      image,
    );
    const campaignId = result.toNumber();

    const campaign = await buidlguidlFunding.campaigns(campaignId);

    expect(campaign.owner).to.equal(owner.address);
    expect(campaign.title).to.equal(expectedTitle);
    expect(campaign.description).to.equal(expectedDescription);
    expect(campaign.target).to.equal(target);
    expect(campaign.deadline).to.equal(deadline);
    expect(campaign.image).to.equal(image);
    expect(campaign.isActive).to.equal(true);
    expect(campaign.amountCollected).to.equal(0);
  });
});
