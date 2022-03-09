//SPDX-License-Identifier: Unlicense

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./Token.sol";

contract SaleRound is ReentrancyGuard {
    using Counters for Counters.Counter;

    Counters.Counter public saleRoundN;
    address public tokenS;
    bool public saleActive;
    uint256 public amountACDM;
    uint256 public priceETH;

    constructor() {}

    modifier saleRound {
        require(saleActive, "Wait until round starts!");
        _;
    }

    event ACDMBought(address indexed buyer, uint256 amount, uint256 indexed roundN);

    function finishSale() internal saleRound {
        saleActive = false;
        if(amountACDM > 0) {
            Token(tokenS).burn(address(this), amountACDM);
        }
        saleRoundN.increment();
    }

    function _buyACDM(address r1, address r2) internal saleRound nonReentrant {
        require(amountACDM > 0, "All tokens sold!");
        uint256 amount = (msg.value / priceETH) * 10e17;
        require(amountACDM >= amount, "Less tokens available!");
        amountACDM -= amount;

        if (r1 != address(0)) {
            if(r2 != address(0)) {
                payable(r2).call{value: msg.value / 100 * 3};
            }
            payable(r1).call{value: msg.value / 100 * 5};
        }
        Token(tokenS).transfer(msg.sender, amount);
    
        emit ACDMBought(msg.sender, amount, saleRoundN.current());
    }
}