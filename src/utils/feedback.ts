import { message as staticMessage } from 'antd';
import type { MessageInstance } from 'antd/es/message/interface';

/**
 * Ant Design 的 message 想拿到主题上下文必须由 App 组件注入（App.useApp）。
 * 请求拦截器等非组件模块无法使用 Hook，因此在这里保存实例供其调用。
 */
let instance: MessageInstance = staticMessage;

export function setMessageInstance(next: MessageInstance): void {
  instance = next;
}

export function getMessage(): MessageInstance {
  return instance;
}
