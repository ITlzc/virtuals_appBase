"use client";
import '@ant-design/v5-patch-for-react-19';
import { Spin, message } from "antd";
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from "wagmi";
import { useGetTokensList, useGetEthPrice } from '@/utils/api'
import { formatNumber } from '@/utils/util'
import { formatEther } from 'ethers'
import styles from '../styles/Home.module.scss';
import { ethers } from 'ethers';


function Page() {
  const { address, isConnected } = useAccount();

  const { data: tokensList, error: listError, isLoading: getTokensLoading, refetch: refetchTokensList } = useGetTokensList(1, 100);
  const { data: ethPrice, error: ethPriceError, isLoading: getEthPriceLoading } = useGetEthPrice();

  const cards: any = tokensList?.data.data;


  return (
    <div className='main-container'>
      <div className={`banner w-full h-[300px] fixed top-0 left-0 z-0`}>
        <img src="/images/home-banner-bg.png" alt="" className="w-full h-full object-cover" />
      </div>
      <div className={styles.home}>
        <div className="header-section flex flex-row justify-between align-center mb-[30px]" >
          <h1>Popular Tokens</h1>
          {
            isConnected ? <a href="launch" className="px-[24px] py-[12px] bg-[#7c3aed] rounded-[12px]">Create New AI Agent/App</a> : <ConnectButton label="Create New AI Agent/App" />
          }
        </div>
        {
          !cards?.length ? <Spin spinning={getTokensLoading} size='large' fullscreen /> : (
            <div className={styles.grid}>
              {cards?.map((card: any, index: number) => (
                <a href={`prototypes/${card.token}`} key={index}>
                  <div className={styles.card}>
                    <div className={styles.tokenImage}>
                      <img src={card.image} alt="" />
                    </div>

                    <div className={styles.tokenInfo}>
                      <h2>{card.name?.replace(" by AGI", "")}</h2>
                      <p className={styles.description}>{card.description}</p>
                      <div className="flex flex-row justify-between items-start">
                        <div className="flex flex-col text-left">
                          <span className="text-[#aaa]">Price:</span>
                          <span className="text-white">{card.price} ETH</span>
                          {/* <span
                        className={
                          card.change.startsWith("+")
                            ? 'positiveChange'
                            : 'negativeChange'
                        }
                      >
                        {card.change}
                      </span> */}
                        </div>
                        <div className="flex flex-col text-left">
                          <span className="text-[#aaa]">Market Cap:</span>
                          <span className="text-white">${formatNumber(Number(formatEther(card.market_cap as any)) * ethPrice?.data.price)}</span>
                        </div>
                      </div>
                      <div className="flex">

                      </div>
                    </div>
                  </div>
                </a>

              ))}
            </div>
          )
        }

      </div>
    </div>
  );
}

export default Page;
