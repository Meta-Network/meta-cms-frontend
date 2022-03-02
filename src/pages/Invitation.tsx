import { useIntl, useRequest } from 'umi';
import { List, notification } from 'antd';
import { CopyOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-layout';
import ProFrom, { ProFormText } from '@ant-design/pro-form';
import { queryInvitations } from '@/services/api/meta-ucenter';
import FormattedDescription from '@/components/FormattedDescription';

import styles from './Invitation.less';

export default () => {
  const { data, loading } = useRequest(() => queryInvitations());
  const intl = useIntl();
  const list = data || [];

  return (
    <PageContainer
      breadcrumb={{}}
      title={intl.formatMessage({ id: 'messages.invitation.title' })}
      content={<FormattedDescription id="messages.invitation.description" />}
    >
      <List
        size="small"
        rowKey="id"
        loading={loading}
        dataSource={list.sort((a, b) => a.invitee_user_id - b.invitee_user_id)}
        renderItem={(item) => {
          return (
            <List.Item style={{ justifyContent: 'flex-start' }} className={styles.lessMargin}>
              <ProFrom
                submitter={{
                  render: () => null,
                }}
              >
                <ProFormText
                  fieldProps={{
                    id: `signature_${item.id}`,
                    readOnly: true,
                    suffix: (
                      <a
                        onClick={async () => {
                          await navigator.clipboard.writeText(
                            intl.formatMessage({ id: 'messages.invitation.inviteMessage' }) +
                              item.signature,
                          );
                          notification.success({
                            message: intl.formatMessage({ id: 'messages.info.copySuccess' }),
                          });
                        }}
                      >
                        <CopyOutlined />
                      </a>
                    ),
                  }}
                  initialValue={item.signature}
                  wrapperCol={{ span: 24 }}
                  width="md"
                  name="signature"
                  disabled={item.invitee_user_id !== 0} // invitation code used
                />
              </ProFrom>
              {item.invitee_user_id !== 0 ? (
                <span className={styles.flexedListElement}>
                  {intl.formatMessage({ id: 'component.status.used' })}
                </span>
              ) : null}
            </List.Item>
          );
        }}
      />
    </PageContainer>
  );
};
