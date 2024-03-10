const fs = require('fs');
const solanaWeb3 = require('@solana/web3.js');

const WALLET_FILE = 'wallet.json';

let wallet;
let connection;

async function createWallet() {
    wallet = solanaWeb3.Keypair.generate();
    const publicKeyStr = wallet.publicKey.toString();
    const privateKeyStr = wallet.secretKey.toString();

    const walletData = {
        publicKey: publicKeyStr,
        privateKey: privateKeyStr,
        balance: 0
    };

    fs.writeFileSync(WALLET_FILE, JSON.stringify(walletData));
    console.log('Wallet created and saved to wallet.json');
}

async function airdrop(amount = 1) {
    if (!wallet) {
        console.log('Wallet not initialized. Please create a wallet first.');
        return;
    }

    const publicKey = wallet.publicKey;

    try {
        await connection.requestAirdrop(publicKey, solanaWeb3.LAMPORTS_PER_SOL * amount);
        console.log(`${amount} SOL airdropped to wallet ${publicKey.toString()}`);
    } catch (error) {
        console.error('Airdrop failed:', error);
    }
}

async function checkBalance() {
    if (!wallet) {
        console.log('Wallet not initialized. Please create a wallet first.');
        return;
    }

    const publicKey = wallet.publicKey;
    try {
        const balance = await connection.getBalance(publicKey);
        console.log(`Wallet balance: ${balance / solanaWeb3.LAMPORTS_PER_SOL} SOL`);
    } catch (error) {
        console.error('Error getting balance:', error);
    }
}

async function transfer(otherPublicKey, amount) {
    if (!wallet) {
        console.log('Wallet not initialized. Please create a wallet first.');
        return;
    }

    const fromPublicKey = wallet.publicKey;
    const toPublicKey = new solanaWeb3.PublicKey(otherPublicKey);
    const lamports = amount * solanaWeb3.LAMPORTS_PER_SOL;

    const transaction = solanaWeb3.Transaction.createTransfer(fromPublicKey, toPublicKey, lamports);

    try {
        const signature = await solanaWeb3.sendAndConfirmTransaction(connection, transaction, [wallet]);
        console.log(`Successfully transferred ${amount} SOL to ${toPublicKey.toString()}. Transaction signature: ${signature}`);
    } catch (error) {
        console.error('Transfer failed:', error);
    }
}

async function initializeConnection() {
    connection = new solanaWeb3.Connection(solanaWeb3.clusterApiUrl('devnet'), 'confirmed');
}

// Komutları işle
async function processCommand(command, args) {
    switch (command) {
        case 'new':
            await createWallet();
            break;
        case 'airdrop':
            await airdrop(args[0]);
            break;
        case 'balance':
            await checkBalance();
            break;
        case 'transfer':
            await transfer(args[0], args[1]);
            break;
        default:
            console.log('Invalid command');
    }
}

async function main() {
    await initializeConnection();

    const command = process.argv[2];
    const args = process.argv.slice(3);

    await processCommand(command, args);
}

main();
