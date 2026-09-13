import request from '@/utils/request';
import type { MenuNode } from '@/types/menu';

export function fetchMyMenus(): Promise<MenuNode[]> {
  // 菜单接口允许失败：失败时布局回退到内置菜单，因此不弹全局提示
  return request.get('/auth/menus', { silent: true });
}
