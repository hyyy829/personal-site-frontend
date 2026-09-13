/** 与 GET /api/auth/menus 对齐：后端已按当前用户权限过滤，前端不再按权限码二次裁剪 */
export interface MenuNode {
  /** 菜单对应的权限码，同一棵树内唯一 */
  code: string;
  /** 菜单标题的 i18n key，渲染时用 t(nameKey) */
  nameKey: string;
  /** react-router 路径；非跳转节点为 null */
  path: string | null;
  /** @ant-design/icons 组件名，可能为 null */
  icon: string | null;
  /** 升序排列 */
  sortOrder: number;
  children?: MenuNode[];
}
