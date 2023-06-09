export default {
  headers: {
    'User-Agent':
      'Mozilla/5.0 (iPod; CPU iPhone OS 14_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/87.0.4280.163 Mobile/15E148 Safari/604.1',
  },
  getRoomInfoUrl: 'https://api.live.bilibili.com/room/v1/Room/get_info',
  getLiveInfoUrl:
    'https://api.live.bilibili.com/xlive/web-room/v2/index/getRoomPlayInfo',
  getLiveInfoParams: {
    protocol: '0,1',
    format: '0,1,2',
    codec: '0,1',
    qn: 10000,
    platform: 'h5',
    ptype: 8,
  },
};
