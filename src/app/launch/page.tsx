'use client'
import '@ant-design/v5-patch-for-react-19';
import styles from "@/styles/Launch.module.scss";
import { useDropzone } from "react-dropzone";
import { useEffect, useState } from "react";
import { ethers, parseEther } from 'ethers'
import { useRouter } from 'next/navigation'

import { useAccount, useWriteContract, useBalance, type BaseError, useSendTransaction, useWaitForTransactionReceipt } from "wagmi";
import { Spin, message } from "antd";

import ERC20_ABI from "../../lib/ERC20_abi.json";
import Bonding_ABI from "../../lib/Bonding_abi.json";

const BondingAddress = "0xa6dB4C4cC9fa53c749e4339D81b4b003EfF74500";

const urlRegex = /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(:\d+)?(\/[^\s]*)?$/;

export default function Launch() {
    const router = useRouter()
    const [hasProcessed, setHasProcessed] = useState(false);

    const { data: hash, isPending, error: txError, isSuccess, writeContract } = useWriteContract();

    const { data: confirmedHash, isLoading: isConfirming, isError: confirmedError, isSuccess: isConfirmed, error: confirmedErrorData, isLoadingError, isPaused } = useWaitForTransactionReceipt({
        hash: hash,
        query: {
            enabled: !!hash && !hasProcessed,
        },
        confirmations: 10, // 等待确认数
    });


    const { address, isConnected } = useAccount();
    const { data: balance } = useBalance({ address });
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [imgUrl, setImgUrl] = useState<string | null>(null);

    const [name, setName] = useState<string>("");
    const [ticker, setTicker] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    const [website, setWebsite] = useState<string>("");
    const [telegram, setTelegram] = useState<string>("");
    const [twitter, setTwitter] = useState<string>("");
    const [purchaseAmount, setPurchaseAmount] = useState<string>("");
    const [nftAddress, setNftAddress] = useState("");

    const [isValid, setIsValid] = useState(false)



    const onDrop = (acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            const file = acceptedFiles[0];
            uploadFile(file); // 上传文件
            setUploadedFile(file);
            // setPreviewUrl(URL.createObjectURL(file));

        }
    };

    const uploadFile = async (file: File) => {
        const formData = new FormData();
        // 模拟 "test.png" 文件，替换为实际文件
        // const file = new File(["content"], "test.png", { type: "image/png" });
        formData.append("file", file);
        try {
            const response = await fetch("https://xjlxljoqbenbvslttrfu.supabase.co/functions/v1/minibackend/api/v1/upload", {
                method: "POST",
                body: formData,
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const result = await response.json();
            console.log("Upload successful:", result);
            if (result && result.data && result.code === 0) {
                setImgUrl(result.data.publicUrl);
            }
        } catch (error) {
            console.error("Error uploading file:", error);
        }
    };

    const { getRootProps, getInputProps } = useDropzone({
        onDrop,
        accept: {
            "image/jpeg": [".jpeg", ".jpg"],
            "image/png": [".png"],
            "image/gif": [".gif"],
            "image/webp": [".webp"],
        },
        maxSize: 4 * 1024 * 1024, // 4MB
    });

    const validateAddress = (address: string) => {
        if (address.trim() === '') {
            setIsValid(false);
            return;
        }
        const valid = ethers.isAddress(address);
        setIsValid(valid);
    };


    const handleConfirm = async () => {
        setHasProcessed(false); // 重置交易处理状态
        if (!isConnected) {
            message.warning("Please connect your wallet first")
            return
        }

        if(purchaseAmount === "" || Number(purchaseAmount) <= 0.001){
            message.warning("Purchase amount must be greater than fee")
            return
        }

        // window.scrollTo({
        //     top: 0,
        //     behavior: "smooth",
        // });

        const urls = [website, twitter, telegram]

        writeContract({
            abi: Bonding_ABI,
            address: BondingAddress,
            functionName: "launch",
            args: [name, ticker, description, imgUrl, urls, parseEther(purchaseAmount), nftAddress], //nftAddress 0x0000000000000000000000000000000000000001
            value: parseEther(purchaseAmount),
        });
    }

    useEffect(() => {
        if (isConfirmed || confirmedError) {
            setHasProcessed(true); // 标记交易已处理
          }
        if(confirmedError && confirmedErrorData){
            message.error(confirmedErrorData.name)
            console.log("confirmedErrorData", confirmedErrorData)
        }
        if (isConfirmed) {
            message.success("Create successful!");
            setTimeout(() => {
                router.push('/')
            }, 2000);
        }
    }, [isConfirmed, confirmedError, confirmedErrorData])

    useEffect(() => {
        console.log("confirmedHash", confirmedHash)
        console.log("confirmedError", confirmedError,confirmedErrorData)
    }, [confirmedHash, confirmedError, confirmedErrorData,])

    return (
        // <Spin spinning={isConfirming || isPending} size='large'>
        <div className='main-container'>
            <div className={`banner w-full h-[300px] fixed top-0 left-0 z-0`}>
                <img src="/images/home-banner-bg.png" alt="" className="w-full h-full object-cover" />
            </div>


            <div className={`main-content ${styles.content}`}>
                <h1 className={styles.topText}>Launch your <span className={styles.highlight}>Token</span></h1>


                {/* Form Section */}
                <section className={styles.formSection}>
                    <div className={styles.formGroup}>
                        <label>Image *</label>
                        {/* <div className={styles.fileInput}>
                            JPEG/PNG/WEBP/GIF <br /> Less Than 4MB
                        </div> */}

                        <div
                            {...getRootProps({
                                className: `${styles.fileInput} ${uploadedFile ? styles.fileInputActive : ""}`,
                            })}
                        >
                            <input {...getInputProps()} />
                            {uploadedFile ? (
                                <div>
                                    {imgUrl ? <img
                                        src={imgUrl!}
                                        alt="Uploaded File Preview"
                                        className={styles.previewImage}
                                    /> : <Spin size="large" />}
                                    <p>{uploadedFile.name}</p>
                                </div>
                            ) : (
                                <p><i className="text-[2em]">+</i> <br /> JPEG/PNG/WEBP/GIF <br /> Less Than 4MB</p>
                            )}
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label>Token Name *</label>
                        <input type="text" placeholder="Enter Token name" maxLength={20} onChange={(e) => setName(e.target.value)} />
                        <span className={styles.optional}>{name.length}/20</span>
                    </div>

                    <div className={styles.formGroup}>
                        <label>Token Symbol ($Ticker) *</label>
                        <input type="text" placeholder="Enter Token symbol" maxLength={10} onChange={(e) => setTicker(e.target.value)} />
                        <span className={styles.optional}>{ticker.length}/10</span>
                    </div>

                    <div className={styles.formGroup}>
                        <label>Token Description *</label>
                        <textarea placeholder="Enter Token description" maxLength={256} onChange={(e) => setDescription(e.target.value)} ></textarea>
                        <span className={styles.optional}>{description.length}/256</span>
                    </div>

                    <div className={styles.formGroup}>
                        <label>Website</label>
                        <input type="text" placeholder="Optional" onChange={(e) => setWebsite(e.target.value)} onBlur={(e) => {
                            // urlRegex
                            if (!urlRegex.test(e.target.value)) {
                                message.warning('Please enter a valid URL')
                                setWebsite('')
                            }
                        }} />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Telegram</label>
                        <input type="text" placeholder="Optional" onChange={(e) => setTelegram(e.target.value)} onBlur={(e) => {
                            // urlRegex
                            if (!urlRegex.test(e.target.value)) {
                                message.warning('Please enter a valid URL')
                                setTelegram('')
                            }
                        }} />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Twitter</label>
                        <input type="text" placeholder="Optional" onChange={(e) => setTwitter(e.target.value)} onBlur={(e) => {
                            // urlRegex
                            if (!urlRegex.test(e.target.value)) {
                                message.warning('Please enter a valid URL')
                                setTwitter('')
                            }
                        }} />
                    </div>

                    {/* <div className={styles.summary}>
                        <span>Agent Creation Fee</span>
                        <span className={styles.fee}>0.02 ETH</span>
                    </div> */}


                    <div className={styles.formGroup}>
                        <label>Initial Buy * <span>be the first person to buy your Token</span></label>
                        <input type="number" placeholder="Enter the amount, Purchase amount must be greater than fee" onChange={(e) => {
                            // if (Number(e.target.value) <= 0.001) setPurchaseAmount('0.001')
                            setPurchaseAmount(e.target.value)
                        }} />
                        <div className={styles.tipText}>Balance: {balance?.formatted}ETH creation Fee 0.001ETH </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label>NFT Address *</label>
                        <input type="text" placeholder="Optional" value={nftAddress} onChange={(e) => setNftAddress(e.target.value)} onBlur={(e) => {
                            console.log(ethers.isAddress(e.target.value))
                            if (ethers.isAddress(e.target.value)) {
                                setNftAddress(e.target.value)
                            } else {
                                message.warning('Please enter a valid NFT address')
                                setNftAddress('')
                            }
                        }
                        } />
                    </div>

                    <button className={styles.submitButton} disabled={!ticker || !description || !purchaseAmount || !nftAddress || isConfirming || isPending} onClick={() => handleConfirm()}>{isPending || isConfirming ? 'Confirming...' : 'Create Token'}</button>

                    {/* {isConfirming && <div>Waiting for confirmation...</div>}
                    {isConfirmed && <div>Transaction confirmed.</div>} */}
                </section>

                {/* Footer Section */}
                <footer className={styles.footer}>
                    <p>
                        2024 AppBase. All rights reserved
                        <br />
                        This site is protected by reCAPTCHA and the Google{" "}
                        <a href="#">Privacy Policy</a> and <a href="#">Terms of Service</a>.
                    </p>
                </footer>
            </div>

        </div>
        // </Spin>

    )
}