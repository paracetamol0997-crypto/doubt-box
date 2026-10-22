type NotificationCallback = (data: any) => void;
type DoubtUpdateCallback = (data: any) => void;

class WebSocketClient {
  private ws: WebSocket | null = null;
  private reconnectTimeout: any = null;
  private reconnectInterval = 2000;
  private maxReconnectInterval = 15000;
  private currentInterval = 2000;
  private isExplicitlyClosed = false;
  private notificationListeners: Set<NotificationCallback> = new Set();
  private doubtUpdateListeners: Set<DoubtUpdateCallback> = new Set();
  private connectionListeners: Set<(connected: boolean) => void> = new Set();

  public connect() {
    const token = localStorage.getItem('doubtbox_token');
    if (!token) return;

    this.isExplicitlyClosed = false;
    clearTimeout(this.reconnectTimeout);

    const customWsUrl = import.meta.env.VITE_WS_URL as string | undefined;
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const baseWs = customWsUrl || `${protocol}//${host}/ws/notifications/`;
    const separator = baseWs.includes('?') ? '&' : '?';
    const wsUrl = `${baseWs}${separator}token=${token}`;

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        this.currentInterval = this.reconnectInterval;
        this.connectionListeners.forEach((fn) => fn(true));
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'new_notification' && data.notification) {
            this.notificationListeners.forEach((fn) => fn(data.notification));
          } else if (data.type === 'doubt_update' && data.data) {
            this.doubtUpdateListeners.forEach((fn) => fn(data.data));
          }
        } catch (e) {
          console.error('Failed to parse WebSocket message:', e);
        }
      };

      this.ws.onclose = (event) => {
        this.connectionListeners.forEach((fn) => fn(false));
        if (!this.isExplicitlyClosed) {
          this.scheduleReconnect();
        }
      };

      this.ws.onerror = (err) => {
        this.ws?.close();
      };
    } catch (err) {
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect() {
    clearTimeout(this.reconnectTimeout);
    this.reconnectTimeout = setTimeout(() => {
      this.currentInterval = Math.min(this.currentInterval * 1.5, this.maxReconnectInterval);
      this.connect();
    }, this.currentInterval);
  }

  public disconnect() {
    this.isExplicitlyClosed = true;
    clearTimeout(this.reconnectTimeout);
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.connectionListeners.forEach((fn) => fn(false));
  }

  public onNotification(callback: NotificationCallback) {
    this.notificationListeners.add(callback);
    return () => this.notificationListeners.delete(callback);
  }

  public onDoubtUpdate(callback: DoubtUpdateCallback) {
    this.doubtUpdateListeners.add(callback);
    return () => this.doubtUpdateListeners.delete(callback);
  }

  public onConnectionChange(callback: (connected: boolean) => void) {
    this.connectionListeners.add(callback);
    return () => this.connectionListeners.delete(callback);
  }
}

export const wsClient = new WebSocketClient();
