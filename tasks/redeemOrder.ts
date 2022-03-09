import { task } from "hardhat/config";
import { tAddr, pAddr } from "../hardhat.config";

task("redeemOrder", "Redeem order with <id> using <amount> of ETH")
.addParam("id", "Order ID")
.addParam("amount", "ETH amount")
.setAction(async (taskArgs, hre) => {
    const [me] = await hre.ethers.getSigners();
    const platform = await hre.ethers.getContractAt("Platform", pAddr);
    const a = hre.ethers.utils.parseEther(taskArgs.amount);
    await platform.connect(me).redeemOrder(taskArgs.id, {value: a})
    console.log("Ok");
})