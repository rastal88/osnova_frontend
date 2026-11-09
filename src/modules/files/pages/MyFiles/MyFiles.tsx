import { DeleteOutlined, InboxOutlined } from '@ant-design/icons';
import { Button, Popconfirm, Progress, Typography, Upload, message } from 'antd';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { utc } from '../../../../api/dates';
import { getErrorMessage } from '../../../../api/errors';
import type { FileRead } from '../../../../api/generated';
import DataTable from '../../../../components/DataTable/DataTable';
import type { DataTableColumn } from '../../../../components/DataTable/DataTable';
import PageContainer from '../../../../components/PageContainer/PageContainer';
import { useFormat } from '../../../../i18n/format';
import { deleteFile, fileHref, getFiles, uploadFile } from '../../api';
import { formatSize } from '../../size';
import './MyFiles.css';

const { Text } = Typography;

interface Uploading {
  name: string;
  percent: number;
}

const MyFiles = () => {
  const { t } = useTranslation('files');
  const format = useFormat();
  const [toast, toastHolder] = message.useMessage();
  const [uploading, setUploading] = useState<Uploading[]>([]);
  // Changing it makes the table fetch the current page again
  const [version, setVersion] = useState(0);

  const upload = async (file: File) => {
    const progress = (percent: number) =>
      setUploading((items) =>
        items.map((item) => (item.name === file.name ? { ...item, percent } : item)),
      );
    setUploading((items) => [...items, { name: file.name, percent: 0 }]);
    try {
      await uploadFile(file, progress);
      toast.success(t('uploaded', { name: file.name }));
      setVersion((value) => value + 1);
    } catch (error) {
      toast.error(`${file.name}: ${getErrorMessage(error)}`);
    } finally {
      setUploading((items) => items.filter((item) => item.name !== file.name));
    }
  };

  const columns = useMemo<DataTableColumn<FileRead>[]>(
    () => [
      {
        key: 'name',
        title: t('columns.name'),
        render: (_, file) => (
          <a href={fileHref(file.url)} target="_blank" rel="noreferrer">
            {file.name}
          </a>
        ),
      },
      {
        key: 'size',
        title: t('columns.size'),
        align: 'right',
        render: (_, file) => formatSize(file.size, (value) => format.number(value)),
      },
      {
        key: 'created_at',
        title: t('columns.uploaded'),
        render: (_, file) => (
          <span title={format.dateTime(utc(file.created_at))}>
            {format.relative(utc(file.created_at))}
          </span>
        ),
      },
      {
        key: 'actions',
        title: '',
        render: (_, file) => (
          <Popconfirm
            title={t('deleteConfirm', { name: file.name })}
            okText={t('delete')}
            okButtonProps={{ danger: true }}
            onConfirm={async () => {
              try {
                await deleteFile(file.id);
                setVersion((value) => value + 1);
              } catch (error) {
                toast.error(getErrorMessage(error));
              }
            }}
          >
            <Button size="small" danger icon={<DeleteOutlined />} aria-label={t('delete')} />
          </Popconfirm>
        ),
      },
    ],
    [t, format, toast],
  );

  return (
    <PageContainer title={t('title')} subtitle={t('subtitle')} noindex>
      {toastHolder}
      <Upload.Dragger
        multiple
        showUploadList={false}
        customRequest={({ file }) => void upload(file as File)}
        className="my-files-upload"
      >
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">{t('drop')}</p>
        <Text type="secondary">{t('dropHint')}</Text>
      </Upload.Dragger>

      {uploading.map((item) => (
        <div key={item.name} className="my-files-progress">
          <Text ellipsis>{item.name}</Text>
          <Progress percent={item.percent} size="small" />
        </div>
      ))}

      <DataTable<FileRead>
        columns={columns}
        rowKey="id"
        fetch={getFiles}
        pageSize={20}
        refreshKey={version}
        searchPlaceholder={t('search')}
      />
    </PageContainer>
  );
};

export default MyFiles;
