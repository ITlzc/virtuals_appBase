import moment from "moment"

export function formatNumber(value: number) {
    if (value >= 1e6) {
        // 转换为百万 (m)
        return `${(value / 1e6).toFixed(2)}m`;
    } else if (value >= 1e3) {
        // 转换为千 (k)
        return `${(value / 1e3).toFixed(2)}k`;
    }
    return Math.floor(value * 100) / 100; // 小于千直接返回原值
}

export function formatTimeDifference(targetTime: number) {
    const now = moment(); // 当前时间
    const target = moment.unix(targetTime); // 目标时间
    const duration = moment.duration(now.diff(target)); // 计算时间差


    const minutes = duration.asMinutes();
    const hours = duration.asHours();
    const days = duration.asDays();
    const months = duration.asMonths();
    const years = duration.asYears();

    if (minutes < 60) {
        return `${Math.floor(minutes)} minutes ago`;
    } else if (hours < 24) {
        return `${Math.floor(hours)} hours ago`;
    } else if (days < 30) {
        return `${Math.floor(days)} days ago`;
    } else if (months < 12) {
        return `${Math.floor(months)} months ago`;
    } else {
        return `${Math.floor(years)} years ago`;
    }
}