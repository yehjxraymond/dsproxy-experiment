const ganache = require("ganache-cli");

let server: any;

const mnemonic = "behind vault mod hurdle sample clump stay fold flag october sea good";

export const addresses = [
  "0x4b25c327a1aBD246DE7c4F6725761813c7Bb6651",
  "0x11b8B4e3988fBbdeEb243a532F0E43B3C3db2088",
  "0x18B4f53A95F55E183A6Beef2d3D7B307d57075C5",
  "0xeaEc90373343d51e3532274ED06064A621637046",
  "0xBe7E693E64F6dc06Ba6b0Cb15CD944E9Be55fBC3",
  "0xeDBeE64ce858AAD30f14F6e6E9ee4693c55df852",
  "0xF8536734A62Bc8f495C948502D25f50f1bfBd558",
  "0x4657f0961b157f16b9d702A2eb2D45B339578E7e",
  "0xa6adDb3039A15c8d9c0E6D18023AF5143838b90c",
  "0x24A23B13e6409f07a2a5d5C5853a100b23358706"
];

export const privateKeys = [
  "0x68a507f17d4a81abcec6a8b0438ed582ea968a8ff51daf40a6e5f2c655e99f2d",
  "0xdd1e5e69b13e542ced6e1a03a724c520d2dda7d7f2c13bd0117a196a5b5faa26",
  "0x772c9064353f2e570b15ead23f2f6e4d36a63b6fbb9e8d02af01e696b80b228b",
  "0x53e6bcadc193728941f74eda480d2685ce7a120d4647b77593be91b5d4127508",
  "0x540bb00b9983740d9bc1ac247b0ec26334c6ef89114c03df2a003db013ccca84",
  "0x434b19e8abd07fc44dcb14e49f3e60e1cd306eee7711af27096be686a697267a",
  "0xba13981f4878dc30a73b2af6633ec23e686bc53492a9f9b30d0187c813227265",
  "0xb51ae27333785ee73c2dad122757a47d97c5f6ef5d02155fdb0a5c7774a99545",
  "0x4d5d7a6ecb0f402bdbd5f86f19ac94ccf072f9bd2ff16a6d83cccea793496faf",
  "0xce9a194b80f4f43741c32746b2d68aadd505b02d5093eceab3b13c3b63ff57e5"
];

export const setupBlockchain = () => {
  return new Promise(resolve => {
    server = ganache.server({
      mnemonic,
      network_id: 1
    });
    server.listen(8545, () => resolve());
  });
};

export const teardownBlockchain = async () => {
  await server.close();
};
