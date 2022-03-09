import { task } from "hardhat/config";
import { tAddr, pAddr } from "../hardhat.config";

task("addOrder", "Add order with <amount> of ACDM token and <price> in ETH")
.addParam("amount", "Amount of ACDM tokens")
.addParam("price", "Price in ETH")
.setAction(async (taskArgs, hre) => {
    const [me] = await hre.ethers.getSigners();
    const platform = await hre.ethers.getContractAt("Platform", pAddr);
    const token = await hre.ethers.getContractAt("Token", tAddr);
    const a = hre.ethers.utils.parseEther(taskArgs.amount);
    const p = hre.ethers.utils.parseEther(taskArgs.price);
    await token.approve(platform.address, a);
    await platform.connect(me).addOrder(a, p)
    console.log("Ok");
})