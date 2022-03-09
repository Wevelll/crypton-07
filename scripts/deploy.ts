import { ethers } from "hardhat";

async function main() {
  const [me] = await ethers.getSigners();

  const platformFactory = await ethers.getContractFactory("Platform");
  const platform = await platformFactory.deploy(
    3600*72
  );

  await platform.deployed();

  console.log("DAO deployed to:", platform.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
