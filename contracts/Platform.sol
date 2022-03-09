//SPDX-License-Identifier: Unlicense

pragma solidity ^0.8.0;

import "./SaleRound.sol";
import "./TradeRound.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract Platform is TradeRound, SaleRound {
    using Counters for Counters.Counter;

    address public token;
    uint256 public roundDuration;
    uint256 public lastRound;
    mapping(address => bool) public registered;
    mapping(address => address) public referrers;

    constructor(uint256 rDuration) TradeRound() SaleRound() {
        token = address(new Token("Academy Token", "ACDM"));
        tokenS = token;
        tokenT = token;
        roundDuration = rDuration;
        priceETH = 0.00001 ether;
        amountACDM = 100000 ether;
        lastRound = block.timestamp;
        saleActive = true;
        Token(token).mint(address(this), amountACDM);
    }

    modifier uRegistered {
        require(registered[msg.sender], "User not registered!");
        _;
    }

    event RoundChange(bool saleRound, bool tradeRound);

    function startSale() public {
        require(block.timestamp > lastRound + roundDuration, "Cannot start sale yet!");
        require(!saleActive, "Sale already active!");
        priceETH = (priceETH * 1.03 ether + 0.000004 ether) / 10e18;
        amountACDM = tradeVol / priceETH * 10e18;
        lastRound = block.timestamp;
        finishTrade();
        saleActive = true;
        Token(token).mint(address(this), amountACDM);

        emit RoundChange(true, false);
    }

    function startTrade() public {
        require(!tradeActive, "Trade already active!");
        if (amountACDM > 0) {
            if(block.timestamp < lastRound + roundDuration) {
                revert("Cannot start trade yet!");
            }
        }
        lastRound = block.timestamp;
        finishSale();
        tradeActive = true;
        orderIDs.reset();

        emit RoundChange(false, true);
    }

    function register() public {
        require(!registered[msg.sender], "Already registered!");
        registered[msg.sender] = true;
    }

    function register(address referrer) external {
        require(registered[referrer], "Invalid referrer!");
        register();
        referrers[msg.sender] = referrer;
    }

    function buyACDM() external payable uRegistered {
        address r1 = referrers[msg.sender];
        address r2 = referrers[r1];
        _buyACDM(r1, r2);
    }

    function addOrder(uint256 amount, uint256 price) external uRegistered {
        _addOrder(amount, price);
    }

    function removeOrder(uint256 orderID) external uRegistered {
        _removeOrder(orderID);
    }

    function redeemOrder(uint256 orderID) external payable uRegistered {
        address r1 = referrers[msg.sender];
        address r2 = referrers[r1];
        _redeemOrder(orderID, r1, r2);
    }

}