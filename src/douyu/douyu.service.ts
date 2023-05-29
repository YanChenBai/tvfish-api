import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import axios from 'axios';
import Config from '../utils/config';
import { PrismaService } from 'src/prisma/prisma.service';
import md5 from 'js-md5';

interface DouyuRes<T> {
  error: number;
  data: T;
}
interface BiliRoomType {
  nickname: string;
  room_id: number;
  room_name: string;
  show_details: string;
  live_status: number;
  owner_avatar: string;
  show_status: string;
}

@Injectable()
export class DouyuService {
  public did = '10000000000000000000000000001501';
  public t10 = parseInt((new Date().getTime() / 1000).toString()).toString();
  public t13 = new Date().getTime().toString();

  constructor(private readonly prismaService: PrismaService) {}

  // 获取真实id
  async getRealRoomId(roomId: string): Promise<string> {
    try {
      const { data } = await axios.get('https://m.douyu.com/' + roomId);
      const tmpStr = data.toString().match(/"rid":(\d{1,8}),"vipId"/g);
      if (tmpStr) {
        return JSON.parse(`{${tmpStr}:123}`).rid;
      } else {
        throw new HttpException('没找到房间!', HttpStatus.NOT_FOUND);
      }
    } catch (err) {
      throw new HttpException('烂完了!', HttpStatus.NOT_FOUND);
    }
  }

  // 获取房间信息
  async getLiveRoomInfo(roomId: string) {
    try {
      const realRoomId = await this.getRealRoomId(roomId);
      const data = await axios<DouyuRes<BiliRoomType>>({
        headers: Config.headers,
        method: 'get',
        url: `https://www.douyu.com/swf_api/h5room/${realRoomId}`,
      });
      data.data.data.room_id = Number(realRoomId);
      console.log(data.data);

      if (data.data.error === 0) {
        const {
          nickname,
          room_id,
          room_name,
          show_details,
          live_status,
          owner_avatar,
          show_status,
        } = data.data.data;
        return {
          nickname,
          room_id,
          room_name,
          show_details,
          live_status,
          owner_avatar,
          show_status,
        };
      } else {
        throw new HttpException('烂完了!', HttpStatus.NOT_FOUND);
      }
    } catch (err) {
      throw new HttpException('烂完了!', HttpStatus.NOT_FOUND);
    }
  }

  // 添加房间
  async addLiveRoom(roomId: string) {
    try {
      const { room_id, nickname, owner_avatar } = await this.getLiveRoomInfo(
        roomId,
      );
      return await this.prismaService.rooms.create({
        data: {
          name: nickname,
          roomId: room_id.toString(),
          face: owner_avatar,
          type: 'douyu',
        },
      });
    } catch (error) {
      if (error.code === 'P2002')
        throw new HttpException('已经有了喔!', HttpStatus.NOT_FOUND);
      throw new HttpException('烂完了!', HttpStatus.NOT_FOUND);
    }
  }

  // 字符串js导出函数
  executeStrJs(str, out_function = []) {
    const strFunction = new Function(
      'exports',
      'module',
      'require',
      `
        ${str}
        module.exports = {
            ${out_function.join(',')}
        }
    `,
    );
    const executeModule = { exports: {} };
    strFunction(executeModule.exports, executeModule, () => {
      // empty
    });

    return executeModule.exports;
  }

  // 获取真实url
  async getOrigin(roomId: string, qn = 0, line = 'ws-h5') {
    `
    通过PC网页端的接口获取完整直播源。
    :param cdn: 主线路ws-h5、备用线路tct-h5
    :param rate: 1流畅；2高清；3超清；4蓝光4M；0蓝光8M或10M
    :return: JSON格式
    `;
    let res = await axios.get('https://www.douyu.com/' + roomId);
    const result = res.data.match(
      /(vdwdae325w_64we[\s\S]*function ub98484234[\s\S]*?)function/,
    );
    const func_ub9 = result[1].replace(/eval.*?;}/g, 'strc;}');

    let fun: any = this.executeStrJs(func_ub9, ['ub98484234']);
    const js_res = fun.ub98484234();

    const v = js_res.match(/v=(\d+)/)[1];
    const rb = md5(`${roomId}${this.did}${this.t10}${v}`);

    let func_sign = js_res.replace(/return rt;}\);?/g, 'return rt;}');
    func_sign = func_sign.replace('(function (', 'function sign(');
    func_sign = func_sign.replace(
      'CryptoJS.MD5(cb).toString()',
      '"' + rb + '"',
    );

    fun = this.executeStrJs(func_sign, ['sign']);
    let params = fun.sign(roomId, this.did, this.t10);
    params += `&cdn=${line}&rate=${qn}`;
    const url = `https://www.douyu.com/lapi/live/getH5Play/${roomId}?${params}`;
    res = await axios({ method: 'POST', url, headers: Config.headers });

    if (res.data.error === 0) {
      const { data } = res.data;
      const liveUrl = `${data['rtmp_url']}/${data['rtmp_live']}`;
      const quality = data.multirates.map((item) => ({
        name: item.name,
        qn: item.rate,
      }));

      const lines = data['cdnsWithName'].map((item) => ({
        name: item.name,
        line: item.cdn,
      }));

      const info = {
        quality,
        lines,
        url: liveUrl,
        line: data['rtmp_cdn'],
        qn: data['rate'],
        format: 'flv',
      };
      return info;
    } else if (res.data.error === -5) {
      throw new HttpException('房间未开播！', 403);
    } else {
      throw new HttpException('烂完了!', HttpStatus.NOT_FOUND);
    }
  }
}
