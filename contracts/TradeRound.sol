//SPDX-License-Identifier: Unlicense

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./Token.sol";

contract TradeRound is ReentrancyGuard {
    using Counters for Counters.Counter;
    Counters.Counter public orderIDs;
    Counters.Counter public tradeRoundN;

    address public tokenT;
    bool public tradeActive;
    uint256 public tradeVol;
    struct Order {
        address owner;
        bool active;
        uint256 id;
        uint256 amountACDM;
        uint256 priceETH;
        uint256 roundN;
    }

    mapping(uint256 => Order) public orders;

    constructor() {}

    modifier tradeRound {
        require(tradeActive, "Wait until round starts!");
        _;
    }

    modifier orderActive(uint256 id) {
        require(orders[id].active, "Order inactive!");
        require(orders[id].roundN == tradeRoundN.current(), "Order inactive!");
        _;
    }

    event OrderFill(address indexed buyer, uint256 orderID, uint256 amount, uint256 price);
    event OrderChange(uint256 orderID, bool active, uint256 amount, uint256 price, uint256 indexed roundN);

    function finishTrade() internal {
        tradeActive = false;
        tradeVol = 0;

        for(uint256 i = 0; i < orderIDs.current(); i++) {
            Order storage o = orders[i];
            if (o.active) {
                o.active = false;
                Token(tokenT).transfer(o.owner, o.amountACDM);
            }
        }
        tradeRoundN.increment();
    }

    function _addOrder(uint256 amount, uint256 priceETH) internal tradeRound returns (uint256 id) {
        Token(tokenT).transferFrom(msg.sender, address(this), amount);
        id = orderIDs.current();
        Order storage o = orders[id];
        o.owner = msg.sender; o.active = true; o.id = id;
        o.amountACDM = amount;
        o.priceETH = priceETH;
        o.roundN = tradeRoundN.current();
        orderIDs.increment();

        emit OrderChange(o.id, o.active, o.amountACDM, o.priceETH, o.roundN);
    }

    function _removeOrder(uint256 orderID) internal tradeRound orderActive(orderID) {
        Order storage o = orders[orderID];
        require(msg.sender == o.owner, "Not your order!");
        o.active = false;
        Token(tokenT).transfer(msg.sender, o.amountACDM);

        emit OrderChange(o.id, o.active, o.amountACDM, o.priceETH, o.roundN);
    }

    function _redeemOrder(uint256 orderID, address r1, address r2) internal tradeRound orderActive(orderID) nonReentrant {
        Order storage o = orders[orderID];
        uint256 amount = msg.value / o.priceETH * 10e17;
        require(o.amountACDM >= amount, "Less tokens left!");
        tradeVol += msg.value;
        o.amountACDM -= amount;
        if (o.amountACDM == 0) {
            o.active = false;
        }

        if (r1 != address(0)) {
            if (r2 != address(0)) {
                payable(r2).call{value: msg.value / 1000 * 25};
            }
            payable(r1).call{value: msg.value / 1000 * 25};
        }
        payable(o.owner).call{value: msg.value / 100 * 95};
        Token(tokenT).transfer(msg.sender, amount);

        emit OrderFill(msg.sender, o.id, o.amountACDM, o.priceETH);
        emit OrderChange(o.id, o.active, o.amountACDM, o.priceETH, o.roundN);
    }
}