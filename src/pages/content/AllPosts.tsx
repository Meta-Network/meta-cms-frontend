import { PageContainer } from '@ant-design/pro-layout';
import type { ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { Link, useIntl, useLocation } from 'umi';
import { useCallback, useEffect, useState } from 'react';
import { AuthorisationStatusEnum, PublishStatusEnum, SubmitStatusEnum } from '@/services/constants';
import { Button, Image, Space } from 'antd';
import {
  CheckCircleTwoTone,
  ClockCircleOutlined,
  ClockCircleTwoTone,
  StopOutlined,
  WarningTwoTone,
} from '@ant-design/icons';

export default function AllPosts() {
  const intl = useIntl();
  const location = useLocation();
  const [postsList, setPostsList] = useState<AllPostsType.PostListItem[]>([]);

  const fetchPosts = useCallback(async () => {
    const sample: AllPostsType.PostListItem[] = [
      {
        gallery: 'https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAOHiTxclqi.png',
        title: 'Test',
        submitStatus: SubmitStatusEnum.DONE,
        publishStatus: PublishStatusEnum.ERROR,
        requestDate: '2022-1-19 23:06',
        authorisationStatus: AuthorisationStatusEnum.ERROR,
      },
    ];
    setPostsList(sample);
    //TODO: implement
    switch (location.pathname) {
      case 'content/all-posts/index':
        return undefined;
      case 'content/all-posts/publishing':
        return undefined;
      case 'content/all-posts/published':
        return undefined;
      default:
        return undefined;
    }
  }, [location]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const columns: ProColumns<AllPostsType.PostListItem>[] = [
    {
      title: intl.formatMessage({ id: 'posts.gallery' }),
      dataIndex: 'gallery',
      width: '150px',
      render: (text) => {
        return <Image src={text} fallback="" width={150} height={75} />;
      },
    },
    {
      title: intl.formatMessage({ id: 'posts.title' }),
      dataIndex: 'title',
    },
    {
      title: intl.formatMessage({ id: 'posts.submitStatus' }),
      dataIndex: 'submitStatus',
      render: (text) => {
        let icon = undefined;
        console.log(text);
        switch (text) {
          case SubmitStatusEnum.DONE:
            icon = <CheckCircleTwoTone twoToneColor="#52c41a" />;
            break;
          case SubmitStatusEnum.ERROR:
            icon = <WarningTwoTone />;
            break;
          case SubmitStatusEnum.DOING:
            icon = <ClockCircleTwoTone twoToneColor="#52c41a" />;
            break;
          case SubmitStatusEnum.WAIT:
            icon = <ClockCircleOutlined />;
            break;
          default:
            return text;
        }
        return (
          <>
            <Space>
              {icon}
              {intl.formatMessage({ id: `posts.publishStatus.${text}` })}
            </Space>
          </>
        );
      },
    },
    {
      title: intl.formatMessage({ id: 'posts.publishStatus' }),
      dataIndex: 'publishStatus',
      render: (text) => {
        let icon = undefined;
        console.log(text);
        switch (text) {
          case PublishStatusEnum.DONE:
            icon = <CheckCircleTwoTone twoToneColor="#52c41a" />;
            break;
          case PublishStatusEnum.ERROR:
            icon = <WarningTwoTone twoToneColor="#f81d22" />;
            break;
          case PublishStatusEnum.DOING:
            icon = <ClockCircleTwoTone twoToneColor="#52c41a" />;
            break;
          case PublishStatusEnum.WAIT:
            icon = <ClockCircleOutlined />;
            break;
          default:
            return text;
        }
        return (
          <>
            <Space>
              {icon}
              {intl.formatMessage({ id: `posts.publishStatus.${text}` })}
            </Space>
          </>
        );
      },
    },
    {
      title: intl.formatMessage({ id: 'posts.requestDate' }),
      dataIndex: 'requestDate',
    },
    {
      title: intl.formatMessage({ id: 'posts.authorisationStatus' }),
      dataIndex: 'authorisationStatus',
      render: (text) => {
        let icon = undefined;
        console.log(text);
        switch (text) {
          case AuthorisationStatusEnum.DONE:
            // TODO: display the hash
            return <Link to={text}>text</Link>;
          case AuthorisationStatusEnum.ERROR:
            icon = <WarningTwoTone twoToneColor="#f81d22" />;
            break;
          case AuthorisationStatusEnum.DOING:
            icon = <ClockCircleTwoTone twoToneColor="#52c41a" />;
            break;
          case AuthorisationStatusEnum.NONE:
            icon = <StopOutlined />;
            break;
          default:
            return text;
        }
        return (
          <>
            <Space>
              {icon}
              {intl.formatMessage({ id: `posts.authorisationStatus.${text}` })}
            </Space>
          </>
        );
      },
    },
    {
      title: intl.formatMessage({ id: 'posts.action' }),
      dataIndex: 'action',
      render: (_, record) => {
        if (record.publishStatus === PublishStatusEnum.ERROR) {
          return (
            <Button type="primary">{intl.formatMessage({ id: 'posts.action.button' })}</Button>
          );
        }
        return '';
      },
    },
  ];
  return (
    <PageContainer
      content={
        <div className="text-info">
          {intl.formatMessage({
            id: 'posts.tips',
          })}
          <Link to="#" style={{ marginLeft: '1.2rem' }}>
            {intl.formatMessage({
              id: 'posts.tips.link',
            })}
          </Link>
        </div>
      }
    >
      <ProTable<AllPostsType.PostListItem>
        columns={columns}
        search={false}
        options={false}
        dataSource={postsList}
      />
    </PageContainer>
  );
}
