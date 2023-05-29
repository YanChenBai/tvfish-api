import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import Config from '../utils/config';
import axios, { AxiosResponse } from 'axios';
import { PrismaService } from '../prisma/prisma.service';

interface BiliRes<T> {
  code: number;
  data: T;
  message: string;
}
interface BiliRoomType {
  uid: number;
  room_id: number;
  short_id: number;
  live_status: number;
  title: string;
}

interface LiveUserInfo {
  info: {
    uid: number;
    uname: string;
    face: string;
    gender: number;
  };
}

interface QnDesc {
  qn: number;
  desc: string;
  hdr_desc: string;
  attr_desc: null;
}
interface UrlInfo {
  host: string;
  extra: string;
  stream_ttl: number;
}
interface Codec {
  codec_name: string;
  current_qn: number;
  accept_qn: number[];
  base_url: string;
  url_info: UrlInfo[];
  hdr_qn: null;
  dolby_type: number;
  attr_name: string;
}

interface Format {
  format_name: string;
  codec: Codec[];
}

interface Stream {
  protocol_name: string;
  format: Format;
}

interface LiveOrigin {
  live_status: number;
  playurl_info: {
    conf_json: string;
    playurl: {
      cid: number;
      g_qn_desc: QnDesc[];
      stream: Stream;
    };
  };
}

@Injectable()
export class BiliService {
  constructor(private readonly prismaService: PrismaService) {}

  async getLiveRoomInfo(roomId: string) {
    const res = await axios<any, AxiosResponse<BiliRes<BiliRoomType>>>({
      method: 'GET',
      url: Config.getRoomInfoUrl,
      params: {
        room_id: roomId,
      },
    });
    if (res.status !== 200)
      throw new HttpException('获取失败!', HttpStatus.INTERNAL_SERVER_ERROR);
    if (res.data.code === 0) {
      const { room_id, short_id, live_status, title, uid } = res.data.data;
      return { room_id, short_id, live_status, title, uid };
    } else {
      throw new HttpException(res.data.message, HttpStatus.NOT_FOUND);
    }
  }

  async getUserInfo(uid: number) {
    const res = await axios<any, AxiosResponse<BiliRes<LiveUserInfo>>>({
      method: 'GET',
      url: `https://api.live.bilibili.com/live_user/v1/Master/info?uid=${uid}`,
    });
    if (res.status !== 200)
      throw new HttpException('获取失败!', HttpStatus.INTERNAL_SERVER_ERROR);
    if (res.data.code === 0) {
      const {
        info: { uname, face, gender },
      } = res.data.data;
      return { uname, face, gender };
    } else {
      throw new HttpException(res.data.message, HttpStatus.NOT_FOUND);
    }
  }

  // 添加房间
  async addLiveRoom(roomId: string) {
    try {
      const { room_id, uid } = await this.getLiveRoomInfo(roomId);
      const { uname, face } = await this.getUserInfo(uid);
      return await this.prismaService.rooms.create({
        data: {
          roomId: room_id.toString(),
          type: 'bili',
          name: uname,
          face,
        },
      });
    } catch (error) {
      if (error.code === 'P2002')
        throw new HttpException('已经有了喔!', HttpStatus.NOT_FOUND);
      throw new HttpException('烂完了!', HttpStatus.NOT_FOUND);
    }
  }
  async getOrigin(roomId: string, qn = 10000, line = 0) {
    const res = await axios<any, AxiosResponse<BiliRes<LiveOrigin>>>({
      url: Config.getLiveInfoUrl,
      headers: Config.headers,
      params: {
        ...Config.getLiveInfoParams,
        room_id: roomId,
        qn,
      },
    });

    if (res.status !== 200)
      throw new HttpException('获取失败!', HttpStatus.INTERNAL_SERVER_ERROR);
    if (res.data.code === 0) {
      if (res.data.data.live_status !== 1) {
        throw new HttpException('还没开播捏!', 403);
      }

      const streamIndex = 0;
      const formatIndex = 0;
      const codecIndex = 0;
      const { playurl_info } = res.data.data;
      const format: Format =
        playurl_info.playurl.stream[streamIndex].format[formatIndex];
      const codec: Codec = format.codec[codecIndex];
      const baseUrl = codec.base_url;
      const host = codec.url_info[line].host;
      const extra = codec.url_info[line].extra;
      const findQuality = playurl_info.playurl.g_qn_desc.filter(
        (item) => codec.accept_qn.indexOf(item.qn) !== -1,
      );
      const quality = findQuality.map((item) => ({
        qn: item.qn,
        name: item.desc,
      }));
      const lines = codec.url_info.map((item, index) => ({
        name: `线路${index + 1}`,
        line: index,
      }));
      return {
        url: host + baseUrl + extra,
        quality,
        qn: codec.current_qn,
        lines,
        line,
        format: format.format_name,
        codec: codec.codec_name,
      };
    } else {
      throw new HttpException(res.data.message, HttpStatus.NOT_FOUND);
    }
  }
}
