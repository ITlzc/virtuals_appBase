import axios, { AxiosResponse } from 'axios';
import { useQuery, useMutation, UseQueryResult, UseMutationResult } from '@tanstack/react-query';

const BASE_URL = 'https://xjlxljoqbenbvslttrfu.supabase.co/functions/v1';

const api = {
    getTokensList: (page: number = 1, pageSize: number = 500) => axios.get(`${BASE_URL}/minibackend/api/v1/tokens?page=${page}&page_size=${pageSize}`),
    getTokensInfo: (token: string) => axios.get(`${BASE_URL}/minibackend/api/v1/token?token=${token}`),
    getHolders: (token: string) => axios.get(`${BASE_URL}/minibackend/api/v1/holder?token=${token}`),
    getComments: (token: string) => axios.get(`${BASE_URL}/minibackend/api/v1/comment?token=${token}`),
    getTradingHistoryList: (token: string) => axios.get(`${BASE_URL}/minibackend/api/v1/trade?token=${token}`),
    getEthPrice: () => axios.get('https://api.binance.com/api/v3/ticker/price?symbol=ETHUSDT'),

    getTradingViewData: (token: string) => axios.get(`https://xjlxljoqbenbvslttrfu.supabase.co/functions/v1/minibackend/api/v1/chart?token=${token}&start=0&end=${Math.floor(Date.now() / 1000)}&interval=60`),

    postComments: (params: any) => axios.post(`${BASE_URL}/minibackend/api/v1/comment`, params),
};

// 封装的 get 请求，使用 react-query 的 useQuery 钩子
export const useGetTokensList = ( page: number = 1, pageSize: number = 100): UseQueryResult<AxiosResponse<any>, Error> => {
    return useQuery({ queryKey: ['tokensList'], queryFn: () => api.getTokensList(page, pageSize) });
};

export const useGetTokensInfo = (token: string): UseQueryResult<any, Error> => {
    return useQuery({ queryKey: ['tokensInfo', token], queryFn: () => api.getTokensInfo(token) });
};

export const useGetHolders = (token: string): UseQueryResult<any, Error> => {
    return useQuery({ queryKey: ['holders', token], queryFn: () => api.getHolders(token) });
}

export const useGetComments = (token: string): UseQueryResult<any, Error> => {
    return useQuery({ queryKey: ['comments', token], queryFn: () => api.getComments(token) });
}

export const useGetTradingHistoryList = (token: string): UseQueryResult<any, Error> => {
    return useQuery({ queryKey: ['tradingHistoryList', token], queryFn: () => api.getTradingHistoryList(token) });
}

export const useGetEthPrice = (): UseQueryResult<any, Error> => {
    return useQuery({ queryKey: ['ethPrice'], queryFn: () => api.getEthPrice() });
}
export const useGetTradingViewData = (token: string): UseQueryResult<any, Error> => {
    return useQuery({ queryKey: ['tradingViewData', token], queryFn: () => api.getTradingViewData(token) });
}

export const usePostComments = (onSuccessCallback: (data: any) => void): UseMutationResult<any, Error, any> => {
    return useMutation({
        mutationFn: (params: any) => api.postComments(params),
        onSuccess: (data) => {
            // 请求成功后执行的操作
            console.log('post successfully:', data);
            onSuccessCallback(data); // 调用传入的回调函数
        },
        onError: (error) => {
            // 请求失败时的操作
            console.error('Error placing order:', error);
        },
    });
};

