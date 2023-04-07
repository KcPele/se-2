// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "hardhat/console.sol";

contract BuidlguidlFunding {
    struct Campaign {
        address owner;
        string title;
        string description;
        uint256 target;
        uint256 deadline;
        uint256 amountCollected;
        string image;
        address[] donators;
        uint256[] donations;
        bool isActive;
    }

    address public owner;
    //the percentage the owner makes from every donation
    uint256 public campaignFee = 0;

    mapping(uint256 => Campaign) public campaigns;

    uint256 public numberOfCampaigns = 0;


    event CampaignCreated(uint256 campaignId, address owner, string title, string description, uint256 target, uint256 deadline, string image);
    event DonationMade(uint256 campaignId, address donator, uint256 amount);
    event CampaignEnded(uint256 campaignId);
    event FundsWithdrawn(uint256 campaignId, uint256 amount);
    event RefundDonations(uint256 campaignId, address donator, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can call this function.");
        _;
    }
    constructor(address _owner) {
        owner = _owner;
        console.log("Deploying a BuidlguidlFunding contract");
    }
    function createCampaign(address _owner, string memory _title, string memory _description, uint256 _target, uint256 _deadline, string memory _image) public returns (uint256) {
        Campaign storage campaign = campaigns[numberOfCampaigns];

        require(campaign.deadline < block.timestamp, "The deadline should be a date in the future.");

        campaign.owner = _owner;
        campaign.title = _title;
        campaign.description = _description;
        campaign.target = _target;
        campaign.deadline = _deadline;
        campaign.amountCollected = 0;
        campaign.image = _image;
        campaign.isActive = true;
        numberOfCampaigns++;
         emit CampaignCreated(numberOfCampaigns - 1, _owner, _title, _description, _target, _deadline, _image);


        return numberOfCampaigns - 1;
    }

    function donateToCampaign(uint256 _id) public payable {
        
        require(campaigns[_id].owner != address(0), "Campaign does not exist");       
        require(campaigns[_id].isActive == true, "Campaign has ended");
        require(msg.value > 0, "Donation amount should be greater than 0");
        require(msg.sender != campaigns[_id].owner, "Campaign owner cannot donate to their own campaign");
        
        uint256 amount = msg.value;

        Campaign storage campaign = campaigns[_id];

        campaign.donators.push(msg.sender);
        campaign.donations.push(amount);
       
        campaign.amountCollected = campaign.amountCollected + amount;
        emit DonationMade(_id, msg.sender, amount);

    
        if(campaign.amountCollected >= campaign.target) {
            campaign.isActive = false;
            emit CampaignEnded(_id);
        }
    }

  function refundDonations(uint256 _id) public {
        Campaign storage campaign = campaigns[_id];
        require(msg.sender == campaign.owner, "Only campaign owner can refund donations.");
        require(block.timestamp > campaign.deadline, "Campaign deadline has not passed yet.");
        require(campaign.amountCollected < campaign.target, "Campaign target has been met.");
        
        for(uint i = 0; i < campaign.donators.length; i++) {
            address donator = campaign.donators[i];
            uint256 amount = campaign.donations[i];
            
            (bool sent,) = payable(donator).call{value: amount}("");
            
            if(sent) {
                campaign.amountCollected = campaign.amountCollected - amount;
                campaign.donations[i] = 0; // Set the donation amount to 0 to mark it as refunded.
                emit RefundDonations(_id, donator, amount);
            }
        }
    }
      function endCampaign(uint256 _id) public {
        require(campaigns[_id].owner == msg.sender, "Only the campaign owner can cancel the campaign");
        require(campaigns[_id].isActive == true, "Campaign is not active");

        campaigns[_id].isActive = false;
        emit CampaignEnded(_id);
    }

    function withdrawFunds(uint256 _id) public  {
        Campaign storage campaign = campaigns[_id];

        require(campaign.owner == msg.sender, "Only the campaign owner can withdraw funds");
        require(campaign.isActive == false, "Campaign is still active");
        require(campaign.amountCollected >= campaign.target, "Target amount has not been reached");
        uint256 percentageCollected = campaign.amountCollected * 5 / 100;
        uint256 amount = campaign.amountCollected - percentageCollected;
        campaignFee = campaignFee + percentageCollected;
        console.log("campaignFee", campaignFee);
        console.log("amount", amount);
        console.log("percentageCollected", percentageCollected);
        campaign.amountCollected = 0;
        (bool sent,) = payable(campaign.owner).call{value: amount}("");
        require(sent, "Failed to send ether");

        emit FundsWithdrawn(_id, amount);
    }

    function onlyOwnerWithdrawal () public onlyOwner {
        require(campaignFee > 0, "No funds to withdraw");
        (bool sent,) = payable(owner).call{value: campaignFee}("");
        require(sent, "Failed to send ether");
        campaignFee = 0;
    }
    function getCampaignProgress(uint256 _id) public view returns (uint256, uint256, uint256) {
        Campaign storage campaign = campaigns[_id];
        uint256 percentage = campaign.amountCollected * 100 / campaign.target;
        uint256 remainingTime = campaign.deadline - block.timestamp;
        
    return (campaign.amountCollected, percentage, remainingTime);
}

    function getDonators(uint256 _id) view public returns (address[] memory, uint256[] memory) {
        return (campaigns[_id].donators, campaigns[_id].donations);
    }

    function getCampaigns() public view returns (Campaign[] memory) {
        Campaign[] memory allCampaigns = new Campaign[](numberOfCampaigns);

        for(uint i = 0; i < numberOfCampaigns; i++) {
            Campaign storage item = campaigns[i];

            allCampaigns[i] = item;
        }

        return allCampaigns;
    }

     fallback() external payable{
        console.log("fallback call");
    }
     receive() external payable{
        console.log("fallback call");
    }
}
