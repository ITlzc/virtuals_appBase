"use client";
import '@ant-design/v5-patch-for-react-19';
import { Spin, message } from "antd";
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useRouter } from 'next/navigation'
import { useGetTokensInfo, useGetHolders, useGetComments, usePostComments, useGetTradingHistoryList, useGetEthPrice } from '@/utils/api'
import { formatNumber, formatTimeDifference } from '@/utils/util'
import React, { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useBalance, useChainId, useReadContract, useSendTransaction, useWaitForTransactionReceipt } from "wagmi";
import { ethers, parseEther, formatEther } from 'ethers'

import styles from "@/styles/Prototypes.module.scss";
import TradingViewChart from "@/components/TradingViewChart";


import ERC20_ABI from "@/lib/ERC20_abi.json";
import Bonding_ABI from "@/lib/Bonding_abi.json";
import FRouter_ABI from "@/lib/FRouter_abi.json"
import moment from 'moment';

const BondingAddress = "0xa6dB4C4cC9fa53c749e4339D81b4b003EfF74500";
const WETHAddress = "0x4200000000000000000000000000000000000006";
const ApproveAddress = "0x794c9778f33B18FeA8174822c258Eef773352262";

interface Props {
  params: Promise<{
    token: `0x${string}`;
  }>;
}

export default function Prototypes({ params }: Props) {
  const router = useRouter()
  const { token } = React.use(params);
  const { address, isConnected } = useAccount();

  const [amount, setAmount] = useState('');
  const [tradeType, setTradeType] = useState('buy');
  const [debouncedAmount, setDebouncedAmount] = useState(''); // 防抖后的值
  const [comment, setComment] = useState('');
  const [activeTab, setActiveTab] = useState('comments');

  const { data, error, isLoading, refetch } = useGetTokensInfo(token);
  const { data: holders, isLoading: holdersLoading, refetch: holdersRefetch } = useGetHolders(token);
  const { data: comments, isLoading: commentsLoading, refetch: commentsRefetch } = useGetComments(token);
  const { data: tradingHistoryList, isLoading: tradingHistoryListLoading, refetch: tradingHistoryListRefetch } = useGetTradingHistoryList(token);
  const { data: ethPrice, isLoading: ethPriceLoading, refetch: ethPriceRefetch } = useGetEthPrice();

  const { mutate, isPending: isPostCommentPending, isError, isSuccess } = usePostComments(() => { commentsRefetch() })


  const { data: hash, isPending, writeContract } = useWriteContract();
  const { data: hashApprove, isPending: isPendingApprove, writeContract: writeContractApprove } = useWriteContract();

  const { data: balance, refetch: refetchBalance } = useBalance({ address });
  const { data: tokenBalance, refetch: refetchTokenBalance } = useBalance({ address, token });

  // 查询allowance
  const { data: allowance, isLoading: isLoadingAllowance, refetch: refetchAllowance, isSuccess: isAllowanceSuccess } = useReadContract({
    address: token,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: [address, ApproveAddress],
  })

  // const { data: amountsOut, isLoading: isLoadingAmountsOut, refetch: refetchAmountsOut } = useReadContract({
  //   address: ApproveAddress,
  //   abi: FRouter_ABI,
  //   functionName: "getAmountsOut",
  //   args: [token, WETHAddress, Number(debouncedAmount)],
  //   query: {
  //     enabled: !!debouncedAmount && Number(debouncedAmount) > 0,
  //   }
  // })

  const { isLoading: isApproveLoading, isSuccess: isApproveSuccess, } = useWaitForTransactionReceipt({
    hash: hashApprove,
    query: {
      enabled: !!hashApprove
    }
  });

  const { isLoading: isTxLoading, isSuccess: isTxSuccess, } = useWaitForTransactionReceipt({
    hash: hash,
    query: {
      enabled: !!hash
    }
  });


  const inputAmount = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    if (Number(value) < 0) {
      return
    }

    setAmount(value);
  }

  const handleBlur = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAmount(Number(value).toString());

    console.log(value, Number(balance?.formatted), 'balance', tokenBalance?.formatted, 'tokenBalance')

    if (tradeType === 'buy' && Number(value) > 0 && Number(value) > Number(balance?.formatted)) {
      if (Number(balance?.formatted) > 0) setAmount(Math.floor(Number(balance?.formatted) * 1000000) / 1000000 + '');
      else setAmount('0');
    }

    console.log(tokenBalance?.formatted, 'sell')


    if (tradeType === 'sell' && Number(value) > 0 && Number(value) > Number(tokenBalance?.formatted)) {
      if (Number(tokenBalance?.formatted) > 0) setAmount(Math.floor(Number(tokenBalance?.formatted) * 1000000) / 1000000 + '');
      else setAmount('0');
    }

    if (Number(value) <= 0) {
      setAmount('0')
    }
  }

  const handleBuy = async () => {
    if (!amount) return

    if (tradeType === 'buy') {
      if (Number(balance?.formatted) <= 0) return
      try {
        writeContract({
          abi: Bonding_ABI,
          address: BondingAddress,
          functionName: "buy",
          args: [parseEther(amount), token],
          value: parseEther(amount)
        });
      } catch (error) {
        console.log(error)
      }
    }


    if (tradeType === 'sell') {
      if (Number(tokenBalance?.formatted) <= 0) return
      try {
        console.log(allowance)

        if (Number(allowance) === 0) {
          writeContractApprove({
            abi: ERC20_ABI,
            address: token,
            functionName: "approve",
            args: [ApproveAddress, ethers.MaxUint256],
          });

        } else {
          writeContract({
            abi: Bonding_ABI,
            address: BondingAddress,
            functionName: "sell",
            args: [parseEther(amount), token],
          });
        }
      } catch (error) {
        console.log(error)
      }
    }

  }

  const handlePostComment = async () => {
    if (!comment) return
    mutate({
      token: token,
      content: comment
    })
  }

  const selectAmount = (amount: string) => {
    if (amount === 'max') {
      // if (tradeType === 'buy') setAmount(Math.floor(Number(balance?.formatted) * 1000000) / 1000000 + '');
      // if (tradeType === 'sell') setAmount(Math.floor(Number(tokenBalance?.formatted) * 1000000) / 1000000 + '');

      if (tradeType === 'buy') setAmount(balance?.formatted + '');
      if (tradeType === 'sell') setAmount(tokenBalance?.formatted + '');
    }
    if (tradeType === 'buy' && Number(amount) <= Number(balance?.formatted)) setAmount(amount)
    if (tradeType === 'sell' && Number(amount) <= Number(tokenBalance?.formatted)) setAmount(amount)
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(info.token);
      message.success('Copied');
    } catch (error) {
      console.error('Copied error:', error);
    }
  };

  useEffect(() => {
    setAmount('');
  }, [tradeType])

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedAmount(amount), 500); // 500ms 防抖
    return () => clearTimeout(timer);
  }, [amount]);

  // useEffect(() => {
  //   console.log(debouncedAmount)
  //   if (debouncedAmount) {
  //     refetchAmountsOut()
  //     console.log(amountsOut, 'amountsOut')
  //   }

  // }, [debouncedAmount, refetchAmountsOut])

  useEffect(() => {
    if (isTxSuccess) {
      refetchBalance()
      refetchTokenBalance()
      setAmount('')
    }
  }, [isTxSuccess, refetchBalance, refetchTokenBalance])

  // 在 approve 成功后触发逻辑
  useEffect(() => {
    console.log(tradeType, amount, token)
    if (isApproveSuccess && tradeType === 'sell' && amount && token) {
      // 在授权成功后继续调用 sell
      writeContract({
        abi: Bonding_ABI,
        address: BondingAddress,
        functionName: 'sell',
        args: [parseEther(amount + ''), token],
      });
    }
  }, [isApproveSuccess, tradeType, amount, token, writeContract]);


  if (isLoading) return <Spin spinning={true} size='large' fullscreen />

  const info = data?.data?.data;
  const holdersList = holders?.data?.data || [];
  const commentsList = comments?.data?.data || [];
  const historyList = tradingHistoryList?.data?.data || [];

  return (
    <div className='main-container'>
      <div className={`banner w-full h-[300px] fixed top-0 left-0 z-0`}>
        <img src="/images/home-banner-bg.png" alt="" className="w-full h-full object-cover" />
      </div>

      <div className={`main-content ${styles.content}`}>
        <a href="#" className={`${styles.backLink}`} onClick={() => router.back()}>← Back</a>

        <div className={styles.info}>
          {/* 标题部分 */}
          <div className={styles.infoContent}>
            <div className={styles.tokenImage}>
              <img src={info.image} alt="" />
            </div>
            <div className={styles.tokenInfo}>
              <h1 className={styles.title}>{info.name?.replace(" by AGI", "")}</h1>
              <p className={styles.contract}>
                Contract: <span>{info.token}</span> <img src="/images/copy.png" alt="" onClick={()=> copyToClipboard()} />
              </p>
              {/* <div className={styles.actionButtons}>
                <button className={styles.actionButton}>View Streaming Apply</button>
                <button className={`${styles.actionButton} ${styles.blue}`}>DEX Listing Apply</button>
              </div> */}

              <p className={styles.desc}>{info.description}</p>

            </div>

          </div>

          <div className={styles.infoSection}>
            <div className={styles.infoCard}>
              <p>Price</p>
              <h3>{info.price} {balance?.symbol}</h3>
              {/* <span className={'negativeChange'}>-0%</span> */}
            </div>
            <div className={styles.infoCard}>
              <p>Market Cap</p>
              <h3>${formatNumber(Number(formatEther(info.market_cap as any)) * ethPrice?.data.price)}</h3>
            </div>
            <div className={styles.infoCard}>
              <p>ETH Liquidity</p>
              {/* * eth price */}
              <h3>${formatNumber(Number(formatEther(info.reserve1 as any)) * ethPrice?.data.price)}</h3>
            </div>
            <div className={styles.infoCard}>
              <p>24h Volume</p>
              <h3>{formatNumber(Math.floor(Number(formatEther(info.volume24h || 0 as any)) * 1000000) / 1000000)} {balance?.symbol}</h3>
            </div>
          </div>

          <div className={styles.betweenSection}>
            <div className={styles.leftSection}>
              <div className={styles.tradingSection}>
                {/* <h2>Trading Chart</h2> */}
                <div className={styles.chart}>
                  <TradingViewChart token={token} />
                </div>
              </div>

              <div className={styles.comments}>
                <div className={styles.tabs}>
                  <div className={`${styles.tab} ${activeTab === 'comments' && styles.active}`} onClick={() => setActiveTab('comments')}>Comments</div>
                  <div className={`${styles.tab} ${activeTab === 'tradingHistory' && styles.active}`} onClick={() => {
                    setActiveTab('tradingHistory')
                    tradingHistoryListRefetch()
                  }}>Trading History</div>
                </div>

                {activeTab === 'comments' && <div className='comments-content'>
                  <textarea placeholder="Write a comment..." value={comment} onChange={(e) => setComment(e.target.value)} />
                  <button className={styles.postComment} onClick={() => handlePostComment()} disabled={isPostCommentPending} >{isPostCommentPending ? 'Posting...' : 'Post Comment'}</button>
                  {
                    commentsList?.map((item: any, index: number) => {
                      return (
                        <div className={styles.comment} key={index}>
                          <p>{formatTimeDifference(item.created_at)}</p>
                          <p>{item.content}</p>
                        </div>
                      )
                    })
                  }
                </div>}
                {activeTab === 'tradingHistory' && <div className={styles.tradingHistoryContent}>
                  <table>
                    <thead>
                      <tr>
                        <th>Type</th>
                        <th>Price (ETH)</th>
                        <th>Amount</th>
                        <th>Total</th>
                        <th>Time</th>
                        <th>From</th>
                      </tr>
                    </thead>
                    <tbody>
                      {historyList?.map((item: any, index: number) => {
                        return (
                          <tr key={index}>
                            <td style={{ color: item.is_buy ? '#00c853' : '#ff3d00' }}>{item.is_buy ? 'Buy' : 'Sell'}</td>
                            <td>{item.price}</td>
                            <td>{item.is_buy ? Math.floor(item.amount_out * 100) / 100 : Math.floor(item.amount_in * 100) / 100}</td>
                            <td>{item.is_buy ? Math.floor(Number(item.amount_out) * Number(item.price) * 1000000) / 1000000 : Math.floor(Number(item.amount_in) * Number(item.price) * 1000000) / 1000000}</td>
                            <td>{moment(item.block_time * 1000).format('YYYY-MM-DD HH:mm:ss')}</td>
                            <td>{item.from_address.slice(0, 6)}...{item.from_address.slice(-4)}</td>
                          </tr>
                        )
                      })}

                    </tbody>
                  </table>
                </div>}
              </div>
            </div>

            <div className={styles.rightSection}>
              <div className={styles.tradeControls}>
                <div className={styles.buySell}>
                  <button className={`${styles.tradeButton} ${tradeType === 'buy' && styles.active}`} onClick={() => setTradeType('buy')}>Buy</button>
                  <button className={`${styles.tradeButton} ${tradeType === 'sell' && styles.active}`} onClick={() => setTradeType('sell')} >Sell</button>
                </div>
                <div className={styles.inputGroup}>
                  <div className={styles.showBalance}>
                    {<p>Balance: {tradeType === 'buy' ? Math.floor(Number(balance?.formatted) * 1000000) / 1000000 || 0 : Math.floor(Number(tokenBalance?.formatted) * 1000000) / 1000000 || 0} {tradeType === 'buy' ? balance?.symbol : tokenBalance?.symbol}</p>}
                  </div>
                  <div className={styles.customInput}>
                    <input type="number" placeholder="Enter amount" onChange={(e) => inputAmount(e)} value={amount} onBlur={(e) => handleBlur(e)} />
                    <span>{tradeType === 'buy' ? balance?.symbol : tokenBalance?.symbol}</span>
                  </div>

                  {/* {amount ? <p>{amountsOut ? ethers.formatUnits(amountsOut as any, 18) : 0} {balance?.symbol}</p> : null} */}


                  <div className={styles.quickAmounts}>
                    <button onClick={() => { selectAmount('10') }}>10 {tradeType === 'buy' ? balance?.symbol : tokenBalance?.symbol}</button>
                    <button onClick={() => { selectAmount('50') }}>50 {tradeType === 'buy' ? balance?.symbol : tokenBalance?.symbol}</button>
                    <button onClick={() => { selectAmount('100') }}>100 {tradeType === 'buy' ? balance?.symbol : tokenBalance?.symbol}</button>
                    <button onClick={() => { selectAmount('max') }}>Max</button>
                  </div>

                </div>
                <div className="w-full flex justify-center">
                  {
                    isConnected ? <button className={styles.placeTradeBtn} disabled={info.graduated === true || isPending || amount === '' || Number(amount) === 0 || isTxLoading || isPendingApprove || isApproveLoading} onClick={() => handleBuy()}>{isPending || isTxLoading || isPendingApprove || isApproveLoading ? 'Confirming...' : 'Place Trade'}</button> : <ConnectButton />
                  }
                </div>

              </div>

              <div className={styles.bondingCurve}>
                <h3>Bonding Curve Progress: 80%</h3>
                <p>
                  There are <strong style={{ color: '#fff' }}>{Math.floor(Number(formatEther(info.reserve0)) * 1000000) / 1000000} VIRTUAL</strong> still available for sale on the bonding curve...
                </p>
              </div>

              <div className={styles.holderDistribution}>
                <h3>Holder Distribution</h3>
                {
                  holdersList?.map((item: any, index: number) => {
                    return (
                      <div className={styles.items} key={index}>
                        <div className="w-full flex flex-row items-center justify-between">
                          <span style={{ flex: '0 0 120px' }}>{item.address.slice(0, 6) + '...' + item.address.slice(-4)}: </span>
                          {/* <span>{(Number(ethers.formatEther(item.balance)) / (10 ** 9) * 100).toFixed(2)}%</span> */}
                          <div className='flex flex-col' style={{ flex: '0 0 35%' }}>
                            <span>{item.percent / 1000}%</span>
                            <span style={{ fontSize: '.8em', color: '#aaa' }}>
                              {info.pair.toLowerCase() === item.address.toLowerCase() ? '(Bonding Curve)' : info.creator.toLowerCase() === item.address.toLowerCase() ? 'Creator' : ''}
                            </span>
                          </div>
                          <div style={{ flex: '1' }} className={styles.bar}>
                            <div className={styles.barFill} style={{ width: `${item.percent / 1000}%` }}></div>
                          </div>
                        </div>
                      </div>
                    )
                  })
                }

              </div>
            </div>
          </div>


        </div>
      </div>




    </div>
  );
}
