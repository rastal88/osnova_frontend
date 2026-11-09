import { BellOutlined } from '@ant-design/icons';
import { Badge, Button, Empty, Popover, Spin, Typography } from 'antd';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { utc } from '../../../api/dates';
import type { NotificationRead } from '../../../api/generated';
import { useFormat } from '../../../i18n/format';
import { getNotifications, getUnread, markAllRead, markRead } from '../api';
import { startPolling } from '../polling';
import './Bell.css';

const { Text } = Typography;

/** The bell: unread count, the latest notifications, mark read, open the link. */
const Bell = () => {
  const { t, i18n } = useTranslation('notifications');
  const format = useFormat();
  const navigate = useNavigate();
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationRead[] | null>(null);
  const [failed, setFailed] = useState(false);

  const refreshCount = useCallback(() => {
    getUnread().then(setUnread, () => undefined);
  }, []);

  useEffect(() => startPolling(refreshCount), [refreshCount]);

  const load = useCallback(async () => {
    setFailed(false);
    try {
      const page = await getNotifications();
      setItems(page.items);
      setUnread(page.unread);
    } catch {
      setFailed(true);
    }
  }, []);

  // Texts come translated by the backend: reload them in the new language
  // biome-ignore lint/correctness/useExhaustiveDependencies: `i18n.language` triggers a reload
  useEffect(() => {
    if (open) void load();
  }, [open, load, i18n.language]);

  const openItem = async (item: NotificationRead) => {
    setOpen(false);
    if (!item.read) {
      setUnread((value) => Math.max(0, value - 1));
      setItems((list) => list?.map((x) => (x.id === item.id ? { ...x, read: true } : x)) ?? null);
      void markRead(item.id).catch(() => refreshCount());
    }
    if (item.link) navigate(item.link);
  };

  const readAll = async () => {
    await markAllRead();
    setUnread(0);
    setItems((list) => list?.map((item) => ({ ...item, read: true })) ?? null);
  };

  const content = (
    <div className="bell-panel">
      <div className="bell-panel-header">
        <Text strong>{t('title')}</Text>
        {unread > 0 && (
          <Button type="link" size="small" onClick={() => void readAll()}>
            {t('readAll')}
          </Button>
        )}
      </div>
      {items === null && !failed && (
        <div className="bell-panel-state">
          <Spin />
        </div>
      )}
      {failed && (
        <div className="bell-panel-state">
          <Text type="secondary">{t('failed')}</Text>{' '}
          <Button type="link" size="small" onClick={() => void load()}>
            {t('retry')}
          </Button>
        </div>
      )}
      {items?.length === 0 && (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={t('empty')} />
      )}
      {items && items.length > 0 && (
        <ul className="bell-list">
          {items.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                className={`bell-item${item.read ? '' : ' bell-item-unread'}`}
                onClick={() => void openItem(item)}
              >
                <span className="bell-item-title">{item.title}</span>
                {item.body && <span className="bell-item-body">{item.body}</span>}
                <span className="bell-item-time" title={format.dateTime(utc(item.created_at))}>
                  {format.relative(utc(item.created_at))}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  return (
    <Popover
      content={content}
      trigger="click"
      placement="bottomRight"
      open={open}
      onOpenChange={setOpen}
      arrow={false}
    >
      <Button
        type="text"
        aria-label={unread ? t('openUnread', { count: unread }) : t('open')}
        icon={
          <Badge count={unread} size="small" overflowCount={99}>
            <BellOutlined style={{ fontSize: 18 }} />
          </Badge>
        }
      />
    </Popover>
  );
};

export default Bell;
