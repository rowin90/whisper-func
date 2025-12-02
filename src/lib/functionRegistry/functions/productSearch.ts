/**
 * 商品搜索函数
 */
import { FunctionDefinition } from '../types';

export const productSearch: FunctionDefinition[] = [
  {
    name: 'search_products',
    description: '搜索商品列表。根据关键词搜索商品，返回商品的基本信息包括图片、标题和商品ID。',
    parameters: {
      type: 'object',
      properties: {
        keyword: {
          type: 'string',
          description: '搜索关键词，例如 "Oxygen Sensor"',
        },
        page: {
          type: 'number',
          description: '页码，从1开始，默认为1',
          default: 1,
        },
        size: {
          type: 'number',
          description: '每页数量，默认为20',
          default: 20,
        },
        diversionName: {
          type: 'string',
          description: '分流名称，默认为 "B"',
          default: 'B',
        },
      },
      required: ['keyword'],
    },
    handler: async (args: {
      keyword: string;
      page?: number;
      size?: number;
      diversionName?: string;
    }) => {
      try {
        const page = args.page || 1;
        const size = args.size || 20;
        const diversionName = args.diversionName || 'B';
        const keyword = encodeURIComponent(args.keyword);

        const url = `https://api.a-premium-test.com/search-pro/public/items/filter-search?size=${size}&page=${page}&keyword=${keyword}&diversionName=${diversionName}`;

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            accept: 'application/json, text/plain, */*',
            'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8,sq;q=0.7',
            'cache-control': 'no-cache',
            origin: 'https://a-premium-test.com',
            pragma: 'no-cache',
            referer: 'https://a-premium-test.com/',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-site',
            'user-agent':
              'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',
            'visitor_u_key': '9c966f90-496a-4bc6-0960-1762919898247',
            'x-diversion-name': diversionName,
            // 'x-session-id': 'b655377c-4e93-4ee9-09eb-1764593130099',
            'x-shop-id': '2022',
          },
        });

        if (!response.ok) {
          throw new Error(
            `请求失败: ${response.status} ${response.statusText}`
          );
        }

        const data = await response.json();

        // 提取商品列表中的关键信息
        const itemList = data?.itemList?.data || [];
        const total = data?.itemList?.total  || 0;

        const products = itemList.map((item: any) => ({
          itemId: item.itemId,
          title: item.title,
          imageUrl: item.imageUrl,
        }));

        return {
          success: true,
          keyword: args.keyword,
          page,
          size,
          total,
          count: products.length,
          products,
        };
      } catch (error) {
        throw new Error(
          `商品搜索失败: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    },
  },
];
