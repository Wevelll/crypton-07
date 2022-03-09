import { task } from "hardhat/config";
import { tAddr, pAddr } from "../hardhat.config";

task("startSale", "Start sale round")
.setAction(async (taskArgs, hre) => {
    const [me] = await hre.ethers.getSigners();
    const platform = await hre.ethers.getContractAt("Platform", pAddr);
    await platform.connect(me).startSale();
    console.log("Ok");
})