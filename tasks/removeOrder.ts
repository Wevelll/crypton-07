import { task } from "hardhat/config";
import { tAddr, pAddr } from "../hardhat.config";

task("removeOrder", "Remove your order with <id>, receive tokens locket in orders")
.addParam("id", "ID of order to remove")
.setAction(async (taskArgs, hre) => {
    const [me] = await hre.ethers.getSigners();
    const platform = await hre.ethers.getContractAt("Platform", pAddr);
    await platform.connect(me).removeOrder(taskArgs.id);
    console.log("Ok");
})