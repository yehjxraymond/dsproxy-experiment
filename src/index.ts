import {setupBlockchain, teardownBlockchain, privateKeys} from "./utils";
import {providers, Wallet} from "ethers";
import {TradeTrustErc721Factory, TitleEscrowCreatorFactory, TitleEscrowFactory} from "@govtechsg/token-registry";
import {DsProxyCreatorFactory} from "./contracts/DsProxyCreatorFactory";
import {DsProxyFactory} from "./contracts/DsProxyFactory";
import {ConvenienceFactory} from "./contracts/ConvenienceFactory";
import {DsGuardFactory} from "./contracts/DsGuardFactory";

const provider = new providers.JsonRpcProvider();
const wallet = new Wallet(privateKeys[0], provider);

const setupEnvironment = async () => {
  const tokenRegistry = await new TradeTrustErc721Factory(wallet).deploy("TEST", "TST");
  const titleEscrowCreator = await new TitleEscrowCreatorFactory(wallet).deploy();
  const proxyCreator = await new DsProxyCreatorFactory(wallet).deploy();
  const customCode = await new ConvenienceFactory(wallet).deploy();

  return {tokenRegistry, titleEscrowCreator, proxyCreator, customCode};
};

const execute = async () => {
  const {tokenRegistry, titleEscrowCreator, proxyCreator, customCode} = await setupEnvironment();

  // First deploy a DSProxy instance
  const dsProxyBuildTx = await (await proxyCreator["build()"]()).wait();
  const buildLog = dsProxyBuildTx.events.find(e => e.event === "Created");
  const dsProxyDeployedAddress = buildLog.args["proxy"] as string;
  const dsProxy = DsProxyFactory.connect(dsProxyDeployedAddress, wallet);

  // Then allow proxy to "own" the token registry (ideally we deploy from the proxy)
  const transferTx = await (await tokenRegistry.addMinter(dsProxyDeployedAddress)).wait();

  // Watch dsProxy create and mint in one transaction!
  const customCodeFactory = new ConvenienceFactory(wallet);
  const {data: deployData} = customCodeFactory.getDeployTransaction();
  const functionCall = customCode.interface.encodeFunctionData("mintAndTransfer", [
    "0x6FFeD6E6591b808130a9b248fEA32101b5220eca",
    "0xc084A45DF7594C46d7519BED2c0C6dFd87645187",
    titleEscrowCreator.address,
    tokenRegistry.address,
    "0x61dc9186345e05cc2ae53dc72af880a3b66e2fa7983feaa6254d1518540de50a"
  ]);
  const mintingTx = await (await dsProxy["execute(bytes,bytes)"](deployData, functionCall)).wait();
  const {cumulativeGasUsed} = mintingTx;
  console.log("Gas used:", cumulativeGasUsed.toString());

  // Let's run that again, this time with deployed code
  const functionCall2 = customCode.interface.encodeFunctionData("mintAndTransfer", [
    "0xc084A45DF7594C46d7519BED2c0C6dFd87645187",
    "0x6FFeD6E6591b808130a9b248fEA32101b5220eca",
    titleEscrowCreator.address,
    tokenRegistry.address,
    "0x61dc9186345e05cc2ae53dc72af880a3b66e2fa7983feaa6254d1518540de50b"
  ]);
  const mintingTx2 = await (await dsProxy["execute(address,bytes)"](customCode.address, functionCall2)).wait();
  const {cumulativeGasUsed: cumulativeGasUsed2} = mintingTx2;
  console.log("Gas used:", cumulativeGasUsed2.toString());

  // Verify that the execution is correct
  const titleEscrowAddress = await tokenRegistry.ownerOf(
    "0x61dc9186345e05cc2ae53dc72af880a3b66e2fa7983feaa6254d1518540de50a"
  );
  const titleEscrow = TitleEscrowFactory.connect(titleEscrowAddress, wallet);
  const beneficiary = await titleEscrow.beneficiary();
  const holder = await titleEscrow.holder();
  console.log("Beneficiary:", beneficiary);
  console.log("Holder:", holder);

  // Let's allow our staff to also execute the function
  const guard = await new DsGuardFactory(wallet).deploy();
  const wallet2 = new Wallet(privateKeys[1]).connect(provider);
  await (await dsProxy.setAuthority(guard.address)).wait();

  // Turns out the default DSProxy does not allow for granular ACL on external contract but can be modified for such
  // 0x1cff79cd // execute
  // 0xbba5e758 // mintAndTransfer
  await (
    await guard["permit(address,address,bytes32)"](
      wallet2.address,
      dsProxy.address,
      "0x1cff79cd00000000000000000000000000000000000000000000000000000000"
    )
  ).wait();
  const functionCall3 = customCode.interface.encodeFunctionData("mintAndTransfer", [
    "0xc084A45DF7594C46d7519BED2c0C6dFd87645187",
    "0x6FFeD6E6591b808130a9b248fEA32101b5220eca",
    titleEscrowCreator.address,
    tokenRegistry.address,
    "0x61dc9186345e05cc2ae53dc72af880a3b66e2fa7983feaa6254d1518540de50c"
  ]);
  const dsProxyFromNewAccount = DsProxyFactory.connect(dsProxyDeployedAddress, wallet2);
  await (
    await dsProxyFromNewAccount["execute(address,bytes)"](customCode.address, functionCall3, {gasLimit: 5000000})
  ).wait();
  console.log("Minting by account 2 successful");
};

const main = async () => {
  await setupBlockchain();
  await execute();
  await teardownBlockchain();
};

main();
