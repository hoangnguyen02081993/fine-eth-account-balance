const Web3 = require('web3');
const fs = require('fs');
const crypto = require('crypto');

const nodeUrls = [
  'https://eth.llamarpc.com',
  'https://eth-mainnet.public.blastapi.io',
  'https://rpc.ankr.com/eth',
  'https://rpc.flashbots.net/',
  'https://cloudflare-eth.com/',
  'https://eth-mainnet.gateway.pokt.network/v1/5f3453978e354ab992c4da79',
  'https://ethereum.publicnode.com',
  'https://nodes.mewapi.io/rpc/eth',
  'https://eth-mainnet.nodereal.io/v1/1659dfb40aa24bbb8153a677b98064d7',
];

const balanceLogFile = './balance.log';
const Web3List = nodeUrls.map(
  (url) => new Web3.Web3(new Web3.HttpProvider(url)),
);

const getNextIndex = (currentIndex, listLength) => {
  if (currentIndex + 1 >= listLength) {
    return 0;
  }
  return currentIndex + 1;
};

const writeToLogFile = (address, privateKey, balance, etherBalance) => {
  if (balance === 0) {
    console.log(`No balance with ${address}`);
    return;
  }

  const data = `${address}(${privateKey}):${etherBalance}(${balance})\n`;
  console.log(
    `Found balance ${etherBalance}(${balance} with ${address} and ${privateKey}`,
  );
  fs.appendFileSync(balanceLogFile, data);
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const randomPrivateKey = () => {
  return new Promise((resolve) => {
    crypto.randomBytes(32, function (err, buffer) {
      resolve(buffer.toString('hex'));
    });
  });
};

const fetchBalanceWithRandomAccount = async (index) => {
  index = getNextIndex(index, Web3List.length);
  console.log(`Fetching with ${nodeUrls[index]}`);
  const web3 = Web3List[index];
  const account = await web3.eth.accounts.privateKeyToAccount(
    `0x${await randomPrivateKey()}`,
  );
  const balance = await web3.eth.getBalance(account.address);
  const etherBalance = web3.utils.fromWei(balance, 'ether');
  writeToLogFile(
    account.address,
    account.privateKey,
    Number(balance),
    etherBalance,
  );
  return index;
};

(async () => {
  // Ensure the log file exists
  if (!fs.existsSync(balanceLogFile)) {
    console.log('Creating balance log file:', balanceLogFile);
    fs.writeFileSync(balanceLogFile, '');
  }
  let index = 0;
  while (1) {
    fetchBalanceWithRandomAccount(index, null);
    await sleep(500);
  }
})();
