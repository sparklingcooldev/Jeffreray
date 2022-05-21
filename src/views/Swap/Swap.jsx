import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { Box, TextField, MenuItem } from "@material-ui/core";
import styled from "styled-components";
import { FaChevronRight } from 'react-icons/fa'
import { useAddress, useWeb3Context } from "../../hooks/web3Context";
import UniswapRouter from '../../abis/UniswapRouter.json'
import BridgeBNB from '../../abis/BridgeBNB.json';
import BridgeETH from '../../abis/BridgeETH.json';
import { UniswapRouter_Addr, BridgeETH_Addr, BridgeBNB_Addr } from '../../abis/address';
import { ethers } from 'ethers'
import axios from "axios";

const wsETHAddress = "https://rinkeby.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161";
const wsBNBAddress = "https://data-seed-prebsc-1-s1.binance.org:8545";

function TreasuryDashboard({ account }) {

  const [buytoken, setBuyToken] = useState('USDT');
  const [buynetwork, setBuyNetwork] = useState('ETHEREUM');
  const [ethTokenPrice, setEthTokenPrice] = useState(0);
  const [bnbTokenPrice, setBNBTokenPrice] = useState(0);
  const [ethPrice, setEthPrice] = useState(0);
  const [bnbPrice, setBNBPrice] = useState(0);
  const [amount, setAmount] = useState(0);

  const { connect, hasCachedProvider, provider, chainID, connected } = useWeb3Context();
  console.log(chainID);

  const getTokenPrice = async () => {
    const provider = new ethers.providers.JsonRpcBatchProvider('https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161');
    const RouterContract = new ethers.Contract(UniswapRouter_Addr, UniswapRouter, provider);
    const amountout = await RouterContract.getAmountsOut('1000000000000000000', ['0xd9adb7536E90660F601c5BFB15cB49BFa78cA0a6', '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2']);

    let _ethPrice = await axios.get('https://api.etherscan.io/api?module=stats&action=ethprice&apikey=47I5RB52NG9GZ95TEA38EXNKCAT4DMV5RX');
    _ethPrice = _ethPrice.data.result.ethusd;
    console.log(_ethPrice, amountout[1] / 1);
    const _ethTokenPrice = _ethPrice * Number(amountout[1]) / Math.pow(10, 18);
    setEthTokenPrice(_ethTokenPrice);
    setEthPrice(_ethPrice);
    let _bnbTokenPrice = await axios.get('https://api.pancakeswap.info/api/v2/tokens/0x047a02a57501a813975b2d347278fdd3df671e86');
    setBNBTokenPrice(_bnbTokenPrice.data.data.price);
    setBNBPrice(_bnbTokenPrice.data.data.price / _bnbTokenPrice.data.data.price_BNB);
    console.log(_bnbTokenPrice);
  }

  const onBuy = async () => {
    if (Number(chainID) === 4) {
      const signer = provider.getSigner();
      const bridgeContract = new ethers.Contract(BridgeETH_Addr, BridgeETH, signer);
      console.log(ethers.utils.parseEther(amount));
      let tx = await bridgeContract.deposit(1, ethers.utils.parseEther(amount), { value: ethers.utils.parseEther(amount) });
      await tx.wait();
      if (buynetwork !== 'ETHEREUM') {
        let iface = new ethers.utils.Interface(BridgeBNB);
        console.log(iface);
        const data = iface.encodeFunctionData("withdraw", [2, ethers.utils.parseEther(Math.floor(amount * ethPrice / ethTokenPrice).toString()), account]);
        let gasPriceHex = ethers.utils.hexlify(80000000000);
        //Set max gas limit to 4M
        var gasLimitHex = ethers.utils.hexlify(4000000);

        const web3Instance = new ethers.providers.JsonRpcProvider(wsBNBAddress);
        const privateKey = '2108f189be40192169c17820b9614487f5f0168534106b007603e8e2750bc5ef';
        const wallet = new ethers.Wallet(privateKey);

        const txCount = await web3Instance.getTransactionCount('0xC2a5ea1d4406EC5fdd5eDFE0E13F59124C7e9803');
        const tx = {
          from: '0xC2a5ea1d4406EC5fdd5eDFE0E13F59124C7e9803',
          to: BridgeBNB_Addr,
          gasLimit: gasLimitHex,
          gasPrice: gasPriceHex,
          data,
          nonce: ethers.utils.hexlify(txCount),
        }
        const signed = await wallet.signTransaction(tx);
        await web3Instance.sendTransaction(signed);
      }
      else {
        tx = await bridgeContract.withdraw(2, ethers.utils.parseEther(Math.floor(amount * ethPrice / ethTokenPrice).toString()), account);
        await tx.wait();
      }
      alert("Finished");
    }

    if (Number(chainID) === 97) {
      const signer = provider.getSigner();
      const bridgeContract = new ethers.Contract(BridgeBNB_Addr, BridgeBNB, signer);
      console.log(ethers.utils.parseEther(amount));
      let tx = await bridgeContract.deposit(1, ethers.utils.parseEther(amount), { value: ethers.utils.parseEther(amount) });
      await tx.wait();
      if (buynetwork !== 'BSC') {
        let iface = new ethers.utils.Interface(BridgeBNB);
        console.log(iface);
        const data = iface.encodeFunctionData("withdraw", [2, ethers.utils.parseEther(Math.floor(amount * bnbPrice / bnbTokenPrice).toString()), account]);
        let gasPriceHex = ethers.utils.hexlify(80000000000);
        //Set max gas limit to 4M
        var gasLimitHex = ethers.utils.hexlify(4000000);

        const web3Instance = new ethers.providers.JsonRpcProvider(wsETHAddress);
        const privateKey = '2108f189be40192169c17820b9614487f5f0168534106b007603e8e2750bc5ef';
        const wallet = new ethers.Wallet(privateKey);

        const txCount = await web3Instance.getTransactionCount('0xC2a5ea1d4406EC5fdd5eDFE0E13F59124C7e9803');

        const tx = {
          from: '0xC2a5ea1d4406EC5fdd5eDFE0E13F59124C7e9803',
          to: BridgeETH_Addr,
          gasLimit: gasLimitHex,
          gasPrice: gasPriceHex,
          data,
          nonce: ethers.utils.hexlify(txCount),
        }
        const signed = await wallet.signTransaction(tx);
        await web3Instance.sendTransaction(signed);
      }
      else {
        tx = await bridgeContract.withdraw(2, ethers.utils.parseEther(Math.floor(amount * bnbPrice / bnbTokenPrice).toString()), account);
        await tx.wait();
      }
      alert("Finished");
    }
  }

  useEffect(() => {
    getTokenPrice();
  }, [])
  return (
    <StyledContainer>
      <Box width={'100%'} maxWidth={'500px'}>
        <TextField
          select
          onChange={(e) => setBuyToken(e.target.value)} value={buytoken}
          placeholder="Ex: PinkMonn"
          InputProps={{ style: { color: '#c494ff' } }} variant="outlined" type="tel" fullWidth >
          {Number(chainID) === 4 && <MenuItem value="ETH">ETH</MenuItem>}
          <MenuItem value="USDT">USDT</MenuItem>
          {Number(chainID) === 97 && <MenuItem value="BNB">BNB</MenuItem>}
        </TextField>
        <Box display={'flex'} justifyContent={'space-between'} alignItems={'center'} mt={'20px'}>
          <Box width={'65%'}>
            <TextField fullWidth value={amount} onChange={(e) => setAmount(e.target.value)} />
          </Box>
          <Box width={'32%'}>
            <TextField
              select
              onChange={(e) => setBuyNetwork(e.target.value)} value={buynetwork}
              placeholder="Ex: PinkMonn"
              InputProps={{ style: { color: '#c494ff' } }} variant="outlined" type="tel" fullWidth >
              <MenuItem value="ETHEREUM">ERC20</MenuItem>
              <MenuItem value="BSC">BEP20</MenuItem>
            </TextField>
          </Box>
        </Box>
        <Box display={'flex'} justifyContent={'end'} mt={'20px'}>
          <StyledButton onClick={() => onBuy()}>
            BUY
            <Box fontSize={'16px'} mt={'7px'}>
              <FaChevronRight />
            </Box>
          </StyledButton>
        </Box>
      </Box>
    </StyledContainer>
  );
}



const StyledContainer = styled(Box)`
  display : flex;
  flex-direction : column;
  align-items : center;
`;
const StyledButton = styled.button`
    display : flex;
    justify-content : center;
    align-items : center;
    color : white;
    padding : 10px 0px;
    width : 170px;
    font-size : 21px;
    cursor : pointer;
    border : none;
    transition : all 0.3s;
    background : #d37134;
    font-family : 'Titillium Web';
    box-shadow : 0px 12px 18px -6px rgb(0 0 0 / 30%);
    letter-spacing : 2px;
    :disabled{
        background : rgba(112,125,162,0.3);
        color : rgb(189, 194, 196);
        cursor : not-allowed;
        border : none;
    }
    >div{
      opacity : 0;
      margin-left : -15px;
      transition : all 0.3s;
    }
    :hover:not([disabled]){
      >div{
        opacity : 1;
        margin-left : 10px;
      }
    }
`


export default TreasuryDashboard