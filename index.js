import { ethers } from "./ethers-6-7-0.esm.min.js";
import { abi, contractAddress } from "./constants.js";

const connectButton = document.getElementById("connectButton");
const fundButton = document.getElementById("fundButton");
const getBalanceButton = document.getElementById("getBalanceButton");
const withdrawButton = document.getElementById("withdrawButton");
connectButton.onclick = connect;
fundButton.onclick = fund;
getBalanceButton.onclick = getBalance;
withdrawButton.onclick = withdraw;

async function connect() {
    if (typeof window.ethereum != "undefined") {
        try {
            await window.ethereum.request({
                method: "eth_requestAccounts",
            });
        } catch (error) {
            console.log(error);
        }
        connectButton.innerHTML = "Connected";
        console.log("Connected!");
    } else {
        connectButton.innerHTML = "Please install MetaMask";
    }
}

async function fund() {
    const ethAmount = document.getElementById("ethAmount").value;
    console.log(`Funding with ${ethAmount}...`);
    if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(contractAddress, abi, signer);
        try {
            const transactionResponse = await contract.fund({
                value: ethers.parseEther(ethAmount),
            });
            await listeningForTransactionMine(transactionResponse, provider);
            console.log("Done!");
        } catch (error) {
            console.log(error);
        }
    }
}

async function withdraw() {
    if (typeof window.ethereum != "undefined") {
        console.log("Withdrawing...");
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(contractAddress, abi, signer);
        try {
            const transactionResponse = await contract.withdraw();
            await listeningForTransactionMine(transactionResponse, provider);
            console.log("Done!");
        } catch (error) {
            console.log(error);
        }
    }
}

async function getBalance() {
    if (typeof window.ethereum != "undefined") {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const balance = await provider.getBalance(contractAddress);
        console.log(ethers.formatEther(balance));
    }
}

function listeningForTransactionMine(transactionResponse, provider) {
    console.log(`Mining ${transactionResponse.hash}...`);
    return new Promise((resolve, reject) => {
        provider.once(transactionResponse.hash, async (transactionReceipt) => {
            const confirm = await transactionReceipt.confirmations();
            console.log(`Completed with ${confirm} confirmations`);
            resolve();
        });
    });
}
