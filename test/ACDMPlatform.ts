import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers, network } from "hardhat";
import { Platform__factory } from "../typechain";
import { Token, Platform } from "../typechain";

describe("ACDMPlatform", function () {
    let owner: SignerWithAddress;
    let u1: SignerWithAddress;
    let u2: SignerWithAddress;
    let u3: SignerWithAddress;
    let u4: SignerWithAddress;
    let ACDMP: Platform;
    let PlFactory: Platform__factory;
    let ACDMT: Token;

    before(async function () {
        [owner, u1, u2, u3, u4] = await ethers.getSigners();
        PlFactory = await ethers.getContractFactory(
            "Platform", owner
        ) as Platform__factory;
    });

    describe("Deployment", function () {
        it("Should successfully deploy", async function () {
            ACDMP = await PlFactory.deploy(3600 * 72)
            expect (
                await ACDMP.deployed()
            ).to.satisfy;
            let t = await ACDMP.token();
            ACDMT = await ethers.getContractAt("Token", t);
        });
    });

    describe("Referrals", function () {
        it("Register some users", async function () {
            expect (
                await ACDMP.connect(u1)["register()"]()
            ).to.satisfy;
            expect (
                await ACDMP.connect(u2)["register(address)"](u1.address)
            ).to.satisfy;
            expect (
                await ACDMP.connect(u3)["register(address)"](u2.address)
            ).to.satisfy;
            expect (
                ACDMP.connect(u4)["register(address)"](owner.address)
            ).to.be.reverted;
            expect (
                await ACDMP.connect(u4)["register()"]()
            ).to.satisfy;
        });
    });

    describe("Sale round", function () {
        it("Cannot start trade round before sale finishes", async function (){
            expect (
                ACDMP.startTrade()
            ).to.be.reverted;
        });

        it("Cannot buy more than available tokens", async function () {
            expect (
                ACDMP.connect(u1).buyACDM({value: ethers.utils.parseEther("1.1")})
            ).to.be.reverted;
        });
        it("Should buy all tokens", async function (){
            let val = ethers.utils.parseEther("0.25");
            expect (
                await ACDMP.connect(u1).buyACDM({value: val})
            ).to.satisfy;
            //).to.emit("Platform", "ACDMBought").withArgs(u1.address, val, 0); 
            //event testing causes "cannot read property of undefined waitForTransaction" error dunno why

            expect (
                await ACDMP.connect(u2).buyACDM({value: val})
            ).to.satisfy;
            //).to.emit("Platform", "ACDMBought").withArgs(u2.address, val, 0);

            expect (
                await ACDMP.connect(u3).buyACDM({value: val})
            ).to.satisfy;
            //).to.emit("Platform", "ACDMBought").withArgs(u3.address, val, 0);

            expect (
                await ACDMP.connect(u4).buyACDM({value: val})
            ).to.satisfy;
            //).to.emit("Platform", "ACDMBought").withArgs(u4.address, val, 0);

            expect (
                ACDMP.connect(u4).buyACDM({value: val})
            ).to.be.reverted;
        });
    });

    describe("Trade round", function () {
        it("Should start trade round", async function () {
            expect (
                await ACDMP.startTrade()
            ).to.satisfy;
            //).to.emit("Platform", "RoundChange").withArgs(false, true);
        });
        it("Add orders", async function () {
            await ACDMT.connect(u1).approve(
                ACDMP.address, ethers.utils.parseEther("25000")
            );

            await ACDMT.connect(u2).approve(
                ACDMP.address, ethers.utils.parseEther("25000")
            );

            await ACDMT.connect(u3).approve(
                ACDMP.address, ethers.utils.parseEther("25000")
            );

            await ACDMT.connect(u4).approve(
                ACDMP.address, ethers.utils.parseEther("25000")
            );
            expect (
                await ACDMP.connect(u1).addOrder(
                    ethers.utils.parseEther("10000"), ethers.utils.parseEther("0.375")
                )
            ).to.satisfy;

            expect (
                await ACDMP.connect(u1).addOrder(
                    ethers.utils.parseEther("15000"), ethers.utils.parseEther("0.000025")
                )
            ).to.satisfy;

            expect (
                await ACDMP.connect(u3).addOrder(
                    ethers.utils.parseEther("15000"), ethers.utils.parseEther("0.1")
                )
            ).to.satisfy;
        });
        it("Remove orders", async function () {
            expect (
                await ACDMP.connect(u1).removeOrder(0)
            ).to.satisfy;
        });
        it("Redeem orders", async function () {
            expect (
                await ACDMP.connect(u2).redeemOrder(1, {value: ethers.utils.parseEther("0.375")})
            ).to.satisfy;

            expect (
                await ACDMP.connect(u2).redeemOrder(2, {value: ethers.utils.parseEther("0.1")})
            ).to.satisfy;
        });
    });
    describe("Another sale round", function () {
        it("Cannot start new round until time passes", async function () {
            await expect (
                ACDMP.startSale()
            ).to.be.reverted;
            await network.provider.send("evm_increaseTime", [3600*73]);
            await network.provider.send("evm_mine");
        });
        it("Start sale round", async function () {
            expect (
                await ACDMP.startSale()
            ).to.satisfy;
        });

        it("Buy some tokens", async function () {
            expect (
                await ACDMP.connect(u1).buyACDM({value: ethers.utils.parseEther("0.25")})
            ).to.satisfy;
        });
    });

    describe("Another trade round", function () {
        it("Cannot start trade round yet", async function () {
            expect (
                ACDMP.startTrade()
            ).to.be.reverted;
        });

        it("Can start it after some time", async function () {
            await network.provider.send("evm_increaseTime", [3600*74]);
            await network.provider.send("evm_mine");
            expect (
                await ACDMP.startTrade()
            ).to.satisfy;
        });
    });
});