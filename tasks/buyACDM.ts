import { task } from "hardhat/config";
import { tAddr, pAddr } from "../hardhat.config";

task("buyACDM", "Buy Academy tokens during sale round with ETH")
.addParam("amount", "Amount of ACDM tokens")
.setAction(async (taskArgs, hre) => {
    const [me] = await hre.ethers.getSigners();
    const platform = await hre.ethers.getContractAt("Platform", pAddr);
    const a = hre.ethers.utils.parseEther(taskArgs.amount);
    await platform.connect(me).buyACDM({value: a})
    console.log("Ok");
})